/**
 * Botón "Instalar app" — El Mundo de Felipe (PWA)
 *
 * Muestra una barra arriba de la portada para instalar el sitio como app.
 *  - Chrome / Edge / Samsung Internet: el botón abre la ventana de instalación.
 *  - iPhone / iPad y Safari de Mac: el botón muestra los pasos a mano.
 *  - Ya instalada (o abierta desde la app): no aparece.
 *  - Si se cierra con ✕, no vuelve a aparecer por DISMISS_DAYS días.
 *
 * La portada usa un bundler que reemplaza el <html> completo al cargar,
 * por eso la barra se vuelve a insertar cada vez que desaparece.
 *
 * También sirve para los juegos instalables por separado. Se configura
 * con atributos en la etiqueta <script>:
 *   data-name  nombre que muestra el botón       (por defecto: El Mundo de Felipe)
 *   data-icon  ícono, relativo a la página        (por defecto: icons/icon-192.png del sitio)
 *   data-mode  "bar" (barra arriba) o "float" (botón flotante, para juegos)
 * Además registra el service worker del sitio (sw.js, junto a este archivo),
 * así el juego se puede instalar aunque se abra directo sin pasar por la portada.
 */
(function () {
  const script = document.currentScript;
  const BASE = new URL('./', script.src);
  const APP_NAME = script.dataset.name || 'El Mundo de Felipe';
  const ICON = script.dataset.icon || new URL('icons/icon-192.png', BASE).href;
  const FLOAT = script.dataset.mode === 'float';

  const DISMISS_DAYS = 7;
  // Cada app (sitio o juego) recuerda por separado si se cerró el aviso.
  const KEY = script.dataset.name ? 'pwaInstallDismissed:' + script.dataset.name : 'pwaInstallDismissed';
  const ID = 'pwa-install';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(new URL('sw.js', BASE), { scope: BASE.pathname })
        .catch(err => console.warn('No se pudo registrar el service worker:', err));
    });
  }

  const ua = navigator.userAgent;
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|TikTok/i.test(ua);
  const isMacSafari = !isIOS && /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua);
  const isFirefoxAndroid = /Android/.test(ua) && /Firefox\//.test(ua);

  let deferredPrompt = null;
  let hidden = false;

  const dismissedRecently = () => {
    try {
      const t = Number(localStorage.getItem(KEY) || 0);
      return Date.now() - t < DISMISS_DAYS * 864e5;
    } catch (e) { return false; }
  };

  // Navegadores sin ventana de instalación: se explican los pasos a mano.
  const manualSteps = () => {
    if (isIOS) return [
      'Toca el botón <b>Compartir</b> <span class="pwa-ico">⬆️</span> (abajo en iPhone, arriba en iPad).',
      'Baja y elige <b>Agregar a inicio</b> <span class="pwa-ico">➕</span>.',
      'Toca <b>Agregar</b>. ¡Listo! Queda el ícono en tu pantalla.',
    ];
    if (isMacSafari) return [
      'En la barra de menú, abre <b>Archivo</b>.',
      'Elige <b>Agregar al Dock</b>.',
      'Confirma con <b>Agregar</b>.',
    ];
    if (isFirefoxAndroid) return [
      'Toca el menú <b>⋮</b> del navegador.',
      'Elige <b>Instalar</b> o <b>Agregar a pantalla de inicio</b>.',
      'Confirma. ¡Listo!',
    ];
    return null;
  };

  const shouldShow = () =>
    !hidden && !isStandalone() && !isInAppBrowser && !dismissedRecently() &&
    (deferredPrompt || manualSteps());

  const CSS = `
    #${ID}{position:relative;z-index:200;font-family:'Space Grotesk',-apple-system,'Segoe UI',sans-serif;
      background:linear-gradient(90deg,#1a0a14,#0e0f16 45%,#121a05);color:#f2f0e9;
      border-bottom:2px solid #ccff00;box-shadow:0 6px 24px -10px rgba(204,255,0,.55)}
    #${ID} .pwa-row{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:14px;padding:12px 16px}
    #${ID} .pwa-logo{width:44px;height:44px;border-radius:12px;flex-shrink:0;box-shadow:0 0 0 1px rgba(204,255,0,.35)}
    #${ID} .pwa-txt{flex:1;min-width:0;line-height:1.3}
    #${ID} .pwa-txt b{display:block;font-size:15px;font-weight:700;letter-spacing:.2px}
    #${ID} .pwa-txt span{font-size:12.5px;color:#9498ab}
    #${ID} .pwa-btn{flex-shrink:0;border:0;cursor:pointer;font:inherit;font-weight:800;font-size:14px;letter-spacing:.4px;
      color:#08080c;background:#ccff00;border-radius:999px;padding:11px 20px;white-space:nowrap;
      box-shadow:0 0 0 0 rgba(204,255,0,.7);animation:pwaPulse 2.2s infinite}
    #${ID} .pwa-btn:hover{filter:brightness(1.08)}
    #${ID} .pwa-btn:focus-visible,#${ID} .pwa-x:focus-visible{outline:2px solid #fff;outline-offset:2px}
    #${ID} .pwa-x{flex-shrink:0;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.18);
      background:transparent;color:#9498ab;font-size:16px;cursor:pointer;line-height:1}
    #${ID} .pwa-x:hover{color:#f2f0e9;border-color:rgba(255,255,255,.4)}
    @keyframes pwaPulse{0%{box-shadow:0 0 0 0 rgba(204,255,0,.6)}70%{box-shadow:0 0 0 12px rgba(204,255,0,0)}100%{box-shadow:0 0 0 0 rgba(204,255,0,0)}}
    @media (prefers-reduced-motion:reduce){#${ID} .pwa-btn{animation:none}}
    @media (max-width:520px){
      #${ID} .pwa-row{gap:10px;padding:10px 12px}
      #${ID} .pwa-logo{width:38px;height:38px}
      #${ID} .pwa-txt b{font-size:14px}
      #${ID} .pwa-txt span{display:none}
      #${ID} .pwa-btn{padding:10px 14px;font-size:13px}
    }
    #${ID}-modal{position:fixed;inset:0;z-index:2147483000;font-family:'Space Grotesk',-apple-system,'Segoe UI',sans-serif;display:flex;align-items:flex-end;justify-content:center;
      background:rgba(0,0,0,.65);padding:16px}
    #${ID}-modal .pwa-card{width:100%;max-width:420px;background:#13151e;border:1px solid rgba(204,255,0,.35);border-radius:18px;
      padding:22px 20px 18px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
    #${ID}-modal .pwa-card h3{font-size:18px;margin:0 0 14px;font-weight:800}
    #${ID}-modal .pwa-card ol{margin:0;padding:0;list-style:none;counter-reset:s}
    #${ID}-modal .pwa-card li{counter-increment:s;display:flex;gap:12px;align-items:flex-start;font-size:14.5px;line-height:1.45;
      color:#d8d6cf;margin-bottom:12px}
    #${ID}-modal .pwa-card li::before{content:counter(s);flex-shrink:0;width:26px;height:26px;border-radius:50%;
      background:#ccff00;color:#08080c;font-weight:800;font-size:13px;display:grid;place-items:center}
    #${ID}-modal .pwa-card b{color:#f2f0e9}
    #${ID}-modal .pwa-ico{font-size:15px}
    #${ID}-modal .pwa-ok{width:100%;margin-top:6px;border:0;border-radius:12px;padding:12px;font:inherit;font-weight:800;
      background:#ccff00;color:#08080c;cursor:pointer}
    @media (min-width:700px){#${ID}-modal{align-items:center}}
  ` + (FLOAT ? `
    #${ID}{position:fixed;top:max(10px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:2147482000;
      width:max-content;max-width:calc(100vw - 20px);border:1px solid #ccff00;border-radius:999px;
      background:rgba(14,15,22,.94);backdrop-filter:blur(8px);box-shadow:0 8px 28px rgba(0,0,0,.55),0 0 24px -6px rgba(204,255,0,.6)}
    #${ID} .pwa-row{gap:10px;padding:6px 6px 6px 8px}
    #${ID} .pwa-logo{width:32px;height:32px;border-radius:50%}
    #${ID} .pwa-txt{flex:0 1 auto}
    #${ID} .pwa-txt b{font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #${ID} .pwa-txt span{display:none}
    #${ID} .pwa-btn{padding:8px 14px;font-size:13px}
    #${ID} .pwa-x{width:30px;height:30px;font-size:14px}
    @media (max-width:420px){#${ID} .pwa-txt{display:none}}
  ` : '');

  const build = () => {
    const el = document.createElement('div');
    el.id = ID;
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Instalar app');
    el.innerHTML = `<style>${CSS}</style>
      <div class="pwa-row">
        <img class="pwa-logo" src="${ICON}" alt="">
        <div class="pwa-txt"><b>${FLOAT ? APP_NAME : 'Instala ' + APP_NAME}</b><span>Ábrelo desde tu pantalla de inicio, como una app.</span></div>
        <button type="button" class="pwa-btn">📲 Instalar app</button>
        <button type="button" class="pwa-x" aria-label="Cerrar">✕</button>
      </div>`;
    el.querySelector('.pwa-btn').addEventListener('click', install);
    el.querySelector('.pwa-x').addEventListener('click', dismiss);
    return el;
  };

  const showSteps = steps => {
    // El aviso va directo en <body> para quedar sobre todo (Hipo, menús, etc.).
    if (!document.getElementById(ID) || document.getElementById(ID + '-modal')) return;
    const m = document.createElement('div');
    m.id = ID + '-modal';
    m.innerHTML = `<div class="pwa-card" role="dialog" aria-modal="true" aria-label="Cómo instalar">
        <h3>📲 Instala ${APP_NAME} en 3 pasos</h3>
        <ol>${steps.map(s => `<li><span>${s}</span></li>`).join('')}</ol>
        <button type="button" class="pwa-ok">Entendido</button>
      </div>`;
    const close = () => m.remove();
    m.addEventListener('click', e => { if (e.target === m) close(); });
    m.querySelector('.pwa-ok').addEventListener('click', close);
    document.body.appendChild(m);
    m.querySelector('.pwa-ok').focus();
  };

  async function install() {
    if (deferredPrompt) {
      const p = deferredPrompt;
      deferredPrompt = null;            // cada aviso del navegador sirve una sola vez
      p.prompt();
      try { await p.userChoice; } catch (e) {}
      hide();
      return;
    }
    const steps = manualSteps();
    if (steps) showSteps(steps);
  }

  function dismiss() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    hide();
  }

  function hide() {
    hidden = true;
    [ID, ID + '-modal'].forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
  }

  // Inserta la barra al tope de la página (o la vuelve a poner si el bundler la borró).
  const ensure = () => {
    const el = document.getElementById(ID);
    if (el && document.body && document.body.firstChild === el && !hidden) return;   // ya está en su lugar
    if (!shouldShow()) { if (el) el.remove(); return; }
    if (!document.body) return;
    if (!el) document.body.insertBefore(build(), document.body.firstChild);
    else if (document.body.firstChild !== el) document.body.insertBefore(el, document.body.firstChild);
  };

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();                 // usamos nuestro botón en vez de la barrita del navegador
    deferredPrompt = e;
    ensure();
  });
  window.addEventListener('appinstalled', hide);

  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; ensure(); });
  }).observe(document, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', ensure);
  window.addEventListener('load', ensure);
})();
