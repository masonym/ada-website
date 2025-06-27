import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getEnv } from '@/lib/env';
import { RegistrationFormData } from '@/types/event-registration/registration';
import { v4 as uuidv4 } from 'uuid';

const env = getEnv();

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
