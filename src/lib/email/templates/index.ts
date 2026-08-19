import { MatchmakingSession, VipNetworkingReception } from '@/types/events';
import {
  findSponsorship,
  generateSponsorBenefitsHtml,
  getSponsorAdditionalPass,
  sponsorshipIncludesExhibitSpace,
} from '../sponsor-benefits';
import {
  eventHasExhibitSpace,
  findExhibitorType,
  generateExhibitorBenefitsHtml,
  getExhibitorAdditionalPass,
} from '../exhibitor-benefits';
import { additionalPassLabel } from '../perks';
import { getClientEnv } from '../../env';
import { getCdnPath } from '@/utils/image';
import { LODGING_INFO } from '@/constants/lodging';

function getMonthFromDate(dateString: string): string {
  if (!dateString) return '';
  // Handles ranges like "October 28-29, 2024" or single dates "October 28, 2024"
  const month = dateString.split(' ')[0];
  // Basic check if it's a month name
  if (['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].includes(month)) {
    return month;
  }
  // Fallback for date formats like YYYY-MM-DD
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('default', { month: 'long' });
  } catch (e) {
    return '';
  }
}

/**
 * "in Norfolk" from a full street address - the city is the second comma-
 * separated field. Trimmed because the addresses carry a space after the
 * comma, which otherwise rendered as "welcoming you in  Norfolk".
 */
function welcomeDestination(eventLocation: string): string {
  const city = eventLocation?.split(',')[1]?.trim();
  return city ? `in ${city}` : 'to this event';
}

/**
 * The venue-and-lodging link. Only events with a hotel room block in
 * `@/constants/lodging` get the "Hotel Accommodations" wording - the 2026
 * Defense Industry Update is a one-day event with no block, and promising one
 * in its confirmation emails sent registrants looking for something that does
 * not exist. The page is still worth linking either way, for directions and
 * parking.
 */
function venueAndLodgingHtml(hotelInfo?: string, eventId?: number | string): string {
  if (!hotelInfo) return '';

  const lodging =
    eventId === undefined
      ? undefined
      : LODGING_INFO.find((entry) => entry.eventId.toString() === eventId.toString());

  return lodging?.hotels?.length
    ? `<p><strong>Hotel Accommodations:</strong> Room Block information is available <a href="${hotelInfo}">here.</a></p>`
    : `<p><strong>Venue Information:</strong> Venue details, directions and parking are available <a href="${hotelInfo}">here.</a></p>`;
}

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

// Interface for attendee details in emails
export interface AttendeeDetails {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  website?: string;
  businessSize?: string;
  sbaIdentification?: string;
  industry?: string;
}

/**
 * Generates HTML for attendee details section in emails
 */
export function generateAttendeeDetailsHtml(attendees: AttendeeDetails[]): string {
  if (!attendees || attendees.length === 0) return '';

  const attendeeRows = attendees.map((attendee, index) => {
    return `
      <div class="attendee-details${index > 0 ? ' attendee-separator' : ''}">
        <h3>Attendee ${attendees.length > 1 ? (index + 1) : ''} Information</h3>
        <table class="attendee-info">
          <tr>
            <td><strong>Name:</strong></td>
            <td>${attendee.firstName} ${attendee.lastName}</td>
          </tr>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${attendee.email}</td>
          </tr>
          ${attendee.jobTitle ? `
          <tr>
            <td><strong>Title:</strong></td>
            <td>${attendee.jobTitle}</td>
          </tr>` : ''}
          ${attendee.company ? `
          <tr>
            <td><strong>Organization:</strong></td>
            <td>${attendee.company}</td>
          </tr>` : ''}
          ${attendee.phone ? `
          <tr>
            <td><strong>Phone:</strong></td>
            <td>${attendee.phone}</td>
          </tr>` : ''}
          ${attendee.website ? `
          <tr>
            <td><strong>Website:</strong></td>
            <td>${attendee.website}</td>
          </tr>` : ''}
        </table>
      </div>
    `;
  }).join('');

  return `
    <div class="attendee-details-container">
      <h2>Attendee Details</h2>
      ${attendeeRows}
    </div>
  `;
}

export function generateOrderSummaryHtml(summary: OrderSummary): string {
  const formatCurrency = (amount: number) => `${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;

  return `
    <div class="order-summary">
      <h2>Order Summary</h2>
      <table class="order-details">
        <tr>
          <td><strong>Order ID:</strong></td>
          <td class="text-right">${summary.orderId}</td>
        </tr>
        <tr>
          <td><strong>Order Date:</strong></td>
          <td class="text-right">${summary.orderDate}</td>
        </tr>
      </table>
      <table class="order-items">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          ${summary.items
      .map(
        (item) => `
            <tr>
              <td>${item.quantity}x ${item.name}</td>
              <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `
      )
      .join('')}
        </tbody>
        <tfoot>
          <tr>
            <td class="text-right" colspan="2"></td>
          </tr>
          <tr>
            <td class="text-right"><strong>Subtotal</strong></td>
            <td class="text-right"><strong>${formatCurrency(summary.subtotal)}</strong></td>
          </tr>
          ${summary.discount > 0
      ? `
            <tr>
              <td class="text-right"><strong>Discount</strong></td>
              <td class="text-right"><strong>-${formatCurrency(summary.discount)}</strong></td>
            </tr>
          `
      : ''
    }
          <tr>
            <td class="text-right"><strong>Total Paid</strong></td>
            <td class="text-right"><strong>${formatCurrency(summary.total)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

/**
 * Generates HTML for VIP networking reception section in emails
 */
export function generateVipNetworkingReceptionHtml(
  vipNetworkingReception: VipNetworkingReception | undefined,
  recipientType: 'exhibitor' | 'sponsor' | 'attendee' = 'attendee',
  vipNetworkingReceptionUrl?: string
): string {
  if (!vipNetworkingReception) return '';

  let introText = '';

  // if (recipientType === 'exhibitor') {
  //   introText = 'As an exhibitor, you and your guests are invited to our exclusive VIP Networking Reception.';
  // } else if (recipientType === 'sponsor') {
  //   introText = 'As a sponsor, you and your guests are invited to our exclusive VIP Networking Reception.';
  // }

  // Who is invited differs per event - the 2026 Defense Industry Update has no
  // exhibitors at all - so the invitee sentence comes from the event's own
  // reception `description`, the same string the website's reception page
  // shows, rather than a fixed list that named exhibitors regardless.
  //
  // The reception venue is often still TBD when an event opens for
  // registration (2026 AFSFPC and the 2026 Defense Industry Update both are).
  // Every other line is only printed once its data exists - this block used to
  // render "Location: undefined, undefined" for those events - but the location
  // line always shows, falling back to TBA so recipients know a venue is coming
  // rather than wondering whether we left it out.
  const location =
    [vipNetworkingReception.locationName, vipNetworkingReception.locationAddress]
      .filter(Boolean)
      .join(', ') || 'TBA';

  const time =
    vipNetworkingReception.timeStart && vipNetworkingReception.timeEnd
      ? ` from ${vipNetworkingReception.timeStart} to ${vipNetworkingReception.timeEnd}`
      : '';

  return `
    <div class="highlight">
      <h2>VIP Networking Reception</h2>
      ${vipNetworkingReception.description ? `<p>${vipNetworkingReception.description}</p>` : ''}
      <p><strong>Location:</strong> ${location}</p>
      ${vipNetworkingReception.date ? `<p><strong>Date:</strong> ${vipNetworkingReception.date}${time}</p>` : ''}
      ${vipNetworkingReceptionUrl ? `<p><a href="${vipNetworkingReceptionUrl}">View VIP Networking Reception Details</a></p>` : ''}
      ${vipNetworkingReception.additionalInfo ? `<p>${vipNetworkingReception.additionalInfo}</p>` : ''}
    </div>
  `;
}

/**
 * Generates HTML for exhibitor instructions section in emails
 */
export function generateExhibitorInstructionsHtml(
  exhibitorInstructions: string,
  isFullSection: boolean = true
): string {
  if (!exhibitorInstructions) return '';

  if (isFullSection) {
    return `
      <div class="highlight">
        <h2>Exhibitor Instructions</h2>
        <p>Exhibitor setup and other important instructions are available on our website.</p>
        <a href="${getCdnPath(exhibitorInstructions)}">View Exhibitor Instructions</a>
      </div>
    `;
  } else {
    return `<p><strong>Exhibitor Instructions:</strong> Exhibitor setup and other important instructions are available on our website. <a href="${getCdnPath(exhibitorInstructions)}">View Exhibitor Instructions</a></p>`;
  }
}

// Base template that all emails will use
export function baseEmailTemplate(content: string, eventImage: string): string {
  // This module is rendered both server-side (real confirmation emails) and
  // client-side (/dev/email-preview), and the only env value it needs is the
  // contact address in the footer. It used to call getServerEnv() on the server
  // branch, which pulled every server secret into a module a client component
  // imports. MY_EMAIL is unprefixed, so Next leaves it undefined in the browser
  // and the preview falls through to the public address.
  const env = {
    MY_EMAIL:
      process.env.MY_EMAIL ||
      getClientEnv().MY_EMAIL,
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>American Defense Alliance</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
          line-height: 1.6;
          color: #1B212B; /* navy-800 */
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 800px;
          margin: 20px auto;
          padding: 0;
          background-color: #ffffff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
        }
        .header {
          background-color: #152238; /* navy-500 */
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header img {
          max-width: 100%;
          height: auto;
        }
        .content {
          padding: 20px 30px 30px 30px;
        }
        .footer {
          background-color: #EEEEEE; /* gray-10 */
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #585858; /* gray-50 */
          border-radius: 0 0 8px 8px;
          border-top: 1px solid #dee2e6;
        }
        .footer a {
          color: #152238; /* navy-500 */
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        .button {
          display: inline-block;
          background-color: #3FB4E6; /* lightBlue-400 */
          color: #ffffff !important;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          margin: 0px 0;
          font-weight: bold;
          text-align: center;
        }
        a.button {
          color: #ffffff;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #152238; /* navy-500 */
          font-weight: 600;
          margin-top: 0px;
        }
        ul {
          padding-left: 20px;
        }
        .highlight {
          background-color: #f0faff;
          padding: 15px;
          border-left: 5px solid #3FB4E6; /* lightBlue-400 */
          margin: 20px 0;
          border-radius: 5px;
        }
        .text-right {
          text-align: right;
        }
        .order-summary {
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 1px solid #EEEEEE; /* gray-10 */
        }
        .order-summary h2 {
          margin-top: 0;
        }
        .order-details, .order-items {
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 10px;
        }
        .order-details td, .order-items td, .order-items th {
          padding: 8px;
        }
        .order-items thead th {
          text-align: left; 
          border-bottom: 1px solid #dee2e6;
        }
        .order-items .text-right {
          text-align: right;
        }
        .order-items tfoot td {
          padding-top: 10px;
          border-top: 1px solid #EEEEEE; /* gray-10 */
        }
        p {
          margin: 5px 0 0 0;
        }
        .attendee-details-container {
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 1px solid #EEEEEE; /* gray-10 */
        }
        .attendee-details-container h2 {
          margin-top: 0;
          margin-bottom: 15px;
        }
        .attendee-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 15px;
        }
        .attendee-separator {
          margin-top: 20px;
          border-top: 1px dashed #EEEEEE;
          padding-top: 20px;
        }
        .attendee-info {
          width: 100%;
          border-collapse: collapse;
        }
        .attendee-info td {
          padding: 5px;
          vertical-align: top;
        }
        .attendee-info td:first-child {
          width: 120px;
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
  venueName,
  eventUrl,
  orderId,
  hotelInfo,
  eventId,
  eventImage,
  orderSummaryHtml,
  attendeeDetailsHtml,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  venueName: string;
  eventUrl?: string;
  orderId: string;
  hotelInfo: string;
  /** Used to look up whether the event has a hotel room block. */
  eventId?: number | string;
  eventImage: string;
  orderSummaryHtml?: string;
  attendeeDetailsHtml?: string;
}): string {
  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. If you are unable to attend and would like to send a replacement attendee, please let us know at your earliest convenience. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${welcomeDestination(eventLocation)}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>

    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${venueAndLodgingHtml(hotelInfo, eventId)}
    </div>


    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    ${orderSummaryHtml || ''}
    ${attendeeDetailsHtml || ''}
  `;

  return baseEmailTemplate(content, eventImage);
}

// Template for VIP attendee passes
export function vipAttendeePassTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  venueName,
  eventUrl,
  orderId,
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  eventId,
  vipNetworkingReception,
  attendeeDetailsHtml,
  vipNetworkingReceptionUrl,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  venueName: string;
  eventUrl?: string;
  orderId: string;
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo: string;
  /** Used to look up whether the event has a hotel room block. */
  eventId?: number | string;
  vipNetworkingReception?: VipNetworkingReception;
  attendeeDetailsHtml?: string;
  vipNetworkingReceptionUrl?: string;
}): string {
  const content = `
    <p><strong>Dear ${firstName},</strong></p>

    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. If you are unable to attend and would like to send a replacement attendee, please let us know at your earliest convenience. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${welcomeDestination(eventLocation)}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>

    
    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${venueAndLodgingHtml(hotelInfo, eventId)}
    </div>

    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}

    ${generateVipNetworkingReceptionHtml(vipNetworkingReception, 'attendee', vipNetworkingReceptionUrl)}

    ${orderSummaryHtml || ''}
    ${attendeeDetailsHtml || ''}
  `;

  return baseEmailTemplate(content, eventImage);
}

// Template for exhibitor registrations
export function exhibitorTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  venueName,
  eventUrl,
  orderId,
  exhibitorType,
  exhibitorId,
  eventId,
  exhibitorInstructions,
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  vipNetworkingReception,
  attendeeDetailsHtml,
  vipNetworkingReceptionUrl,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  venueName: string;
  eventUrl?: string;
  orderId: string;
  exhibitorType: string;
  /** Exhibit space id in `@/constants/exhibitors`, used to look up its perks. */
  exhibitorId?: string;
  eventId?: number | string;
  exhibitorInstructions: string;
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo?: string;
  vipNetworkingReception?: VipNetworkingReception;
  attendeeDetailsHtml?: string;
  vipNetworkingReceptionUrl?: string;
}): string {
  const exhibitor = findExhibitorType(eventId, exhibitorId, exhibitorType);
  const additionalPass = getExhibitorAdditionalPass(eventId);

  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>

    <p>If you wish to purchase additional attendee passes, you can do so using the ${additionalPassLabel(additionalPass, 'Additional Exhibitor Attendee Pass')} registration option on our website.</p>
    <p style="color: red;"><strong>Please respond to this email with a high-quality image of your company logo.</strong></p>
    
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. If you are unable to attend and would like to send a replacement attendee, please let us know at your earliest convenience. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${welcomeDestination(eventLocation)}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>

    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${venueAndLodgingHtml(hotelInfo, eventId)}
    </div>

    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}

    ${generateVipNetworkingReceptionHtml(vipNetworkingReception, 'exhibitor', vipNetworkingReceptionUrl)}

    ${generateExhibitorBenefitsHtml({ exhibitor, exhibitorTitle: exhibitorType })}

    ${generateExhibitorInstructionsHtml(exhibitorInstructions)}

    ${orderSummaryHtml || ''}
    ${attendeeDetailsHtml || ''}
  `;

  return baseEmailTemplate(content, eventImage);
}

// Template for sponsor registrations
export function sponsorTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  venueName,
  eventUrl,
  orderId,
  sponsorshipLevel,
  sponsorshipId,
  eventId,
  attendeePasses,
  exhibitorInstructions,
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  vipNetworkingReception,
  matchmakingSessions,
  attendeeDetailsHtml,
  vipNetworkingReceptionUrl,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  venueName: string;
  eventUrl?: string;
  orderId: string;
  sponsorshipLevel: string;
  /** Sponsorship id in `@/constants/sponsorships`, used to look up its perks. */
  sponsorshipId?: string;
  eventId?: number | string;
  attendeePasses: number;
  exhibitorInstructions: string;
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo?: string;
  vipNetworkingReception?: VipNetworkingReception;
  matchmakingSessions: MatchmakingSession | undefined;
  attendeeDetailsHtml?: string;
  vipNetworkingReceptionUrl?: string;
}): string {
  const sponsorship = findSponsorship(eventId, sponsorshipId, sponsorshipLevel);
  const hasExhibitSpace = sponsorshipIncludesExhibitSpace(sponsorship, sponsorshipLevel);
  const additionalPass = getSponsorAdditionalPass(eventId);

  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>

    <p>You may register additional attendees not included in the (${attendeePasses}) complimentary VIP Attendee Passes using the ${additionalPassLabel(additionalPass, 'Additional Sponsor Attendee Pass')} option on our website.</p>
    <p style="color: red;"><strong>Please respond to this email with a high-quality image of your company logo.</strong></p>
    
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. If you are unable to attend and would like to send a replacement attendee, please let us know at your earliest convenience. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${welcomeDestination(eventLocation)}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>

    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${venueAndLodgingHtml(hotelInfo, eventId)}
    </div>

    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}

    ${generateSponsorBenefitsHtml({ sponsorship, sponsorshipLevel, matchmakingSessions })}
    
    ${generateVipNetworkingReceptionHtml(vipNetworkingReception, 'sponsor', vipNetworkingReceptionUrl)}
    ${hasExhibitSpace ? generateExhibitorInstructionsHtml(exhibitorInstructions, true) : ''}

    ${orderSummaryHtml || ''}
    ${attendeeDetailsHtml || ''}
  `;

  return baseEmailTemplate(content, eventImage);
}

// Template for government/military attendee passes
export function govMilPassTemplate({
  firstName,
  eventName,
  eventDate,
  eventLocation,
  venueName,
  eventUrl,
  orderId,
  hotelInfo,
  eventId,
  eventImage,
  orderSummaryHtml,
  attendeeDetailsHtml,
  matchmakingSessions,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  venueName: string;
  eventUrl?: string;
  orderId: string;
  hotelInfo: string;
  /**
   * Used to look up whether the event has a hotel room block, and whether it
   * offers exhibit space.
   */
  eventId?: number | string;
  eventImage: string;
  orderSummaryHtml?: string;
  attendeeDetailsHtml?: string;
  matchmakingSessions?: MatchmakingSession;
}): string {
  /**
   * The complimentary table-top offer only applies to events that actually run
   * exhibits and matchmaking sessions - the 2026 Defense Industry Update has
   * neither, so gov/mil registrants there only get the speaking-opportunity
   * line.
   */
  const offersHostedTable = eventHasExhibitSpace(eventId) && !!matchmakingSessions;

  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>

    <p>${offersHostedTable ? 'We have very limited complimentary Table-Top Exhibit Spaces available for Government Agencies &amp; Military Commands for those willing to host a Matchmaking Session Table on either one or both days of the conference. ' : ''}If you are interested in a Speaking Opportunity, please contact Charles Sills at <a href="mailto:csills@americandefensealliance.org">csills@americandefensealliance.org</a>.</p>
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${welcomeDestination(eventLocation)}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>
    
    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${venueAndLodgingHtml(hotelInfo, eventId)}
    </div>
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    ${orderSummaryHtml || ''}
    ${attendeeDetailsHtml || ''}
  `;

  return baseEmailTemplate(content, eventImage);
}
