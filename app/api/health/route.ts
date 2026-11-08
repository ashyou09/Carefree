import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public health check: says whether the database is reachable. Never returns secrets.
export async function GET() {
  const started = Date.now();
  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ ok: false, db: "MONGODB_URI is not set in Vercel" }, { status: 500 });
  }
  try {
    const db = await getDb();
    const t0 = Date.now();
    await db.command({ ping: 1 });
    const pingMs = Date.now() - t0;
    const users = await db.collection("users").estimatedDocumentCount();
    // Atlas tags its servers with the cloud region; shown so the app server can run next to the database.
    const hello = await db.admin().command({ hello: 1 }).catch(() => ({} as Record<string, unknown>));
    const tags = (hello as { tags?: Record<string, string> }).tags || {};
    return NextResponse.json({
      ok: true, db: "connected", database: db.databaseName, users,
      ms: Date.now() - started, pingMs,
      dbRegion: tags.region || null, dbProvider: tags.provider || null,
      appRegion: process.env.VERCEL_REGION || null,
    });
  } catch (e) {
    const msg = (e as Error).message || "unknown error";
    // strip anything that looks like a connection string
    const safe = msg.replace(/mongodb(\+srv)?:\/\/\S+/g, "[uri]");
    let hint = "";
    if (/auth|Authentication failed|bad auth/i.test(msg)) hint = "Wrong database username or password in MONGODB_URI.";
    else if (/ENOTFOUND|querySrv/i.test(msg)) hint = "Cluster address in MONGODB_URI is wrong.";
    else if (/timed out|Server selection/i.test(msg)) hint = "Cluster paused or IP not allowed in Atlas Network Access.";
    console.error("health check failed:", safe);
    return NextResponse.json({ ok: false, db: "error", error: safe, hint }, { status: 500 });
  }
}
