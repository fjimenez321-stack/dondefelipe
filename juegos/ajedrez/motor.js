/* ═══════════════════════════════════════════════════════════════
   Ajedrez Agustino · motor.js — las reglas del ajedrez, sin dibujo
   ───────────────────────────────────────────────────────────────
   Funciona en el navegador (window.Ajedrez) y en Node (require).
   Implementa todas las reglas: enroque, captura al paso, coronación,
   jaque, jaque mate, ahogado, 50 jugadas, triple repetición y
   material insuficiente.

   El tablero es un arreglo de 64 casillas: índice = fila*8 + columna,
   con a1 = 0, h1 = 7, a8 = 56, h8 = 63. Las piezas son letras:
   mayúsculas = blancas (PNBRQK), minúsculas = negras (pnbrqk), '' = vacía.

   Uso:
     let e = Ajedrez.nuevo();                 // posición inicial
     Ajedrez.legales(e)                       // todas las jugadas legales
     Ajedrez.legales(e, Ajedrez.casilla('e2'))// solo las de esa casilla
     e = Ajedrez.jugarUci(e, 'e2e4');         // devuelve un estado nuevo
     Ajedrez.resultado(e)                     // { fin, ganador:'w'|'b'|'', motivo }
     Ajedrez.fen(e)  ·  Ajedrez.desdeFen(fen)
     Ajedrez.partida(['e2e4','e7e5', …])      // reconstruye una partida

   El estado es inmutable: cada jugada crea uno nuevo, así el historial
   sirve para volver atrás y para revisar la partida.
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  var INICIAL = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  var COLS = 'abcdefgh';
  var D_CABALLO = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  var D_REY = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  var D_ALFIL = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  var D_TORRE = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // Letras de la notación en español: Rey, Dama, Torre, Alfil, Caballo.
  var LETRAS_ES = { k: 'R', q: 'D', r: 'T', b: 'A', n: 'C', p: '' };
  var LETRAS_EN = { k: 'K', q: 'Q', r: 'R', b: 'B', n: 'N', p: '' };

  function nombre(i) { return COLS.charAt(i & 7) + ((i >> 3) + 1); }
  function casilla(s) {
    s = String(s || '').toLowerCase();
    var c = s.charCodeAt(0) - 97, f = s.charCodeAt(1) - 49;
    return (c >= 0 && c < 8 && f >= 0 && f < 8 && s.length === 2) ? f * 8 + c : -1;
  }
  function colorDe(p) { return p ? (p === p.toUpperCase() ? 'w' : 'b') : ''; }
  function otro(c) { return c === 'w' ? 'b' : 'w'; }
  function dentro(f, c) { return f >= 0 && f < 8 && c >= 0 && c < 8; }
  function dePieza(tipo, color) { return color === 'w' ? tipo.toUpperCase() : tipo.toLowerCase(); }

  /* ---------- FEN ---------- */
  function desdeFen(fen) {
    var partes = String(fen || INICIAL).trim().split(/\s+/);
    var filas = (partes[0] || '').split('/');
    if (filas.length !== 8) throw new Error('FEN no válida: ' + fen);
    var t = [];
    for (var k = 0; k < 64; k++) t.push('');
    for (var r = 0; r < 8; r++) {
      var c = 0, txt = filas[r];
      for (var j = 0; j < txt.length; j++) {
        var ch = txt.charAt(j);
        if (/[1-8]/.test(ch)) c += +ch;
        else if (/[pnbrqkPNBRQK]/.test(ch) && c < 8) { t[(7 - r) * 8 + c] = ch; c++; }
        else throw new Error('FEN no válida: ' + fen);
      }
      if (c !== 8) throw new Error('FEN no válida: ' + fen);
    }
    var e = {
      t: t,
      turno: partes[1] === 'b' ? 'b' : 'w',
      enroque: (partes[2] && partes[2] !== '-') ? partes[2].replace(/[^KQkq]/g, '') : '',
      ap: (partes[3] && partes[3] !== '-') ? casilla(partes[3]) : -1,
      medio: parseInt(partes[4], 10) || 0,
      num: parseInt(partes[5], 10) || 1,
      historial: [],      // jugadas hechas: { uci, san, ... }
      claves: []          // posiciones anteriores (para la triple repetición)
    };
    e.claves = [clave(e)];
    return e;
  }

  function fen(e) {
    var filas = [];
    for (var r = 7; r >= 0; r--) {
      var s = '', vac = 0;
      for (var c = 0; c < 8; c++) {
        var p = e.t[r * 8 + c];
        if (!p) vac++;
        else { if (vac) { s += vac; vac = 0; } s += p; }
      }
      if (vac) s += vac;
      filas.push(s);
    }
    return filas.join('/') + ' ' + e.turno + ' ' + (e.enroque || '-') + ' ' +
      (e.ap >= 0 ? nombre(e.ap) : '-') + ' ' + e.medio + ' ' + e.num;
  }

  // Clave de la posición para contar repeticiones: piezas, turno, enroques y
  // captura al paso solo si de verdad se puede hacer.
  function clave(e) {
    var ap = '-';
    if (e.ap >= 0) {
      var peon = dePieza('p', e.turno), f = e.ap >> 3, c = e.ap & 7, df = e.turno === 'w' ? -1 : 1;
      for (var dc = -1; dc <= 1; dc += 2) {
        if (dentro(f + df, c + dc) && e.t[(f + df) * 8 + c + dc] === peon) ap = nombre(e.ap);
      }
    }
    return e.t.map(function (p) { return p || '.'; }).join('') + e.turno + (e.enroque || '-') + ap;
  }

  /* ---------- ataques ---------- */
  // ¿La casilla i está atacada por alguna pieza del color «por»?
  function atacada(t, i, por) {
    var f = i >> 3, c = i & 7, k, ff, cc, p;
    // peones: un peón blanco ataca hacia arriba, así que está una fila más abajo
    var fp = por === 'w' ? f - 1 : f + 1, peon = dePieza('p', por);
    if (fp >= 0 && fp < 8) {
      if (c > 0 && t[fp * 8 + c - 1] === peon) return true;
      if (c < 7 && t[fp * 8 + c + 1] === peon) return true;
    }
    var cab = dePieza('n', por), rey = dePieza('k', por);
    for (k = 0; k < 8; k++) {
      ff = f + D_CABALLO[k][0]; cc = c + D_CABALLO[k][1];
      if (dentro(ff, cc) && t[ff * 8 + cc] === cab) return true;
      ff = f + D_REY[k][0]; cc = c + D_REY[k][1];
      if (dentro(ff, cc) && t[ff * 8 + cc] === rey) return true;
    }
    var dama = dePieza('q', por), alfil = dePieza('b', por), torre = dePieza('r', por);
    for (k = 0; k < 4; k++) {
      ff = f + D_ALFIL[k][0]; cc = c + D_ALFIL[k][1];
      while (dentro(ff, cc)) {
        p = t[ff * 8 + cc];
        if (p) { if (p === alfil || p === dama) return true; break; }
        ff += D_ALFIL[k][0]; cc += D_ALFIL[k][1];
      }
      ff = f + D_TORRE[k][0]; cc = c + D_TORRE[k][1];
      while (dentro(ff, cc)) {
        p = t[ff * 8 + cc];
        if (p) { if (p === torre || p === dama) return true; break; }
        ff += D_TORRE[k][0]; cc += D_TORRE[k][1];
      }
    }
    return false;
  }
  function reyDe(t, color) { return t.indexOf(dePieza('k', color)); }
  function enJaque(e, color) {
    color = color || e.turno;
    var r = reyDe(e.t, color);
    return r >= 0 && atacada(e.t, r, otro(color));
  }

  /* ---------- generación de jugadas ---------- */
  // Jugada: { de, a, pieza, captura, promo ('' o 'q','r','b','n'), tipo ('', 'doble', 'ap', 'enroque') }
  function pseudo(e, soloDe) {
    var t = e.t, yo = e.turno, lista = [];
    function agregar(de, a, tipo) {
      var pieza = t[de], cap = tipo === 'ap' ? dePieza('p', otro(yo)) : t[a];
      if ((pieza === 'P' && a >= 56) || (pieza === 'p' && a < 8)) {
        ['q', 'r', 'b', 'n'].forEach(function (pr) { lista.push({ de: de, a: a, pieza: pieza, captura: cap, promo: pr, tipo: tipo || '' }); });
      } else lista.push({ de: de, a: a, pieza: pieza, captura: cap, promo: '', tipo: tipo || '' });
    }
    for (var i = 0; i < 64; i++) {
      if (soloDe != null && soloDe >= 0 && i !== soloDe) continue;
      var p = t[i];
      if (!p || colorDe(p) !== yo) continue;
      var f = i >> 3, c = i & 7, tipo = p.toLowerCase(), k, ff, cc, d, q;
      if (tipo === 'p') {
        var dir = yo === 'w' ? 1 : -1, ini = yo === 'w' ? 1 : 6;
        ff = f + dir;
        if (ff >= 0 && ff < 8 && !t[ff * 8 + c]) {
          agregar(i, ff * 8 + c);
          if (f === ini && !t[(f + 2 * dir) * 8 + c]) agregar(i, (f + 2 * dir) * 8 + c, 'doble');
        }
        for (var dc = -1; dc <= 1; dc += 2) {
          cc = c + dc;
          if (!dentro(ff, cc)) continue;
          d = ff * 8 + cc;
          if (t[d] && colorDe(t[d]) !== yo) agregar(i, d);
          else if (d === e.ap) agregar(i, d, 'ap');
        }
      } else if (tipo === 'n' || tipo === 'k') {
        var dirs = tipo === 'n' ? D_CABALLO : D_REY;
        for (k = 0; k < 8; k++) {
          ff = f + dirs[k][0]; cc = c + dirs[k][1];
          if (!dentro(ff, cc)) continue;
          d = ff * 8 + cc;
          if (!t[d] || colorDe(t[d]) !== yo) agregar(i, d);
        }
        if (tipo === 'k') enroques(e, i, lista);
      } else {
        var rayos = tipo === 'b' ? D_ALFIL : tipo === 'r' ? D_TORRE : D_ALFIL.concat(D_TORRE);
        for (k = 0; k < rayos.length; k++) {
          ff = f + rayos[k][0]; cc = c + rayos[k][1];
          while (dentro(ff, cc)) {
            d = ff * 8 + cc; q = t[d];
            if (!q) agregar(i, d);
            else { if (colorDe(q) !== yo) agregar(i, d); break; }
            ff += rayos[k][0]; cc += rayos[k][1];
          }
        }
      }
    }
    return lista;
  }

  function enroques(e, i, lista) {
    var t = e.t, yo = e.turno, ene = otro(yo), base = yo === 'w' ? 0 : 56, rey = t[i];
    if (i !== base + 4) return;
    var corto = yo === 'w' ? 'K' : 'k', largo = yo === 'w' ? 'Q' : 'q', torre = dePieza('r', yo);
    if (atacada(t, i, ene)) return;   // no se enroca estando en jaque
    if (e.enroque.indexOf(corto) >= 0 && t[base + 7] === torre && !t[base + 5] && !t[base + 6] &&
        !atacada(t, base + 5, ene) && !atacada(t, base + 6, ene)) {
      lista.push({ de: i, a: base + 6, pieza: rey, captura: '', promo: '', tipo: 'enroque' });
    }
    if (e.enroque.indexOf(largo) >= 0 && t[base] === torre && !t[base + 1] && !t[base + 2] && !t[base + 3] &&
        !atacada(t, base + 3, ene) && !atacada(t, base + 2, ene)) {
      lista.push({ de: i, a: base + 2, pieza: rey, captura: '', promo: '', tipo: 'enroque' });
    }
  }

  // Mueve las piezas en una copia del tablero (sin revisar legalidad).
  function moverTablero(t, m) {
    var n = t.slice();
    n[m.a] = m.promo ? dePieza(m.promo, colorDe(m.pieza)) : m.pieza;
    n[m.de] = '';
    if (m.tipo === 'ap') n[(m.de & ~7) | (m.a & 7)] = '';   // el peón capturado está al lado
    if (m.tipo === 'enroque') {
      var base = m.de & ~7;
      if ((m.a & 7) === 6) { n[base + 5] = n[base + 7]; n[base + 7] = ''; }
      else { n[base + 3] = n[base]; n[base] = ''; }
    }
    return n;
  }

  function legales(e, soloDe) {
    var yo = e.turno;
    return pseudo(e, soloDe).filter(function (m) {
      var n = moverTablero(e.t, m);
      var r = m.pieza.toLowerCase() === 'k' ? m.a : reyDe(n, yo);
      return r < 0 || !atacada(n, r, otro(yo));
    });
  }

  /* ---------- notación ---------- */
  function uci(m) { return nombre(m.de) + nombre(m.a) + (m.promo || ''); }

  function san(e, m, letras) {
    letras = letras || LETRAS_ES;
    var s, tipo = m.pieza.toLowerCase();
    if (m.tipo === 'enroque') s = (m.a & 7) === 6 ? 'O-O' : 'O-O-O';
    else {
      var cap = !!m.captura;
      if (tipo === 'p') {
        s = (cap ? COLS.charAt(m.de & 7) + 'x' : '') + nombre(m.a) + (m.promo ? '=' + letras[m.promo] : '');
      } else {
        // desambiguar si otra pieza igual puede ir a la misma casilla
        var otras = legales(e).filter(function (o) { return o.pieza === m.pieza && o.a === m.a && o.de !== m.de; });
        var amb = '';
        if (otras.length) {
          var mismaCol = otras.some(function (o) { return (o.de & 7) === (m.de & 7); });
          var mismaFila = otras.some(function (o) { return (o.de >> 3) === (m.de >> 3); });
          if (!mismaCol) amb = COLS.charAt(m.de & 7);
          else if (!mismaFila) amb = String((m.de >> 3) + 1);
          else amb = nombre(m.de);
        }
        s = letras[tipo] + amb + (cap ? 'x' : '') + nombre(m.a);
      }
    }
    return s;
  }

  /* ---------- jugar ---------- */
  function aplicar(e, m) {
    var yo = e.turno, n = {
      t: moverTablero(e.t, m),
      turno: otro(yo),
      enroque: e.enroque,
      ap: m.tipo === 'doble' ? (m.de + m.a) / 2 : -1,
      medio: (m.pieza.toLowerCase() === 'p' || m.captura) ? 0 : e.medio + 1,
      num: yo === 'b' ? e.num + 1 : e.num,
      historial: e.historial,
      claves: e.claves
    };
    // derechos de enroque: se pierden al mover el rey o la torre, o si capturan la torre
    var quitar = '';
    if (m.pieza === 'K') quitar += 'KQ';
    if (m.pieza === 'k') quitar += 'kq';
    [m.de, m.a].forEach(function (s) {
      if (s === 0) quitar += 'Q'; if (s === 7) quitar += 'K';
      if (s === 56) quitar += 'q'; if (s === 63) quitar += 'k';
    });
    if (quitar) n.enroque = n.enroque.split('').filter(function (c) { return quitar.indexOf(c) < 0; }).join('');
    return n;
  }

  // Hace la jugada m (debe venir de legales) y devuelve el estado nuevo.
  function jugar(e, m) {
    var txt = san(e, m);
    var n = aplicar(e, m);
    var jaque = enJaque(n), sinJugadas = legales(n).length === 0;
    txt += jaque ? (sinJugadas ? '#' : '+') : '';
    n.historial = e.historial.concat([{
      uci: uci(m), san: txt, de: m.de, a: m.a, pieza: m.pieza, captura: m.captura,
      promo: m.promo, tipo: m.tipo, jaque: jaque, color: e.turno, num: e.num
    }]);
    n.claves = e.claves.concat([clave(n)]);
    n.anterior = e;   // para deshacer o revisar
    return n;
  }

  // Busca la jugada legal que corresponde al texto UCI ('e2e4', 'e7e8q').
  function buscarUci(e, txt) {
    txt = String(txt || '').toLowerCase();
    var de = casilla(txt.slice(0, 2)), a = casilla(txt.slice(2, 4)), pr = txt.charAt(4) || '';
    if (de < 0 || a < 0) return null;
    var ms = legales(e, de).filter(function (m) { return m.a === a && (m.promo || '') === pr; });
    return ms[0] || null;
  }
  function jugarUci(e, txt) {
    var m = buscarUci(e, txt);
    if (!m) throw new Error('Jugada ilegal: ' + txt);
    return jugar(e, m);
  }
  function partida(lista, fenInicial) {
    var e = desdeFen(fenInicial || INICIAL);
    (lista || []).forEach(function (u) { e = jugarUci(e, u); });
    return e;
  }

  /* ---------- final de la partida ---------- */
  // ¿Al color le alcanza el material para dar mate? (criterio simple:
  // rey solo, o rey con un alfil o un caballo, no alcanza)
  function puedeDarMate(t, color) {
    var menores = 0;
    for (var i = 0; i < 64; i++) {
      var p = t[i];
      if (!p || colorDe(p) !== color) continue;
      var tipo = p.toLowerCase();
      if (tipo === 'p' || tipo === 'r' || tipo === 'q') return true;
      if (tipo === 'n' || tipo === 'b') menores++;
    }
    return menores >= 2;
  }

  function materialInsuficiente(t) {
    var piezas = [], alfiles = [];
    for (var i = 0; i < 64; i++) {
      var p = t[i];
      if (!p || p.toLowerCase() === 'k') continue;
      piezas.push(p);
      if (p.toLowerCase() === 'b') alfiles.push(((i >> 3) + (i & 7)) % 2);
    }
    if (piezas.length === 0) return true;                                        // R vs R
    if (piezas.length === 1 && /[nbNB]/.test(piezas[0])) return true;           // R+menor vs R
    if (piezas.length === alfiles.length && alfiles.every(function (x) { return x === alfiles[0]; })) return true; // alfiles del mismo color
    return false;
  }

  function repeticiones(e) {
    var k = e.claves[e.claves.length - 1], n = 0;
    for (var i = 0; i < e.claves.length; i++) if (e.claves[i] === k) n++;
    return n;
  }

  // { fin:boolean, ganador:'w'|'b'|'', motivo }
  function resultado(e) {
    if (legales(e).length === 0) {
      return enJaque(e) ? { fin: true, ganador: otro(e.turno), motivo: 'jaque-mate' }
                        : { fin: true, ganador: '', motivo: 'ahogado' };
    }
    if (materialInsuficiente(e.t)) return { fin: true, ganador: '', motivo: 'material' };
    if (repeticiones(e) >= 3) return { fin: true, ganador: '', motivo: 'repeticion' };
    if (e.medio >= 100) return { fin: true, ganador: '', motivo: '50-jugadas' };
    return { fin: false, ganador: '', motivo: '' };
  }

  // Si a «color» se le acabó el tiempo: gana el rival, salvo que no pueda dar mate.
  function resultadoPorTiempo(e, color) {
    return puedeDarMate(e.t, otro(color)) ? { fin: true, ganador: otro(color), motivo: 'tiempo' }
                                          : { fin: true, ganador: '', motivo: 'tiempo' };
  }

  var MOTIVOS = {
    'jaque-mate': 'Jaque mate', 'ahogado': 'Rey ahogado', 'material': 'Material insuficiente',
    'repeticion': 'Triple repetición', '50-jugadas': 'Regla de las 50 jugadas', 'tiempo': 'Se acabó el tiempo',
    'abandono': 'Abandono', 'acuerdo': 'Tablas de mutuo acuerdo',
    'anulada': 'Partida anulada', 'cancelada': 'Sala cerrada', 'disputa': 'En revisión del profe', 'profe': 'Resultado del profe'
  };

  // Pieza capturadas por cada color (para mostrarlas junto al tablero)
  function capturadas(e) {
    var w = [], b = [];
    e.historial.forEach(function (h) { if (h.captura) (h.color === 'w' ? w : b).push(h.captura); });
    return { w: w, b: b };
  }
  var VALOR = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  function material(t) {
    var s = 0;
    t.forEach(function (p) { if (p) s += (colorDe(p) === 'w' ? 1 : -1) * VALOR[p.toLowerCase()]; });
    return s;   // positivo = ventaja blanca
  }

  // Texto PGN de la partida (notación inglesa, la que leen los programas de ajedrez).
  function pgn(e, cab) {
    var pasos = [], x = e;
    while (x && x.anterior) { pasos.unshift({ antes: x.anterior, h: x.historial[x.historial.length - 1] }); x = x.anterior; }
    var res = cab && cab.Result ? cab.Result : '*';
    var txt = Object.keys(cab || {}).map(function (k) { return '[' + k + ' "' + String(cab[k]).replace(/"/g, "'") + '"]'; }).join('\n');
    var cuerpo = [];
    pasos.forEach(function (p, i) {
      var m = buscarUci(p.antes, p.h.uci);
      var s = san(p.antes, m, LETRAS_EN) + (p.h.san.slice(-1) === '#' ? '#' : p.h.san.slice(-1) === '+' ? '+' : '');
      if (p.antes.turno === 'w') cuerpo.push(p.antes.num + '. ' + s);
      else cuerpo.push((i === 0 ? p.antes.num + '... ' : '') + s);
    });
    cuerpo.push(res);
    return (txt ? txt + '\n\n' : '') + cuerpo.join(' ');
  }

  // Conteo de nodos para pruebas (perft)
  function perft(e, prof) {
    if (prof === 0) return 1;
    var ms = legales(e), n = 0;
    if (prof === 1) return ms.length;
    for (var i = 0; i < ms.length; i++) n += perft(aplicar(e, ms[i]), prof - 1);
    return n;
  }

  var Ajedrez = {
    INICIAL: INICIAL, LETRAS_ES: LETRAS_ES, LETRAS_EN: LETRAS_EN, MOTIVOS: MOTIVOS, VALOR: VALOR,
    nuevo: function (f) { return desdeFen(f || INICIAL); },
    desdeFen: desdeFen, fen: fen, clave: clave,
    casilla: casilla, nombre: nombre, colorDe: colorDe, otro: otro,
    legales: legales, aplicar: aplicar, jugar: jugar, jugarUci: jugarUci, buscarUci: buscarUci, partida: partida,
    uci: uci, san: san, enJaque: enJaque, atacada: atacada,
    resultado: resultado, resultadoPorTiempo: resultadoPorTiempo, puedeDarMate: puedeDarMate,
    materialInsuficiente: materialInsuficiente, repeticiones: repeticiones,
    capturadas: capturadas, material: material, pgn: pgn, perft: perft
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Ajedrez;
  else raiz.Ajedrez = Ajedrez;
})(typeof window !== 'undefined' ? window : this);
