# RBAC Setup Guide

## Quick Start

This guide will help you set up role-based access control for your SAAR FITNESS application.

## Prerequisites

- Node.js installed
- MongoDB running
- Existing Next.js application

## Step 1: Environment Configuration

Create or update your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# MongoDB Connection Strings
MONGODB_URI_ADMIN=mongodb://127.0.0.1:27017/saarfitness_admin
MONGODB_URI_STAFF=mongodb://127.0.0.1:27017/saarfitness_staff
MONGODB_URI_MEMBERS=mongodb://127.0.0.1:27017/saarfitness_members
```

**Generate NEXTAUTH_SECRET:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32
```

## Step 2: Run Database Migration

Update existing users with the new `isActive` field:

```bash
npm run migrate
```

Expected output:
```
🔄 Starting migration: Adding isActive field to users...
✓ Updated X admin users
✓ Updated X staff users
✅ Migration completed successfully
```

## Step 3: Create Your First Admin User

```bash
npm run create-admin
```

Follow the prompts:
```
=================================
   SAAR FITNESS Admin Creator    
=================================

Enter admin name: Super Admin
Enter admin email: admin@saarfitness.com
Enter admin password: ****************

✅ Admin user created successfully!
```

## Step 4: Test the Implementation

### Start the Development Server

```bash
npm run dev
```

### Test Authentication

1. Navigate to `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. You should be redirected to the admin dashboard

### Test Authorization

#### Test 1: Unauthorized Access
1. Open an incognito/private browser window
2. Try to access: `http://localhost:3000/admin`
3. ✅ Expected: Redirected to login page

#### Test 2: Admin Access
1. Login as admin user
2. Access: `http://localhost:3000/admin/staff`
3. ✅ Expected: Staff management page loads

#### Test 3: API Protection
Open browser console and run:
```javascript
// Without authentication
fetch('/api/admin/users')
  .then(r => r.json())
  .then(console.log);
// ✅ Expected: {error: "Unauthorized - Authentication required"}

// After login (with valid session)
fetch('/api/admin/users')
  .then(r => r.json())
  .then(console.log);
// ✅ Expected: {admins: [...], staff: [...]}
```

## Step 5: Create Staff Users (Optional)

Once logged in as admin, you can create staff users through the admin panel at:
```
http://localhost:3000/admin/staff/new
```

Or via API:
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Staff User",
    "email": "staff@saarfitness.com",
    "password": "securePassword123",
    "role": "staff"
  }'
```

## Verification Checklist

- [ ] Environment variables configured
- [ ] Migration script executed successfully
- [ ] First admin user created
- [ ] Can login as admin user
- [ ] Unauthorized users redirected to login
- [ ] Admin routes accessible to admin users
- [ ] API endpoints return proper status codes (401, 403)
- [ ] Cannot access admin routes by typing URL directly

## Common Issues

### Issue: Cannot login
**Check:**
- MongoDB is running
- User exists in Admin collection
- Password is correct
- NEXTAUTH_SECRET is set

### Issue: Redirected to unauthorized page
**Check:**
- User has correct role in database
- JWT token includes role field
- Session callbacks are configured correctly

### Issue: API returns 403
**Check:**
- You are logged in
- Your user has the required role
- Session cookie is being sent with request

## Security Recommendations

### Production Deployment

1. **Use HTTPS**
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. **Secure Cookies**
   NextAuth automatically uses secure cookies in production when NEXTAUTH_URL uses HTTPS

3. **Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Use a password manager

4. **Regular Updates**
   ```bash
   npm audit
   npm update
   ```

5. **Monitor Logs**
   - Failed login attempts
   - Unauthorized access attempts
   - Role changes

6. **Backup Database**
   ```bash
   mongodump --db saarfitness_admin
   mongodump --db saarfitness_staff
   mongodump --db saarfitness_members
   ```

## File Structure

The RBAC implementation consists of:

```
lib/
  ├── rbac.js              # Authorization utilities
  ├── auth.js              # NextAuth configuration
  ├── models.js            # Updated with role fields
  └── db.js                # Database connections

app/
  ├── unauthorized/        # 403 error page
  │   └── page.jsx
  └── api/
      ├── admin/           # Admin-only endpoints
      │   └── users/
      │       └── route.js # User management API
      ├── members/         # Staff/Admin endpoints
      │   └── route.js     # Updated with RBAC
      └── staff/           # Admin-only endpoints
          └── route.js     # Updated with RBAC

middleware.js              # Route protection
scripts/
  ├── create-admin.js      # Admin creation utility
  └── migrate-add-isactive.js  # Migration script

RBAC-DOCUMENTATION.md      # Comprehensive documentation
```

## Next Steps

1. Review [RBAC-DOCUMENTATION.md](./RBAC-DOCUMENTATION.md) for detailed information
2. Customize the unauthorized page with your branding
3. Add audit logging for compliance
4. Implement password reset functionality
5. Add two-factor authentication (2FA)
6. Set up monitoring and alerts

## Support

For detailed documentation, see [RBAC-DOCUMENTATION.md](./RBAC-DOCUMENTATION.md)

For implementation details, review:
- [lib/rbac.js](./lib/rbac.js) - Authorization helpers
- [middleware.js](./middleware.js) - Route protection
- [lib/auth.js](./lib/auth.js) - Authentication config

## Testing in Production

Before deploying to production:

1. Test all user roles
2. Verify middleware protection
3. Test API endpoint security
4. Check error pages
5. Verify session management
6. Test logout functionality
7. Check redirect flows

## Rollback Plan

If you need to rollback:

1. Restore previous `middleware.js`
2. Restore previous API route files
3. Revert database schema changes if needed

Keep backups of:
- Database dumps
- Previous code version
- Environment variables

---

**✅ Setup Complete!**

Your admin dashboard is now secured with role-based access control.
