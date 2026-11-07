import { NextRequest, NextResponse } from "next/server";

// Light check only: is there a session cookie? The real signature check
// happens in the API routes (Node runtime), which return 401 for a bad
// cookie; the app then sends the person to /login.
const PUBLIC = ["/login", "/signup", "/api/auth/login", "/api/auth/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = !!req.cookies.get("sp_session")?.value;
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  if (!hasCookie && !isPublic) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
