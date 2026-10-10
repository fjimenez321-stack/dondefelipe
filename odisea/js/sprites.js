/* ============================================================
   ODISEA CÓSMICA · sprites.js
   SPRITES — dibujo de todas las entidades (enemigos, jefes,
   disparos, potenciadores, vehículos y partículas).
   Técnica: lo estático se pre-renderiza una vez en un canvas
   fuera de pantalla (caché) y solo lo animado se dibuja en vivo;
   los brillos usan mezcla aditiva ('lighter'), sin shadowBlur,
   para que funcione fluido en celulares.
   Sin lógica de juego: el motor decide QUÉ y CUÁNDO.
   API: init(ctx) · enemies(list, theme) · bossShots(list) ·
        bullets(list) · powerups(list) · particles(list) ·
        boss(b, W, H) · ship(s, buffs, vehiculo)
   theme = { saga: 'id-de-saga', scene: 'escena-del-mundo' }
   ============================================================ */
window.OC = window.OC || {};
OC.Sprites = (function () {
  let cx = null;
  const S = 2, TAU = Math.PI * 2, cache = new Map();   // S = resolución de la caché
  const now = () => performance.now();

  function init(ctx) { cx = ctx; }

  /* ---------- utilidades ---------- */
  function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgba(h, a) { const c = hex2rgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function tone(h, amt) {
    const c = hex2rgb(h).map(v => Math.max(0, Math.min(255, Math.round(v + amt))));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function rr(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }

  // Sprite en caché: dibuja en un canvas w×h (+pad) la primera vez.
  function sprite(key, w, h, pad, draw) {
    let s = cache.get(key);
    if (!s) {
      const c = document.createElement('canvas');
      c.width = Math.ceil((w + pad * 2) * S); c.height = Math.ceil((h + pad * 2) * S);
      const g = c.getContext('2d'); g.setTransform(S, 0, 0, S, pad * S, pad * S);
      draw(g, w, h);
      s = { c, pad, w, h }; cache.set(key, s);
    }
    return s;
  }
  // Dibuja el sprite centrado en (x,y), con rotación, opacidad y escala opcionales.
  function put(s, x, y, rot, alpha, k) {
    k = k || 1;
    cx.save(); cx.translate(x, y); if (rot) cx.rotate(rot); if (alpha !== undefined && alpha < 1) cx.globalAlpha = alpha;
    cx.drawImage(s.c, -(s.w / 2 + s.pad) * k, -(s.h / 2 + s.pad) * k, (s.w + s.pad * 2) * k, (s.h + s.pad * 2) * k);
    cx.restore();
  }
  // Brillo aditivo (halo) — barato: un sprite radial por color, escalado.
  function glowSprite(color) {
    return sprite('g|' + color, 64, 64, 0, g => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, rgba(color, 1)); gr.addColorStop(0.35, rgba(color, 0.38)); gr.addColorStop(1, rgba(color, 0));
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    });
  }
  function addGlow(x, y, r, color, a) {
    cx.save(); cx.globalCompositeOperation = 'lighter'; put(glowSprite(color), x, y, 0, a, r / 32); cx.restore();
  }
  // Estela: cola con degradado. dir=+1 la cola va hacia arriba (objeto que cae), -1 hacia abajo (proyectil que sube).
  function trailSprite(color) {
    return sprite('t|' + color, 8, 48, 0, g => {
      const gr = g.createLinearGradient(0, 0, 0, 48);
      gr.addColorStop(0, rgba(color, 0)); gr.addColorStop(0.7, rgba(color, 0.45)); gr.addColorStop(1, rgba(color, 0.95));
      g.fillStyle = gr; g.beginPath(); g.moveTo(4, 0); g.lineTo(8, 48); g.lineTo(0, 48); g.closePath(); g.fill();
    });
  }
  function trail(x, y, len, wid, color, alpha, dir) {
    const s = trailSprite(color);
    cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = alpha; cx.translate(x, y); if (dir < 0) cx.scale(1, -1);
    cx.drawImage(s.c, -wid / 2, -len, wid, len); cx.restore();
  }
  function sphere(g, x, y, r, c1, c2, c3) {
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    gr.addColorStop(0, c1); gr.addColorStop(0.55, c2); gr.addColorStop(1, c3);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }

  /* ============================================================
     ENEMIGOS  (cada saga tiene su propia fauna)
     ============================================================ */
  const ROCK = {
    'sistema-solar':   { base: '#8a7a63', light: '#d2c19a', dark: '#2a241c', trail: '#ff9a3b', trailA: 0.6, hot: '#ff7b2e' },
    'viaje-galactico': { base: '#5a7aa8', light: '#c8ecff', dark: '#121c36', trail: '#7fd0ff', trailA: 0.55, hot: '#5bd6ff', facets: true },
    'cuerpo-humano':   { base: '#a8202f', light: '#f27c8a', dark: '#36050e', trail: '#ff4d57', trailA: 0.3, smooth: true, spec: true },
    'ecosistemas':     { base: '#7a6a55', light: '#bcad8e', dark: '#28221b', trail: '#c8b48a', trailA: 0.2, moss: true, smooth: true }
  };
  const ROCK_TIERRA = {
    litosfera:   { base: '#8a6a45', light: '#cfac7c', dark: '#241810', facets: true, trail: '#bba080', trailA: 0.22 },
    astenosfera: { base: '#8a4a28', light: '#e89252', dark: '#240e08', facets: true, vein: '#ffa040', hot: '#ff7b2e', trail: '#ff9a3b', trailA: 0.4 },
    manto:       { base: '#6a2018', light: '#e8643c', dark: '#1c0705', facets: true, vein: '#ff7a2a', hot: '#ff5a2a', trail: '#ff6a2a', trailA: 0.45 },
    nucleo_ext:  { base: '#b04a1c', light: '#ffc878', dark: '#380e05', facets: true, vein: '#fff0b0', hot: '#ffa050', trail: '#ffc060', trailA: 0.5 },
    nucleo_int:  { base: '#d08a3c', light: '#fff0c0', dark: '#4a1a08', facets: true, vein: '#ffffff', hot: '#ffd890', trail: '#fff0c0', trailA: 0.55 }
  };
  function rockStyle(th) {
    if (th.saga === 'centro-tierra') return ROCK_TIERRA[th.scene] || ROCK_TIERRA.litosfera;
    return ROCK[th.saga] || ROCK['sistema-solar'];
  }

  // Roca / asteroide / coágulo: forma irregular con luz, cráteres, facetas, musgo o venas según el estilo.
  function rockSprite(key, size, o) {
    return sprite(key, size, size, 8, (g, w) => {
      const r = size / 2, R = rng(hash(key)), n = o.facets ? 8 : 10, pts = [];
      for (let i = 0; i < n; i++) { const a = i / n * TAU + R() * 0.3, rr_ = r * (0.8 + R() * 0.26); pts.push([r + Math.cos(a) * rr_, r + Math.sin(a) * rr_]); }
      g.beginPath();
      if (o.smooth) {
        const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], m0 = mid(pts[n - 1], pts[0]);
        g.moveTo(m0[0], m0[1]);
        for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); g.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
      } else { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) g.lineTo(pts[i][0], pts[i][1]); }
      g.closePath();
      const gr = g.createRadialGradient(r * 0.62, r * 0.52, r * 0.08, r, r, r * 1.2);
      gr.addColorStop(0, o.light); gr.addColorStop(0.55, o.base); gr.addColorStop(1, o.dark);
      g.fillStyle = gr; g.fill(); g.lineWidth = 1; g.strokeStyle = 'rgba(0,0,0,.4)'; g.stroke();
      g.save(); g.clip();
      if (o.facets) {
        for (let i = 0; i < n; i++) {
          const a = pts[i], b = pts[(i + 1) % n];
          g.fillStyle = (i % 2) ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.22)';
          g.beginPath(); g.moveTo(r * 0.9, r * 0.85); g.lineTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.closePath(); g.fill();
        }
      } else if (!o.smooth || o.moss) {
        for (let k = 0; k < 3; k++) {
          const px = r * (0.55 + R() * 0.9), py = r * (0.55 + R() * 0.9), pr = r * (0.13 + R() * 0.12);
          g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(px, py, pr, pr * 0.8, 0, 0, TAU); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 0.8; g.beginPath(); g.arc(px, py, pr, 0.2, 1.9); g.stroke();
        }
      }
      if (o.moss) {
        for (let k = 0; k < 4; k++) {
          g.fillStyle = 'rgba(96,150,60,.85)'; g.beginPath();
          g.arc(r + (R() - 0.5) * r * 1.3, r * (0.35 + R() * 0.35), r * (0.16 + R() * 0.14), 0, TAU); g.fill();
        }
      }
      if (o.vein) {
        g.strokeStyle = o.vein; g.lineWidth = 1.3; g.globalAlpha = 0.9;
        for (let k = 0; k < 3; k++) {
          g.beginPath(); let vx = r * (0.5 + R()), vy = r * 0.4; g.moveTo(vx, vy);
          for (let j = 0; j < 3; j++) { vx += (R() - 0.5) * r * 0.7; vy += r * (0.3 + R() * 0.2); g.lineTo(vx, vy); }
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      if (o.spec) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(r * 0.65, r * 0.5, r * 0.28, r * 0.14, -0.6, 0, TAU); g.fill(); }
      const sh = g.createLinearGradient(0, 0, w, w); sh.addColorStop(0.45, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.4)');
      g.fillStyle = sh; g.fillRect(0, 0, w, w);
      g.restore();
    });
  }

  function meteor(e, th) {
    const o = rockStyle(th), size = Math.max(16, Math.round(e.w / 4) * 4), v = Math.floor((e.seed || 0) * 3) % 3;
    const spr = rockSprite('rock|' + th.saga + '|' + th.scene + '|' + size + '|' + v, size, o);
    const cxp = e.x + e.w / 2, cyp = e.y + e.h / 2;
    if (o.trail) trail(cxp - (e.vx || 0) * 3, cyp, 14 + Math.abs(e.vy) * 9, e.w * 0.8, o.trail, o.trailA, 1);
    if (o.hot) addGlow(cxp, cyp + size * 0.25, size * 0.95, o.hot, 0.35);
    put(spr, cxp, cyp, e.rot);
  }

  /* --- Sistema Solar / Galáctico: platillo con alienígena en la cúpula --- */
  const SAUCER = [
    { hull: '#9a86e8', dome: '#8ff4ff', lamp: '#ff6bd0' },
    { hull: '#52c8cf', dome: '#c4ff9e', lamp: '#ffe66b' },
    { hull: '#e07abf', dome: '#b0d0ff', lamp: '#7cff6b' }
  ];
  function saucer(e, v, t) {
    const p = SAUCER[v], cxp = e.x + e.w / 2, cyp = e.y + e.h / 2, ph = e.seed || 0;
    const spr = sprite('saucer|' + v, 28, 20, 8, (g, w, h) => {
      const dg = g.createRadialGradient(w / 2 - 3, h * 0.3, 1, w / 2, h * 0.45, 9);
      dg.addColorStop(0, '#ffffff'); dg.addColorStop(0.35, p.dome); dg.addColorStop(1, tone(p.dome, -120));
      g.fillStyle = dg; g.beginPath(); g.arc(w / 2, h * 0.52, 7.5, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = '#7cff6b'; g.beginPath(); g.ellipse(w / 2, h * 0.43, 3, 3.6, 0, 0, TAU); g.fill();
      g.fillStyle = '#0a1a08';
      g.beginPath(); g.ellipse(w / 2 - 1.4, h * 0.41, 0.9, 1.5, -0.4, 0, TAU); g.ellipse(w / 2 + 1.4, h * 0.41, 0.9, 1.5, 0.4, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(w / 2 - 3.5, h * 0.3, 1.6, 0.8, -0.6, 0, TAU); g.fill();
      const hg = g.createLinearGradient(0, h * 0.5, 0, h * 0.85);
      hg.addColorStop(0, tone(p.hull, 80)); hg.addColorStop(0.5, p.hull); hg.addColorStop(1, tone(p.hull, -100));
      g.fillStyle = hg; g.beginPath(); g.ellipse(w / 2, h * 0.62, w * 0.5, h * 0.2, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.beginPath(); g.ellipse(w / 2, h * 0.62, w * 0.46, h * 0.17, 0, Math.PI * 1.08, Math.PI * 1.72); g.stroke();
      g.fillStyle = tone(p.hull, -130); g.beginPath(); g.ellipse(w / 2, h * 0.8, w * 0.22, h * 0.09, 0, 0, TAU); g.fill();
      g.fillStyle = p.lamp; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * 0.12 + i * (w * 0.76 / 4), h * 0.64, 1, 0, TAU); g.fill(); }
    });
    addGlow(cxp, cyp + e.h * 0.55, 15, p.lamp, 0.32 + 0.14 * Math.sin(t * 0.01 + ph));
    put(spr, cxp, cyp, Math.sin(t * 0.004 + ph) * 0.1);
    for (let i = 0; i < 3; i++) addGlow(cxp + (i - 1) * 8.5, cyp + 2.6, 5, p.lamp, 0.35 + 0.5 * Math.max(0, Math.sin(t * 0.009 + i * 2.1 + ph)));
  }

  /* --- Centro de la Tierra: criatura de magma / golem de roca --- */
  function magmaFiend(e, th, t) {
    const lito = th.scene === 'litosfera', ph = e.seed || 0, cxp = e.x + e.w / 2, cyp = e.y + e.h / 2;
    const c = lito ? ['#e0cfb4', '#9a8468', '#2c241c', '#ff9a3b'] : ['#fff6c0', '#ffb02e', '#4a1208', '#ff4a1a'];
    const spr = sprite('magma|' + (lito ? 'l' : 'm'), 24, 24, 8, (g, w) => {
      const r = 10.5, gr = g.createRadialGradient(10, 9, 1, 12, 12, r);
      gr.addColorStop(0, c[0]); gr.addColorStop(0.45, c[1]); gr.addColorStop(1, c[2]);
      g.fillStyle = gr; g.beginPath(); g.arc(12, 12, r, 0, TAU); g.fill();
      g.strokeStyle = lito ? '#ff9a3b' : '#2a0a04'; g.lineWidth = 1; g.globalAlpha = lito ? 0.9 : 0.6;
      g.beginPath(); g.moveTo(4, 8); g.lineTo(9, 11); g.lineTo(7, 16); g.moveTo(20, 9); g.lineTo(15, 13); g.lineTo(17, 18); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#1a0804';
      g.beginPath(); g.moveTo(6.5, 9.6); g.lineTo(11, 11.4); g.lineTo(6.8, 12.8); g.closePath();
      g.moveTo(17.5, 9.6); g.lineTo(13, 11.4); g.lineTo(17.2, 12.8); g.closePath(); g.fill();
      g.fillStyle = '#ffe36b'; g.beginPath(); g.arc(8.2, 11.3, 0.9, 0, TAU); g.arc(15.8, 11.3, 0.9, 0, TAU); g.fill();
      g.strokeStyle = '#1a0804'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(8, 16.5); g.lineTo(10, 15.2); g.lineTo(12, 16.7); g.lineTo(14, 15.2); g.lineTo(16, 16.5); g.stroke();
    });
    addGlow(cxp, cyp, 24, c[3], 0.34 + 0.1 * Math.sin(t * 0.008 + ph));
    for (let i = -1; i <= 1; i++) addGlow(cxp + i * 6, cyp - 10 - 2.5 * Math.sin(t * 0.02 + i * 2 + ph), 6.5, c[3], 0.5);
    put(spr, cxp, cyp, Math.sin(t * 0.003 + ph) * 0.15);
  }

  /* --- Cuerpo Humano: virus con espículas y bacteria con flagelos --- */
  const VIRUS = [
    { body: ['#e6ffb8', '#6ad47e', '#1c5a34'], knob: '#ff6bd0' },
    { body: ['#f0d0ff', '#b46be0', '#4a1c6a'], knob: '#ffe66b' },
    { body: ['#ffd9b8', '#f08a4a', '#6a2a10'], knob: '#7cf0ff' }
  ];
  function virus(e, v, t) {
    const p = VIRUS[v], ph = e.seed || 0, cxp = e.x + e.w / 2, cyp = e.y + e.h / 2;
    const spikes = sprite('virusS|' + v, 28, 28, 6, (g) => {
      g.strokeStyle = tone(p.body[1], -30); g.lineWidth = 1.5;
      for (let i = 0; i < 11; i++) {
        const a = i / 11 * TAU, x1 = 14 + Math.cos(a) * 7, y1 = 14 + Math.sin(a) * 7, x2 = 14 + Math.cos(a) * 11, y2 = 14 + Math.sin(a) * 11;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
        g.fillStyle = p.knob; g.beginPath(); g.arc(x2, y2, 1.9, 0, TAU); g.fill();
        g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x2 - 0.5, y2 - 0.5, 0.6, 0, TAU); g.fill();
      }
    });
    const body = sprite('virusB|' + v, 28, 28, 6, (g) => {
      sphere(g, 14, 14, 7.4, p.body[0], p.body[1], p.body[2]);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(11.6, 13, 2.2, 0, TAU); g.arc(16.4, 13, 2.2, 0, TAU); g.fill();
      g.fillStyle = '#16101c'; g.beginPath(); g.arc(11.9, 13.5, 1.1, 0, TAU); g.arc(16.1, 13.5, 1.1, 0, TAU); g.fill();
      g.strokeStyle = '#16101c'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(9.4, 10.6); g.lineTo(13, 11.8); g.moveTo(18.6, 10.6); g.lineTo(15, 11.8); g.stroke();
    });
    addGlow(cxp, cyp, 20, p.knob, 0.22 + 0.08 * Math.sin(t * 0.007 + ph));
    put(spikes, cxp, cyp, t * 0.0011 + ph);
    put(body, cxp, cyp + Math.sin(t * 0.005 + ph) * 0.8, 0);
  }
  function bacteria(e, v, t) {
    const ph = e.seed || 0, cxp = e.x + e.w / 2, cyp = e.y + e.h / 2;
    const spr = sprite('bact|' + v, 30, 16, 8, (g, w, h) => {
      g.strokeStyle = 'rgba(255,235,170,.7)'; g.lineWidth = 1.2;
      for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(3, 6 + k * 4); g.bezierCurveTo(-3, 3 + k * 8, -1, 12 - k * 5, -6, 8 + k * 2); g.stroke(); }
      const gr = g.createLinearGradient(0, 1, 0, h - 1); gr.addColorStop(0, '#ffe6a0'); gr.addColorStop(0.5, '#e8a040'); gr.addColorStop(1, '#6a3a10');
      g.fillStyle = gr; rr(g, 2, 1.5, w - 4, h - 3, 6.5); g.fill();
      g.strokeStyle = 'rgba(80,40,10,.5)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = 'rgba(120,60,10,.35)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(7 + (i * 7) % 18, 5 + (i * 5) % 7, 1, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(13, 4, 7, 1.3, 0, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(19, 7, 2, 0, TAU); g.arc(24, 7, 2, 0, TAU); g.fill();
      g.fillStyle = '#2a1608'; g.beginPath(); g.arc(19.4, 7.4, 1, 0, TAU); g.arc(23.6, 7.4, 1, 0, TAU); g.fill();
    });
    addGlow(cxp, cyp, 19, '#ffc060', 0.18);
    put(spr, cxp, cyp, Math.sin(t * 0.003 + ph) * 0.45 + 0.15);
  }

  /* --- Ecosistemas: nube de contaminación tóxica --- */
  function smog(e, t) {
    const ph = e.seed || 0, cxp = e.x + e.w / 2, cyp = e.y + e.h / 2;
    const spr = sprite('smog', 30, 24, 8, (g) => {
      [[9, 14, 7], [16, 10, 8.5], [22, 14.5, 6.5], [14, 16, 7.5]].forEach((c, i) => sphere(g, c[0], c[1], c[2], '#8a9a78', '#4a5a42', '#1c241a'));
      g.fillStyle = 'rgba(190,255,60,.25)'; g.beginPath(); g.arc(15, 14, 7, 0, TAU); g.fill();
      g.fillStyle = '#d6ff3a'; g.beginPath(); g.ellipse(11.8, 12.6, 2, 2.8, 0, 0, TAU); g.ellipse(18.2, 12.6, 2, 2.8, 0, 0, TAU); g.fill();
      g.fillStyle = '#0e1608'; g.beginPath(); g.ellipse(12, 13, 0.8, 1.7, 0, 0, TAU); g.ellipse(18, 13, 0.8, 1.7, 0, 0, TAU); g.fill();
      g.strokeStyle = '#0e1608'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(11.5, 18); g.lineTo(13.2, 16.6); g.lineTo(15, 18); g.lineTo(16.8, 16.6); g.lineTo(18.5, 18); g.stroke();
    });
    addGlow(cxp, cyp, 22, '#b6ff3a', 0.2 + 0.08 * Math.sin(t * 0.008 + ph));
    put(spr, cxp, cyp + Math.sin(t * 0.004 + ph) * 1.2, Math.sin(t * 0.0025 + ph) * 0.1);
  }

  function alien(e, th, t) {
    const v = Math.floor((e.seed || 0) * 7) % 3;
    switch (th.saga) {
      case 'centro-tierra':   return magmaFiend(e, th, t);
      case 'cuerpo-humano':   return (v === 1 ? bacteria : virus)(e, v, t);
      case 'ecosistemas':     return smog(e, t);
      case 'viaje-galactico': return saucer(e, (v + 1) % 3, t);
      default:                return saucer(e, v, t);
    }
  }
  function enemies(list, theme) {
    const th = { saga: (theme && theme.saga) || 'sistema-solar', scene: (theme && theme.scene) || '' }, t = now();
    list.forEach(e => (e.type === 'meteor' ? meteor(e, th) : alien(e, th, t)));
  }

  /* ============================================================
     DISPAROS DEL JEFE
     ============================================================ */
  function bossShots(list) {
    const t = now();
    list.forEach(s => {
      const x = s.x + s.w / 2, y = s.y + s.h / 2;
      if (s.kind === 'nota') {
        addGlow(x, y, 16, '#ffb24d', 0.55);
        cx.save(); cx.fillStyle = '#fff0c8'; cx.font = 'bold 20px Georgia'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText((Math.floor(s.y / 14) % 2) ? '♫' : '♪', x, y); cx.restore();
      } else if (s.kind === 'roca' || s.kind === 'roca_fuerte') {
        const hot = s.kind === 'roca_fuerte', size = Math.max(14, Math.round(s.w / 2) * 2);
        const spr = rockSprite('shot|' + (hot ? 'h' : 'n') + size, size, hot
          ? { base: '#7a3a2a', light: '#e0803a', dark: '#1c0a06', vein: '#ffa040', facets: true }
          : { base: '#8a7a63', light: '#cdbb98', dark: '#2a241c' });
        if (hot) { trail(x, y, 22, size * 0.8, '#ff7b2e', 0.55, 1); addGlow(x, y, size * 1.3, '#ff7b2e', 0.4); }
        put(spr, x, y, s.rot || 0);
      } else if (s.kind === 'magma') {
        const r = s.w / 2, pu = 0.9 + Math.sin(s.y * 0.2) * 0.1;
        trail(x, y, 26, r * 1.5, '#ff6a2a', 0.65, 1); addGlow(x, y, r * 3, '#ff6a2a', 0.5);
        const sp = sprite('magmaShot', 24, 24, 6, g => sphere(g, 12, 12, 10, '#fff7c0', '#ff9a3b', '#c82a12'));
        put(sp, x, y, 0, 1, (r * 2 / 24) * pu);
      } else if (s.kind === 'electron') {
        trail(x, y, 24, 6, '#9fe0ff', 0.6, 1); addGlow(x, y, 20, '#7fd0ff', 0.55);
        cx.save(); cx.translate(x, y); cx.rotate(t * 0.01); cx.strokeStyle = 'rgba(190,235,255,.85)'; cx.lineWidth = 1.2;
        cx.beginPath(); cx.ellipse(0, 0, 9, 3.6, 0, 0, TAU); cx.stroke(); cx.restore();
        sphere(cx, x, y, Math.max(3.6, s.w * 0.36), '#ffffff', '#c8f0ff', '#5ab0e0');
      } else {   // 'bolt': bola de plasma
        trail(x, y, 26, 7, '#ff4d57', 0.7, 1); addGlow(x, y, 20, '#ff4d57', 0.65);
        cx.save(); cx.fillStyle = '#fff4f0'; cx.beginPath(); cx.ellipse(x, y, s.w * 0.32, s.h * 0.5, 0, 0, TAU); cx.fill(); cx.restore();
      }
    });
  }

  /* ============================================================
     DISPAROS DEL JUGADOR + PARTÍCULAS
     ============================================================ */
  function bullets(list) {
    list.forEach(b => {
      const x = b.x + b.w / 2, y = b.y + b.h / 2, col = b.pierce ? '#7fe8ff' : '#8bff7a', ang = Math.atan2(b.vx || 0, -b.vy);
      cx.save(); cx.translate(x, y); cx.rotate(ang);
      trail(0, b.h / 2, 18, b.w + 2, col, 0.7, -1);
      addGlow(0, 0, b.w * 3.2 + 4, col, 0.6);
      cx.fillStyle = '#ffffff'; rr(cx, -b.w / 2, -b.h / 2, b.w, b.h, b.w / 2); cx.fill();
      cx.restore();
    });
  }
  function particles(list) {
    list.forEach(pt => {
      const a = Math.max(0, pt.life);
      if (pt.ring) {   // onda expansiva
        const rr0 = (1 - a) * 46 * (pt.rs || 1) + 4;
        cx.save(); cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = pt.color; cx.globalAlpha = a * 0.8; cx.lineWidth = 1 + a * 3;
        cx.beginPath(); cx.ellipse(pt.x, pt.y, rr0, rr0 * 0.55, 0, 0, TAU); cx.stroke(); cx.restore(); return;
      }
      cx.save(); cx.globalCompositeOperation = 'lighter';
      put(glowSprite(pt.color), pt.x, pt.y, 0, a * 0.9, (2 + a * 4.5) / 32);
      cx.restore();
    });
  }

  /* ============================================================
     POTENCIADORES  (iconos vectoriales: no dependen de emojis)
     ============================================================ */
  const PU = { vida: '#ffd76b', vel: '#5bd6ff', pow: '#ff9a3b', frio: '#9fe8ff' };
  function puIcon(g, kind) {
    g.fillStyle = '#ffffff'; g.strokeStyle = '#ffffff'; g.lineWidth = 1.8; g.lineCap = 'round';
    if (kind === 'vel') {
      g.beginPath(); g.moveTo(14.5, 4.5); g.lineTo(8, 14); g.lineTo(12.4, 14); g.lineTo(10.5, 21.5); g.lineTo(18, 11.5); g.lineTo(13.6, 11.5); g.lineTo(16, 4.5); g.closePath(); g.fill();
    } else if (kind === 'pow') {
      g.beginPath();
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, r = i % 2 ? 3 : 9; g.lineTo(13 + Math.cos(a) * r, 13 + Math.sin(a) * r); }
      g.closePath(); g.fill();
    } else if (kind === 'frio') {
      for (let i = 0; i < 3; i++) {
        const a = i / 3 * Math.PI; g.beginPath(); g.moveTo(13 - Math.cos(a) * 8, 13 - Math.sin(a) * 8); g.lineTo(13 + Math.cos(a) * 8, 13 + Math.sin(a) * 8); g.stroke();
      }
      g.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU, bx = 13 + Math.cos(a) * 5.2, by = 13 + Math.sin(a) * 5.2;
        g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a + 0.9) * 2.4, by + Math.sin(a + 0.9) * 2.4); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a - 0.9) * 2.4, by + Math.sin(a - 0.9) * 2.4); g.stroke();
      }
    } else {   // vida => pregunta
      g.font = 'bold 17px Courier New'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 13, 14);
    }
  }
  function powerups(list) {
    const t = now();
    list.forEach(pu => {
      const x = pu.x + pu.w / 2, y = pu.y + pu.h / 2, pulse = 0.5 + Math.sin(pu.t * 0.008) * 0.5;
      if (pu.kind === 'moneda') {
        addGlow(x, y, 22, '#ffd76b', 0.4 + 0.2 * pulse);
        const sx = Math.max(0.18, Math.abs(Math.cos(t * 0.005 + pu.x)));
        cx.save(); cx.translate(x, y); cx.scale(sx, 1);
        sphere(cx, 0, 0, 10, '#fff3b0', '#ffc83a', '#a8680a');
        cx.strokeStyle = 'rgba(120,70,0,.7)'; cx.lineWidth = 1.4; cx.beginPath(); cx.arc(0, 0, 6.4, 0, TAU); cx.stroke();
        cx.fillStyle = 'rgba(120,70,0,.75)'; cx.fillRect(-1, -3.6, 2, 7.2);
        cx.restore();
        return;
      }
      const col = PU[pu.kind] || PU.vida;
      const spr = sprite('pu|' + pu.kind, 26, 26, 6, (g) => {
        const gr = g.createRadialGradient(10, 9, 1, 13, 13, 13);
        gr.addColorStop(0, rgba(col, 0.55)); gr.addColorStop(0.7, rgba(tone(col, -110), 0.9)); gr.addColorStop(1, rgba(tone(col, -150), 0.95));
        g.fillStyle = gr; g.beginPath(); g.arc(13, 13, 12.2, 0, TAU); g.fill();
        g.strokeStyle = col; g.lineWidth = 1.8; g.beginPath(); g.arc(13, 13, 12, 0, TAU); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(13, 13, 9.4, Math.PI * 1.1, Math.PI * 1.55); g.stroke();
        puIcon(g, pu.kind);
      });
      addGlow(x, y, 26 + pulse * 6, col, 0.35 + 0.25 * pulse);
      put(spr, x, y);
      cx.save(); cx.translate(x, y); cx.rotate(t * 0.002); cx.strokeStyle = rgba(col, 0.55); cx.lineWidth = 1.2; cx.setLineDash([4, 6]);
      cx.beginPath(); cx.arc(0, 0, 15.5, 0, TAU); cx.stroke(); cx.restore();
    });
  }

  /* ============================================================
     JEFES
     ============================================================ */
  function hpBar(b, W, H) {
    const bw = Math.min(W * 0.7, 260), bx = W / 2 - bw / 2, by = H * 0.075, f = Math.max(0, b.hp / b.maxhp);
    cx.save();
    cx.fillStyle = 'rgba(5,8,20,.78)'; rr(cx, bx - 3, by - 3, bw + 6, 12, 6); cx.fill();
    cx.strokeStyle = b.final ? 'rgba(255,215,107,.7)' : 'rgba(255,255,255,.22)'; cx.lineWidth = 1; cx.stroke();
    if (f > 0) {
      const lg = cx.createLinearGradient(bx, 0, bx + bw, 0);
      lg.addColorStop(0, f > 0.5 ? '#ff8a5a' : '#ff4d57'); lg.addColorStop(1, '#ff2a4a');
      cx.fillStyle = lg; rr(cx, bx, by, Math.max(4, bw * f), 6, 3); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.3)'; rr(cx, bx + 1, by + 0.8, Math.max(2, bw * f - 2), 1.6, 1); cx.fill();
    }
    cx.font = 'bold 12px Courier New'; cx.textAlign = 'center'; cx.textBaseline = 'alphabetic';
    const label = (b.final ? '★ ' : '☠ ') + b.name;
    cx.fillStyle = 'rgba(0,0,0,.7)'; cx.fillText(label, W / 2 + 1, by - 5);
    cx.fillStyle = b.final ? '#ffe2a8' : '#ffd8dc'; cx.fillText(label, W / 2, by - 6);
    cx.restore();
  }

  // --- cabezas de los personajes (radio 10 en unidades locales) ---
  function skinFace(g, lite) {
    const sg = g.createRadialGradient(-3, -3, 1, 0, 0, 11);
    sg.addColorStop(0, lite ? '#fff0dc' : '#ffe3c4'); sg.addColorStop(1, '#d09668');
    g.fillStyle = sg; g.beginPath(); g.arc(-10, 1, 2.2, 0, TAU); g.arc(10, 1, 2.2, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, 0, 10, 0, TAU); g.fill();
  }
  function glasses(g) {
    g.strokeStyle = '#1a1a22'; g.lineWidth = 1.2;
    g.beginPath(); g.arc(-4.2, 0.6, 3.2, 0, TAU); g.moveTo(7.4, 0.6); g.arc(4.2, 0.6, 3.2, 0, TAU); g.moveTo(-1, 0.4); g.lineTo(1, 0.4); g.stroke();
    g.fillStyle = 'rgba(180,230,255,.18)'; g.beginPath(); g.arc(-4.2, 0.6, 3.1, 0, TAU); g.arc(4.2, 0.6, 3.1, 0, TAU); g.fill();
  }
  function gradCap(g) {
    g.fillStyle = '#15151e'; g.beginPath(); g.moveTo(-6.5, -7.5); g.lineTo(6.5, -7.5); g.lineTo(6, -3); g.quadraticCurveTo(0, -1.5, -6, -3); g.closePath(); g.fill();
    const bg = g.createLinearGradient(0, -14, 0, -3.5); bg.addColorStop(0, '#3a3a4e'); bg.addColorStop(1, '#0c0c14');
    g.fillStyle = bg; g.beginPath(); g.moveTo(-14, -8.5); g.lineTo(0, -14); g.lineTo(14, -8.5); g.lineTo(0, -3.8); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-14, -8.5); g.lineTo(0, -14); g.lineTo(14, -8.5); g.stroke();
    g.strokeStyle = '#ffd76b'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -8.8); g.lineTo(11.5, -8); g.lineTo(12, -3); g.stroke();
    g.fillStyle = '#ffd76b'; g.beginPath(); g.arc(12, -2.4, 1.7, 0, TAU); g.fill();
    g.fillStyle = '#ffd76b'; g.beginPath(); g.arc(0, -8.8, 1, 0, TAU); g.fill();
  }
  const HEADS = {
    felipe(g, b, t) {
      const pulse = 0.5 + Math.sin(t * 0.005) * 0.4;
      addGlow(0, 0, 22, '#ffd76b', 0.3 * pulse + 0.1);
      skinFace(g); gradCap(g); glasses(g);
      g.fillStyle = '#ff2a2a'; g.beginPath(); g.arc(-4.2, 0.8, 1.5, 0, TAU); g.arc(4.2, 0.8, 1.5, 0, TAU); g.fill();
      addGlow(-4.2, 0.8, 5, '#ff2a2a', 0.7); addGlow(4.2, 0.8, 5, '#ff2a2a', 0.7);
      g.strokeStyle = '#4a2a14'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-7.4, -3.2); g.lineTo(-2.2, -1.5); g.moveTo(7.4, -3.2); g.lineTo(2.2, -1.5); g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.moveTo(-3, 6); g.quadraticCurveTo(0, 7.8, 3.4, 5.2); g.stroke();
    },
    birrete(g, b) {
      skinFace(g); gradCap(g);
      g.fillStyle = '#1a1a24'; g.beginPath(); g.arc(-4, 1, 1.4, 0, TAU); g.arc(4, 1, 1.4, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(-3.5, 0.5, 0.5, 0, TAU); g.arc(4.5, 0.5, 0.5, 0, TAU); g.fill();
      g.strokeStyle = '#5a3a24'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-6.4, -2.4); g.lineTo(-2.4, -2); g.moveTo(6.4, -2.4); g.lineTo(2.4, -2); g.stroke();
      g.beginPath(); g.arc(0, 3.6, 3.2, 0.25, Math.PI - 0.25); g.stroke();
    },
    calvo(g, b, t) {
      skinFace(g, true);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-3.5, -6, 3.4, 1.6, -0.5, 0, TAU); g.fill();
      glasses(g);
      g.fillStyle = '#1a1a22'; g.beginPath(); g.arc(-4.2, 0.8, 1.2, 0, TAU); g.arc(4.2, 0.8, 1.2, 0, TAU); g.fill();
      g.strokeStyle = '#4a3220'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-7.4, -3); g.lineTo(-2.4, -2.4); g.moveTo(7.4, -3); g.lineTo(2.4, -2.4); g.stroke();
      g.lineWidth = 1.1; g.beginPath(); g.arc(0, 4, 2.6, 0.3, Math.PI - 0.3); g.stroke();
      g.save(); g.font = 'bold 8px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffe9b8';
      for (let i = 0; i < 2; i++) { const a = t * 0.003 + i * Math.PI; g.fillText(i ? '♫' : '♪', Math.cos(a) * 15, -9 + Math.sin(a) * 3.5); }
      g.restore();
    },
    minero(g, b, t) {
      const c = b.color;
      const beam = g.createLinearGradient(0, -8, 0, -30); beam.addColorStop(0, 'rgba(255,247,160,.45)'); beam.addColorStop(1, 'rgba(255,247,160,0)');
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = beam; g.beginPath(); g.moveTo(0, -8); g.lineTo(-10, -30); g.lineTo(10, -30); g.closePath(); g.fill(); g.restore();
      g.save(); g.translate(0, 2); skinFace(g);
      g.fillStyle = '#1a1a22'; g.beginPath(); g.arc(-3.8, 0.6, 1.3, 0, TAU); g.arc(3.8, 0.6, 1.3, 0, TAU); g.fill();
      g.fillStyle = '#5a3a24'; g.beginPath(); g.ellipse(-2.8, 4.6, 3.2, 1.4, -0.25, 0, TAU); g.ellipse(2.8, 4.6, 3.2, 1.4, 0.25, 0, TAU); g.fill();
      g.restore();
      const hg = g.createLinearGradient(0, -13, 0, -2); hg.addColorStop(0, tone(c, 80)); hg.addColorStop(0.5, c); hg.addColorStop(1, tone(c, -70));
      g.fillStyle = hg; g.beginPath(); g.arc(0, -1.5, 11.5, Math.PI, 0); g.closePath(); g.fill();
      g.fillStyle = tone(c, -55); rr(g, -13.5, -2.4, 27, 3.4, 1.7); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -12.4); g.lineTo(0, -3); g.stroke();
      sphere(g, 0, -6.4, 2.6, '#ffffff', '#fff7c0', '#e0c860');
      addGlow(0, -6.4, 10, '#fff3a0', 0.5 + 0.2 * Math.sin(t * 0.01));
    }
  };

  function bossCraft(b) {
    const w = b.w, h = b.h, c = b.color, fin = !!b.final;
    return sprite('craft|' + c + '|' + w + '|' + h + '|' + (fin ? 1 : 0), w, h, 14, (g) => {
      [0.07, 0.93].forEach(px => {
        const pg = g.createLinearGradient(0, h * 0.5, 0, h * 0.85); pg.addColorStop(0, tone(c, 20)); pg.addColorStop(1, tone(c, -120));
        g.fillStyle = pg; g.beginPath(); g.ellipse(w * px, h * 0.68, w * 0.11, h * 0.17, 0, 0, TAU); g.fill();
        g.fillStyle = fin ? '#ffd76b' : '#ffffff'; g.beginPath(); g.arc(w * px, h * 0.68, 1.6, 0, TAU); g.fill();
      });
      const gr = g.createLinearGradient(0, h * 0.42, 0, h * 0.95);
      gr.addColorStop(0, tone(c, 70)); gr.addColorStop(0.45, c); gr.addColorStop(1, tone(c, -120));
      g.fillStyle = gr; g.beginPath(); g.ellipse(w / 2, h * 0.68, w * 0.5, h * 0.27, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.32)'; g.lineWidth = 1; g.beginPath(); g.ellipse(w / 2, h * 0.7, w * 0.36, h * 0.16, 0, 0, TAU); g.stroke();
      g.strokeStyle = fin ? '#ffd76b' : tone(c, 100); g.lineWidth = fin ? 1.8 : 1.2; g.globalAlpha = 0.85;
      g.beginPath(); g.ellipse(w / 2, h * 0.68, w * 0.5, h * 0.27, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.globalAlpha = 1;
      for (let i = 0; i < 7; i++) {
        const lx = w * (0.2 + i * 0.6 / 6), d = (lx - w / 2) / (w * 0.5), ly = h * 0.68 + Math.sqrt(Math.max(0, 1 - d * d)) * h * 0.15;
        g.fillStyle = i % 2 ? '#fff2b0' : tone(c, 120); g.beginPath(); g.arc(lx, ly, 1.1, 0, TAU); g.fill();
      }
      if (fin) {   // corona de púas del jefe final
        g.fillStyle = '#ffd76b';
        for (let i = 0; i < 5; i++) { const sx = w * (0.28 + i * 0.11); g.beginPath(); g.moveTo(sx - 3, h * 0.46); g.lineTo(sx, h * 0.46 - (i === 2 ? 11 : 7)); g.lineTo(sx + 3, h * 0.46); g.closePath(); g.fill(); }
      }
    });
  }
  function bossDome(b) {
    const w = b.w, h = b.h, r = w * 0.3;
    return sprite('dome|' + w + '|' + h, w, h, 6, (g) => {
      const gr = g.createRadialGradient(w / 2 - r * 0.3, h * 0.52 - r * 0.6, 1, w / 2, h * 0.52, r);
      gr.addColorStop(0, 'rgba(200,240,255,.38)'); gr.addColorStop(1, 'rgba(150,210,255,.07)');
      g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h * 0.52, r, Math.PI, 0); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.4; g.beginPath(); g.arc(w / 2, h * 0.52, r, Math.PI, 0); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 1.6; g.beginPath(); g.arc(w / 2, h * 0.52, r * 0.78, Math.PI * 1.12, Math.PI * 1.38); g.stroke();
    });
  }

  function bossGuardian(b, t) {
    const x = b.x, y = b.y, w = b.w, h = b.h, cxp = x + w / 2, cyp = y + h * 0.5, R = w * 0.3, c = b.color;
    addGlow(cxp, cyp, R * 2.6, c, 0.32 + 0.1 * Math.sin(t * 0.004));
    cx.save(); cx.translate(cxp, cyp);
    cx.rotate(t * 0.0004);
    const sg = cx.createRadialGradient(0, 0, R * 0.5, 0, 0, R * 1.4); sg.addColorStop(0, tone(c, -10)); sg.addColorStop(1, tone(c, -120));
    cx.fillStyle = sg; cx.beginPath();
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU, r = i % 2 ? R * 0.95 : R * 1.42; cx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    cx.closePath(); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.lineWidth = 1; cx.stroke();
    cx.restore();
    cx.save(); cx.translate(cxp, cyp);
    for (let i = 0; i < 4; i++) {   // esquirlas orbitando
      const a = -t * 0.0016 + i * TAU / 4, sx = Math.cos(a) * R * 1.6, sy = Math.sin(a) * R * 1.05;
      cx.save(); cx.translate(sx, sy); cx.rotate(a * 2); cx.fillStyle = tone(c, 50); cx.beginPath(); cx.moveTo(0, -5); cx.lineTo(3.4, 3.5); cx.lineTo(-3.4, 3.5); cx.closePath(); cx.fill();
      cx.strokeStyle = 'rgba(255,255,255,.5)'; cx.lineWidth = 0.8; cx.stroke(); cx.restore();
    }
    if (b.deco === 'anillo' || b.deco === 'doble') {   // anillo con oclusión
      const ring = (front) => { cx.save(); cx.beginPath(); cx.rect(-R * 3, front ? 0 : -R * 3, R * 6, R * 3); cx.clip();
        cx.strokeStyle = rgba(tone(c, 40), 0.75); cx.lineWidth = R * 0.14; cx.beginPath(); cx.ellipse(0, 0, R * 1.9, R * 0.55, -0.25, 0, TAU); cx.stroke(); cx.restore(); };
      ring(false); sphere(cx, 0, 0, R, tone(c, 100), c, tone(c, -120)); ring(true);
    } else sphere(cx, 0, 0, R, tone(c, 100), c, tone(c, -120));
    if (b.deco === 'bandas') { cx.save(); cx.beginPath(); cx.arc(0, 0, R, 0, TAU); cx.clip(); cx.fillStyle = rgba(tone(c, -70), 0.35); for (let i = -2; i <= 2; i++) cx.fillRect(-R, i * R * 0.38 - R * 0.06, R * 2, R * 0.16); cx.restore(); }
    if (b.deco === 'vortice' || b.deco === 'cometa') { cx.save(); cx.globalCompositeOperation = 'lighter'; cx.strokeStyle = rgba(tone(c, 80), 0.45); cx.lineWidth = 2;
      for (let i = 0; i < 3; i++) { cx.beginPath(); cx.arc(0, 0, R * (1.15 + i * 0.16), t * 0.002 + i * 2, t * 0.002 + i * 2 + 1.6); cx.stroke(); } cx.restore(); }
    if (b.deco === 'cristal' || b.deco === 'espinas') { cx.fillStyle = tone(c, 60); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2; cx.save(); cx.rotate(a); cx.beginPath(); cx.moveTo(R * 0.9, -R * 0.09); cx.lineTo(R * 1.38, 0); cx.lineTo(R * 0.9, R * 0.09); cx.closePath(); cx.fill(); cx.restore(); } }
    cx.fillStyle = '#f4f8ff'; cx.beginPath(); cx.ellipse(0, 0, R * 0.62, R * 0.4, 0, 0, TAU); cx.fill();
    const ix = Math.sin(t * 0.0021) * R * 0.14;
    sphere(cx, ix, 0, R * 0.3, tone(c, 130), c, tone(c, -60));
    cx.fillStyle = '#05060e'; cx.beginPath(); cx.ellipse(ix, 0, R * 0.08, R * 0.24, 0, 0, TAU); cx.fill();
    cx.fillStyle = tone(c, -100); cx.beginPath(); cx.moveTo(-R * 0.66, -R * 0.1); cx.lineTo(R * 0.66, -R * 0.1); cx.lineTo(R * 0.5, -R * 0.46); cx.lineTo(-R * 0.5, -R * 0.46); cx.closePath(); cx.fill();
    cx.restore();
    addGlow(cxp + Math.sin(t * 0.0021) * R * 0.14, cyp, R * 0.9, c, 0.35);
  }
  function bossAtom(b, t) {
    const x = b.x, y = b.y, w = b.w, h = b.h, cxp = x + w / 2, cyp = y + h * 0.45, R = w * 0.5;
    addGlow(cxp, cyp, R * 1.6, '#9fe0ff', 0.26);
    cx.save(); cx.translate(cxp, cyp);
    for (let o = 0; o < 3; o++) {
      const a = o * Math.PI / 3 + t * 0.0003;
      cx.save(); cx.rotate(a); cx.strokeStyle = 'rgba(170,215,255,.65)'; cx.lineWidth = 1.6; cx.beginPath(); cx.ellipse(0, 0, R, R * 0.4, 0, 0, TAU); cx.stroke();
      const ang = t * 0.004 + o * 2.1, ex = Math.cos(ang) * R, ey = Math.sin(ang) * R * 0.4;
      cx.restore();
      const rx = ex * Math.cos(a) - ey * Math.sin(a), ry = ex * Math.sin(a) + ey * Math.cos(a);
      addGlow(rx, ry, 9, '#7fd0ff', 0.8); sphere(cx, rx, ry, 3.2, '#ffffff', '#bfeaff', '#4aa0d8');
    }
    for (let i = 9; i >= 0; i--) {   // núcleo: racimo de protones/neutrones
      const a = i * 2.4, rr_ = Math.sqrt(i) * w * 0.048, px = Math.cos(a) * rr_, py = Math.sin(a) * rr_;
      i % 2 ? sphere(cx, px, py, w * 0.058, '#ffd6c8', '#ff7b5a', '#8a2a1a') : sphere(cx, px, py, w * 0.058, '#f2f4fa', '#b8bccc', '#585e72');
    }
    cx.fillStyle = '#fff'; cx.font = 'bold 12px Courier New'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.shadowColor = 'rgba(0,0,0,.8)'; cx.shadowBlur = 3; cx.fillText('Fe', 0, 0); cx.shadowBlur = 0;
    cx.restore();
  }

  function shadow(cxp, gy, y, w, maxH) {   // sombra elíptica proyectada en el suelo: da altura
    if (gy === undefined || gy >= 9999) return;
    const d = Math.max(0, Math.min(1, 1 - (gy - y) / (maxH || 700)));
    cx.save(); cx.fillStyle = 'rgba(0,0,0,' + (0.1 + d * 0.28) + ')';
    cx.beginPath(); cx.ellipse(cxp, gy + 6, w * (0.35 + d * 0.3), w * 0.07, 0, 0, TAU); cx.fill(); cx.restore();
  }
  function boss(b, W, H, env) {
    const t = now();
    if (env && env.groundY) shadow(b.x + b.w / 2, env.groundY, b.y + b.h, b.w, env.H);
    hpBar(b, W, H);
    if (b.look === 'atomo_hierro') { bossAtom(b, t); return; }
    if (b.look === 'guardian') { bossGuardian(b, t); return; }
    const x = b.x, y = b.y, w = b.w, h = b.h, cxp = x + w / 2, c = b.color;
    // propulsores
    const pul = 0.5 + 0.5 * Math.sin(t * 0.012);
    addGlow(x + w * 0.3, y + h * 0.96, 16, c, 0.45 + 0.2 * pul); addGlow(x + w * 0.7, y + h * 0.96, 16, c, 0.45 + 0.2 * (1 - pul));
    addGlow(cxp, y + h * 1.0, w * 0.5, c, 0.18);
    put(bossCraft(b), cxp, y + h / 2);
    // personaje dentro de la cúpula
    cx.save(); cx.translate(cxp, y + h * 0.4); const s = (w * 0.2) / 10; cx.scale(s, s);
    (HEADS[b.look] || HEADS.birrete)(cx, b, t);
    cx.restore();
    put(bossDome(b), cxp, y + h / 2);
  }

  /* ============================================================
     VEHÍCULOS DEL JUGADOR  (dibujados en una caja de 34×24)
     ============================================================ */
  function ship(s, buffs, vehiculo, env) {
    const t = now(), cxp = s.x + s.w / 2, cyp = s.y + s.h / 2, tl = s.tilt || 0;
    if (env && env.groundY && vehiculo !== 'jeep' && vehiculo !== 'taladro') shadow(cxp, env.groundY, s.y + s.h, s.w, env.H);
    if (buffs.shield) {
      cx.save(); cx.translate(cxp, cyp);
      const rx = s.w * 0.86, ry = s.h * 1.05, gr = cx.createRadialGradient(0, 0, ry * 0.4, 0, 0, rx);
      gr.addColorStop(0, 'rgba(91,214,255,0)'); gr.addColorStop(1, 'rgba(91,214,255,.28)');
      cx.fillStyle = gr; cx.beginPath(); cx.ellipse(0, 0, rx, ry, 0, 0, TAU); cx.fill();
      cx.strokeStyle = 'rgba(160,235,255,' + (0.55 + 0.25 * Math.sin(t * 0.008)) + ')'; cx.lineWidth = 1.6; cx.beginPath(); cx.ellipse(0, 0, rx, ry, 0, 0, TAU); cx.stroke();
      cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1.6; cx.beginPath(); cx.ellipse(0, 0, rx * 0.92, ry * 0.92, 0, t * 0.003, t * 0.003 + 0.9); cx.stroke();
      cx.restore();
    }
    cx.save(); cx.translate(cxp, cyp); cx.rotate(tl * 0.16); cx.scale(1 - Math.abs(tl) * 0.1, 1); cx.translate(-s.w / 2, -s.h / 2); cx.scale(s.w / 34, s.h / 24);
    switch (vehiculo) {
      case 'taladro': vTaladro(buffs, t); break;
      case 'nanobot': vNanobot(buffs, t); break;
      case 'jeep':    vJeep(buffs, t); break;
      default:        vNave(buffs, t);
    }
    cx.restore();
  }
  function lin(x0, y0, x1, y1, stops) { const g = cx.createLinearGradient(x0, y0, x1, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }

  function vNave(b, t) {
    const acc = b.power ? '#ffd76b' : '#3de07a', fc = b.speed ? '#5bd6ff' : '#ff8b3b', fl = (b.speed ? 13 : 8) + Math.random() * 4;
    [11.5, 22.5].forEach(fx => {
      addGlow(fx, 22, 11, fc, 0.55);
      cx.fillStyle = lin(0, 20, 0, 24 + fl, [[0, '#ffffff'], [0.35, fc], [1, rgba(fc, 0)]]);
      cx.beginPath(); cx.moveTo(fx - 2.6, 21); cx.lineTo(fx, 24 + fl); cx.lineTo(fx + 2.6, 21); cx.closePath(); cx.fill();
    });
    cx.fillStyle = lin(0, 8, 0, 24, [[0, tone(acc, 20)], [1, tone(acc, -110)]]);
    cx.beginPath(); cx.moveTo(12.5, 10); cx.lineTo(0.5, 22.5); cx.lineTo(4, 23.5); cx.lineTo(12, 19); cx.closePath(); cx.fill();
    cx.beginPath(); cx.moveTo(21.5, 10); cx.lineTo(33.5, 22.5); cx.lineTo(30, 23.5); cx.lineTo(22, 19); cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 0.8; cx.beginPath(); cx.moveTo(12.2, 11); cx.lineTo(1.6, 22); cx.moveTo(21.8, 11); cx.lineTo(32.4, 22); cx.stroke();
    cx.fillStyle = lin(8, 0, 26, 0, [[0, '#3a4668'], [0.5, '#8a9acb'], [1, '#2c3552']]);
    cx.beginPath(); cx.moveTo(17, -0.5); cx.lineTo(21.5, 9); cx.lineTo(23, 20.5); cx.lineTo(17, 18); cx.lineTo(11, 20.5); cx.lineTo(12.5, 9); cx.closePath(); cx.fill();
    cx.strokeStyle = acc; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(17, 1); cx.lineTo(17, 17); cx.stroke();
    cx.fillStyle = lin(0, 5, 0, 15, [[0, '#d8fbff'], [0.5, '#4ac8e8'], [1, '#14506a']]);
    cx.beginPath(); cx.ellipse(17, 10, 2.8, 5, 0, 0, TAU); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.7)'; cx.beginPath(); cx.ellipse(16.2, 8.3, 0.8, 1.8, 0, 0, TAU); cx.fill();
    cx.fillStyle = '#20263a'; cx.fillRect(9.6, 19.4, 4, 3); cx.fillRect(20.4, 19.4, 4, 3);
    addGlow(17, 10, 9, '#6ae0ff', 0.2);
  }
  function vTaladro(b, t) {
    const body = b.power ? ['#fff0a0', '#ffd24a', '#a8780a'] : ['#ffcf6a', '#f0a030', '#a8560c'];
    cx.fillStyle = lin(0, 14, 0, 23.5, [[0, '#4a4f5c'], [1, '#14161c']]); rr(cx, 0.5, 14, 33, 9.5, 4.5); cx.fill();
    cx.strokeStyle = b.speed ? '#5bd6ff' : 'rgba(255,255,255,.18)'; cx.lineWidth = b.speed ? 1.4 : 0.8; rr(cx, 0.5, 14, 33, 9.5, 4.5); cx.stroke();
    for (let i = 0; i < 4; i++) {
      const wx = 6 + i * 7.3, wy = 18.8;
      sphere(cx, wx, wy, 3.2, '#d8dce8', '#8a90a0', '#3a3e4a');
      cx.strokeStyle = '#2a2d36'; cx.lineWidth = 0.9; const a = t * 0.012 * (b.speed ? 1.6 : 1) + i;
      cx.beginPath(); cx.moveTo(wx + Math.cos(a) * 2.4, wy + Math.sin(a) * 2.4); cx.lineTo(wx - Math.cos(a) * 2.4, wy - Math.sin(a) * 2.4); cx.stroke();
    }
    cx.fillStyle = lin(0, 6, 0, 15, [[0, body[0]], [0.5, body[1]], [1, body[2]]]);
    cx.beginPath(); cx.moveTo(4.5, 14.5); cx.lineTo(29.5, 14.5); cx.lineTo(25, 7); cx.lineTo(9, 7); cx.closePath(); cx.fill();
    cx.fillStyle = lin(0, 8, 0, 12.5, [[0, '#d8fbff'], [1, '#2a8ab0']]); rr(cx, 12.5, 8.4, 9, 4.4, 1.4); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.45)'; cx.fillRect(13.5, 9, 4, 1);
    // broca con espiral animada
    cx.save(); cx.beginPath(); cx.moveTo(17, -4); cx.lineTo(23, 7.2); cx.lineTo(11, 7.2); cx.closePath(); cx.clip();
    cx.fillStyle = lin(11, 0, 23, 0, [[0, '#8a90a0'], [0.4, '#f2f4fa'], [1, '#5a6070']]); cx.fillRect(9, -6, 16, 15);
    cx.strokeStyle = 'rgba(40,44,56,.75)'; cx.lineWidth = 1.5; const ph = (t * (b.speed ? 0.05 : 0.03)) % 4;
    for (let k = -2; k < 5; k++) { const yy = k * 4 + ph; cx.beginPath(); cx.moveTo(9, yy + 3); cx.lineTo(25, yy - 3); cx.stroke(); }
    cx.restore();
    if (Math.random() < 0.55) { addGlow(17 + (Math.random() - 0.5) * 7, -3 - Math.random() * 3, 5, '#ffb04a', 0.8); }
    addGlow(17, 1, 12, '#ffcf6a', 0.14);
  }
  function vNanobot(b, t) {
    const c = b.power ? ['#fff4c0', '#ffd24a', '#8a5a0a'] : ['#e8fbff', '#7fd0ea', '#1e5a78'];
    const gl = b.speed ? '#5bd6ff' : '#7cffc4';
    for (let i = -1; i <= 1; i++) { addGlow(17 + i * 6.5, 23.5, 7, gl, 0.5 + 0.2 * Math.sin(t * 0.02 + i)); }
    cx.save(); cx.translate(17, 13.5); cx.rotate(-0.18);
    cx.strokeStyle = 'rgba(220,250,255,.35)'; cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(0, 0, 15, 5, 0, Math.PI, TAU); cx.stroke();
    cx.restore();
    sphere(cx, 17, 13.5, 9.6, c[0], c[1], c[2]);
    const pu = 0.6 + 0.4 * Math.sin(t * 0.008);
    sphere(cx, 17, 14, 4.3, '#ffffff', gl, tone(gl, -120)); addGlow(17, 14, 15, gl, 0.4 * pu);
    cx.fillStyle = 'rgba(255,255,255,.65)'; cx.beginPath(); cx.ellipse(13.4, 8.8, 2.8, 1.5, -0.6, 0, TAU); cx.fill();
    cx.save(); cx.translate(17, 13.5); cx.rotate(-0.18);
    cx.strokeStyle = 'rgba(230,252,255,.9)'; cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(0, 0, 15, 5, 0, 0, Math.PI); cx.stroke();
    const a = t * 0.004; sphere(cx, Math.cos(a) * 15, Math.sin(a) * 5, 1.9, '#ffffff', gl, tone(gl, -100)); cx.restore();
    cx.strokeStyle = '#a8f0ff'; cx.lineWidth = 1.1; cx.beginPath(); cx.moveTo(17, 3.8); cx.lineTo(17, -1); cx.stroke();
    cx.fillStyle = '#ffffff'; cx.beginPath(); cx.arc(17, -1.4, 1.5, 0, TAU); cx.fill(); addGlow(17, -1.4, 6, '#7fe8ff', 0.5 + 0.4 * Math.sin(t * 0.012));
  }
  function vJeep(b, t) {
    const body = b.power ? ['#fff0a0', '#ffd24a', '#8a5a0a'] : ['#7fe070', '#3fa042', '#14502a'];
    [8, 26].forEach(wx => {
      sphere(cx, wx, 20, 4.6, '#4a4a52', '#1c1c22', '#050507');
      sphere(cx, wx, 20, 2.2, '#e8ecf4', '#9aa0b0', '#454a58');
      cx.strokeStyle = '#2a2d36'; cx.lineWidth = 0.8; const a = t * 0.014 * (b.speed ? 1.6 : 1) + wx;
      cx.beginPath(); cx.moveTo(wx + Math.cos(a) * 2, 20 + Math.sin(a) * 2); cx.lineTo(wx - Math.cos(a) * 2, 20 - Math.sin(a) * 2); cx.stroke();
    });
    cx.fillStyle = lin(0, 11, 0, 21, [[0, body[0]], [0.5, body[1]], [1, body[2]]]); rr(cx, 1.5, 11.5, 31, 8.5, 2.6); cx.fill();
    cx.beginPath(); cx.moveTo(7, 12); cx.lineTo(11.5, 4.8); cx.lineTo(24, 4.8); cx.lineTo(28.5, 12); cx.closePath(); cx.fill();
    cx.fillStyle = lin(0, 5.5, 0, 11, [[0, '#d8fbff'], [1, '#3a90b8']]); cx.beginPath(); cx.moveTo(10, 11); cx.lineTo(13, 6.2); cx.lineTo(22.5, 6.2); cx.lineTo(25.5, 11); cx.closePath(); cx.fill();
    sphere(cx, 17.8, 8.6, 2.2, '#ffe9d0', '#e0b48a', '#a8784a');
    cx.strokeStyle = 'rgba(20,30,20,.7)'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(11, 4); cx.lineTo(24.5, 4); cx.moveTo(13, 2.8); cx.lineTo(13, 4.4); cx.moveTo(22.5, 2.8); cx.lineTo(22.5, 4.4); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.4)'; cx.fillRect(3, 13, 26, 1);
    cx.fillStyle = '#fff6b8'; cx.beginPath(); cx.arc(31.5, 14.6, 1.6, 0, TAU); cx.fill(); addGlow(32, 14.6, 8, '#fff2a0', 0.7);
    cx.strokeStyle = b.speed ? '#5bd6ff' : '#dfe6a0'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(17, 4); cx.lineTo(17, -2); cx.stroke();
    cx.fillStyle = '#ffe66b'; cx.beginPath(); cx.arc(17, -2.4, 1.6, 0, TAU); cx.fill(); addGlow(17, -2.4, 6, '#ffe66b', 0.45 + 0.35 * Math.sin(t * 0.012));
  }

  return { init, enemies, bossShots, bullets, powerups, particles, boss, ship };
})();
