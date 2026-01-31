#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔥 Starting Android Hot Reload Development${NC}\n"

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

if [ -z "$LOCAL_IP" ]; then
    echo -e "${YELLOW}⚠️  Could not detect local IP. Using localhost (hot reload may not work)${NC}"
    LOCAL_IP="localhost"
else
    echo -e "${GREEN}✓ Local IP detected: $LOCAL_IP${NC}"
fi

# Setup Android SDK paths
if [ -z "$ANDROID_HOME" ]; then
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    fi
fi

if [ -n "$ANDROID_HOME" ]; then
    export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"
fi

echo -e "${BLUE}📱 Checking for running Android emulators...${NC}"

# Check if any emulator is running
running_devices=$(adb devices | grep "emulator" | grep -v "offline" | wc -l)

if [ "$running_devices" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No Android emulator is running${NC}"
    echo ""
    echo "Please start an emulator first:"
    echo "1. Open Android Studio"
    echo "2. Go to Device Manager (phone icon)"
    echo "3. Click play on any emulator"
    echo ""
    echo "OR run this command:"
    echo "  $ANDROID_HOME/emulator/emulator -avd oneplus11r &"
    echo ""
    read -p "Press Enter once emulator is running..."
fi

echo -e "${GREEN}✓ Emulator detected${NC}\n"

# Update tauri.conf.json with local IP
echo -e "${BLUE}🔧 Configuring hot reload with IP: $LOCAL_IP${NC}"

# Backup original config
cp src-tauri/tauri.conf.json src-tauri/tauri.conf.json.backup

# Update devUrl in tauri.conf.json
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|\"devUrl\": \"http://localhost:3000/\"|\"devUrl\": \"http://$LOCAL_IP:3000/\"|g" src-tauri/tauri.conf.json
else
    sed -i "s|\"devUrl\": \"http://localhost:3000/\"|\"devUrl\": \"http://$LOCAL_IP:3000/\"|g" src-tauri/tauri.conf.json
fi

echo -e "${GREEN}✓ Configuration updated${NC}\n"

# Start Next.js dev server in background
echo -e "${BLUE}🚀 Starting Next.js dev server...${NC}"
npm run dev &
DEV_SERVER_PID=$!

# Wait for dev server to start
sleep 5

echo -e "${GREEN}✓ Dev server started at http://$LOCAL_IP:3000${NC}\n"

# Start Tauri Android dev
echo -e "${BLUE}📦 Building and launching Android app with hot reload...${NC}\n"
npm run tauri android dev

# Cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    kill $DEV_SERVER_PID 2>/dev/null
    # Restore original config
    if [ -f src-tauri/tauri.conf.json.backup ]; then
        mv src-tauri/tauri.conf.json.backup src-tauri/tauri.conf.json
    fi
    echo -e "${GREEN}✓ Done${NC}"
}

trap cleanup EXIT
