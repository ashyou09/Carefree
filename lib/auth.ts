import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getDb } from "./db";

export const COOKIE = "sp_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Signing key: AUTH_SECRET env var if set, otherwise a random key generated once and stored in MongoDB.
let cached: Uint8Array | null = null;
async function secret(): Promise<Uint8Array> {
  if (cached) return cached;
  const env = process.env.AUTH_SECRET;
  if (env && env.length >= 16) return (cached = new TextEncoder().encode(env));
  const db = await getDb();
  const col = db.collection<{ _id: string; value: string }>("config");
  await col.updateOne(
    { _id: "auth_secret" },
    { $setOnInsert: { value: randomBytes(32).toString("hex") } },
    { upsert: true }
  );
  const doc = await col.findOne({ _id: "auth_secret" });
  return (cached = new TextEncoder().encode(doc!.value));
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(await secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function verifyToken(token?: string): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function currentUserId(): Promise<string | null> {
  const jar = await cookies();
  return verifyToken(jar.get(COOKIE)?.value);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
