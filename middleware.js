import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  // Get the pathname from the URL
  const { pathname } = req.nextUrl;
  
  // Allow API routes and public pages
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (pathname === "/admin/login" || pathname === "/") return NextResponse.next();

  // Check authentication token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Handle unauthenticated users - redirect to login
  if (!token) {
    const url = new URL("/admin/login", req.url);
    return NextResponse.redirect(url);
  }

  // Only allow admin users to access protected routes
  if (token.role !== "admin") {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("error", "insufficient_permissions");
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
