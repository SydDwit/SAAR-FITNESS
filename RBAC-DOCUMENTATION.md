# Role-Based Access Control (RBAC) Documentation

## Overview

This system implements a secure, production-ready role-based access control mechanism for the SAAR FITNESS admin dashboard using Next.js and NextAuth.

## User Roles

The system supports three distinct user roles with hierarchical permissions:

### 1. Admin (`admin`)
- **Full system access**
- Can manage all aspects of the application
- Can create, modify, and delete staff accounts
- Can perform all member operations
- Can access all admin routes and API endpoints

### 2. Staff (`staff`)
- **Limited administrative access**
- Can manage members (create, view, update)
- Can check subscription status
- **Cannot** create or delete staff accounts
- **Cannot** access admin-only routes

### 3. Member (`member`)
- **Reserved for future member portal implementation**
- Currently stored in member schema for data integrity
- No direct login access in current implementation

## Architecture

### Database Schema

#### User Schema (Admin & Staff)
```javascript
{
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin","staff","member"], required: true },
  notifyEmail: String,
  isActive: { type: Boolean, default: true },
  timestamps: true
}
```

#### Member Schema
```javascript
{
  name: String,
  // ... other member fields
  role: { type: String, enum: ["member"], default: "member" },
  createdById: ObjectId (reference to Staff)
}
```

### Authentication Flow

1. **Login** → User provides credentials at `/admin/login`
2. **Verification** → NextAuth validates credentials against Admin collection
3. **Token Generation** → JWT token created with user role embedded
4. **Session Creation** → Session includes role information
5. **Authorization** → Middleware and API routes validate role before access

### Security Layers

#### Layer 1: Middleware Protection
File: `middleware.js`

- Intercepts all requests before they reach routes
- Validates JWT tokens
- Checks user roles for route access
- Redirects unauthorized users appropriately

Protected route patterns:
- `/admin/*` → Admin role required
- `/dashboard/*` → Staff or Admin role required
- `/api/admin/*` → Admin role required (API)
- `/api/staff/*` → Admin role required (API)
- `/api/members/*` → Staff or Admin role required (API)

#### Layer 2: API Route Protection
File: `lib/rbac.js`

All API endpoints validate authorization using helper functions:

```javascript
import { requireAdmin, requireStaffOrAdmin } from "@/lib/rbac";

export async function GET() {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Proceed with authorized logic
}
```

#### Layer 3: Session Management

NextAuth JWT strategy with role embedding:

```javascript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = user.role;
      token.id = user.id;
    }
    return token;
  },
  async session({ session, token }) {
    session.user.role = token.role;
    session.user.id = token.id;
    return session;
  },
}
```

## Authorization Utilities

### Core Functions (`lib/rbac.js`)

#### `requireAdmin()`
Validates that the current user has admin role.

**Returns:**
- `{ authorized: true, session }` - Success
- `{ authorized: false, status: 401, error: "..." }` - Unauthorized
- `{ authorized: false, status: 403, error: "..." }` - Forbidden

**Usage:**
```javascript
const authCheck = await requireAdmin();
if (!authCheck.authorized) {
  return new Response(JSON.stringify({ error: authCheck.error }), {
    status: authCheck.status
  });
}
```

#### `requireStaffOrAdmin()`
Validates that the current user has staff or admin role.

**Returns:** Same structure as `requireAdmin()`

#### `hasRole(userRole, requiredRole)`
Checks if a user role meets minimum requirement.

**Usage:**
```javascript
if (hasRole(session.user.role, ROLES.STAFF)) {
  // User is staff or higher
}
```

#### `withAdminAuth(handler)`
HOC wrapper for API routes requiring admin access.

**Usage:**
```javascript
export const GET = withAdminAuth(async (req, context, session) => {
  // session is automatically available
  return Response.json({ data: "..." });
});
```

## API Endpoints

### Admin Management API

#### `GET /api/admin/users`
List all admin and staff users.

**Authorization:** Admin only

**Response:**
```json
{
  "admins": [
    { "id": "...", "name": "...", "email": "...", "role": "admin" }
  ],
  "staff": [
    { "id": "...", "name": "...", "email": "...", "role": "staff" }
  ]
}
```

#### `POST /api/admin/users`
Create a new admin or staff user.

**Authorization:** Admin only

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "admin" // or "staff"
}
```

**Response:**
```json
{
  "ok": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

#### `PATCH /api/admin/users?id=xxx&currentRole=admin`
Update user role or active status.

**Authorization:** Admin only

**Request:**
```json
{
  "isActive": false,
  "role": "staff"
}
```

#### `DELETE /api/admin/users?id=xxx&role=admin`
Delete a user account.

**Authorization:** Admin only

**Notes:** Cannot delete your own account

### Protected API Routes

#### Members API (`/api/members`)
- **GET** - List members (Staff/Admin)
- **POST** - Create member (Staff/Admin)
- **PATCH** - Update member (Staff/Admin)
- **DELETE** - Delete member (Staff/Admin)

#### Staff API (`/api/staff`)
- **GET** - List staff (Admin only)
- **POST** - Create staff (Admin only)
- **DELETE** - Delete staff (Admin only)

#### Subscriptions API (`/api/subscriptions/check`)
- **POST** - Check expired subscriptions (Staff/Admin)

## Route Protection

### Admin Routes (`/admin/*`)
All routes under `/admin` require admin role:
- `/admin` - Admin dashboard
- `/admin/members` - Member management
- `/admin/staff` - Staff management
- `/admin/reports` - Reports

### Dashboard Routes (`/dashboard/*`)
Requires staff or admin role:
- `/dashboard` - User dashboard
- `/dashboard/new` - Create new entries

### Public Routes
- `/` - Home page
- `/admin/login` - Login page

### Error Routes
- `/unauthorized` - 403 Forbidden page

## Security Best Practices

### ✅ Implemented

1. **No Frontend-Only Checks**
   - All authorization happens server-side
   - JWT tokens validated on every request

2. **Defense in Depth**
   - Multiple layers: Middleware + API validation
   - Cannot bypass by direct URL access

3. **Proper HTTP Status Codes**
   - `401 Unauthorized` - Not authenticated
   - `403 Forbidden` - Authenticated but insufficient permissions

4. **Password Security**
   - Passwords hashed with bcryptjs (10 rounds)
   - Never transmitted or stored in plain text

5. **Session Security**
   - JWT strategy with secure secrets
   - HttpOnly cookies in production
   - Session tokens include minimal data

6. **Role Persistence**
   - Roles stored in database
   - Embedded in JWT for fast validation
   - Validated against DB for sensitive operations

7. **Audit Trail**
   - `createdById` tracks who created records
   - Timestamps on all user operations

### 🔒 Additional Recommendations

1. **Environment Variables**
   ```env
   NEXTAUTH_SECRET=your-long-random-secret-here
   NEXTAUTH_URL=https://yourdomain.com
   MONGODB_URI_ADMIN=mongodb://...
   ```

2. **Password Policy**
   - Enforce minimum password length (8+ characters)
   - Require complexity (uppercase, lowercase, numbers)
   - Implement password change on first login

3. **Rate Limiting**
   - Implement rate limiting on login endpoint
   - Prevent brute force attacks

4. **Logging & Monitoring**
   - Log all authentication attempts
   - Monitor for suspicious activity
   - Alert on multiple failed logins

5. **Session Expiry**
   - Configure appropriate JWT expiry times
   - Implement refresh token rotation

## Migration & Setup

### Initial Setup

1. **Install Dependencies**
   ```bash
   npm install next-auth bcryptjs jsonwebtoken
   ```

2. **Configure Environment Variables**
   Create `.env.local`:
   ```env
   NEXTAUTH_SECRET=generate-a-strong-random-secret
   NEXTAUTH_URL=http://localhost:3000
   MONGODB_URI_ADMIN=mongodb://127.0.0.1:27017/saarfitness_admin
   MONGODB_URI_STAFF=mongodb://127.0.0.1:27017/saarfitness_staff
   MONGODB_URI_MEMBERS=mongodb://127.0.0.1:27017/saarfitness_members
   ```

3. **Run Migration**
   ```bash
   node scripts/migrate-add-isactive.js
   ```

4. **Create First Admin User**
   ```bash
   # Use MongoDB shell or create via API
   # Ensure at least one admin exists before enabling strict RBAC
   ```

### Creating Admin Users

#### Method 1: Via API (if you have an existing admin session)
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "securePassword123",
    "role": "admin"
  }'
```

#### Method 2: Direct Database Insert
```javascript
// scripts/create-admin.js
import { Admin } from "../lib/models.js";
import bcrypt from "bcryptjs";

const passwordHash = await bcrypt.hash("yourPassword", 10);
await Admin.create({
  name: "Super Admin",
  email: "admin@saarfitness.com",
  passwordHash,
  role: "admin",
  isActive: true
});
```

## Testing RBAC

### Test Cases

1. **Unauthorized Access**
   - Try accessing `/admin` without login
   - Expected: Redirect to `/admin/login`

2. **Insufficient Permissions**
   - Login as staff user
   - Try accessing `/admin/staff`
   - Expected: Redirect to `/unauthorized`

3. **API Protection**
   - Call `/api/admin/users` without authentication
   - Expected: `401 Unauthorized`

4. **Direct URL Access**
   - Type `/admin/reports` in browser without login
   - Expected: Middleware intercepts and redirects

5. **Token Tampering**
   - Modify JWT token role in browser dev tools
   - Expected: Token validation fails, redirected to login

### Manual Testing Script

```bash
# Test 1: Unauthenticated API call
curl http://localhost:3000/api/admin/users
# Expected: {"error":"Unauthorized - Authentication required"}

# Test 2: Login as admin
curl -X POST http://localhost:3000/api/auth/signin/credentials \
  -d "email=admin@example.com&password=yourPassword"

# Test 3: Authenticated API call (use cookie from login)
curl http://localhost:3000/api/admin/users \
  --cookie "next-auth.session-token=..."
# Expected: List of users

# Test 4: Try staff endpoint as non-admin
# Expected: {"error":"Forbidden - Admin access required"}
```

## Troubleshooting

### Issue: "Unauthorized" on valid admin login
**Solution:** Check that:
1. User exists in Admin collection
2. User has `role: "admin"` field
3. JWT callbacks include role in token
4. Environment variable `NEXTAUTH_SECRET` is set

### Issue: Infinite redirect loop
**Solution:** Verify:
1. `/admin/login` is in public paths list
2. Middleware doesn't protect auth routes
3. Session cookie domain matches app domain

### Issue: 403 Forbidden for admin users
**Solution:** Check:
1. Token includes correct role
2. Session callback propagates role to session.user
3. Middleware role check matches expected role

### Issue: Can't create first admin user
**Solution:**
1. Temporarily disable RBAC middleware
2. Create admin via direct DB insert
3. Re-enable RBAC middleware

## Code Examples

### Protecting a New API Route

```javascript
// app/api/example/route.js
import { requireAdmin } from "@/lib/rbac";

export async function GET(req) {
  const authCheck = await requireAdmin();
  if (!authCheck.authorized) {
    return new Response(JSON.stringify({ error: authCheck.error }), {
      status: authCheck.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Your protected logic here
  const session = authCheck.session;
  return Response.json({ 
    message: "Protected data",
    user: session.user.email 
  });
}
```

### Using Auth in Server Components

```javascript
// app/admin/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

### Client-Side Role Check

```javascript
"use client";
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Loading...</div>;
  
  if (!session) return <div>Please log in</div>;
  
  const isAdmin = session.user.role === "admin";
  
  return (
    <div>
      {isAdmin && <AdminControls />}
      <UserContent />
    </div>
  );
}
```

## Summary

This RBAC implementation provides:

- ✅ Secure, multi-layered authorization
- ✅ Role-based access to routes and APIs
- ✅ JWT-based authentication with NextAuth
- ✅ Database-persisted roles
- ✅ Proper HTTP status codes
- ✅ Protection against URL manipulation
- ✅ Admin user management API
- ✅ Migration scripts for updates
- ✅ Comprehensive documentation

All routes and APIs are protected server-side, ensuring security cannot be bypassed through frontend manipulation.
