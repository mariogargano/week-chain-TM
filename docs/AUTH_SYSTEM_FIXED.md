# WEEK-CHAIN Authentication System - Fixed

## Changes Made

### 1. Database Fixes (script 096)
- Added `user_id` column to `admin_users` table
- Added `status` column to `admin_users` table  
- Created `admin_audit_log` table for tracking access attempts
- Created trigger `on_auth_user_created` to auto-create profiles
- Synced existing auth.users to profiles table
- Auto-configured admin for corporativo@morises.com

### 2. Admin Guard Fixes
- Changed from `user_id` lookup to `email` lookup (more reliable)
- Added auto-creation of admin_users entry if email matches but no record exists
- Added proper error handling and logging

### 3. Middleware Simplification
- Simplified admin check to only verify email match in middleware
- Full admin verification moved to admin-guard.ts (server-side)
- Removed duplicate authentication checks
- Cleaner code flow

## How Authentication Works Now

### User Registration (Email/Password)
1. User fills sign-up form at `/auth/sign-up`
2. Supabase auth.signUp() creates user in auth.users
3. Trigger `on_auth_user_created` fires automatically
4. Profile created in `profiles` table
5. User record created in `users` table
6. User redirected to email verification or dashboard

### User Registration (Google OAuth)
1. User clicks "Sign in with Google" at `/auth/sign-up`
2. Redirected to `/api/auth/google` → Google OAuth
3. Callback at `/api/auth/google/callback` processes response
4. User created in auth.users via signUp()
5. Trigger creates profile automatically
6. User signed in and redirected to dashboard

### User Login (Email/Password)
1. User enters credentials at `/auth/login`
2. Supabase auth.signInWithPassword() validates
3. Session cookie set
4. Middleware allows access to protected routes
5. User redirected to dashboard

### Admin Access
1. Admin navigates to `/dashboard/admin/*`
2. Middleware checks if user email === "corporativo@morises.com"
3. If not admin email → redirect to `/dashboard/user`
4. If admin email → allow access
5. Page-level `checkAdminAuth()` does full verification:
   - Checks email match
   - Checks admin_users table entry
   - Auto-creates admin_users entry if needed
   - Logs access attempt

## Testing Instructions

### Test User Registration
1. Go to `/auth/sign-up`
2. Fill form with test email
3. Verify profile created in database
4. Verify redirect to verification/dashboard

### Test Google OAuth
1. Go to `/auth/sign-up`
2. Click "Registrar con Google"
3. Complete Google OAuth flow
4. Verify profile created
5. Verify redirect to dashboard

### Test Admin Access
1. Register/login as corporativo@morises.com
2. Navigate to `/dashboard/admin`
3. Should see admin dashboard
4. Check admin_audit_log for access record

### Test Non-Admin Blocked
1. Login as any other user
2. Try to access `/dashboard/admin`
3. Should redirect to `/dashboard/user`

## Troubleshooting

### "Profile not created"
Run script 096 to sync existing users and create trigger

### "Admin access denied"
1. Verify email is exactly "corporativo@morises.com"
2. Check admin_users table has entry
3. Check admin_audit_log for denial reason

### "Google OAuth fails"
1. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars
2. Verify redirect URI is configured in Google Console
3. Check browser console for errors
