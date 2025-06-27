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

// --- Specific Email Templates ---

interface RegistrationConfirmationEmailProps {
  userEmail: string;
  firstName: string;
  eventName: string;
  orderId?: string; // Optional, for free or if generated before payment intent
  eventUrl?: string; // Optional link to the event page
}

export async function sendFreeRegistrationConfirmationEmail({
  userEmail,
  firstName,
  eventName,
  orderId,
  eventUrl,
}: RegistrationConfirmationEmailProps) {
  const subject = `Confirmation: Your Registration for ${eventName}`;
  const html = `
    <p>Dear ${firstName},</p>
    <p>Thank you for registering for <strong>${eventName}</strong>!</p>
    ${orderId ? `<p>Your Order ID is: ${orderId}</p>` : ''}
    <p>We're excited to have you join us.</p>
    ${eventUrl ? `<p>For more details about the event, please visit: <a href="${eventUrl}">${eventUrl}</a></p>` : ''}
    <p>If you have any questions, please don't hesitate to contact us at ${env.MY_EMAIL || 'our support address'}.</p>
    <p>Sincerely,</p>
    <p>The American Defense Alliance Team</p>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

interface PaymentPendingEmailProps {
  userEmail: string;
  firstName: string;
  eventName: string;
  orderId: string; // Stripe Payment Intent ID
  amount: number;
  eventUrl?: string;
}

export async function sendPaymentPendingConfirmationEmail({
  userEmail,
  firstName,
  eventName,
  orderId,
  amount,
  eventUrl,
}: PaymentPendingEmailProps) {
  const subject = `Action Required: Complete Your Payment for ${eventName}`;
  const html = `
    <p>Dear ${firstName},</p>
    <p>Thank you for initiating your registration for <strong>${eventName}</strong>!</p>
    <p>Your registration is almost complete. We've received your details, and your Order ID is: <strong>${orderId}</strong>.</p>
    <p>The total amount for your registration is <strong>$${amount.toFixed(2)}</strong>.</p>
    <p>Please complete the payment process on the registration page to secure your spot. If you've already done so, you'll receive another confirmation once the payment is verified.</p>
    ${eventUrl ? `<p>If you closed the page, you can return to the event here: <a href="${eventUrl}">${eventUrl}</a> (Note: You might need to restart the checkout process if the session expired)</p>` : ''}
    <p>If you have any questions or issues with payment, please contact us at ${env.MY_EMAIL || 'our support address'}.</p>
    <p>Sincerely,</p>
    <p>The American Defense Alliance Team</p>
  `;

  return sendEmail({ to: userEmail, subject, html });
}

// We can add a sendPaymentSuccessEmail function later, ideally triggered by a Stripe webhook.
