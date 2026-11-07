import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { logsCol } from "@/lib/db";
import { currentUserId } from "@/lib/auth";
import { CHECK_IDS } from "@/lib/plan";

// GET: all logs of the logged-in person (max ~400 days)
export async function GET() {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const logs = await (await logsCol())
    .find({ userId: new ObjectId(uid) }, { projection: { _id: 0, userId: 0 } })
    .sort({ date: 1 })
    .limit(400)
    .toArray();
  return NextResponse.json({ logs, serverTime: Date.now() });
}

// PUT: update one day. Body: { date, check?: {id, value}, rating?, note?, reaction? }
export async function PUT(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const date = String(body.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Bad date" }, { status: 400 });

  const $set: Record<string, unknown> = { updatedAt: new Date() };
  if (body.check && CHECK_IDS.includes(body.check.id)) $set[`checks.${body.check.id}`] = !!body.check.value;
  if (typeof body.rating === "number" && body.rating >= 0 && body.rating <= 5) $set.rating = Math.round(body.rating);
  if (typeof body.note === "string") $set.note = body.note.slice(0, 1000);
  if (typeof body.reaction === "boolean") $set.reaction = body.reaction;

  await (await logsCol()).updateOne(
    { userId: new ObjectId(uid), date },
    { $set },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
