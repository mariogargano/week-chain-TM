# WEEK-CHAIN Pre-Launch Checklist for Test Run Tomorrow

## Critical: Run Before Test

### 1. Database Setup (5 minutes)

**Execute the master fix script:**
```bash
# From Supabase Dashboard → SQL Editor
# Copy and paste the entire 100_PRE_LAUNCH_COMPLETE_FIX.sql
# Click "Run"
```

This script fixes:
- ✅ admin_users table (adds user_id column)
- ✅ Profile auto-creation trigger
- ✅ Email automation tables (email_templates, email_logs, email_unsubscribes)
- ✅ corporativo@morises.com admin configuration
- ✅ All RLS policies
- ✅ Default email templates (5 PROFECO-compliant templates)

### 2. Admin Access Setup (2 minutes)

**For corporativo@morises.com to access admin panel:**

1. Go to `https://www.week-chain.com/auth`
2. Click "Continuar con Google"
3. Sign in with `corporativo@morises.com` Google account
4. You will be redirected to `/dashboard/admin` automatically

**Verification:**
- You should see "Admin Dashboard" with full access
- Sidebar shows: Analytics, Users, Properties, Certificates, etc.
- You can access `/dashboard/admin/email-templates`

### 3. Environment Variables (Already Configured ✅)

These are already set in your Vercel project:
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `RESEND_API_KEY`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- ✅ `CONEKTA_SECRET_KEY`
- ✅ `STRIPE_SECRET_KEY`

### 4. Test Flow Sequence

**For tomorrow's test with your team, follow this order:**

#### A. Authentication Test (5 min)
1. **Google OAuth (corporativo@morises.com)**
   - Go to `/auth`
   - Click "Continuar con Google"
   - Verify redirect to `/dashboard/admin`
   - ✅ Should see full admin panel

2. **Regular user sign up**
   - Open incognito window
   - Go to `/auth/sign-up`
   - Register with test email
   - Verify email confirmation
   - ✅ Should redirect to `/dashboard/user`

#### B. Admin Panel Test (10 min)
1. **Navigate admin sections:**
   - `/dashboard/admin` - Overview dashboard
   - `/dashboard/admin/users` - User management
   - `/dashboard/admin/certificates` - Certificate control
   - `/dashboard/admin/email-templates` - Email management
   - `/dashboard/admin/properties` - Properties management

2. **Verify admin permissions:**
   - ✅ Can see all users
   - ✅ Can manage certificates
   - ✅ Can edit email templates
   - ✅ Can view analytics

#### C. Email System Test (5 min)
1. **Go to** `/dashboard/admin/email-templates`
2. **Verify** 5 templates are loaded:
   - welcome
   - certificate_purchased
   - reservation_request_submitted
   - reservation_offer_available
   - reservation_confirmed

3. **Send test email:**
   - Go to `/dashboard/admin/email-test-flow`
   - Enter test email address
   - Click "Send Test Email"
   - ✅ Check inbox for email
   - ✅ Verify email logs in `/dashboard/admin/email-logs`

#### D. User Flow Test (10 min)
1. **Certificate Purchase:**
   - User logs in at `/dashboard/user`
   - Browse certificates at `/certificates`
   - Click "Activar Certificado"
   - Complete payment flow (use test mode)
   - ✅ Verify email sent
   - ✅ Certificate appears in dashboard

2. **Reservation Request:**
   - Go to `/dashboard/user/request-reservation`
   - Select property and dates
   - Submit request
   - ✅ Verify email sent
   - ✅ Request appears in admin panel

#### E. Payment Integration Test (10 min)
1. **Stripe (Credit Card):**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ✅ Payment processes
   - ✅ Webhook received

2. **Conekta (OXXO/SPEI):**
   - Select OXXO payment
   - ✅ Reference generated
   - ✅ Instructions shown

### 5. Common Issues & Solutions

#### Issue: "corporativo@morises.com cannot access admin panel"

**Solution:**
```sql
-- Run in Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'corporativo@morises.com';

UPDATE admin_users 
SET status = 'active', role = 'super_admin'
WHERE email = 'corporativo@morises.com';
```

#### Issue: "Email templates not showing"

**Solution:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM email_templates;
-- If empty, re-run PART 7 of 100_PRE_LAUNCH_COMPLETE_FIX.sql
```

#### Issue: "User profile not created after signup"

**Solution:**
```sql
-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- If missing, re-run PART 2 of 100_PRE_LAUNCH_COMPLETE_FIX.sql
```

#### Issue: "Google OAuth not working"

**Check:**
1. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in Vercel
2. Authorized redirect URI in Google Console: `https://www.week-chain.com/api/auth/google/callback`
3. Authorized JavaScript origins: `https://www.week-chain.com`

### 6. Success Criteria for Test Run

✅ **Authentication:**
- corporativo@morises.com can log in with Google
- Regular users can sign up with email/password
- All signups create profiles automatically

✅ **Admin Access:**
- corporativo@morises.com sees admin dashboard
- Can access all admin sections
- Can manage users, certificates, properties

✅ **Email System:**
- 5 templates are active
- Test emails send successfully
- Email logs track all sends
- Unsubscribe system works

✅ **User Experience:**
- Users can browse certificates
- Can request reservations
- Dashboard shows correct data
- Payments process correctly

✅ **PROFECO Compliance:**
- All copy uses SVC terminology
- Disclaimers present on all pages
- No misleading investment language
- Clear "derecho de solicitud" messaging

### 7. Post-Test Action Items

**After successful test:**
1. ✅ Mark which features work perfectly
2. 📝 Document any bugs found
3. 🎯 Prioritize fixes needed
4. 🚀 Plan production launch date

**If issues found:**
1. 🐛 Create issue list with screenshots
2. 🔧 Prioritize by severity
3. ⏱️ Estimate fix time
4. 📅 Schedule follow-up test

### 8. Emergency Contacts

**Database Issues:**
- Supabase Dashboard: https://app.supabase.com
- Service Role Key: In Vercel env vars

**Deployment Issues:**
- Vercel Dashboard: https://vercel.com
- Project: week-chain-tm

**Email Issues:**
- Resend Dashboard: https://resend.com
- API Key: In Vercel env vars

### 9. Backup Plan

**If critical issues arise during test:**
1. Document the issue with screenshots
2. Continue testing other features
3. Note which features are production-ready
4. Schedule quick fix session after test
5. Retest only affected areas

### 10. Final Pre-Test Checklist

**30 minutes before test:**
- [ ] Run 100_PRE_LAUNCH_COMPLETE_FIX.sql
- [ ] Verify corporativo@morises.com can access admin
- [ ] Clear browser cache
- [ ] Test Google OAuth login
- [ ] Verify 5 email templates exist
- [ ] Check Vercel deployment is live
- [ ] Prepare test credit cards
- [ ] Have Supabase dashboard open
- [ ] Have Vercel logs open
- [ ] Have notepad ready for issues

**Good luck with the test run! 🚀**
