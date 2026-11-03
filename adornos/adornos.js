/* Adornos de temporada: gatitos pequeños en las esquinas de abajo (algunos animados).
   - No tapan nada importante: son chicos y se esconden si la ventana es muy baja.
   - Al tocar uno, se ocultan todos hasta que se cierre la pestaña.
   - Solo aparecen dentro de las fechas de TEMPORADAS (edítalas aquí para la próxima fiesta).
   Cada adorno es una imagen fija ('s01') o una animación: { cuadros: [...], ms: tiempo por cuadro }.
   Uso: <script src="adornos/adornos.js" defer></script>  (con la ruta relativa que corresponda). */
(function () {
  'use strict';
  function serie(nombre, n) { var l = []; for (var i = 1; i <= n; i++) l.push(nombre + String(i).padStart(2, '0')); return l; }
  var TEMPORADAS = [
    // mes: 1 = enero. Navidad: del 1 de noviembre al 6 de enero.
    { carpeta: 'navidad', desde: [11, 1], hasta: [1, 6], adornos: [
      's01', 's02', 's03', 's04', 's05', 's06',
      { cuadros: serie('arbol', 14), ms: 110 },                       // árbol que gira
      { cuadros: serie('gato', 12), ms: 150 },                        // gatito que da la vuelta
      { cuadros: ['mira_gris01', 'mira_gris01', 'mira_gris02', 'mira_gris03', 'mira_gris03', 'mira_gris02'], ms: 450 },
      { cuadros: ['mira_naranjo01', 'mira_naranjo01', 'mira_naranjo02', 'mira_naranjo03', 'mira_naranjo03', 'mira_naranjo02'], ms: 450 }
    ] }
  ];
  var CLAVE = 'adornos-ocultos';

  var yo = document.currentScript;
  var base = yo ? yo.src.replace(/adornos\.js(\?.*)?$/, '') : 'adornos/';
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hoyMD() {
    var p = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
    var m = 0, d = 0;
    p.forEach(function (x) { if (x.type === 'month') m = +x.value; if (x.type === 'day') d = +x.value; });
    return m * 100 + d;
  }
  function vigente() {
    var h = hoyMD();
    for (var i = 0; i < TEMPORADAS.length; i++) {
      var t = TEMPORADAS[i], a = t.desde[0] * 100 + t.desde[1], b = t.hasta[0] * 100 + t.hasta[1];
      if (a <= b ? (h >= a && h <= b) : (h >= a || h <= b)) return t;
    }
    return null;
  }
  function ocultos() { try { return sessionStorage.getItem(CLAVE) === '1'; } catch (e) { return false; } }
  function url(t, nombre) { return base + t.carpeta + '/' + nombre + '.webp'; }

  function poner() {
    var t = vigente();
    if (!t || ocultos() || document.getElementById('adornos-temporada')) return;

    var css = document.createElement('style');
    css.textContent =
      '#adornos-temporada{position:fixed;inset:auto 0 0 0;height:0;z-index:40;pointer-events:none}' +
      '#adornos-temporada img{position:absolute;bottom:6px;width:54px;height:54px;object-fit:contain;object-position:bottom;pointer-events:auto;cursor:pointer;' +
        'opacity:.95;filter:drop-shadow(0 4px 6px rgba(0,0,0,.55));transition:opacity .4s,transform .4s;' +
        '-webkit-user-select:none;user-select:none;-webkit-user-drag:none}' +
      '#adornos-temporada img.fijo{animation:adornoFlota 3.6s ease-in-out infinite}' +
      '#adornos-temporada img:nth-child(2){animation-delay:-1.8s}' +
      '#adornos-temporada img:hover{opacity:1;transform:translateY(-4px) scale(1.12)}' +
      '#adornos-temporada.fuera img{opacity:0;transform:translateY(30px)}' +
      '@keyframes adornoFlota{50%{translate:0 -4px}}' +
      '@media (max-width:640px){#adornos-temporada img{width:40px;height:40px;bottom:4px}#adornos-temporada img:nth-child(2){display:none}}' +
      '@media (max-height:420px){#adornos-temporada{display:none}}' +
      '@media (prefers-reduced-motion:reduce){#adornos-temporada img{animation:none}}' +
      '@media print{#adornos-temporada{display:none}}';
    document.head.appendChild(css);

    // dos adornos distintos al azar; si hay animados, al menos uno de los dos lo es
    var l = t.adornos, anim = l.filter(function (x) { return typeof x !== 'string'; });
    var a = anim.length ? anim[Math.floor(Math.random() * anim.length)] : l[Math.floor(Math.random() * l.length)], b = a;
    while (b === a && l.length > 1) b = l[Math.floor(Math.random() * l.length)];
    if (Math.random() < .5) { var tmp = a; a = b; b = tmp; }

    var caja = document.createElement('div');
    caja.id = 'adornos-temporada';
    caja.setAttribute('aria-hidden', 'true');
    var relojes = [];
    [[a, 'left:8px'], [b, 'right:8px']].forEach(function (x) {
      var ad = x[0], img = new Image();
      img.alt = ''; img.decoding = 'async'; img.draggable = false;
      img.title = 'Adorno de temporada · toca para ocultarlo';
      img.setAttribute('style', x[1]);
      img.onerror = function () { img.remove(); };
      if (typeof ad === 'string') { img.className = 'fijo'; img.src = url(t, ad); }
      else {
        var srcs = ad.cuadros.map(function (n) { return url(t, n); }), k = 0;
        img.src = srcs[0];
        if (!quieto) {
          srcs.forEach(function (s) { var p = new Image(); p.src = s; });   // precarga para que no parpadee
          relojes.push(setInterval(function () { if (!document.hidden) { k = (k + 1) % srcs.length; img.src = srcs[k]; } }, ad.ms));
        }
      }
      caja.appendChild(img);
    });
    caja.addEventListener('click', function () {
      try { sessionStorage.setItem(CLAVE, '1'); } catch (e) {}
      relojes.forEach(clearInterval);
      caja.classList.add('fuera');
      setTimeout(function () { caja.remove(); }, 450);
    });
    document.body.appendChild(caja);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poner);
  else poner();
})();
