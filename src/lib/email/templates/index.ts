import { MatchmakingSession, VipNetworkingReception } from '@/types/events';
import { getEnv } from '../../env';
import { getClientEnv } from '../../client-env';
import { getCdnPath } from '@/utils/image';

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
type Tier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'vip networking reception' | 'networking luncheon';

const benefitMap: Record<Tier, string[]> = {
  platinum: [
    'scheduling your speaking opportunity',
    'finalizing branding assets',
    'reserving your matchmaking session(s)',
    'coordinating your spotlight email',
  ],
  gold: [
    'scheduling your speaking opportunity',
    'finalizing branding assets',
    'reserving your matchmaking session(s)',
    'coordinating your spotlight email',
  ],
  silver: [
    'scheduling your speaking opportunity',
    'finalizing branding assets',
    'reserving your matchmaking session(s)',
  ],
  bronze: [
    'scheduling your speaking opportunity',
    'finalizing branding assets',
    'reserving your matchmaking session(s)',
  ],
  'vip networking reception': [
    'finalizing branding assets',
    'reserving your matchmaking session(s)',
  ],
  'networking luncheon': [
    'finalizing branding assets',
    'reserving your matchmaking session(s)',
  ],
};

function getBenefitMsg(title: string): string {
  const contact = `Please reach out to our team at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> to coordinate your benefits, including `;

  const matchedTier = (Object.keys(benefitMap) as Tier[]).find(t =>
    title.toLowerCase().includes(t)
  );

  if (!matchedTier) return '';

  const benefits = benefitMap[matchedTier];
  const list =
    benefits.length > 1
      ? `${benefits.slice(0, -1).join(', ')}, and ${benefits[benefits.length - 1]}`
      : benefits[0];


  return `<p>${contact}${list}.</p>`;
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
          ${
            summary.discount > 0
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
  recipientType: 'exhibitor' | 'sponsor' | 'attendee' = 'attendee'
): string {
  if (!vipNetworkingReception) return '';

  let introText = '';
  
  // if (recipientType === 'exhibitor') {
  //   introText = 'As an exhibitor, you and your guests are invited to our exclusive VIP Networking Reception.';
  // } else if (recipientType === 'sponsor') {
  //   introText = 'As a sponsor, you and your guests are invited to our exclusive VIP Networking Reception.';
  // }

  return `
    <div class="highlight">
      <h2>VIP Networking Reception</h2>
      <p><strong>Who's Invited:</strong> Speakers, Sponsors, Exhibitors, VIP Attendee Passes, and Special Guests.</p>
      <p><strong>Location:</strong> ${vipNetworkingReception.locationName}, ${vipNetworkingReception.locationAddress}</p>
      <p><strong>Date:</strong> ${vipNetworkingReception.date} from ${vipNetworkingReception.timeStart} to ${vipNetworkingReception.timeEnd}</p>
      <p>${vipNetworkingReception.additionalInfo}</p>
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
  // Use client-safe env for client components
  const env = typeof window === 'undefined' ? getEnv() : getClientEnv();

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
  eventImage: string;
  orderSummaryHtml?: string;
  attendeeDetailsHtml?: string;
}): string {
  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]}` : 'to this event'}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>

    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${hotelInfo ? `<p><strong>Hotel Accommodations:</strong> Room Block information is available <a href="${hotelInfo}">here.</a></p>` : ''}
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
  vipNetworkingReception,
  attendeeDetailsHtml,
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
  vipNetworkingReception?: VipNetworkingReception;
  attendeeDetailsHtml?: string;
}): string {
  const content = `
    <p><strong>Dear ${firstName},</strong></p>

    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]}` : 'to this event'}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>

    
    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${hotelInfo ? `<p><strong>Hotel Accommodations:</strong> Room Block information is available <a href="${hotelInfo}">here.</a></p>` : ''}
    </div>

    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}

    ${generateVipNetworkingReceptionHtml(vipNetworkingReception, 'attendee')}

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
  exhibitorInstructions,
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  vipNetworkingReception,
  attendeeDetailsHtml,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  venueName: string;
  eventUrl?: string;
  orderId: string;
  exhibitorType: string;
  exhibitorInstructions: string;
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo?: string;
  vipNetworkingReception?: VipNetworkingReception;
  attendeeDetailsHtml?: string;
}): string {
  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>

    <p>If you wish to purchase additional attendee passes, you can do so using the $395 registration Additional Exhibitor Attendee Pass option on our website.</p>
    <p><strong>Please respond to this email with a high-quality image of your company logo.</strong></p>
    
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]}` : 'to this event'}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>

    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${hotelInfo ? `<p><strong>Hotel Accommodations:</strong> Room Block information is available <a href="${hotelInfo}">here.</a></p>` : ''}
    </div>

    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}

    ${generateVipNetworkingReceptionHtml(vipNetworkingReception, 'exhibitor')}

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
  attendeePasses,
  exhibitorInstructions,
  eventImage,
  orderSummaryHtml,
  hotelInfo,
  vipNetworkingReception,
  matchmakingSessions,
  attendeeDetailsHtml,
}: {
  firstName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  venueName: string;
  eventUrl?: string;
  orderId: string;
  sponsorshipLevel: string;
  attendeePasses: number;
  exhibitorInstructions: string;
  eventImage: string;
  orderSummaryHtml?: string;
  hotelInfo?: string;
  vipNetworkingReception?: VipNetworkingReception;
  matchmakingSessions: MatchmakingSession | undefined;
  attendeeDetailsHtml?: string;
}): string {
  const sponsorshipTitle = sponsorshipLevel.toLowerCase();

  const getSpeakingTime = () => {
    if (sponsorshipTitle.includes('platinum')) return '20-minutes';
    if (sponsorshipTitle.includes('gold')) return '15-minutes';
    if (sponsorshipTitle.includes('silver')) return '10-minutes';
    if (sponsorshipTitle.includes('bronze')) return '5-minutes';
    if (sponsorshipTitle.includes('networking luncheon')) return '5-minutes';
    return '';
  };

  const speakingTime = getSpeakingTime();

  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>

    <p>You may register additional attendees not included in the (${attendeePasses}) complimentary VIP Attendee Passes for $395 each using the Additional Sponsorship Attendee Pass option on our website.</p>
    <p><strong>Please respond to this email with a high-quality image of your company logo.</strong></p>
    
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>Please note, all registrations are final. We are unable to offer refunds for this event. You can request an Event Credit up to one week from the event date. All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]}` : 'to this event'}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>


    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
        <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${hotelInfo ? `<p><strong>Hotel Accommodations:</strong> Room Block information is available <a href="${hotelInfo}">here.</a></p>` : ''}
    </div>

    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}

    
    <!-- VIP Networking Reception Host -->
    
    ${!sponsorshipTitle.includes('small business sponsor') ? `
    <div class="highlight">
    <h2>${sponsorshipTitle.replace(/\b(vip)\b/gi, m => m.toUpperCase()).replace(/\b\w/g, l => l.toUpperCase())} Benefits</h2>

    ${sponsorshipTitle.includes('vip networking reception') ? `
      <p><strong>Speaking Opportunity:</strong> You are the exclusive host of the VIP Networking Reception and are invited to provide welcoming remarks at the VIP Networking Reception. Please identify who will be providing welcoming remarks and provide a photo and bio for inclusion on our website.</p>
    ` : ''}

    <!-- Speaking Opportunity -->
    ${speakingTime ? `
      <p><strong>Speaking Opportunity: </strong>You will be given ${speakingTime} during the General Session. This may be a standalone presentation or part of a panel. Please provide your speaker’s name, bio (any length), high-resolution photo, and session topic for approval and scheduling.</p>
    ` : ''}

    ${sponsorshipTitle.includes('platinum') ? `
      <p><strong>Lanyard & Name Badge Branding:</strong> As the exclusive Lanyard and Name Badge Sponsor, you will have your company’s branding prominently displayed. Please arrange for the delivery of lanyards and coordinate branding specifications. </p>
    ` : ''}

    <!-- Matchmaking Table Host -->
      <p><strong>Matchmaking Table Host:</strong> You are invited to host a Matchmaking Table during the scheduled sessions. Please provide the name of your representative and a brief company description. </p>
      <!-- Date 1 -->
      <ul>
      <li>${matchmakingSessions?.sessions[0].date} from ${matchmakingSessions?.sessions[0].sessionTime}</li>
      <!-- Date 2 -->
        <li>${matchmakingSessions?.sessions[1].date} from ${matchmakingSessions?.sessions[1].sessionTime}</li>
      </ul>
    

    ${sponsorshipTitle.includes('gold') || sponsorshipTitle.includes('platinum') ? `
      <p><strong>Sponsor Spotlight Email:</strong> Your company will be featured in a pre-conference promotional email sent to all registered attendees. Please submit a company description and capabilities statement.</p>
    ` : ''}
    <h4 style="margin-top: 20px; margin-bottom: 2px;">Next Steps</h4>
    ${getBenefitMsg(sponsorshipTitle)}

    </div>
    ` : ''}
    ${generateVipNetworkingReceptionHtml(vipNetworkingReception, 'sponsor')}
    ${sponsorshipTitle.includes('without exhibit space') ? '' : generateExhibitorInstructionsHtml(exhibitorInstructions, true)}

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
  eventImage: string;
  orderSummaryHtml?: string;
  attendeeDetailsHtml?: string;
}): string {
  const content = `
    <p><strong>Dear ${firstName},</strong></p>
    
    <p>Thank you for registering for the <strong>${eventName}</strong>. We are pleased to confirm your participation in this important event. Please retain this email for your records.</p>

    <p>We have very limited complimentary Table-Top Exhibit Spaces available for Government Agencies & Military Commands for those willing to host a Matchmaking Session Table on either one or both days of the conference. If you are interested in a Speaking Opportunity, please contact Charles Sills (<a href="mailto:csills@americandefensealliance.org">csills@americandefensealliance.org</a>).</p>
    <p>Feel free to contact us at <a href="mailto:events@americandefensealliance.org">events@americandefensealliance.org</a> or call <span style="white-space: nowrap">(771) 474-1077</span> if you have any questions or need to make any changes to your registration.</p>
    <p>All event information can be found on our <a href="https://www.americandefensealliance.org/">website</a>.</p>
    <p>We look forward to welcoming you ${eventLocation ? `in ${eventLocation.split(',')[1]}` : 'to this event'}!</p>
    <p>Warm Regards,<br><strong>The American Defense Alliance Team</strong></p>
    
    <div class="highlight">
      <h2>Event Details</h2>
      <p><strong>Event:</strong> ${eventName}</p>
      <p><strong>Date${eventDate.includes('-') ? 's' : ''}:</strong> ${eventDate}</p>
      <p><strong>Location:</strong> ${venueName}, ${eventLocation}</p>
      ${hotelInfo ? `<p><strong>Hotel Accommodations:</strong> Room Block information is available <a href="${hotelInfo}">here.</a></p>` : ''}
    </div>
    ${eventUrl ? `<p><a href="${eventUrl}" class="button">View Event Details</a></p>` : ''}
    ${orderSummaryHtml || ''}
    ${attendeeDetailsHtml || ''}
  `;
  
  return baseEmailTemplate(content, eventImage);
}
