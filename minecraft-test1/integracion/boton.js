(function () {
  const me = document.currentScript;
  const widget = me.getAttribute("data-widget") || "./embed.html";
  const bridge = me.getAttribute("data-bridge") || "";
  const key = me.getAttribute("data-key") || "";

  const css = `
  #mc-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:9px;
    font:700 12px/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;
    color:#08080c;background:#ccff00;border:0;border-radius:999px;padding:12px 18px;cursor:pointer;
    box-shadow:0 0 0 1px rgba(204,255,0,.5),0 10px 28px rgba(0,0,0,.5),0 0 26px rgba(204,255,0,.35)}
  #mc-fab:hover{background:#d9ff33;box-shadow:0 0 0 1px rgba(204,255,0,.7),0 10px 30px rgba(0,0,0,.55),0 0 34px rgba(204,255,0,.5)}
  #mc-fab .dot{width:7px;height:7px;border-radius:50%;background:#08080c}
  #mc-fab.off{background:#ff2e7e;color:#fff;box-shadow:0 0 0 1px rgba(255,46,126,.5),0 10px 28px rgba(0,0,0,.5),0 0 26px rgba(255,46,126,.35)}
  #mc-fab.off .dot{background:#fff}
  #mc-modal{position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;
    background:rgba(8,8,12,.74);backdrop-filter:blur(4px);padding:20px}
  #mc-modal.open{display:flex}
  #mc-shell{width:min(560px,100%);background:#0b0d12;border:1px solid rgba(204,255,0,.3);border-radius:18px;
    box-shadow:0 0 0 1px rgba(0,0,0,.5) inset,0 28px 70px rgba(0,0,0,.65),0 0 60px rgba(204,255,0,.08);overflow:hidden}
  #mc-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;
    background:linear-gradient(180deg,rgba(204,255,0,.07),transparent);border-bottom:1px solid rgba(255,255,255,.06)}
  #mc-bar b{font:700 10.5px/1 "Space Grotesk",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#9dc700}
  #mc-close{font:700 10.5px/1 "Space Grotesk",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#f2f0e9;
    background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:7px 12px;cursor:pointer}
  #mc-close:hover{background:rgba(255,255,255,.12)}
  #mc-frame{display:block;width:100%;height:260px;border:0;background:transparent}
  @media (prefers-reduced-motion:reduce){#mc-modal{backdrop-filter:none}}
  `;
  const style = document.createElement("style");
  style.id = "mc-style";
  style.textContent = css;
  document.head.appendChild(style);

  const fab = document.createElement("button");
  fab.id = "mc-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Abrir el server de Minecraft");
  fab.innerHTML = '<span class="dot"></span><span>Server MC</span>';
  document.body.appendChild(fab);

  const modal = document.createElement("div");
  modal.id = "mc-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Estado del server de Minecraft");
  modal.innerHTML = '<div id="mc-shell"><div id="mc-bar"><b>Estado en vivo</b>' +
    '<button id="mc-close" type="button" aria-label="Cerrar">Cerrar</button></div></div>';
  document.body.appendChild(modal);

  let frame = null;
  function build() {
    if (frame) return;
    frame = document.createElement("iframe");
    frame.id = "mc-frame";
    frame.src = widget + (widget.includes("?") ? "&" : "?") + "plain=1";
    frame.title = "Estado del server de Minecraft Test 1";
    modal.querySelector("#mc-shell").appendChild(frame);
    if (bridge && key) {
      frame.addEventListener("load", () => {
        frame.contentWindow.postMessage({ target: "mc-test1", type: "config", bridge, key }, "*");
      });
    }
  }

  function open() {
    build();
    modal.classList.add("open");
    fab.setAttribute("aria-expanded", "true");
    modal.querySelector("#mc-close").focus();
  }
  function close() {
    modal.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }

  fab.addEventListener("click", () => modal.classList.contains("open") ? close() : open());
  modal.querySelector("#mc-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) close(); });

  window.addEventListener("message", (e) => {
    const d = e.data || {};
    if (d.source !== "mc-test1") return;
    if (d.type === "state" && d.payload) {
      fab.classList.toggle("on", !!d.payload.online);
      fab.classList.toggle("off", !d.payload.online);
      fab.querySelector("span:last-child").textContent = d.payload.online
        ? "Server MC " + d.payload.count + "/" + d.payload.max
        : "Server MC cerrado";
    }
    if (d.type === "height" && frame) {
      frame.style.height = Math.min(560, d.height) + "px";
    }
  });

  setInterval(() => {
    if (!document.getElementById("mc-style")) (document.head || document.documentElement).appendChild(style);
    if (!document.getElementById("mc-fab")) document.body.appendChild(fab);
    if (!document.getElementById("mc-modal")) document.body.appendChild(modal);
  }, 1200);
})();
