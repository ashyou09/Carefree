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
    await db.command({ ping: 1 });
    const users = await db.collection("users").countDocuments();
    return NextResponse.json({ ok: true, db: "connected", database: db.databaseName, users, ms: Date.now() - started });
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
