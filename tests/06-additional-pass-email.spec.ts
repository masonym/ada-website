import { test, expect } from '@playwright/test';
import { config } from './helpers/config';
import { EVENTS } from '@/constants/events';
import {
  getExhibitorsForEvent,
  getSponsorshipsForEvent,
} from '@/lib/registration-adapters';
import {
  TicketTier,
  determineTicketTier,
  findHighestTierRegistration,
  renderConfirmationEmail,
} from '@/lib/email/render-confirmation';
import {
  ADDITIONAL_EXHIBITOR_PASS_ID,
  ADDITIONAL_SPONSOR_PASS_ID,
  resolveLinkedPackage,
} from '@/lib/email/additional-pass';

/**
 * Offline checks on the confirmation email for the "Additional Sponsor/Exhibitor
 * Attendee Pass" add-ons.
 *
 * These passes are usually bought on their own, unlocked with the order id of
 * the company's sponsorship or exhibit purchase. They used to render through the
 * sponsor/exhibitor templates, which look their perks up by id and found
 * nothing: the buyer got a generic "details are on the event website" block, a
 * request for a company logo, and an offer of "(0) complimentary VIP Attendee
 * Passes". They now get their own template, describing the package the pass is
 * linked to.
 */
for (const eventId of config.targetEventIds) {
  test.describe(`event ${eventId} - additional attendee pass emails`, () => {
    const event = EVENTS.find((e) => e.id === eventId)!;
    const sponsorships = getSponsorshipsForEvent(eventId);
    const exhibitors = getExhibitorsForEvent(eventId);

    const passes = [
      { id: ADDITIONAL_SPONSOR_PASS_ID, catalogue: sponsorships },
      { id: ADDITIONAL_EXHIBITOR_PASS_ID, catalogue: exhibitors },
    ]
      .map(({ id, catalogue }) => catalogue.find((r) => r.id === id))
      .filter((r): r is NonNullable<typeof r> => !!r);

    test('add-on passes get their own template, not the sponsor/exhibit one', () => {
      test.skip(passes.length === 0, 'event sells no additional attendee passes');

      for (const pass of passes) {
        expect(determineTicketTier(pass), pass.id).toBe(TicketTier.ADDITIONAL_PASS);
      }
    });

    test('a package in the same order still wins the template', () => {
      const pass = passes[0];
      const packages = [...sponsorships, ...exhibitors].filter(
        (r) => !passes.some((p) => p.id === r.id)
      );
      test.skip(!pass || packages.length === 0, 'event sells no packages with add-on passes');

      const highest = findHighestTierRegistration([pass, packages[0]]);
      expect(highest?.registration.id).toBe(packages[0].id);
    });

    test('a linked package is named and its perks rendered', () => {
      const pass = passes.find((p) => p.id === ADDITIONAL_SPONSOR_PASS_ID) ?? passes[0];
      const basePackage = [...sponsorships, ...exhibitors].find(
        (r) => !passes.some((p) => p.id === r.id)
      );
      test.skip(!pass || !basePackage, 'event sells no packages with add-on passes');

      const linkedPackage = resolveLinkedPackage(eventId, {
        tickets: [{ ticketId: basePackage!.id }],
        company: 'Acme Corporation',
        orderId: 'pi_TestSponsorOrder',
      });
      expect(linkedPackage, `no package resolved for ${basePackage!.id}`).not.toBeNull();

      const { html } = renderConfirmationEmail({
        firstName: 'John',
        event,
        tier: TicketTier.ADDITIONAL_PASS,
        registration: pass,
        orderId: 'pi_TestPassOrder',
        linkedPackage,
      });

      expect(html).toContain('Acme Corporation');
      expect(html).toContain(linkedPackage!.title);
      expect(html).toContain('pi_TestSponsorOrder');
      // Wording that only makes sense for the buyer of the package itself.
      expect(html).not.toContain('high-quality image of your company logo');
      expect(html).not.toContain('complimentary VIP Attendee Passes');
      expect(html).not.toContain('The full details of your sponsorship package');
    });

    test('an unlinked pass still renders without inventing a package', () => {
      const pass = passes[0];
      test.skip(!pass, 'event sells no additional attendee passes');

      const { html } = renderConfirmationEmail({
        firstName: 'John',
        event,
        tier: TicketTier.ADDITIONAL_PASS,
        registration: pass,
        orderId: 'pi_TestPassOrder',
        linkedPackage: null,
      });

      expect(html).toContain(pass.title);
      expect(html).toContain('Event Details');
      expect(html).not.toContain('undefined');
    });
  });
}
