import { Client } from "pg";

export default async function globalTeardown() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`DELETE FROM "User" WHERE email LIKE 'e2e+%@example.com'`);
  } finally {
    await client.end();
  }
}