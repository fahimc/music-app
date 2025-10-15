# Google OAuth Setup Guide

## Quick Fix for "Not a valid origin" Error

If you're seeing this error:
```
{error: 'idpiframe_initialization_failed', details: "Not a valid origin for the client: ..."}
```

**👉 See [AUTHORIZATION_FIX.md](./AUTHORIZATION_FIX.md) for detailed step-by-step instructions.**

**This means your current domain/URL is not authorized in your Google OAuth settings.**

## Step-by-Step Fix

### 1. 📋 Copy Your Current Origin
Your app will show you the exact origin that needs to be added. It looks like:
- `http://localhost:5173` (local development)
- `https://your-codespace-url.github.dev` (GitHub Codespaces)
- `https://your-domain.com` (production)

### 2. 🔧 Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. In the **Authorized JavaScript origins** section:
   - Click **+ ADD URI**
   - Paste your exact origin URL
   - Click **Save**

### 3. ⏰ Wait for Changes
Changes can take **5-10 minutes** to propagate. After saving:
- Wait a few minutes
- Refresh your browser
- Try signing in again

## Common Origins for Development

### Local Development
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:5173
```

### GitHub Codespaces
```
https://[codespace-name]-5173.app.github.dev
```

### VS Code Dev Containers
```
https://[container-id].vscode-cdn.net
```

## Troubleshooting

### ❌ Still Getting Errors?
1. **Check the exact URL** - Copy it exactly from your browser address bar
2. **No trailing slashes** - Use `https://example.com` not `https://example.com/`
3. **Protocol matters** - HTTP vs HTTPS must match exactly
4. **Port numbers** - Include the port if your URL has one

### 🔍 How to Find Your Current Origin
The app will automatically detect and show your current origin in the setup dialog. Look for:
- **Homepage error alert** (if authorization fails)
- **Credential Setup Dialog** → Setup Instructions → Step 4

### 📱 Multiple Environments?
Add all origins you'll use:
- Local development: `http://localhost:5173`
- Staging: `https://staging.yourdomain.com`
- Production: `https://yourdomain.com`

## Security Notes

- ✅ **Safe to add localhost** for development
- ✅ **Add your production domain** before deploying
- ⚠️ **Don't add untrusted domains**
- ⚠️ **Use HTTPS in production**

## Need Help?

1. Check the browser console for the exact error details
2. The app will show you exactly which origin to add
3. Make sure you're editing the correct OAuth Client ID in Google Cloud Console

---

*This guide helps resolve the most common Google OAuth setup issue. The app will guide you through the process with specific instructions for your environment.*