# Quick Reference: Authorization Origin Error

## 🚨 Error Message
```
Authorization Origin Error: The current origin "http://localhost:5173" 
is not authorized for your Google OAuth Client ID.
```

## ✅ Quick Fix (2 Minutes)

### 1. Copy This URL
Look at your browser's address bar and copy the URL up to the port:
- Example: `http://localhost:5173`
- Or: `https://yourdomain.com`

### 2. Add to Google Cloud Console
1. Open: https://console.cloud.google.com/apis/credentials
2. Click your **OAuth 2.0 Client ID**
3. Find **"Authorized JavaScript origins"**
4. Click **"+ ADD URI"**
5. Paste your URL (e.g., `http://localhost:5173`)
6. Click **"SAVE"**

### 3. Wait & Reload
- Wait **5-10 minutes** ⏰
- Refresh your browser
- Try signing in again

## 📋 Common URLs to Add

| Environment | URL to Add |
|------------|------------|
| Local Dev | `http://localhost:5173` |
| Local Dev (alt) | `http://localhost:3000` |
| GitHub Codespaces | `https://your-codespace-5173.app.github.dev` |
| Production | `https://yourdomain.com` |

## ⚠️ Important Notes

- ❌ NO trailing slash: Use `http://localhost:5173` not `http://localhost:5173/`
- ✅ Include port if shown in browser
- ✅ Match `http://` vs `https://` exactly
- ⏰ Changes take 5-10 minutes to apply

## 📚 Need More Help?

- **Detailed Guide:** [AUTHORIZATION_FIX.md](./AUTHORIZATION_FIX.md)
- **Setup Instructions:** [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- **Full Docs:** [README.md](./README.md)

## 🎯 Visual Guide

```
Browser Address Bar:  http://localhost:5173/songs
                      ^^^^^^^^^^^^^^^^^^^^^^
                      Copy this part only ↑

Google Cloud Console:
┌─────────────────────────────────────────┐
│ Authorized JavaScript origins           │
│ ┌─────────────────────────────────────┐ │
│ │ http://localhost:5173               │ │ ← Paste here
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ ADD URI]                             │
└─────────────────────────────────────────┘
```

---

**That's it!** After adding and waiting, your app will work. 🎉
