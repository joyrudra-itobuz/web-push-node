const FALLBACK_VAPID_PUBLIC_KEY =
  "BBvQzSC_5YwNOWKQyMfMvPqXtvbO01rjb58e1v2-OEHFfwkkxX7sQabuaxmoZ-RKqQV-ZYDu0k6QL0xoWt91q9o";

export function getVapidPublicKey() {
  const key =
    (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ??
    FALLBACK_VAPID_PUBLIC_KEY;

  if (!key) {
    console.warn(
      "VITE_VAPID_PUBLIC_KEY is not set. Push subscription will fail until it is configured."
    );
  }

  return key;
}
