# User Guide: Getting Started with Music App

## Overview

The Music App lets you stream and download music from your Google Drive. After setup, you stay logged in and can access your music library anytime.

## First Time Setup

### Step 1: Configure Google API Credentials

1. Open the app - you'll see a "Set Up Google Drive Access" button
2. Click it to open the Credential Setup Dialog
3. Enter your Google OAuth Client ID (see [OAUTH_SETUP.md](./OAUTH_SETUP.md) for how to get this)
4. Optionally add API Key and Folder ID
5. Click "Save Credentials"

### Step 2: Add Authorized Origin

If you see an error about "Authorization Origin":
1. Follow the instructions shown in the error message
2. Add your current URL (e.g., `http://localhost:5173`) to Google Cloud Console
3. Wait 5-10 minutes for changes to propagate
4. Reload the page

See [AUTHORIZATION_FIX.md](./AUTHORIZATION_FIX.md) for detailed instructions.

### Step 3: Sign In with Google

1. Click "Sign In with Google"
2. A Google sign-in popup will appear
3. Select your Google account
4. Grant permission to access your Google Drive (read-only)
5. You'll be signed in automatically

### Step 4: Select Music Folder

After signing in, a folder selection dialog will appear:

**Option A: Scan Entire Drive**
- Select "My Drive (Root)"
- The app will search all of your Google Drive for music files

**Option B: Select Specific Folder**
- Browse the list of folders
- Use the search box to find your music folder
- Click on a folder to select it
- Click "Select Folder"

The app will remember your choice and only scan that folder for music.

## Staying Signed In

### Persistent Login

Good news! Once you sign in, you stay signed in:

✅ **No re-login needed** when you:
- Close and reopen the app
- Navigate between pages (Home → Your Music → Settings)
- Refresh the browser
- Come back days later

❌ **You'll need to sign in again** only if you:
- Explicitly sign out
- Clear your browser's localStorage
- Token expires (happens rarely, after extended periods)

### How It Works

The app securely stores:
- Your access token (encrypted by browser)
- Token expiry time
- User information (name, email, picture)

All data is stored locally in your browser and never sent to any server.

## Managing Your Music Folder

### Change Folder Anytime

You can change which folder the app scans:

1. Go to **Settings** page
2. Find "Google Drive Music Folder" section
3. Click "Change Folder" (or "Select Music Folder" if none selected)
4. Choose a different folder
5. Click "Select Folder"

The app will immediately start scanning the new folder.

### Folder Options

**Root Folder (My Drive)**
- Scans all music files in your entire Google Drive
- Best for: Users with music scattered across multiple folders
- Note: May take longer to load if you have many files

**Specific Folder**
- Scans only files in the selected folder
- Best for: Users with dedicated music folder
- Note: Faster loading, more organized

## Browsing Your Music

### After Folder Selection

1. Click "Your Music" in the navigation bar
2. The app loads songs from your selected folder
3. Songs appear in a list with:
   - Song name
   - Artist (if available)
   - Album (if available)
   - Duration
   - Download status

### Features

**Search**
- Type in the search box to filter songs
- Search by song name, artist, or album

**Play Music**
- Click the play button on any song
- Use the player controls at the bottom:
  - Play/Pause
  - Previous/Next track
  - Shuffle
  - Repeat
  - Volume control
  - Seek bar

**Download for Offline**
- Click the download icon next to any song
- Downloaded songs have a checkmark
- Play downloaded songs anytime, even offline

## Settings & Management

### Settings Page

Access from the navigation bar:

**Google API Credentials**
- View configured credentials
- Edit credentials
- Clear credentials (sign out required)

**Google Drive Music Folder**
- See currently selected folder
- Change to a different folder
- Switch between root and specific folder

**Google Account**
- View signed-in account info
- See your name, email, and profile picture
- Sign out button

**Offline Storage**
- See how many songs downloaded
- Check storage space used
- Clear all offline songs

**App Information**
- Version number
- Storage location
- Supported audio formats

## Troubleshooting

### "I have to sign in again"

**If this happens:**
1. Check if you cleared your browser data
2. Check if you're in incognito/private mode (localStorage doesn't persist)
3. Check browser console for errors
4. Try signing out and signing in again

**This shouldn't happen** under normal use. If it does, please report it.

### "Folder selection doesn't show my folders"

**Possible causes:**
1. No folders in your Google Drive
2. Network connection issue
3. Google Drive API permission not granted

**Solutions:**
1. Create folders in your Google Drive first
2. Check your internet connection
3. Sign out and sign in again to re-grant permissions

### "No songs found"

**Possible causes:**
1. Selected folder has no audio files
2. Audio files have unsupported format
3. Files haven't loaded yet

**Solutions:**
1. Check if the folder actually contains music files
2. Supported formats: MP3, WAV, OGG, AAC, FLAC, M4A
3. Wait a few moments for loading
4. Try refreshing the song list (refresh button on page)

### "Can't play songs"

**Possible causes:**
1. Not signed in
2. Token expired
3. Network connection issue
4. File format not supported by browser

**Solutions:**
1. Check if you're still signed in (look at navigation bar)
2. Try signing out and back in
3. Check internet connection
4. Try downloading the song for offline playback

## Tips & Best Practices

### Organizing Your Music

**Recommended folder structure:**
```
My Drive
└── Music
    ├── Artist 1
    │   ├── Album 1
    │   └── Album 2
    └── Artist 2
        └── Album 1
```

**Best practices:**
1. Keep all music in one main folder
2. Use subfolders for artists and albums
3. Use consistent file naming
4. Add metadata (ID3 tags) to your music files

### Storage Management

**Downloaded songs:**
- Stored in browser's IndexedDB
- Persist until you clear them
- Don't count toward Google Drive storage
- Can be cleared anytime from Settings

**Clearing space:**
1. Go to Settings
2. Find "Offline Storage" section
3. Click "Clear All Offline Songs"
4. Confirm deletion

### Performance Tips

**For faster loading:**
1. Select specific folder instead of root
2. Organize music in dedicated folder
3. Limit folder to reasonable number of songs (< 1000)
4. Download frequently played songs

**For better experience:**
1. Use Wi-Fi for initial song loading
2. Download songs for offline when on Wi-Fi
3. Keep app installed as PWA for quick access
4. Update browser regularly for best compatibility

## Privacy & Security

### What's Stored

**Locally (your browser):**
- Google API credentials
- Access token (temporary, expires)
- User information (name, email, picture)
- Downloaded song files
- App preferences

**Never stored:**
- Your Google password
- Drive file contents (except downloaded songs)
- Personal Google Drive files (only music accessed)

### Security Features

- ✅ OAuth 2.0 secure authentication
- ✅ Read-only Drive access
- ✅ Token-based, no password storage
- ✅ Automatic token expiry
- ✅ Local-only data storage
- ✅ No server-side data collection

### Permissions Required

The app asks for:
- **Google Drive read-only access** - To list and download music files
- **Basic profile info** - To display your name and email

The app **never** asks for:
- Write access to Drive
- Access to other Google services
- Access to non-music files

## Getting Help

### Resources

- **Setup Issues:** [AUTHORIZATION_FIX.md](./AUTHORIZATION_FIX.md)
- **OAuth Setup:** [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- **Quick Reference:** [QUICK_FIX.md](./QUICK_FIX.md)
- **Technical Details:** [MIGRATION_TO_GIS.md](./MIGRATION_TO_GIS.md)

### Check Browser Console

For technical issues:
1. Press F12 to open developer tools
2. Go to "Console" tab
3. Look for error messages (red text)
4. Copy error messages for troubleshooting

---

**Enjoy your music!** 🎵
