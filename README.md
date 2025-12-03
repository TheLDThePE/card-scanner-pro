# Card Scanner PWA

A real-time card scanning system built with React, Vite, and Firebase.

## Features
- **Real-time Scanning**: Instant updates across all connected devices.
- **Offline Support**: Queues scans when offline and syncs when back online.
- **Multi-Device**: Supports 10+ concurrent devices with unique IDs.
- **USB Card Reader**: Optimized for keyboard emulation card readers.
- **Statistics**: Real-time dashboard of scan activity.

## Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Firebase Configuration**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable **Firestore Database**
   - Copy your web app configuration
   - Update `src/firebase.js` with your config keys

3. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment

1. **Build**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

## Usage
- Connect a USB card reader to your device.
- Open the app in a browser.
- Scan a card. The input field will auto-focus and auto-submit upon detecting 10 digits.
- View real-time records and statistics.

## Testing
- **Mock Cards**: Use `1234567890`, `0987654321`, `1111222233` to test matching.
- **Offline Mode**: Disconnect your internet to test offline queuing.
