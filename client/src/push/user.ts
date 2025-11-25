export function getOrCreateUserId(): string {
  try {
    const key = "userId";
    let id = localStorage.getItem(key);
    if (!id) {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        id = crypto.randomUUID();
      } else {
        id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem(key, id);
      console.log("Generated new userId:", id);
    } else {
      console.log("Using existing userId:", id);
    }
    return id!;
  } catch (e) {
    console.warn(
      "Could not access localStorage for userId, generating ephemeral id",
      e
    );
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return "tmp-" + Date.now();
  }
}
