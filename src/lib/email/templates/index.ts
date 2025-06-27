export interface OrderSummaryItem {
  name: string;
  quantity: number;
  price: number; // in dollars
}

export interface OrderSummary {
  orderId: string;
  orderDate: string;
  items: OrderSummaryItem[];
  subtotal: number; // in dollars
  discount: number; // in dollars
  total: number; // in dollars
}

export function generateOrderSummaryHtml(summary: OrderSummary): string {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return `
    <div class="order-summary" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
      <h2>Order Summary</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px;"><strong>Order ID:</strong></td>
          <td style="padding: 8px; text-align: right;">${summary.orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px;"><strong>Order Date:</strong></td>
          <td style="padding: 8px; text-align: right;">${summary.orderDate}</td>
        </tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Item</th>
            <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${summary.items
            .map(
              (item) => `
            <tr>
              <td style="padding: 8px;">${item.quantity}x ${item.name}</td>
              <td style="padding: 8px; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 8px; text-align: right; border-top: 1px solid #ccc;" colspan="2"></td>
          </tr>
          <tr>
            <td style="padding: 8px; text-align: right;"><strong>Subtotal</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>${formatCurrency(summary.subtotal)}</strong></td>
          </tr>
          ${
            summary.discount > 0
              ? `
            <tr>
              <td style="padding: 8px; text-align: right;"><strong>Discount</strong></td>
              <td style="padding: 8px; text-align: right;"><strong>-${formatCurrency(summary.discount)}</strong></td>
            </tr>
          `
              : ''
          }
          <tr>
            <td style="padding: 8px; text-align: right;"><strong>Total Paid</strong></td>
            <td style="padding: 8px; text-align: right;"><strong>${formatCurrency(summary.total)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

import { VipNetworkingReception } from '@/types/events';
// Email templates for different registration types
import { getEnv } from '../../env';
import { getCdnPath } from '@/utils/image';

const env = getEnv();

// Base template that all emails will use
export function baseEmailTemplate(content: string, eventImage: string): string {
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
          text-align: center;
        }
        .header img {
          max-width: 100%;
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
          <img src="${getCdnPath(eventImage)}" alt="American Defense Alliance Event Banner" />
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>American Defense Alliance</p>
          <p>© ${new Date().getFullYear()} American Defense Alliance. All rights reserved.</p>
          <p>
            For questions, please contact us at 
            <a href="mailto:${env.MY_EMAIL || 'chayil@americandefensealliance.org'}">${env.MY_EMAIL || 'chayil@americandefensealliance.org'}</a>
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
  hotelInfo,
  eventImage,
  orderSummaryHtml,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  orderId: string;
  hotelInfo: string;
  eventImage: string;
  orderSummaryHtml?: string;
}): string {
  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>
    
    <div class="highlight">
      <p><strong>Event Details</strong></p>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
    </div>

    
    ${hotelInfo ? `
    <div class="highlight">
      <p><strong>Hotel Accommodations</strong></p>
      <p>Room Block Information is available <a href="${hotelInfo}">here.</a></p>
    </div>
    ` : ''}
    
    <div class="highlight">
      <p><strong>Please Note</strong></p>
      <ul>
        <li><strong>All registrations are final</strong>. We are unable to offer refunds for this event.</li>
        <li>Additional Event Information, including the Agenda, Speaker Lineup, and Venue Details can be found on our website: <a href="https://www.americandefensealliance.org/">www.americandefensealliance.org/</a></li>
      </ul>
    </div>
    
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    
    ${orderSummaryHtml || ''}
    
    <p>If you have any questions or need further assistance, feel free to contact us at <a href="mailto:chayil@americandefensealliance.org">chayil@americandefensealliance.org</a> or call (771) 474-1077.</p>
    
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]} this ${getMonthFromDate(eventDate)}` : 'to this event'}!</p>
    
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>
  `;
  
  return baseEmailTemplate(content, eventImage);
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
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  vipNetworkingReception,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  orderId: string;
  vipPerks: string[];
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo?: string;
  vipNetworkingReception?: VipNetworkingReception;
}): string {
  const content = `
    <p>Dear ${firstName},</p>
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>
    
    <div class="highlight">
      <p><strong>Event Details</strong></p>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
    </div>


    

    ${hotelInfo ? `
    <div class="highlight">
      <p><strong>Hotel Accommodations</strong></p>
      <p>Room Block Information is available <a href="${hotelInfo}">here.</a></p>
    </div>
    ` : ''}

    ${vipNetworkingReception ? `
    <div class="highlight">
      <p><strong>VIP Networking Reception</strong></p>
      <p>
     ${vipNetworkingReception.description}
    </div>
    ` : ''}
    
    <div class="highlight">
      <p><strong>Please Note</strong></p>
      <ul>
        <li><strong>All registrations are final</strong>. We are unable to offer refunds for this event.</li>
        <li>Additional Event Information, including the Agenda, Speaker Lineup, and Venue Details can be found on our website: <a href="https://www.americandefensealliance.org/">www.americandefensealliance.org/</a></li>
      </ul>
    </div>
    
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    
    ${orderSummaryHtml || ''}
    
    <p>If you have any questions or need further assistance, feel free to contact us at <a href="mailto:chayil@americandefensealliance.org">chayil@americandefensealliance.org</a> or call (771) 474-1077.</p>
    
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]} this ${getMonthFromDate(eventDate)}` : 'to this event'}!</p>
    
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>
  `;
  
  return baseEmailTemplate(content, eventImage);
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
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  vipNetworkingReception,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  orderId: string;
  exhibitorType: string;
  exhibitorInstructions: string;
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo?: string;
  vipNetworkingReception?: VipNetworkingReception;
}): string {
  const content = `
    <p>Dear ${firstName},</p>
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>

    <p>If you wish to purchase additional attendee passes, you can do so by clicking the button below.</p>
    <p>Note for mason for now: We need to develop a system such that we validate users so that they can purchase additional attendee passes.</p>
    <p> Need to figure out a good way to do this...</p>

    <div class="highlight">
      <p><strong>Exhibitor Instructions</strong></p>
      <p>${exhibitorInstructions}</p>
    </div>
    
    <div class="highlight">
      <p><strong>Event Details</strong></p>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
    </div>



    

    ${hotelInfo ? `
    <div class="highlight">
      <p><strong>Hotel Accommodations</strong></p>
      <p>Room Block Information is available <a href="${hotelInfo}">here.</a></p>
    </div>
    ` : ''}

    ${vipNetworkingReception ? `
    <div class="highlight">
      <p><strong>VIP Networking Reception</strong></p>
      <p>
     ${vipNetworkingReception.description}
    </div>
    ` : ''}
    
    <div class="highlight">
      <p><strong>Please Note</strong></p>
      <ul>
        <li><strong>All registrations are final</strong>. We are unable to offer refunds for this event.</li>
        <li>Additional Event Information, including the Agenda, Speaker Lineup, and Venue Details can be found on our website: <a href="https://www.americandefensealliance.org/">www.americandefensealliance.org/</a></li>
      </ul>
    </div>
    
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}

    ${orderSummaryHtml || ''}
    
    <p>If you have any questions or need further assistance, feel free to contact us at <a href="mailto:chayil@americandefensealliance.org">chayil@americandefensealliance.org</a> or call (771) 474-1077.</p>
    
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]} this ${getMonthFromDate(eventDate)}` : 'to this event'}!</p>
    
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>
  `;
  
  return baseEmailTemplate(content, eventImage);
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
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  vipNetworkingReception,
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
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo?: string;
  vipNetworkingReception?: VipNetworkingReception;
}): string {
  const content = `
    <h1>Sponsorship Confirmation</h1>
    <p>Dear ${firstName},</p>
    <p>Thank you for your ${sponsorshipLevel} sponsorship of <strong>${eventName}</strong>. We greatly appreciate your support!</p>
    
    <div class="highlight">
      <p><strong>Event Details:</strong></p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${eventLocation}</p>
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
    
    ${orderSummaryHtml || ''}
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Sincerely,<br>The American Defense Alliance Team</p>
  `;
  
  return baseEmailTemplate(content, eventImage);
}
function getMonthFromDate(eventDate: string) {
  const date = new Date(eventDate);
  const month = date.toLocaleString('default', { month: 'long' });
  return month;
}

