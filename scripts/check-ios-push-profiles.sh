#!/bin/bash
# Reports whether the iOS provisioning profiles on this machine actually carry
# the aps-environment entitlement.
#
# Why this exists: granting the notification permission prompt on the device
# only authorises *displaying* notifications (UNUserNotificationCenter). Talking
# to APNs is gated separately by the aps-environment entitlement, which comes
# from the provisioning profile. A profile created before Push Notifications was
# enabled on the App ID has no aps-environment, codesign silently drops it, and
# registerForRemoteNotifications() then fails with "no valid aps-environment
# entitlement string found for application" — so no device token is ever issued
# and the app can never subscribe to any topic.
#
# Usage: ./scripts/check-ios-push-profiles.sh [bundle-id]

set -uo pipefail

BUNDLE_ID="${1:-com.prayer.raahe}"
PROFILE_DIRS=(
	"$HOME/Library/Developer/Xcode/UserData/Provisioning Profiles"
	"$HOME/Library/MobileDevice/Provisioning Profiles"
)

echo "Provisioning profiles for ${BUNDLE_ID}:"
echo

found=0
has_dev=0
has_prod=0

for dir in "${PROFILE_DIRS[@]}"; do
	[ -d "$dir" ] || continue
	while IFS= read -r profile; do
		plist="$(security cms -D -i "$profile" 2>/dev/null)" || continue
		app_id="$(printf '%s' "$plist" | plutil -extract Entitlements.application-identifier raw -o - - 2>/dev/null)" || continue
		case "$app_id" in
			*".${BUNDLE_ID}") ;;
			*) continue ;;
		esac

		found=1
		name="$(printf '%s' "$plist" | plutil -extract Name raw -o - - 2>/dev/null)"
		expires="$(printf '%s' "$plist" | plutil -extract ExpirationDate raw -o - - 2>/dev/null)"
		aps="$(printf '%s' "$plist" | plutil -extract Entitlements.aps-environment raw -o - - 2>/dev/null)"

		case "$aps" in
			development) mark="✅"; has_dev=1 ;;
			production)  mark="✅"; has_prod=1 ;;
			*)           mark="❌"; aps="<missing — no push capability>" ;;
		esac
		printf '  %s %-52s aps-environment=%s\n' "$mark" "$name" "$aps"
		printf '     expires: %s\n' "$expires"
	done < <(find "$dir" -name "*.mobileprovision" 2>/dev/null)
done

echo
if [ "$found" -eq 0 ]; then
	echo "❌ No profiles found for ${BUNDLE_ID}. Open the Xcode project once to have Xcode fetch them."
	exit 1
fi

[ "$has_dev" -eq 1 ]  && echo "✅ A development profile with push is available (Xcode debug builds)." \
                      || echo "❌ No development profile with push — 'npm run ios:dev' builds cannot receive push."
[ "$has_prod" -eq 1 ] && echo "✅ A distribution profile with push is available (TestFlight / App Store)." \
                      || echo "❌ No distribution profile with push — TestFlight / App Store builds cannot receive push."

if [ "$has_prod" -eq 0 ] || [ "$has_dev" -eq 0 ]; then
	echo
	echo "Fix: developer.apple.com -> Certificates, Identifiers & Profiles -> Identifiers"
	echo "     -> ${BUNDLE_ID} -> tick 'Push Notifications' -> Save,"
	echo "     then regenerate and redownload the affected profiles."
	exit 1
fi

echo
echo "Reminder: the entitlement must match the server's PUSH_APNS_SANDBOX flag —"
echo "  development => PUSH_APNS_SANDBOX=true, production => PUSH_APNS_SANDBOX=false."
