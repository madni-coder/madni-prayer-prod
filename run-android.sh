#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Android Development Setup...${NC}\n"

# Setup Android SDK paths
if [ -z "$ANDROID_HOME" ]; then
    # Common Android SDK locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "/usr/local/android-sdk" ]; then
        export ANDROID_HOME="/usr/local/android-sdk"
    fi
fi

# Add Android tools to PATH
if [ -n "$ANDROID_HOME" ]; then
    export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"
fi

# Step 1: Check if Android emulator is available
echo -e "${BLUE}📱 Checking for Android emulators...${NC}"

# Check if emulator command exists
if ! command -v emulator &> /dev/null; then
    echo -e "${YELLOW}⚠️  Android emulator not found.${NC}"
    echo ""
    echo "Please ensure Android Studio is installed and set up:"
    echo "1. Install Android Studio from https://developer.android.com/studio"
    echo "2. Set ANDROID_HOME environment variable"
    echo "3. Create an Android Virtual Device (AVD) in Android Studio"
    echo ""
    echo "Add to your ~/.zshrc or ~/.bashrc:"
    echo 'export ANDROID_HOME=$HOME/Library/Android/sdk'
    echo 'export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH'
    exit 1
fi

emulator_list=$(emulator -list-avds 2>/dev/null)

if [ -z "$emulator_list" ]; then
    echo "❌ No Android emulators found. Please create one using Android Studio."
    echo "   Run: Android Studio -> Device Manager -> Create Device"
    exit 1
fi

echo -e "${GREEN}✓ Available emulators:${NC}"
echo "$emulator_list"
echo ""

# Get first emulator name
emulator_name=$(echo "$emulator_list" | head -n 1)

# Step 2: Start emulator if not running
echo -e "${BLUE}🔄 Checking if emulator is running...${NC}"
running_devices=$(adb devices | grep "emulator" | wc -l)

if [ "$running_devices" -eq 0 ]; then
    echo -e "${BLUE}▶️  Starting emulator: $emulator_name${NC}"
    emulator -avd "$emulator_name" &
    
    # Wait for emulator to boot
    echo "⏳ Waiting for emulator to boot..."
    adb wait-for-device
    
    # Wait for boot to complete
    while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
        sleep 2
        echo "   Still booting..."
    done
    
    echo -e "${GREEN}✓ Emulator started successfully${NC}\n"
else
    echo -e "${GREEN}✓ Emulator already running${NC}\n"
fi

# Step 3: Build and run the app
echo -e "${BLUE}🔨 Building and installing the app...${NC}"
npm run tauri android dev

echo -e "${GREEN}✓ Done!${NC}"
