import { getServerAssetUrl, getVapidPublicKey } from "./config";
import { setupNotificationControls } from "./controls";
import { applyFavicon } from "./favicon";
import { bindServiceWorkerBridge } from "./serviceWorkerBridge";
import { ensureBackgroundSubscription } from "./subscription";

export async function bootstrapNotificationDemo() {
  const vapidKey = getVapidPublicKey();
  const iconUrl = getServerAssetUrl("nodeJS.svg");
  applyFavicon(iconUrl);

  setupNotificationControls(vapidKey);
  bindServiceWorkerBridge();
  await ensureBackgroundSubscription(vapidKey);
}
