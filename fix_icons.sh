#!/bin/bash
cd "/Volumes/Office Work/prayer/my-next-app/src-tauri/gen/apple/Assets.xcassets/AppIcon.appiconset"
for f in *.png; do
  magick "$f" -background white -alpha remove -alpha off "$f"
done
echo "Alpha removed from all icons!"
