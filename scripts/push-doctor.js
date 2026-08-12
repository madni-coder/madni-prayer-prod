#!/usr/bin/env node
/**
 * Push notification diagnostic.
 *
 *   node --env-file=.env scripts/push-doctor.js <android|ios> <device-token>
 *
 * Walks the exact path a real notification takes and reports where it breaks:
 *   1. Firebase Admin credentials load
 *   2. (iOS only) APNs token -> FCM token via Instance ID batchImport
 *   3. Direct send to that single token      <- proves APNs/FCM + app setup
 *   4. Subscribe the token to a test topic   <- proves topic fan-out
 *   5. Send to the topic
 *
 * Steps 3 and 5 each deliver a real notification to the phone. If 3 arrives
 * but 5 does not, the problem is topic subscription. If neither arrives, the
 * problem is the app/APNs/FCM registration itself.
 */
const admin = require("firebase-admin");

const [, , platform, token] = process.argv;
const TOPIC = "push_doctor_test";

function fail(step, err) {
    console.error(`\n❌ ${step}\n   ${err?.message || err}\n`);
    process.exit(1);
}

async function main() {
    if (!["android", "ios"].includes(platform) || !token) {
        console.error("Usage: node --env-file=.env scripts/push-doctor.js <android|ios> <device-token>");
        process.exit(1);
    }

    // ── 1. credentials ────────────────────────────────────────────────────
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) fail("FIREBASE_SERVICE_ACCOUNT_JSON is not set", "add it to .env");
    const sa = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(sa) });
    console.log(`✅ 1. Firebase project: ${sa.project_id}`);

    // ── 2. resolve to an FCM registration token ───────────────────────────
    let fcmToken = token;
    if (platform === "ios") {
        const bundleId = process.env.FIREBASE_IOS_BUNDLE_ID || "com.prayer.raahe";
        const sandbox = process.env.PUSH_APNS_SANDBOX === "true";
        console.log(`   iOS bundle=${bundleId} sandbox=${sandbox} (sandbox must be true for Xcode/dev builds, false for TestFlight/App Store)`);
        try {
            const { access_token: accessToken } = await admin.app().options.credential.getAccessToken();
            const res = await fetch("https://iid.googleapis.com/iid/v1:batchImport", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    access_token_auth: "true",
                },
                body: JSON.stringify({ application: bundleId, sandbox, apns_tokens: [token] }),
            });
            const body = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${body}`);
            const result = JSON.parse(body)?.results?.[0];
            if (result?.status !== "OK" || !result.registration_token) {
                throw new Error(`batchImport returned: ${JSON.stringify(result)}`);
            }
            fcmToken = result.registration_token;
        } catch (err) {
            fail("2. APNs -> FCM token exchange (batchImport)", err);
        }
    }
    console.log(`✅ 2. FCM token: ${fcmToken.slice(0, 24)}...`);

    // ── 3. direct send ────────────────────────────────────────────────────
    try {
        const id = await admin.messaging().send({
            token: fcmToken,
            notification: { title: "Push Doctor 1/2", body: "Direct-to-device send worked." },
        });
        console.log(`✅ 3. Direct send accepted by FCM (${id}) — check your phone`);
    } catch (err) {
        fail("3. Direct send to device token", err);
    }

    // ── 4. subscribe ──────────────────────────────────────────────────────
    try {
        const res = await admin.messaging().subscribeToTopic([fcmToken], TOPIC);
        if (res.failureCount > 0) throw new Error(JSON.stringify(res.errors));
        console.log(`✅ 4. Subscribed to topic "${TOPIC}"`);
    } catch (err) {
        fail("4. Topic subscribe", err);
    }

    // ── 5. topic send ─────────────────────────────────────────────────────
    // FCM needs a moment to propagate a fresh subscription before a topic
    // send will fan out to it.
    await new Promise((r) => setTimeout(r, 5000));
    try {
        const id = await admin.messaging().send({
            topic: TOPIC,
            notification: { title: "Push Doctor 2/2", body: "Topic send worked." },
        });
        console.log(`✅ 5. Topic send accepted by FCM (${id}) — check your phone`);
    } catch (err) {
        fail("5. Topic send", err);
    }

    console.log(`
Both sends were accepted by FCM. Now check the phone:
  • both arrived      -> server side is healthy; the app is not subscribing on
                         launch (check the device console for "[push]" lines)
  • only 1/2 arrived  -> topic fan-out problem
  • neither arrived   -> FCM accepted but delivery failed: on iOS this is almost
                         always a missing/wrong APNs key in Firebase, or an
                         aps-environment / PUSH_APNS_SANDBOX mismatch
`);
    process.exit(0);
}

main();
