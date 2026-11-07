import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { usersCol } from "@/lib/db";
import { currentUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const current = String(body.current || "");
  const next = String(body.next || "");
  if (next.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });

  const users = await usersCol();
  const user = await users.findOne({ _id: new ObjectId(uid) });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 401 });
  }
  await users.updateOne({ _id: user._id }, { $set: { passwordHash: await bcrypt.hash(next, 10) } });
  return NextResponse.json({ ok: true });
}
