import { getServerSession } from "next-auth";
import { authOptions } from "./auth.js";
import { memberAuthOptions } from "./memberAuth.js";

/**
 * Role hierarchy and permissions
 */
export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  MEMBER: "member",
};

/**
 * Check if a user has the required role
 */
export function hasRole(userRole, requiredRole) {
  if (!userRole) return false;
  
  // Role hierarchy: admin > staff > member
  const hierarchy = {
    admin: 3,
    staff: 2,
    member: 1,
  };
  
  return hierarchy[userRole] >= hierarchy[requiredRole];
}

/**
 * Get current session with role information (admin/staff)
 */
export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Get current member session
 */
export async function getMemberSession() {
  const session = await getServerSession(memberAuthOptions);
  return session;
}

/**
 * Verify admin access - returns session or throws
 */
export async function requireAdmin() {
  const session = await getCurrentSession();
  
  if (!session) {
    return { authorized: false, status: 401, error: "Unauthorized - Authentication required" };
  }
  
  if (session.user?.role !== ROLES.ADMIN) {
    return { authorized: false, status: 403, error: "Forbidden - Admin access required" };
  }
  
  return { authorized: true, session };
}

/**
 * Verify staff or admin access
 */
export async function requireStaffOrAdmin() {
  const session = await getCurrentSession();
  
  if (!session) {
    return { authorized: false, status: 401, error: "Unauthorized - Authentication required" };
  }
  
  const userRole = session.user?.role;
  if (!hasRole(userRole, ROLES.STAFF)) {
    return { authorized: false, status: 403, error: "Forbidden - Staff or Admin access required" };
  }
  
  return { authorized: true, session };
}

/**
 * Verify member access - returns session or throws
 */
export async function requireMember() {
  const session = await getMemberSession();
  
  if (!session) {
    return { authorized: false, status: 401, error: "Unauthorized - Authentication required" };
  }
  
  if (session.user?.role !== ROLES.MEMBER) {
    return { authorized: false, status: 403, error: "Forbidden - Member access required" };
  }
  
  return { authorized: true, session };
}

/**
 * Verify authenticated user (any role)
 */
export async function requireAuthenticated() {
  const session = await getCurrentSession();
  
  if (!session) {
    return { authorized: false, status: 401, error: "Unauthorized - Authentication required" };
  }
  
  return { authorized: true, session };
}

/**
 * Middleware helper to check authorization
 */
export async function checkAuth(requiredRole = ROLES.MEMBER) {
  const session = await getCurrentSession();
  
  if (!session) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }
  
  if (!hasRole(session.user?.role, requiredRole)) {
    return { authorized: false, status: 403, error: "Forbidden - Insufficient permissions" };
  }
  
  return { authorized: true, session };
}

/**
 * Create a Response object for unauthorized access
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create a Response object for forbidden access
 */
export function forbiddenResponse(message = "Forbidden - Insufficient permissions") {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Wrapper for API routes that require admin access
 */
export function withAdminAuth(handler) {
  return async (req, context) => {
    const authCheck = await requireAdmin();
    
    if (!authCheck.authorized) {
      return new Response(JSON.stringify({ error: authCheck.error }), {
        status: authCheck.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Pass session to handler
    return handler(req, context, authCheck.session);
  };
}

/**
 * Wrapper for API routes that require member access
 */
export function withMemberAuth(handler) {
  return async (req, context) => {
    const authCheck = await requireMember();
    
    if (!authCheck.authorized) {
      return new Response(JSON.stringify({ error: authCheck.error }), {
        status: authCheck.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return handler(req, context, authCheck.session);
  };
}

/**
 * Validate data ownership for member
 */
export function validateMemberOwnership(session, resourceOwnerId) {
  if (!session?.user?.id) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }
  
  if (session.user.role === ROLES.ADMIN || session.user.role === ROLES.STAFF) {
    // Admin and staff can access all data
    return { authorized: true };
  }
  
  if (session.user.role === ROLES.MEMBER) {
    // Members can only access their own data
    if (session.user.id !== resourceOwnerId?.toString()) {
      return { authorized: false, status: 403, error: "Forbidden - You can only access your own data" };
    }
  }
  
  return { authorized: true };
}

