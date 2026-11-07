import { MongoClient, Db, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export type UserDoc = {
  _id: ObjectId;
  username: string; // lowercase, unique
  name: string;
  passwordHash: string;
  startDate: string; // YYYY-MM-DD (IST)
  productStatus: Record<string, string>;
  createdAt: Date;
};

export type LogDoc = {
  _id?: ObjectId;
  userId: ObjectId;
  date: string; // YYYY-MM-DD
  checks: Record<string, boolean>;
  rating?: number;
  note?: string;
  reaction?: boolean;
  updatedAt: Date;
};

const g = globalThis as unknown as { _mongo?: Promise<MongoClient>; _setup?: Promise<void> };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!g._mongo) g._mongo = new MongoClient(uri, { maxPoolSize: 5 }).connect();
  return g._mongo;
}

export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

async function setup(db: Db) {
  const users = db.collection<UserDoc>("users");
  await users.createIndex({ username: 1 }, { unique: true });
  await db.collection<LogDoc>("logs").createIndex({ userId: 1, date: 1 }, { unique: true });

  const username = (process.env.SEED_USERNAME || "manorama").toLowerCase();
  const password = process.env.SEED_PASSWORD || "12345678";
  const exists = await users.findOne({ username });
  if (!exists) {
    await users.insertOne({
      _id: new ObjectId(),
      username,
      name: process.env.SEED_NAME || "Manorama",
      passwordHash: await bcrypt.hash(password, 10),
      startDate: todayIST(),
      productStatus: {},
      createdAt: new Date(),
    }).catch(() => {}); // another request may have created it first
  }
}

export async function getDb(): Promise<Db> {
  const c = await client();
  const db = c.db(process.env.MONGODB_DB || "skinplan");
  if (!g._setup) g._setup = setup(db).catch((e) => { g._setup = undefined; throw e; });
  await g._setup;
  return db;
}

export async function usersCol() {
  return (await getDb()).collection<UserDoc>("users");
}
export async function logsCol() {
  return (await getDb()).collection<LogDoc>("logs");
}
