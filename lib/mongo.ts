import { Collection, Document, MongoClient, ServerApiVersion } from 'mongodb';

const DEFAULT_DB_NAME = 'ticketing';

type GlobalWithMongo = typeof globalThis & {
  __mongoClient?: MongoClient;
};

function readEnv(...names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return null;
}

export function getMongoUri(): string {
  const uri = readEnv('uri', 'MONGODB_URI', 'MONGO_URI');
  if (!uri) {
    throw new Error('Missing Mongo URI. Set one of: uri, MONGODB_URI, MONGO_URI');
  }
  return uri;
}

export function getMongoDbName(): string {
  return readEnv('MONGODB_DATABASE', 'MONGO_DB_NAME') ?? DEFAULT_DB_NAME;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter((x) => x && x.trim())));
}

export function getMongoClient(): MongoClient {
  const globalRef = globalThis as GlobalWithMongo;
  if (globalRef.__mongoClient) return globalRef.__mongoClient;

  const client = new MongoClient(getMongoUri(), {
    appName: 'mamba-ticketing',
    retryWrites: true,
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS ?? 8000),
    connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS ?? 8000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS ?? 8000),
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: false,
    },
  });

  globalRef.__mongoClient = client;
  return client;
}

export async function getTicketsCollection() {
  const client = getMongoClient();
  await client.connect();
  return client.db(getMongoDbName()).collection('tickets');
}

export async function getTicketCollectionCandidates(): Promise<Array<Collection<Document>>> {
  const client = getMongoClient();
  await client.connect();

  const dbCandidates = unique([getMongoDbName(), DEFAULT_DB_NAME, 'test']);
  const collectionCandidates = unique(['tickets', 'requests']);

  const collections: Array<Collection<Document>> = [];
  for (const dbName of dbCandidates) {
    const db = client.db(dbName);
    for (const collectionName of collectionCandidates) {
      collections.push(db.collection(collectionName));
    }
  }

  return collections;
}
