/* Adornos de temporada: gatitos pequeños en las esquinas de abajo.
   - No tapan nada importante: son chicos, no se pueden seleccionar y se esconden si la ventana es muy baja.
   - Al tocar uno, se ocultan todos hasta que se cierre la pestaña.
   - Solo aparecen dentro de las fechas de TEMPORADAS (edítalas aquí para la próxima fiesta).
   Uso: <script src="adornos/adornos.js" defer></script>  (con la ruta relativa que corresponda). */
(function () {
  'use strict';
  var TEMPORADAS = [
    // mes: 1 = enero. Del 15 de octubre al 7 de noviembre: gatitos de Halloween.
    { carpeta: 'halloween', total: 28, desde: [10, 15], hasta: [11, 7] }
  ];
  var CLAVE = 'adornos-ocultos';

  var yo = document.currentScript;
  var base = yo ? yo.src.replace(/adornos\.js(\?.*)?$/, '') : 'adornos/';

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

  function poner() {
    var t = vigente();
    if (!t || ocultos() || document.getElementById('adornos-temporada')) return;

    var css = document.createElement('style');
    css.textContent =
      '#adornos-temporada{position:fixed;inset:auto 0 0 0;height:0;z-index:40;pointer-events:none}' +
      '#adornos-temporada img{position:absolute;bottom:6px;width:46px;height:46px;object-fit:contain;pointer-events:auto;cursor:pointer;' +
        'opacity:.92;filter:drop-shadow(0 4px 6px rgba(0,0,0,.55));transition:opacity .4s,transform .4s;animation:adornoFlota 3.6s ease-in-out infinite;' +
        '-webkit-user-select:none;user-select:none;-webkit-user-drag:none}' +
      '#adornos-temporada img:nth-child(2){animation-delay:-1.8s}' +
      '#adornos-temporada img:hover{opacity:1;transform:translateY(-4px) scale(1.12)}' +
      '#adornos-temporada.fuera img{opacity:0;transform:translateY(30px)}' +
      '@keyframes adornoFlota{50%{translate:0 -4px}}' +
      '@media (max-width:640px){#adornos-temporada img{width:34px;height:34px;bottom:4px}#adornos-temporada img:nth-child(2){display:none}}' +
      '@media (max-height:420px){#adornos-temporada{display:none}}' +
      '@media (prefers-reduced-motion:reduce){#adornos-temporada img{animation:none}}' +
      '@media print{#adornos-temporada{display:none}}';
    document.head.appendChild(css);

    // dos gatitos distintos al azar
    var a = 1 + Math.floor(Math.random() * t.total), b = a;
    while (b === a && t.total > 1) b = 1 + Math.floor(Math.random() * t.total);
    var caja = document.createElement('div');
    caja.id = 'adornos-temporada';
    caja.setAttribute('aria-hidden', 'true');
    [[a, 'left:8px'], [b, 'right:8px']].forEach(function (x) {
      var img = new Image();
      img.alt = ''; img.decoding = 'async'; img.loading = 'lazy'; img.draggable = false;
      img.title = 'Adorno de temporada · toca para ocultarlo';
      img.src = base + t.carpeta + '/g' + String(x[0]).padStart(2, '0') + '.webp';
      img.setAttribute('style', x[1]);
      img.onerror = function () { img.remove(); };
      caja.appendChild(img);
    });
    caja.addEventListener('click', function () {
      try { sessionStorage.setItem(CLAVE, '1'); } catch (e) {}
      caja.classList.add('fuera');
      setTimeout(function () { caja.remove(); }, 450);
    });
    document.body.appendChild(caja);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poner);
  else poner();
})();
