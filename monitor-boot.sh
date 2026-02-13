#!/bin/bash

# Monitor emulator until it's fully booted

echo "Monitoring emulator boot..."
echo "Press Ctrl+C to stop"
echo ""

count=0
while true; do
    count=$((count + 1))
    
    # Get device status
    device_line=$(adb devices | grep "emulator-" | head -n1)
    
    if [ -z "$device_line" ]; then
        echo "[$count] No emulator detected"
        sleep 5
        continue
    fi
    
    serial=$(echo "$device_line" | awk '{print $1}')
    status=$(echo "$device_line" | awk '{print $2}')
    
    if [ "$status" = "device" ]; then
        boot_completed=$(adb -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
        if [ "$boot_completed" = "1" ]; then
            echo "[$count] ✓ Emulator $serial is FULLY BOOTED and READY!"
            
            # Get Android version info
            android_ver=$(adb -s "$serial" shell getprop ro.build.version.release 2>/dev/null | tr -d '\r')
            api_level=$(adb -s "$serial" shell getprop ro.build.version.sdk 2>/dev/null | tr -d '\r')
            echo "       Android $android_ver (API $api_level)"
            exit 0
        else
            echo "[$count] ⏳ Emulator $serial is online but still finalizing boot..."
        fi
    elif [ "$status" = "offline" ]; then
        echo "[$count] ⏳ Emulator $serial is offline (booting...)"
    else
        echo "[$count] ? Emulator $serial has status: $status"
    fi
    
    sleep 5
done
