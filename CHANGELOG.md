# Changelog

All notable changes to the Music App project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **Folder scope filtering** - Songs now properly load from selected Music folder instead of root
- **Music folder visibility** - Music folder now appears in folder selection list
- **Folder loading** - All folders (not just root-level) now appear in selection dialog
- **Folder ID usage** - MusicSourceContext now uses stored folder ID when loading songs
- **System folder filtering** - Excluded hidden/system folders (like .bin folders) from folder selection
- **Folder listing improvements** - Now only shows user-created folders in top-level My Drive
- **Better folder queries** - Improved Drive API queries to exclude system files and show only folders
- **User info loading error** - Fixed 401 Unauthorized error when fetching user information after sign-in
- **Folder loading error** - Added `listFiles` method to googleDriveService for folder browsing
- **Async token handling** - Improved async/await handling in token callbacks
- **Empty response handling** - Added null checks for API responses
- **Migrated to Google Identity Services (GIS)** - Replaced deprecated `gapi.auth2` with modern Google Identity Services library
- **Fixed missing Link import** - Added missing Material-UI Link import in HomePage component
- **Session Persistence** - Users no longer need to re-login when navigating between pages
- **Token Management** - Improved token refresh and expiry handling
- **Enhanced authorization origin error handling** - Clear, actionable error messages when OAuth origin is not configured
- **Better error display** - Authorization errors now show step-by-step fix instructions with exact URL to add
- **Improved reinitialization error handling** - Preserves original error messages for authorization errors
- **Updated test coverage** - Tests now properly validate authorization origin error handling
- **ConfigurationError component enhancement** - Added dedicated UI for authorization origin errors with quick fix guide
- **HomePage error alerts** - Better visual presentation of authorization errors with copy-paste ready URLs

### Added
- **Playlist/Collection Management** - Create and manage custom playlists like Spotify
  - Create playlists with names and descriptions
  - Add/remove songs to/from playlists
  - Edit playlist details
  - Delete playlists
  - View playlist contents
  - Playlists persist in localStorage
- **PlaylistDialog Component** - Modal dialog for playlist management
- **PlaylistService** - Complete playlist CRUD operations
- **Tabs in Song List** - Switch between "All Songs" and "Playlists" views
- **Playlist Sidebar** - Quick access to all playlists
- **Add to Playlist** - Right-click menu option for songs
- **Music folder detection** - Automatically finds and highlights "Music" folder if it exists
- **Music folder suggestion** - Shows a success alert when Music folder is found
- **Folder recommendations** - Music folder gets a "Recommended" badge and special highlighting
- **findFolderByName method** - New method to search for specific folders by name in Google Drive
- **Better folder filtering** - Only shows relevant user folders, not system/hidden folders
- **listFiles method** - New method in googleDriveService to list all files and folders (not just audio)
- **Persistent Login** - User authentication now persists across browser sessions using localStorage
- **Folder Selection Dialog** - Users can now select specific Google Drive folder for music scanning
- **Automatic Folder Prompt** - After login, users are prompted to select a music folder if not already configured
- **Folder Management in Settings** - Change selected Google Drive folder anytime from Settings page
- **Auth State Persistence** - Access tokens and user info are securely stored and restored
- **FolderSelectionDialog Component** - New UI for browsing and selecting Google Drive folders
- **Root Folder Option** - Users can choose to scan entire Google Drive or specific folder

### Changed
- **Authentication library upgrade** - Migrated from deprecated Google Platform Library (gapi.auth2) to Google Identity Services
- **Token-based authentication** - Now using modern OAuth 2.0 token flow instead of deprecated auth2 flow
- **Improved security** - Using Google's recommended authentication approach with better security practices
- **Enhanced UX** - Smoother onboarding flow with folder selection after login
- **Better error handling** - Async operations properly wrapped in try-catch blocks
- **Credential editing and management** - Update credentials directly from Settings page
- **Offline storage statistics** - View downloaded song count and storage usage
- **Account information display** - Show connected Google account details
- **Enhanced error handling** - Better user experience when credentials are missing or invalid
- **OAuth Authorization Fix Guide** - Detailed instructions for fixing "Not a valid origin" errors
- **Automatic origin detection** - App shows exact URL to add to Google OAuth settings
- **Authorization error alerts** - Clear error messages with actionable fix buttons

### Fixed
- Fixed Google OAuth initialization error when environment variables are missing
- Added proper error handling and user-friendly configuration instructions
- NavBar now shows appropriate status when OAuth is not configured
- Improved credential storage security with validation

### Added
- Initial React TypeScript project setup with Vite
- PWA configuration with service worker support
- Material UI theming with Spotify-like dark theme
- Google OAuth authentication system
- Google Drive API integration service
- IndexedDB offline storage system using Dexie
- Basic project structure with components, services, hooks, types, and utils
- Navigation bar with authentication status
- Home page with feature showcase and authentication flow
- **Functional SongList component** - Displays music from Google Drive with search functionality
- **Audio Player** - Full-featured player with play/pause, seek, shuffle, repeat, and volume controls
- **Audio Player Context** - Shared state management for audio playback across components
- **Song search and filtering** - Real-time search through song names and artists
- **Download status tracking** - Visual indicators for offline-available songs
- **Credential Storage Service** - Secure management of Google API credentials with validation
- **Credential Setup Dialog** - User-friendly form for configuring Google API credentials
- **Configuration Error Component** - Helpful error handling with setup instructions
- **Comprehensive Settings Page** - Credential management, storage stats, account info
- **Authentication Reinitialize** - Ability to update credentials and restart auth service
- TypeScript type definitions for songs, playlists, auth, and API responses

### Infrastructure
- Vite build system with React TypeScript template
- ESLint and TypeScript configuration
- PWA manifest and service worker setup
- Environment variables configuration for Google API credentials

### Dependencies
- React 19.1.1 with TypeScript support
- React Router DOM for navigation
- Material UI component library with icons
- Google APIs client library (googleapis, gapi-script)
- Dexie for IndexedDB operations
- Vite PWA plugin for progressive web app features
- Testing libraries (React Testing Library, Vitest, jsdom)
- Development tools (Prettier, Husky, lint-staged)

## [0.0.0] - 2025-01-14

### Added
- Project initialization with basic package.json structure
- Initial repository setup