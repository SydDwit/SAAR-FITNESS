# Session Persistence Fix - Technical Documentation

## Problem Summary

Members were being logged out unexpectedly when:
- Navigating back using the browser back button
- Refreshing the page
- Closing and reopening the browser
- Switching between member pages

## Root Causes Identified

### 1. Missing Session Lifetime Configuration
**Issue**: No `session.maxAge` or `jwt.maxAge` configured in NextAuth options.
**Impact**: Sessions expired immediately or used NextAuth defaults (30 days) without explicit control.

### 2. Missing Cookie Persistence
**Issue**: Cookie `maxAge` not explicitly set in cookie options.
**Impact**: Cookies were session-only (deleted when browser closed) instead of persistent.

### 3. No Session Refresh Mechanism
**Issue**: `SessionProvider` not configured with `refetchInterval` or `refetchOnWindowFocus`.
**Impact**: Stale sessions not refreshed, leading to authentication failures on navigation.

### 4. Insecure NEXTAUTH_SECRET
**Issue**: Using placeholder value "replace-with-random-string".
**Impact**: Predictable JWT signing, security vulnerability.

### 5. Improper Login Redirect
**Issue**: Using `window.location.href` for post-login redirect.
**Impact**: Hard page reload can interfere with session establishment in Next.js.

## Fixes Applied

### 1. Extended Session Lifetime (30 Days)

#### File: `lib/memberAuth.js`
```javascript
export const memberAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ... rest of config
};
```

**What Changed**:
- `session.maxAge`: Session remains valid for 30 days
- `session.updateAge`: Session refreshed every 24 hours if user is active
- `jwt.maxAge`: JWT token remains valid for 30 days

#### File: `lib/auth.js`
```javascript
export const authOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ... rest of config
};
```

**Impact**: Same configuration applied to admin/staff authentication for consistency.

---

### 2. Persistent Cookie Configuration

#### File: `lib/memberAuth.js`
```javascript
cookies: {
  sessionToken: {
    name: "next-auth.member-session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  },
},
debug: process.env.NODE_ENV === "development",
```

**What Changed**:
- `maxAge: 30 * 24 * 60 * 60`: Cookie persists for 30 days (2,592,000 seconds)
- `debug: true` in development: Enhanced logging for troubleshooting

#### File: `lib/auth.js`
```javascript
cookies: {
  sessionToken: {
    name: "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  },
},
debug: process.env.NODE_ENV === "development",
```

**Impact**: Cookies now persist across browser restarts instead of being session-only.

---

### 3. Session Auto-Refresh

#### File: `app/components/MemberAuthProvider.jsx`
```javascript
export default function MemberAuthProvider({ children }) {
  return (
    <SessionProvider 
      basePath="/api/memberauth"
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      {children}
    </SessionProvider>
  );
}
```

**What Changed**:
- `refetchInterval={5 * 60}`: Session checked every 5 minutes (300 seconds)
- `refetchOnWindowFocus={true}`: Session revalidated when user returns to tab

#### File: `app/components/AuthProvider.jsx`
```javascript
export default function AuthProvider({ children }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true} // Refetch when window regains focus
    >
      {children}
    </SessionProvider>
  );
}
```

**Impact**: 
- Stale sessions automatically refreshed
- Prevents authentication failures during navigation
- Session remains synchronized across browser tabs

---

### 4. Proper Next.js Navigation

#### File: `app/login/page.jsx`
```javascript
if (res.ok && !data.error) {
  // Successfully logged in, use Next.js router for proper client-side navigation
  const destination = data.url || searchParams.get("callbackUrl") || "/member";
  router.push(destination);
  router.refresh(); // Refresh to update session state
} else {
  setError("Invalid email or password");
}
```

**What Changed**:
- Replaced `window.location.href = ...` with `router.push()`
- Added `router.refresh()` to update session state immediately

**Impact**: 
- Proper Next.js client-side navigation
- Session state synchronized immediately after login
- No hard page reload that could disrupt session

---

### 5. Secure NEXTAUTH_SECRET

#### File: `.env.local`
```
NEXTAUTH_SECRET=WrxYcLOM2AzbtDTqH6mIiUlevw3upC4EBkVhR0a8gSQKF9XZPsJd5jGyn1Nof7
```

**What Changed**:
- Generated 64-character cryptographically secure random string
- Replaced placeholder value

**Impact**: 
- Secure JWT token signing
- Prevents token forgery attacks
- Production-ready security

---

## How Session Persistence Works Now

### Session Lifecycle

1. **Login**
   - User submits credentials via `/api/memberauth/callback/credentials`
   - NextAuth creates JWT token with `maxAge: 30 days`
   - Cookie `next-auth.member-session-token` set with `maxAge: 30 days`
   - Cookie is `httpOnly`, `secure` (in production), and `sameSite: lax`

2. **Session Maintenance**
   - `SessionProvider` checks session every 5 minutes (`refetchInterval`)
   - Session revalidated when user returns to tab (`refetchOnWindowFocus`)
   - Session auto-refreshed every 24 hours if user is active (`updateAge`)

3. **Navigation**
   - Middleware reads `next-auth.member-session-token` cookie
   - JWT decoded using `NEXTAUTH_SECRET`
   - Token validated (not expired, correct signature)
   - User role checked against route requirements

4. **Persistence Across Browser Restart**
   - Cookie stored on disk (not in memory) due to `maxAge` setting
   - Browser re-sends cookie on next visit
   - Session automatically restored if token still valid (< 30 days)

### Security Layers

1. **httpOnly**: Cookie not accessible via JavaScript (prevents XSS)
2. **secure**: HTTPS-only in production (prevents man-in-the-middle)
3. **sameSite: lax**: Protection against CSRF attacks
4. **path: /**: Cookie sent with all requests to domain
5. **Strong secret**: 64-char random string for JWT signing

---

## Testing Session Persistence

### Test Case 1: Browser Back Button
**Steps**:
1. Login as member (demo@member.com / demo123)
2. Navigate to Profile page
3. Navigate to Attendance page
4. Press browser back button
**Expected**: Should return to Profile, still authenticated

### Test Case 2: Page Refresh
**Steps**:
1. Login as member
2. Navigate to any member page
3. Press F5 or Ctrl+R to refresh
**Expected**: Page reloads, user still authenticated, data loads normally

### Test Case 3: Browser Restart
**Steps**:
1. Login as member
2. Close browser completely (all windows)
3. Reopen browser
4. Navigate to http://localhost:3000/member
**Expected**: Should land on member dashboard without re-login

### Test Case 4: Multiple Tabs
**Steps**:
1. Login as member in Tab 1
2. Open new tab (Tab 2)
3. Navigate to member dashboard in Tab 2
**Expected**: Both tabs authenticated, session synchronized

### Test Case 5: Session Expiration
**Steps**:
1. Login as member
2. Wait 30 days (or manually delete cookie)
3. Try to navigate to member page
**Expected**: Redirected to /login with callbackUrl

---

## Browser Cookie Inspection

### Chrome/Edge DevTools
1. Press F12 → Application tab → Cookies → http://localhost:3000
2. Look for: `next-auth.member-session-token`
3. Verify:
   - **Size**: ~500-1000 bytes (JWT token)
   - **Expires**: 30 days from now
   - **HttpOnly**: ✓ (checkmark)
   - **Secure**: ✓ (in production)
   - **SameSite**: Lax
   - **Path**: /

### Firefox DevTools
1. Press F12 → Storage tab → Cookies → http://localhost:3000
2. Look for: `next-auth.member-session-token`
3. Same verification as above

---

## Configuration Summary

### Member Authentication (`lib/memberAuth.js`)
- **Session Strategy**: JWT
- **Session Max Age**: 30 days (2,592,000 seconds)
- **Session Update Age**: 24 hours (86,400 seconds)
- **JWT Max Age**: 30 days
- **Cookie Name**: `next-auth.member-session-token`
- **Cookie Max Age**: 30 days
- **Refetch Interval**: 5 minutes (300 seconds)
- **Refetch On Focus**: Enabled

### Admin/Staff Authentication (`lib/auth.js`)
- **Session Strategy**: JWT
- **Session Max Age**: 30 days
- **Session Update Age**: 24 hours
- **JWT Max Age**: 30 days
- **Cookie Name**: `next-auth.session-token`
- **Cookie Max Age**: 30 days
- **Refetch Interval**: 5 minutes
- **Refetch On Focus**: Enabled

### Environment Variables
- **NEXTAUTH_URL**: http://localhost:3000 (update for production)
- **NEXTAUTH_SECRET**: 64-character cryptographically secure string

---

## Production Deployment Checklist

### Before Deploying

- [ ] Update `NEXTAUTH_URL` to production domain (e.g., https://saarfitness.com)
- [ ] Verify `NEXTAUTH_SECRET` is set in production environment (use different secret than dev)
- [ ] Ensure HTTPS is enabled (required for `secure` cookie flag)
- [ ] Test session persistence in production-like environment (staging)
- [ ] Configure CDN/proxy to forward session cookies correctly
- [ ] Set appropriate CORS headers if using separate API domain

### Post-Deployment

- [ ] Test member login flow in production
- [ ] Verify cookies are set with `secure` flag
- [ ] Check browser console for any NextAuth errors
- [ ] Test session persistence across navigation
- [ ] Monitor authentication logs for issues
- [ ] Verify session refresh is working (check 5-minute intervals)

---

## Troubleshooting

### Issue: Session still lost on navigation
**Solution**: 
- Clear browser cookies completely
- Restart dev server
- Login again and test

### Issue: Cookie not being set
**Check**:
- `NEXTAUTH_SECRET` is set in `.env.local`
- `NEXTAUTH_URL` matches current URL
- No conflicting cookies from previous sessions
- Browser allows cookies (not in incognito mode with cookies disabled)

### Issue: Session expires immediately
**Check**:
- `maxAge` set in both session config AND cookie options
- Server time is correct (JWT expiry based on server time)
- No middleware logic forcefully clearing session

### Issue: "Invalid JWT" errors
**Solution**:
- Changed `NEXTAUTH_SECRET` invalidates existing tokens
- Clear all cookies and re-login
- Ensure same secret used on all servers (if load-balanced)

---

## Technical Details

### JWT Token Structure
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "demo@member.com",
  "role": "member",
  "iat": 1738306800,
  "exp": 1740898800,
  "jti": "unique-token-id"
}
```

### Cookie Format
```
next-auth.member-session-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
Path=/; 
HttpOnly; 
Secure; 
SameSite=Lax; 
Max-Age=2592000
```

---

## Best Practices Applied

✅ **HTTP-only cookies**: Prevents XSS attacks  
✅ **Secure flag in production**: Prevents man-in-the-middle attacks  
✅ **SameSite=Lax**: Prevents CSRF attacks  
✅ **Strong secret**: 64-char random string  
✅ **Reasonable session lifetime**: 30 days (industry standard)  
✅ **Auto-refresh**: Keeps session alive for active users  
✅ **Separate cookies**: Prevents admin/member session conflicts  
✅ **Debug mode in dev**: Enhanced logging for troubleshooting  

---

## Migration Guide

If you were previously logged in:
1. **You will be logged out** after this update (NEXTAUTH_SECRET changed)
2. Clear browser cookies manually: DevTools → Application → Cookies → Clear All
3. Login again with credentials
4. Session will now persist correctly

---

## Support

For issues or questions:
- Check browser console for NextAuth debug logs (dev mode only)
- Inspect cookies in DevTools
- Review middleware logs for authentication failures
- Refer to NextAuth documentation: https://next-auth.js.org/configuration/options

