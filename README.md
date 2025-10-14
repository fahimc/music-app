# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

# 🎵 Music App - Spotify Clone

A modern, progressive web application that connects to Google Drive to stream and download your music collection. Built with React, TypeScript, and Material UI.

## ✨ Features

- **🔐 Google Drive Integration** - Connect your Google account and access music files directly from Drive
- **🎵 Rich Audio Player** - Full-featured player with play/pause, seek, shuffle, repeat, and volume controls
- **📱 Progressive Web App** - Install on your device and use offline with cached songs
- **⬇️ Offline Downloads** - Download songs for offline listening with progress tracking
- **🔍 Search & Filter** - Find songs quickly by name, artist, or album
- **🎨 Modern UI** - Spotify-inspired dark theme with smooth animations
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Console project with Drive API enabled
- Google OAuth 2.0 credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd music-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google API credentials:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_GOOGLE_API_KEY=your_google_api_key
   VITE_GOOGLE_DRIVE_FOLDER_ID=optional_specific_folder_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Google API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials (Web application)
5. Add your domain to authorized origins
6. Copy Client ID and API Key to your `.env` file

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── NavBar.tsx      # Navigation bar
│   ├── HomePage.tsx    # Landing page
│   ├── SongListPage.tsx # Music library (WIP)
│   └── SettingsPage.tsx # App settings (WIP)
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication provider
├── services/           # API and business logic
│   ├── googleAuth.ts   # Google OAuth service
│   ├── googleDrive.ts  # Google Drive API
│   └── offlineStorage.ts # IndexedDB operations
├── types/              # TypeScript definitions
│   └── index.ts        # All type definitions
├── hooks/              # Custom React hooks (planned)
└── utils/              # Utility functions (planned)
```

## 🛠️ Tech Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 5
- **UI Library:** Material UI 6
- **Routing:** React Router DOM 6
- **PWA:** Vite PWA plugin with Workbox
- **Storage:** IndexedDB with Dexie
- **API:** Google Drive REST API
- **Styling:** Material UI with custom theming
- **Testing:** Vitest + React Testing Library

## 📱 Progressive Web App

This app is designed as a PWA and includes:

- **Service Worker** for offline caching
- **Web App Manifest** for installation
- **Offline Storage** using IndexedDB
- **Background Sync** for downloads (planned)

To install as PWA:
1. Open the app in a supported browser
2. Look for "Install App" prompt or menu option
3. Follow installation steps

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Development Workflow

1. **Authentication** - Test OAuth flow with development credentials
2. **API Integration** - Connect to Google Drive API
3. **Core Features** - Implement song listing and audio player
4. **Offline Features** - Add download and offline playback
5. **Testing** - Add comprehensive test coverage
6. **Deployment** - Deploy as PWA

## 🎯 Current Status

**Development Progress: ~25%**

✅ **Completed:**
- Project setup and configuration
- Google OAuth integration (service layer)
- Basic UI components and navigation
- PWA configuration  
- Offline storage system

🔄 **In Progress:**
- Authentication UI testing
- Error handling improvements

❌ **Pending:**
- Song list implementation
- Audio player functionality  
- Download features
- Settings management
- Comprehensive testing

See [CHECKLIST.md](./CHECKLIST.md) for detailed progress tracking.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Roadmap

### Phase 1: Core Features (Current)
- [ ] Complete authentication flow
- [ ] Implement song listing from Google Drive
- [ ] Build audio player with basic controls
- [ ] Add download functionality

### Phase 2: Enhanced Experience  
- [ ] Playlist management
- [ ] Advanced search and filtering
- [ ] Audio visualization
- [ ] Keyboard shortcuts

### Phase 3: Social & Sync
- [ ] Multiple Google accounts
- [ ] Cloud playlist sync
- [ ] Sharing capabilities
- [ ] Usage analytics

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Spotify's user interface and experience
- Built with modern React and Material UI
- Powered by Google Drive API for music storage

---

**⚠️ Note:** This is a development project. Ensure you have proper rights to any music files stored in your Google Drive.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
