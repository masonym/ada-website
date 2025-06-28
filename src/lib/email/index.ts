import { Resend } from 'resend';
import { getEnv } from '../env';

const env = getEnv();
const resend = new Resend(env.RESEND_API_KEY);

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string; // Optional: defaults to a value from .env or a standard address
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    path?: string;
    contentType?: string;
  }>; // Optional: attachments for the email
}

export async function sendEmail({
  to,
  subject,
  html,
  from = env.MY_EMAIL || 'onboarding@resend.dev', // Default from address
  attachments = [], // Default to an empty array if not provided
}: EmailParams) {
  // Ensure RESEND_API_KEY is loaded
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set. Email sending is disabled.');
    // Potentially return a specific error or throw, depending on desired handling
    return { success: false, error: 'RESEND_API_KEY not configured.' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      attachments,
    });

    if (error) {
      console.error('Error sending email via Resend:', JSON.stringify(error, null, 2));
      return { success: false, error: error.message || 'Failed to send email' };
    }

    console.log('Email sent successfully via Resend:', data);
    return { success: true, data };
  } catch (exception) {
    console.error('Exception sending email:', exception);
    const errorMessage = exception instanceof Error ? exception.message : 'Unknown exception during email sending';
    return { success: false, error: errorMessage };
  }
}

