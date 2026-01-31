# RBAC Security Flow

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER REQUEST                                │
│                    (Access /admin/members)                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE (middleware.js)                       │
│                                                                     │
│  Step 1: Extract JWT Token from Cookie                             │
│  ┌────────────────────────────────────────────────┐                │
│  │ const token = await getToken({ req, secret }); │                │
│  └────────────────────────────────────────────────┘                │
│                             │                                       │
│                             ▼                                       │
│  Step 2: Check if Token Exists                                     │
│  ┌─────────┐              ┌─────────┐                              │
│  │ Token?  │──── No ─────▶│ 401     │──▶ Redirect to /admin/login │
│  └─────────┘              └─────────┘                              │
│       │ Yes                                                         │
│       ▼                                                             │
│  Step 3: Validate Role for Route                                   │
│  ┌──────────────────┐    ┌─────────┐                               │
│  │ token.role ===   │─No─▶│ 403     │──▶ Redirect to /unauthorized │
│  │ "admin"?         │    └─────────┘                               │
│  └──────────────────┘                                               │
│       │ Yes                                                         │
│       ▼                                                             │
│  ✅ PASS - Continue to Route                                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     ROUTE HANDLER (Page or API)                     │
│                                                                     │
│  For API Routes - Additional Validation:                           │
│  ┌──────────────────────────────────────────────────┐              │
│  │ const authCheck = await requireAdmin();          │              │
│  │ if (!authCheck.authorized) {                     │              │
│  │   return Response.json(                          │              │
│  │     { error: authCheck.error },                  │              │
│  │     { status: authCheck.status }                 │              │
│  │   );                                             │              │
│  │ }                                                │              │
│  └──────────────────────────────────────────────────┘              │
│                             │                                       │
│                             ▼                                       │
│  ✅ Execute Protected Business Logic                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE OPERATION                             │
│                                                                     │
│  Query executed with authenticated user context                    │
│  ┌──────────────────────────────────────────────────┐              │
│  │ - User ID: session.user.id                       │              │
│  │ - User Role: session.user.role                   │              │
│  │ - Timestamp: new Date()                          │              │
│  └──────────────────────────────────────────────────┘              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RESPONSE TO CLIENT                             │
└─────────────────────────────────────────────────────────────────────┘
```

## JWT Token Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      JWT TOKEN                              │
│                                                             │
│  Header                                                     │
│  ┌──────────────────────────────────────┐                  │
│  │ {                                    │                  │
│  │   "alg": "HS256",                    │                  │
│  │   "typ": "JWT"                       │                  │
│  │ }                                    │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
│  Payload                                                    │
│  ┌──────────────────────────────────────┐                  │
│  │ {                                    │                  │
│  │   "id": "507f1f77bcf86cd799439011",  │ ◄─ User ID      │
│  │   "name": "Admin User",              │ ◄─ User Name    │
│  │   "email": "admin@example.com",      │ ◄─ Email        │
│  │   "role": "admin",                   │ ◄─ ROLE (KEY!)  │
│  │   "iat": 1640000000,                 │ ◄─ Issued At    │
│  │   "exp": 1642592000                  │ ◄─ Expires At   │
│  │ }                                    │                  │
│  └──────────────────────────────────────┘                  │
│                                                             │
│  Signature                                                  │
│  ┌──────────────────────────────────────┐                  │
│  │ HMACSHA256(                          │                  │
│  │   base64UrlEncode(header) + "." +    │                  │
│  │   base64UrlEncode(payload),          │                  │
│  │   NEXTAUTH_SECRET                    │                  │
│  │ )                                    │                  │
│  └──────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Session Object Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     SESSION OBJECT                          │
│  (Available in Server Components & API Routes)              │
│                                                             │
│  const session = await getServerSession(authOptions);       │
│                                                             │
│  session = {                                                │
│    user: {                                                  │
│      id: "507f1f77bcf86cd799439011",    ◄─ MongoDB ID      │
│      name: "Admin User",                ◄─ Display Name    │
│      email: "admin@example.com",        ◄─ Email Address   │
│      role: "admin"                      ◄─ User Role       │
│    },                                                       │
│    expires: "2024-12-31T23:59:59.999Z"  ◄─ Session Expiry  │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Role Validation Process

```
┌─────────────────────────────────────────────────────────────┐
│               requireAdmin() Function Flow                  │
│                                                             │
│  1. Get Session                                             │
│     ┌──────────────────────────────────────┐               │
│     │ const session =                      │               │
│     │   await getServerSession();          │               │
│     └──────────────────────────────────────┘               │
│                    │                                        │
│                    ▼                                        │
│  2. Check Authentication                                    │
│     ┌──────────────┐                                        │
│     │ session?     │───No──▶ Return 401 Unauthorized       │
│     └──────────────┘                                        │
│            │ Yes                                            │
│            ▼                                                │
│  3. Check Role                                              │
│     ┌────────────────────┐                                  │
│     │ session.user.role  │───No──▶ Return 403 Forbidden    │
│     │ === "admin"?       │                                  │
│     └────────────────────┘                                  │
│            │ Yes                                            │
│            ▼                                                │
│  4. Return Success                                          │
│     ┌──────────────────────────────────────┐               │
│     │ return {                             │               │
│     │   authorized: true,                  │               │
│     │   session: session                   │               │
│     │ }                                    │               │
│     └──────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Layer Security Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         LAYER 1: MIDDLEWARE                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Intercepts ALL requests before reaching routes            │ │
│  │  • Validates JWT token existence                             │ │
│  │  • Checks role for route access                              │ │
│  │  • Returns 401/403 or redirects                              │ │
│  │  • Protection: URL manipulation, direct access               │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                      LAYER 2: ROUTE HANDLERS                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Server-side session validation                            │ │
│  │  • Additional role checks in page components                 │ │
│  │  • Redirect to unauthorized if needed                        │ │
│  │  • Protection: Component-level access                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                        LAYER 3: API ROUTES                         │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • requireAdmin() or requireStaffOrAdmin()                   │ │
│  │  • Backend authorization validation                          │ │
│  │  • Return 401/403 JSON responses                             │ │
│  │  • Protection: API endpoint security                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    LAYER 4: DATABASE LAYER                         │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  • Role persisted in database                                │ │
│  │  • Audit trail with createdById                              │ │
│  │  • Data integrity validation                                 │ │
│  │  • Protection: Data-level security                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## HTTP Status Code Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST SCENARIOS                        │
└─────────────────────────────────────────────────────────────┘

Scenario 1: No Authentication
────────────────────────────
Request: GET /admin/members
Token: ❌ None

Flow:
  Middleware → Check Token → Not Found
  Response: 302 Redirect → /admin/login
  Status: 302 Found

────────────────────────────

Scenario 2: Wrong Role
────────────────────────────
Request: GET /admin/staff
Token: ✅ Valid (role: "staff")

Flow:
  Middleware → Check Token → Found → Check Role → "staff" ≠ "admin"
  Response: 302 Redirect → /unauthorized
  Status: 403 Forbidden

────────────────────────────

Scenario 3: Correct Role
────────────────────────────
Request: GET /admin/members
Token: ✅ Valid (role: "admin")

Flow:
  Middleware → Check Token → Found → Check Role → "admin" === "admin"
  Route Handler → Execute → Return Data
  Response: 200 OK

────────────────────────────

Scenario 4: API - No Auth
────────────────────────────
Request: GET /api/admin/users
Token: ❌ None

Flow:
  Middleware → Block (403)
  OR
  API Route → requireAdmin() → No Session
  Response: { "error": "Unauthorized" }
  Status: 401 Unauthorized

────────────────────────────

Scenario 5: API - Wrong Role
────────────────────────────
Request: POST /api/staff
Token: ✅ Valid (role: "staff")

Flow:
  Middleware → Pass
  API Route → requireAdmin() → Check Role → "staff" ≠ "admin"
  Response: { "error": "Forbidden - Admin access required" }
  Status: 403 Forbidden

────────────────────────────

Scenario 6: API - Correct Role
────────────────────────────
Request: POST /api/admin/users
Token: ✅ Valid (role: "admin")

Flow:
  Middleware → Pass
  API Route → requireAdmin() → Check Role → "admin" === "admin"
  Database Operation → Success
  Response: { "ok": true, "user": {...} }
  Status: 200 OK
```

## Role Hierarchy Visualization

```
                    ┌─────────────────┐
                    │                 │
                    │     ADMIN       │
                    │   (Level 3)     │
                    │                 │
                    └────────┬────────┘
                             │
                             │ Can do everything Staff can do, PLUS:
                             │ • Create/delete staff
                             │ • Access /admin/staff
                             │ • Modify system settings
                             │ • View all audit logs
                             │
                    ┌────────▼────────┐
                    │                 │
                    │     STAFF       │
                    │   (Level 2)     │
                    │                 │
                    └────────┬────────┘
                             │
                             │ Can do everything Member can do, PLUS:
                             │ • Create/edit/delete members
                             │ • Access /dashboard/*
                             │ • Check subscriptions
                             │ • View reports
                             │
                    ┌────────▼────────┐
                    │                 │
                    │     MEMBER      │
                    │   (Level 1)     │
                    │                 │
                    └─────────────────┘
                             │
                             │ Future: Member portal
                             │ • View own profile
                             │ • Update personal info
                             │ • Check subscription status
```

## Security Validation Checklist

```
✅ Authentication Layer
   ├─ JWT token validation
   ├─ Token signature verification
   ├─ Token expiry check
   └─ Session cookie security

✅ Authorization Layer
   ├─ Role extracted from token
   ├─ Role validated against requirement
   ├─ Hierarchical role checking
   └─ Database role verification

✅ Transport Layer
   ├─ HTTPS in production (recommended)
   ├─ Secure cookie flags
   ├─ HttpOnly cookies
   └─ SameSite cookie policy

✅ Data Layer
   ├─ Password hashing (bcrypt)
   ├─ Role persistence in DB
   ├─ Audit trail (createdById)
   └─ Input validation

✅ Application Layer
   ├─ Middleware protection
   ├─ API route protection
   ├─ Server component checks
   └─ Client-side UI adaptation
```
