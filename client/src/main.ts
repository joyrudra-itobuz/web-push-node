import "./styles/style.css";

import { registerServiceWorkerAndSubscribe } from "./push/register";
import { fetchNotificationsFromServer } from "./push/api";
import {
  displayNotificationsSequentially,
  showNotificationInApp,
} from "./push/ui";

const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ??
  "BBvQzSC_5YwNOWKQyMfMvPqXtvbO01rjb58e1v2-OEHFfwkkxX7sQabuaxmoZ-RKqQV-ZYDu0k6QL0xoWt91q9o ";
if (!VAPID_PUBLIC_KEY) {
  console.warn(
    "VITE_VAPID_PUBLIC_KEY is not set. Push subscription will fail until it is configured."
  );
}

const subscribeButton = document.getElementById(
  "subscribeButton"
) as HTMLButtonElement | null;
const fetchButton = document.createElement("button");
fetchButton.id = "fetchNotificationsButton";
fetchButton.textContent = "Fetch Notifications";
fetchButton.className =
  "bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 w-fit cursor-pointer active:bg-indigo-500 transition-all duration-100";

// place fetch button next to subscribe button container
const container = document.getElementById("subscribeToNotificaiton");
if (container) container.appendChild(fetchButton);

function updateSubscribeButtonUI() {
  if (!subscribeButton) return;
  if (Notification.permission === "granted") {
    subscribeButton.textContent = "Notification permission granted";
    subscribeButton.disabled = true;
  } else if (Notification.permission === "denied") {
    subscribeButton.textContent = "Notification permission denied";
    subscribeButton.disabled = true;
  } else {
    subscribeButton.textContent = "Subscribe to Notifications";
    subscribeButton.disabled = false;
  }
}

subscribeButton?.addEventListener("click", async () => {
  if (!subscribeButton) return;
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    subscribeButton.textContent = "Notification permission granted";
    subscribeButton.disabled = true;
    // register and subscribe; module sends subscription + userId to server
    await registerServiceWorkerAndSubscribe(VAPID_PUBLIC_KEY);
  } else if (permission === "denied") {
    subscribeButton.textContent = "Notification permission denied";
    subscribeButton.disabled = true;
  } else {
    subscribeButton.textContent = "Notification permission not granted";
  }
});

fetchButton.addEventListener("click", async () => {
  const item = await fetchNotificationsFromServer();
  if (!item) {
    console.warn("No notification available for this user yet.");
    return;
  }
  await displayNotificationsSequentially([item]);
});

// Listen for messages from service worker (push messages forwarded)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    const payload = event.data;
    if (payload?.type === "push") {
      // payload.data should be the notification body
      showNotificationInApp({
        title: payload.data.title,
        body: payload.data.body,
        url: payload.data.url,
      });
    }
  });
}

updateSubscribeButtonUI();

// If permission was already granted, ensure subscription exists and is sent to server
if (Notification.permission === "granted") {
  (async () => {
    try {
      await registerServiceWorkerAndSubscribe(VAPID_PUBLIC_KEY);
    } catch (e) {
      console.error("Auto registration failed:", e);
    }
  })();
}
