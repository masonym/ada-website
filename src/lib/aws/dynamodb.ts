import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getServerEnv } from '@/lib/server-env';
import { RegistrationFormData, StoredRegistrationData } from '@/types/event-registration/registration';
import {
  GRANTED_ATTR,
  USED_ATTR,
  countGrantedPasses,
  countUsedPasses,
} from '@/lib/event-registration/sponsor-pass-entitlement';
import { v4 as uuidv4 } from 'uuid';

const env = getServerEnv();

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = env.DYNAMODB_TABLE_NAME;
const TTL_IN_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * Saves pending registration data to DynamoDB with a TTL.
 * @param registrationData The user's registration form data.
 * @returns The unique ID for the stored registration.
 */
export async function savePendingRegistration(registrationData: RegistrationFormData): Promise<string> {
  const id = uuidv4();
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_IN_SECONDS;

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      id,
      expiresAt,
      registrationData,
    },
  });

  try {
    await docClient.send(command);
    console.log(`Successfully saved pending registration ${id} to DynamoDB.`);
    return id;
  } catch (error) {
    console.error('Error saving to DynamoDB:', error);
    throw new Error('Could not save pending registration.');
  }
}

/**
 * Retrieves a pending registration from DynamoDB.
 * @param id The unique ID of the registration to retrieve.
 * @returns The registration data, or null if not found.
 */
export async function getPendingRegistration(id: string): Promise<RegistrationFormData | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      id,
    },
  });

  try {
    const { Item } = await docClient.send(command);
    if (Item) {
      console.log(`Successfully retrieved pending registration ${id} from DynamoDB.`);
      return Item.registrationData as RegistrationFormData;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving from DynamoDB:', error);
    throw new Error('Could not retrieve pending registration.');
  }
}

/**
 * Saves the final registration details to the permanent registrations table.
 * @param registrationData The user's registration form data.
 * @param orderId The order id, which is also the primary key - the payment
 *   intent id for a paid order, or the generated `ORDER-...` id for a free one.
 */
export async function saveConfirmedRegistration(registrationData: RegistrationFormData, orderId: string): Promise<void> {
  const env = getServerEnv();
  const tableName = env.PERMANENT_REGISTRATIONS_TABLE_NAME;

  // Written here rather than by the callers so no save path can forget them: an
  // order without counters cannot have its leftover sponsor passes claimed later,
  // and there is no way to tell that apart from an order with none left.
  const granted = countGrantedPasses(registrationData.eventId, registrationData.tickets);

  const item = {
    ...registrationData,
    id: orderId, // Payment intent id (paid) or generated order id (free)
    createdAt: new Date().toISOString(),
    [GRANTED_ATTR]: granted,
    [USED_ATTR]: granted
      ? Math.min(granted, countUsedPasses(registrationData.eventId, registrationData.tickets))
      : 0,
  };

  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log(`Successfully saved confirmed registration ${orderId} to ${tableName}`);
  } catch (error) {
    console.error(`Error saving confirmed registration to ${tableName}:`, error);
    throw new Error('Could not save confirmed registration.');
  }
}

/**
 * The post-payment fulfillment steps that a webhook retry can resume.
 * Values are the attribute names on the confirmed-registration item.
 */
export type FulfillmentStep = 'sheetsLoggedAt' | 'confirmationEmailsSentAt';

/**
 * Stamps a fulfillment step as done on a confirmed registration.
 *
 * These markers, not the existence of the row, are what makes the webhook
 * idempotent. The row is written before Sheets and email run, so a handler that
 * dies midway leaves an order that looks processed but never reached the
 * customer - Stripe retries, the retry sees the row, and the order goes silent.
 *
 * Failing to stamp is deliberately non-fatal: the step itself already
 * succeeded, and the worst case is a later retry redoing it.
 */
export async function markFulfillmentStep(orderId: string, step: FulfillmentStep): Promise<void> {
  const env = getServerEnv();
  const tableName = env.PERMANENT_REGISTRATIONS_TABLE_NAME;

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: orderId },
        UpdateExpression: 'SET #step = :now',
        ExpressionAttributeNames: { '#step': step },
        ExpressionAttributeValues: { ':now': new Date().toISOString() },
      })
    );
  } catch (error) {
    console.error(`Error marking ${step} on registration ${orderId}:`, error);
  }
}

/** Room to spare under DynamoDB's 400KB item limit. */
const MAX_STORED_PAYLOAD_BYTES = 300 * 1024;

/** A year, so a bug that goes unnoticed for weeks is still reconstructable. */
const FAILED_TTL_IN_SECONDS = 365 * 24 * 60 * 60;

export interface FailedRegistrationInput {
  /** The raw request body - what the customer actually tried to buy. */
  payload?: unknown;
  error: unknown;
  /** Set once the pending row exists, so the two records can be correlated. */
  pendingRegistrationId?: string;
  stage?: string;
}

/**
 * Strips `undefined` (which the document client rejects) and anything
 * non-serialisable, and caps the size so an unexpected payload cannot push the
 * item past DynamoDB's limit and lose the record entirely.
 */
function serialisableCopy(value: unknown): unknown {
  let json: string;
  try {
    json = JSON.stringify(value ?? null) ?? 'null';
  } catch {
    return '[unserialisable payload]';
  }

  if (json.length > MAX_STORED_PAYLOAD_BYTES) {
    return `[truncated ${json.length} chars] ${json.slice(0, MAX_STORED_PAYLOAD_BYTES)}`;
  }
  return JSON.parse(json);
}

/** Stripe hides the useful part (`param`, `code`, `requestId`) on the error object. */
function describeError(error: unknown): Record<string, string> {
  if (!(error instanceof Error)) {
    return { message: String(error) };
  }

  const e = error as Error & {
    type?: string;
    code?: string;
    param?: string;
    requestId?: string;
    statusCode?: number;
  };

  const described: Record<string, string> = {
    name: e.name,
    message: e.message,
  };
  if (e.stack) described.stack = e.stack.slice(0, 4000);
  if (e.type) described.type = e.type;
  if (e.code) described.code = e.code;
  if (e.param) described.param = e.param;
  if (e.requestId) described.requestId = e.requestId;
  if (e.statusCode !== undefined) described.statusCode = String(e.statusCode);

  return described;
}

/**
 * Records a registration that never reached Stripe.
 *
 * These used to leave no trace anywhere: Stripe never sees a PaymentIntent, the
 * sheet only logs successes, and the pending row expires after 24 hours. A promo
 * code whose metadata exceeded Stripe's limit broke every order that used it for
 * a fortnight before anyone noticed, and the only orders we could reconstruct
 * afterwards were the ones from the last day.
 *
 * Never throws. A failure to record a failure must not replace the error the
 * caller is already handling.
 */
export async function saveFailedRegistration(
  input: FailedRegistrationInput
): Promise<string | null> {
  const id = uuidv4();

  try {
    const env = getServerEnv();
    const payload = (input.payload ?? {}) as Record<string, unknown>;

    await docClient.send(
      new PutCommand({
        TableName: env.FAILED_REGISTRATIONS_TABLE_NAME,
        Item: {
          id,
          createdAt: new Date().toISOString(),
          expiresAt: Math.floor(Date.now() / 1000) + FAILED_TTL_IN_SECONDS,
          stage: input.stage ?? 'register',
          // Promoted out of the payload so the table can be scanned on them
          // without unpacking every record.
          eventId: payload.eventId !== undefined ? String(payload.eventId) : 'unknown',
          email: typeof payload.email === 'string' ? payload.email : 'unknown',
          promoCode: typeof payload.promoCode === 'string' ? payload.promoCode : '',
          pendingRegistrationId: input.pendingRegistrationId ?? '',
          error: describeError(input.error),
          payload: serialisableCopy(input.payload),
        },
      })
    );

    console.log(`Recorded failed registration ${id}.`);
    return id;
  } catch (error) {
    console.error('Could not record failed registration:', error);
    return null;
  }
}

/**
 * Retrieves a confirmed registration from DynamoDB.
 * @param id The unique ID of the registration to retrieve (paymentIntentId).
 * @returns The registration data, or null if not found.
 */
export async function getConfirmedRegistration(id: string): Promise<StoredRegistrationData | null> {
  const env = getServerEnv();
  const tableName = env.PERMANENT_REGISTRATIONS_TABLE_NAME;

  const command = new GetCommand({
    TableName: tableName,
    Key: {
      id,
    },
  });

  try {
    const { Item } = await docClient.send(command);
    if (Item) {
      console.log(`Successfully retrieved confirmed registration ${id} from ${tableName}.`);
      // The entire item is the registration data, unlike pending which was nested.
      return Item as StoredRegistrationData;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving from ${tableName}:`, error);
    throw new Error('Could not retrieve confirmed registration.');
  }
}

export type ClaimSponsorPassesResult =
  | { ok: true; remaining: number }
  | {
      ok: false;
      reason: 'not-found' | 'wrong-event' | 'unknown-entitlement' | 'insufficient';
      remaining: number;
    };

/**
 * Spends `count` of an order's complimentary sponsor attendee passes.
 *
 * The conditional update is the whole point: two people claiming the last pass
 * at the same moment both read `used = 1`, both compute a limit of 1, and only
 * the first update lands - the second finds `used = 2` and fails its condition
 * rather than overselling the sponsorship. `granted` is pinned in the condition
 * too, so a concurrent write that changed the entitlement invalidates the claim
 * instead of being silently overwritten.
 *
 * DynamoDB condition expressions cannot do arithmetic, hence the read-then-pin
 * rather than a single `used <= granted - :n`.
 */
export async function claimSponsorPasses(
  orderId: string,
  count: number,
  expectedEventId: string | number
): Promise<ClaimSponsorPassesResult> {
  const env = getServerEnv();
  const tableName = env.PERMANENT_REGISTRATIONS_TABLE_NAME;

  const order = await getConfirmedRegistration(orderId);
  if (!order) return { ok: false, reason: 'not-found', remaining: 0 };

  // Re-checked here and not just at validation time: the order id arrives back
  // from the browser on submit, and nothing stops a crafted POST naming an order
  // from a different event than the one it verified.
  if (String(order.eventId) !== String(expectedEventId)) {
    return { ok: false, reason: 'wrong-event', remaining: 0 };
  }

  const granted = order[GRANTED_ATTR];
  const used = order[USED_ATTR];
  if (typeof granted !== 'number' || typeof used !== 'number') {
    return { ok: false, reason: 'unknown-entitlement', remaining: 0 };
  }

  const remaining = Math.max(0, granted - used);
  if (count > remaining) {
    return { ok: false, reason: 'insufficient', remaining };
  }

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { id: orderId },
        UpdateExpression: 'SET #used = #used + :count',
        ConditionExpression: '#granted = :granted AND #used <= :maxUsedBefore',
        ExpressionAttributeNames: { '#used': USED_ATTR, '#granted': GRANTED_ATTR },
        ExpressionAttributeValues: {
          ':count': count,
          ':granted': granted,
          ':maxUsedBefore': granted - count,
        },
      })
    );
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      // Someone else claimed in the gap between the read and the update.
      console.warn(`Sponsor pass claim on ${orderId} lost a race for ${count} pass(es).`);
      return { ok: false, reason: 'insufficient', remaining: 0 };
    }
    console.error(`Error claiming sponsor passes on ${orderId}:`, error);
    throw new Error('Could not claim sponsor passes.');
  }

  return { ok: true, remaining: remaining - count };
}

/**
 * Hands back passes claimed for an order that then failed before it was placed.
 *
 * Best effort and never throws - the caller is already handling an error, and a
 * pass stuck as spent is a support ticket, not a broken checkout. Floors at zero
 * so a double release cannot mint entitlement.
 */
export async function releaseSponsorPasses(orderId: string, count: number): Promise<void> {
  if (count <= 0) return;

  try {
    const env = getServerEnv();
    await docClient.send(
      new UpdateCommand({
        TableName: env.PERMANENT_REGISTRATIONS_TABLE_NAME,
        Key: { id: orderId },
        UpdateExpression: 'SET #used = #used - :count',
        ConditionExpression: '#used >= :count',
        ExpressionAttributeNames: { '#used': USED_ATTR },
        ExpressionAttributeValues: { ':count': count },
      })
    );
    console.log(`Released ${count} sponsor pass(es) back to ${orderId}.`);
  } catch (error) {
    console.error(`Could not release ${count} sponsor pass(es) on ${orderId}:`, error);
  }
}
