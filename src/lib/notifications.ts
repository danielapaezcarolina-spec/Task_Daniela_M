export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  return Notification.requestPermission();
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export function fireNotification(title: string, body: string, data?: Record<string, string>) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  try {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: "/icons/icon-192.svg",
          badge: "/icons/icon-192.svg",
          tag: data?.taskId || "taskconta",
          data,
          requireInteraction: true,
        });
      });
    } else {
      new Notification(title, {
        body,
        icon: "/icons/icon-192.svg",
        tag: data?.taskId || "taskconta",
      });
    }
  } catch {
    // Fallback silently
  }
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
