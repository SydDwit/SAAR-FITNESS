import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  // Get the pathname from the URL
  const { pathname } = req.nextUrl;
  
  // Allow API routes and public pages
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (pathname === "/login" || pathname === "/" || pathname === "/admin/login") return NextResponse.next();

  // Check authentication token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Handle unauthenticated users
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

  // Handle authenticated users - role-based access control
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      // If trying to access admin pages without admin role, redirect to admin login
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("error", "insufficient_permissions");
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith("/dashboard")) {
    if (token.role !== "staff") {
      // If trying to access staff pages without staff role, redirect to staff login
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
