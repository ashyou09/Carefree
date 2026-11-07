import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { usersCol, todayIST } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 60);
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!/^[a-z0-9_.]{3,30}$/.test(username)) {
    return NextResponse.json(
      { error: "Login ID must be 3–30 characters: letters, numbers, dot or underscore." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const users = await usersCol();
  const _id = new ObjectId();
  try {
    await users.insertOne({
      _id,
      username,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      startDate: todayIST(),
      productStatus: {},
      createdAt: new Date(),
    });
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "This login ID is already taken." }, { status: 409 });
    }
    throw e;
  }
  await createSession(_id.toHexString());
  return NextResponse.json({ ok: true });
}
