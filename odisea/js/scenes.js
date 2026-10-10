/* ============================================================
   ODISEA CÓSMICA · scenes.js
   ESCENARIOS — todos los fondos del juego, con profundidad (2.5D):
   · planetas esféricos con textura que gira, terminador y atmósfera,
   · suelo en perspectiva que avanza hacia el jugador,
   · capas de montañas/nubes/túneles con paralaje y bruma,
   · brillos aditivos y luz coherente (la luz viene de arriba-izquierda,
     salvo cuando el escenario tiene su propio sol).
   Lo estático se pre-renderiza una vez (caché por tamaño de pantalla);
   solo lo animado se dibuja en cada cuadro.
   API: init(ctx) · resize(w,h,dpr) · draw(world, stars, groundY) · stars(list)
   El mundo elige su fondo con world.fondo (ver sagas.js).
   ============================================================ */
window.OC = window.OC || {};
OC.Scenes = (function () {
  let cx = null, W = 0, H = 0, DPR = 1;
  const cache = new Map(), TAU = Math.PI * 2, now = () => performance.now();

  function init(ctx) { cx = ctx; }
  function resize(w, h, dpr) { W = w; H = h; DPR = dpr; cache.clear(); }

  /* ---------- utilidades ---------- */
  function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgba(h, a) { const c = hex2rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function tone(h, amt) { const c = hex2rgb(h).map(v => Math.max(0, Math.min(255, Math.round(v + amt)))); return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); }
  function mix(h1, h2, t) { const a = hex2rgb(h1), b = hex2rgb(h2); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  const frac = v => v - Math.floor(v), clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Capa pre-renderizada (w×h en px CSS). Se descarta al cambiar el tamaño.
  function lyr(key, w, h, draw) {
    const k = key + '|' + Math.round(w) + 'x' + Math.round(h);
    let c = cache.get(k);
    if (!c) {
      c = document.createElement('canvas');
      c.width = Math.max(1, Math.ceil(w * DPR)); c.height = Math.max(1, Math.ceil(h * DPR));
      const g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
      draw(g, w, h); c._w = w; c._h = h; cache.set(k, c);
    }
    return c;
  }
  function put(c, x, y) { cx.drawImage(c, x, y, c._w, c._h); }
  function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(s => gr.addColorStop(s[0], s[1])); return gr; }

  function glowSpr(color) {
    return lyr('glow|' + color, 64, 64, g => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, rgba(color, 1)); gr.addColorStop(0.35, rgba(color, 0.36)); gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    });
  }
  function glow(x, y, r, color, a) {
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = a === undefined ? 1 : a;
    cx.drawImage(glowSpr(color), x - r, y - r, r * 2, r * 2); cx.restore();
  }
  function flare(x, y, r, color, t, a) {   // estrella con destellos en cruz
    glow(x, y, r * 2.2, color, 0.55 * (a || 1)); glow(x, y, r * 0.8, '#ffffff', 0.9 * (a || 1));
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = (0.5 + 0.2 * Math.sin(t * 0.004 + x)) * (a || 1);
    cx.strokeStyle = color; cx.lineWidth = 1;
    cx.beginPath(); cx.moveTo(x - r * 2.6, y); cx.lineTo(x + r * 2.6, y); cx.moveTo(x, y - r * 2.6); cx.lineTo(x, y + r * 2.6); cx.stroke(); cx.restore();
  }
  function ball(x, y, r, c1, c2, c3) {   // esfera sombreada (luz arriba-izquierda)
    const gr = cx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.1, x, y, r);
    gr.addColorStop(0, c1); gr.addColorStop(0.55, c2); gr.addColorStop(1, c3);
    cx.fillStyle = gr; cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fill();
  }

  /* ---------- estrellas con paralaje (usa las del motor) ---------- */
  function stars(list, ymax, alpha) {
    const t = now(), lim = (ymax === undefined ? 1 : ymax) * H;
    cx.save();
    list.forEach((s, i) => {
      const y = s.y * H; if (y > lim) return;
      const near = s.v > 0.45, tw = 0.75 + 0.25 * Math.sin(t * 0.003 + i * 1.7);
      cx.globalAlpha = (alpha === undefined ? 1 : alpha) * (0.3 + s.v * 0.9) * tw;
      cx.fillStyle = (i % 5 === 0) ? '#ffe9c4' : (i % 3 === 0 ? '#bcd4ff' : '#ffffff');
      const x = s.x * W;
      if (near) { cx.fillRect(x, y - s.v * 5, s.s * 0.9, s.s * 0.9 + s.v * 10); }   // estela: está pasando cerca
      else cx.fillRect(x, y, s.s, s.s);
    });
    cx.restore();
  }

  /* ---------- planetas ---------- */
  function tex(kind) {
    return (function () {
      const k = 'texS|' + kind; let c = cache.get(k);
      if (c) return c;
      const sw = 1024, sh = 512, R = rng(hash(kind));
      c = document.createElement('canvas'); c.width = sw * 1.5; c.height = sh;
      const g = c.getContext('2d'), P = TEXP[kind] || TEXP.generico;
      P(g, sw, sh, R);
      g.drawImage(c, 0, 0, sw * 0.5, sh, sw, 0, sw * 0.5, sh);     // repite el inicio para que el giro no tenga costura
      c._sw = sw; c._sh = sh; cache.set(k, c); return c;
    })();
  }
  function blob(g, w, x, y, rx, ry, rot) {   // mancha que atraviesa el borde de la textura
    [-w, 0, w].forEach(dx => { g.beginPath(); g.ellipse(x + dx, y, rx, ry, rot || 0, 0, TAU); g.fill(); });
  }
  function bands(g, w, h, list, R, wob) {
    list.forEach(b => {
      g.fillStyle = b[2]; g.beginPath(); g.moveTo(0, b[0] * h);
      for (let x = 0; x <= w; x += 16) g.lineTo(x, b[0] * h + Math.sin(x * 0.02 + b[0] * 40) * (wob || 3));
      for (let x = w; x >= 0; x -= 16) g.lineTo(x, b[1] * h + Math.sin(x * 0.02 + b[1] * 40) * (wob || 3));
      g.closePath(); g.fill();
    });
  }
  const TEXP = {
    generico(g, w, h) { g.fillStyle = '#8a8a96'; g.fillRect(0, 0, w, h); },
    tierra(g, w, h, R) {
      g.fillStyle = vgrad(g, 0, h, [[0, '#0c3a86'], [0.5, '#1f78d0'], [1, '#0c3a86']]); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) {   // continentes
        const x = R() * w, y = h * (0.2 + R() * 0.6), rx = 40 + R() * 90, ry = 25 + R() * 55;
        g.fillStyle = R() < 0.3 ? '#a58a54' : '#3f8a3e'; blob(g, w, x, y, rx, ry, R() * 3);
        g.fillStyle = 'rgba(30,90,40,.6)'; blob(g, w, x + rx * 0.2, y - ry * 0.2, rx * 0.55, ry * 0.5, R() * 3);
      }
      g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(0, 0, w, h * 0.07); g.fillRect(0, h * 0.93, w, h * 0.07);
      g.fillStyle = 'rgba(255,255,255,.55)';   // nubes
      for (let i = 0; i < 30; i++) blob(g, w, R() * w, h * (0.1 + R() * 0.8), 30 + R() * 70, 5 + R() * 9, (R() - 0.5) * 0.5);
    },
    marte(g, w, h, R) {
      g.fillStyle = vgrad(g, 0, h, [[0, '#a44a26'], [0.5, '#c4683a'], [1, '#a44a26']]); g.fillRect(0, 0, w, h);
      for (let i = 0; i < 18; i++) { g.fillStyle = R() < 0.5 ? 'rgba(80,30,16,.5)' : 'rgba(236,150,90,.4)'; blob(g, w, R() * w, h * (0.15 + R() * 0.7), 30 + R() * 80, 15 + R() * 40, R() * 3); }
      g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(0, 0, w, h * 0.05); g.fillRect(0, h * 0.95, w, h * 0.05);
    },
    jupiter(g, w, h, R) {
      bands(g, w, h, [[0, 0.1, '#b89a78'], [0.1, 0.2, '#e8d6b8'], [0.2, 0.28, '#b8764c'], [0.28, 0.38, '#f0e2c8'], [0.38, 0.46, '#c08a5c'],
        [0.46, 0.56, '#efdfc4'], [0.56, 0.66, '#b87850'], [0.66, 0.76, '#ead8bc'], [0.76, 0.86, '#c4946c'], [0.86, 1, '#a88a6c']], R, 5);
      g.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 40; i++) blob(g, w, R() * w, R() * h, 20 + R() * 60, 2 + R() * 4, 0);
      g.fillStyle = '#c4452a'; blob(g, w, w * 0.6, h * 0.62, 70, 38, 0);          // Gran Mancha Roja
      g.fillStyle = '#e07a4a'; blob(g, w, w * 0.6, h * 0.62, 48, 24, 0);
      g.fillStyle = '#a8321e'; blob(g, w, w * 0.6, h * 0.62, 22, 11, 0);
    },
    saturno(g, w, h, R) {
      bands(g, w, h, [[0, 0.12, '#bca878'], [0.12, 0.26, '#e6d49c'], [0.26, 0.4, '#d2bd86'], [0.4, 0.55, '#eedfaa'], [0.55, 0.7, '#cdb87c'], [0.7, 0.85, '#e2cf96'], [0.85, 1, '#b8a470']], R, 2);
    },
    urano(g, w, h, R) {
      g.fillStyle = vgrad(g, 0, h, [[0, '#7cc4cc'], [0.5, '#a8e4e8'], [1, '#7cc4cc']]); g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.1)'; for (let i = 0; i < 8; i++) g.fillRect(0, h * (0.1 + i * 0.11), w, 5);
    },
    neptuno(g, w, h, R) {
      g.fillStyle = vgrad(g, 0, h, [[0, '#1c3aa8'], [0.5, '#3a62dc'], [1, '#1c3aa8']]); g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 12; i++) blob(g, w, R() * w, h * (0.2 + R() * 0.6), 40 + R() * 60, 2 + R() * 3, 0);
      g.fillStyle = 'rgba(10,20,90,.8)'; blob(g, w, w * 0.4, h * 0.56, 60, 30, 0);    // Gran Mancha Oscura
    },
    pluton(g, w, h, R) {
      g.fillStyle = '#9a7a5e'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 20; i++) { g.fillStyle = R() < 0.5 ? 'rgba(60,34,24,.55)' : 'rgba(230,200,170,.4)'; blob(g, w, R() * w, h * (0.15 + R() * 0.7), 20 + R() * 60, 14 + R() * 40, R() * 3); }
      g.fillStyle = 'rgba(244,232,214,.85)'; blob(g, w, w * 0.4, h * 0.55, 70, 55, 0); blob(g, w, w * 0.4 + 60, h * 0.5, 55, 50, 0);   // "corazón" de Tombaugh
    }
  };

  function shadeSpr(r) {
    const pad = 2, s = r * 2 + pad * 2;
    return lyr('shade|' + Math.round(r), s, s, g => {
      g.translate(r + pad, r + pad); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
      const gr = g.createRadialGradient(-r * 0.42, -r * 0.42, r * 0.15, -r * 0.1, -r * 0.1, r * 1.45);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,12,.22)'); gr.addColorStop(0.78, 'rgba(0,0,16,.72)'); gr.addColorStop(1, 'rgba(0,0,22,.94)');
      g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2);
      const lim = g.createRadialGradient(0, 0, r * 0.78, 0, 0, r);   // oscurecimiento del borde
      lim.addColorStop(0, 'rgba(0,0,0,0)'); lim.addColorStop(1, 'rgba(0,0,10,.5)');
      g.fillStyle = lim; g.fillRect(-r, -r, r * 2, r * 2);
    });
  }
  function rimSpr(r, color) {
    const pad = 2, s = r * 2 + pad * 2;
    return lyr('rim|' + Math.round(r) + color, s, s, g => {
      g.translate(r + pad, r + pad); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
      const gr = g.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.7, -r * 0.25, -r * 0.25, r * 1.18);
      gr.addColorStop(0, rgba(color, 0)); gr.addColorStop(0.85, rgba(color, 0.0)); gr.addColorStop(1, rgba(color, 0.55));
      g.fillStyle = gr; g.fillRect(-r, -r, r * 2, r * 2);
    });
  }
  // Planeta: textura proyectada en esfera (giro real), sombra, borde de luz y atmósfera.
  function planet(kind, x, y, r, o) {
    o = o || {}; const t = now(), T = tex(kind), rot = frac(t * (o.spin || 0.000018));
    if (o.atmo) glow(x - r * 0.1, y - r * 0.1, r * 1.55, o.atmo, o.atmoA || 0.35);
    cx.save(); cx.translate(x, y); cx.beginPath(); cx.arc(0, 0, r, 0, TAU); cx.clip();
    const st = Math.max(1.5, r / 40);
    for (let sx = -r; sx < r; sx += st) {
      const u0 = Math.asin(clamp(sx / r, -1, 1)), u1 = Math.asin(clamp((sx + st) / r, -1, 1));
      const f0 = (u0 / Math.PI + 0.5) * 0.5 + rot, f1 = (u1 / Math.PI + 0.5) * 0.5 + rot;
      cx.drawImage(T, frac(f0) * T._sw, 0, Math.max(1, (f1 - f0) * T._sw), T._sh, sx, -r, st + 0.7, r * 2);
    }
    cx.restore();
    const sh = shadeSpr(r); cx.drawImage(sh, x - r - 2, y - r - 2, sh._w, sh._h);
    if (o.atmo) { cx.save(); cx.globalCompositeOperation = 'lighter'; const rm = rimSpr(r, o.atmo); cx.drawImage(rm, x - r - 2, y - r - 2, rm._w, rm._h); cx.restore(); }
  }
  function rings(x, y, r, o, front) {   // anillos con oclusión: la mitad lejana va detrás del planeta y la cercana delante
    const tilt = o.tilt, k = o.k || 0.3, a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU;
    cx.save(); cx.translate(x, y); cx.rotate(tilt);
    (o.list || []).forEach(b => {
      cx.strokeStyle = b[2]; cx.lineWidth = Math.max(1, (b[1] - b[0]) * r); cx.beginPath();
      cx.ellipse(0, 0, r * (b[0] + b[1]) / 2, r * k * (b[0] + b[1]) / 2, 0, a0, a1); cx.stroke();
    });
    cx.restore();
  }
  const SAT_RINGS = [[1.25, 1.4, 'rgba(176,152,110,.35)'], [1.4, 1.58, 'rgba(226,206,160,.7)'], [1.58, 1.74, 'rgba(238,222,178,.85)'], [1.74, 1.9, 'rgba(200,180,136,.6)'],
    [1.96, 2.1, 'rgba(226,206,160,.55)'], [2.1, 2.2, 'rgba(176,152,110,.35)']];

  function sphereSat(x, y, r, c1, c2, c3) { ball(x, y, r, c1, c2, c3); }
  function moon(x, y, r, shade) {   // luna con cráteres
    ball(x, y, r, tone(shade, 70), shade, tone(shade, -90));
    cx.fillStyle = 'rgba(0,0,0,.18)'; cx.beginPath(); cx.arc(x - r * 0.25, y + r * 0.2, r * 0.22, 0, TAU); cx.arc(x + r * 0.3, y - r * 0.15, r * 0.16, 0, TAU); cx.fill();
  }

  /* ---------- fondos de espacio profundo ---------- */
  function deepBg(key, tint, a2, a) {
    put(lyr('space|' + key, W, H, (g, w, h) => {
      g.fillStyle = vgrad(g, 0, h, [[0, '#03040b'], [0.6, '#050714'], [1, '#02030a']]); g.fillRect(0, 0, w, h);
      const R = rng(hash(key));
      for (let i = 0; i < 6; i++) {
        const x = R() * w, y = R() * h, r = Math.min(w, h) * (0.25 + R() * 0.45), gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, rgba(i % 2 ? (a2 || tint) : tint, a || 0.22)); gr.addColorStop(1, rgba(tint, 0)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      }
    }), 0, 0);
  }

  function sceneTierra(world, st, t) {
    deepBg('tierra', '#1a4a8a', '#0a2a5a'); stars(st);
    const r = Math.min(W, H) * 0.2, px = W * 0.5, py = H * 0.2;
    const ang = t * 0.00045, mx = px + Math.cos(ang) * r * 2.3, my = py + Math.sin(ang) * r * 0.55, front = Math.sin(ang) > 0;
    if (!front) moon(mx, my, r * 0.2, '#b4b4bc');
    planet('tierra', px, py, r, { atmo: '#6ab8ff', atmoA: 0.4, spin: 0.00002 });
    if (front) moon(mx, my, r * 0.2, '#b4b4bc');
  }
  function sceneMarte(world, st, t) {
    deepBg('marte', '#6a2412', '#3a1408'); stars(st);
    const r = Math.min(W, H) * 0.2, px = W * 0.5, py = H * 0.2;
    planet('marte', px, py, r, { atmo: '#ff9a6a', atmoA: 0.22, spin: 0.000024 });
    const a = t * 0.0012; moon(px + Math.cos(a) * r * 1.9, py + Math.sin(a) * r * 0.5, r * 0.09, '#8a7a6a');   // Fobos
  }
  function sceneJupiter(world, st, t) {
    deepBg('jupiter', '#6a4630', '#3a2418'); stars(st);
    const r = Math.min(W, H) * 0.25, px = W * 0.5, py = H * 0.22;
    planet('jupiter', px, py, r, { atmo: '#ffcf9a', atmoA: 0.18, spin: 0.000028 });
    [['#d8c46a', 1.55, 0.0032, 0.1], ['#cfe0e8', 1.85, 0.0022, 0.085], ['#b8aa98', 2.2, 0.0014, 0.12], ['#8a7a6a', 2.6, 0.0009, 0.11]].forEach((m, i) => {   // lunas galileanas
      const a = t * m[2] * 0.4 + i * 1.9; moon(px + Math.cos(a) * r * m[1], py + Math.sin(a) * r * 0.16, r * m[3], m[0]);
    });
  }
  function sceneSaturno(world, st, t) {
    deepBg('saturno', '#5a4a22', '#2a2210'); stars(st);
    const r = Math.min(W, H) * 0.14, px = W * 0.5, py = H * 0.22, o = { tilt: -0.28, k: 0.3, list: SAT_RINGS };
    glow(px, py, r * 3.2, '#e8d59a', 0.1);
    rings(px, py, r, o, false);
    planet('saturno', px, py, r, { atmo: '#f0e0a8', atmoA: 0.2, spin: 0.000022 });
    rings(px, py, r, o, true);
    const a = t * 0.0006; moon(px + Math.cos(a) * r * 2.9, py + Math.sin(a) * r * 0.9, r * 0.12, '#d8a85a');   // Titán
  }
  function sceneUrano(world, st, t) {
    deepBg('urano', '#1a5a64', '#0a2a34'); stars(st);
    const r = Math.min(W, H) * 0.16, px = W * 0.5, py = H * 0.22, o = { tilt: Math.PI / 2 - 0.12, k: 0.22, list: [[1.5, 1.56, 'rgba(180,230,236,.45)'], [1.7, 1.74, 'rgba(180,230,236,.3)'], [1.9, 1.96, 'rgba(180,230,236,.4)']] };
    rings(px, py, r, o, false);
    planet('urano', px, py, r, { atmo: '#9fe8ee', atmoA: 0.3, spin: 0.00002 });
    rings(px, py, r, o, true);
  }
  function sceneNeptuno(world, st, t) {
    deepBg('neptuno', '#1a2a8a', '#0a1250'); stars(st);
    const r = Math.min(W, H) * 0.17, px = W * 0.5, py = H * 0.22;
    planet('neptuno', px, py, r, { atmo: '#5a82ff', atmoA: 0.38, spin: 0.000026 });
    const a = -t * 0.0007; moon(px + Math.cos(a) * r * 2.3, py + Math.sin(a) * r * 0.7, r * 0.1, '#c8bcc0');   // Tritón
  }
  function sceneKuiper(world, st, t) {
    deepBg('kuiper', '#3a2a6a', '#1a1240'); stars(st);
    flare(W * 0.82, H * 0.1, Math.min(W, H) * 0.012, '#fff2d0', t, 0.9);    // el Sol, ya muy lejano
    const r = Math.min(W, H) * 0.1, px = W * 0.38, py = H * 0.22;
    planet('pluton', px, py, r, { atmo: '#c8b8ff', atmoA: 0.14, spin: 0.000016 });
    const a = t * 0.0005; moon(px + Math.cos(a) * r * 2.1 + r * 0.9, py + Math.sin(a) * r * 0.45, r * 0.4, '#a8968a');   // Caronte
    // fragmentos helados a la deriva (paralaje)
    const R = rng(77);
    for (let i = 0; i < 16; i++) {
      const sx = R() * W, sp = 0.012 + R() * 0.03, sz = 2 + R() * 5, y = ((t * sp + R() * (H + 40)) % (H + 40)) - 20;
      cx.globalAlpha = 0.35 + sp * 8; ball(sx + Math.sin(t * 0.0004 + i) * 6, y, sz, '#e0e4f4', '#8a8eb0', '#2a2c44'); cx.globalAlpha = 1;
    }
  }
  function sceneOort(world, st, t) {
    deepBg('oort', '#242a66', '#10143a'); stars(st);
    flare(W * 0.16, H * 0.09, Math.min(W, H) * 0.008, '#fff2d0', t, 0.8);
    const R = rng(5);
    cx.save(); cx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) {   // granos de hielo
      const x = R() * W, sp = 0.006 + R() * 0.02, y = ((t * sp + R() * (H + 20)) % (H + 20)) - 10;
      cx.globalAlpha = 0.18 + R() * 0.4 + 0.2 * Math.sin(t * 0.004 + i); cx.fillStyle = '#dfe8ff'; cx.fillRect(x, y, 1.6, 1.6);
    }
    cx.restore();
    // cometa con cola
    const cyc = (t * 0.00006) % 1, hx = W * (1.15 - cyc * 1.4), hy = H * (0.05 + cyc * 0.4), ang = Math.atan2(0.4 * H, -1.4 * W);
    cx.save(); cx.translate(hx, hy); cx.rotate(ang + Math.PI);
    cx.globalCompositeOperation = 'lighter';
    const tg = cx.createLinearGradient(0, 0, W * 0.6, 0); tg.addColorStop(0, 'rgba(190,225,255,.7)'); tg.addColorStop(1, 'rgba(190,225,255,0)');
    cx.fillStyle = tg; cx.beginPath(); cx.moveTo(0, -5); cx.lineTo(W * 0.6, -26); cx.lineTo(W * 0.6, 26); cx.lineTo(0, 5); cx.closePath(); cx.fill();
    cx.restore();
    glow(hx, hy, 24, '#bfe4ff', 0.8); ball(hx, hy, 5, '#ffffff', '#cfe6ff', '#7a9ac8');
  }

  /* ---------- galaxia ---------- */
  function nebulaLayer(key, cols, seedN, a) {
    return lyr('neb|' + key, W, H * 1.6, (g, w, h) => {
      const R = rng(hash(key));
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < seedN; i++) {
        const x = R() * w, y = R() * h, r = (0.12 + R() * 0.3) * Math.max(w, H);
        const c = cols[i % cols.length], gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, rgba(c, a)); gr.addColorStop(0.5, rgba(c, a * 0.4)); gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    });
  }
  function drift(c, speed, t) {   // capa alta que baja con paralaje y se repite
    const th = c._h, y = (t * speed) % th;
    cx.drawImage(c, 0, y - th, c._w, th); cx.drawImage(c, 0, y, c._w, th);
  }
  function galaxyBase(key, cols, a, t, st) {
    cx.fillStyle = '#03040b'; cx.fillRect(0, 0, W, H);
    cx.save(); cx.globalAlpha = 1; drift(nebulaLayer(key + 'a', cols, 7, a), 0.006, t); cx.restore();
    cx.save(); cx.globalAlpha = 0.7; drift(nebulaLayer(key + 'b', cols.slice().reverse(), 6, a * 0.8), 0.014, t); cx.restore();
    stars(st);
  }
  function sceneAlfaCentauri(world, st, t) {
    galaxyBase('ac', ['#5a3a10', '#2a2a5a', '#6a4a20'], 0.2, t, st);
    const cxp = W * 0.5, cyp = H * 0.2, a = t * 0.0006, d = Math.min(W, H) * 0.1;
    const ax = cxp + Math.cos(a) * d * 0.5, ay = cyp + Math.sin(a) * d * 0.18, bx = cxp - Math.cos(a) * d * 0.9, by = cyp - Math.sin(a) * d * 0.32;
    flare(bx, by, 7, '#ffb060', t, 0.95); flare(ax, ay, 11, '#fff0c0', t, 1);
    flare(W * 0.84, H * 0.36, 3, '#ff6a4a', t, 0.9);                                  // Próxima, pequeña y roja
  }
  function sceneOrion(world, st, t) {
    galaxyBase('or', ['#ff4ab8', '#4a8aff', '#ff8a5a', '#8a3aff'], 0.34, t, st);
    cx.save(); cx.globalCompositeOperation = 'source-over';
    const R = rng(11);
    for (let i = 0; i < 5; i++) {   // vetas de polvo oscuro
      const x = R() * W, y = H * (0.1 + R() * 0.8), rx = W * (0.2 + R() * 0.2), ry = H * (0.03 + R() * 0.05);
      const gr = cx.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, 'rgba(6,4,18,.55)'); gr.addColorStop(1, 'rgba(6,4,18,0)');
      cx.save(); cx.translate(x, y); cx.scale(1, ry / rx); cx.translate(-x, -y); cx.fillStyle = gr; cx.beginPath(); cx.arc(x, y, rx, 0, TAU); cx.fill(); cx.restore();
    }
    cx.restore();
    [[-14, -4], [10, -9], [2, 8], [18, 7]].forEach((p, i) => flare(W * 0.5 + p[0], H * 0.18 + p[1], 4.5 - i * 0.4, '#cfe4ff', t, 1));   // Trapecio
  }
  function scenePleyades(world, st, t) {
    galaxyBase('pl', ['#2a5ac8', '#4a8aff', '#2a3a8a'], 0.26, t, st);
    const R = rng(21);
    for (let i = 0; i < 7; i++) flare(W * (0.25 + R() * 0.5), H * (0.07 + R() * 0.32), 5 + R() * 6, '#a8d0ff', t + i * 400, 0.95);
    for (let i = 0; i < 14; i++) { const x = W * (0.2 + R() * 0.6), y = H * (0.05 + R() * 0.36); glow(x, y, 4 + R() * 4, '#bcdcff', 0.7); }
  }
  function sceneAgujero(world, st, t) {
    galaxyBase('ag', ['#2a1a6a', '#4a2a8a', '#1a1a4a'], 0.22, t, st);
    const px = W * 0.5, py = H * 0.2, r = Math.min(W, H) * 0.085, tilt = -0.18;
    const disk = (front) => {
      cx.save(); cx.translate(px, py); cx.rotate(tilt); cx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 46; i++) {
        const u = i / 46, rr = r * (1.35 + u * 1.9), a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU;
        const hot = 1 - u, rot = t * (0.0009 / (0.4 + u)) ;
        cx.strokeStyle = (u < 0.3 ? 'rgba(255,240,200,' : u < 0.6 ? 'rgba(255,170,80,' : 'rgba(210,90,60,') + (0.55 * hot + 0.08) * (0.7 + 0.3 * Math.sin(rot * 6 + i)) + ')';
        cx.lineWidth = 1.6; cx.beginPath(); cx.ellipse(0, 0, rr, rr * 0.2, 0, a0, a1); cx.stroke();
      }
      cx.restore();
    };
    glow(px, py, r * 4.2, '#7a4aff', 0.18);
    disk(false);                                                              // parte lejana del disco, vista por encima del horizonte
    cx.save(); cx.translate(px, py); cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = 'rgba(255,214,150,.65)'; cx.lineWidth = 2;
    cx.beginPath(); cx.arc(0, 0, r * 1.28, 0, TAU); cx.stroke(); cx.restore();   // anillo de fotones (lente gravitacional)
    cx.fillStyle = '#000'; cx.beginPath(); cx.arc(px, py, r * 1.12, 0, TAU); cx.fill();
    disk(true);
  }
  let _gal = null;
  function galaxySprite() {
    return lyr('spiral', 200, 200, g => {
      const R = rng(9); g.translate(100, 100); g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 1800; i++) {
        const arm = i % 2, u = Math.pow(R(), 0.8), th = u * 9 + arm * Math.PI + (R() - 0.5) * 0.5, rr = 6 + u * 88;
        const x = Math.cos(th) * rr + (R() - 0.5) * 8, y = Math.sin(th) * rr + (R() - 0.5) * 8;
        g.fillStyle = u < 0.25 ? 'rgba(255,230,180,.55)' : u < 0.6 ? 'rgba(190,200,255,.45)' : 'rgba(130,150,255,.35)'; g.fillRect(x, y, 1.5, 1.5);
      }
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 36); gr.addColorStop(0, 'rgba(255,240,200,.95)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = gr; g.fillRect(-40, -40, 80, 80);
    });
  }
  function sceneAndromeda(world, st, t) {
    galaxyBase('an', ['#3a2a8a', '#2a4a9a', '#5a3a7a'], 0.2, t, st);
    const spr = galaxySprite(), s = Math.min(W, H) * 0.62;
    cx.save(); cx.translate(W * 0.5, H * 0.2); cx.rotate(-0.5 + t * 0.00002); cx.scale(1, 0.4);
    cx.drawImage(spr, -s / 2, -s / 2, s, s); cx.restore();
    glow(W * 0.5, H * 0.2, s * 0.22, '#ffe6b0', 0.35);
    glow(W * 0.78, H * 0.3, 14, '#bcc8ff', 0.5);                              // M32, su compañera
  }

  /* ---------- suelo en perspectiva ---------- */
  function groundPlane(gy, o, t) {
    const h = H - gy; if (h <= 2) return;
    cx.fillStyle = vgrad(cx, gy, H, [[0, o.far], [1, o.near]]); cx.fillRect(0, gy, W, h);
    if (o.lines) {   // líneas que convergen en el horizonte
      cx.strokeStyle = o.lines; cx.lineWidth = 1;
      for (let i = -7; i <= 7; i++) { cx.beginPath(); cx.moveTo(W / 2 + i * W * 0.02, gy); cx.lineTo(W / 2 + i * W * 0.34, H); cx.stroke(); }
    }
    const R = rng(o.seed || 3), n = o.n || 10, f = [];
    for (let i = 0; i < n; i++) f.push({ i, z: frac(t * (o.speed || 0.00007) + i / n), fx: R(), s: 0.6 + R() * 0.9, v: R() });
    f.sort((a, b) => a.z - b.z);
    f.forEach(e => {
      const z = e.z, y = gy + h * Math.pow(z, 1.55), sc = 0.1 + z * 1.55, x = W / 2 + (e.fx - 0.5) * W * (0.3 + z * 1.9);
      const al = clamp(z / 0.14, 0, 1) * (1 - clamp((z - 0.9) / 0.1, 0, 1));
      if (al <= 0.01) return;
      cx.save(); cx.globalAlpha = al;
      FEAT[o.kind](x, y, e.s * sc, e, o, t); cx.restore();
    });
    // bruma en el horizonte
    cx.fillStyle = vgrad(cx, gy - 10, gy + 26, [[0, rgba(o.haze, 0)], [0.4, rgba(o.haze, o.hazeA === undefined ? 0.45 : o.hazeA)], [1, rgba(o.haze, 0)]]);
    cx.fillRect(0, gy - 10, W, 36);
  }
  const FEAT = {
    crater(x, y, s, e, o) {
      const rx = 15 * s, ry = rx * 0.3;
      cx.fillStyle = rgba(o.dark, 0.55); cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, 0, TAU); cx.fill();
      cx.strokeStyle = rgba(o.rim, 0.7); cx.lineWidth = Math.max(1, s * 1.4); cx.beginPath(); cx.ellipse(x, y, rx, ry, 0, Math.PI * 1.02, Math.PI * 1.98); cx.stroke();   // borde iluminado
      cx.fillStyle = rgba(o.dark, 0.35); cx.beginPath(); cx.ellipse(x + rx * 0.22, y + ry * 0.2, rx * 0.72, ry * 0.7, 0, 0, TAU); cx.fill();
    },
    rock(x, y, s, e, o) {
      const w = 9 * s, h = 7 * s;
      cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(x + w * 0.3, y + h * 0.15, w * 0.95, h * 0.28, 0, 0, TAU); cx.fill();
      cx.fillStyle = o.rim; cx.beginPath(); cx.moveTo(x - w, y); cx.lineTo(x - w * 0.4, y - h); cx.lineTo(x + w * 0.1, y - h * 0.8); cx.lineTo(x, y); cx.closePath(); cx.fill();
      cx.fillStyle = o.dark; cx.beginPath(); cx.moveTo(x + w * 0.1, y - h * 0.8); cx.lineTo(x + w * 0.9, y - h * 0.3); cx.lineTo(x + w, y); cx.lineTo(x, y); cx.closePath(); cx.fill();
    },
    lava(x, y, s, e, o, t) {
      const L = 22 * s, pu = 0.7 + 0.3 * Math.sin(t * 0.004 + e.i * 2);
      cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha *= 0.8 * pu;
      cx.strokeStyle = o.rim; cx.lineWidth = Math.max(1.5, 3 * s); cx.lineJoin = 'round'; cx.beginPath(); cx.moveTo(x - L, y);
      cx.lineTo(x - L * 0.4, y + 2 * s); cx.lineTo(x + L * 0.1, y - 1.5 * s); cx.lineTo(x + L, y + 1.5 * s); cx.stroke();
      cx.strokeStyle = '#fff1b0'; cx.lineWidth = Math.max(1, 1.2 * s); cx.stroke(); cx.restore();
      glow(x, y, 20 * s, o.rim, 0.28 * pu);
    },
    tuft(x, y, s, e, o) {
      cx.strokeStyle = o.rim; cx.lineWidth = Math.max(1, 1.4 * s); cx.lineCap = 'round';
      for (let i = -2; i <= 2; i++) { cx.beginPath(); cx.moveTo(x + i * 2 * s, y); cx.quadraticCurveTo(x + i * 3 * s, y - 6 * s, x + i * 4.5 * s, y - (9 - Math.abs(i)) * s); cx.stroke(); }
      cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(x, y + 0.5 * s, 8 * s, 1.8 * s, 0, 0, TAU); cx.fill();
    },
    ripple(x, y, s, e, o) {
      cx.strokeStyle = rgba(o.rim, 0.55); cx.lineWidth = Math.max(1, s); cx.beginPath(); cx.ellipse(x, y, 18 * s, 4.5 * s, 0, 0, TAU); cx.stroke();
      cx.strokeStyle = rgba(o.rim, 0.25); cx.beginPath(); cx.ellipse(x, y, 28 * s, 7 * s, 0, 0, TAU); cx.stroke();
    },
    pebble(x, y, s, e, o) {
      cx.fillStyle = 'rgba(0,0,0,.28)'; cx.beginPath(); cx.ellipse(x + 2 * s, y + s, 6 * s, 1.8 * s, 0, 0, TAU); cx.fill();
      ball(x, y - 2 * s, 4.4 * s, o.rim, mix(o.rim, o.dark, 0.5), o.dark);
    },
    dune(x, y, s, e, o) {
      cx.strokeStyle = rgba(o.rim, 0.5); cx.lineWidth = Math.max(1, s * 1.2); cx.beginPath(); cx.moveTo(x - 24 * s, y); cx.quadraticCurveTo(x, y - 5 * s, x + 24 * s, y); cx.stroke();
      cx.strokeStyle = rgba(o.dark, 0.3); cx.beginPath(); cx.moveTo(x - 24 * s, y + 2 * s); cx.quadraticCurveTo(x, y - 3 * s, x + 24 * s, y + 2 * s); cx.stroke();
    }
  };

  /* ---------- montañas ---------- */
  function ridge(key, baseY, amp, base, lit, seed, n, fog) {
    return lyr('ridge|' + key, W, H, (g, w) => {
      const R = rng(seed), pts = []; const step = w / n;
      for (let i = 0; i <= n; i++) pts.push([i * step, baseY - amp * (0.35 + 0.65 * R()) * (i % 2 ? 1 : 0.45)]);
      g.fillStyle = base; g.beginPath(); g.moveTo(0, H); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(w, H); g.closePath(); g.fill();
      g.fillStyle = lit; g.globalAlpha = 0.55;   // cara iluminada (izquierda de cada pico)
      for (let i = 1; i < pts.length; i += 2) { const p = pts[i], l = pts[i - 1]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(l[0], l[1] + 2); g.lineTo(p[0], Math.max(l[1], p[1]) + (baseY - p[1]) * 0.55); g.closePath(); g.fill(); }
      g.globalAlpha = 1;
      if (fog) { g.fillStyle = vgrad(g, baseY - amp, baseY + 6, [[0, rgba(fog, 0)], [1, rgba(fog, 0.55)]]); g.beginPath(); g.moveTo(0, H); pts.forEach(p => g.lineTo(p[0], p[1])); g.lineTo(w, H); g.closePath(); g.fill(); }
    });
  }
  function cloudStrip(key, y, hh, color, shade, n, seed) {
    return lyr('cl|' + key, W, hh, (g, w) => {
      const R = rng(seed);
      for (let i = 0; i < n; i++) {
        const x = R() * w, yy = y + R() * hh * 0.5, s = 24 + R() * 44;
        [-w, 0, w].forEach(dx => {
          for (let k = 0; k < 5; k++) {
            const ox = x + dx + (k - 2) * s * 0.5, oy = yy + Math.abs(k - 2) * s * 0.08 + (R() - 0.5) * s * 0.12, rr = s * (0.5 + R() * 0.3);
            const gr = g.createRadialGradient(ox - rr * 0.2, oy - rr * 0.3, rr * 0.1, ox, oy, rr);
            gr.addColorStop(0, color); gr.addColorStop(1, shade); g.fillStyle = gr; g.globalAlpha = 0.8; g.beginPath(); g.arc(ox, oy, rr, 0, TAU); g.fill();
          }
        });
      }
    });
  }
  function clouds(key, y, hh, color, shade, n, seed, speed, t, alpha) {
    const c = cloudStrip(key, y, hh, color, shade, n, seed), x = (t * speed) % W;
    cx.save(); cx.globalAlpha = alpha === undefined ? 1 : alpha; cx.drawImage(c, x, 0, c._w, c._h); cx.drawImage(c, x - W, 0, c._w, c._h); cx.restore();
  }
  function sunGlare(x, y, r, color, t, rays) {
    glow(x, y, r * 5, color, 0.32); glow(x, y, r * 2.4, '#fff4d8', 0.55);
    if (rays) {
      cx.save(); cx.translate(x, y); cx.rotate(t * 0.00006); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = rgba(color, 0.14);
      for (let i = 0; i < 12; i++) { cx.rotate(TAU / 12); cx.beginPath(); cx.moveTo(0, -r); cx.lineTo(r * 0.35, -r * 3.6); cx.lineTo(-r * 0.35, -r * 3.6); cx.closePath(); cx.fill(); }
      cx.restore();
    }
    cx.fillStyle = '#fff6dc'; cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fill();
  }
  function bg(key, stops) { put(lyr('bg|' + key, W, H, (g, w, h) => { g.fillStyle = vgrad(g, 0, h, stops); g.fillRect(0, 0, w, h); }), 0, 0); }

  /* ---------- superficies planetarias ---------- */
  function sceneMercurio(world, st, gy, t) {
    bg('merc', [[0, '#050403'], [0.55, '#14110d'], [1, '#2a2620']]); stars(st, 0.6, 0.8);
    const sx = W * 0.82, sy = H * 0.15, sr = Math.min(W, H) * 0.075;
    sunGlare(sx, sy, sr, '#ffd27a', t, true);
    put(ridge('merc1', gy - 6, H * 0.12, '#3a352e', '#6e675a', 31, 9, '#d8a860'), 0, 0);
    put(ridge('merc0', gy + 2, H * 0.07, '#4e483e', '#8a8272', 32, 12, '#d8a860'), 0, 0);
    groundPlane(gy, { far: '#6a6458', near: '#2e2a24', haze: '#d8a860', hazeA: 0.35, kind: 'crater', dark: '#14110d', rim: '#c4baa4', seed: 4, n: 11, speed: 0.00006, lines: 'rgba(0,0,0,.08)' }, t);
  }
  function sceneVenus(world, st, gy, t) {
    bg('venus', [[0, '#f0b050'], [0.3, '#cf702e'], [0.65, '#80301c'], [1, '#2a0e08']]);
    glow(W * 0.3, H * 0.17, Math.min(W, H) * 0.4, '#ffe0a0', 0.55);
    clouds('v1', H * 0.04, H * 0.34, '#ffe0a8', '#b86a30', 6, 5, 0.006, t, 0.55);
    clouds('v2', H * 0.2, H * 0.34, '#f0b070', '#7a2c18', 7, 6, 0.011, t, 0.75);
    const vols = [[W * 0.2, 0.08], [W * 0.56, 0.11], [W * 0.84, 0.07]];
    vols.forEach((v, i) => {
      const bx = v[0], ph = H * v[1], bw = ph * 1.5;
      cx.fillStyle = '#3a1410'; cx.beginPath(); cx.moveTo(bx - bw, gy); cx.lineTo(bx - 7, gy - ph); cx.lineTo(bx + 7, gy - ph); cx.lineTo(bx + bw, gy); cx.closePath(); cx.fill();
      cx.fillStyle = 'rgba(120,50,30,.7)'; cx.beginPath(); cx.moveTo(bx - bw, gy); cx.lineTo(bx - 7, gy - ph); cx.lineTo(bx, gy - ph * 0.2); cx.lineTo(bx - 4, gy); cx.closePath(); cx.fill();
      const pu = 0.7 + 0.3 * Math.sin(t * 0.003 + i * 2); glow(bx, gy - ph, 22 + 8 * pu, '#ff7b2e', 0.7 * pu);
      for (let k = 0; k < 4; k++) { const sy = gy - ph - ((t * 0.02 + k * 18) % 70); cx.fillStyle = 'rgba(40,20,16,' + (0.35 * (1 - ((t * 0.02 + k * 18) % 70) / 70)) + ')'; cx.beginPath(); cx.arc(bx + Math.sin(k + t * 0.001) * 6, sy, 6 + k * 2.2, 0, TAU); cx.fill(); }   // humo
    });
    groundPlane(gy, { far: '#5a2a1c', near: '#1c0a06', haze: '#e0803a', hazeA: 0.4, kind: 'lava', rim: '#ff7b2e', dark: '#240a06', seed: 8, n: 9, speed: 0.00008, lines: 'rgba(255,120,40,.07)' }, t);
    cx.fillStyle = 'rgba(255,150,60,0.05)'; cx.fillRect(0, 0, W, H);
  }

  /* ---------- subsuelo (Centro de la Tierra) ---------- */
  const SUB = {
    litosfera:   { bg: [[0, '#1c1610'], [1, '#3a2c1e']], wall: '#5a4630', lit: '#9a7a52', vein: null, glowC: null, emb: 0 },
    astenosfera: { bg: [[0, '#2a140c'], [1, '#6a2c16']], wall: '#7a3a1c', lit: '#c8662c', vein: '#ff8a3a', glowC: '#ff6a2a', emb: 16 },
    manto:       { bg: [[0, '#3a0e08'], [1, '#8a2410']], wall: '#8a2a14', lit: '#e0603a', vein: '#ff7a2a', glowC: '#ff4a1a', emb: 22 },
    nucleo_ext:  { bg: [[0, '#5a1408'], [1, '#d04a14']], wall: '#a8381a', lit: '#ffa050', vein: '#ffd070', glowC: '#ff7a2a', emb: 28 },
    nucleo_int:  { bg: [[0, '#8a2a10'], [1, '#ffe0a8']], wall: '#d07a30', lit: '#fff0c0', vein: '#ffffff', glowC: '#ffe0a0', emb: 30 }
  };
  function wallLayer(key, th, side, base, lit, vein, wmin, wamp, seed) {
    return lyr('wall|' + key, W, th, (g, w, h) => {
      const R = rng(seed), A = [wmin, wamp * 0.55, wamp * 0.3], K = [1, 3, 7], P = [R() * 6, R() * 6, R() * 6];
      const edge = y => wmin + wamp * (0.5 + 0.5 * Math.sin(TAU * K[0] * y / h + P[0])) + wamp * 0.3 * Math.sin(TAU * K[1] * y / h + P[1]) + wamp * 0.14 * Math.sin(TAU * K[2] * y / h + P[2]);
      const pts = []; for (let y = 0; y <= h; y += 6) pts.push([y, edge(y)]);
      const sx = side < 0 ? 0 : w, dir = side < 0 ? 1 : -1;
      const gr = g.createLinearGradient(sx, 0, sx + dir * (wmin + wamp * 1.4), 0); gr.addColorStop(0, tone(base, -50)); gr.addColorStop(1, base);
      g.fillStyle = gr; g.beginPath(); g.moveTo(sx, 0); pts.forEach(p => g.lineTo(sx + dir * p[1], p[0])); g.lineTo(sx, h); g.closePath(); g.fill();
      g.strokeStyle = rgba(lit, 0.55); g.lineWidth = 2; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(sx + dir * p[1], p[0]) : g.moveTo(sx + dir * p[1], p[0])); g.stroke();   // borde iluminado
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1;   // estratos
      for (let i = 0; i < 9; i++) { const y = h * (i + R() * 0.5) / 9, e = edge(y); g.beginPath(); g.moveTo(sx, y); g.lineTo(sx + dir * e * 0.95, y + (R() - 0.5) * 8); g.stroke(); }
      if (vein) {
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(vein, 0.7); g.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) { const y0 = R() * h; g.beginPath(); let yy = y0, xx = sx + dir * edge(yy) * (0.3 + R() * 0.5); g.moveTo(xx, yy); for (let k = 0; k < 4; k++) { yy += 18 + R() * 24; xx += dir * (R() - 0.5) * 12; g.lineTo(xx, yy); } g.stroke(); }
        g.restore();
      }
    });
  }
  function sceneSubsuelo(world, st, gy, t, f) {
    const P = SUB[f]; bg('sub' + f, P.bg);
    if (P.glowC) { const pu = 0.75 + 0.25 * Math.sin(t * 0.0018); glow(W * 0.5, H * 1.02, W * 0.9, P.glowC, 0.38 * pu); }
    const th = H, far = wallLayer(f + 'f', th, -1, tone(P.wall, -40), P.lit, P.vein, W * 0.03, W * 0.07, 41), farR = wallLayer(f + 'fr', th, 1, tone(P.wall, -40), P.lit, P.vein, W * 0.03, W * 0.07, 42);
    cx.save(); cx.globalAlpha = 0.8; drift(far, 0.025, t); drift(farR, 0.025, t); cx.restore();
    drift(wallLayer(f + 'n', th, -1, P.wall, P.lit, P.vein, W * 0.03, W * 0.1, 43), 0.07, t);
    drift(wallLayer(f + 'nr', th, 1, P.wall, P.lit, P.vein, W * 0.03, W * 0.1, 44), 0.07, t);
    if (P.emb) {   // pavesas / chispas que ascienden
      cx.save(); cx.globalCompositeOperation = 'lighter'; const R = rng(77);
      for (let i = 0; i < P.emb; i++) { const x = W * (0.12 + R() * 0.76) + Math.sin(t * 0.0013 + i) * 9, y = H - ((t * (0.02 + R() * 0.04) + R() * H) % (H + 20)) + 10;
        cx.globalAlpha = 0.3 + R() * 0.5; cx.fillStyle = P.vein; cx.fillRect(x, y, 1.8, 1.8); }
      cx.restore();
    }
    if (gy < H) groundPlane(gy, { far: '#5a4632', near: '#241a12', haze: '#8a6a45', hazeA: 0.35, kind: 'rock', rim: '#b08c5c', dark: '#3a2a1c', seed: 6, n: 10, speed: 0.00006, lines: 'rgba(0,0,0,.1)' }, t);
    cx.fillStyle = vgrad(cx, 0, H, [[0, 'rgba(0,0,0,.45)'], [0.45, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']]); cx.fillRect(0, 0, W, H);
  }

  /* ---------- organismo ---------- */
  const ORG = {
    respiratorio: { bg: '#0c3450', lumen: '#5ab8e0', wall: '#2a6a8a', lit: '#8ad0f0', vein: null },
    circulatorio: { bg: '#4a0c18', lumen: '#c43a4c', wall: '#8a1c2c', lit: '#e86a7a', vein: '#ff7a8a' },
    digestivo:    { bg: '#40240e', lumen: '#e09a4a', wall: '#a8603a', lit: '#f0b078', vein: null },
    inmunologico: { bg: '#0e3a24', lumen: '#5ac47a', wall: '#2a7a4a', lit: '#8aeaa8', vein: null },
    nervioso:     { bg: '#180c34', lumen: '#8a5cd0', wall: '#4a2a8a', lit: '#b890f0', vein: null }
  };
  function cellSpr(kind, s) {
    const S = 34;
    return lyr('cell|' + kind, S, S, g => {
      g.translate(S / 2, S / 2);
      const sph = (r, c1, c2, c3) => { const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); gr.addColorStop(0, c1); gr.addColorStop(0.6, c2); gr.addColorStop(1, c3); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); };
      if (kind === 'rbc') {   // glóbulo rojo: disco bicóncavo
        g.save(); g.scale(1, 0.72); sph(13, '#ff8a8a', '#d02a3a', '#6a0a18'); g.restore();
        g.save(); g.scale(1, 0.72); g.fillStyle = 'rgba(80,0,12,.55)'; g.beginPath(); g.arc(0, 0, 5.5, 0, TAU); g.fill(); g.restore();
        g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-5, -5, 4, 1.6, -0.5, 0, TAU); g.fill();
      } else if (kind === 'wbc') {   // glóbulo blanco
        sph(13, '#ffffff', '#cfe0f0', '#6a86a8');
        g.fillStyle = 'rgba(120,90,200,.7)'; g.beginPath(); g.arc(-2.5, 1, 4.2, 0, TAU); g.arc(3.5, -1.5, 3.4, 0, TAU); g.arc(1, 5, 3, 0, TAU); g.fill();
      } else if (kind === 'bubble') {   // burbuja de aire con O₂
        g.fillStyle = 'rgba(180,230,255,.18)'; g.beginPath(); g.arc(0, 0, 13, 0, TAU); g.fill();
        g.strokeStyle = 'rgba(210,244,255,.85)'; g.lineWidth = 1.4; g.stroke();
        g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-5, -6, 4, 2, -0.6, 0, TAU); g.fill();
        g.fillStyle = 'rgba(230,248,255,.95)'; g.font = 'bold 9px Courier New'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('O₂', 0, 1);
      } else if (kind === 'food') {   // nutrientes
        sph(8, '#fff0a8', '#f0b030', '#a05a0a');
      } else if (kind === 'anti') {   // anticuerpo en Y
        g.strokeStyle = '#d8ffe8'; g.lineWidth = 3.4; g.lineCap = 'round';
        g.beginPath(); g.moveTo(0, 11); g.lineTo(0, 0); g.moveTo(0, 0); g.lineTo(-9, -10); g.moveTo(0, 0); g.lineTo(9, -10); g.stroke();
        g.fillStyle = '#7affb0'; g.beginPath(); g.arc(-9, -10, 2.6, 0, TAU); g.arc(9, -10, 2.6, 0, TAU); g.fill();
      } else {   // plaqueta
        sph(6, '#ffe0a8', '#e0a050', '#7a4a14');
      }
    });
  }
  function orgFlow(f, t, lx, lw) {
    const kinds = { respiratorio: ['bubble', 'rbc'], circulatorio: ['rbc', 'rbc', 'wbc', 'plaq'], digestivo: ['food', 'rbc', 'food'], inmunologico: ['anti', 'wbc', 'anti', 'rbc'], nervioso: [] }[f];
    if (!kinds.length) return;
    [{ sc: 0.55, a: 0.42, sp: 0.034, n: 7 }, { sc: 0.85, a: 0.7, sp: 0.06, n: 6 }, { sc: 1.3, a: 0.96, sp: 0.1, n: 4 }].forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        const k = kinds[(i + li) % kinds.length], sp = cellSpr(k), fx = frac(i * 0.61803 + li * 0.37), x = lx + fx * lw + Math.sin(t * 0.0011 + i + li) * 10;
        const y = ((t * L.sp + i * (H + 90) / L.n + li * 40) % (H + 90)) - 45, sz = 34 * L.sc;
        cx.save(); cx.globalAlpha = L.a; cx.translate(x, y); cx.rotate(t * 0.0006 * (i % 2 ? 1 : -1) + i); cx.drawImage(sp, -sz / 2, -sz / 2, sz, sz); cx.restore();
      }
    });
  }
  function neuronNet(t) {
    const R = rng(91);
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const x0 = W * (0.08 + R() * 0.84), amp = 12 + R() * 28, ph = R() * 6, depth = 0.4 + R() * 0.6;
      cx.strokeStyle = rgba('#b890f0', 0.18 + depth * 0.22); cx.lineWidth = 1 + depth * 2; cx.beginPath();
      for (let y = -10; y <= H + 10; y += 14) { const x = x0 + Math.sin(y * 0.018 + ph) * amp; y < 0 ? cx.moveTo(x, y) : cx.lineTo(x, y); } cx.stroke();
      for (let b = 0; b < 3; b++) {   // dendritas
        const by = H * (0.1 + R() * 0.8), bx = x0 + Math.sin(by * 0.018 + ph) * amp, dir = R() < 0.5 ? -1 : 1;
        cx.strokeStyle = rgba('#b890f0', 0.16); cx.lineWidth = 1; cx.beginPath(); cx.moveTo(bx, by); cx.quadraticCurveTo(bx + dir * 24, by + 6, bx + dir * (30 + R() * 30), by + 22 + R() * 24); cx.stroke();
      }
      const p = frac(t * 0.00022 * (0.6 + depth) + i * 0.37), py = p * (H + 20) - 10, px = x0 + Math.sin(py * 0.018 + ph) * amp;   // impulso eléctrico
      glow(px, py, 10 + depth * 10, '#e8d8ff', 0.8); glow(px, py, 26 * depth + 6, '#9a6cff', 0.5);
    }
    cx.restore();
  }
  function sceneOrganismo(world, st, t, f) {
    const P = ORG[f];
    put(lyr('org|' + f, W, H, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, tone(P.bg, -25)); gr.addColorStop(0.2, P.bg); gr.addColorStop(0.5, mix(P.bg, P.lumen, 0.38)); gr.addColorStop(0.8, P.bg); gr.addColorStop(1, tone(P.bg, -25));
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const v = g.createRadialGradient(w / 2, h * 0.35, h * 0.1, w / 2, h * 0.5, h * 0.8); v.addColorStop(0, 'rgba(255,255,255,.05)'); v.addColorStop(1, 'rgba(0,0,0,.4)');
      g.fillStyle = v; g.fillRect(0, 0, w, h);
    }), 0, 0);
    if (f === 'nervioso') { neuronNet(t); }
    else {
      cx.save(); cx.globalAlpha = 0.8;
      drift(wallLayer('o' + f + 'f', H, -1, tone(P.wall, -35), P.lit, P.vein, W * 0.03, W * 0.06, 51), 0.03, t); drift(wallLayer('o' + f + 'fr', H, 1, tone(P.wall, -35), P.lit, P.vein, W * 0.03, W * 0.06, 52), 0.03, t); cx.restore();
      orgFlow(f, t, W * 0.12, W * 0.76);
      drift(wallLayer('o' + f + 'n', H, -1, P.wall, P.lit, P.vein, W * 0.025, W * 0.075, 53), 0.075, t);
      drift(wallLayer('o' + f + 'nr', H, 1, P.wall, P.lit, P.vein, W * 0.025, W * 0.075, 54), 0.075, t);
    }
    if (f === 'circulatorio') { const b = Math.max(0, Math.sin(t * 0.0075)) ** 6; cx.fillStyle = 'rgba(255,40,60,' + (0.04 + 0.08 * b) + ')'; cx.fillRect(0, 0, W, H); }   // latido
    cx.fillStyle = vgrad(cx, 0, H, [[0, 'rgba(0,0,0,.4)'], [0.4, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.25)']]); cx.fillRect(0, 0, W, H);
  }

  /* ---------- ecosistemas de Chile ---------- */
  function conifers(key, baseY, hgt, color, lit, n, seed) {
    return lyr('con|' + key, W, H, (g, w) => {
      const R = rng(seed);
      for (let i = 0; i < n; i++) {
        const x = (i + R() * 0.8) * w / n, hh = hgt * (0.6 + R() * 0.6), ww = hh * 0.34;
        g.fillStyle = color; for (let k = 0; k < 4; k++) { const ty = baseY - hh + k * hh * 0.22, bw = ww * (0.45 + k * 0.28); g.beginPath(); g.moveTo(x, ty); g.lineTo(x - bw, ty + hh * 0.34); g.lineTo(x + bw, ty + hh * 0.34); g.closePath(); g.fill(); }
        g.fillStyle = lit; g.globalAlpha = 0.35; for (let k = 0; k < 4; k++) { const ty = baseY - hh + k * hh * 0.22, bw = ww * (0.45 + k * 0.28); g.beginPath(); g.moveTo(x, ty); g.lineTo(x - bw, ty + hh * 0.34); g.lineTo(x - bw * 0.1, ty + hh * 0.34); g.closePath(); g.fill(); } g.globalAlpha = 1;
        g.fillStyle = '#2a1a10'; g.fillRect(x - 1.5, baseY - 2, 3, 6);
      }
    });
  }
  function birds(t, n, y0, col) {
    cx.save(); cx.strokeStyle = col; cx.lineWidth = 1.6; cx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = ((t * (0.02 + i * 0.006) + i * W * 0.37) % (W + 80)) - 40, y = y0 + Math.sin(t * 0.0008 + i * 2) * 14 + i * 14, fl = Math.sin(t * 0.012 + i * 3) * 4.5;
      cx.beginPath(); cx.moveTo(x - 8, y - fl); cx.quadraticCurveTo(x - 4, y - 2 - fl * 0.4, x, y); cx.quadraticCurveTo(x + 4, y - 2 - fl * 0.4, x + 8, y - fl); cx.stroke();
    }
    cx.restore();
  }
  const ECO = {
    bosque(st, gy, t) {
      bg('bosque', [[0, '#8aa0a4'], [0.5, '#b4c4c0'], [1, '#6a8a7a']]);
      sunGlare(W * 0.74, H * 0.13, Math.min(W, H) * 0.035, '#fff4d0', t, false);
      clouds('b1', H * 0.03, H * 0.25, '#f2f6f6', '#9ab0b4', 5, 12, 0.005, t, 0.6);
      put(ridge('bos0', gy - 36, H * 0.16, '#3a5a4a', '#6a8a72', 61, 8, '#a8bcb4'), 0, 0);
      put(conifers('bos1', gy - 8, H * 0.16, '#26503a', '#5a8a62', 14, 62), 0, 0);
      put(conifers('bos2', gy + 6, H * 0.22, '#17402c', '#4a7a52', 9, 63), 0, 0);
      groundPlane(gy, { far: '#2e5a34', near: '#0f2a16', haze: '#a8bcb4', hazeA: 0.4, kind: 'tuft', rim: '#6aae52', dark: '#0a1c0e', seed: 14, n: 12, speed: 0.00007 }, t);
      cx.fillStyle = vgrad(cx, gy - 70, gy + 10, [[0, 'rgba(210,225,220,0)'], [1, 'rgba(210,225,220,.28)']]); cx.fillRect(0, gy - 70, W, 80);
    },
    humedal(st, gy, t) {
      bg('humedal', [[0, '#9ccae0'], [0.55, '#d8ecf0'], [1, '#f4e6c8']]);
      sunGlare(W * 0.28, H * 0.15, Math.min(W, H) * 0.04, '#fff0c0', t, false);
      clouds('h1', H * 0.04, H * 0.3, '#ffffff', '#b4d0dc', 5, 13, 0.006, t, 0.85);
      put(ridge('hum0', gy - 20, H * 0.07, '#6a9aa4', '#a8cccc', 71, 10, '#d8ecf0'), 0, 0);
      cx.strokeStyle = '#4a7a42'; cx.lineWidth = 1.5; const R = rng(72);   // juncos
      for (let i = 0; i < 70; i++) { const x = R() * W, hh = 10 + R() * 18; cx.beginPath(); cx.moveTo(x, gy - 4); cx.quadraticCurveTo(x + (R() - 0.5) * 8, gy - hh * 0.6, x + (R() - 0.5) * 12, gy - hh); cx.stroke(); }
      groundPlane(gy, { far: '#8ac0cc', near: '#2a6a84', haze: '#e8f4f4', hazeA: 0.55, kind: 'ripple', rim: '#e8fbff', dark: '#1a4a64', seed: 15, n: 12, speed: 0.00005 }, t);
      cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = 'rgba(255,255,230,.25)';
      for (let i = 0; i < 8; i++) { const yy = gy + 6 + i * (H - gy) / 8, w = 20 + i * 14; cx.fillRect(W * 0.28 - w / 2 + Math.sin(t * 0.002 + i) * 4, yy, w, 1.4); }   // reflejo del sol
      cx.restore();
      birds(t, 4, H * 0.1, '#3a4a5a');
    },
    oceano(st, gy, t) {
      bg('oceano', [[0, '#7ab4dc'], [0.3, '#bcdcf0'], [0.42, '#2a78a8'], [1, '#12486a']]);
      sunGlare(W * 0.7, H * 0.14, Math.min(W, H) * 0.04, '#fff4d0', t, false);
      clouds('o1', H * 0.03, H * 0.25, '#ffffff', '#a8c8e0', 4, 14, 0.007, t, 0.8);
      const hy = H * 0.4;   // horizonte del mar
      for (let i = 0; i < 16; i++) {   // olas en perspectiva
        const u = i / 16, y = hy + (gy - hy) * Math.pow(u, 1.5), amp = 1 + u * 5;
        cx.strokeStyle = 'rgba(220,244,255,' + (0.1 + u * 0.3) + ')'; cx.lineWidth = 1 + u; cx.beginPath();
        for (let x = 0; x <= W; x += 10) { const yy = y + Math.sin(x * 0.03 / (0.4 + u) + t * 0.002 * (0.5 + u) + i) * amp; x ? cx.lineTo(x, yy) : cx.moveTo(x, yy); } cx.stroke();
      }
      cx.save(); cx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) { const R = rng(i * 7 + 1), u = R(), y = hy + (gy - hy) * Math.pow(u, 1.4), x = W * (0.45 + (R() - 0.5) * (0.12 + u * 0.7)); cx.globalAlpha = Math.max(0, Math.sin(t * 0.004 + i * 2)) * 0.8; cx.fillStyle = '#fff'; cx.fillRect(x, y, 2 + u * 3, 1.2); }   // destellos
      cx.restore();
      groundPlane(gy, { far: '#d8c490', near: '#8a7650', haze: '#e8f4ff', hazeA: 0.5, kind: 'pebble', rim: '#f0e0b8', dark: '#6a5a3a', seed: 16, n: 11, speed: 0.00006 }, t);
      const foam = 0.5 + 0.5 * Math.sin(t * 0.0018);   // espuma que avanza y retrocede
      cx.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.3 * foam) + ')'; cx.beginPath(); cx.moveTo(0, gy - 3 + foam * 5);
      for (let x = 0; x <= W; x += 12) cx.lineTo(x, gy - 3 + foam * 5 + Math.sin(x * 0.06 + t * 0.003) * 2.5); cx.lineTo(W, gy + 7); cx.lineTo(0, gy + 7); cx.closePath(); cx.fill();
      birds(t, 5, H * 0.09, '#2a3a4a');
    },
    altiplano(st, gy, t) {
      bg('altiplano', [[0, '#2a64c0'], [0.55, '#78acec'], [1, '#d8e8f4']]);
      sunGlare(W * 0.8, H * 0.12, Math.min(W, H) * 0.03, '#ffffff', t, false);
      clouds('a1', H * 0.05, H * 0.22, '#ffffff', '#a8c4e8', 4, 15, 0.004, t, 0.8);
      put(lyr('volcan', W, H, (g, w) => {   // volcán nevado
        const bx = w * 0.32, ph = H * 0.3, bw = w * 0.42, by = gy - 8;
        g.fillStyle = '#6a5a6a'; g.beginPath(); g.moveTo(bx - bw, by); g.lineTo(bx - 14, by - ph); g.lineTo(bx + 14, by - ph); g.lineTo(bx + bw, by); g.closePath(); g.fill();
        g.fillStyle = 'rgba(140,120,150,.7)'; g.beginPath(); g.moveTo(bx - bw, by); g.lineTo(bx - 14, by - ph); g.lineTo(bx - 2, by - ph * 0.15); g.lineTo(bx - bw * 0.3, by); g.closePath(); g.fill();
        g.fillStyle = '#f4f8ff'; g.beginPath(); g.moveTo(bx - 14, by - ph); g.lineTo(bx + 14, by - ph); g.lineTo(bx + bw * 0.34, by - ph * 0.5); g.lineTo(bx + bw * 0.12, by - ph * 0.6); g.lineTo(bx, by - ph * 0.44); g.lineTo(bx - bw * 0.14, by - ph * 0.58); g.lineTo(bx - bw * 0.34, by - ph * 0.5); g.closePath(); g.fill();
        g.fillStyle = 'rgba(150,180,230,.55)'; g.beginPath(); g.moveTo(bx - 14, by - ph); g.lineTo(bx - bw * 0.34, by - ph * 0.5); g.lineTo(bx - bw * 0.14, by - ph * 0.58); g.lineTo(bx, by - ph * 0.44); g.lineTo(bx - 4, by - ph * 0.7); g.closePath(); g.fill();
      }), 0, 0);
      put(ridge('alt0', gy - 4, H * 0.1, '#8a6a58', '#c8a88a', 81, 9, '#d8e8f4'), 0, 0);
      cx.fillStyle = vgrad(cx, gy - 18, gy + 4, [[0, 'rgba(250,252,255,0)'], [1, 'rgba(250,252,255,.85)']]); cx.fillRect(0, gy - 18, W, 22);   // salar blanco
      groundPlane(gy, { far: '#b09468', near: '#5a4630', haze: '#f0f4f8', hazeA: 0.5, kind: 'tuft', rim: '#b8b04a', dark: '#3a2c1c', seed: 17, n: 11, speed: 0.00006 }, t);
    },
    atacama(st, gy, t) {
      bg('atacama', [[0, '#f4c880'], [0.5, '#fce6b4'], [1, '#f0c890']]);
      sunGlare(W * 0.3, H * 0.14, Math.min(W, H) * 0.06, '#ffe8a0', t, true);
      put(ridge('ata0', gy - 30, H * 0.13, '#b88a7a', '#e8c0a0', 91, 8, '#fce6b4'), 0, 0);
      put(lyr('dunas', W, H, (g, w) => {
        [[gy - 12, 14, '#d89a54', '#f0c47c', 3], [gy + 2, 22, '#c4823e', '#ebb86a', 2]].forEach(L => {
          g.fillStyle = L[2]; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= w; x += 6) g.lineTo(x, L[0] - Math.sin(x * 0.012 * L[4] + L[1]) * L[1] - Math.sin(x * 0.03 + L[1]) * 3); g.lineTo(w, H); g.closePath(); g.fill();
          g.fillStyle = L[3]; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= w; x += 6) g.lineTo(x, L[0] - Math.sin(x * 0.012 * L[4] + L[1]) * L[1] - Math.sin(x * 0.03 + L[1]) * 3 + 6); for (let x = w; x >= 0; x -= 6) g.lineTo(x, L[0] + 20 - Math.sin(x * 0.012 * L[4] + L[1]) * L[1]); g.closePath(); g.fill(); g.globalAlpha = 1;
        });
      }), 0, 0);
      groundPlane(gy, { far: '#d09a58', near: '#8a5a2a', haze: '#fce6b4', hazeA: 0.45, kind: 'dune', rim: '#f6d29a', dark: '#7a4a1e', seed: 18, n: 11, speed: 0.00006 }, t);
      cx.save(); cx.globalAlpha = 0.12; cx.fillStyle = '#fff';   // espejismo: bandas de aire caliente
      for (let i = 0; i < 5; i++) { const y = gy - 24 + i * 5; cx.beginPath(); for (let x = 0; x <= W; x += 8) { const yy = y + Math.sin(x * 0.05 + t * 0.003 + i) * 1.8; x ? cx.lineTo(x, yy) : cx.moveTo(x, yy); } cx.lineTo(W, y + 3); cx.lineTo(0, y + 3); cx.closePath(); cx.fill(); }
      cx.restore();
    }
  };

  /* ---------- despachador ---------- */
  function draw(world, st, gy) {
    const f = world.fondo || world.scene, t = now();
    switch (f) {
      case 'mercurio': return sceneMercurio(world, st, gy, t);
      case 'venus': return sceneVenus(world, st, gy, t);
      case 'tierra': return sceneTierra(world, st, t);
      case 'marte': return sceneMarte(world, st, t);
      case 'jupiter': return sceneJupiter(world, st, t);
      case 'saturno': return sceneSaturno(world, st, t);
      case 'urano': return sceneUrano(world, st, t);
      case 'neptuno': return sceneNeptuno(world, st, t);
      case 'kuiper': return sceneKuiper(world, st, t);
      case 'oort': return sceneOort(world, st, t);
      case 'litosfera': case 'astenosfera': case 'manto': case 'nucleo_ext': case 'nucleo_int': return sceneSubsuelo(world, st, gy, t, f);
      case 'alfa_centauri': return sceneAlfaCentauri(world, st, t);
      case 'orion': return sceneOrion(world, st, t);
      case 'pleyades': return scenePleyades(world, st, t);
      case 'agujero_negro': return sceneAgujero(world, st, t);
      case 'andromeda': return sceneAndromeda(world, st, t);
      case 'respiratorio': case 'circulatorio': case 'digestivo': case 'inmunologico': case 'nervioso': return sceneOrganismo(world, st, t, f);
      case 'bosque': case 'humedal': case 'oceano': case 'altiplano': case 'atacama': return ECO[f](st, gy, t);
      default:
        cx.fillStyle = '#05060e'; cx.fillRect(0, 0, W, H); stars(st);
    }
  }
  return { init, resize, draw, stars, glow, rgba, tone };
})();
