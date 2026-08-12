// Browser-only Firebase config for Web Push (FCM). Values are safe to expose
// client-side — a Firebase web API key identifies the project, it isn't a
// secret (access is governed by Firebase security rules / App Check, not by
// hiding this key). Distinct from the Android/iOS native app configs.
export const firebaseWebConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function isFirebaseWebConfigured() {
    return Boolean(
        firebaseWebConfig.apiKey &&
        firebaseWebConfig.appId &&
        firebaseWebConfig.messagingSenderId &&
        firebaseVapidKey
    );
}

// The service worker (public/firebase-messaging-sw.js) can't read
// process.env — it's served as a static file. Pass the config over as URL
// search params instead of hardcoding it in two places.
export function serviceWorkerUrl() {
    const params = new URLSearchParams(firebaseWebConfig);
    return `/firebase-messaging-sw.js?${params.toString()}`;
}
