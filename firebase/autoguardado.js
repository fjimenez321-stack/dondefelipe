/* ═══════════════════════════════════════════════════════════════
   El Mundo de Felipe · autoguardado.js
   Guarda en la cuenta del estudiante (Firebase) lo que una página
   ya guarda en el navegador (localStorage), sin tocar su lógica.

   Uso (después de df.js):
     <script src="../../firebase/df.js" data-sin-aviso data-sin-visita></script>
     <script src="../../firebase/autoguardado.js"
             data-clave="sesion5-penuelas"            ← nombre del trabajo (a-z, 0-9, -)
             data-titulo="Sesión 5 · Buscando problemas"
             data-claves="sesion5-lago-penuelas,sesion5-nombre"  ← claves de localStorage (acepta prefijo*)
     ></script>

   Opcional: la página define window.AUTOGUARDADO_RESUMEN = function () {
     return { felipesos: 35, avance: '7 de 12', detalle: [{ k:'Pregunta', v:'respuesta' }, …] };
   }  → es lo que el profe ve en el Panel (pestaña Trabajos).

   Qué hace:
     · Sin cuenta: nada cambia (todo queda en el navegador, como antes).
     · Con cuenta: sube los cambios a los pocos segundos y, si el trabajo
       está más nuevo en la cuenta (otro computador o celular), lo trae.
     · Computador compartido: el trabajo de un estudiante nunca se sube
       a la cuenta de otro; al salir, se borra de este navegador.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var yo = document.currentScript;
  if (!yo || window.__autoguardado) return;
  window.__autoguardado = true;

  var CLAVE = yo.getAttribute('data-clave') || 'trabajo';
  var TITULO = yo.getAttribute('data-titulo') || CLAVE;
  var PATRONES = String(yo.getAttribute('data-claves') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var RAIZ = yo.src.replace(/firebase\/[^\/]*$/, '');
  var K_DUENO = 'ag_dueno_' + CLAVE, K_T = 'ag_t_' + CLAVE, K_SUBIDO = 'ag_subido_' + CLAVE, K_RECARGA = 'ag_recarga_' + CLAVE;

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  function coincide(k) {
    return PATRONES.some(function (p) { return p.slice(-1) === '*' ? k.indexOf(p.slice(0, -1)) === 0 : k === p; });
  }
  function foto() {
    var o = {};
    try {
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (coincide(k)) o[k] = localStorage.getItem(k); }
    } catch (e) {}
    return o;
  }
  function texto(o) { return JSON.stringify(Object.keys(o).sort().map(function (k) { return [k, o[k]]; })); }
  function vacio(o) { return !o || !Object.keys(o).length; }
  function poner(o) {
    Object.keys(foto()).forEach(function (k) { ls(k, null); });
    Object.keys(o || {}).forEach(function (k) { if (coincide(k)) ls(k, String(o[k])); });
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- chip de estado ---------- */
  var chip = document.createElement('div');
  chip.className = 'ag-chip';
  chip.setAttribute('role', 'status');
  var css = document.createElement('style');
  css.textContent = '.ag-chip{position:fixed;top:10px;right:12px;z-index:2147483000;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 24px);' +
    'padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.96);color:#1f2937;border:1px solid rgba(0,0,0,.12);' +
    'box-shadow:0 4px 14px rgba(0,0,0,.12);font:600 13px/1.25 system-ui,-apple-system,"Segoe UI",sans-serif}' +
    '.ag-chip button,.ag-chip a{font:inherit;color:#1d4ed8;background:none;border:0;padding:0;cursor:pointer;text-decoration:underline}' +
    '.ag-chip .ag-d{width:9px;height:9px;border-radius:50%;background:#9ca3af;flex:none}.ag-chip.ok .ag-d{background:#16a34a}.ag-chip.sube .ag-d{background:#f59e0b}.ag-chip.err .ag-d{background:#dc2626}' +
    '.ag-chip .ag-x{color:#6b7280;text-decoration:none;font-size:15px;margin-left:2px}' +
    '@media print{.ag-chip{display:none}}';
  document.head.appendChild(css);
  var cerrado = false;
  function pinta(clase, html) {
    if (cerrado && clase !== 'err') return;
    chip.className = 'ag-chip ' + (clase || '');
    chip.innerHTML = '<span class="ag-d"></span><span>' + html + '</span>';
    if (!chip.parentNode) document.body.appendChild(chip);
  }

  /* ---------- sincronización ---------- */
  var usuario = null, listoNube = false, ultima = texto(foto()), tSubir = null, subiendo = false;

  function resumen() {
    try { var r = window.AUTOGUARDADO_RESUMEN ? window.AUTOGUARDADO_RESUMEN() : null; return r || {}; } catch (e) { return {}; }
  }
  function subir() {
    if (!usuario || !listoNube) return Promise.resolve();
    var f = foto(), r = resumen(), t = +ls(K_T) || Date.now();
    var datos = { titulo: TITULO, valores: f, t: t, pagina: location.pathname.split('/').slice(-2).join('/') };
    if (r.felipesos != null) datos.felipesos = +r.felipesos || 0;
    if (r.avance != null) datos.avance = String(r.avance).slice(0, 60);
    if (r.detalle) datos.detalle = r.detalle.slice(0, 80).map(function (x) { return { k: String(x.k || '').slice(0, 200), v: String(x.v == null ? '' : x.v).slice(0, 4000) }; });
    subiendo = true; pinta('sube', 'Guardando en tu cuenta…');
    return DF.guardarProgreso(CLAVE, datos).then(function () {
      subiendo = false; ls(K_SUBIDO, texto(f)); ls(K_DUENO, usuario.uid);
      pinta('ok', '☁️ Guardado en la cuenta de <b>' + esc(String(usuario.displayName || usuario.email).split(/\s+/)[0]) + '</b> · <button type="button" data-ag="salir">no soy yo</button>');
    }).catch(function (e) {
      subiendo = false; pinta('err', 'No se pudo guardar en tu cuenta (' + esc(e.message || e) + '). Tu trabajo sigue en este navegador.');
    });
  }
  function programar() { clearTimeout(tSubir); tSubir = setTimeout(subir, 1500); }

  // Revisa cada 2 s si la página cambió algo en el navegador.
  setInterval(function () {
    var ahora = texto(foto());
    if (ahora === ultima) return;
    ultima = ahora; ls(K_T, String(Date.now()));
    if (usuario && listoNube) programar();
  }, 2000);
  function alSalirDePagina() {
    var ahora = texto(foto());
    if (ahora !== ultima) { ultima = ahora; ls(K_T, String(Date.now())); }
    if (usuario && listoNube && ls(K_SUBIDO) !== ahora && !subiendo) subir();
  }
  window.addEventListener('pagehide', alSalirDePagina);
  document.addEventListener('visibilitychange', function () { if (document.hidden) alSalirDePagina(); });

  function recargar() {
    // Evita un bucle de recargas si algo sale mal.
    var n = +(sessionStorage.getItem(K_RECARGA) || 0);
    if (n >= 2) return false;
    try { sessionStorage.setItem(K_RECARGA, String(n + 1)); } catch (e) {}
    location.reload(); return true;
  }

  function conectar(u) {
    usuario = u; listoNube = false;
    if (!u) {
      pinta('', '<button type="button" data-ag="entrar">Entra con tu cuenta</button> para guardar este trabajo en tu cuenta.' +
        ' <button type="button" class="ag-x" data-ag="cerrar" aria-label="Ocultar">×</button>');
      return;
    }
    pinta('sube', 'Conectando con tu cuenta…');
    DF.perfil().then(function (pf) {
      if (!DF.perfilCompleto(pf)) {
        usuario = null;
        pinta('', 'Para guardar en tu cuenta, completa tu perfil en <a href="' + RAIZ + 'cuenta.html" target="_blank" rel="noopener">Mi cuenta</a> y vuelve aquí.');
        return;
      }
      return DF.leerProgreso(CLAVE).then(function (rem) {
        var local = foto(), dueno = ls(K_DUENO), tLocal = +ls(K_T) || 0;
        var remVals = (rem && rem.valores) || {}, tRem = (rem && +rem.t) || 0;
        var deOtro = dueno && dueno !== u.uid;
        listoNube = true;
        try { sessionStorage.removeItem(K_RECARGA); } catch (e) {}
        if (deOtro) {
          // Lo que hay en este navegador es de otra persona: no se sube; se carga lo de esta cuenta.
          poner(remVals); ls(K_DUENO, u.uid); ls(K_T, String(tRem || Date.now())); ls(K_SUBIDO, texto(foto()));
          if (!recargar()) subir();
          return;
        }
        if (!vacio(remVals) && texto(remVals) !== texto(local) && (tRem > tLocal || vacio(local))) {
          // La cuenta tiene una versión más nueva (otro computador o el celular): se trae.
          poner(remVals); ls(K_DUENO, u.uid); ls(K_T, String(tRem)); ls(K_SUBIDO, texto(foto()));
          if (!recargar()) subir();
          return;
        }
        if (vacio(local) && vacio(remVals)) {
          ls(K_DUENO, u.uid);
          pinta('ok', '☁️ Este trabajo se guardará en la cuenta de <b>' + esc(String(u.displayName || u.email).split(/\s+/)[0]) + '</b> · <button type="button" data-ag="salir">no soy yo</button>');
          return;
        }
        ultima = texto(local);
        if (!ls(K_T)) ls(K_T, String(Date.now()));
        return subir();
      });
    }).catch(function (e) {
      pinta('err', 'No se pudo conectar con tu cuenta (' + esc(e.message || e) + '). Tu trabajo sigue en este navegador.');
    });
  }

  chip.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-ag');
    if (a === 'cerrar') { cerrado = true; if (chip.parentNode) chip.parentNode.removeChild(chip); }
    else if (a === 'entrar') {
      DF.entrar().catch(function (e) { if (!e.cancelado) pinta('err', esc(e.message || e)); });
    } else if (a === 'salir') {
      var p = usuario && listoNube ? subir() : Promise.resolve();
      p.then(function () { return DF.salir(); }).then(function () {
        // Computador compartido: el trabajo queda en la cuenta, no en este navegador.
        poner({}); ls(K_DUENO, null); ls(K_T, null); ls(K_SUBIDO, null);
        location.reload();
      });
    }
  });

  function iniciar() {
    if (!window.DF) return;
    DF.listo().then(function () { DF.alCambiarUsuario(conectar); }, function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
