import { config, TEST_ROW_MARKER } from './config';
import { TestableItem } from './tickets';

/**
 * Builds the exact request body RegistrationModal.handleFinalSubmit() posts to
 * /api/event-registration/register. Keep this in sync with that function - if the
 * modal's payload changes, this is the file to update.
 */

export interface OrderLine {
  item: TestableItem;
  quantity: number;
  /** Overrides the price the modal would send. Used to prove server-side pricing. */
  priceOverride?: number;
  /** Overrides the generated attendee email (e.g. to test gov/mil validation). */
  attendeeEmails?: string[];
}

export interface BuiltOrder {
  body: Record<string, any>;
  /** Marker written into the sheet for this order, used to find and clean up rows. */
  marker: string;
  buyerEmail: string;
  attendeeEmails: string[];
  /** Sum of price * quantity, before any promo discount. */
  subtotal: number;
}

let attendeeCounter = 0;

function attendeeEmail(domain: string): string {
  attendeeCounter += 1;
  return `ada-qa+${config.runId.toLowerCase()}-${attendeeCounter}@${domain}`;
}

function buildAttendee(email: string, marker: string) {
  return {
    firstName: 'ADA',
    lastName: `QA ${attendeeCounter}`,
    email,
    jobTitle: 'Automated Test Account',
    company: marker,
    phone: '(555) 010-1234',
    website: 'https://ada-qa.example.com',
    businessSize: 'Small Business',
    sbaIdentification: 'Not Applicable',
    industry: 'Test Automation',
    sponsorInterest: 'No' as const,
    speakingInterest: 'No' as const,
  };
}

/**
 * @param label short description of the scenario, appended to the row marker so a
 *              failed run can be traced back to the test that produced it.
 */
export function buildOrder(lines: OrderLine[], label: string, promoCode?: string): BuiltOrder {
  const marker = `${TEST_ROW_MARKER} ${config.runId} ${label}`.trim();
  const attendeeEmails: string[] = [];
  let subtotal = 0;

  const tickets = lines.map(({ item, quantity, priceOverride, attendeeEmails: emails }) => {
    const price = priceOverride ?? (item.isComplimentary ? 'Complimentary' : item.expectedPrice);
    if (typeof price === 'number') subtotal += price * quantity;

    const domain = item.isComplimentary ? config.govEmailDomain : config.emailDomain;
    const attendeeInfo = item.requiresAttendeeInfo
      ? Array.from({ length: quantity }, (_, i) => {
          const email = emails?.[i] ?? attendeeEmail(domain);
          attendeeEmails.push(email);
          return buildAttendee(email, marker);
        })
      : [];

    return {
      ticketId: item.id,
      ticketName: item.title,
      ticketPrice: price,
      quantity,
      category: item.category,
      attendeeInfo,
      type: item.type,
    };
  });

  const ticketPrices: Record<string, number> = {};
  for (const { item, quantity, priceOverride } of lines) {
    if (quantity <= 0) continue;
    const price = priceOverride ?? (item.isComplimentary ? 0 : item.expectedPrice);
    if (typeof price === 'number') ticketPrices[item.id] = price;
  }

  // Line items that collect no attendee info produce sheet rows with every attendee
  // column blank, so there is nowhere to put the marker. Those (and the additional
  // passes, which carry a real validation in production) get an orderValidation entry,
  // which the sheet logs in the "Validated against" column.
  const orderValidations = lines
    .filter(({ item }) => !item.requiresAttendeeInfo || item.requiresValidation)
    .map(({ item }) => ({
      ticketId: item.id,
      ticketName: item.title,
      validatedOrderId: config.runId,
      validatedOrderCompany: marker,
      validatedOrderEmail: `ada-qa@${config.emailDomain}`,
      validatedOrderCreatedAt: new Date().toISOString(),
    }));

  const buyer = tickets.flatMap((t) => t.attendeeInfo)[0];
  const buyerEmail = buyer?.email ?? attendeeEmail(config.emailDomain);

  const body: Record<string, any> = {
    eventId: config.eventId,
    firstName: buyer?.firstName ?? 'ADA',
    lastName: buyer?.lastName ?? 'QA',
    email: buyerEmail,
    phone: buyer?.phone ?? '(555) 010-1234',
    jobTitle: buyer?.jobTitle ?? 'Automated Test Account',
    company: buyer?.company ?? marker,
    companyWebsite: buyer?.website ?? 'https://ada-qa.example.com',
    businessSize: buyer?.businessSize ?? 'Small Business',
    industry: buyer?.industry ?? 'Test Automation',
    howDidYouHearAboutUs: '',
    interestedInSponsorship: false,
    interestedInSpeaking: false,
    agreeToPhotoRelease: false,
    agreeToTerms: true,
    paymentMethod: subtotal === 0 ? 'free' : 'creditCard',
    tickets,
    orderValidations,
    eventTitle: config.eventTitle,
    eventImage: '',
    ticketPrices,
    promoCode: promoCode || null,
  };

  return { body, marker, buyerEmail, attendeeEmails, subtotal };
}

export async function submitRegistration(body: Record<string, any>): Promise<{
  status: number;
  json: any;
}> {
  const response = await fetch(`${config.baseUrl}/api/event-registration/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Registration endpoint returned non-JSON (${response.status}). Is the app running at ${config.baseUrl}?\n${text.slice(0, 500)}`
    );
  }

  return { status: response.status, json };
}
