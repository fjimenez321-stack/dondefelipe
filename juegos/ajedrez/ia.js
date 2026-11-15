/* ═══════════════════════════════════════════════════════════════
   Ajedrez Agustino · ia.js — la máquina y el análisis de partidas
   ───────────────────────────────────────────────────────────────
   Búsqueda alfa-beta con:
     · profundización iterativa (piensa 1, 2, 3… jugadas hasta que se acaba el tiempo),
     · tabla de transposición (recuerda posiciones ya analizadas, con huella Zobrist),
     · orden de jugadas: la mejor recordada, capturas (MVV-LVA), jugadas «asesinas» e historial,
     · extensión de jaque y búsqueda de capturas al final (quiescencia),
     · libro de aperturas para las primeras jugadas.
   Evaluación: material, posición de cada pieza, pareja de alfiles, peones doblados,
   aislados y pasados, torres en columnas abiertas y refugio del rey.

   Se usa como Web Worker:  new Worker('ia.js')
     postMessage({ id, tipo:'jugada', jugadas, nivel })     → { id, uci }
     postMessage({ id, tipo:'analisis', jugadas, ms })       → { id, progreso } … { id, analisis }
   En Node (pruebas): require('./ia.js').elegir(estado, nivel) / .analizar(jugadas)

   Niveles: 'facil', 'medio', 'dificil', 'maestro'.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var A = typeof Ajedrez !== 'undefined' ? Ajedrez
        : (typeof require === 'function' ? require('./motor.js') : null);
  if (!A && typeof importScripts === 'function') { importScripts('motor.js'); A = self.Ajedrez; }

  var VALOR = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  // Tablas de posición (vistas desde las blancas; fila 8 primero).
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
  var PASADO = [0, 10, 15, 25, 45, 75, 120, 0];   // bonificación de un peón pasado según cuánto avanzó
  var MATE = 100000;

  function idx(i, blanca) { var f = i >> 3, c = i & 7; return blanca ? (7 - f) * 8 + c : f * 8 + c; }

  /* ---------- evaluación (desde el punto de vista de quien juega) ---------- */
  function evaluar(e) {
    var t = e.t, s = 0, mat = 0, i, p;
    var peones = { w: [0, 0, 0, 0, 0, 0, 0, 0], b: [0, 0, 0, 0, 0, 0, 0, 0] }, alfiles = { w: 0, b: 0 };
    for (i = 0; i < 64; i++) {
      p = t[i]; if (!p) continue;
      var tp = p.toLowerCase();
      if (tp === 'p') peones[p === 'P' ? 'w' : 'b'][i & 7]++;
      else if (tp !== 'k') mat += VALOR[tp];
      if (tp === 'b') alfiles[p === 'B' ? 'w' : 'b']++;
    }
    var final = mat <= 1300;
    for (i = 0; i < 64; i++) {
      p = t[i]; if (!p) continue;
      var tipo = p.toLowerCase(), blanca = p !== tipo, yo = blanca ? 'w' : 'b', el = blanca ? 'b' : 'w';
      var v = VALOR[tipo] + PST[tipo === 'k' && final ? 'kf' : tipo][idx(i, blanca)];
      var c = i & 7, f = i >> 3;
      if (tipo === 'p') {
        if (peones[yo][c] > 1) v -= 12;                                                  // doblado
        if ((c === 0 || !peones[yo][c - 1]) && (c === 7 || !peones[yo][c + 1])) v -= 12; // aislado
        // pasado: ningún peón rival delante en su columna ni en las vecinas
        var libre = true, paso = blanca ? 1 : -1;
        for (var ff = f + paso; ff >= 0 && ff < 8 && libre; ff += paso) {
          for (var dc = -1; dc <= 1; dc++) {
            var cc = c + dc; if (cc < 0 || cc > 7) continue;
            if (t[ff * 8 + cc] === (blanca ? 'p' : 'P')) { libre = false; break; }
          }
        }
        if (libre) v += PASADO[blanca ? f : 7 - f] * (final ? 1.5 : 1);
      } else if (tipo === 'r') {
        if (!peones[yo][c]) v += peones[el][c] ? 10 : 20;                               // columna semiabierta / abierta
      } else if (tipo === 'k' && !final) {
        // refugio: peones propios delante del rey
        var frente = blanca ? f + 1 : f - 1, escudo = 0;
        if (frente >= 0 && frente < 8) for (var d = -1; d <= 1; d++) {
          var x = c + d; if (x >= 0 && x < 8 && t[frente * 8 + x] === (blanca ? 'P' : 'p')) escudo++;
        }
        v += escudo * 12;
      }
      s += blanca ? v : -v;
    }
    if (alfiles.w >= 2) s += 30;
    if (alfiles.b >= 2) s -= 30;
    return e.turno === 'w' ? s : -s;
  }

  /* ---------- huella Zobrist (dos números de 32 bits) ---------- */
  var semilla = 0x9e3779b9;
  function azar() { semilla ^= semilla << 13; semilla ^= semilla >>> 17; semilla ^= semilla << 5; return semilla >>> 0; }
  var PIEZAS = 'PNBRQKpnbrqk', Z1 = [], Z2 = [], ZT1 = azar(), ZT2 = azar(), ZE1 = {}, ZE2 = {}, ZA1 = [], ZA2 = [];
  for (var zi = 0; zi < 12 * 64; zi++) { Z1.push(azar()); Z2.push(azar()); }
  'KQkq'.split('').forEach(function (k) { ZE1[k] = azar(); ZE2[k] = azar(); });
  for (zi = 0; zi < 8; zi++) { ZA1.push(azar()); ZA2.push(azar()); }
  function huella(e) {
    var h1 = 0, h2 = 0, t = e.t;
    for (var i = 0; i < 64; i++) {
      var p = t[i]; if (!p) continue;
      var k = PIEZAS.indexOf(p) * 64 + i; h1 ^= Z1[k]; h2 ^= Z2[k];
    }
    if (e.turno === 'b') { h1 ^= ZT1; h2 ^= ZT2; }
    for (var j = 0; j < e.enroque.length; j++) { h1 ^= ZE1[e.enroque.charAt(j)]; h2 ^= ZE2[e.enroque.charAt(j)]; }
    if (e.ap >= 0) { h1 ^= ZA1[e.ap & 7]; h2 ^= ZA2[e.ap & 7]; }
    return [h1 >>> 0, h2 >>> 0];
  }

  /* ---------- libro de aperturas (secuencias en notación UCI) ---------- */
  var LIBRO = [
    'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d4',            // Italiana
    'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8c5 c2c3',            // Italiana tranquila / dos caballos
    'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7',      // Española (Ruy López)
    'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4 g8f6 d4c6 b7c6',      // Escocesa
    'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6',      // Siciliana Najdorf
    'e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e5',      // Siciliana
    'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6 c1g5 f8e7 e4e5 f6d7',      // Francesa
    'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5 e4g3 f5g6',      // Caro-Kann
    'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7 e2e3 e8g8',      // Gambito de dama declinado
    'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4 a2a4 c8f5',      // Eslava
    'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8',      // India de rey
    'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3 e8g8 f1d3 d7d5',      // Nimzoindia
    'd2d4 d7d5 g1f3 g8f6 c1f4 e7e6 e2e3 c7c5 c2c3 b8c6',      // Londres
    'c2c4 e7e5 b1c3 g8f6 g1f3 b8c6 g2g3 d7d5 c4d5 f6d5',      // Inglesa
    'g1f3 d7d5 g2g3 g8f6 f1g2 e7e6 e1g1 f8e7 d2d3 e8g8'       // Réti
  ].map(function (l) { return l.split(' '); });
  function delLibro(jugadas) {
    var n = jugadas.length, opciones = [];
    LIBRO.forEach(function (l) {
      if (l.length <= n) return;
      for (var i = 0; i < n; i++) if (l[i] !== jugadas[i]) return;
      if (opciones.indexOf(l[n]) < 0) opciones.push(l[n]);
    });
    return opciones.length ? opciones[Math.floor(Math.random() * opciones.length)] : null;
  }

  /* ---------- búsqueda ---------- */
  var TT = new Map(), TT_MAX = 400000;
  var nodos = 0, limite = 0, corte = false, asesinas = [], historial = {};
  var vistas = new Set(), camino = [];   // posiciones ya jugadas y las de la línea que se está pensando (repeticiones = tablas)
  function claveJugada(m) { return m.de * 64 + m.a; }
  function ordenar(ms, mejor, ply) {
    var k = asesinas[ply] || [];
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], o = 0;
      if (mejor != null && claveJugada(m) === mejor) o = 1e7;
      else if (m.captura) o = 1e6 + 10 * VALOR[m.captura.toLowerCase()] - VALOR[m.pieza.toLowerCase()] / 10;
      else if (m.promo) o = 9e5;
      else if (k[0] === claveJugada(m) || k[1] === claveJugada(m)) o = 8e5;
      else o = historial[claveJugada(m)] || 0;
      if (m.promo === 'q') o += 5e5;
      m._o = o;
    }
    return ms.sort(function (a, b) { return b._o - a._o; });
  }
  function quiescencia(e, alfa, beta, prof) {
    nodos++;
    var est = evaluar(e);
    if (est >= beta) return beta;
    if (est > alfa) alfa = est;
    if (prof <= 0) return alfa;
    var ms = ordenar(A.legales(e).filter(function (m) { return m.captura || m.promo === 'q'; }), null, 0);
    for (var i = 0; i < ms.length; i++) {
      if (est + VALOR[(ms[i].captura || 'p').toLowerCase()] + 200 < alfa && !ms[i].promo) continue;   // poda delta
      var v = -quiescencia(A.aplicar(e, ms[i]), -beta, -alfa, prof - 1);
      if (v >= beta) return beta;
      if (v > alfa) alfa = v;
    }
    return alfa;
  }
  function alfabeta(e, prof, alfa, beta, ply) {
    if ((++nodos & 1023) === 0 && Date.now() > limite) corte = true;
    if (corte) return 0;
    if (e.medio >= 100) return 0;
    var h = huella(e);
    if (ply > 0 && (vistas.has(h[0]) || camino.indexOf(h[0]) >= 0)) return 0;   // repetir posición = tablas
    var jaque = A.enJaque(e);
    if (jaque && ply < 30) prof++;                                   // extensión de jaque
    if (prof <= 0) return quiescencia(e, alfa, beta, 6);
    var ent = TT.get(h[0]), mejorTT = null, alfa0 = alfa;
    if (ent && ent.h2 === h[1]) {
      mejorTT = ent.m;
      if (ent.p >= prof) {
        var sc = ent.s > MATE / 2 ? ent.s - ply : ent.s < -MATE / 2 ? ent.s + ply : ent.s;
        if (ent.f === 0) return sc;
        if (ent.f === 1 && sc >= beta) return sc;
        if (ent.f === 2 && sc <= alfa) return sc;
      }
    }
    var ms = A.legales(e);
    if (!ms.length) return jaque ? -MATE + ply : 0;
    ordenar(ms, mejorTT, ply);
    var mejor = -Infinity, mejorM = null;
    camino.push(h[0]);
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i], hijo = A.aplicar(e, m), v;
      // jugadas tranquilas tardías: primero se miran con menos profundidad
      if (i >= 4 && prof >= 3 && !jaque && !m.captura && !m.promo) {
        v = -alfabeta(hijo, prof - 2, -alfa - 1, -alfa, ply + 1);
        if (v > alfa && !corte) v = -alfabeta(hijo, prof - 1, -beta, -alfa, ply + 1);
      } else v = -alfabeta(hijo, prof - 1, -beta, -alfa, ply + 1);
      if (corte) { camino.pop(); return 0; }
      if (v > mejor) { mejor = v; mejorM = m; }
      if (v > alfa) alfa = v;
      if (alfa >= beta) {
        if (!m.captura) {
          var k = asesinas[ply] || (asesinas[ply] = []);
          if (k[0] !== claveJugada(m)) { k[1] = k[0]; k[0] = claveJugada(m); }
          historial[claveJugada(m)] = (historial[claveJugada(m)] || 0) + prof * prof;
        }
        break;
      }
    }
    camino.pop();
    if (TT.size > TT_MAX) TT.clear();
    var guardar = mejor > MATE / 2 ? mejor + ply : mejor < -MATE / 2 ? mejor - ply : mejor;
    TT.set(h[0], { h2: h[1], p: prof, s: guardar, f: mejor <= alfa0 ? 2 : mejor >= beta ? 1 : 0, m: mejorM ? claveJugada(mejorM) : null });
    return mejor;
  }

  // Busca la mejor jugada de la posición. Devuelve { m, v, prof } (v desde quien juega).
  function buscar(e, profMax, ms, ruido) {
    asesinas = []; historial = {}; camino = [huella(e)[0]]; vistas = new Set();
    for (var x = e.anterior; x; x = x.anterior) vistas.add(huella(x)[0]);
    var lista = A.legales(e);
    if (!lista.length) return { m: null, v: A.enJaque(e) ? -MATE : 0, prof: 0 };
    var mejor = lista[0], valor = 0, alcanzada = 0;
    nodos = 0; corte = false; limite = Date.now() + ms;
    for (var prof = 1; prof <= profMax; prof++) {
      var h = huella(e), ent = TT.get(h[0]);
      ordenar(lista, ent && ent.h2 === h[1] ? ent.m : claveJugada(mejor), 0);
      var alfa = -Infinity, elegida = null, vElegida = -Infinity;
      for (var i = 0; i < lista.length; i++) {
        var v = -alfabeta(A.aplicar(e, lista[i]), prof - 1, -Infinity, ruido ? Infinity : -alfa, 1);
        if (corte) break;
        if (ruido) v += (Math.random() - 0.5) * 2 * ruido;
        if (v > vElegida) { vElegida = v; elegida = lista[i]; }
        if (v > alfa) alfa = v;
      }
      if (corte && prof > 1) break;
      if (elegida) { mejor = elegida; valor = vElegida; alcanzada = prof; }
      lista.splice(lista.indexOf(mejor), 1); lista.unshift(mejor);
      if (corte || Math.abs(valor) > MATE / 2) break;
    }
    return { m: mejor, v: valor, prof: alcanzada };
  }

  var NIVELES = {
    facil:   { prof: 1, ms: 400,  ruido: 150, error: 0.25, libro: false },
    medio:   { prof: 3, ms: 900,  ruido: 30,  error: 0.04, libro: true },
    dificil: { prof: 6, ms: 2000, ruido: 0,   error: 0,    libro: true },
    maestro: { prof: 12, ms: 4500, ruido: 0,  error: 0,    libro: true }
  };

  // Devuelve la jugada elegida (objeto de motor.js).
  function elegir(e, nivel) {
    var cfg = NIVELES[nivel] || NIVELES.medio;
    var lista = A.legales(e);
    if (!lista.length) return null;
    if (lista.length === 1) return lista[0];
    var raiz = e; while (raiz.anterior) raiz = raiz.anterior;
    if (cfg.libro && e.historial.length < 12 && A.fen(raiz) === A.INICIAL) {   // solo partidas desde el inicio
      var u = delLibro(e.historial.map(function (h) { return h.uci; }));
      var mLibro = u && A.buscarUci(e, u);
      if (mLibro) return mLibro;
    }
    if (Math.random() < cfg.error) return lista[Math.floor(Math.random() * lista.length)];
    return buscar(e, cfg.prof, cfg.ms, cfg.ruido).m;
  }

  /* ---------- análisis de una partida (para aprender) ---------- */
  // Para cada jugada: la mejor alternativa, cuánto se perdió (en centipeones) y una categoría.
  function acotar(v) { return v > 1500 ? 1500 : v < -1500 ? -1500 : v; }
  function analizar(jugadas, msPorJugada, alProgreso) {
    msPorJugada = msPorJugada || 350;
    var e = A.nuevo(), estados = [e];
    jugadas.forEach(function (u) { e = A.jugarUci(e, u); estados.push(e); });
    // valor de cada posición desde quien juega, y la mejor jugada
    var val = [], mejores = [];
    TT.clear();
    for (var i = 0; i < estados.length; i++) {
      var r = A.resultado(estados[i]), b;
      if (r.fin) b = { m: null, v: r.motivo === 'jaque-mate' ? -MATE : 0 };
      else b = buscar(estados[i], 5, msPorJugada, 0);
      val.push(b.v); mejores.push(b.m);
      if (alProgreso) alProgreso((i + 1) / estados.length);
    }
    var out = [];
    for (i = 0; i < jugadas.length; i++) {
      var antes = estados[i], h = estados[i + 1].historial[i];
      var mejorM = mejores[i];
      var esMejor = mejorM && A.uci(mejorM) === h.uci;
      // pérdida = valor con la mejor jugada − valor con la jugada hecha (ambos para quien movió)
      var perdida = esMejor ? 0 : Math.max(0, acotar(val[i]) - acotar(-val[i + 1]));
      // en la apertura se es más tolerante (la máquina evalúa con poca profundidad)
      var tol = i < 12 ? 30 : 0;
      var cat = esMejor ? 'mejor' : perdida < 25 + tol ? 'excelente' : perdida < 90 + tol ? 'buena' : perdida < 170 + tol ? 'imprecision' : perdida < 350 ? 'error' : 'grave';
      var respuesta = mejores[i + 1];
      out.push({
        n: i, uci: h.uci, san: h.san, color: h.color, num: h.num,
        perdida: Math.round(perdida), categoria: cat,
        // valor después de la jugada, desde las blancas (para el gráfico)
        eval: Math.round(acotar(estados[i + 1].turno === 'w' ? val[i + 1] : -val[i + 1])),
        mejor: mejorM && !esMejor ? { uci: A.uci(mejorM), san: A.san(antes, mejorM), captura: mejorM.captura || '', de: mejorM.de, a: mejorM.a } : null,
        respuesta: respuesta ? { uci: A.uci(respuesta), san: A.san(estados[i + 1], respuesta), captura: respuesta.captura || '', a: respuesta.a } : null,
        mateCerca: Math.abs(val[i + 1]) > MATE / 2 ? (val[i + 1] > 0 ? 'rival' : 'yo') : ''
      });
    }
    return out;
  }

  var IA = { elegir: elegir, buscar: buscar, analizar: analizar, evaluar: evaluar, delLibro: delLibro, NIVELES: NIVELES, MATE: MATE };
  if (typeof module !== 'undefined' && module.exports) module.exports = IA;
  else if (typeof self !== 'undefined' && typeof importScripts === 'function') {
    self.onmessage = function (ev) {
      var d = ev.data || {};
      try {
        if (d.tipo === 'analisis') {
          var ultimo = 0;
          var res = analizar(d.jugadas || [], d.ms, function (p) {
            if (p - ultimo >= 0.02 || p === 1) { ultimo = p; self.postMessage({ id: d.id, progreso: p }); }
          });
          self.postMessage({ id: d.id, analisis: res });
          return;
        }
        var e = A.partida(d.jugadas || []);
        var m = elegir(e, d.nivel);
        self.postMessage({ id: d.id, uci: m ? A.uci(m) : null });
      } catch (err) { self.postMessage({ id: d.id, error: String(err && err.message || err) }); }
    };
  } else if (typeof window !== 'undefined') window.IAjedrez = IA;
})();
