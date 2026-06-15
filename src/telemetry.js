function getSessionId() {
  if (typeof window === "undefined") return "server";
  let sid = window.sessionStorage.getItem("sid");
  if (!sid) {
    sid = window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    window.sessionStorage.setItem("sid", sid);
  }
  return sid;
}

export function track(eventName, data = {}) {
  if (typeof window === "undefined" || typeof Image === "undefined") return;

  const params = new URLSearchParams({
    e: eventName,
    sid: getSessionId(),
    ts: Date.now().toString(),
    r: Math.random().toString(36).slice(2),
  });

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }

  const img = new Image();
  img.src = `/__track/pixel.gif?${params.toString()}`;
}
