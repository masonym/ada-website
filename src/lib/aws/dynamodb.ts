import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getServerEnv } from '@/lib/server-env';
import { RegistrationFormData } from '@/types/event-registration/registration';
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
 * @param paymentIntentId The payment intent ID.
 */
export async function saveConfirmedRegistration(registrationData: RegistrationFormData, paymentIntentId: string): Promise<void> {
  const env = getServerEnv();
  const tableName = env.PERMANENT_REGISTRATIONS_TABLE_NAME;

  const item = {
    ...registrationData,
    id: paymentIntentId, // Use payment intent ID as the primary key
    createdAt: new Date().toISOString(),
  };

  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log(`Successfully saved confirmed registration ${paymentIntentId} to ${tableName}`);
  } catch (error) {
    console.error(`Error saving confirmed registration to ${tableName}:`, error);
    throw new Error('Could not save confirmed registration.');
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
export async function getConfirmedRegistration(id: string): Promise<RegistrationFormData | null> {
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
      return Item as RegistrationFormData;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving from ${tableName}:`, error);
    throw new Error('Could not retrieve confirmed registration.');
  }
}
