self.addEventListener("push", (event) => {
  let data = {
    title: "Notification",
    body: "You have a new message.",
    url: "/",
  };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    try {
      data = { body: event.data.text() };
    } catch (__) {}
  }

  const title = data.title || "Notification";
  const options = {
    body: data.body || "",
    icon: data.icon || "/favicon.png",
    data: { url: data.url || "/" },
  };

  // Show system/OS notification
  const showPromise = self.registration.showNotification(title, options);

  // Also notify all open clients so the page can update its in-app notification list
  const notifyClients = self.clients
    .matchAll({ includeUncontrolled: true })
    .then((clients) => {
      for (const client of clients) {
        try {
          client.postMessage({ type: "push", data });
        } catch (e) {
          // ignore
        }
      }
    });

  event.waitUntil(Promise.all([showPromise, notifyClients]));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
