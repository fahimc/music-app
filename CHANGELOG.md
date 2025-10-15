# Changelog

All notable changes to the Music App project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **User-friendly credential management system** - No more environment variable setup required
- **In-app credential validation and testing** - Real-time validation of Google API credentials
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