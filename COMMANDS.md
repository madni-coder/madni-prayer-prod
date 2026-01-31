# 🚀 Quick Command Reference

## One-Line Commands

### 🤖 Android

```bash
# Start emulator, build and install app (all-in-one)
npm run android

# Development mode only
npm run android:dev

# Build APK only
npm run android:build
```

### 🍎 iOS

```bash
# Open in Xcode
npm run ios:dev

# Build iOS app
npm run ios:build
```

### 🌐 Web

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

### 🗄️ Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

---

## First Time Setup

### Android (macOS)

```bash
# 1. Add to ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH

# 2. Reload shell
source ~/.zshrc

# 3. Verify
emulator -list-avds

# 4. Run app
npm run android
```

### iOS (macOS only)

```bash
# 1. Install Xcode from App Store
# 2. Install command line tools
xcode-select --install

# 3. Run app
npm run ios:dev
```

---

## Troubleshooting One-Liners

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart ADB
adb kill-server && adb start-server

# List running devices
adb devices

# List available emulators
emulator -list-avds

# Clean build
npm run delete:build
```
