/* Botón flotante + ventana con el server.
   Una sola etiqueta en cualquier página:
   <script src=".../integracion/boton.js" data-widget=".../embed.html"></script>
   Opcional: data-bridge="https://.../", data-key="..." para habilitar el control. */
(function () {
  const me = document.currentScript;
  const widget = me.getAttribute("data-widget") || "./embed.html";
  const bridge = me.getAttribute("data-bridge") || "";
  const key = me.getAttribute("data-key") || "";

  const css = `
  #mc-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:9px;
    font:700 14px/1 "Silkscreen",ui-monospace,monospace;letter-spacing:.04em;color:#f3e9d2;background:#1f1a13;
    border:2px solid #6b5a41;border-bottom-color:#0d0a06;border-right-color:#0d0a06;padding:11px 14px;cursor:pointer;
    box-shadow:inset 2px 2px 0 #3a3226,0 6px 18px rgba(0,0,0,.45)}
  #mc-fab:hover{background:#262017}
  #mc-fab .dot{width:9px;height:9px;background:#8a7a5f;box-shadow:0 0 0 2px rgba(255,255,255,.06)}
  #mc-fab.on .dot{background:#8bc34a;box-shadow:0 0 10px 2px rgba(139,195,74,.5)}
  #mc-fab.off .dot{background:#e0573f}
  #mc-modal{position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;
    background:rgba(8,8,12,.72);backdrop-filter:blur(3px);padding:20px}
  #mc-modal.open{display:flex}
  #mc-shell{width:min(560px,100%);background:#14110c;border:2px solid #6b5a41;border-bottom-color:#0d0a06;
    border-right-color:#0d0a06;box-shadow:0 24px 60px rgba(0,0,0,.6);position:relative}
  #mc-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border-bottom:2px solid #2a241b}
  #mc-bar b{font:700 13px/1 "Silkscreen",ui-monospace,monospace;letter-spacing:.05em;color:#f3e9d2}
  #mc-close{font:inherit;font-size:12px;color:#f3e9d2;background:#332b20;border:2px solid #4a3f2f;
    border-bottom-color:#17130d;border-right-color:#17130d;padding:4px 9px;cursor:pointer}
  #mc-frame{display:block;width:100%;height:300px;border:0;background:transparent}
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
    frame.src = widget;
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

  // La página del profe se redibuja sola: si borra el botón, se vuelve a poner.
  setInterval(() => {
    if (!document.getElementById("mc-style")) (document.head || document.documentElement).appendChild(style);
    if (!document.getElementById("mc-fab")) document.body.appendChild(fab);
    if (!document.getElementById("mc-modal")) document.body.appendChild(modal);
  }, 1200);
})();
