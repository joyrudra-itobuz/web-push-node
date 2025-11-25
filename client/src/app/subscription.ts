import { registerServiceWorkerAndSubscribe } from "../push/register";

export async function ensureBackgroundSubscription(vapidPublicKey: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  try {
    await registerServiceWorkerAndSubscribe(vapidPublicKey);
  } catch (error) {
    console.error("Failed to ensure background subscription", error);
  }
}
