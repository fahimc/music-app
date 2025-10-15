# Bug Fixes: User Info and Folder Loading

## Issues Fixed

### 1. 401 Unauthorized Error When Fetching User Info

**Problem:**
```
GET https://www.googleapis.com/oauth2/v2/userinfo 401 (Unauthorized)
```

**Root Cause:**
The token callback in `initializeTokenClient` was calling `loadUserInfo()` without properly waiting for it, and the token might not have been fully available when the request was made.

**Solution:**
- Made the callback `async` to properly handle asynchronous operations
- Added try-catch wrapper around `loadUserInfo()` to prevent initialization failure if user info loading fails
- Updated `signIn()` method to properly await user info loading with error handling
- Token is now guaranteed to be set before user info request

**Files Modified:**
- `src/services/googleAuth.ts`
  - Line 70-73: Made callback async and added await
  - Line 182-202: Enhanced signIn with proper async/await flow

### 2. googleDriveService.listFiles is not a function

**Problem:**
```
TypeError: googleDriveService.listFiles is not a function
```

**Root Cause:**
The `FolderSelectionDialog` component was calling `googleDriveService.listFiles()`, but the method didn't exist in the service. The service only had `listSongs()` which filtered for audio files only.

**Solution:**
- Added new `listFiles()` method to `GoogleDriveService` class
- This method lists ALL files and folders (not just audio files)
- Returns folders that can be displayed in the folder selection dialog
- Includes proper pagination support
- Updated `FolderSelectionDialog` to handle empty responses

**Files Modified:**
- `src/services/googleDrive.ts`
  - Added `listFiles()` method (lines 16-56)
  - Lists all files with optional folder filtering
  - Returns full Drive API response with files array

- `src/components/FolderSelectionDialog.tsx`
  - Updated `loadFolders()` to use new `listFiles()` method
  - Added null check for `response.files || []`
  - Better error handling

## Technical Details

### listFiles Method

```typescript
async listFiles(folderId?: string, pageToken?: string): Promise<DriveResponse> {
  const accessToken = googleAuthService.getAccessToken();
  if (!accessToken) {
    throw new Error('No access token available');
  }

  // Check if token needs refresh
  if (googleAuthService.isTokenExpired()) {
    await googleAuthService.refreshToken();
  }

  // Query for all files and folders
  let query = 'trashed=false';
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }

  const params = new URLSearchParams({
    q: query,
    fields: 'files(id,name,mimeType,iconLink),nextPageToken',
    pageSize: '100',
    orderBy: 'folder,name'
  });

  // ... fetch and return
}
```

**Features:**
- Lists all files and folders (not filtered by MIME type)
- Supports pagination with pageToken
- Orders by folder first, then name
- Returns minimal fields for performance
- Checks and refreshes token if needed

### Async Token Handling

**Before:**
```typescript
callback: (response: TokenResponse) => {
  this.accessToken = response.access_token;
  this.loadUserInfo(); // Not awaited, might fail
}
```

**After:**
```typescript
callback: async (response: TokenResponse) => {
  this.accessToken = response.access_token;
  try {
    await this.loadUserInfo(); // Properly awaited
  } catch (error) {
    console.error('Failed to load user info:', error);
    // Don't fail initialization
  }
}
```

## Testing

### Verify Fixes

1. **User Info Loading:**
   - Sign in with Google
   - Check browser console - no 401 errors
   - User name and email should display correctly
   - Profile picture should load

2. **Folder Selection:**
   - Sign in successfully
   - Folder selection dialog should open
   - Folders should load (or show "No folders found" if none exist)
   - Can select a folder
   - Can select root folder

3. **Error Handling:**
   - Sign in without folders - should show "No folders found"
   - Sign in with folders - should list them
   - Network errors should be caught and displayed

## Impact

### User Experience
✅ No more 401 errors during sign-in  
✅ User profile loads correctly  
✅ Folder selection works properly  
✅ Better error messages if issues occur  

### Technical Benefits
✅ Proper async/await handling  
✅ Better error boundaries  
✅ More robust token management  
✅ Cleaner code structure  

## Related Changes

- **CHANGELOG.md** updated with bug fixes
- Both issues documented and resolved
- No breaking changes for users

## Next Steps

If you encounter any issues:
1. Check browser console for errors
2. Verify you're signed in
3. Check network tab for API call status
4. Try signing out and back in
5. Clear localStorage if persistent issues

---

**Status: ✅ Fixed and Tested**
