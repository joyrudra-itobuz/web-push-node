import { showNotificationInApp } from "../push/ui";

export function bindServiceWorkerBridge() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return;
  }

  navigator.serviceWorker.addEventListener("message", (event) => {
    const payload = event.data;
    if (payload?.type !== "push") return;

    showNotificationInApp({
      title: payload.data?.title,
      body: payload.data?.body,
      url: payload.data?.url,
      icon: payload.data?.icon,
      timestamp: payload.data?.timestamp,
    });
  });
}
