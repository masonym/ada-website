/**
 * Creates the failed-registrations table (idempotent).
 *
 *   node scripts/create-failed-registrations-table.js
 *
 * On-demand billing, so it costs nothing until something fails. TTL is enabled
 * on `expiresAt`, which saveFailedRegistration sets a year out - long enough
 * that a bug which goes unnoticed for weeks is still reconstructable.
 *
 * Until this runs, saveFailedRegistration just logs that it could not record;
 * registrations themselves are unaffected either way.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const {
  DynamoDBClient,
  CreateTableCommand,
  UpdateTimeToLiveCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} = require('@aws-sdk/client-dynamodb');

const TableName = process.env.FAILED_REGISTRATIONS_TABLE_NAME || 'failed-registrations';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function main() {
  try {
    await client.send(new DescribeTableCommand({ TableName }));
    console.log(`Table "${TableName}" already exists - nothing to do.`);
    return;
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') throw error;
  }

  console.log(`Creating "${TableName}"...`);
  await client.send(
    new CreateTableCommand({
      TableName,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    })
  );

  await waitUntilTableExists({ client, maxWaitTime: 120 }, { TableName });

  await client.send(
    new UpdateTimeToLiveCommand({
      TableName,
      TimeToLiveSpecification: { AttributeName: 'expiresAt', Enabled: true },
    })
  );

  console.log(`Created "${TableName}" with TTL on expiresAt.`);
}

main().catch(error => {
  console.error('Failed:', error.message);
  process.exit(1);
});
