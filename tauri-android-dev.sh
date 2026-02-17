#!/bin/bash

# Simple Android hot reload setup for Tauri
# This script ensures the emulator is running and starts Tauri dev mode

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔥 Starting Tauri Android Hot Reload${NC}\n"

# Setup Android paths
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"

# Restart ADB server to ensure clean state
echo -e "${BLUE}🔄 Restarting ADB server...${NC}"
adb kill-server >/dev/null 2>&1
adb start-server >/dev/null 2>&1
sleep 1

# Function to wait for emulator to be fully booted
wait_for_emulator_boot() {
    local emulator_serial=$1
    local timeout=300  # 5 minutes max
    local elapsed=0
    
    echo -e "${BLUE}⏳ Waiting for emulator to complete booting...${NC}"
    echo "This may take 1-2 minutes on first boot..."
    
    while [ "$elapsed" -lt "$timeout" ]; do
        # Check if device is online (not offline)
        if adb devices | grep "$emulator_serial" | grep -q "device$"; then
            # Device is online, now check if boot is completed
            boot_completed=$(adb -s "$emulator_serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
            if [ "$boot_completed" = "1" ]; then
                echo -e "${GREEN}✓ Emulator is fully booted and ready!${NC}\n"
                return 0
            fi
        fi
        sleep 5
        elapsed=$((elapsed + 5))
        printf "   Still booting... (${elapsed}s)\r"
    done
    
    echo -e "\n${RED}❌ Emulator failed to boot within timeout${NC}"
    return 1
}

# Check for any emulator (device or offline)
any_emulator=$(adb devices | grep "emulator" | head -n 1)

if [ -n "$any_emulator" ]; then
    emulator_serial=$(echo "$any_emulator" | awk '{print $1}')
    emulator_status=$(echo "$any_emulator" | awk '{print $2}')
    
    if [ "$emulator_status" = "device" ]; then
        # Check if boot is actually completed
        boot_completed=$(adb -s "$emulator_serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
        if [ "$boot_completed" = "1" ]; then
            echo -e "${GREEN}✓ Emulator already running and ready${NC}\n"
        else
            wait_for_emulator_boot "$emulator_serial" || exit 1
        fi
    elif [ "$emulator_status" = "offline" ]; then
        echo -e "${YELLOW}⚠️  Emulator detected but still booting...${NC}\n"
        wait_for_emulator_boot "$emulator_serial" || exit 1
    fi
else
    echo -e "${YELLOW}⚠️  No Android emulator found${NC}\n"
    
    # No emulator running, try to start one
    echo -e "${BLUE}🚀 Starting Android emulator...${NC}"
    
    # Get list of available AVDs
    avd_list=$($ANDROID_HOME/emulator/emulator -list-avds 2>/dev/null)
    
    if [ -z "$avd_list" ]; then
        echo -e "${RED}❌ No Android Virtual Devices found${NC}\n"
        echo "Please create an AVD first:"
        echo "  1. Open Android Studio → Device Manager"
        echo "  2. Click 'Create Device' and follow the wizard"
        exit 1
    fi
    
    # Get first emulator name
    emulator_name=$(echo "$avd_list" | head -n 1)
    echo -e "${BLUE}▶️  Starting emulator: $emulator_name${NC}"
    
    # Start emulator in background with optimized flags
    # -no-snapshot-load: Prevents issues with corrupted snapshots
    # -gpu host: Better graphics performance
    nohup $ANDROID_HOME/emulator/emulator -avd "$emulator_name" -no-snapshot-load -gpu host > /dev/null 2>&1 &
    
    # Wait a bit for emulator to appear in adb devices
    echo "⏳ Initializing emulator..."
    sleep 10
    
    # Get the emulator serial
    emulator_serial=$(adb devices | grep "emulator" | head -n 1 | awk '{print $1}')
    
    if [ -z "$emulator_serial" ]; then
        echo -e "${RED}❌ Failed to start emulator${NC}"
        echo "You can try manually starting it from Android Studio"
        exit 1
    fi
    
    wait_for_emulator_boot "$emulator_serial" || exit 1
fi
echo -e "${BLUE}🚀 Starting Tauri dev mode with hot reload...${NC}\n"
echo "📝 Edit files in src/ and see changes instantly!"
echo ""

# Ensure tauri.devUrl is set to this machine's IP so device WebView can reach it
echo -e "${BLUE}🔧 Resolving local LAN IP to update src-tauri/tauri.conf.json...${NC}"
# Detect local IPv4 address (prefer en0, en1), fallback to first non-loopback IPv4
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ifconfig | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}')
if [ -z "$LOCAL_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not detect local IP automatically.${NC}"
    echo "You can set NEXT_PUBLIC_TAURI_DEV_HOST to override."
else
    export NEXT_PUBLIC_TAURI_DEV_HOST="$LOCAL_IP"
    echo "Using NEXT_PUBLIC_TAURI_DEV_HOST=$NEXT_PUBLIC_TAURI_DEV_HOST"
fi
npm run set-dev-url || echo "Warning: set-dev-url failed or is unavailable"

# Tauri will automatically start Next.js dev server via beforeDevCommand
npm run tauri android dev -- --open
