type NotificationItem = {
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  image?: string;
  timestamp?: string;
};

function cloneSkeleton(): HTMLElement | null {
  const skeleton = document.getElementById("notifciationListItemSkeleton");
  if (!skeleton) return null;
  const clone = skeleton.cloneNode(true) as HTMLElement;
  clone.id = "";
  clone.classList.remove("hidden");
  return clone;
}

export function showNotificationInApp(item: NotificationItem) {
  const container = document.getElementById("notificationContainer");
  const list = document.getElementById("notificationsListContainer");
  if (!container || !list) return;
  container.classList.remove("hidden");

  const node = cloneSkeleton();
  if (!node) return;

  // Fill title, body and timestamp in cloned node
  const titleEl = node.querySelector(".notification-title");
  const bodyEl = node.querySelector(".notification-body");
  if (titleEl) titleEl.textContent = item.title || "Notification";
  if (bodyEl) bodyEl.textContent = item.body || "";

  // timestamp or now
  const timeEl = node.querySelector(".notification-timestamp");
  if (timeEl)
    timeEl.textContent = item.timestamp || new Date().toLocaleTimeString();

  const mediaEl = node.querySelector(
    ".notification-media"
  ) as HTMLElement | null;
  const iconEl = node.querySelector(
    ".notification-icon"
  ) as HTMLImageElement | null;
  const bannerEl = node.querySelector(
    ".notification-banner"
  ) as HTMLImageElement | null;

  if (iconEl) {
    if (item.icon) {
      iconEl.src = item.icon;
      iconEl.classList.remove("hidden");
    } else {
      iconEl.removeAttribute("src");
      iconEl.classList.add("hidden");
    }
  }

  if (bannerEl) {
    if (item.image) {
      bannerEl.src = item.image;
      bannerEl.classList.remove("hidden");
    } else {
      bannerEl.removeAttribute("src");
      bannerEl.classList.add("hidden");
    }
  }

  if (mediaEl) {
    const shouldDisplay = Boolean(item.icon || item.image);
    mediaEl.style.display = shouldDisplay ? "flex" : "none";
  }

  list.appendChild(node);
}

export async function displayNotificationsSequentially(
  items: NotificationItem[]
) {
  for (const it of items) {
    showNotificationInApp(it);
    // small delay so UI shows one by one
    await new Promise((r) => setTimeout(r, 600));
  }
}
