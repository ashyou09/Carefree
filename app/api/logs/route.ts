import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { logsCol } from "@/lib/db";
import { currentUserId } from "@/lib/auth";
import { CHECK_IDS } from "@/lib/plan";
import { FOODS, LIFESTYLE } from "@/lib/foods";

const VALID = new Set([...CHECK_IDS, ...LIFESTYLE.map((s) => s.id), ...FOODS.map((f) => `f_${f.id}`)]);

// GET: all day logs of the logged-in person, expanded to the shape the app uses.
export async function GET() {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const docs = await (await logsCol())
    .find({ u: new ObjectId(uid) }, { projection: { _id: 0, u: 0 } })
    .sort({ d: 1 })
    .limit(400)
    .toArray();
  const logs = docs.map((x) => ({
    date: x.d,
    checks: Object.fromEntries((x.c || []).map((id) => [id, true])),
    ...(x.r ? { rating: x.r } : {}),
    ...(x.n ? { note: x.n } : {}),
    ...(x.x ? { reaction: true } : {}),
  }));
  return NextResponse.json({ logs, serverTime: Date.now() });
}

// PUT: change one day. Body: { date, check?: {id, value}, rating?, note?, reaction? }
// Only "on" things are stored; turning something off removes it, and an empty day is deleted.
export async function PUT(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const d = String(body.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return NextResponse.json({ error: "Bad date" }, { status: 400 });
  const u = new ObjectId(uid);

  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ""> = {};
  const $addToSet: Record<string, unknown> = {};
  const $pull: Record<string, unknown> = {};

  if (body.check && VALID.has(body.check.id)) {
    if (body.check.value) $addToSet.c = body.check.id;
    else $pull.c = body.check.id;
  }
  if (typeof body.rating === "number") {
    const r = Math.round(body.rating);
    if (r >= 1 && r <= 5) $set.r = r; else $unset.r = "";
  }
  if (typeof body.note === "string") {
    const n = body.note.trim() ? body.note.slice(0, 1000) : "";
    if (n) $set.n = n; else $unset.n = "";
  }
  if (typeof body.reaction === "boolean") {
    if (body.reaction) $set.x = true; else $unset.x = "";
  }

  const update: Record<string, unknown> = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;
  if (Object.keys($addToSet).length) update.$addToSet = $addToSet;
  if (Object.keys($pull).length) update.$pull = $pull;
  if (!Object.keys(update).length) return NextResponse.json({ ok: true });

  const col = await logsCol();
  const adds = !!(update.$set || update.$addToSet);
  await col.updateOne({ u, d }, update, { upsert: adds }); // never create a doc just to remove something

  if (!adds) {
    // delete the whole day if nothing is left in it
    await col.deleteOne({
      u, d,
      r: { $exists: false }, n: { $exists: false }, x: { $exists: false },
      $or: [{ c: { $exists: false } }, { c: { $size: 0 } }],
    });
  }
  return NextResponse.json({ ok: true });
}
