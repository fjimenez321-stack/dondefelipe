/* ═══════════════════════════════════════════════════════════════
   Ajedrez Agustino · ia.js — la máquina para practicar
   ───────────────────────────────────────────────────────────────
   Búsqueda alfa-beta con profundización iterativa, búsqueda de capturas
   al final (quiescencia) y una evaluación simple: material + posición
   de cada pieza en el tablero.

   Se usa de dos formas:
     · Como Web Worker:  new Worker('ia.js')  →  postMessage({ jugadas, nivel })
       responde { uci } con la jugada elegida.
     · En Node (pruebas): require('./ia.js').elegir(estado, nivel)

   Niveles: 'facil' (piensa 1 jugada y a veces se equivoca),
            'medio' (2 jugadas), 'dificil' (hasta 4 jugadas, ~2 s).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var A = typeof Ajedrez !== 'undefined' ? Ajedrez
        : (typeof require === 'function' ? require('./motor.js') : null);
  if (!A && typeof importScripts === 'function') { importScripts('motor.js'); A = self.Ajedrez; }

  var VALOR = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  // Tablas de posición (vistas desde las blancas; fila 8 arriba). Valores clásicos simplificados.
  var PST = {
    p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5,
        0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
    n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30,
        -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
    b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10,
        -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
    r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5,
        -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
    q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5,
        0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
    k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30,
        -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
    kf: [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30,
        -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50]
  };
  var MATE = 100000;

  // Índice de la tabla: las tablas están escritas con la fila 8 primero.
  function idx(i, blanca) { var f = i >> 3, c = i & 7; return blanca ? (7 - f) * 8 + c : f * 8 + c; }

  // Evaluación desde el punto de vista de quien juega.
  function evaluar(e) {
    var t = e.t, s = 0, mat = 0, i, p;
    for (i = 0; i < 64; i++) { p = t[i]; if (p && p.toLowerCase() !== 'k' && p.toLowerCase() !== 'p') mat += VALOR[p.toLowerCase()]; }
    var final = mat <= 1300;   // pocas piezas: el rey sale al centro
    for (i = 0; i < 64; i++) {
      p = t[i]; if (!p) continue;
      var tipo = p.toLowerCase(), blanca = p !== tipo;
      var v = VALOR[tipo] + PST[tipo === 'k' && final ? 'kf' : tipo][idx(i, blanca)];
      s += blanca ? v : -v;
    }
    return e.turno === 'w' ? s : -s;
  }

  function ordenar(ms) {
    ms.forEach(function (m) {
      m._o = (m.captura ? 10 * VALOR[m.captura.toLowerCase()] - VALOR[m.pieza.toLowerCase()] / 10 + 1000 : 0) + (m.promo ? 800 : 0);
    });
    return ms.sort(function (a, b) { return b._o - a._o; });
  }

  var nodos = 0, limite = 0, corte = false;
  function quiescencia(e, alfa, beta, prof) {
    nodos++;
    var est = evaluar(e);
    if (est >= beta) return beta;
    if (est > alfa) alfa = est;
    if (prof <= 0) return alfa;
    var ms = ordenar(A.legales(e).filter(function (m) { return m.captura || m.promo; }));
    for (var i = 0; i < ms.length; i++) {
      var v = -quiescencia(A.aplicar(e, ms[i]), -beta, -alfa, prof - 1);
      if (v >= beta) return beta;
      if (v > alfa) alfa = v;
    }
    return alfa;
  }
  function alfabeta(e, prof, alfa, beta, ply) {
    if ((++nodos & 255) === 0 && Date.now() > limite) corte = true;
    if (corte) return 0;
    var ms = A.legales(e);
    if (!ms.length) return A.enJaque(e) ? -MATE + ply : 0;
    if (e.medio >= 100) return 0;
    if (prof <= 0) return quiescencia(e, alfa, beta, 4);
    ordenar(ms);
    for (var i = 0; i < ms.length; i++) {
      var v = -alfabeta(A.aplicar(e, ms[i]), prof - 1, -beta, -alfa, ply + 1);
      if (corte) return 0;
      if (v >= beta) return beta;
      if (v > alfa) alfa = v;
    }
    return alfa;
  }

  var NIVELES = {
    facil:   { prof: 1, ms: 400,  ruido: 120, error: 0.25 },
    medio:   { prof: 2, ms: 1200, ruido: 25,  error: 0.05 },
    dificil: { prof: 4, ms: 2200, ruido: 0,   error: 0 }
  };

  // Devuelve la jugada elegida (objeto de motor.js).
  function elegir(e, nivel) {
    var cfg = NIVELES[nivel] || NIVELES.medio;
    var ms = ordenar(A.legales(e));
    if (!ms.length) return null;
    if (ms.length === 1) return ms[0];
    if (Math.random() < cfg.error) return ms[Math.floor(Math.random() * ms.length)];
    nodos = 0; corte = false; limite = Date.now() + cfg.ms;
    var mejor = ms[0], puntajes = [];
    for (var prof = 1; prof <= cfg.prof; prof++) {
      var alfa = -Infinity, elegidaProf = null, lista = [];
      for (var i = 0; i < ms.length; i++) {
        var v = -alfabeta(A.aplicar(e, ms[i]), prof - 1, -Infinity, cfg.ruido ? Infinity : -alfa, 1);
        if (corte) break;
        v += cfg.ruido ? (Math.random() - 0.5) * 2 * cfg.ruido : 0;
        lista.push({ m: ms[i], v: v });
        if (v > alfa) { alfa = v; elegidaProf = ms[i]; }
      }
      if (corte) break;
      mejor = elegidaProf || mejor; puntajes = lista;
      // la mejor de esta vuelta se revisa primero en la siguiente
      ms.splice(ms.indexOf(mejor), 1); ms.unshift(mejor);
      if (alfa > MATE / 2) break;   // ya encontró un mate
    }
    return mejor;
  }

  var IA = { elegir: elegir, evaluar: evaluar, NIVELES: NIVELES };
  if (typeof module !== 'undefined' && module.exports) module.exports = IA;
  else if (typeof self !== 'undefined' && typeof importScripts === 'function') {
    self.onmessage = function (ev) {
      var d = ev.data || {};
      try {
        var e = A.partida(d.jugadas || []);
        var m = elegir(e, d.nivel);
        self.postMessage({ id: d.id, uci: m ? A.uci(m) : null });
      } catch (err) { self.postMessage({ id: d.id, error: String(err && err.message || err) }); }
    };
  } else if (typeof window !== 'undefined') window.IAjedrez = IA;
})();
