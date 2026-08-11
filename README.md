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
- For the default **central mode**: one Google Cloud project with the **Drive API** enabled and **OAuth 2.0** credentials (yours)

### Run it

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. If the build ships with a Client ID (see below), users just click **Sign in with Google** — nothing else to set up.

### Two ways to configure Google

**Central mode (recommended, default for the deployed app)** — you (the app owner) put your Client ID in the build, and every user signs in with their own Google account. Users never touch Google Cloud Console.

```bash
cp .env.example .env
# fill in VITE_GOOGLE_CLIENT_ID with YOUR client ID
npm run build
```

**Bring-your-own mode** — for self-hosting or personal use. Build without a Client ID (leave `VITE_GOOGLE_CLIENT_ID` empty), and the in-app wizard walks each user through creating their own Google project, Client ID, and origin. To do this after the app is built, use **Settings → Use My Own Client ID**.

### One-time Google API setup (app owner)

1. [Create a Google Cloud project](https://console.cloud.google.com/projectcreate)
2. [Enable the Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
3. [Create OAuth credentials](https://console.cloud.google.com/apis/credentials)
   - **Web application** client — used by the web app and as the `webClientId` for native sign-in
   - **Android** client — used by the APK (package name `com.fahimc.music` + your signing key's SHA-1)
4. Add your app's web origin (e.g. `http://localhost:5173`, your deployed URL) to the **web client's** Authorized JavaScript origins
5. Put the web Client ID in `.env` and rebuild

> Changes to OAuth settings can take a few minutes to propagate. With many users, you'll also want to complete Google's OAuth app verification (free, one-time) so the "unverified app" screen goes away past ~100 users.

## 📱 Android App

The Android app is built with [Capacitor](https://capacitorjs.com/) and packaged as an APK from GitHub releases.

### Install the APK

1. Grab the latest APK from the **Releases** page of this repo
2. Sideload it onto your Android device (allow "install from unknown sources")
3. Open it, run the setup wizard, and sign in with Google

> **For the APK to sign in, the Android OAuth client in Google Cloud Console must match the build's signing key:** the debug APK uses your debug keystore's SHA-1, the release APK uses the release key's SHA-1 (and if you publish to Play, Play App Signing's SHA-1). Get the SHA-1 with `cd android && ./gradlew signingReport` (debug) or `keytool -printcert -jarfile <your.apk>` (release). If sign-in fails with `28444`, the package name (`com.fahimc.music`) or SHA-1 doesn't match what's registered.

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
- **Google:** Google Identity Services (web) + native Google Sign-In (Android) + Drive REST API
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
