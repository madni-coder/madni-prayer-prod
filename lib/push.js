import admin from "firebase-admin";

// Server-side push helpers built on FCM topic messaging — no device-token
// database is kept; the client (re-)subscribes its token to topics on every
// launch / masjid change, and this module only ever talks to Firebase.

let app = null;
function getAdminApp() {
    if (app) return app;
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON env var is not set");
    }
    const serviceAccount = JSON.parse(raw);
    app = admin.apps.length
        ? admin.app()
        : admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return app;
}

// Push notifications are a side-effect of admin actions — never let a push
// failure block the underlying create/update from succeeding.
async function safely(label, fn) {
    try {
        return await fn();
    } catch (err) {
        console.error(`[push] ${label} failed:`, err?.message || err);
        return null;
    }
}

/**
 * Send a short notification to every device subscribed to `topic`.
 */
export async function sendTopicPush({ topic, title, body, data = {} }) {
    if (!topic || !title || !body) return null;
    return safely(`sendTopicPush(${topic})`, async () => {
        const messaging = getAdminApp() && admin.messaging();
        const stringData = Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
        );
        return messaging.send({
            topic,
            notification: { title, body },
            data: stringData,
        });
    });
}

// iOS: the Tauri push plugin hands back a raw APNs device token (it does not
// embed the Firebase iOS SDK), so it must be exchanged for an FCM
// registration token server-side before FCM topic APIs will accept it.
// This uses the Instance ID "batchImport" endpoint — it predates Firebase's
// current SDKs and Google lists it as legacy, but it remains the documented
// bridge for apps that register for APNs natively instead of via the
// Firebase iOS SDK, and has no replacement as of writing.
async function apnsTokenToFcmToken(apnsToken) {
    // iOS and Android intentionally use different bundle/app identifiers in this app.
    const bundleId = process.env.FIREBASE_IOS_BUNDLE_ID || "com.prayer.raahe";
    const sandbox = process.env.PUSH_APNS_SANDBOX === "true";

    const credential = getAdminApp().options.credential;
    const { access_token: accessToken } = await credential.getAccessToken();

    const res = await fetch("https://iid.googleapis.com/iid/v1:batchImport", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            access_token_auth: "true",
        },
        body: JSON.stringify({
            application: bundleId,
            sandbox,
            apns_tokens: [apnsToken],
        }),
    });

    if (!res.ok) {
        throw new Error(`batchImport HTTP ${res.status}: ${await res.text()}`);
    }
    const json = await res.json();
    const result = json?.results?.[0];
    if (!result || result.status !== "OK" || !result.registration_token) {
        throw new Error(`batchImport did not return a token: ${JSON.stringify(result)}`);
    }
    return result.registration_token;
}

async function resolveFcmToken({ token, platform }) {
    if (platform === "ios") return apnsTokenToFcmToken(token);
    return token; // Android's registerForPushNotifications() already returns an FCM token
}

/**
 * Subscribe/unsubscribe a single device token to/from one or more FCM topics.
 */
// Unlike sendTopicPush this deliberately throws: a device that fails to
// subscribe receives nothing forever, and swallowing the error here made the
// route answer 200 with empty arrays — indistinguishable from success.
export async function updateTopicSubscriptions({ token, platform, subscribe = [], unsubscribe = [] }) {
    if (!token || !platform) return { subscribed: [], unsubscribed: [] };

    // getAdminApp() must run before admin.messaging(): on the Android path
    // resolveFcmToken() returns the token untouched and never initializes the
    // default app, so messaging() would throw "The default Firebase app does
    // not exist."
    getAdminApp();
    const fcmToken = await resolveFcmToken({ token, platform });
    const messaging = admin.messaging();

    // subscribeToTopic/unsubscribeFromTopic do NOT reject on a bad token —
    // they resolve with { successCount, failureCount, errors }. Ignoring that
    // made a rejected token look like a successful subscription.
    const assertOk = (label, res) => {
        if (res?.failureCount > 0) {
            const first = res.errors?.[0]?.error;
            throw new Error(
                `${label} failed: ${first?.code || "unknown"} — ${first?.message || JSON.stringify(res.errors)}`
            );
        }
    };

    const subscribed = [];
    for (const topic of subscribe) {
        assertOk(`subscribe(${topic})`, await messaging.subscribeToTopic([fcmToken], topic));
        subscribed.push(topic);
    }
    const unsubscribed = [];
    for (const topic of unsubscribe) {
        assertOk(`unsubscribe(${topic})`, await messaging.unsubscribeFromTopic([fcmToken], topic));
        unsubscribed.push(topic);
    }
    return { subscribed, unsubscribed };
}

export const PUSH_TOPICS = {
    EVENTS_PROGRAMS: "events_programs",
    WEEKLY_REWARDS: "weekly_rewards",
    NOTICES: "notices",
    JOB_PORTAL: "job_portal",
    masjid: (id) => `masjid_${id}`,
};
