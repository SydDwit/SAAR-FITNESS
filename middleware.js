import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Allow public routes
  const publicPaths = [
    "/",
    "/login",
    "/admin/login",
    "/api/auth",
    "/api/memberauth",
    "/_next",
    "/favicon.ico",
    "/logo.png",
    "/images",
    "/uploads",
  ];
  
  // Check if path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Get authentication token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Also check for member token (different cookie name)
  const memberToken = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.member-session-token"
  });
  
  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    // Not authenticated - redirect to login
    if (!token) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if user has admin role
    if (token.role !== "admin") {
      const url = new URL("/unauthorized", req.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Handle member routes
  const memberRoutes = ["/member", "/profile", "/attendance", "/payments", "/membership"];
  if (memberRoutes.some(route => pathname.startsWith(route) && !pathname.startsWith("/memberauth"))) {
    if (!memberToken) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    
    // If admin/staff tries to access member routes, redirect to their dashboard
    if (memberToken.role !== "member") {
      const url = memberToken.role === "admin" ? new URL("/admin", req.url) : new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    }
    
    // If staff tries to access member routes, redirect to dashboard
    if (token.role === "staff") {
      const url = new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    }
    
    // Only members can access member routes
    if (token.role !== "member") {
      const url = new URL("/unauthorized", req.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Handle dashboard routes (staff and admin)
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    
    // Require at least staff role for dashboard
    if (token.role !== "admin" && token.role !== "staff") {
      const url = new URL("/unauthorized", req.url);
      return NextResponse.redirect(url);
    }
  }
  
  // Handle API routes that require authentication
  if (pathname.startsWith("/api/")) {
    // Skip auth routes
    if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/adminauth/") || pathname.startsWith("/api/memberauth/")) {
      return NextResponse.next();
    }
    
    // Admin-only API routes
    const adminOnlyRoutes = ["/api/staff", "/api/admin"];
    if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      if (!token || token.role !== "admin") {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Admin access required" }),
          { 
            status: 403, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // Staff or Admin API routes
    const staffRoutes = ["/api/members"];
    if (staffRoutes.some(route => pathname.startsWith(route))) {
      if (!token || (token.role !== "admin" && token.role !== "staff" && token.role !== "member")) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Authentication required" }),
          { 
            status: 403, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // Member API routes
    const memberRoutes = ["/api/member"];
    if (memberRoutes.some(route => pathname.startsWith(route))) {
      if (!token || token.role !== "member") {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden - Member access required" }),
          { 
            status: 403, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

