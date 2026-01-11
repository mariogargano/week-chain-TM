# Google Authentication Setup Guide

## Overview
WEEK-CHAIN uses Google OAuth 2.0 for "Sign in with Google" functionality. This allows users to authenticate using their Google accounts.

## Prerequisites
- Google Cloud Platform account
- Access to Google Cloud Console

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: "WEEK-CHAIN" or your preferred name
4. Click "Create"

### 2. Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required information:
   - **App name**: WEEK-CHAIN
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
5. Click "Save and Continue"
6. Scopes: Add the following scopes:
   - `openid`
   - `email`
   - `profile`
7. Click "Save and Continue"
8. Test users: Add your email for testing
9. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "WEEK-CHAIN Web Client"
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   https://your-production-domain.com/api/auth/google/callback
   ```
7. Click "Create"
8. **IMPORTANT**: Copy your Client ID and Client Secret

### 5. Add Environment Variables

Add these to your Vercel project or `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 6. Test the Integration

1. Go to `/auth/login`
2. Click "Sign in with Google"
3. You should be redirected to Google's consent screen
4. After authorizing, you'll be redirected back and logged in

## Security Notes

- Never commit your Client Secret to version control
- Use different OAuth clients for development and production
- Regularly rotate your Client Secret
- Monitor OAuth usage in Google Cloud Console

## Troubleshooting

### "redirect_uri_mismatch" error
- Verify the redirect URI in Google Console matches exactly
- Check for trailing slashes
- Ensure protocol (http/https) matches

### "access_denied" error
- User cancelled the authorization
- Check OAuth consent screen configuration

### "invalid_client" error
- Client ID or Secret is incorrect
- Verify environment variables are set correctly

## Production Checklist

- [ ] OAuth consent screen verified by Google
- [ ] Production domain added to authorized origins
- [ ] Production callback URL added to authorized redirects
- [ ] Environment variables set in Vercel
- [ ] Test login flow in production
- [ ] Monitor error logs

## Support

For issues with Google OAuth setup, refer to:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
