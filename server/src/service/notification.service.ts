import webpush, { type PushSubscription } from "web-push";
import { randomUUID } from "crypto";
import { readDB, writeDB } from "./db.service";

export type SubscriptionRecord = {
  id: string;
  receivedAt: string;
  userId?: string | null;
  subscription: PushSubscription;
};

export type NotificationPayload = {
  id: string;
  title: string;
  body: string;
  url?: string;
  icon: string;
  image?: string;
  banner?: string;
  timestamp: string;
};

export type SendNotificationOptions = {
  userId?: string | null;
  payloadOverrides?: Partial<NotificationPayload>;
};

export type SendNotificationResult = {
  notification: NotificationPayload;
  targetCount: number;
  results: Array<{
    ok: boolean;
    targetId: string;
    endpoint: string;
    error?: string;
  }>;
};

const TITLES = [
  "Hello from Server",
  "You've got mail",
  "Friendly Ping",
  "New Update",
  "Quick Reminder",
];

const BODIES = [
  "This is a test notification",
  "Check out the latest changes",
  "Don't miss this update",
  "Here's something for you",
  "Tap to see more",
];

const URLS = [
  "/",
  "https://developer.mozilla.org",
  "https://web.dev",
  "/inbox",
];

const assetBaseUrl = (() => {
  const base =
    process.env.ASSET_BASE_URL ||
    process.env.SERVER_PUBLIC_URL ||
    process.env.SERVER_URL ||
    process.env.APP_URL ||
    `http://localhost:${process.env.PORT ?? 3000}`;
  return base.replace(/\/$/, "");
})();

const ICON_FILENAME = "nodeJS.svg";
const BANNER_FILENAMES = ["banner.jpg"];

function buildAssetUrl(file: string) {
  const normalized = file.replace(/^\/+/, "");
  return `${assetBaseUrl}/public/${normalized}`;
}

const ICON_URL = buildAssetUrl(ICON_FILENAME);
const BANNER_URLS = BANNER_FILENAMES.map(buildAssetUrl);

let isWebPushConfigured = false;

function getVapidKeys() {
  const publicKey =
    process.env.VAPID_PUBLIC_KEY || process.env.PUBLIC_VAPID_KEY;
  const privateKey =
    process.env.VAPID_PRIVATE_KEY || process.env.PRIVATE_VAPID_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID keys are not set. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY."
    );
  }

  return { publicKey, privateKey };
}

function ensureWebPushConfigured() {
  if (isWebPushConfigured) return;
  const { publicKey, privateKey } = getVapidKeys();
  webpush.setVapidDetails("mailto:admin@localhost", publicKey, privateKey);
  isWebPushConfigured = true;
}

function randomFrom<T>(items: T[]): T {
  if (!items.length) {
    throw new Error("Cannot choose a random item from an empty array");
  }
  return items[Math.floor(Math.random() * items.length)] as T;
}

function extractSubscription(entry: any): PushSubscription | null {
  const subscription =
    (entry && (entry.subscription ?? entry.payload)) || entry;
  if (!subscription || !subscription.endpoint) return null;
  return subscription as PushSubscription;
}

export async function saveSubscription(
  incoming: PushSubscription,
  userId?: string | null
): Promise<SubscriptionRecord> {
  if (!incoming || !incoming.endpoint) {
    throw new Error("Invalid subscription object");
  }

  const db = await readDB();
  const now = new Date().toISOString();
  const record: SubscriptionRecord = {
    id: randomUUID(),
    receivedAt: now,
    userId: userId ?? null,
    subscription: incoming,
  };

  const existingIndex = db.users.findIndex((entry) => {
    const stored = extractSubscription(entry);
    return stored?.endpoint === incoming.endpoint;
  });

  if (existingIndex >= 0) {
    const existing = db.users[existingIndex];
    const persistedId = existing.id ?? record.id;
    db.users[existingIndex] = {
      ...existing,
      id: persistedId,
      userId: record.userId ?? existing.userId ?? null,
      subscription: incoming,
      receivedAt: now,
    };
    await writeDB(db);
    return {
      id: persistedId,
      receivedAt: now,
      userId: db.users[existingIndex].userId,
      subscription: incoming,
    };
  }

  db.users.push(record);
  await writeDB(db);
  return record;
}

function buildNotificationPayload(
  overrides?: Partial<NotificationPayload>
): NotificationPayload {
  const bannerCandidate = (() => {
    if (overrides?.image) return overrides.image;
    if (overrides?.banner) return overrides.banner;
    if (!BANNER_URLS.length) return undefined;
    return Math.random() >= 0.5 ? randomFrom(BANNER_URLS) : undefined;
  })();

  return {
    id: randomUUID(),
    title: overrides?.title ?? randomFrom(TITLES),
    body: overrides?.body ?? randomFrom(BODIES),
    url: overrides?.url ?? randomFrom(URLS),
    icon: overrides?.icon ?? ICON_URL,
    image: overrides?.image ?? bannerCandidate,
    banner: overrides?.banner ?? bannerCandidate,
    timestamp: new Date().toISOString(),
  };
}

function normalizeTargets(db: { users: any[] }, userId?: string | null) {
  const items = db.users.filter((entry) =>
    typeof userId === "string" && userId.length > 0
      ? entry.userId === userId
      : true
  );

  const augmented = items
    .map((entry) => {
      const subscription = extractSubscription(entry);
      if (!subscription) return null;
      return {
        ...entry,
        id: entry.id ?? randomUUID(),
        subscription,
      } as SubscriptionRecord;
    })
    .filter(Boolean) as SubscriptionRecord[];

  return augmented;
}

export async function sendNotification(
  options: SendNotificationOptions = {}
): Promise<SendNotificationResult> {
  ensureWebPushConfigured();

  const db = await readDB();
  const targets = normalizeTargets(db, options.userId);

  if (!targets.length) {
    throw new Error(
      options.userId
        ? `No subscriptions found for userId ${options.userId}`
        : "No subscriptions registered yet"
    );
  }

  const notification = buildNotificationPayload(options.payloadOverrides);
  const payload = JSON.stringify(notification);

  const results: SendNotificationResult["results"] = [];

  await Promise.all(
    targets.map(async (entry) => {
      try {
        const info = await webpush.sendNotification(
          entry.subscription,
          payload
        );
        results.push({
          ok: true,
          targetId: entry.id,
          endpoint: entry.subscription.endpoint,
        });
        return info;
      } catch (error) {
        const err = error as Error;
        results.push({
          ok: false,
          targetId: entry.id,
          endpoint: entry.subscription.endpoint,
          error: err.message,
        });
      }
    })
  );

  return {
    notification,
    targetCount: targets.length,
    results,
  };
}

export async function listSubscriptions() {
  const db = await readDB();
  return db.users;
}
