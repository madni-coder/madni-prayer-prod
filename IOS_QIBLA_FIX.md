# iOS Qibla Compass Fix

## Problem

The Qibla compass was not working on iOS devices because:

1. iOS requires explicit permission (`NSMotionUsageDescription`) in Info.plist to access device motion/orientation sensors
2. The permission request in JavaScript wasn't functioning properly without the plist entry

## Solution

### 1. Updated JavaScript Code

Modified [src/app/qibla/page.js](src/app/qibla/page.js) to:

- Add proper permission request handling for iOS 13+
- Display error messages if permission is denied
- Show a button to enable compass if permission isn't granted
- Better handling of device orientation events

### 2. Added iOS Permission Configuration

Created `fix-ios-plist.sh` script that automatically adds `NSMotionUsageDescription` to the iOS Info.plist file.

### 3. Updated Build Scripts

Modified package.json to automatically run the plist fix before iOS builds:

- `npm run ios:dev` - Now includes plist fix
- `npm run ios:build` - Now includes plist fix
- `npm run ios:appstore` - Now includes plist fix

## Usage

### For Development

```bash
npm run ios:dev
```

### For Production Build

```bash
npm run ios:build
# or
npm run ios:appstore
```

### Manual Fix (if needed)

If you need to manually add the permission:

```bash
./fix-ios-plist.sh
```

## Technical Details

### Permission Added to Info.plist

```xml
<key>NSMotionUsageDescription</key>
<string>We need access to the device's motion sensors to show the Qibla direction accurately.</string>
```

### JavaScript Permission Flow

1. Component mounts and requests device orientation permission
2. On iOS 13+, shows native permission dialog
3. If granted, starts listening to device orientation events
4. If denied, shows error message with instructions
5. Compass updates in real-time as device rotates

### Browser Compatibility

- **iOS 13+**: Requires user permission via DeviceOrientationEvent.requestPermission()
- **iOS < 13**: Works automatically
- **Android**: Works automatically (no permission needed for web)
- **Desktop**: May not work (no compass hardware)

## Testing

1. Build and install the app on an iOS device
2. Navigate to Qibla direction page
3. If prompted, tap "Enable Compass" button
4. Grant permission in the system dialog
5. Compass should start working and update as you rotate the device

## Troubleshooting

### Compass still not working after update

1. Uninstall the old app completely from the device
2. Rebuild: `npm run ios:build`
3. Reinstall the app
4. Grant permission when prompted

### Permission dialog not appearing

1. Check if permission was previously denied in iOS Settings
2. Go to iOS Settings > Privacy & Security > Motion & Fitness
3. Enable permission for the app
4. Restart the app

### Script permission error

```bash
chmod +x fix-ios-plist.sh
```
