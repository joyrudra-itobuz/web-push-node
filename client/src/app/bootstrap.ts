import { getVapidPublicKey } from "./config";
import { setupNotificationControls } from "./controls";
import { bindServiceWorkerBridge } from "./serviceWorkerBridge";
import { ensureBackgroundSubscription } from "./subscription";

export async function bootstrapNotificationDemo() {
  const vapidKey = getVapidPublicKey();

  setupNotificationControls(vapidKey);
  bindServiceWorkerBridge();
  await ensureBackgroundSubscription(vapidKey);
}
