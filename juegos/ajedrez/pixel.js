/* ═══════════════════════════════════════════════════════════════
   Ajedrez Agustino · pixel.js — piezas y adornos en pixel art (16×16)
   ───────────────────────────────────────────────────────────────
   Cada dibujo es una lista de filas; cada letra es un color de la paleta:
     .  transparente      o  contorno       a  color base
     b  sombra            c  brillo         g  oro
     r  rojo (gemas, corazón)               w  blanco puro
   Las blancas son marfil con oro; las negras, azul agustino con plata.
   El alfil es un obispo con mitra (San Agustín fue obispo de Hipona).
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';

  var DIBUJOS = {
    k: [
      '.......oo.......',
      '......oggo......',
      '....ooogcooo....',
      '....oggggcgo....',
      '....ooogcooo....',
      '..oooo.oo.oooo..',
      '.oaccaoaaoacabo.',
      '.oacaaoccoaaabo.',
      '.oaaaaaccaaaabo.',
      '..oaaaaaaaaabo..',
      '...ogrggrggrgo..',
      '...oaacaaaaabo..',
      '...oooooooooo...',
      '..oggggggggggo..',
      '.oaccaaaaaaaabo.',
      '.oooooooooooooo.'
    ],
    q: [
      '................',
      '.og....oo....go.',
      '.oo...ogco...oo.',
      '..o....oo....o..',
      '..oo..oaao..oo..',
      '..oaooacaaooao..',
      '..oacaaccaaaao..',
      '...oagaraagabo..',
      '...oaaaaaaaabo..',
      '....orgggggro...',
      '....oaccaaabo...',
      '....oacaaaabo...',
      '...oooooooooo...',
      '..oggggggggggo..',
      '.oaccaaaaaaaabo.',
      '.oooooooooooooo.'
    ],
    r: [
      '................',
      '..ooo.oooo.ooo..',
      '..oco.ocao.oco..',
      '..oaooocaoooao..',
      '..oaccaaaaaabo..',
      '..oooooooooooo..',
      '...oacaaaaabo...',
      '...oacaooaabo...',
      '...oacaooaabo...',
      '...oacaaaaabo...',
      '...oacaaaaabo...',
      '...oaggggggbo...',
      '..oooooooooooo..',
      '..oggggggggggo..',
      '.oaccaaaaaaaabo.',
      '.oooooooooooooo.'
    ],
    b: [
      '.......oo.......',
      '......ocao......',
      '.....oacaabo....',
      '....oacggaabo...',
      '....oaggggabo...',
      '....oacggaabo...',
      '....oacggaabo...',
      '.....oaccabo....',
      '.....oaaaabo....',
      '....orggggro....',
      '.....oaaabo.....',
      '.....oacabo.....',
      '....oooooooo....',
      '..oggggggggggo..',
      '.oaccaaaaaaaabo.',
      '.oooooooooooooo.'
    ],
    n: [
      '.......o.o......',
      '......oaoao.....',
      '.....oaccaaoo...',
      '....oacaaaaagoo.',
      '...oacawoaaaggo.',
      '..oacaaooaaaagbo',
      '.oaaaaaaaaaagabo',
      '.ooaabooaaaagabo',
      '..ooo..oaaagaabo',
      '......oaaagaabo.',
      '.....oaacaaaabo.',
      '....oaacaaaaabo.',
      '...oooooooooooo.',
      '..oggggggggggo..',
      '.oaccaaaaaaaabo.',
      '.oooooooooooooo.'
    ],
    p: [
      '................',
      '................',
      '......oooo......',
      '.....oaccao.....',
      '.....oacaabo....',
      '.....oaaaabo....',
      '......oaabo.....',
      '.....oggggoo....',
      '......oacbo.....',
      '.....oacaabo....',
      '.....oacaabo....',
      '....oaacaaabo...',
      '...oooooooooo...',
      '..oggggggggggo..',
      '.oaccaaaaaaaabo.',
      '.oooooooooooooo.'
    ]
  };

  // Emblema agustino: corazón en llamas atravesado por una flecha, sobre un libro.
  var EMBLEMA = [
    '......a..a......',
    '.....aga.ga..oo.',
    '..ooo.ag.ga.ogg.',
    '.orrro.oo.oogro.',
    'orcrrrooorrgrrro',
    'orcrrrrrrrgrrrro',
    'orrrrrrrrgrrrrro',
    'orrrrrrrgrrrrrro',
    '.orrrrrgrrrrrro.',
    '..orrrgrrrrrro..',
    '...orgrrrrrro...',
    '...wgorrrrro....',
    '..wwo.orrro.....',
    '.ww....oro......',
    '........o.......',
    '................'
  ];

  var PALETAS = {
    w: { o: '#2a1c12', a: '#efe3c4', b: '#c4ad7c', c: '#fffaeb', g: '#d9a62a', r: '#c8323c', w: '#ffffff' },
    b: { o: '#0c0f1f', a: '#2f4a8c', b: '#1c2c5a', c: '#6e8fd6', g: '#c9cfdc', r: '#e04848', w: '#ffffff' },
    emblema: { o: '#2a1208', a: '#efe3c4', b: '#8a6a3a', c: '#ffb0a0', g: '#f2c440', r: '#c8323c', w: '#f4ecd8' }
  };

  // Dibuja un sprite en ctx, en la posición (x, y), con cada píxel de «escala» px.
  function pintar(ctx, filas, paleta, x, y, escala) {
    escala = escala || 1;
    for (var f = 0; f < filas.length; f++) {
      var fila = filas[f];
      for (var c = 0; c < 16 && c < fila.length; c++) {
        var ch = fila.charAt(c);
        if (ch === '.' || !paleta[ch]) continue;
        ctx.fillStyle = paleta[ch];
        ctx.fillRect(x + c * escala, y + f * escala, escala, escala);
      }
    }
  }

  // Lienzos ya dibujados de cada pieza (se crean una vez).
  var cache = {};
  function lienzoPieza(p) {
    if (cache[p]) return cache[p];
    var cv = document.createElement('canvas');
    cv.width = cv.height = 16;
    var color = p === p.toUpperCase() ? 'w' : 'b';
    pintar(cv.getContext('2d'), DIBUJOS[p.toLowerCase()], PALETAS[color], 0, 0, 1);
    cache[p] = cv;
    return cv;
  }

  /* ---------- piezas ilustradas (sprites/wk.webp, sprites/bq.webp, …) ----------
     Si se cargan, reemplazan a las de pixel art; si una falta, se usa la de pixel art. */
  var SPR = {}, esc = {};
  function cargarSprites(base) {
    base = base || 'sprites/';
    return Promise.all('PNBRQKpnbrqk'.split('').map(function (p) {
      return new Promise(function (ok) {
        var img = new Image();
        img.onload = function () { SPR[p] = img; ok(); };
        img.onerror = function () { ok(); };
        img.src = base + (p === p.toUpperCase() ? 'w' : 'b') + p.toLowerCase() + '.webp';
      });
    })).then(function () {
      Object.keys(cache).forEach(function (k) { if (k.indexOf('@') > 0) delete cache[k]; });
      esc = {};
      return Object.keys(SPR).length;
    });
  }
  // Copia de la pieza ya achicada al tamaño real en pantalla (se ve más nítida que achicarla en cada cuadro).
  function escalada(p, h) {
    var k = p + '@' + h;
    if (esc[k]) return esc[k];
    var img = SPR[p], w = Math.max(1, Math.round(img.width * h / img.height));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    // achicar en pasos de la mitad mantiene los bordes limpios
    var src = img, sw = img.width, sh = img.height;
    while (sh / 2 > h * 1.2) {
      var t = document.createElement('canvas'); t.width = Math.round(sw / 2); t.height = Math.round(sh / 2);
      var tg = t.getContext('2d'); tg.imageSmoothingQuality = 'high'; tg.drawImage(src, 0, 0, t.width, t.height);
      src = t; sw = t.width; sh = t.height;
    }
    g.drawImage(src, 0, 0, w, h);
    esc[k] = c;
    return c;
  }
  // Dibuja la pieza p en la casilla (x, y) de lado «tam» (unidades del tablero); «k» = píxeles reales por unidad.
  function dibujarPieza(ctx, p, x, y, tam, k) {
    k = k || 1;
    if (!SPR[p]) { ctx.imageSmoothingEnabled = false; ctx.drawImage(lienzoPieza(p), x, y, tam, tam); return; }
    var h = Math.round(tam * 0.97 * k), c = escalada(p, h), w = c.width;
    var dx = Math.round((x + tam / 2) * k - w / 2) / k, dy = Math.round((y + tam) * k - h - tam * 0.015 * k) / k;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, dx, dy, w / k, h / k);
  }
  function hayIlustradas() { return Object.keys(SPR).length > 0; }

  // Imagen PNG (data URL) de una pieza a cierto tamaño, para usar en HTML.
  function urlPieza(p, tam) {
    tam = tam || 48;
    var k = p + '@' + tam;
    if (cache[k]) return cache[k];
    if (SPR[p]) {
      // al doble de tamaño, para pantallas nítidas; la pieza se apoya en el borde inferior
      var T = tam * 2, cv0 = document.createElement('canvas'); cv0.width = cv0.height = T;
      var pz = escalada(p, Math.round(T * 0.96));
      cv0.getContext('2d').drawImage(pz, Math.round((T - pz.width) / 2), T - pz.height);
      cache[k] = cv0.toDataURL();
      return cache[k];
    }
    var cv = document.createElement('canvas');
    cv.width = cv.height = tam;
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(lienzoPieza(p), 0, 0, tam, tam);
    cache[k] = cv.toDataURL();
    return cache[k];
  }
  function urlEmblema(tam) {
    tam = tam || 64;
    var cv = document.createElement('canvas');
    cv.width = cv.height = tam;
    var ctx = cv.getContext('2d'), e = tam / 16;
    pintar(ctx, EMBLEMA, PALETAS.emblema, 0, 0, e);
    return cv.toDataURL();
  }

  /* ---------- letras de 3×5 píxeles para las coordenadas ---------- */
  var LETRAS = {
    a: ['010', '101', '111', '101', '101'], b: ['110', '101', '110', '101', '110'],
    c: ['011', '100', '100', '100', '011'], d: ['110', '101', '101', '101', '110'],
    e: ['111', '100', '110', '100', '111'], f: ['111', '100', '110', '100', '100'],
    g: ['011', '100', '101', '101', '011'], h: ['101', '101', '111', '101', '101'],
    1: ['010', '110', '010', '010', '111'], 2: ['110', '001', '010', '100', '111'],
    3: ['110', '001', '010', '001', '110'], 4: ['101', '101', '111', '001', '001'],
    5: ['111', '100', '110', '001', '110'], 6: ['011', '100', '110', '101', '010'],
    7: ['111', '001', '010', '010', '010'], 8: ['010', '101', '010', '101', '010']
  };
  function letra(ctx, ch, x, y, color, escala) {
    var g = LETRAS[ch]; if (!g) return;
    escala = escala || 1;
    ctx.fillStyle = color;
    for (var f = 0; f < 5; f++) for (var c = 0; c < 3; c++) {
      if (g[f].charAt(c) === '1') ctx.fillRect(x + c * escala, y + f * escala, escala, escala);
    }
  }

  raiz.Pixel = {
    DIBUJOS: DIBUJOS, PALETAS: PALETAS, EMBLEMA: EMBLEMA,
    pintar: pintar, lienzoPieza: lienzoPieza, urlPieza: urlPieza, urlEmblema: urlEmblema, letra: letra,
    cargarSprites: cargarSprites, dibujarPieza: dibujarPieza, hayIlustradas: hayIlustradas
  };
})(window);
