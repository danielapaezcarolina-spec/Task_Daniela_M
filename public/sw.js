const CACHE_NAME = "taskconta-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].postMessage({ type: "NOTIFICATION_CLICK", data: event.notification.data });
      } else {
        self.clients.openWindow("/");
      }
    })
  );
});
