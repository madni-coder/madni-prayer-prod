#!/bin/bash

# Simple Android hot reload setup for Tauri
# This script just ensures the emulator is running and starts Tauri dev mode

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔥 Starting Tauri Android Hot Reload${NC}\n"

# Setup Android paths
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
export PATH="$ANDROID_HOME/platform-tools:$PATH"

# Check for running emulator
if ! adb devices | grep -q "emulator.*device"; then
    echo -e "${YELLOW}⚠️  No Android emulator running${NC}\n"
    echo "Please start an emulator first:"
    echo "  1. Open Android Studio → Device Manager"
    echo "  2. Click play on any emulator"
    echo ""
    read -p "Press Enter once emulator is running..."
fi

echo -e "${GREEN}✓ Emulator detected${NC}\n"
echo -e "${BLUE}🚀 Starting Tauri dev mode with hot reload...${NC}\n"
echo "📝 Edit files in src/ and see changes instantly!"
echo ""

# Tauri will automatically start Next.js dev server via beforeDevCommand
npm run tauri android dev
