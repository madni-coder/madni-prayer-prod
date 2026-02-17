#!/bin/bash

# iOS App Store Build Script for raaheHidayat
# Usage: ./build-ios-appstore.sh

set -euo pipefail

echo "🍎 Building raaheHidayat for App Store..."

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_TAURI_DIR="$ROOT_DIR/src-tauri"
APPLE_GEN_DIR="$SRC_TAURI_DIR/gen/apple"
WORKSPACE_PATH="$APPLE_GEN_DIR/raaheHidayat.xcodeproj/project.xcworkspace"
ARCHIVE_PATH="$ROOT_DIR/ipa_output/raaheHidayat.xcarchive"
EXPORT_PATH="$ROOT_DIR/ipa_output"
PRIMARY_EXPORT_OPTIONS="$ROOT_DIR/ExportOptions.plist"
FALLBACK_EXPORT_OPTIONS="$APPLE_GEN_DIR/exportOptionsAppStore.plist"

# Step 1: Build the Rust libraries if needed
echo "📦 Building Rust libraries..."
cd "$SRC_TAURI_DIR"

# Build for device (arm64) - required for App Store
cargo build --release --target aarch64-apple-ios --lib

# Create Externals directory if needed
mkdir -p gen/apple/Externals/arm64/release

# Copy the library with correct name
cp target/aarch64-apple-ios/release/libapp_lib.a gen/apple/Externals/arm64/release/libapp.a

echo "✅ Rust libraries ready"

cd ..

# Step 2: Run Tauri iOS build
echo "🔨 Running Tauri iOS build..."
npm run tauri ios build -- --target aarch64

# Step 3: Archive
echo "📦 Creating Xcode archive..."
mkdir -p "$EXPORT_PATH"
rm -rf "$ARCHIVE_PATH"

xcodebuild \
	-workspace "$WORKSPACE_PATH" \
	-scheme raaheHidayat_iOS \
	-configuration Release \
	-destination "generic/platform=iOS" \
	-archivePath "$ARCHIVE_PATH" \
	-allowProvisioningUpdates \
	archive

# Step 4: Export IPA
echo "📤 Exporting IPA..."

EXPORT_OPTIONS_TO_USE="$FALLBACK_EXPORT_OPTIONS"
if [ ! -f "$EXPORT_OPTIONS_TO_USE" ]; then
	EXPORT_OPTIONS_TO_USE="$PRIMARY_EXPORT_OPTIONS"
fi

if [ ! -f "$EXPORT_OPTIONS_TO_USE" ]; then
	echo "❌ Could not find ExportOptions.plist"
	exit 1
fi

xcodebuild \
	-exportArchive \
	-archivePath "$ARCHIVE_PATH" \
	-exportPath "$EXPORT_PATH" \
	-exportOptionsPlist "$EXPORT_OPTIONS_TO_USE" \
	-allowProvisioningUpdates

echo ""
echo "✅ Build + archive + export complete!"
echo ""
echo "📦 Archive: $ARCHIVE_PATH"
echo "📱 Export folder: $EXPORT_PATH"
echo ""
ls -lh "$EXPORT_PATH" | sed 's/^/   /'
