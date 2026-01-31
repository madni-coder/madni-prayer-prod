# 📱 Mobile Development Setup Guide

## Quick Start

```bash
npm run android
```

This single command handles everything: starts the emulator, builds the app, and installs it!

---

## 🤖 Android Setup

### Prerequisites

1. **Install Android Studio**
    - Download from: https://developer.android.com/studio
    - Install Android SDK, NDK, and build tools

2. **Set Environment Variables**

    Add to your `~/.zshrc` or `~/.bashrc`:

    ```bash
    export ANDROID_HOME=$HOME/Library/Android/sdk
    export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH
    ```

    Then reload:

    ```bash
    source ~/.zshrc
    ```

3. **Create Android Virtual Device (AVD)**
    - Open Android Studio
    - Go to: Tools → Device Manager
    - Click "Create Device"
    - Choose a device (e.g., Pixel 7)
    - Select system image (e.g., API 34)
    - Finish setup

4. **Verify Setup**

    ```bash
    # Check emulator
    emulator -list-avds

    # Check ADB
    adb --version
    ```

### Available Commands

```bash
# Automated setup (recommended)
npm run android

# Manual commands
npm run android:dev      # Development mode with hot reload
npm run android:build    # Build production APK

# Direct script
./run-android.sh
```

### Alternative: Step-by-Step Commands

1. **Option A: Fully Automated (Recommended)**

    ```bash
    npm run android
    ```

2. **Option B: Development Mode Only**

    ```bash
    npm run android:dev
    ```

3. **Option C: Complete Manual Control**

    ```bash
    # List your emulators
    emulator -list-avds

    # Start emulator (replace Pixel_7_API_34 with your actual emulator name)
    emulator -avd Pixel_7_API_34 &

    # Build and run the app
    npm run android:dev
    ```

---

## 🍎 iOS Setup

### Prerequisites

1. **macOS Required**
2. **Install Xcode** from App Store
3. **Install Xcode Command Line Tools**
    ```bash
    xcode-select --install
    ```

### Available Commands

```bash
# Build iOS app
npm run ios:build

# Open in Xcode
npm run ios:dev
```

---

## Troubleshooting

### Android Emulator Not Found

```bash
# Check if ANDROID_HOME is set
echo $ANDROID_HOME

# List available emulators
emulator -list-avds

# If empty, create one in Android Studio
```

### Emulator Won't Start

```bash
# Kill existing emulator instances
adb kill-server
adb start-server

# Check running devices
adb devices
```

### Build Errors

```bash
# Clean build
npm run delete:build

# Regenerate Prisma client
npm run db:generate

# Try building again
npm run android:build
```

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## Project Structure

```
my-next-app/
├── src/                    # Next.js app source
├── src-tauri/             # Tauri mobile configuration
│   ├── gen/android/       # Generated Android project
│   └── gen/apple/         # Generated iOS project
├── run-android.sh         # Automated Android script
└── package.json           # npm scripts
```

---

## Development Workflow

1. **Start Development**

    ```bash
    npm run android
    ```

2. **Make Changes**
    - Edit files in `src/`
    - Changes hot-reload automatically

3. **Build for Production**

    ```bash
    npm run android:build
    ```

4. **APK Location**
    ```
    src-tauri/gen/android/app/build/outputs/apk/
    ```

---

## Additional Resources

- [Tauri Mobile Docs](https://beta.tauri.app/guides/prerequisites/mobile/)
- [Android Studio](https://developer.android.com/studio)
- [Next.js Documentation](https://nextjs.org/docs)
