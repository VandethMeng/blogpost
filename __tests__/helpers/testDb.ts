import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

export async function setupTestDb() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  client = new MongoClient(uri);
  await client.connect();

  return { client, uri };
}

export async function teardownTestDb() {
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearTestDb() {
  if (client) {
    const db = client.db("blogpostdb");
    const collections = await db.collections();

    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
}

export function getTestDb() {
  if (!client) {
    throw new Error("Test database not initialized. Call setupTestDb() first.");
  }
  return client.db("blogpostdb");
}
