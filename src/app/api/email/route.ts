import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import { escapeHtml, escapeHtmlWithBreaks } from '@/lib/html';
import { createRateLimiter, getClientIdentifier, tooManyRequests } from '@/lib/rate-limit';

/**
 * Contact form handler.
 *
 * Five submissions per ten minutes per address. Nobody with something to say
 * sends a sixth; a script does.
 */
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

/** Enough for a real enquiry, short of a payload someone is using us to store. */
const MAX_MESSAGE_LENGTH = 5000;
const MAX_NAME_LENGTH = 200;

/**
 * The SMTP transport is built once per isolate rather than per request.
 *
 * The route also used to call transport.verify() on every submission, which is a
 * full extra SMTP round-trip to Gmail before the one that sends the mail. A
 * connection problem shows up in sendMail anyway, where it is handled.
 */
let cachedTransport: nodemailer.Transporter | null = null;

function getTransport(user: string, pass: string) {
  if (!cachedTransport) {
    cachedTransport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  }
  return cachedTransport;
}

export async function POST(request: NextRequest) {
  try {
    const throttle = limiter.consume(getClientIdentifier(request));
    if (!throttle.allowed) {
      return tooManyRequests(
        throttle.retryAfterSeconds,
        'Too many messages sent from this address. Please try again shortly.'
      );
    }

    const { email, name, message } = await request.json();

    // Deliberately no PII in the logs: this route used to print the submitted
    // address and name on every call, which put them in the hosting provider's
    // log retention for as long as it keeps them.
    if (!email || !name || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (
      typeof email !== 'string' ||
      typeof name !== 'string' ||
      typeof message !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (name.length > MAX_NAME_LENGTH || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Submission is too long' }, { status: 400 });
    }

    const myEmail = process.env.MY_EMAIL;
    const myPassword = process.env.MY_PASSWORD;

    if (!myEmail || !myPassword) {
      console.error('[contact] mail credentials are not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const transport = getTransport(myEmail, myPassword);

    const mailOptions: Mail.Options = {
      from: myEmail,
      to: myEmail,
      replyTo: email,
      // The address reaches the subject line, so strip anything that could
      // split the header. Nodemailer encodes this, but a submission has no
      // business containing newlines in the first place.
      subject: `Message Received: American Defense Alliance Contact Form Submission (${email.replace(
        /[\r\n]/g,
        ' '
      )})`,
      text: message,
      // Every interpolated field is escaped. Submitted markup is shown as the
      // characters the sender typed rather than rendered as part of our mail.
      html: `
        <h3><a href="https://americandefensealliance.org/">American Defense Alliance</a></h3>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtmlWithBreaks(message)}</p>
      `,
    };

    const info = await transport.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully', id: info.messageId });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
