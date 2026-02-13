#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Restart ADB server for clean state
echo -e "${BLUE}🔄 Restarting ADB server...${NC}"
adb kill-server >/dev/null 2>&1
adb start-server >/dev/null 2>&1
sleep 1

# Step 1: Check if Android emulator is available
echo -e "${BLUE}📱 Checking for Android emulators...${NC}"

# Check if emulator command exists
if ! command -v emulator &> /dev/null; then
    if [ -f "$ANDROID_HOME/emulator/emulator" ]; then
        # emulator exists but not in PATH
        echo -e "${YELLOW}⚠️  Emulator found but not in PATH, using direct path${NC}"
    else
        echo -e "${RED}❌ Android emulator not found.${NC}"
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
fi

emulator_list=$($ANDROID_HOME/emulator/emulator -list-avds 2>/dev/null)

if [ -z "$emulator_list" ]; then
    echo -e "${RED}❌ No Android emulators found.${NC}"
    echo "Please create one using Android Studio:"
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
running_devices=$(adb devices | grep "emulator.*device$" | wc -l)

if [ "$running_devices" -eq 0 ]; then
    # Check if there's an offline emulator (still booting)
    offline_emulator=$(adb devices | grep "emulator.*offline" | wc -l)
    
    if [ "$offline_emulator" -gt 0 ]; then
        echo -e "${BLUE}📱 Emulator is booting... waiting for it to come online${NC}"
        echo "This may take 1-2 minutes on first boot..."
        
        # Wait for device to come online
        timeout=180  # 3 minutes max
        elapsed=0
        while [ "$elapsed" -lt "$timeout" ]; do
            if adb devices | grep -q "emulator.*device$"; then
                echo -e "${GREEN}✓ Emulator is now ready!${NC}\n"
                break
            fi
            sleep 5
            elapsed=$((elapsed + 5))
            echo "   Still waiting... (${elapsed}s)"
        done
        
        if [ "$elapsed" -ge "$timeout" ]; then
            echo -e "${RED}❌ Emulator failed to boot within timeout${NC}"
            echo "Please check the emulator window for errors or start it manually from Android Studio"
            exit 1
        fi
    else
        echo -e "${BLUE}▶️  Starting emulator: $emulator_name${NC}"
        nohup $ANDROID_HOME/emulator/emulator -avd "$emulator_name" > /dev/null 2>&1 &
        
        # Wait for emulator to appear and boot
        echo "⏳ Waiting for emulator to boot..."
        sleep 10
        
        # Wait for boot to complete
        timeout=180  # 3 minutes max
        elapsed=0
        while [ "$elapsed" -lt "$timeout" ]; do
            if adb devices | grep -q "emulator.*device$"; then
                echo -e "${GREEN}✓ Emulator started successfully${NC}\n"
                break
            fi
            sleep 5
            elapsed=$((elapsed + 5))
            echo "   Still booting... (${elapsed}s)"
        done
        
        if [ "$elapsed" -ge "$timeout" ]; then
            echo -e "${RED}❌ Emulator failed to boot within timeout${NC}"
            echo "You can try manually starting it from Android Studio"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✓ Emulator already running${NC}\n"
fi

# Step 3: Build and run the app
echo -e "${BLUE}🔨 Building and installing the app...${NC}"
npm run tauri android dev

echo -e "${GREEN}✓ Done!${NC}"
