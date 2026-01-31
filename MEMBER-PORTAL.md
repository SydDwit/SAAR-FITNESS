# Member Portal Documentation

## Overview

The SAAR-FITNESS application now includes a complete member-facing portal that allows gym members to:
- Log in with their credentials
- View their membership details
- Track attendance history
- Review payment history
- Update personal information

This document provides a comprehensive guide for understanding and using the member portal.

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication](#authentication)
3. [User Interface](#user-interface)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Security](#security)
7. [Setup & Configuration](#setup--configuration)
8. [Testing](#testing)

---

## Architecture

### Route Structure

The application uses a clear separation of routes based on user roles:

- **Admin Interface**: `/admin/*` - For administrators only
- **Staff Interface**: `/dashboard` - For staff and admin users
- **Member Interface**: `/member/*`, `/profile`, `/attendance`, `/payments`, `/membership` - For gym members

### Authentication Flow

```
Member Login (/login)
    ↓
NextAuth Validation (lib/memberAuth.js)
    ↓
JWT Token Created (with role: "member")
    ↓
Middleware Protection (middleware.js)
    ↓
Member Dashboard (/member)
```

### Component Architecture

```
MemberLayout (Navigation + Layout)
    ├── Member Dashboard (/member)
    ├── Profile Page (/profile)
    ├── Attendance Page (/attendance)
    ├── Payments Page (/payments)
    └── Membership Page (/membership)
```

---

## Authentication

### Member Authentication System

The member portal uses NextAuth v4 with a credentials provider configured specifically for members.

**Configuration File**: `lib/memberAuth.js`

```javascript
// Key features:
- Credentials provider (email + password)
- bcrypt password verification
- JWT strategy with role embedding
- Session management with member data
- Active status checking (isActive: true)
```

### Authentication Endpoints

- **Login Route**: `/api/memberauth/[...nextauth]`
- **Login Page**: `/login`
- **Sign In URL**: `/login`
- **Redirect After Login**: `/member`

### Session Structure

```javascript
{
  user: {
    id: "member_id",
    name: "John Doe",
    email: "john@example.com",
    role: "member"
  },
  expires: "ISO_DATE_STRING"
}
```

---

## User Interface

### 1. Login Page (`/login`)

**File**: `app/login/page.jsx`

Features:
- Email and password input fields
- Form validation
- Error message display
- Loading state during authentication
- Link to admin/staff login
- Responsive design

### 2. Member Dashboard (`/member`)

**File**: `app/member/page.jsx`

Features:
- Welcome banner with member name
- 4 status cards:
  - Membership status (days remaining)
  - Payment status (paid amount)
  - Attendance count (total visits)
  - Current plan type
- Grid layout with 4 sections:
  - Recent attendance (last 5 visits)
  - Recent payments (last 5 transactions)
  - Profile summary (personal info)
  - Trainer information
- Auto-refresh data on mount
- Loading spinners
- Empty state handling

### 3. Profile Page (`/profile`)

**File**: `app/profile/page.jsx`

Features:
- View personal information
- Edit mode for weight and height
- Auto-calculation of BMI on save
- Read-only fields: name, email, age, gender, plan type
- Editable fields: weight (kg), height (cm)
- Success/error message display
- Form validation

### 4. Attendance Page (`/attendance`)

**File**: `app/attendance/page.jsx`

Features:
- Table view of all gym visits
- Columns: Date, Check-in Time, Check-out Time, Duration
- Pagination (20 records per page)
- Total visit count display
- Empty state for no records
- Responsive table design
- Duration calculation in minutes

### 5. Payments Page (`/payments`)

**File**: `app/payments/page.jsx`

Features:
- Summary cards showing:
  - Total amount paid
  - Total number of transactions
- Table view of payment history
- Columns: Date, Amount, Method, Status, Notes
- Status badges (completed, pending, failed)
- Pagination (20 records per page)
- Empty state for no payments
- Responsive design

### 6. Membership Page (`/membership`)

**File**: `app/membership/page.jsx`

Features:
- Premium card design with gradient header
- Membership status badge (active/expired/pending)
- Key information display:
  - Plan type
  - Start and end dates
  - Days remaining (with color coding)
  - Fee amount
- Alert banners:
  - Expired membership warning (red)
  - Expiring soon warning (yellow, when ≤7 days)
- Contact information section
- Responsive layout

### 7. Navigation Layout (`MemberLayout`)

**File**: `app/components/MemberLayout.jsx`

Features:
- Responsive navigation bar
- Brand logo and name
- Navigation links:
  - Dashboard
  - Profile
  - Attendance
  - Payments
  - Membership
- User info display (name, email)
- Sign out button
- Mobile menu toggle
- Active route highlighting

---

## API Endpoints

All member API endpoints are located in `/api/member/*` and require member authentication.

### 1. Profile Endpoint

**File**: `app/api/member/profile/route.js`

```
GET /api/member/profile
```
- Returns member profile excluding passwordHash
- Response: `{ ...memberData }`

```
PATCH /api/member/profile
```
- Updates weight and height
- Auto-recalculates BMI
- Body: `{ weightKg: number, heightCm: number }`
- Response: `{ ok: true, member: {...} }`

### 2. Attendance Endpoint

**File**: `app/api/member/attendance/route.js`

```
GET /api/member/attendance?limit=10&skip=0
```
- Returns paginated attendance records
- Sorted by date (newest first)
- Query params:
  - `limit`: Records per page (default: 10)
  - `skip`: Records to skip (default: 0)
- Response:
```javascript
{
  attendance: [...],
  total: number,
  hasMore: boolean
}
```

### 3. Payments Endpoint

**File**: `app/api/member/payments/route.js`

```
GET /api/member/payments?limit=10&skip=0
```
- Returns paginated payment records
- Calculates total amount paid (completed only)
- Query params: Same as attendance
- Response:
```javascript
{
  payments: [...],
  total: number,
  totalPaid: number,
  hasMore: boolean
}
```

### 4. Membership Endpoint

**File**: `app/api/member/membership/route.js`

```
GET /api/member/membership
```
- Returns membership details
- Calculates days remaining
- Determines if expired
- Response:
```javascript
{
  ...memberData,
  daysRemaining: number,
  isExpired: boolean
}
```

---

## Database Schema

### Member Schema

**File**: `lib/models.js`

```javascript
{
  name: String (required),
  email: String (unique, required for login),
  passwordHash: String (bcrypt hashed),
  phoneNumber: String,
  age: Number,
  gender: String (enum: ["male", "female", "other"]),
  address: String,
  emergencyContact: String,
  planType: String,
  feeAmount: Number,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  subscriptionStatus: String (enum: ["active", "expired", "pending"]),
  weightKg: Number,
  heightCm: Number,
  bmi: Number,
  assignedTrainerId: ObjectId (ref: "Staff"),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Schema

```javascript
{
  memberId: ObjectId (ref: "Member", required),
  checkInTime: Date (required),
  checkOutTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Schema

```javascript
{
  memberId: ObjectId (ref: "Member", required),
  amount: Number (required),
  paymentDate: Date (required),
  paymentMethod: String (enum: ["cash", "card", "upi", "bank_transfer"]),
  status: String (enum: ["completed", "pending", "failed"]),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security

### Data Scoping

All member API endpoints enforce strict data scoping:

```javascript
// Members can only access their own data
const memberId = session.user.id;
const data = await Model.find({ memberId });
```

### Authorization Layers

1. **Middleware Protection** (`middleware.js`)
   - Validates JWT token
   - Checks role = "member"
   - Redirects unauthorized users

2. **API Route Protection** (RBAC utilities)
   - `requireMember()`: Validates member role
   - Returns 401 if not authenticated
   - Returns 403 if not a member

3. **Ownership Validation**
   - `validateMemberOwnership()`: Ensures resource belongs to logged-in member
   - Prevents cross-member data access

### Password Security

- Passwords hashed using bcrypt with 10 rounds
- Password hash never returned in API responses
- No password reset functionality (managed by staff)

### Session Security

- JWT tokens with expiration
- HTTP-only cookies
- Separate cookie namespace for member vs admin
- Automatic session refresh

---

## Setup & Configuration

### 1. Environment Variables

Add to `.env.local`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/saar-fitness

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# For production, update NEXTAUTH_URL to your domain
```

### 2. Database Setup

Ensure MongoDB collections exist:
- `members` - Member documents
- `attendances` - Attendance records
- `payments` - Payment records

### 3. Add Credentials to Existing Members

Use the provided script to add email/password to existing members:

```bash
node scripts/add-member-credentials.js
```

**Script Options:**
1. Add credentials to all members without email
2. Add credentials to a single member
3. List all members
4. Exit

**Usage Example:**
```
$ node scripts/add-member-credentials.js
✓ Connected to MongoDB

=== Member Credentials Management ===

1. Add credentials to all members without email
2. Add credentials to a single member
3. List all members
4. Exit

Choose an option (1-4): 2
Enter member ID: 507f1f77bcf86cd799439011
Member: John Doe
Current email: Not set
Enter new email address: john@example.com
Enter password (min 6 characters): MySecure123
✓ Updated member: John Doe
  Email: john@example.com
```

### 4. Test Member Login

1. Create a test member with credentials
2. Navigate to `/login`
3. Enter email and password
4. Verify redirect to `/member` dashboard

---

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials redirects to `/member`
- [ ] Login with invalid credentials shows error
- [ ] Unauthenticated access to `/member/*` redirects to `/login`
- [ ] Admin accessing `/member` redirects to `/admin`
- [ ] Staff accessing `/member` redirects to `/dashboard`
- [ ] Sign out clears session and redirects to login

#### Member Dashboard
- [ ] Dashboard loads with correct member data
- [ ] Status cards show accurate counts
- [ ] Recent attendance displays last 5 visits
- [ ] Recent payments displays last 5 transactions
- [ ] Profile summary shows correct information
- [ ] Trainer information displays (if assigned)

#### Profile Page
- [ ] Profile loads with member data
- [ ] Edit mode enables weight/height fields
- [ ] Save updates database and recalculates BMI
- [ ] Cancel restores original values
- [ ] Success message appears after save
- [ ] Error handling for failed updates

#### Attendance Page
- [ ] Attendance table loads with records
- [ ] Pagination works correctly
- [ ] Date and time format correctly
- [ ] Duration calculated accurately
- [ ] Empty state shows when no records
- [ ] Previous/Next buttons disabled appropriately

#### Payments Page
- [ ] Payment table loads with records
- [ ] Total paid calculated correctly
- [ ] Status badges display with correct colors
- [ ] Pagination functions properly
- [ ] Empty state appears when no payments
- [ ] Amount formatting includes currency symbol

#### Membership Page
- [ ] Membership details display correctly
- [ ] Days remaining calculated accurately
- [ ] Status badge shows correct status
- [ ] Expired warning appears when expired
- [ ] Expiring soon warning appears (≤7 days)
- [ ] Color coding reflects status (green/yellow/red)

#### Navigation
- [ ] All navigation links work correctly
- [ ] Active route highlighted in nav
- [ ] Mobile menu toggles properly
- [ ] Sign out button functions
- [ ] User info displays in nav bar

### API Testing with curl

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/member/profile \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### Update Profile
```bash
curl -X PATCH http://localhost:3000/api/member/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"weightKg": 75, "heightCm": 175}'
```

#### Get Attendance
```bash
curl -X GET "http://localhost:3000/api/member/attendance?limit=10&skip=0" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### Get Payments
```bash
curl -X GET "http://localhost:3000/api/member/payments?limit=10&skip=0" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### Get Membership
```bash
curl -X GET http://localhost:3000/api/member/membership \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error on Login
- Check that member has `isActive: true`
- Verify email and password are set correctly
- Ensure `passwordHash` is bcrypt hashed (10 rounds)

#### 2. Session Not Persisting
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

#### 3. API Returns Empty Data
- Verify member has associated records (attendance, payments)
- Check MongoDB connection
- Ensure `memberId` reference is correct in related collections

#### 4. Middleware Redirect Loop
- Check that `/login` is not in protected routes
- Verify role matching logic in `middleware.js`
- Clear cookies and session storage

#### 5. BMI Not Calculating
- Ensure both `weightKg` and `heightCm` are numbers
- Check calculation logic: `weight / ((height/100) ** 2)`
- Verify PATCH endpoint is receiving correct data

---

## Future Enhancements

Potential improvements for the member portal:

1. **Password Reset Flow**
   - Email-based password reset
   - Security questions
   - OTP verification

2. **Workout Tracking**
   - Log exercises and sets
   - Track progress over time
   - View workout history

3. **Goal Setting**
   - Set weight goals
   - Track progress towards goals
   - Achievement badges

4. **Trainer Communication**
   - In-app messaging with trainer
   - Workout plan viewing
   - Diet plan integration

5. **Payment Integration**
   - Online payment gateway
   - Automatic renewal
   - Payment reminders

6. **Mobile App**
   - React Native app
   - Push notifications
   - QR code check-in

7. **Social Features**
   - Member directory
   - Workout buddies
   - Leaderboards

---

## Support

For issues or questions:
1. Check this documentation first
2. Review the RBAC documentation for authorization details
3. Check the Next.js and NextAuth documentation
4. Contact the development team

---

## Version History

- **v1.0** (Current) - Initial member portal implementation
  - Member authentication
  - Dashboard with overview
  - Profile management
  - Attendance history
  - Payment history
  - Membership details
  - Complete RBAC integration

---

**Last Updated**: 2024
**Author**: SAAR-FITNESS Development Team
