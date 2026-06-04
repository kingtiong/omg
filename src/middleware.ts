import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const ROLE_GATES: Array<{ prefix: string; role: "ADMIN" | "CUSTOMER" | "DELIVERY" }> = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/portal", role: "CUSTOMER" },
  { prefix: "/delivery", role: "DELIVERY" },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const gate = ROLE_GATES.find((g) => pathname.startsWith(g.prefix));
  if (!gate) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  if (token.role !== gate.role) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/delivery/:path*"],
};
