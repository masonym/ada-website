import { type NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
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

    // Sent through Resend like every other mail the site sends. This used to be
    // nodemailer over Gmail SMTP, which needs raw TCP sockets that Cloudflare
    // Workers only partly support.
    const inbox = process.env.MY_EMAIL;
    if (!inbox) {
      console.error('[contact] MY_EMAIL is not configured');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const result = await sendEmail({
      to: inbox,
      replyTo: email,
      // The address reaches the subject line, so strip anything that could
      // split the header. A submission has no business containing newlines.
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
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Email sent successfully', id: result.data?.id });
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
