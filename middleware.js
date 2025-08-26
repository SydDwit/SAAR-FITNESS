import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (pathname === "/login" || pathname === "/" || pathname === "/admin/login") return NextResponse.next();
  if (!token) {
    // Direct to appropriate login page based on the path
    if (pathname.startsWith("/admin")) {
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    } else {
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }
  }
  // role gating
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
