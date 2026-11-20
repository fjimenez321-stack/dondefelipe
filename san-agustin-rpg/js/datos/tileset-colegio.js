// ═══════════════════════════════════════════════════════════════
// TILESET "colegio" — cómo se ve y cómo se comporta cada carácter
// de la grilla. Para un lugar nuevo (plaza, reserva...) se crea
// otro archivo como este y se registra en main.js.
//
// Cada tile: { nombre, solido, dibujar(g,x,y,S,info),
//              mostrador?, soloJugador?, alPisar?(juego,x,y), interactuar?(juego,x,y) }
// info = { x, y (casilla), t (segundos), mapa, hash (0..1 fijo por casilla) }
// ═══════════════════════════════════════════════════════════════

const rect = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

// ── Suelos ──────────────────────────────────────────────────────
function piso(g, x, y, S, { x: cx, y: cy }) {
  rect(g, (cx + cy) % 2 ? '#d9cba6' : '#cfc096', x, y, S, S);
  rect(g, 'rgba(255,255,255,.10)', x + 1, y + 1, S - 2, 2);
  rect(g, 'rgba(0,0,0,.08)', x, y + S - 1, S, 1);
  rect(g, 'rgba(0,0,0,.06)', x + S - 1, y, 1, S);
}
function pasto(g, x, y, S, { hash, t }) {
  rect(g, hash > 0.5 ? '#4f9a3c' : '#4a9238', x, y, S, S);
  g.strokeStyle = 'rgba(134,239,172,.35)'; g.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const bx = x + 5 + ((hash * 97 + i * 11) % 22), by = y + 8 + ((hash * 53 + i * 7) % 18);
    const sw = Math.sin(t * 1.6 + hash * 10 + i) * 1.2;
    g.beginPath(); g.moveTo(bx, by + 5); g.lineTo(bx + sw, by); g.stroke();
  }
}
function sendero(g, x, y, S, { hash }) {
  rect(g, '#b8a888', x, y, S, S);
  g.fillStyle = '#a89878';
  for (let i = 0; i < 4; i++) {
    const px = x + 3 + ((hash * 131 + i * 9) % (S - 10)), py = y + 3 + ((hash * 71 + i * 13) % (S - 10));
    g.beginPath(); g.ellipse(px + 3, py + 3, 4, 3, 0, 0, Math.PI * 2); g.fill();
  }
}
function flores(g, x, y, S, info) {
  pasto(g, x, y, S, info);
  const cols = ['#f472b6', '#fde047', '#f8fafc', '#60a5fa', '#fb923c'];
  for (let i = 0; i < 3; i++) {
    const h = (info.hash * 997 + i * 0.31) % 1;
    const fx = x + 6 + h * (S - 12), fy = y + 6 + ((h * 7) % 1) * (S - 12);
    g.fillStyle = cols[Math.floor(h * cols.length)];
    for (let a = 0; a < 5; a++) { g.beginPath(); g.arc(fx + Math.cos(a * 1.26) * 2.2, fy + Math.sin(a * 1.26) * 2.2, 1.6, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#facc15'; g.beginPath(); g.arc(fx, fy, 1.2, 0, Math.PI * 2); g.fill();
  }
}
function jardinera(g, x, y, S, { hash, t }) {
  rect(g, '#5b4630', x, y, S, S);
  rect(g, '#6b5238', x + 2, y + 2, S - 4, S - 4);
  for (let i = 0; i < 4; i++) {
    const lx = x + 6 + (i % 2) * 14 + hash * 4, ly = y + 7 + Math.floor(i / 2) * 13;
    const sw = Math.sin(t * 1.3 + i + hash * 6) * 1.5;
    g.fillStyle = i % 2 ? '#22c55e' : '#16a34a';
    g.beginPath(); g.ellipse(lx + sw, ly, 6, 4, -0.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(lx + 4 + sw, ly + 3, 5, 3, 0.6, 0, Math.PI * 2); g.fill();
  }
}
function umbral(g, x, y, S, info) {
  piso(g, x, y, S, info);
  const gr = g.createLinearGradient(x, y, x, y + S);
  gr.addColorStop(0, 'rgba(15,23,42,.55)'); gr.addColorStop(1, 'rgba(15,23,42,.1)');
  g.fillStyle = gr; g.fillRect(x, y, S, S);
  rect(g, '#7c2d12', x + 4, y + S - 9, S - 8, 6);
}
function escalera(g, x, y, S) {
  rect(g, '#6b7280', x, y, S, S);
  for (let i = 0; i < 5; i++) {
    rect(g, i % 2 ? '#9ca3af' : '#a8afba', x, y + i * (S / 5), S, S / 5 - 1);
    rect(g, 'rgba(0,0,0,.25)', x, y + (i + 1) * (S / 5) - 2, S, 1);
  }
  rect(g, '#475569', x, y, 3, S); rect(g, '#475569', x + S - 3, y, 3, S);
}
function alfombra(g, x, y, S, { x: cx, y: cy }) {
  rect(g, '#7f1d1d', x, y, S, S);
  rect(g, (cx + cy) % 2 ? '#991b1b' : '#8b1a1a', x + 3, y + 3, S - 6, S - 6);
}

// ── Muros y muebles (sólidos) ───────────────────────────────────
function muro(g, x, y, S, { x: cx, y: cy, mapa }) {
  const abajoEsMuro = mapa.tile(cx, cy + 1)?.esMuro;
  rect(g, '#4a4438', x, y, S, S);
  rect(g, '#5a5448', x + 1, y + 1, S - 2, S * 0.45);
  rect(g, '#3a342a', x + 1, y + S * 0.5, S - 2, S * 0.45);
  if (!abajoEsMuro) { // cara visible del muro: zócalo
    rect(g, '#e7dcc0', x, y + S * 0.35, S, S * 0.5);
    rect(g, '#c8b98f', x, y + S * 0.82, S, S * 0.18);
    rect(g, 'rgba(0,0,0,.15)', x, y + S * 0.35, S, 2);
  }
}
function ventana(g, x, y, S, info) {
  muro(g, x, y, S, info);
  const gr = g.createLinearGradient(x, y + 6, x, y + S - 8);
  gr.addColorStop(0, '#bae6fd'); gr.addColorStop(1, '#38bdf8');
  rect(g, '#f8fafc', x + 4, y + 5, S - 8, S - 12);
  g.fillStyle = gr; g.fillRect(x + 6, y + 7, S - 12, S - 16);
  rect(g, '#f8fafc', x + S / 2 - 1, y + 7, 2, S - 16);
  rect(g, 'rgba(255,255,255,.5)', x + 8, y + 9, 3, 6);
}
function pizarra(g, x, y, S, info) {
  muro(g, x, y, S, info);
  rect(g, '#78350f', x, y + 4, S, S - 9);
  rect(g, '#14532d', x, y + 6, S, S - 13);
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1;
  g.beginPath();
  const h = info.hash;
  g.moveTo(x + 4, y + 11 + h * 4); g.lineTo(x + S - 6, y + 11 + h * 3);
  g.moveTo(x + 4, y + 17); g.lineTo(x + 10 + h * 14, y + 17);
  g.stroke();
}
function casillero(g, x, y, S, info) {
  piso(g, x, y, S, info);
  const c = ['#1d4ed8', '#b91c1c', '#15803d', '#a16207'][info.x % 4];
  rect(g, c, x + 2, y - 6, S - 4, S + 2);
  rect(g, 'rgba(255,255,255,.15)', x + 2, y - 6, 3, S + 2);
  rect(g, 'rgba(0,0,0,.25)', x + S / 2 - 1, y - 6, 2, S + 2);
  rect(g, '#e5e7eb', x + S / 2 + 3, y + S / 2 - 4, 2, 5);
  for (let i = 0; i < 3; i++) rect(g, 'rgba(0,0,0,.3)', x + 6, y - 2 + i * 3, 7, 1);
}
function mesa(g, x, y, S, info) {
  piso(g, x, y, S, info);
  rect(g, 'rgba(0,0,0,.18)', x + 3, y + S - 7, S - 6, 5);
  rect(g, '#5b3a1e', x + 4, y + 14, 3, S - 16); rect(g, '#5b3a1e', x + S - 7, y + 14, 3, S - 16);
  rect(g, '#a16207', x + 2, y + 6, S - 4, 10);
  rect(g, '#ca8a04', x + 2, y + 6, S - 4, 3);
  if (info.hash > 0.6) { rect(g, '#f8fafc', x + 8, y + 7, 8, 6); rect(g, '#2563eb', x + 18, y + 8, 6, 1); }
}
function estante(g, x, y, S, info) {
  piso(g, x, y, S, info);
  rect(g, '#5b3a1e', x + 1, y - 8, S - 2, S + 6);
  const cols = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#7c3aed', '#0891b2'];
  for (let f = 0; f < 3; f++) {
    rect(g, '#3f2614', x + 3, y - 6 + f * 12, S - 6, 10);
    for (let i = 0; i < 6; i++) {
      const hh = 6 + ((info.hash * 50 + i * 3 + f) % 3);
      rect(g, cols[(i + f + Math.floor(info.hash * 6)) % cols.length], x + 4 + i * 4, y - 6 + f * 12 + (10 - hh), 3, hh);
    }
  }
}
function banca(g, x, y, S, info) {
  (info.mapa.interior ? piso : pasto)(g, x, y, S, info);
  rect(g, 'rgba(0,0,0,.2)', x + 2, y + S - 8, S - 4, 5);
  rect(g, '#334155', x + 4, y + 16, 3, 12); rect(g, '#334155', x + S - 7, y + 16, 3, 12);
  rect(g, '#b45309', x + 1, y + 12, S - 2, 6);
  rect(g, '#d97706', x + 1, y + 12, S - 2, 2);
}
function mostrador(g, x, y, S, info) {
  piso(g, x, y, S, info);
  rect(g, '#1e3a8a', x, y + 8, S, S - 8);
  rect(g, '#e5e7eb', x, y + 4, S, 6);
  const snacks = ['🍬', '🧃', '🍪'];
  g.font = '10px serif'; g.textAlign = 'center';
  g.fillText(snacks[info.y % 3], x + S / 2, y + 7);
}
function arbol(g, x, y, S, info) {
  pasto(g, x, y, S, info);
  rect(g, 'rgba(0,0,0,.25)', x + 4, y + S - 8, S - 8, 6);
  rect(g, '#6b3f1f', x + S / 2 - 3, y + S / 2, 6, S / 2 - 3);
  const sw = Math.sin(info.t * 0.8 + info.hash * 6) * 1;
  g.fillStyle = '#166534'; g.beginPath(); g.arc(x + S / 2 + sw, y + S / 2 - 4, S * 0.42, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#15803d'; g.beginPath(); g.arc(x + S / 2 - 4 + sw, y + S / 2 - 8, S * 0.28, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(134,239,172,.25)'; g.beginPath(); g.arc(x + S / 2 - 6 + sw, y + S / 2 - 12, S * 0.12, 0, Math.PI * 2); g.fill();
}
function arbusto(g, x, y, S, info) {
  pasto(g, x, y, S, info);
  g.fillStyle = '#15803d'; g.beginPath(); g.ellipse(x + S / 2, y + S * 0.6, S * 0.42, S * 0.32, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#22c55e'; g.beginPath(); g.ellipse(x + S / 2 - 3, y + S * 0.5, S * 0.22, S * 0.16, 0, 0, Math.PI * 2); g.fill();
}
function roca(g, x, y, S, info) {
  pasto(g, x, y, S, info);
  g.fillStyle = '#6b7280'; g.beginPath(); g.ellipse(x + S / 2, y + S * 0.62, S * 0.36, S * 0.26, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#9ca3af'; g.beginPath(); g.ellipse(x + S / 2 - 3, y + S * 0.55, S * 0.18, S * 0.1, 0, 0, Math.PI * 2); g.fill();
}
function agua(g, x, y, S, { t, x: cx, y: cy }) {
  rect(g, '#9ca3af', x, y, S, S);
  rect(g, '#0ea5e9', x + 2, y + 2, S - 4, S - 4);
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1;
  for (let i = 0; i < 2; i++) {
    const o = (t * 8 + i * 13 + cx * 5 + cy * 3) % (S - 8);
    g.beginPath(); g.moveTo(x + 4 + o * 0.5, y + 8 + i * 12); g.lineTo(x + 12 + o * 0.5, y + 8 + i * 12); g.stroke();
  }
}

// ── Puertas y objetos ───────────────────────────────────────────
function puerta(g, x, y, S, p, t) {
  rect(g, '#4a4438', x, y, S, S);
  rect(g, '#111827', x + 3, y + 2, S - 6, S - 2);         // vano oscuro
  const a = p.apertura;
  const alto = (S - 4) * (1 - a);                          // la hoja "sube" al abrirse
  rect(g, p.color || '#92400e', x + 3, y + 2, S - 6, alto);
  if (alto > 6) {
    rect(g, 'rgba(255,255,255,.12)', x + 5, y + 4, S - 10, Math.max(0, alto - 6));
    rect(g, '#fbbf24', x + S - 10, y + 2 + alto / 2, 3, 3); // manilla
  }
  if (p.llave && !p._desbloqueada && a === 0) {
    g.font = '10px serif'; g.textAlign = 'center'; g.fillText('🔒', x + S / 2, y + S / 2 + 4 + Math.sin(t * 3));
  }
  rect(g, '#78716c', x, y, 3, S); rect(g, '#78716c', x + S - 3, y, 3, S); rect(g, '#78716c', x, y, S, 2);
}

const OBJETOS = {
  letrero(g, x, y, S) {
    rect(g, 'rgba(0,0,0,.2)', x + 8, y + S - 6, S - 16, 4);
    rect(g, '#78350f', x + S / 2 - 2, y + 14, 4, S - 16);
    rect(g, '#b45309', x + 4, y + 4, S - 8, 13);
    rect(g, '#fde68a', x + 7, y + 8, S - 14, 1); rect(g, '#fde68a', x + 7, y + 12, S - 18, 1);
  },
  cofre(g, x, y, S, o, t, juego) {
    const abierto = o.flag && juego.flag(o.flag);
    rect(g, 'rgba(0,0,0,.25)', x + 4, y + S - 7, S - 8, 5);
    rect(g, '#92400e', x + 4, y + 12, S - 8, S - 16);
    rect(g, '#b45309', x + 4, abierto ? y + 4 : y + 8, S - 8, 7);
    rect(g, '#fbbf24', x + S / 2 - 2, y + 13, 4, 5);
    if (!abierto) { g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 4); rect(g, '#fde68a', x + S - 8, y + 6, 2, 2); g.globalAlpha = 1; }
  },
};

export const tilesetColegio = {
  id: 'colegio',
  leyenda: {
    '.': 'piso', ',': 'pasto', 'p': 'sendero', 'f': 'flores', 'g': 'jardinera', 'E': 'umbral',
    '^': 'escalera', 'a': 'alfombra', 'D': 'piso',
    '#': 'muro', 'v': 'ventana', 'P': 'pizarra', 'h': 'casillero', 'm': 'mesa', 'b': 'estante',
    'B': 'banca', 'k': 'mostrador', 'T': 'arbol', 'Y': 'arbusto', 'o': 'roca', 'w': 'agua',
  },
  tiles: {
    piso: { nombre: 'Piso', dibujar: piso },
    pasto: { nombre: 'Pasto', dibujar: pasto },
    sendero: { nombre: 'Sendero', dibujar: sendero },
    flores: { nombre: 'Flores', dibujar: flores },
    jardinera: { nombre: 'Jardinera', dibujar: jardinera },
    umbral: { nombre: 'Salida', dibujar: umbral },
    escalera: { nombre: 'Escalera', dibujar: escalera },
    alfombra: { nombre: 'Alfombra', dibujar: alfombra },
    muro: { nombre: 'Muro', solido: true, esMuro: true, dibujar: muro },
    ventana: { nombre: 'Ventana', solido: true, esMuro: true, dibujar: ventana,
      interactuar: (j) => j.decir(j.reloj.oscuridad > 0.5 ? '🌙 Afuera ya está oscuro.' : '☀️ Por la ventana se ve el cerro.') },
    pizarra: { nombre: 'Pizarra', solido: true, esMuro: true, dibujar: pizarra },
    casillero: { nombre: 'Casillero', solido: true, dibujar: casillero,
      interactuar: (j) => j.decir('🔐 Un casillero con candado. No es tuyo.') },
    mesa: { nombre: 'Mesa', solido: true, dibujar: mesa },
    estante: { nombre: 'Estante', solido: true, dibujar: estante },
    banca: { nombre: 'Banca', solido: true, dibujar: banca },
    mostrador: { nombre: 'Mostrador', solido: true, mostrador: true, dibujar: mostrador },
    arbol: { nombre: 'Árbol', solido: true, dibujar: arbol },
    arbusto: { nombre: 'Arbusto', solido: true, dibujar: arbusto },
    roca: { nombre: 'Roca', solido: true, dibujar: roca },
    agua: { nombre: 'Agua', solido: true, dibujar: agua,
      interactuar: (j) => j.decir('💧 La fuente del jardín. El agua está fresca.') },
    _desconocido: { nombre: '¿?', solido: true, dibujar: (g, x, y, S) => rect(g, '#ff00ff', x, y, S, S) },
  },
  puerta,
  objetos: OBJETOS,
};
