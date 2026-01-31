# SAAR FITNESS

Next.js 14 + Tailwind + MongoDB membership system with **Role-Based Access Control (RBAC)**.

## Features
- 🔐 **Secure RBAC** - Admin and Staff roles with proper authorization
- 👤 Staff and Admin login with NextAuth JWT authentication
- 📝 Add members with photo upload or camera capture
- 📊 Auto-BMI calculation, subscription tracking, and status management
- 🔍 Search and sort members
- ⏰ Expiration checker with optional email notifications
- 🛡️ Protected routes and API endpoints
- 📱 Admin CRUD for staff and members

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.template .env.local
# Edit .env.local with your configuration
```

Required environment variables:
```env
NEXTAUTH_SECRET=your-32-character-secret-key
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI_ADMIN=mongodb://127.0.0.1:27017/saarfitness_admin
MONGODB_URI_STAFF=mongodb://127.0.0.1:27017/saarfitness_staff
MONGODB_URI_MEMBERS=mongodb://127.0.0.1:27017/saarfitness_members
```

### 3. Create Admin User
```bash
npm run create-admin
```

### 4. Run Migration (if updating from previous version)
```bash
npm run migrate
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access Admin Panel
Navigate to `http://localhost:3000/admin/login` and login with your admin credentials.

## 🔐 Security Features

### Role-Based Access Control
- **Admin Role**: Full system access, can manage staff and members
- **Staff Role**: Can manage members, limited access
- **Member Role**: Reserved for future member portal

### Multi-Layer Protection
1. **Middleware Layer**: Route-level authentication and authorization
2. **API Layer**: Endpoint-level role validation
3. **Session Layer**: JWT token with role information
4. **Database Layer**: Role persistence and audit trail

### Security Best Practices
- ✅ Server-side authorization (no frontend-only checks)
- ✅ JWT-based authentication with NextAuth
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Proper HTTP status codes (401, 403)
- ✅ Protection against URL manipulation
- ✅ Secure session management

## 📚 Documentation

- **[RBAC-QUICK-REFERENCE.md](RBAC-QUICK-REFERENCE.md)** - Quick reference for common tasks
- **[RBAC-SETUP.md](RBAC-SETUP.md)** - Step-by-step setup guide
- **[RBAC-DOCUMENTATION.md](RBAC-DOCUMENTATION.md)** - Comprehensive technical documentation
- **[RBAC-SECURITY-FLOW.md](RBAC-SECURITY-FLOW.md)** - Security architecture diagrams
- **[RBAC-IMPLEMENTATION-SUMMARY.md](RBAC-IMPLEMENTATION-SUMMARY.md)** - Implementation summary

## 🛠️ Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run create-admin     # Create a new admin user
npm run migrate          # Run database migrations
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Admin Management (Admin Only)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create admin/staff user
- `PATCH /api/admin/users?id=xxx` - Update user
- `DELETE /api/admin/users?id=xxx` - Delete user

### Members (Staff/Admin)
- `GET /api/members` - List members
- `POST /api/members` - Create member
- `PATCH /api/members?id=xxx` - Update member
- `DELETE /api/members?id=xxx` - Delete member

### Staff (Admin Only)
- `GET /api/staff` - List staff
- `POST /api/staff` - Create staff member
- `DELETE /api/staff?id=xxx` - Delete staff

### Subscriptions (Staff/Admin)
- `POST /api/subscriptions/check` - Check expired subscriptions

## 🗂️ Project Structure

```
app/
  ├── admin/              # Admin routes (admin only)
  │   ├── members/        # Member management
  │   ├── staff/          # Staff management
  │   ├── reports/        # Reports
  │   └── login/          # Admin login
  ├── dashboard/          # Staff dashboard (staff/admin)
  ├── unauthorized/       # 403 error page
  ├── api/
  │   ├── admin/          # Admin-only endpoints
  │   ├── members/        # Member endpoints
  │   ├── staff/          # Staff endpoints
  │   └── auth/           # Authentication
  └── components/         # Shared components

lib/
  ├── auth.js            # NextAuth configuration
  ├── rbac.js            # Authorization utilities
  ├── models.js          # Database models
  ├── db.js              # Database connections
  └── mail.js            # Email utilities

scripts/
  ├── create-admin.js    # Admin creation utility
  └── migrate-add-isactive.js  # Migration script

middleware.js            # Route protection
```

## 🔧 Configuration

### Database Structure
The system uses separate MongoDB databases for better security:
- **Admin Database**: Stores admin users with full system access
- **Staff Database**: Stores staff users with limited access
- **Members Database**: Stores member data and subscriptions

### Authentication
- NextAuth v4 with JWT strategy
- Session includes user role for authorization
- Secure token with HMAC signature
- Configurable session expiry

## 📝 Notes

### Production Deployment
- Use HTTPS for `NEXTAUTH_URL`
- Generate a strong `NEXTAUTH_SECRET` (32+ characters)
- Use secure MongoDB credentials
- Enable security headers
- Set up rate limiting
- Configure monitoring and logging

### File Uploads
- Photos are saved to `/public/uploads`
- Ensure the folder exists and has write permissions
- Consider using cloud storage (S3, Cloudinary) for production

### Subscription Checker
- Runs when staff dashboard loads
- Can be triggered via `POST /api/subscriptions/check`
- Wire to a cron job in production for automated checks

### Email Notifications
- Configure SMTP settings in `.env.local`
- Staff receive notifications for expired subscriptions
- Optional feature, works without SMTP config

## 🧪 Testing

### Test Authentication
1. Try accessing `/admin` without login → Should redirect to login
2. Login with staff credentials → Should not access `/admin/staff`
3. Login with admin credentials → Should access all routes

### Test API Security
```javascript
// Without authentication
fetch('/api/admin/users').then(r => r.json()).then(console.log);
// Expected: {error: "Unauthorized"}

// With admin authentication
fetch('/api/admin/users').then(r => r.json()).then(console.log);
// Expected: {admins: [...], staff: [...]}
```

## 🐛 Troubleshooting

### Cannot Login
- Ensure MongoDB is running
- Check user exists in Admin collection
- Verify `NEXTAUTH_SECRET` is set
- Check password is correct

### Redirected to Unauthorized
- Verify user has correct role in database
- Check JWT token includes role field
- Verify session callbacks are configured

### API Returns 403
- Ensure you're logged in
- Check your user has required role
- Verify session cookie is being sent

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - feel free to use this project for commercial or personal use.

## 🙏 Acknowledgments

- Built with Next.js 14, Tailwind CSS, and MongoDB
- Authentication powered by NextAuth
- UI components with Tailwind and Lucide icons

---

**Version:** 2.0  
**Last Updated:** January 31, 2026  
**Status:** Production Ready with RBAC ✅
