'use client';

import { useEffect, useMemo, useState } from 'react';
import { EVENTS } from '@/constants/events';
import {
  AdapterModalRegistrationType,
  getExhibitorsForEvent,
  getRegistrationsForEvent,
  getSponsorshipsForEvent,
} from '@/lib/registration-adapters';
import {
  TicketTier,
  determineTicketTier,
  renderConfirmationEmail,
} from '@/lib/email/render-confirmation';
import { AttendeeDetails, OrderSummary } from '@/lib/email/templates';
import { getPriceDisplay } from '@/lib/price-formatting';

/**
 * Renders confirmation emails through the same code path that sends them:
 * pick an event and a registration item, and `renderConfirmationEmail` picks
 * the template and fills it from `@/constants/*`, exactly as it does for a real
 * order. The only invented values are the ones that genuinely come from the
 * buyer - their name, the order id, and the attendee list.
 */

const SAMPLE_ATTENDEES: AttendeeDetails[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corporation',
    jobTitle: 'Chief Technology Officer',
    phone: '(555) 123-4567',
    website: 'https://example.com',
    businessSize: 'Large Business',
    industry: 'Defense',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    company: 'Tech Innovations LLC',
    jobTitle: 'Director of Operations',
    phone: '(555) 987-6543',
    website: 'https://techinnovations.example.com',
    businessSize: 'Small Business',
    sbaIdentification: 'WOSB',
    industry: 'Aerospace',
  },
];

const SAMPLE_ORDER_ID = 'pi_3PreviewOrder0000000000';

const TIER_LABELS: Record<TicketTier, string> = {
  [TicketTier.PLATINUM_SPONSOR]: 'Sponsor (Platinum)',
  [TicketTier.GOLD_SPONSOR]: 'Sponsor (Gold)',
  [TicketTier.SILVER_SPONSOR]: 'Sponsor (Silver)',
  [TicketTier.BRONZE_SPONSOR]: 'Sponsor (Bronze/other)',
  [TicketTier.EXHIBITOR]: 'Exhibitor',
  [TicketTier.VIP_ATTENDEE]: 'VIP Attendee',
  [TicketTier.GOV_MIL_PASS]: 'Gov/Mil Pass',
  [TicketTier.STANDARD_ATTENDEE]: 'Standard Attendee',
};

/** Newest events first - those are the ones being tested before a launch. */
const EVENT_OPTIONS = [...EVENTS].reverse();

interface RegistrationGroup {
  label: string;
  items: AdapterModalRegistrationType[];
}

function registrationGroups(eventId: number): RegistrationGroup[] {
  return [
    { label: 'Sponsorships', items: getSponsorshipsForEvent(eventId) },
    { label: 'Exhibit Space', items: getExhibitorsForEvent(eventId) },
    { label: 'Tickets', items: getRegistrationsForEvent(eventId) },
  ].filter((group) => group.items.length > 0);
}

/** A one-line order for the selected item, priced from the live price tier. */
function buildOrderSummary(registration: AdapterModalRegistrationType): OrderSummary {
  const price = getPriceDisplay(registration).numericValue;

  return {
    orderId: SAMPLE_ORDER_ID,
    orderDate: new Date().toLocaleDateString(),
    items: [{ name: registration.title, quantity: 1, price }],
    subtotal: price,
    discount: 0,
    total: price,
  };
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: '#334155' } as const;
const selectStyle = {
  padding: '8px',
  fontSize: 15,
  minWidth: 320,
  maxWidth: '100%',
} as const;

export default function EmailPreviewPage() {
  const [eventId, setEventId] = useState<number>(EVENT_OPTIONS[0].id);
  const [registrationId, setRegistrationId] = useState<string>('');
  const [exhibitorInstructions, setExhibitorInstructions] = useState('');

  const event = useMemo(
    () => EVENTS.find((e) => e.id === eventId) ?? EVENT_OPTIONS[0],
    [eventId]
  );

  const groups = useMemo(() => registrationGroups(eventId), [eventId]);
  const allRegistrations = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups]
  );

  const registration =
    allRegistrations.find((r) => r.id === registrationId) ?? allRegistrations[0];

  // Reset the selection when the chosen item doesn't exist for the new event.
  useEffect(() => {
    if (registration && registration.id !== registrationId) {
      setRegistrationId(registration.id);
    }
  }, [registration, registrationId]);

  // Resolved server-side from the event's bucket prefix, the same way
  // sendRegistrationConfirmationEmail resolves it.
  useEffect(() => {
    let cancelled = false;
    setExhibitorInstructions('');

    if (!event.eventShorthand) return;

    fetch(`/api/dev/event-documents?event=${encodeURIComponent(event.eventShorthand)}`)
      .then((res) => (res.ok ? res.json() : { exhibitorInstructions: '' }))
      .then((data) => {
        if (!cancelled) setExhibitorInstructions(data.exhibitorInstructions || '');
      })
      .catch(() => {
        if (!cancelled) setExhibitorInstructions('');
      });

    return () => {
      cancelled = true;
    };
  }, [event.eventShorthand]);

  const tier = registration ? determineTicketTier(registration) : null;

  const rendered =
    registration && tier !== null
      ? renderConfirmationEmail({
          firstName: SAMPLE_ATTENDEES[0].firstName,
          event,
          tier,
          registration,
          orderId: SAMPLE_ORDER_ID,
          orderSummary: buildOrderSummary(registration),
          attendees: SAMPLE_ATTENDEES,
          attendeePasses: registration.sponsorPasses || 0,
          exhibitorInstructions,
        })
      : null;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        Confirmation Email Preview
      </h1>
      <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>
        Rendered with the same <code>renderConfirmationEmail()</code> the
        registration flow uses, from live event, sponsorship, exhibitor and
        pricing data. Only the buyer name, order id and attendee list are sample
        values.
      </p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="event-select" style={labelStyle}>
            Event
          </label>
          <select
            id="event-select"
            value={eventId}
            onChange={(e) => setEventId(Number(e.target.value))}
            style={selectStyle}
          >
            {EVENT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title} ({option.eventShorthand})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="registration-select" style={labelStyle}>
            Registration purchased
          </label>
          <select
            id="registration-select"
            value={registration?.id ?? ''}
            onChange={(e) => setRegistrationId(e.target.value)}
            style={selectStyle}
          >
            {groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {rendered ? (
        <>
          <div
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '10px 12px',
              marginBottom: 12,
              fontSize: 14,
            }}
          >
            <div>
              <strong>Subject:</strong> {rendered.subject}
            </div>
            <div style={{ color: '#475569' }}>
              <strong>Template:</strong> {tier !== null ? TIER_LABELS[tier] : ''}
              {' · '}
              <strong>Exhibitor instructions:</strong>{' '}
              {exhibitorInstructions || 'none in bucket'}
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', height: '80vh' }}>
            <iframe
              srcDoc={rendered.html}
              title="Email Preview"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        </>
      ) : (
        <p>No registration types are configured for this event.</p>
      )}
    </div>
  );
}
