import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { usersCol } from "@/lib/db";
import { currentUserId } from "@/lib/auth";
import { FOODS, defaultPicks as defaultFood } from "@/lib/foods";
import { CATALOG, ROLES, defaultPicks as defaultProducts, type Role } from "@/lib/routine";
import { DEFAULT_PROFILE, SEED_PROFILE, cleanProfile, type Profile } from "@/lib/profile";

const STATUSES = ["none", "bought", "using", "low", "finished"];
const seedName = () => (process.env.SEED_USERNAME || "manorama").toLowerCase();

// Stored profile (old ones are filled in), or the starter account's built-in one.
function profileOf(user: { username: string; profile?: unknown }): Profile | null {
  const base = user.username === seedName() ? SEED_PROFILE : DEFAULT_PROFILE;
  if (user.profile) return cleanProfile(user.profile, base);
  return user.username === seedName() ? SEED_PROFILE : null;
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
    profile: profileOf(user),
    foodPicks: Array.isArray(user.foodPicks) ? user.foodPicks : null,
    prodPicks: user.prodPicks || {},
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
  const user = await users.findOne({ _id }, { projection: { username: 1, profile: 1 } });
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  if (typeof body.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) $set.startDate = body.startDate;
  if (typeof body.name === "string" && body.name.trim()) $set.name = body.name.trim().slice(0, 60);

  // product status: only bought/using/low/finished are stored
  if (body.product && typeof body.product.id === "string" && STATUSES.includes(body.product.status) && CATALOG.some((p) => p.id === body.product.id)) {
    if (body.product.status === "none") $unset[`productStatus.${body.product.id}`] = "";
    else $set[`productStatus.${body.product.id}`] = body.product.status;
  }

  let prof = profileOf(user) || DEFAULT_PROFILE;
  if (body.profile) {
    const p = cleanProfile(body.profile, prof);
    if (p) {
      if ((p.goal || "auto") !== (prof.goal || "auto")) $unset.prodPicks = ""; // new routine style = fresh suggestions
      $set.profile = p; prof = p;
    }
  }

  // product choice per routine step: stored only when different from the suggestion
  if (body.prodPick && body.prodPick.role in ROLES) {
    const role = body.prodPick.role as Role;
    const id = body.prodPick.id;
    const valid = id === "none" || CATALOG.some((p) => p.id === id && p.role === role);
    if (id === null || (valid && defaultProducts(prof)[role] === id) || (id === "none" && !defaultProducts(prof)[role])) $unset[`prodPicks.${role}`] = "";
    else if (valid) $set[`prodPicks.${role}`] = id;
  }

  // food plan: stored only when different from the default plan
  if (Array.isArray(body.foodPicks)) {
    const ok = new Set(FOODS.map((f) => f.id));
    const picks = [...new Set(body.foodPicks.filter((x: unknown) => typeof x === "string" && ok.has(x as string)))] as string[];
    const def = defaultFood(prof);
    if (picks.length === def.length && def.every((x) => picks.includes(x))) $unset.foodPicks = ""; else $set.foodPicks = picks;
  }

  const update: Record<string, unknown> = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;
  if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  await users.updateOne({ _id }, update);
  return NextResponse.json({ ok: true });
}
