import { registerServiceWorkerAndSubscribe } from "../push/register";
import { requestNotificationFromServer } from "../push/api";

const SUBSCRIBE_BUTTON_ID = "subscribeButton";
const SUBSCRIBE_CONTAINER_ID = "subscribeToNotificaiton";

export function setupNotificationControls(vapidPublicKey: string) {
  const subscribeButton = document.getElementById(
    SUBSCRIBE_BUTTON_ID
  ) as HTMLButtonElement | null;
  const fetchButton = ensureFetchButton();

  updateSubscribeButtonUI(subscribeButton);

  if (typeof Notification === "undefined") {
    console.warn("Notifications are not supported in this browser.");
    subscribeButton?.setAttribute("disabled", "true");
    return;
  }

  subscribeButton?.addEventListener("click", async () => {
    if (!subscribeButton) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setButtonState(subscribeButton, "Notification permission granted", true);
      await registerServiceWorkerAndSubscribe(vapidPublicKey);
    } else if (permission === "denied") {
      setButtonState(subscribeButton, "Notification permission denied", true);
    } else {
      setButtonState(subscribeButton, "Notification permission not granted");
    }
  });

  fetchButton.addEventListener("click", async () => {
    const original = fetchButton.textContent;
    setButtonState(fetchButton, "Sending notification...", true);
    try {
      await requestNotificationFromServer();
    } catch (error) {
      console.error("Failed to request notification", error);
    } finally {
      setButtonState(fetchButton, original ?? "Fetch Notifications", false);
    }
  });
}

function ensureFetchButton() {
  let button = document.getElementById(
    "fetchNotificationsButton"
  ) as HTMLButtonElement | null;

  if (!button) {
    button = document.createElement("button");
    button.id = "fetchNotificationsButton";
    button.textContent = "Fetch Notifications";
    button.className =
      "bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 w-fit cursor-pointer active:bg-indigo-500 transition-all duration-100";
    const container = document.getElementById(SUBSCRIBE_CONTAINER_ID);
    container?.appendChild(button);
  }

  return button;
}

function updateSubscribeButtonUI(button: HTMLButtonElement | null) {
  if (!button || typeof Notification === "undefined") return;

  if (Notification.permission === "granted") {
    setButtonState(button, "Notification permission granted", true);
  } else if (Notification.permission === "denied") {
    setButtonState(button, "Notification permission denied", true);
  } else {
    setButtonState(button, "Subscribe to Notifications", false);
  }
}

function setButtonState(
  button: HTMLButtonElement,
  label: string,
  disabled = button.disabled
) {
  button.textContent = label;
  button.disabled = disabled;
}
