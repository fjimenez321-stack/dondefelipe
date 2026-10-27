/* Animaciones de los gatitos que tienen cuadros de movimiento (Ava y Calha).
   Funciona solo: busca en la página las imágenes gatitos/img/<id>.webp de esos gatitos y,
   de vez en cuando (o al pasar el mouse / tocarlas), reproduce una rutina y vuelve a la foto.
   Para agregar otro gatito animado: pon su id en ANIMADOS y usa los mismos cuadros o agrega otros. */
(function () {
  'use strict';
  // Cada gatito animado: carpeta de sus cuadros y cuántos cuadros tiene cada acción.
  var VEL = { caminar: [130, 4], correr: [85, 4], jugar: [260, 2], sentarse: [320, 1], dormir: [650, 1],
              bailar: [170, 3], guitarra: [1400, 1], girar: [110, 1],
              contar: [300, 1], operar: [450, 1], estudiar: [700, 1] };   // ms por cuadro, vueltas
  var ANIMADOS = {
    ava:       { dir: 'gatitos/anim/',           n: { caminar: 4, correr: 5, jugar: 4, sentarse: 3, dormir: 4 } },
    calha:     { dir: 'gatitos/anim/',           n: { caminar: 4, correr: 5, jugar: 4, sentarse: 3, dormir: 4 } },
    nietzsche: { dir: 'gatitos/anim/nietzsche/', n: { caminar: 4, correr: 5, sentarse: 3, dormir: 3 } },
    rayo:      { dir: 'gatitos/anim/rayo/',      n: { sentarse: 3 } },
    sombra:    { dir: 'gatitos/anim/sombra/',    n: { sentarse: 3, caminar: 4 } },
    luna:      { dir: 'gatitos/anim/luna/',      n: { sentarse: 3, caminar: 4, correr: 4 } },
    cesar:     { dir: 'gatitos/anim/cesar/',     n: { caminar: 4, bailar: 5, sentarse: 3, guitarra: 1, dormir: 2, girar: 9 } },
    grunona:   { dir: 'gatitos/anim/grunona/',   n: { contar: 10, operar: 5, estudiar: 8, sentarse: 3, girar: 6, jugar: 2, dormir: 2 } }
  };
  var RUTINAS = [['caminar'], ['correr'], ['jugar'], ['sentarse', 'dormir'], ['caminar', 'sentarse'], ['sentarse', 'sentarse'],
                 ['bailar'], ['bailar', 'girar'], ['sentarse', 'guitarra'], ['girar'],
                 ['contar'], ['operar', 'sentarse'], ['estudiar'], ['contar', 'operar']];   // cada gatito usa solo las que puede
  var guion = document.currentScript && document.currentScript.src || '';
  var raiz = guion.replace(/gatitos\/anim\.js.*$/, '');
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var precargado = {};

  function idDe(img) {
    var m = (img.dataset.gatoBase || img.getAttribute('src') || '').match(/gatitos\/img\/([a-z0-9_-]+)\.webp/);
    return m && ANIMADOS[m[1]] ? m[1] : null;
  }
  function precargar(id) {
    if (precargado[id]) return; precargado[id] = true;
    var g = ANIMADOS[id];
    Object.keys(g.n).forEach(function (a) { for (var i = 1; i <= g.n[a]; i++) { var im = new Image(); im.src = raiz + g.dir + a + '-' + i + '.webp'; } });
  }
  function jugar(img, rutina) {
    var id = img && idDe(img);
    if (!img || img._anim || !id) return;
    var g = ANIMADOS[id]; precargar(id);
    var posibles = RUTINAS.filter(function (r) { return r.every(function (a) { return g.n[a]; }); });
    if (!rutina || !rutina.every(function (a) { return g.n[a]; })) rutina = posibles[Math.floor(Math.random() * posibles.length)];
    if (!img.dataset.gatoBase) img.dataset.gatoBase = img.getAttribute('src');
    var pasos = [];
    rutina.forEach(function (a) { var v0 = VEL[a]; for (var v = 0; v < v0[1]; v++) for (var i = 1; i <= g.n[a]; i++) pasos.push([a + '-' + i, v0[0]]); });
    img._anim = true; var k = 0;
    (function sig() {
      if (k >= pasos.length || !img.isConnected) { img.src = img.dataset.gatoBase; img._anim = false; return; }
      img.src = raiz + g.dir + pasos[k][0] + '.webp';
      setTimeout(sig, pasos[k++][1]);
    })();
  }
  function visibles() {
    return Array.prototype.filter.call(document.querySelectorAll('img'), function (img) {
      if (img._anim || !idDe(img)) return false;
      var r = img.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
    });
  }
  // Al pasar el mouse o tocar: camina (o corre, si ya lo hizo hace poco).
  function alApuntar(e) {
    var img = e.target && e.target.closest ? e.target.closest('img') : null;
    if (img && idDe(img)) jugar(img, Math.random() < .5 ? ['caminar'] : ['correr']);
  }
  document.addEventListener('mouseover', alApuntar);
  document.addEventListener('touchstart', alApuntar, { passive: true });
  // Solo, cada pocos segundos, uno de los que están en pantalla.
  if (!quieto) setInterval(function () {
    if (document.hidden) return;
    var l = visibles(); if (!l.length) return;
    if (Math.random() < .7) jugar(l[Math.floor(Math.random() * l.length)]);
  }, 4000);
  window.GatoAnim = { jugar: jugar, animados: ANIMADOS };
})();
