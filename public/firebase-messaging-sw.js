/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js");

let messaging = null;
let initialized = false;

self.addEventListener("message", (event) => {
  if (event.data?.type !== "INIT_FIREBASE" || initialized) return;

  const config = event.data.config;
  if (!config) return;

  firebase.initializeApp(config);
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || "SecureVault Alert";
    const body = payload?.notification?.body || "Suspicious activity detected on your account.";

    self.registration.showNotification(title, {
      body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: "intruder-alert",
      data: { url: "/intruder-logs?highlight=newest" },
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
    });
  });

  initialized = true;
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/intruder-logs";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (new URL(client.url).origin === self.location.origin) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
