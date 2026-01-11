# WEEK-CHAIN Admin Access Guide

## Overview
This guide explains how to access the WEEK-CHAIN admin panel and configure admin users.

## Prerequisites
1. You must have a registered account on the platform
2. You must have database access to run SQL scripts
3. Your email should be `corporativo@morises.com` (or update the script)

## Step-by-Step Setup

### 1. Create Your Account (If Not Already Done)
```
1. Go to: https://your-domain.com/auth/sign-up
2. Sign up with email: corporativo@morises.com
3. Verify your email
4. Complete the sign-in process
```

### 2. Run Admin Setup Script
```sql
-- Option A: Using Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Paste the contents of scripts/094_setup_admin_access.sql
4. Click "Run"
5. Check for success message

-- Option B: Using psql CLI
psql $DATABASE_URL -f scripts/094_setup_admin_access.sql
```

### 3. Run Email Automation Setup
```sql
-- This creates the email tables (email_templates, email_logs, email_unsubscribes)
psql $DATABASE_URL -f scripts/093_email_automation_complete_setup.sql
```

### 4. Access Admin Panel
```
1. Sign in to the platform with: corporativo@morises.com
2. Navigate to: https://your-domain.com/dashboard/admin
3. You should see the admin dashboard with all panels
```

## Admin Panel Structure

### Main Sections
- **Dashboard** (`/dashboard/admin`) - Overview and stats
- **Email Automation** (`/dashboard/admin/email-automation`) - Manage email templates and campaigns
- **Email Test Flow** (`/dashboard/admin/email-test-flow`) - Test email system functionality
- **Email Logs** (`/dashboard/admin/email-logs`) - View email delivery logs
- **Contact Inbox** (`/dashboard/admin/contact-inbox`) - Manage user inquiries
- **Testimonials** (`/dashboard/admin/testimonials`) - Approve user testimonials
- **Destinations** (`/dashboard/admin/destinations`) - Manage property catalog
- **Properties** (`/dashboard/admin/properties`) - Full property management
- **Certificates** (`/dashboard/admin/certificates`) - Manage user certificates
- **Users** (`/dashboard/admin/users`) - User management
- **Analytics** (`/dashboard/admin/analytics`) - Platform metrics

## Troubleshooting

### Issue: "Access Denied" when visiting /dashboard/admin

**Solution 1: Check Database Records**
```sql
-- Verify your user has correct roles
SELECT 
  au.email,
  au.role as admin_role,
  au.status,
  p.role as profile_role
FROM admin_users au
LEFT JOIN profiles p ON p.id = au.user_id
WHERE au.email = 'corporativo@morises.com';
```

Expected result:
- `admin_role`: `super_admin`
- `status`: `active`
- `profile_role`: `admin`

**Solution 2: Re-run Setup Script**
```sql
-- Run the setup script again
psql $DATABASE_URL -f scripts/094_setup_admin_access.sql
```

**Solution 3: Clear Browser Cache**
1. Sign out completely
2. Clear browser cache and cookies
3. Sign in again
4. Try accessing /dashboard/admin

### Issue: Email tables don't exist

**Solution:**
```sql
-- Run the email automation setup
psql $DATABASE_URL -f scripts/093_email_automation_complete_setup.sql
```

### Issue: Can't see email sections in sidebar

**Solution:**
Check that AdminSidebar includes email sections:
- Email Automation should appear in the sidebar
- If missing, the component may need to be updated

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Email Restriction**: Only `corporativo@morises.com` can access admin panel by default
2. **Multi-Factor**: Consider enabling 2FA for admin accounts
3. **Audit Logging**: All admin actions are logged in `admin_activity` table
4. **RLS Policies**: Row Level Security prevents unauthorized data access
5. **Session Management**: Admin sessions expire after 1 hour of inactivity

## Adding Additional Admins

To grant admin access to another user:

```sql
-- Replace with the new admin's email
DO $$
DECLARE
  v_user_id uuid;
  v_new_admin_email text := 'new-admin@example.com';
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_new_admin_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found', v_new_admin_email;
  END IF;

  -- Update profiles
  UPDATE profiles 
  SET role = 'admin' 
  WHERE id = v_user_id;

  -- Insert into admin_users
  INSERT INTO admin_users (user_id, email, name, role, status, created_at, updated_at)
  VALUES (v_user_id, v_new_admin_email, 'Admin User', 'super_admin', 'active', NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'super_admin',
    status = 'active';
    
  RAISE NOTICE 'Admin access granted to %', v_new_admin_email;
END $$;
```

## Testing Email System

### Quick Test Flow

1. **Go to Email Test Page**
   ```
   https://your-domain.com/dashboard/admin/email-test-flow
   ```

2. **Run System Checks**
   - Verify tables exist
   - Check templates are seeded
   - Confirm Resend API key is set
   - Test admin access

3. **Send Test Email**
   ```
   https://your-domain.com/dashboard/admin/email-automation/test
   ```
   - Select a template
   - Enter your email
   - Click "Send Test Email"
   - Check inbox for delivery

4. **View Logs**
   ```
   https://your-domain.com/dashboard/admin/email-logs
   ```
   - Check delivery status
   - View open/click rates
   - Monitor bounces

## Environment Variables

Ensure these are set in your Vercel/deployment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (for email)
RESEND_API_KEY=re_your_api_key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Support

If you encounter issues:
1. Check the database logs in Supabase Dashboard
2. Review browser console for errors
3. Verify environment variables are set
4. Check RLS policies in Supabase

## Quick Links

- Admin Dashboard: `/dashboard/admin`
- Email Test Flow: `/dashboard/admin/email-test-flow`
- Email Templates: `/dashboard/admin/email-automation`
- Contact Inbox: `/dashboard/admin/contact-inbox`
- User Management: `/dashboard/admin/users`

---

**Last Updated**: December 2024
**Version**: 1.0.0
