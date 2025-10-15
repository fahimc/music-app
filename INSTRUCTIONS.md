# Spotify Clone Web App — Implementation Plan

## Overview
This plan outlines the steps to build a Spotify-like web application using **React** with **TypeScript** that connects to a specified **Google Drive folder** to display songs and allows users to download songs for offline listening. The app will be **progressive** (PWA) and work offline, with robust testing coverage.

---

## 1. Project Setup

- **Tech Stack**
  - React + TypeScript
  - React Router
  - Material UI or Chakra UI for styling
  - Google Drive REST API (OAuth 2.0)
  - Service Workers (PWA)
  - IndexedDB (for offline song storage)
  - React Testing Library + Jest
  - Vite or Create React App (with PWA template)

- **Initial Setup**
  - Bootstrap React TS project.
  - Set up linting, prettier, and pre-commit hooks.
  - Install dependencies for UI, routing, testing.
  - Configure PWA support.

---

## 2. Music Source Integration

### **Dual Source Support**
- Support both Google Drive and local folder access for maximum flexibility.
- Allow users to choose their preferred music source or use both simultaneously.
- Seamless switching between sources with unified interface.

### **Google Drive Integration**
- **Google API Setup & Configuration**
  - User-friendly credential setup via in-app forms (no environment variables needed).
  - Secure credential storage using browser localStorage with validation.
  - Support for Google API Client ID, API Key, and Drive Folder ID configuration.
  - Real-time credential validation and testing within the app.

- **OAuth Integration**
  - Implement OAuth 2.0 flow using modern Google Identity Services (GIS).
  - Request appropriate scopes (read-only if possible).
  - Handle sign-in and sign-out with persistent authentication.
  - Support credential reconfiguration and authentication reinitialize.
  - Auth state persists across browser sessions for seamless experience.

- **Folder Selection & Management**
  - Interactive folder browser to select music folder from Google Drive.
  - Option to scan entire Drive or specific folder.
  - Folder selection dialog appears after first login.
  - Change selected folder anytime from Settings page.
  - Folder ID stored securely with credentials.

- **Fetching Songs from Drive**
  - List audio files (.mp3, .wav, etc.) from selected Drive folder.
  - Fetch metadata (file name, album art if available, size, etc.).
  - Display file list in unified UI alongside local files.
  - Efficient folder-specific scanning for faster load times.

### **Local Folder Integration**
- **File System Access API**
  - Implement modern File System Access API for directory selection.
  - Fallback to traditional file input for broader browser compatibility.
  - Secure handling of local file permissions and access.

- **Local File Processing**
  - Scan selected directories for supported audio formats.
  - Extract metadata from local audio files (ID3 tags, etc.).
  - Generate thumbnails and album art from embedded data.
  - Cache file references for quick access.

- **Local Storage Management**
  - Store directory handles and file references securely.
  - Manage permissions and re-authorization for directory access.
  - Handle file changes and directory updates.

### **Unified Music Library**
- Combine Google Drive and local files in single interface.
- Consistent metadata display regardless of source.
- Unified search across both local and cloud sources.
- Clear source indicators (Drive vs Local icons).

### **Security & Privacy**
- Store API credentials securely in browser localStorage.
- Handle file system permissions responsibly.
- Use secure tokens, refresh on expiry.
- Provide clear credential and permission management.

---

## 3. App Core Functionality

- **Song List Page**
  - Display songs from both Google Drive and local folders with metadata, thumbnails, duration.
  - Implement search & filter by name/artist/etc. across all sources.
  - Source indicators to distinguish between Drive and local files.
  - Unified interface regardless of music source.

- **Audio Player**
  - Play/pause, seek, next/previous, shuffle, repeat.
  - Show current playing song, album art, progress bar.
  - Stream audio from Google Drive or play local files directly.
  - Seamless playback across different sources.

- **Music Source Management**
  - "Add Local Folder" functionality using File System Access API.
  - Google Drive folder connection via OAuth.
  - Manage multiple sources simultaneously.
  - Refresh and sync capabilities for both sources.

- **Offline Download**
  - "Download" button for Google Drive songs.
  - Local files are inherently available offline.
  - Use IndexedDB or Cache API to store cloud audio files.
  - List/download status (downloaded, in progress, failed).
  - Allow removing cached songs.

- **Offline Mode**
  - Show available songs when offline (local + downloaded).
  - Gracefully degrade UI when Drive is unreachable.
  - Clear indicators of what's available offline.

- **Playlist/Queue**
  - Basic playlist functionality supporting mixed sources.
  - Add, remove, reorder songs from any source.

- **Settings Page**
  - Google API credential management and editing.
  - **Google Drive folder selection and management.**
  - **Change music folder anytime without reconfiguring credentials.**
  - Local folder permissions and directory management.
  - Google Drive account information and re-authentication.
  - Offline storage management (view usage, clear cache).
  - App information and version details.

---

## 4. Progressive Web App (PWA) Features

- **Service Worker**
  - Cache app shell, static resources.
  - Cache audio files for offline playback.
  - Handle fetch events for offline fallback.

- **Manifest**
  - Add icons, name, background color, etc.
  - Enable "Add to Home Screen" support.

---

## 5. Testing

- **Unit Tests**
  - Components (song list, player, controls, dialogs, etc.).
  - Utility functions (Drive API, audio controls, offline logic).

- **Integration/E2E Tests**
  - Happy paths for login, song play, download, offline mode.
  - Error states (Drive auth fail, network loss).

- **Testing Tools**
  - Jest for unit tests.
  - React Testing Library for components.
  - (Optional) Cypress/Playwright for E2E.

---

## 6. Components Structure (Suggested)

### **Core App Components**
- `App`
- `AuthProvider`
- `MusicSourceProvider` (manages both Drive and local sources)

### **Music Source Components**
- `DriveSongFetcher` (Google Drive integration)
- `LocalFolderManager` (File System Access API)
- `MusicSourceSelector` (choose between sources)

### **UI Components**
- `SongList` (unified list supporting both sources)
- `SongListItem` (with source indicators)
- `AudioPlayer` (plays from any source)
- `SourceIndicator` (Drive/Local badges)

### **Management Components**
- `OfflineManager`
- `PlaylistManager`
- `SettingsPage`
- `CredentialSetupDialog`
- `LocalFolderSetup`
- `DownloadButton`

### **Layout Components**
- `NavBar`, `HomePage`

---

## 7. Development Milestones

1. **Project Scaffolding & Auth**
   - Basic React app, Google OAuth, Drive listing
2. **Song List & Player**
   - Core UI, fetch & display songs, play audio
3. **Offline Download & Playback**
   - IndexedDB, download/caching, offline support
4. **UI Polish & PWA**
   - Material UI integration, theming, service worker
5. **Testing**
   - Write/component tests, E2E flows
6. **Deployment**
   - Deploy as PWA (Vercel/Netlify), document setup

---

## 8. Potential Challenges

- Google OAuth refresh & drive API rate limits
- Audio streaming vs. full download
- Storage limits in browsers
- Cross-browser media support
- Handling large folders & pagination
- User privacy & token security

---

## 9. Next Steps

- Create GitHub repo & set up CI/CD.
- Register Google API credentials.
- Draft wireframes for key screens.
- Start with authentication and Drive API integration.

---

## 10. References

- [Google Drive API docs](https://developers.google.com/drive/api/v3/about-sdk)
- [PWA guidance](https://web.dev/progressive-web-apps/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---