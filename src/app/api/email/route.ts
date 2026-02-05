import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { email, name, message } = await request.json();

    console.log('Email API called with:', { email, name, messageLength: message?.length });

    // Input validation
    if (!email || !name || !message) {
      console.error('Missing required fields:', { hasEmail: !!email, hasName: !!name, hasMessage: !!message });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      console.error('Invalid email format:', email);
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check environment variables
    const myEmail = process.env.MY_EMAIL;
    const myPassword = process.env.MY_PASSWORD;
    
    console.log('Environment check:', {
      hasMyEmail: !!myEmail,
      hasMyPassword: !!myPassword,
      emailPrefix: myEmail ? myEmail.substring(0, 3) + '***' : null
    });

    if (!myEmail || !myPassword) {
      console.error('Missing email environment variables');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: myEmail,
        pass: myPassword,
      },
    });

    // Verify SMTP connection configuration
    await transport.verify();

    const mailOptions: Mail.Options = {
      from: process.env.MY_EMAIL,
      to: process.env.MY_EMAIL,
      replyTo: email,
      subject: `Message Received: American Defense Alliance Contact Form Submission (${email})`,
      text: message,
      html: `
        <h3><a href="https://americandefensealliance.org/">American Defense Alliance</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    const info = await transport.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
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