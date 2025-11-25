import { sendSubscriptionToServer } from "./api";
import { getOrCreateUserId } from "./user";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Registers SW, subscribes to push and sends to server
export async function registerServiceWorkerAndSubscribe(
  vapidPublicKey: string
) {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return;
  }
  if (!("PushManager" in window)) {
    console.warn("Push messaging is not supported.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered:", registration.scope);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return;
    }

    if (!vapidPublicKey) {
      console.warn("vapidPublicKey missing");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const userId = getOrCreateUserId();
    await sendSubscriptionToServer(subscription.toJSON(), userId);
    console.log("Subscription sent to server for user", userId);
  } catch (err) {
    console.error("Service Worker / Push registration failed:", err);
    throw err;
  }
}
