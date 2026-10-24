(function () {
  function mount(el, opts) {
    opts = opts || {};
    const frame = document.createElement("iframe");
    frame.src = opts.src || "./embed.html";
    frame.title = "Server de Minecraft Test 1";
    frame.loading = "lazy";
    frame.style.cssText = "width:100%;border:0;background:transparent;height:" + (opts.height || 320) + "px";
    (el || document.body).appendChild(frame);

    let state = null;
    const listeners = [];
    window.addEventListener("message", (e) => {
      if (e.source !== frame.contentWindow) return;
      const d = e.data || {};
      if (d.source !== "mc-test1") return;
      if (d.type === "height" && d.height) frame.style.height = Math.max(240, d.height) + "px";
      if (d.type === "state") {
        state = d.payload;
        if (opts.onState) opts.onState(state);
        listeners.forEach((fn) => fn(state));
      }
    });

    function send(msg) {
      frame.contentWindow.postMessage({ target: "mc-test1", ...msg }, "*");
    }

    return {
      frame,
      get state() { return state; },
      send,
      config(bridge, key) { send({ type: "config", bridge, key }); },
      action(action, value) { send({ type: "action", action, value }); },
      start: () => send({ type: "action", action: "start" }),
      stop: () => send({ type: "action", action: "stop" }),
      restart: () => send({ type: "action", action: "restart" }),
      say: (text) => send({ type: "action", action: "say", value: text }),
      onState(fn) { listeners.push(fn); if (state) fn(state); return () => listeners.splice(listeners.indexOf(fn), 1); }
    };
  }
  window.MCTest1 = { mount };
})();
