# RBAC Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Create first admin user
npm run create-admin

# Run migration (add isActive field)
npm run migrate

# Start development server
npm run dev
```

## 🔐 Environment Variables (Required)

```env
NEXTAUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI_ADMIN=mongodb://127.0.0.1:27017/saarfitness_admin
MONGODB_URI_STAFF=mongodb://127.0.0.1:27017/saarfitness_staff
MONGODB_URI_MEMBERS=mongodb://127.0.0.1:27017/saarfitness_members
```

## 👥 User Roles

| Role | Level | Permissions |
|------|-------|-------------|
| **admin** | 3 | Full access - manage staff, members, all routes |
| **staff** | 2 | Manage members, view reports, limited access |
| **member** | 1 | Reserved for future use |

## 🛡️ Protected Routes

| Route Pattern | Required Role | Redirect On Fail |
|--------------|---------------|------------------|
| `/admin/*` | admin | `/admin/login` or `/unauthorized` |
| `/dashboard/*` | staff or admin | `/admin/login` or `/unauthorized` |
| `/api/admin/*` | admin | 403 Forbidden |
| `/api/staff/*` | admin | 403 Forbidden |
| `/api/members/*` | staff or admin | 403 Forbidden |

## 📝 Code Snippets

### Protect API Route (Admin Only)
```javascript
import { requireAdmin } from "@/lib/rbac";

export async function GET(req) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Your code here
  return Response.json({ data: "..." });
}
```

### Protect API Route (Staff or Admin)
```javascript
import { requireStaffOrAdmin } from "@/lib/rbac";

export async function POST(req) {
  const authCheck = await requireStaffOrAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Your code here
  const session = authCheck.session;
  return Response.json({ ok: true });
}
```

### Check Role in Server Component
```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  
  return <div>Admin Content</div>;
}
```

### Check Role in Client Component
```javascript
"use client";
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  
  return (
    <div>
      {isAdmin && <AdminFeature />}
      <UserFeature />
    </div>
  );
}
```

## 🔧 Available Functions (lib/rbac.js)

| Function | Purpose | Returns |
|----------|---------|---------|
| `requireAdmin()` | Validate admin access | `{authorized, session}` or `{authorized, status, error}` |
| `requireStaffOrAdmin()` | Validate staff/admin | Same as above |
| `hasRole(userRole, requiredRole)` | Check role hierarchy | `boolean` |
| `withAdminAuth(handler)` | HOC for admin routes | Wrapped handler |
| `withStaffAuth(handler)` | HOC for staff routes | Wrapped handler |

## 📡 Admin API Endpoints

### List Users
```bash
GET /api/admin/users
Authorization: Required (admin)
Response: { admins: [...], staff: [...] }
```

### Create User
```bash
POST /api/admin/users
Authorization: Required (admin)
Body: {
  "name": "User Name",
  "email": "user@example.com",
  "password": "securePass123",
  "role": "admin" | "staff"
}
Response: { ok: true, user: {...} }
```

### Update User
```bash
PATCH /api/admin/users?id=xxx&currentRole=admin
Authorization: Required (admin)
Body: {
  "role": "staff",
  "isActive": false
}
Response: { ok: true, user: {...} }
```

### Delete User
```bash
DELETE /api/admin/users?id=xxx&role=admin
Authorization: Required (admin)
Response: { ok: true, message: "User deleted successfully" }
```

## 🔍 Testing Checklist

- [ ] Unauthenticated user redirected to login
- [ ] Staff cannot access `/admin/staff`
- [ ] Admin can access all routes
- [ ] API returns 401 when not authenticated
- [ ] API returns 403 when insufficient permissions
- [ ] Cannot bypass protection by typing URL
- [ ] Session includes role information
- [ ] JWT token validated on each request

## 🚨 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful request |
| 302 | Found (Redirect) | Unauthenticated user → login |
| 401 | Unauthorized | No authentication token |
| 403 | Forbidden | Authenticated but insufficient role |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal error |

## 📂 Key Files

| File | Purpose |
|------|---------|
| `lib/rbac.js` | Authorization utilities |
| `lib/auth.js` | NextAuth configuration |
| `middleware.js` | Route protection |
| `app/unauthorized/page.jsx` | 403 error page |
| `app/api/admin/users/route.js` | User management API |
| `scripts/create-admin.js` | Admin creation utility |

## 🐛 Troubleshooting

### Can't login
- Check MongoDB is running
- Verify user exists with correct role
- Check `NEXTAUTH_SECRET` is set
- Verify password is correct

### Redirected to unauthorized
- Check user role in database
- Verify JWT token includes role
- Check session callbacks

### API returns 403
- Verify you're logged in
- Check your user role
- Ensure session cookie is sent

## 📚 Documentation

- **Setup Guide**: [RBAC-SETUP.md](RBAC-SETUP.md)
- **Full Documentation**: [RBAC-DOCUMENTATION.md](RBAC-DOCUMENTATION.md)
- **Implementation Summary**: [RBAC-IMPLEMENTATION-SUMMARY.md](RBAC-IMPLEMENTATION-SUMMARY.md)
- **Security Flow**: [RBAC-SECURITY-FLOW.md](RBAC-SECURITY-FLOW.md)

## 🎯 Quick Tips

1. **Always validate on the server** - Never rely on client-side checks alone
2. **Use `requireAdmin()` in API routes** - Don't skip authorization checks
3. **Check role in middleware** - First line of defense
4. **Keep secrets secure** - Never commit `.env.local`
5. **Use HTTPS in production** - Protect tokens in transit
6. **Monitor failed logins** - Detect brute force attacks
7. **Regular backups** - Backup user database regularly

## 🔒 Security Layers

```
1. Middleware     → Checks all requests
2. Route Handler  → Server component validation
3. API Route      → Backend authorization
4. Database       → Role persistence & audit
```

## ⚡ Performance Tips

- JWT tokens are stateless (fast validation)
- Middleware runs on edge (low latency)
- Session data cached in token
- No database call on every request

## 📞 Emergency Contacts

If security breach suspected:
1. Revoke all sessions (change `NEXTAUTH_SECRET`)
2. Force password reset for all admins
3. Review audit logs
4. Check database for unauthorized changes

---

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Status:** Production Ready ✅
