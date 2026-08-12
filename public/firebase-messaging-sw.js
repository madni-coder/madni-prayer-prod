// Firebase Cloud Messaging service worker — handles push notifications
// while the site isn't the focused tab (backgrounded or fully closed).
// Config is passed via URL search params at registration time (see
// src/lib/firebaseClient.js) rather than hardcoded here, since this file
// is served as a static asset and can't read process.env.
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;
firebase.initializeApp({
    apiKey: params.get("apiKey"),
    authDomain: params.get("authDomain"),
    projectId: params.get("projectId"),
    storageBucket: params.get("storageBucket"),
    messagingSenderId: params.get("messagingSenderId"),
    appId: params.get("appId"),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    const path = payload.data?.path || "/";
    self.registration.showNotification(title || "Raahe Hidayat", {
        body: body || "",
        icon: "/mosqueLogo.png",
        data: { path },
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const path = event.notification.data?.path || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if ("focus" in client) {
                    client.focus();
                    if ("navigate" in client) client.navigate(path);
                    return;
                }
            }
            if (clients.openWindow) return clients.openWindow(path);
        })
    );
});
