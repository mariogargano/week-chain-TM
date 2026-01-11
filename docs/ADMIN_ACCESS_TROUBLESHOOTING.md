# Admin Access Troubleshooting Guide

## Overview
This guide helps diagnose and fix admin dashboard access issues in WEEK-CHAIN™.

## Common Issues

### 1. "Verifying access..." Stuck Loading

**Symptoms:**
- Dashboard shows "Verifying access..." indefinitely
- No error message appears
- Console shows timeout errors

**Solution:**
1. Run the SQL script: `scripts/041_fix_admin_access.sql`
2. Clear browser localStorage
3. Reconnect wallet
4. Try accessing dashboard again

### 2. "Access Denied" Error

**Symptoms:**
- User is redirected to login
- Error message: "You don't have permission to access this page"

**Solution:**
1. Verify wallet address is correct
2. Check if wallet is in `admin_wallets` table:
   ```sql
   SELECT * FROM admin_wallets WHERE wallet_address = 'YOUR_WALLET_ADDRESS';
   ```
3. If not found, add it:
   ```sql
   INSERT INTO admin_wallets (wallet_address, role, name)
   VALUES ('YOUR_WALLET_ADDRESS', 'admin', 'Admin Name');
   ```

### 3. Role Not Found in Database

**Symptoms:**
- getUserRole returns null
- User defaults to 'user' role

**Solution:**
1. Ensure wallet exists in at least one of these tables:
   - `admin_wallets`
   - `users`
   - `profiles`
2. Run the fix script to sync all tables
3. Use the diagnostics page to verify: `/dashboard/admin/diagnostics`

## Diagnostics Page

Access the diagnostics page at: `/dashboard/admin/diagnostics`

This page will check:
- ✅ Supabase connection
- ✅ Wallet address in localStorage
- ✅ Admin wallets table
- ✅ Users table
- ✅ Profiles table
- ✅ Admin role verification
- ✅ Database function (get_user_role)
- ✅ RLS policies

## Database Schema

### admin_wallets
Primary table for admin role verification:
```sql
CREATE TABLE admin_wallets (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### users
Secondary table for user data:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### profiles
Tertiary table for user profiles:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  username TEXT,
  display_name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Role Verification Flow

1. Check `admin_wallets` table first
2. If not found, check `users` table
3. If not found, check `profiles` table
4. If not found anywhere, default to 'user' role

## Manual Verification

To manually verify a user's role:

```sql
-- Check all tables for a wallet
SELECT 
  'admin_wallets' as source,
  wallet_address,
  role,
  name
FROM admin_wallets
WHERE wallet_address = 'YOUR_WALLET_ADDRESS'

UNION ALL

SELECT 
  'users' as source,
  wallet_address,
  role,
  full_name as name
FROM users
WHERE wallet_address = 'YOUR_WALLET_ADDRESS'

UNION ALL

SELECT 
  'profiles' as source,
  u.wallet_address,
  p.role,
  p.display_name as name
FROM profiles p
JOIN users u ON u.id = p.id
WHERE u.wallet_address = 'YOUR_WALLET_ADDRESS';
```

## Adding a New Admin

To add a new admin user:

```sql
-- Add to admin_wallets (primary)
INSERT INTO admin_wallets (wallet_address, role, name)
VALUES ('NEW_WALLET_ADDRESS', 'admin', 'Admin Name');

-- Add to users (secondary)
INSERT INTO users (wallet_address, email, full_name, role)
VALUES ('NEW_WALLET_ADDRESS', 'admin@week-chain.com', 'Admin Name', 'admin')
ON CONFLICT (wallet_address) DO UPDATE SET role = 'admin';

-- Add to profiles (tertiary)
INSERT INTO profiles (id, username, display_name, role)
SELECT id, 'admin_username', 'Admin Name', 'admin'
FROM users
WHERE wallet_address = 'NEW_WALLET_ADDRESS'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## Support

If issues persist after following this guide:
1. Check browser console for errors
2. Review Supabase logs
3. Verify environment variables are set correctly
4. Contact technical support with diagnostics page results
