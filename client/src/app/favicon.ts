export function applyFavicon(iconUrl: string) {
  if (!iconUrl) return;
  const head = document.head || document.getElementsByTagName("head")[0];
  if (!head) return;

  let link = head.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    head.appendChild(link);
  }

  link.href = iconUrl;
}
