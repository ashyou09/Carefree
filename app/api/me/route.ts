import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { usersCol } from "@/lib/db";
import { currentUserId } from "@/lib/auth";
import { PRODUCTS } from "@/lib/plan";

const STATUSES = ["none", "bought", "using", "low", "finished"];

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
  });
}

export async function PATCH(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const $set: Record<string, unknown> = {};

  if (typeof body.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.startDate)) {
    $set.startDate = body.startDate;
  }
  if (typeof body.name === "string" && body.name.trim()) $set.name = body.name.trim().slice(0, 60);
  if (body.product && typeof body.product.id === "string" && STATUSES.includes(body.product.status)) {
    if (PRODUCTS.some((p) => p.id === body.product.id)) {
      $set[`productStatus.${body.product.id}`] = body.product.status;
    }
  }
  if (!Object.keys($set).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  await (await usersCol()).updateOne({ _id: new ObjectId(uid) }, { $set });
  return NextResponse.json({ ok: true });
}
