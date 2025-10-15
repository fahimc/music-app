# Fix: Music Folder Scoping

## Issues Fixed

### 1. Music Folder Not Visible in Selection List

**Problem:** The Music folder was found by `findFolderByName()` but wasn't showing in the folder selection list.

**Root Cause:** The `listFiles()` method was filtering folders by `'root' in parents`, which only showed top-level folders. If the Music folder was anywhere else in the Drive hierarchy, it wouldn't appear.

**Solution:**
- Removed the `'root' in parents` restriction from `listFiles()`
- Now lists all folders from Google Drive (not just root-level)
- Music folder detection now happens within `loadFolders()` by checking if any folder name is "Music"

**Code Changes:**
```typescript
// Before: Only root-level folders
query += " and 'root' in parents";

// After: All folders
// (No parent restriction)
```

### 2. Songs Loading from Root Instead of Selected Folder

**Problem:** Even after selecting the Music folder, songs were still being loaded from the root/entire Drive.

**Root Cause:** The `refreshDriveSongs()` function in `MusicSourceContext` was calling `googleDriveService.getAllSongs()` without passing the folder ID parameter.

**Solution:**
- Load credentials in `refreshDriveSongs()`
- Extract the `folderId` from stored credentials
- Pass `folderId` to `getAllSongs(folderId)`
- Added console log to verify which folder is being scanned

**Code Changes:**
```typescript
// Before:
const songs = await googleDriveService.getAllSongs();

// After:
const credentials = credentialStorageService.loadCredentials();
const folderId = credentials?.folderId;
console.log('Loading songs from folder:', folderId || 'root');
const songs = await googleDriveService.getAllSongs(folderId);
```

## How It Works Now

### Folder Selection Flow

1. User opens folder selection dialog
2. App queries Google Drive for ALL folders (not just root)
3. Filters out system folders (starting with `.`)
4. Displays all user folders in the list
5. Detects if "Music" folder exists and highlights it
6. User selects a folder
7. Folder ID saved to credentials storage

### Song Loading Flow

1. User authenticated
2. `MusicSourceContext` calls `refreshDriveSongs()`
3. Loads credentials from storage
4. Extracts `folderId` (empty string = root, or specific folder ID)
5. Calls `googleDriveService.getAllSongs(folderId)`
6. `getAllSongs()` uses folder ID in query:
   - If folderId exists: `'folderId' in parents` (only songs in that folder)
   - If empty/null: No parent filter (all songs in Drive)

### Query Structure

**For Folder List:**
```typescript
mimeType='application/vnd.google-apps.folder' 
and trashed=false 
and not name contains '.'
// No parent restriction - shows all folders
```

**For Songs:**
```typescript
(audio MIME types) 
and trashed=false
[and 'folderId' in parents]  // Only if folder selected
```

## Files Modified

1. **src/services/googleDrive.ts**
   - Removed `'root' in parents` restriction from `listFiles()`
   - Now returns all folders, not just top-level

2. **src/components/FolderSelectionDialog.tsx**
   - Simplified Music folder detection
   - Detects Music folder from the loaded list
   - Removed separate `findMusicFolder()` call

3. **src/contexts/MusicSourceContext.tsx**
   - Added credential loading in `refreshDriveSongs()`
   - Pass folder ID to `getAllSongs()`
   - Added logging for debugging

4. **CHANGELOG.md** - Documented fixes

## Testing

### Verify Folder Selection Works

1. **Open folder selection dialog**
   - Should see all your folders (not just root-level)
   - Music folder should appear if it exists
   - Music folder should have green border and "Recommended" badge

2. **Select Music folder**
   - Click on Music folder
   - Click "Select Folder"
   - Dialog closes

3. **Verify folder is saved**
   - Go to Settings
   - Check "Google Drive Music Folder" section
   - Should show selected folder ID

### Verify Songs Load from Correct Folder

1. **Navigate to "Your Music"**
2. **Check browser console**
   - Should see: `Loading songs from folder: [folder-id]`
   - Or: `Loading songs from folder: root` if no folder selected

3. **Verify songs displayed**
   - Should only see songs from the Music folder
   - NOT all songs from your entire Drive
   - Song count should match files in Music folder

### Test Both Scenarios

**Scenario A: Music Folder Selected**
- Select Music folder
- Songs page should show only songs from Music folder
- Console: `Loading songs from folder: [music-folder-id]`

**Scenario B: Root Selected**
- Select "My Drive (Root)"
- Songs page should show all songs from entire Drive
- Console: `Loading songs from folder: root` or empty

## Troubleshooting

### Songs Still Loading from Root

**Check:**
1. Did you select the Music folder and click "Select Folder"?
2. Go to Settings - does it show the folder ID?
3. Check browser console - what folder ID is logged?
4. Try signing out and back in to refresh everything

### Music Folder Not Appearing

**Possible causes:**
1. Folder name is not exactly "Music" (case-insensitive)
2. Folder is in trash
3. Folder is a system folder (name starts with `.`)

**Solutions:**
1. Check exact folder name in Google Drive web
2. Create a folder named exactly "Music"
3. All folders should appear in the list anyway

### No Songs Showing After Selection

**Possible causes:**
1. Selected folder has no audio files
2. Audio files have unsupported format
3. Folder ID not saved properly

**Solutions:**
1. Check if folder actually contains .mp3, .wav, etc. files
2. Try selecting root folder to see if songs appear
3. Check Settings to verify folder ID is saved

## Summary

**Before:**
- ❌ Only root-level folders visible
- ❌ Music folder not in list
- ❌ Songs loaded from entire Drive regardless of selection
- ❌ No way to scope to specific folder

**After:**
- ✅ All folders visible (from anywhere in Drive)
- ✅ Music folder appears and is highlighted
- ✅ Songs load only from selected folder
- ✅ Proper folder scoping works correctly
- ✅ Console logging for debugging

---

**Status: ✅ Fixed - Folder scoping now works correctly**
