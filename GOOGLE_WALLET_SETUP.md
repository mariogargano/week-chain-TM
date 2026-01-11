# Google Wallet Integration Setup

## Required Environment Variables

Add these to your Vercel project environment variables:

```bash
GOOGLE_WALLET_ISSUER_ID=your_issuer_id_here
GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_WALLET_SERVICE_ACCOUNT_KEY=-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----
```

## Setup Steps

### 1. Enable Google Wallet API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Wallet API**
4. Go to **APIs & Services > Credentials**

### 2. Create Service Account

1. Click **Create Credentials > Service Account**
2. Name: `week-chain-wallet`
3. Click **Create and Continue**
4. Skip role assignment (click Continue)
5. Click **Done**

### 3. Generate Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key > Create New Key**
4. Select **JSON** format
5. Click **Create** - this downloads the JSON key file

### 4. Get Issuer ID

1. Go to [Google Pay & Wallet Console](https://pay.google.com/business/console)
2. Click **Google Wallet API**
3. Your **Issuer ID** is shown at the top (format: `3388000000012345678`)

### 5. Authorize Service Account

1. In Google Pay & Wallet Console
2. Go to **Users** section
3. Click **Add User**
4. Add your service account email (from step 2)
5. Assign role: **Developer**
6. Click **Save**

### 6. Configure Environment Variables

From the JSON key file you downloaded:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "week-chain-wallet@your-project-id.iam.gserviceaccount.com",
  ...
}
```

Set in Vercel:
- `GOOGLE_WALLET_ISSUER_ID` = Your Issuer ID from step 4
- `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL` = `client_email` from JSON
- `GOOGLE_WALLET_SERVICE_ACCOUNT_KEY` = `private_key` from JSON (keep the \n characters)

## Testing

Once configured, users will see "Add to Google Wallet" buttons on their week certificates in `/dashboard/my-weeks`.

## Features

- QR code with voucher code for check-in
- Property image as hero image
- Week details (number, year, dates)
- Owner name on card
- Automatic updates when week details change
