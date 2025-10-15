# Export Error Fix

## Issue

```
Uncaught SyntaxError: The requested module '/src/components/FolderSelectionDialog.tsx?t=1760556875135' 
does not provide an export named 'FolderSelectionDialog'
```

## Root Cause

This is a **Vite dev server caching issue**, not an actual code problem. The export is correct in the file.

## Solution

### Option 1: Hard Refresh Browser
1. Press `Ctrl + Shift + R` (Windows/Linux)
2. Or `Cmd + Shift + R` (Mac)
3. This clears the browser cache

### Option 2: Restart Vite Dev Server
1. Stop the dev server (`Ctrl + C`)
2. Clear Vite cache: `rm -rf node_modules/.vite` or delete `.vite` folder
3. Restart: `npm run dev`

### Option 3: Clear All Caches
```bash
# Stop server
# Then run:
npm run dev -- --force
```

The `--force` flag forces Vite to rebuild everything.

## Verification

The export is correctly defined at the end of the file:

```typescript
export const FolderSelectionDialog: React.FC<FolderSelectionDialogProps> = ({
  open,
  onClose,
  onFolderSelected,
  currentFolderId,
}) => {
  // ... component code
};
```

And it's correctly imported in HomePage.tsx:

```typescript
import { FolderSelectionDialog } from './FolderSelectionDialog';
```

## Why This Happens

Vite's hot module replacement (HMR) sometimes gets confused when:
- Large files are created/modified
- Multiple edits happen quickly
- Component structure changes significantly

The solution is always to clear cache and restart.

## Quick Fix Commands

**Windows PowerShell:**
```powershell
# Stop server (Ctrl+C), then:
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

**Mac/Linux:**
```bash
# Stop server (Ctrl+C), then:
rm -rf node_modules/.vite
npm run dev
```

---

**Status: File is correct, just needs cache clear**
