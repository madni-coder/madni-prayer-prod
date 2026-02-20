#!/bin/bash

# Script to add NSMotionUsageDescription to iOS Info.plist for Qibla compass functionality

# Ensure tauri devUrl points to local dev server when running this helper directly
node "$(dirname "$0")/scripts/set-dev-url.js" || true

PLIST_FILE="src-tauri/gen/apple/raaheHidayat_iOS/Info.plist"

if [ ! -f "$PLIST_FILE" ]; then
    echo "Info.plist not found at $PLIST_FILE"
    echo "Please run 'npm run tauri ios init' or 'npm run tauri ios dev' first to generate the file."
    exit 1
fi

# Check if NSMotionUsageDescription already exists
if grep -q "NSMotionUsageDescription" "$PLIST_FILE"; then
    echo "NSMotionUsageDescription already exists in Info.plist"
    exit 0
fi

# Add NSMotionUsageDescription before the closing </dict>
# Using perl for cross-platform compatibility
perl -i -pe 's|</dict>\n</plist>|\t<key>NSMotionUsageDescription</key>\n\t<string>We need access to the device'\''s motion sensors to show the Qibla direction accurately.</string>\n</dict>\n</plist>|' "$PLIST_FILE"

echo "Successfully added NSMotionUsageDescription to Info.plist"
