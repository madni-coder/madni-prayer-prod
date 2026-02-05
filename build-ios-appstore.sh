#!/bin/bash

# iOS App Store Build Script for raaheHidayat
# Usage: ./build-ios-appstore.sh

set -e

echo "🍎 Building raaheHidayat for App Store..."

cd "$(dirname "$0")"

# Step 1: Build the Rust libraries if needed
echo "📦 Building Rust libraries..."
cd src-tauri

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

echo ""
echo "✅ Build complete!"
echo ""
echo "📱 Next steps:"
echo "   1. Open Xcode: src-tauri/gen/apple/raaheHidayat.xcodeproj"
echo "   2. Product → Archive"
echo "   3. Distribute App → App Store Connect"
echo ""
echo "   OR use Transporter app to upload the IPA from ipa_output/"
