import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { usersCol, logsCol, todayIST } from "@/lib/db";
import { currentUserId } from "@/lib/auth";

// Deletes THIS person's saved progress (all day logs + product statuses) and restarts Day 1 today.
// The account and password stay; other people's data is never touched.
export async function POST() {
  const uid = await currentUserId();
  if (!uid) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const deleted = await (await logsCol()).deleteMany({ u: new ObjectId(uid) });
  await (await usersCol()).updateOne(
    { _id: new ObjectId(uid) },
    { $set: { startDate: todayIST(), productStatus: {} }, $unset: { foodPicks: "", prodPicks: "" } }
  );
  return NextResponse.json({ ok: true, deleted: deleted.deletedCount });
}
