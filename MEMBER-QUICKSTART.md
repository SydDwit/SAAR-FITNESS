# Member Portal - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up and test the member portal in 5 minutes.

## Prerequisites

- MongoDB running locally or remote connection
- Node.js and npm installed
- Existing SAAR-FITNESS project

## Step-by-Step Setup

### 1. Install Dependencies (if not already done)

```bash
npm install
```

### 2. Configure Environment Variables

Create or update `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/saar-fitness
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 3. Create a Test Member

Use the credentials script or MongoDB shell:

**Option A: Using Script (Interactive)**
```bash
node scripts/add-member-credentials.js
```
Select option 2 (Add credentials to a single member) or option 1 (Add to all members).

**Option B: Using MongoDB Shell**
```javascript
use saar-fitness

// First, create a test member (if you don't have one)
db.members.insertOne({
  name: "Test Member",
  email: "member@test.com",
  // Password: "password123" hashed with bcrypt (10 rounds)
  passwordHash: "$2a$10$YourHashedPasswordHere",
  phoneNumber: "1234567890",
  age: 25,
  gender: "male",
  planType: "Premium",
  feeAmount: 5000,
  subscriptionStartDate: new Date(),
  subscriptionEndDate: new Date(Date.now() + 30*24*60*60*1000), // 30 days
  subscriptionStatus: "active",
  weightKg: 70,
  heightCm: 175,
  bmi: 22.86,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Generate Password Hash:**
```bash
node -e "console.log(require('bcryptjs').hashSync('password123', 10))"
```

### 4. Add Sample Data (Optional but Recommended)

**Sample Attendance Records:**
```javascript
db.attendances.insertMany([
  {
    memberId: ObjectId("YOUR_MEMBER_ID"),
    checkInTime: new Date(),
    checkOutTime: new Date(Date.now() + 2*60*60*1000), // 2 hours later
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Add more as needed
])
```

**Sample Payment Records:**
```javascript
db.payments.insertMany([
  {
    memberId: ObjectId("YOUR_MEMBER_ID"),
    amount: 5000,
    paymentDate: new Date(),
    paymentMethod: "card",
    status: "completed",
    notes: "Monthly membership fee",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Add more as needed
])
```

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Test the Member Portal

1. **Open your browser** and navigate to: `http://localhost:3000/login`

2. **Login** with your test credentials:
   - Email: `member@test.com`
   - Password: `password123` (or whatever you set)

3. **You should be redirected** to: `http://localhost:3000/member`

4. **Test all pages:**
   - Dashboard: `/member`
   - Profile: `/profile`
   - Attendance: `/attendance`
   - Payments: `/payments`
   - Membership: `/membership`

## 🧪 Quick Test Checklist

- [ ] Login page loads at `/login`
- [ ] Can login with member credentials
- [ ] Redirects to `/member` dashboard after login
- [ ] Dashboard shows membership status
- [ ] Profile page displays member information
- [ ] Can edit weight and height in profile
- [ ] Attendance page shows visit history
- [ ] Payments page shows transaction history
- [ ] Membership page shows subscription details
- [ ] Navigation works between all pages
- [ ] Sign out button works

## 🔐 User Roles & Access

The application has three user types with different access:

| Role | Login URL | Dashboard URL | Access Level |
|------|-----------|---------------|--------------|
| **Member** | `/login` | `/member` | Own data only |
| **Staff** | `/admin/login` | `/dashboard` | All member data |
| **Admin** | `/admin/login` | `/admin` | Full system access |

**Routing Logic:**
- Members accessing `/admin` or `/dashboard` → Redirected to `/member`
- Staff accessing `/member` → Redirected to `/dashboard`
- Admin accessing `/member` → Redirected to `/admin`
- Unauthenticated users → Redirected to appropriate login page

## 📁 Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Member auth config | `lib/memberAuth.js` |
| RBAC utilities | `lib/rbac.js` |
| Database models | `lib/models.js` |
| Route protection | `middleware.js` |
| Login page | `app/login/page.jsx` |
| Member dashboard | `app/member/page.jsx` |
| Profile page | `app/profile/page.jsx` |
| Attendance page | `app/attendance/page.jsx` |
| Payments page | `app/payments/page.jsx` |
| Membership page | `app/membership/page.jsx` |
| Layout component | `app/components/MemberLayout.jsx` |
| Credentials script | `scripts/add-member-credentials.js` |

## 🔧 Troubleshooting

### Issue: Login fails with "Invalid credentials"

**Solutions:**
1. Check email is correct in database
2. Verify `passwordHash` field exists
3. Ensure `isActive` is `true`
4. Confirm password was hashed with bcrypt (10 rounds)

### Issue: Redirected to login after successful login

**Solutions:**
1. Check `NEXTAUTH_SECRET` is set in `.env.local`
2. Verify `NEXTAUTH_URL` matches your domain
3. Clear browser cookies
4. Check browser console for errors

### Issue: Dashboard shows no data

**Solutions:**
1. Add sample attendance and payment records
2. Verify `memberId` references are correct
3. Check MongoDB connection
4. Look at browser console for API errors

### Issue: Can't update profile

**Solutions:**
1. Check API endpoint is accessible: `/api/member/profile`
2. Verify member ID matches session
3. Look at network tab for error response
4. Check weightKg and heightCm are valid numbers

## 📊 API Endpoints Quick Reference

All endpoints require authentication (member session).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/member/profile` | Get member profile |
| PATCH | `/api/member/profile` | Update weight/height |
| GET | `/api/member/attendance` | Get attendance history |
| GET | `/api/member/payments` | Get payment history |
| GET | `/api/member/membership` | Get membership info |

**Query Parameters for Pagination:**
- `limit`: Number of records (default: 10)
- `skip`: Number of records to skip (default: 0)

**Example:**
```
GET /api/member/attendance?limit=20&skip=0
GET /api/member/payments?limit=20&skip=20
```

## 🎨 Customization

### Change Brand Colors

Edit `app/components/MemberLayout.jsx`:
```javascript
// Change navigation bar color
className="bg-indigo-600" // Change to your color

// Change hover states
hover:bg-indigo-700 // Change to match
```

### Change Items Per Page

Edit individual page files:
```javascript
const limit = 20; // Change to your preferred default
```

### Add More Fields to Profile

1. Update `app/profile/page.jsx` to include new fields
2. Update `app/api/member/profile/route.js` to handle new fields
3. Ensure fields exist in Member schema

## 📚 Documentation

- **Complete Guide**: See `MEMBER-PORTAL.md`
- **RBAC System**: See `RBAC-*.md` files
- **NextAuth Docs**: https://next-auth.js.org/
- **Next.js Docs**: https://nextjs.org/docs

## 🚦 Next Steps

After basic setup:

1. **Add Real Members**: Use the script to add credentials to all existing members
2. **Test All Features**: Go through the complete test checklist
3. **Customize Branding**: Update colors, logos, and text
4. **Add Sample Data**: Create realistic attendance and payment records for testing
5. **Review Security**: Read RBAC documentation for security best practices
6. **Deploy**: Follow Next.js deployment guide when ready

## 💡 Tips

- **Development**: Keep MongoDB and Next.js logs visible for debugging
- **Testing**: Create multiple test members with different scenarios (active, expired, etc.)
- **Data**: Add variety in test data (different payment statuses, workout times, etc.)
- **Mobile**: Test responsive design on different screen sizes
- **Security**: Never commit `.env.local` to version control

## ✅ Success Criteria

Your member portal is working correctly when:

- ✅ Members can login with email/password
- ✅ Dashboard displays accurate membership information
- ✅ Members can view their attendance history
- ✅ Members can view their payment history
- ✅ Members can update their weight and height
- ✅ Navigation works seamlessly between all pages
- ✅ Only authorized members can access their own data
- ✅ Sign out properly clears the session

## 🆘 Need Help?

If you're stuck:

1. Check the browser console for errors
2. Review server logs for API errors
3. Verify MongoDB data structure
4. Read the complete documentation in `MEMBER-PORTAL.md`
5. Review RBAC documentation for authorization issues

---

**Happy coding! 🎉**
