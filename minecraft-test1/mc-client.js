const MC = {
  frame: window.parent !== window,
  bridge() { return localStorage.getItem("mc.bridge") || ""; },
  key() { return localStorage.getItem("mc.key") || ""; },
  config(bridge, key) {
    if (bridge) localStorage.setItem("mc.bridge", bridge.replace(/\/$/, ""));
    if (key) localStorage.setItem("mc.key", key);
  },
  hasControl() { return !!(this.bridge() && this.key()); },

  async stats() {
    const urls = [
      "https://raw.githubusercontent.com/Adriyache32/dondefelipe/datos/stats.json",
      "stats.json"
    ];
    for (const u of urls) {
      try {
        const r = await fetch(u + "?t=" + Date.now(), { cache: "no-store" });
        if (r.ok) return await r.json();
      } catch (e) {}
    }
    throw new Error("stats");
  },

  async remote() {
    if (!this.bridge()) return null;
    const r = await fetch(this.bridge() + "/state", { cache: "no-store" });
    if (!r.ok) throw new Error("bridge " + r.status);
    return r.json();
  },

  async action(action, value) {
    if (!this.hasControl()) throw new Error("sin clave");
    const r = await fetch(this.bridge() + "/action", {
      method: "POST",
      headers: { "content-type": "application/json", "X-MC-Key": this.key() },
      body: JSON.stringify({ action, value })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || "error " + r.status);
    return data;
  },

  send(type, payload = {}) {
    if (this.frame) window.parent.postMessage({ source: "mc-test1", type, ...payload }, "*");
  },

  onCommand(fn) {
    window.addEventListener("message", (e) => {
      const d = e.data;
      if (!d || d.target !== "mc-test1") return;
      if (d.type === "config") this.config(d.bridge, d.key);
      if (d.type === "action") fn(d);
    });
  }
};

window.MC = MC;
