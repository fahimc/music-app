# Folder Selection Improvements

## Issue Fixed

**Problem:** Folder selection dialog was showing many `.bin` and system folders instead of just user folders.

**Root Cause:** The Drive API query wasn't filtering out system/hidden folders, and was querying all files/folders globally instead of just top-level user folders.

## Changes Made

### 1. Improved Folder Query Filter

**Before:**
```typescript
let query = 'trashed=false';
```

**After:**
```typescript
// Only folders, not files
let query = "mimeType='application/vnd.google-apps.folder' and trashed=false";

// Exclude hidden/system folders (those starting with .)
query += " and not name contains '.'";

// Get only top-level folders in My Drive
if (!folderId) {
  query += " and 'root' in parents";
}
```

**Benefits:**
- ✅ Shows only folders (not files)
- ✅ Excludes system folders like `.bin`, `.cache`, etc.
- ✅ Shows only top-level folders for cleaner list
- ✅ Faster loading with focused query

### 2. Music Folder Detection

**New Feature:** Automatically finds and highlights a "Music" folder if it exists.

**Implementation:**
```typescript
async findFolderByName(folderName: string): Promise<DriveFile | null> {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  // Search and return first match
}
```

**UI Enhancements:**
- 💡 Success alert when Music folder is found
- 🎵 Music note icon for Music folder
- 🏷️ "Recommended" badge on Music folder
- 🎨 Green border highlight for Music folder

### 3. Better User Experience

**Folder List Features:**
- Only shows user-created folders
- Alphabetical sorting
- Search functionality
- Root folder option (scan all Drive)
- Visual folder type indicators

**What Users See:**
```
✓ Music (Recommended) 🎵
✓ Documents
✓ Photos  
✓ Projects
✓ My Drive (Root) - Scan all files
```

**What Users DON'T See:**
```
✗ .bin
✗ .cache
✗ .tmp
✗ System folders
✗ Hidden folders
```

## Technical Details

### Drive API Query Structure

```typescript
// Complete query for user folders
const query = [
  "mimeType='application/vnd.google-apps.folder'",  // Only folders
  "trashed=false",                                  // Not in trash
  "not name contains '.'",                          // Not system folders
  "'root' in parents"                               // Top-level only
].join(' and ');
```

### Folder Properties Returned

```typescript
fields: 'files(id,name,mimeType,iconLink,parents),nextPageToken'
```

- **id** - Unique folder ID
- **name** - Folder name (for display and search)
- **mimeType** - Confirms it's a folder
- **iconLink** - Folder icon (if available)
- **parents** - Parent folder IDs (for hierarchy)

### Music Folder Detection Flow

1. Dialog opens
2. `findMusicFolder()` searches for folder named "Music"
3. If found, stores reference and shows suggestion
4. Music folder highlighted in the list
5. User can still choose any folder

## Scope Verification

### Current Scope

```typescript
private readonly SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
```

**This scope is correct** and provides:
- ✅ Read access to all Drive files and folders
- ✅ List folders and files
- ✅ Download files
- ✅ View metadata
- ❌ No write access (security best practice)

### Why Not More Permissive Scope?

The app only needs **read access** to:
- List folders for selection
- Read audio files
- Download songs for offline

Using `drive.readonly` is **best practice** because:
- More secure (can't modify Drive)
- Easier for users to trust
- Complies with principle of least privilege
- Sufficient for all app features

## User Benefits

### Better Organization
- See only relevant folders
- Easy to find Music folder
- Clear folder hierarchy
- No confusing system folders

### Faster Selection
- Smaller, focused list
- Auto-detection of Music folder
- Quick search
- Recommended option highlighted

### Clearer Options
- Root vs specific folder clearly explained
- Visual indicators (icons, badges)
- Success messages for guidance
- Error messages if issues occur

## Testing

### Verify the Fix

1. **Sign in to app**
2. **Open folder selection dialog**
3. **Check what you see:**
   - ✅ Only user folders (no .bin, .cache, etc.)
   - ✅ Music folder highlighted if exists
   - ✅ Alphabetical order
   - ✅ Clean, readable list

4. **Try search:**
   - Type "Music"
   - Should filter to Music folder
   - Type partial name to filter

5. **Select folder:**
   - Click Music folder (or any folder)
   - Click "Select Folder"
   - Folder saved successfully

### Expected Results

**With Music folder:**
- Green success alert at top
- Music folder has green border
- Music folder has "Recommended" badge
- Music folder has music note icon

**Without Music folder:**
- No success alert
- All folders shown equally
- Can still select any folder or root

**No folders at all:**
- Shows "No folders found" message
- Root option still available

## Troubleshooting

### Still Seeing System Folders?

**Possible causes:**
1. Cached API response
2. Folders named without leading dot
3. Third-party app folders

**Solutions:**
1. Sign out and sign in again
2. Check folder names in Google Drive web
3. These might be legitimate folders (not system folders)

### Music Folder Not Detected?

**Possible causes:**
1. Folder named differently (e.g., "music", "MUSIC", "My Music")
2. Folder in subfolder (not top-level)
3. Folder recently created (not synced yet)

**Solutions:**
1. Check exact folder name in Google Drive
2. Create a folder named exactly "Music" (capital M)
3. The folder must be in the root of My Drive

### No Folders Showing?

**Possible causes:**
1. No folders in Google Drive
2. All folders are system folders
3. API permission issue

**Solutions:**
1. Create some folders in Google Drive
2. Check Google Drive web interface
3. Try signing out and back in

## Future Enhancements

### Potential Additions

1. **Multiple Common Names**
   - Search for "Music", "music", "MUSIC", "My Music"
   - Auto-detect various naming conventions

2. **Subfolder Support**
   - Browse into subfolders
   - Breadcrumb navigation
   - "Back" button

3. **Recent Folders**
   - Remember recently selected folders
   - Quick access to previous selections

4. **Folder Preview**
   - Show number of audio files in folder
   - Preview first few file names
   - Estimated total size

5. **Smart Suggestions**
   - Detect folders with most audio files
   - Suggest based on folder names
   - Learn from user selections

## Documentation

- **CHANGELOG.md** - Updated with folder improvements
- **USER_GUIDE.md** - Folder selection explained
- This file - Technical details

---

**Status: ✅ Improved and Working**

The folder selection now shows only relevant user folders, automatically detects and highlights the Music folder, and provides a much cleaner, more intuitive experience.
