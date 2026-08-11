# 🎵 Music App

A Spotify-style music player that streams **your own music from your own Google Drive folder**. Bring your Google account, pick a Drive folder, and play. Runs as a web app (PWA) and as an Android app.

## ✨ Features

- **🔐 Bring-your-own Google Drive** — connect your Google account and play music from any Drive folder
- **📁 In-app folder picker** — no folder IDs to fiddle with; choose the folder right in the app
- **🎵 Rich audio player** — play/pause, seek, shuffle, repeat, volume, queue
- **⬇️ Offline downloads** — save songs for offline listening with progress tracking
- **🔍 Search & filter** — find songs by name, artist, or album
- **📱 PWA + Android** — installable on the web, and a native Android APK built with Capacitor
- **🎨 Modern UI** — Spotify-inspired dark theme in purple, responsive on desktop and mobile

## 🚀 Quick Start (Web)

### Prerequisites

- Node.js 22+
- npm
- A Google Cloud project with the **Drive API** enabled and **OAuth 2.0** credentials

### Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. On first launch, the built-in **setup wizard** walks you through connecting Google: it deep-links to the Google Cloud Console pages you need, shows you exactly which origin to authorize, and lets you paste your Client ID — no command line required.

Prefer a `.env` file? Copy `.env.example` to `.env` and fill in `VITE_GOOGLE_CLIENT_ID` (and optionally `VITE_GOOGLE_DRIVE_FOLDER_ID` to skip the in-app folder picker).

### Google API setup (one-time)

1. [Create a Google Cloud project](https://console.cloud.google.com/projectcreate)
2. [Enable the Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
3. [Create OAuth credentials](https://console.cloud.google.com/apis/credentials) (type: Web application)
4. Add your app's origin (e.g. `http://localhost:5173` or your deployed URL) to **Authorized JavaScript origins**
5. Paste the Client ID into the app — that's it, no API key needed

> Changes to OAuth settings can take a few minutes to propagate. The setup wizard inside the app includes these exact steps with deep links.

## 📱 Android App

The Android app is built with [Capacitor](https://capacitorjs.com/) and packaged as an APK from GitHub releases.

### Install the APK

1. Grab the latest APK from the **Releases** page of this repo
2. Sideload it onto your Android device (allow "install from unknown sources")
3. Open it, run the setup wizard, and sign in with Google

### Build it yourself

```bash
npm run build          # build the web bundle
npx cap sync android   # copy web assets into the Android project
cd android && ./gradlew assembleDebug   # requires JDK 21 + Android SDK
# APK lands in android/app/build/outputs/apk/debug/
```

### Release a new version

Push a version tag and CI builds and attaches the APK automatically:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 7 (with PWA plugin + Workbox)
- **UI:** Material UI 7 with a custom purple Spotify-style theme
- **Routing:** React Router
- **Storage:** IndexedDB via Dexie (offline songs, playlists)
- **Google:** Google Identity Services (OAuth) + Drive REST API
- **Mobile:** Capacitor 7 (Android)
- **Testing:** Vitest + React Testing Library

## 🔧 Scripts

```bash
npm run dev           # start dev server
npm run build         # typecheck + production build
npm run preview       # preview the production build
npm run lint          # ESLint
npm run type-check    # TypeScript check
npm run test          # Vitest
```

## 📁 Project Structure

```
src/
├── components/     # UI (wizard, player, library, settings, ...)
├── contexts/       # Auth + music source providers
├── hooks/          # useAudioPlayer and friends
├── services/       # googleAuth, googleDrive, offlineStorage, ...
├── types/          # shared TypeScript types
└── test/           # test setup
```

## ⚠️ Note

You are responsible for having the rights to any music stored in your Google Drive.
