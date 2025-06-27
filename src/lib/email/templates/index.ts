// Email templates for different registration types
import { getEnv } from '../../env';

const env = getEnv();

// Base template that all emails will use
export function baseEmailTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>American Defense Alliance</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #002868;
          padding: 20px;
          text-align: center;
        }
        .header img {
          max-width: 200px;
        }
        .content {
          padding: 20px;
          background-color: #ffffff;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          background-color: #bf0a30;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        h1, h2, h3 {
          color: #002868;
        }
        ul {
          padding-left: 20px;
        }
        .highlight {
          background-color: #ffffcc;
          padding: 10px;
          border-left: 4px solid #bf0a30;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://americandefensealliance.org/logo.png" alt="American Defense Alliance Logo" />
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>American Defense Alliance</p>
          <p>© ${new Date().getFullYear()} American Defense Alliance. All rights reserved.</p>
          <p>
            For questions, please contact us at 
            <a href="mailto:${env.MY_EMAIL || 'info@americandefensealliance.org'}">${env.MY_EMAIL || 'info@americandefensealliance.org'}</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template for standard attendee passes
export function attendeePassTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  eventUrl,
  orderId,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  orderId: string;
}): string {
  const content = `
    <h1>Thank You for Registering!</h1>
    <p>Dear ${firstName},</p>
    <p>Thank you for registering for <strong>${eventName}</strong>. We're excited to have you join us!</p>
    
    <div class="highlight">
      <p><strong>Event Details:</strong></p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
    </div>
    
    <p>Please save this email for your records. You'll receive additional information about the event as the date approaches.</p>
    
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Sincerely,<br>The American Defense Alliance Team</p>
  `;
  
  return baseEmailTemplate(content);
}

// Template for VIP attendee passes
export function vipAttendeePassTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  eventUrl,
  orderId,
  vipPerks,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  orderId: string;
  vipPerks: string[];
}): string {
  const content = `
    <h1>VIP Registration Confirmed!</h1>
    <p>Dear ${firstName},</p>
    <p>Thank you for your VIP registration for <strong>${eventName}</strong>. We're delighted to have you as a VIP attendee!</p>
    
    <div class="highlight">
      <p><strong>Event Details:</strong></p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
    </div>
    
    <h2>Your VIP Benefits Include:</h2>
    <ul>
      ${vipPerks.map(perk => `<li>${perk}</li>`).join('')}
    </ul>
    
    <p>Please save this email for your records. You'll receive additional information about the event, including VIP check-in instructions, as the date approaches.</p>
    
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Sincerely,<br>The American Defense Alliance Team</p>
  `;
  
  return baseEmailTemplate(content);
}

// Template for exhibitor registrations
export function exhibitorTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  eventUrl,
  orderId,
  exhibitorType,
  exhibitorInstructions,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  orderId: string;
  exhibitorType: string;
  exhibitorInstructions: string;
}): string {
  const content = `
    <h1>Exhibitor Registration Confirmed!</h1>
    <p>Dear ${firstName},</p>
    <p>Thank you for registering as an exhibitor for <strong>${eventName}</strong>. We're excited to have you showcase your products/services!</p>
    
    <div class="highlight">
      <p><strong>Event Details:</strong></p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Exhibitor Type:</strong> ${exhibitorType}</p>
    </div>
    
    <h2>Important Information for Exhibitors:</h2>
    <div>
      ${exhibitorInstructions}
    </div>
    
    <p>Please save this email for your records. You'll receive additional information about setup times, booth location, and other logistics as the event approaches.</p>
    
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Sincerely,<br>The American Defense Alliance Team</p>
  `;
  
  return baseEmailTemplate(content);
}

// Template for sponsor registrations
export function sponsorTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  eventUrl,
  orderId,
  sponsorshipLevel,
  sponsorshipPerks,
  attendeePasses,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  orderId: string;
  sponsorshipLevel: string;
  sponsorshipPerks: string[];
  attendeePasses: number;
}): string {
  const content = `
    <h1>Sponsorship Confirmation</h1>
    <p>Dear ${firstName},</p>
    <p>Thank you for your ${sponsorshipLevel} sponsorship of <strong>${eventName}</strong>. We greatly appreciate your support!</p>
    
    <div class="highlight">
      <p><strong>Event Details:</strong></p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Sponsorship Level:</strong> ${sponsorshipLevel}</p>
      <p><strong>Included Attendee Passes:</strong> ${attendeePasses}</p>
    </div>
    
    <h2>Your Sponsorship Benefits Include:</h2>
    <ul>
      ${sponsorshipPerks.map(perk => `<li>${perk}</li>`).join('')}
    </ul>
    
    <p>Our sponsorship coordinator will be in touch shortly to discuss logo placement, promotional opportunities, and other sponsorship details.</p>
    
    <p>Please save this email for your records. You'll receive additional information about the event as the date approaches.</p>
    
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Sincerely,<br>The American Defense Alliance Team</p>
  `;
  
  return baseEmailTemplate(content);
}
