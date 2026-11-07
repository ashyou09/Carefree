import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { currentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign up — Carefree" };

export default async function Page() {
  // Already logged in (valid 30-day cookie)? Skip the form.
  if (await currentUserId().catch(() => null)) redirect("/");
  return <AuthForm mode="signup" />;
}
