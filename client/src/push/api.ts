import { getOrCreateUserId } from "./user";

const API_BASE_URL = (
  import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

const NOTIFICATIONS_URL = `${API_BASE_URL}/notifications`;

export type StoredSubscription = {
  subscription: PushSubscriptionJSON;
  userId: string;
};

export type RemoteNotification = {
  id: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
  banner?: string;
  timestamp?: string;
};

export type NotificationDispatchResponse = {
  message: string;
  success: boolean;
  timestamp?: string;
  userId?: string | null;
  notification?: RemoteNotification | null;
  targetCount?: number;
};

export async function sendSubscriptionToServer(
  subscription: PushSubscriptionJSON,
  userId: string
) {
  try {
    const res = await fetch(NOTIFICATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription, userId }),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("sendSubscriptionToServer error", err);
    throw err;
  }
}

export async function requestNotificationFromServer() {
  try {
    const userId = getOrCreateUserId();
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const res = await fetch(`${NOTIFICATIONS_URL}${query}`, {
      headers: {
        "x-user-id": userId,
      },
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = (await res.json()) as NotificationDispatchResponse;
    return data;
  } catch (err) {
    console.error("requestNotificationFromServer error", err);
    throw err;
  }
}
