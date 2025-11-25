# Web Push Demo

Proof-of-concept showcasing an end-to-end browser push notification flow with a Bun/Express server and a Vite/TypeScript client.

## Features

- Subscribe browsers to push notifications via `/notifications`.
- Persist subscriptions in `server/databases/db.json` for quick prototyping.
- Trigger random notifications per-user via the API or the `bun run notify` helper.
- Service Worker (`client/public/sw.js`) surfaces pushes both as OS notifications and inside the demo UI.

## Repository layout

```text
client/   # Vite + TS demo UI and service worker
server/   # Bun + Express API with subscription storage and web-push integration
```

## Prerequisites

- [Bun](https://bun.sh/) ≥ 1.1 for the server.
- Node.js ≥ 18 for the client tooling.
- VAPID keys for Web Push (see below).

## Generate VAPID keys

Use any `web-push` CLI (via `npx`, `bunx`, or global install):

```bash
npx web-push generate-vapid-keys
```

Record the `Public Key` and `Private Key` values:

- Server expects `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` (or `PUBLIC_VAPID_KEY` / `PRIVATE_VAPID_KEY`).
- Client expects `VITE_VAPID_PUBLIC_KEY` in its `.env` and will send this key to the browser PushManager.

## Server setup (Bun)

```bash
cd server
bun install
export VAPID_PUBLIC_KEY=<public key>
export VAPID_PRIVATE_KEY=<private key>
bun dev
```

- The API listens on `http://localhost:3000` by default.
- Subscriptions are stored in `databases/db.json`. Delete the file to reset state.

### Manual notification helper

Send a notification outside of HTTP flow:

```bash
cd server
bun run notify --userId=<uuid>
# or rely on USER_ID env
USER_ID=<uuid> bun run notify
```

The helper reuses the same service (`src/service/notification.service.ts`) as the Express controller, so CLI and API behavior stay consistent.

## Client setup (Vite)

```bash
cd client
npm install
cat <<'EOF' > .env
VITE_SERVER_URL=http://localhost:3000
VITE_VAPID_PUBLIC_KEY=<public key>
EOF
npm run dev
```

Open the printed Vite URL (default `http://localhost:5173`). Grant notification permission, subscribe, and then use the "Fetch Notifications" button to request a push for the current browser user.

## API reference

`POST /notifications`

- Body: `{ "subscription": <PushSubscriptionJSON>, "userId": "uuid" }`
- Persists/updates the subscription for the given user and returns the stored record.

`GET /notifications?userId=<uuid>`

- Headers: optionally `x-user-id: <uuid>` (server falls back to all users when `userId` is omitted).
- Creates a random notification payload and sends it via `web-push` to the matching subscription(s).
- Response:

```json
{
  "message": "Notification dispatched",
  "success": true,
  "userId": "...",
  "notification": {
    "id": "...",
    "title": "...",
    "body": "...",
    "url": "/"
  },
  "targetCount": 1,
  "results": [{ "ok": true, "targetId": "...", "endpoint": "..." }]
}
```

## Flow overview

1. The client registers `public/sw.js`, requests permission, and posts its PushSubscription + `userId` (persisted in `localStorage`) to `POST /notifications`.
2. The user triggers `GET /notifications`, passing the same `userId`. The server looks up that subscription, composes a random payload, and calls `web-push`.
3. The service worker displays the OS-level notification and relays the payload back to the page for in-app rendering.

## Troubleshooting

- **403/404 on GET /notifications** – ensure the `userId` in the client request matches the stored subscription, and that the server was started with valid VAPID keys.
- **Push fails with `UnauthorizedRegistration`** – the VAPID public key used by the browser must match the server's `VAPID_PRIVATE_KEY`. Regenerate and update both sides.
- **Nothing appears in the UI** – check the browser console for service worker logs and that `Notification.permission` remains `granted`.
