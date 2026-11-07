import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { usersCol } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!username || !password) {
    return NextResponse.json({ error: "Enter your login ID and password." }, { status: 400 });
  }
  const users = await usersCol();
  const user = await users.findOne({ username });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) {
    return NextResponse.json({ error: "Wrong login ID or password." }, { status: 401 });
  }
  await createSession(user._id.toHexString());
  return NextResponse.json({ ok: true });
}
