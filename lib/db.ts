import { MongoClient, Db, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export type UserDoc = {
  _id: ObjectId;
  username: string; // lowercase, unique
  name: string;
  passwordHash: string;
  startDate: string; // YYYY-MM-DD (IST)
  productStatus: Record<string, string>;
  profile?: Record<string, unknown>;
  prodPicks?: Record<string, string>;
  foodPicks?: string[];
  createdAt: Date;
};

// Compact day log: short field names, only what is set. An empty day is deleted.
export type LogDoc = {
  _id?: ObjectId;
  u: ObjectId;   // user id
  d: string;     // date YYYY-MM-DD
  c?: string[];  // ticked step ids (unticked = removed)
  r?: number;    // skin rating 1–5
  n?: string;    // diary note
  x?: true;      // reaction flag (absent = no reaction)
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
  const logs = db.collection("logs");
  // one-time move from the old, longer log format
  const old = await logs.find({ userId: { $exists: true } }).toArray();
  if (old.length || (await logs.indexExists("userId_1_date_1").catch(() => false))) {
    await logs.dropIndex("userId_1_date_1").catch(() => {});
    for (const o of old) {
      const c = Object.entries(o.checks || {}).filter(([, v]) => v).map(([k]) => k);
      const doc: Record<string, unknown> = { u: o.userId, d: o.date };
      if (c.length) doc.c = c;
      if (o.rating) doc.r = o.rating;
      if (o.note) doc.n = o.note;
      if (o.reaction) doc.x = true;
      await logs.deleteOne({ _id: o._id });
      if (Object.keys(doc).length > 2) await logs.insertOne(doc).catch(() => {});
    }
  }
  await logs.createIndex({ u: 1, d: 1 }, { unique: true });

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
