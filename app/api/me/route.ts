import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { usersCol } from "@/lib/db";
import { currentUserId } from "@/lib/auth";
import { PRODUCTS } from "@/lib/plan";
import { FOODS, defaultPicks } from "@/lib/foods";
import { AGE_GROUPS, DEFAULT_PROFILE, isProfile } from "@/lib/profile";

const STATUSES = ["none", "bought", "using", "low", "finished"];

// Stored profile, or the starter account's built-in one (Manorama: woman, 40s, veg + eggs).
function profileOf(user: { username: string; profile?: unknown }) {
  if (isProfile(user.profile as never)) return user.profile;
  return user.username === (process.env.SEED_USERNAME || "manorama").toLowerCase() ? { gender: "female", age: "40s", diet: "egg" } : null;
}

export async function GET() {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const user = await (await usersCol()).findOne({ _id: new ObjectId(uid) });
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json({
    name: user.name,
    username: user.username,
    startDate: user.startDate,
    productStatus: user.productStatus || {},
    // Manorama's starter account: 40s, female, veg + eggs
    profile: profileOf(user),
    foodPicks: Array.isArray(user.foodPicks) ? user.foodPicks : null,
  });
}

export async function PATCH(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ""> = {};
  const users = await usersCol();
  const _id = new ObjectId(uid);

  if (typeof body.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) {
    $set.startDate = body.startDate;
  }
  if (typeof body.name === "string" && body.name.trim()) $set.name = body.name.trim().slice(0, 60);
  // only bought/using/low/finished are stored; "not bought" removes the entry
  if (body.product && typeof body.product.id === "string" && STATUSES.includes(body.product.status)) {
    if (PRODUCTS.some((p) => p.id === body.product.id)) {
      if (body.product.status === "none") $unset[`productStatus.${body.product.id}`] = "";
      else $set[`productStatus.${body.product.id}`] = body.product.status;
    }
  }
  const pr = body.profile;
  if (pr && ["female", "male"].includes(pr.gender) && AGE_GROUPS.includes(pr.age) && ["veg", "egg", "nonveg"].includes(pr.diet)) {
    $set.profile = { gender: pr.gender, age: pr.age, diet: pr.diet };
  }
  // food plan: stored only when it differs from the default plan for this profile
  if (Array.isArray(body.foodPicks)) {
    const ok = new Set(FOODS.map((f) => f.id));
    const picks = [...new Set(body.foodPicks.filter((x: unknown) => typeof x === "string" && ok.has(x as string)))] as string[];
    const user = await users.findOne({ _id }, { projection: { username: 1, profile: 1 } });
    const prof = (($set.profile as never) || (user && profileOf(user)) || DEFAULT_PROFILE) as never;
    const def = defaultPicks(prof);
    const same = picks.length === def.length && def.every((x) => picks.includes(x));
    if (same) $unset.foodPicks = ""; else $set.foodPicks = picks;
  }
  if (!Object.keys($set).length && !Object.keys($unset).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;
  await users.updateOne({ _id }, update);
  return NextResponse.json({ ok: true });
}
