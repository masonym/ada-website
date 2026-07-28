# Event registration smoke tests

Automated replacement for manually clicking through a registration for every ticket type
when a new event goes live. For each registration, exhibitor and sponsorship option the
suite posts the same payload the registration modal posts, checks the PaymentIntent that
Stripe creates, pays it with a Stripe test card, and then verifies the rows that land in
the event's Google Sheet — and deletes them again afterwards.

## Running it

```bash
# 1. start the app (a local dev server, or point TEST_BASE_URL at the test environment)
DISABLE_OUTBOUND_EMAILS=true npm run dev

# 2. in another terminal, run everything against the new event
TEST_EVENT_ID=7 npm run test:registration
```

Useful variations:

```bash
npm run test:preflight                     # credentials/connectivity only, no charges
npx playwright test tests/01-event-config.spec.ts   # offline config checks, no server needed
npx playwright test -g "Attendee Pass"     # one ticket type
TEST_CLEANUP_SHEET_ROWS=false npm run test:registration   # keep the rows to eyeball them
```

## What each file covers

| File | Needs | Checks |
| --- | --- | --- |
| `00-preflight.spec.ts` | Stripe + Google + app | Env vars set, Stripe key is test mode and works, register/webhook routes reachable, event maps to a real spreadsheet + tab with the right columns, event has purchasable options. Prints the full ticket list with resolved prices. |
| `01-event-config.spec.ts` | nothing | Unique ids and titles, every paid option resolves to a positive price, early-bird/tier pricing is coherent and climbs over time, price still resolves once all deadlines lapse. |
| `10-registration-flow.spec.ts` | Stripe + Google + app | The real thing, per ticket type — see below. |

The flow spec generates one test per purchasable option, plus:

- **complimentary passes** — register with no payment, land in the sheet at $0, and reject a
  non `.gov`/`.mil` email;
- **multi-item order** — two ticket types, one with quantity 2: three rows, right per-row
  amounts, one row per attendee, shared order total;
- **promo code** — only when `TEST_PROMO_CODE` is set: the discount reaches Stripe metadata
  and the per-row amounts in the sheet. An unknown code is always tested and must be rejected;
- **declined card** — a failed payment must leave nothing in the sheet.

Per paid ticket type it asserts: the endpoint charges the configured (early-bird / live tier)
price, the Stripe PaymentIntent has that amount in cents plus `eventId`, `orderType`,
`email`, `receipt_email` and a `pendingRegistrationId` (without which the webhook has nothing
to log), the payment confirms, and the sheet row carries the right ticket name, per-attendee
net amount (`price * 0.971 - 0.30`), order total, and attendee details.

## Configuration

Everything is read from `.env` / `.env.local`, with `.env.test.local` taking precedence, so
normally you only need `TEST_EVENT_ID`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `TEST_EVENT_ID` | *(required)* | Event id from `src/constants/registrations.ts`. |
| `TEST_BASE_URL` | `NEXT_PUBLIC_SITE_URL` or `http://localhost:3000` | App under test. |
| `TEST_EVENT_TITLE` | `Test Event <id>` | Only used in the Stripe payment description. |
| `TEST_WEBHOOK_MODE` | `direct` | `direct` = the test signs and posts the webhook itself; `stripe` = wait for a real Stripe delivery. |
| `TEST_PROMO_CODE` | *(unset)* | Enables the promo discount test. Codes live in Sanity — see `/admin/promo-codes`. |
| `TEST_CLEANUP_SHEET_ROWS` | `true` | Delete the rows written by the run. |
| `TEST_SHEET_TIMEOUT_MS` | `90000` | How long to wait for a row to appear. |
| `TEST_EMAIL_DOMAIN` / `TEST_GOV_EMAIL_DOMAIN` | `ada-qa.example.com` / `ada-qa.example.gov` | Domains for generated attendee emails. |

### Webhook modes

Registrations are only written to the sheet when `payment_intent.succeeded` reaches
`/api/webhooks/stripe`. Two ways to make that happen:

- **`direct`** (default) — the test builds the event from the real, confirmed PaymentIntent,
  signs it with `STRIPE_WEBHOOK_SECRET` and posts it to the app. No extra tooling, works
  against localhost. The payment is genuine; only the delivery hop is simulated.
- **`stripe`** — the test just waits, so an actual Stripe delivery has to arrive. Use this to
  prove the webhook wiring itself works:

  ```bash
  # against the deployed test environment (highest fidelity - see the caveat below)
  TEST_EVENT_ID=7 TEST_BASE_URL=https://staging.americandefensealliance.org \
    TEST_WEBHOOK_MODE=stripe npm run test:registration

  # or against localhost, with the CLI forwarding (secret must match .env)
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  TEST_EVENT_ID=7 TEST_WEBHOOK_MODE=stripe npm run test:registration
  ```

  Run this at least once per environment: `direct` mode will pass even if no webhook endpoint
  is registered at all.

#### The staging race (read this before running against localhost)

The Stripe **test-mode account has a webhook endpoint registered at
`https://staging.americandefensealliance.org/api/webhooks/stripe`**, so every payment these
tests create is also delivered there. Staging shares the DynamoDB de-duplication table with
local, and the handler skips any payment intent it has already confirmed — so whichever
instance gets there first is the one that writes the sheet row, and the other logs
`has already been processed. Skipping to prevent duplicates.`

In practice the test's `direct` delivery wins (it fires immediately after confirming, and the
route is warmed up first), but a cold or slow local server can lose the race, and the run then
fails with a sheet timeout even though nothing is broken. If that happens, either re-run or —
better — run against staging with `TEST_WEBHOOK_MODE=stripe`, where there is no race at all.
The preflight spec prints every endpoint Stripe delivers to.

## Safety

- The Stripe helper **refuses to run** unless `STRIPE_SECRET_KEY` is an `sk_test_` key.
- Set `DISABLE_OUTBOUND_EMAILS=true` on the app being tested, otherwise every test
  registration emails its (fake) attendees *and* `events@americandefensealliance.org`.
- The suite writes to the **real spreadsheet mapped to that event** in
  `src/lib/google-sheets/spreadsheet-mapping.ts`. Make sure the test environment maps the
  event to a copy, not the live sheet.
- Every row is tagged `ADA QA TEST <run id> <scenario>` in the Company column (or in
  "Validated against" for line items that collect no attendee info) and deleted by the global
  teardown, including rows orphaned by an earlier aborted run. Cleanup failures never fail the
  run — they print what to delete by hand.
- Real DynamoDB pending/confirmed registration records are created, as in production.

## Known gaps

- **Client-supplied prices are trusted.** `/api/event-registration/register` prefers
  `body.ticketPrices[ticketId]` over the configured price, so a tampered request can set its
  own amount. The tests deliberately don't assert on this — they'd fail against current
  behaviour. Worth fixing separately (ignore the client price for known ticket ids).
- Code-gated tickets (`requiresCode`) and order-id validation for additional passes are
  enforced in the modal, not the API, so the tests don't exercise those gates.
- The Stripe Elements card UI is not driven; payments are confirmed server-side with test
  payment methods.
