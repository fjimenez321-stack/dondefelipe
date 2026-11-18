/* =====================================================================
   RUTA ESTELAR · NIVELES
   Cada planeta arma su mundo de bloques con las reglas del entorno:
   el relieve (E.relieve) sale de la gravedad. Devuelve el mundo, el punto
   de partida, la meta, los objetos y los peligros.
   ===================================================================== */
import { Mundo } from './voxel.js';
import { semilla } from './modelos.js';

/* ---------- paleta de bloques ---------- */
export const B = {
  roca: 1, asfalto: 2, vereda: 3, pasto: 4, tierra: 5, franja: 6, linea: 7, ventana: 8, techoR: 9, techoG: 10,
  muro: [11, 12, 13, 14, 15, 16], auto: [17, 18, 19, 20, 21], vidrio: 22, rueda: 23, bus: 24, cono: 25, hormigon: 26,
  tronco: 27, hojas: 28, torre: 29, torreR: 30,
  regolito: 31, regOsc: 32, rocaL: 33, oroL: 34, panel: 35,
  marte: 36, marteC: 37, rocaM: 38, rocaMO: 39, polvo: 40, luzPista: 41
};
const P = [];
const def = (id, c, v = 0.1, extra = {}) => { P[id] = { c, v, ...extra }; };
def(1, '#6b6b6b'); def(2, '#3a3d44', 0.06, { tex: 'asfalto' }); def(3, '#a9a8a0', 0.08, { tex: 'vereda' }); def(4, '#5c9a3a', 0.18); def(5, '#7a5a3a');
def(6, '#ececec', 0.03); def(7, '#e8c547', 0.04); def(8, '#a9dcff', 0.1, { luz: true }); def(9, '#a8432f', 0.12); def(10, '#585b62', 0.1);
['#eadcc0', '#a9cbe0', '#e6a38a', '#b8d4a8', '#f0d57a', '#f2f2ee'].forEach((c, i) => def(11 + i, c, 0.06));
['#d7263d', '#1b4f9c', '#eeeeee', '#f2c12e', '#2e8b57'].forEach((c, i) => def(17 + i, c, 0.04));
def(22, '#4f6f8f', 0.05); def(23, '#1b1b1b', 0.05); def(24, '#ef8a17', 0.04); def(25, '#ff6a13', 0.03); def(26, '#bab7ae', 0.07);
def(27, '#6b4a2e'); def(28, '#3f8037', 0.22); def(29, '#c9cdd2', 0.04); def(30, '#c0392b', 0.04);
def(31, '#8f8f8b', 0.16); def(32, '#6a6a67', 0.14); def(33, '#7b7976', 0.2); def(34, '#c8a046', 0.08); def(35, '#dfe3e6', 0.04);
def(36, '#b4552f', 0.14); def(37, '#c97a4a', 0.12); def(38, '#7d3b22', 0.18); def(39, '#5a2c1a', 0.16); def(40, '#d39062', 0.1);
def(41, '#5dff9a', 0.02, { luz: true });
export const PALETA = P;
/* Nombres de los PNG que usa la paleta (tex/bloques/<nombre>.png). */
export const TEXTURAS = [...new Set(P.filter(p => p && p.tex).map(p => p.tex))];

/* ruido de valor 2D con octavas */
function ruido(sem) {
  const r = semilla(sem), N = 256, t = Float32Array.from({ length: N * N }, r);
  const v = (x, y) => t[((y & 255) * N) + (x & 255)];
  const s = u => u * u * (3 - 2 * u);
  const n = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = s(x - xi), fy = s(y - yi);
    return (v(xi, yi) * (1 - fx) + v(xi + 1, yi) * fx) * (1 - fy) + (v(xi, yi + 1) * (1 - fx) + v(xi + 1, yi + 1) * fx) * fy; };
  return (x, y, oct = 4) => { let a = 0, amp = 1, f = 1, tot = 0; for (let o = 0; o < oct; o++) { a += n(x * f, y * f) * amp; tot += amp; amp *= 0.5; f *= 2; } return a / tot; };
}

const SX = 96, SY = 44, SZ = 168;

/* ====================== TIERRA: la ciudad en evacuación ====================== */
function nivelTierra(ent) {
  const m = new Mundo(SX, SY, SZ, PALETA, 11), r = semilla(11), S = 4;   // S = altura del suelo
  m.caja(0, 0, 0, SX - 1, S - 2, SZ - 1, B.roca);
  m.caja(0, S - 1, 0, SX - 1, S - 1, SZ - 1, B.pasto);
  // avenida principal (z) y calles transversales (x)
  const AV0 = 40, AV1 = 55;
  m.caja(AV0, S - 1, 0, AV1, S - 1, SZ - 1, B.asfalto);
  m.caja(AV0 - 2, S - 1, 0, AV0 - 1, S - 1, SZ - 1, B.vereda); m.caja(AV1 + 1, S - 1, 0, AV1 + 2, S - 1, SZ - 1, B.vereda);
  for (let z = 2; z < SZ; z += 6) m.caja(47, S - 1, z, 48, S - 1, z + 2, B.linea);
  const calles = [];
  for (let z = 26; z < SZ - 20; z += 34) {
    m.caja(0, S - 1, z, SX - 1, S - 1, z + 7, B.asfalto);
    for (let x = 0; x < SX; x += 6) m.caja(x, S - 1, z + 3, x + 2, S - 1, z + 4, B.franja);
    calles.push(z);
  }
  const esCalle = (x, z) => (x >= AV0 - 2 && x <= AV1 + 2) || calles.some(c => z >= c - 1 && z <= c + 8);
  // casas a los lados
  for (let z = 4; z < SZ - 26; z += 11) for (const lado of [0, 1]) {
    const x0 = lado ? AV1 + 5 + Math.floor(r() * 4) : 6 + Math.floor(r() * 6), w = 7 + Math.floor(r() * 9), d = 7 + Math.floor(r() * 3);
    const x1 = Math.min(lado ? SX - 3 : AV0 - 5, x0 + w);
    if (esCalle(x0, z) || esCalle(x1, z + d) || esCalle(x0, z + d)) continue;
    casa(m, x0, S, z, x1, z + d, Math.floor(3 + r() * 5), r);
  }
  // árboles en las veredas
  for (let z = 6; z < SZ - 24; z += 9) for (const x of [AV0 - 4, AV1 + 4]) if (!esCalle(x, z) && !m.get(x, S, z) && r() < 0.7) arbol(m, x, S, z, r);

  // la avenida está bloqueada: atascos de autos, buses y conos (obliga a saltar y buscar paso)
  const peligros = [], items = [];
  for (let z = 140; z > 30; z -= 11 + Math.floor(r() * 6)) {
    if (calles.some(c => z >= c - 3 && z <= c + 10)) continue;
    const tipo = r();
    if (tipo < 0.45) { for (let x = AV0; x < AV1 - 2; x += 5) if (r() < 0.8) auto(m, x, S, z, B.auto[Math.floor(r() * 5)], 'x'); }
    else if (tipo < 0.7) { const x = AV0 + 1 + Math.floor(r() * 4); bus(m, x, S, z); for (let k = x + 12; k < AV1; k += 2) m.set(k, S, z + 1, B.cono); }
    else { for (let x = AV0; x <= AV1; x += 2) m.set(x, S, z, B.cono); for (let x = AV0 + 1; x <= AV1; x += 4) auto(m, x, S, z + 3, B.auto[Math.floor(r() * 5)], 'z'); }
  }
  // autos que cruzan por las calles transversales (peligros en movimiento)
  for (const c of calles) for (let k = 0; k < 2; k++) peligros.push({ tipo: 'auto', z: c + 1.5 + k * 4, x: r() * SX, v: (k ? -1 : 1) * (7 + r() * 4), color: ['#d7263d', '#1b4f9c', '#f2c12e'][Math.floor(r() * 3)] });
  // drones de evacuación que patrullan
  for (let i = 0; i < 4; i++) peligros.push({ tipo: 'dron', x: AV0 + r() * 15, y: S + 2.2, z: 30 + i * 30, amp: 5, vel: 1 + r(), fase: r() * 6 });

  // plataforma de lanzamiento con la Voyager
  const PX = 47, PZ = 10;
  m.caja(PX - 8, S, PZ - 7, PX + 8, S + 1, PZ + 7, B.hormigon);
  m.caja(PX - 3, S, PZ + 8, PX + 3, S, PZ + 8, B.hormigon);    // escalón para subir
  for (let x = PX - 8; x <= PX + 8; x += 2) { m.set(x, S + 2, PZ - 7, B.luzPista); m.set(x, S + 2, PZ + 7, B.luzPista); }
  m.caja(PX + 6, S + 2, PZ - 2, PX + 7, S + 22, PZ - 1, B.torre);    // torre de servicio
  for (let y = S + 4; y < S + 22; y += 4) m.caja(PX + 6, y, PZ - 2, PX + 7, y, PZ - 1, B.torreR);
  // monedas: en la avenida, sobre autos y en techos
  for (let z = 150; z > 24; z -= 4) { const x = AV0 + 2 + Math.floor(Math.sin(z * 0.13) * 5 + 6); items.push({ tipo: 'moneda', x: x + 0.5, z: z + 0.5 }); }
  for (let i = 0; i < 18; i++) { const x = 4 + Math.floor(r() * (SX - 8)), z = 20 + Math.floor(r() * 130); if (m.alto(x, z) > S + 2) items.push({ tipo: 'gema', x: x + 0.5, z: z + 0.5 }); }
  for (const z of [120, 80, 45]) items.push({ tipo: 'racion', x: AV1 + 3.5, z: z + 0.5 });
  items.push({ tipo: 'botiquin', x: AV0 - 1.5, z: 100.5 });

  return {
    mundo: m, inicio: { x: 47.5, z: 160.5, yaw: 0 }, meta: { x: PX + 0.5, y: S + 2, z: PZ + 0.5, r: 6, nombre: 'la Voyager' },
    items, peligros, fragmentos: { cada: 7, radio: 2.2 }, limite: 150,
    cielo: { arriba: '#3e7fcf', horizonte: '#cfe6f6', niebla: '#cfe2f0', sol: '#fff3d6', amb: 1.15 },
    decor: ['voyagerRampa', 'k77'], suelo: S
  };
}
function casa(m, x0, y0, z0, x1, z1, h, r) {
  const muro = B.muro[Math.floor(r() * B.muro.length)];
  m.caja(x0, y0, z0, x1, y0 + h - 1, z1, muro);
  m.caja(x0 + 1, y0, z0 + 1, x1 - 1, y0 + h - 1, z1 - 1, 0);        // hueca
  for (let y = y0 + 1; y < y0 + h - 1; y += 3) for (let x = x0 + 2; x < x1 - 1; x += 3) { m.set(x, y, z0, B.ventana); m.set(x, y, z1, B.ventana); }
  const xm = Math.floor((x0 + x1) / 2); m.caja(xm, y0, z1, xm, y0 + 1, z1, 0);   // puerta
  m.caja(x0 - 1, y0 + h, z0 - 1, x1 + 1, y0 + h, z1 + 1, r() < 0.6 ? B.techoR : B.techoG);
  if (h > 4) m.caja(x0 + 2, y0 + h + 1, z0 + 2, x0 + 3, y0 + h + 1, z0 + 3, B.techoG);   // chimenea / equipo
}
function arbol(m, x, y, z, r) {
  const h = 3 + Math.floor(r() * 2); m.caja(x, y, z, x, y + h - 1, z, B.tronco);
  for (let dy = -1; dy <= 1; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++)
    if (Math.abs(dx) + Math.abs(dz) + Math.abs(dy) < 4 && r() < 0.9) { const yy = y + h + dy; if (!m.get(x + dx, yy, z + dz)) m.set(x + dx, yy, z + dz, B.hojas); }
}
function auto(m, x, y, z, color, eje) {   // 4 × 2 (eje x) o 2 × 4 (eje z), 2 de alto
  const [w, d] = eje === 'x' ? [4, 2] : [2, 4];
  m.caja(x, y, z, x + w - 1, y, z + d - 1, color);
  if (eje === 'x') m.caja(x + 1, y + 1, z, x + 2, y + 1, z + 1, B.vidrio);
  else m.caja(x, y + 1, z + 1, x + 1, y + 1, z + 2, B.vidrio);
}
function bus(m, x, y, z) {
  m.caja(x, y, z, x + 10, y + 2, z + 2, B.bus);
  for (let k = x + 1; k < x + 10; k += 2) { m.set(k, y + 1, z, B.vidrio); m.set(k, y + 1, z + 2, B.vidrio); }
  m.caja(x + 10, y + 1, z, x + 10, y + 1, z + 2, B.vidrio);
  m.caja(x, y + 3, z, x + 10, y + 3, z + 2, B.franja);
}

/* ====================== LUNA: cráteres y la base ====================== */
function nivelLuna(ent) {
  const m = new Mundo(SX, SY, SZ, PALETA, 23), r = semilla(23), n = ruido(23), A = ent.E.relieve;
  const altura = new Float32Array(SX * SZ);
  for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) altura[z * SX + x] = 7 + n(x / 40, z / 40, 4) * A * 0.9;
  // cráteres: cuenco hundido con borde levantado (más hondos con menos gravedad)
  const crateres = [];
  for (let i = 0; i < 22; i++) crateres.push([r() * SX, 20 + r() * (SZ - 45), 3 + r() ** 2 * 13]);
  for (const [cx, cz, R] of crateres) for (let z = Math.max(0, Math.floor(cz - R * 1.6)); z < Math.min(SZ, cz + R * 1.6); z++) for (let x = Math.max(0, Math.floor(cx - R * 1.6)); x < Math.min(SX, cx + R * 1.6); x++) {
    const d = Math.hypot(x - cx, z - cz) / R;
    let dh = d < 1 ? -(1 - d * d) * R * 0.45 : d < 1.6 ? Math.exp(-(((d - 1) / 0.25) ** 2)) * R * 0.18 : 0;
    altura[z * SX + x] += dh;
  }
  for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
    const h = Math.max(1, Math.min(SY - 6, Math.round(altura[z * SX + x])));
    m.caja(x, 0, z, x, h - 3, z, B.rocaL); m.caja(x, h - 2, z, x, h - 1, z, n(x / 6, z / 6, 2) > 0.55 ? B.regOsc : B.regolito);
  }
  for (let i = 0; i < 60; i++) { const x = Math.floor(r() * SX), z = Math.floor(r() * SZ), y = m.alto(x, z), s = r() < 0.2 ? 2 : 1; m.caja(x, y, z, x + s - 1, y + s - 1, z + s - 1, B.rocaL); }
  // módulo lunar (etapa de descenso dorada con patas)
  const lx = 30, lz = 120, ly = m.alto(lx, lz);
  m.caja(lx, ly + 1, lz, lx + 3, ly + 2, lz + 3, B.oroL);
  for (const [dx, dz] of [[-1, -1], [4, -1], [-1, 4], [4, 4]]) { m.caja(lx + dx, ly, lz + dz, lx + dx, ly, lz + dz, B.torre); }
  // base lunar: plataforma y paneles (las cúpulas son decorado)
  const BX = 50, BZ = 14, by = m.alto(BX, BZ);
  m.caja(BX - 9, by - 1, BZ - 8, BX + 9, by, BZ + 8, B.panel);
  m.caja(BX - 9, by + 1, BZ - 8, BX + 9, SY - 1, BZ + 8, 0);
  for (let x = BX - 9; x <= BX + 9; x += 3) { m.set(x, by + 1, BZ - 8, B.luzPista); m.set(x, by + 1, BZ + 8, B.luzPista); }
  const items = objetosVarios(m, r, { oxigeno: 7, racion: 3, botiquin: 2, moneda: 34, gema: 10 });
  return {
    mundo: m, inicio: { x: 48.5, z: 158.5, yaw: 0 }, meta: { x: BX + 0.5, y: by + 1, z: BZ + 0.5, r: 7, nombre: 'la base lunar' },
    items, peligros: [], fragmentos: { cada: 11, radio: 1.6 }, limite: 0,
    cielo: { arriba: '#000004', horizonte: '#05060c', niebla: '#05060c', sol: '#ffffff', amb: 0.55 },
    decor: ['tierraCielo', 'cupulas', 'estrellas'], suelo: by
  };
}

/* ====================== MARTE: dunas, mesetas y la colonia ====================== */
function nivelMarte(ent) {
  const m = new Mundo(SX, SY, SZ, PALETA, 37), r = semilla(37), n = ruido(37), n2 = ruido(91), A = ent.E.relieve;
  for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
    let h = 6 + n(x / 30, z / 30, 4) * A;
    const mes = n2(x / 28, z / 28, 3);                     // mesetas de bordes abruptos
    if (mes > 0.62) h += Math.min(1, (mes - 0.62) * 12) * A * 1.1;
    h += Math.sin(x * 0.35 + z * 0.12) * 0.6;              // ondas de dunas
    const hi = Math.max(1, Math.min(SY - 6, Math.round(h)));
    m.caja(x, 0, z, x, hi - 3, z, mes > 0.62 ? B.rocaM : B.rocaMO); m.caja(x, hi - 2, z, x, hi - 1, z, mes > 0.62 ? B.rocaM : (n(x / 5, z / 5, 2) > 0.55 ? B.marteC : B.marte));
  }
  for (let i = 0; i < 70; i++) { const x = Math.floor(r() * SX), z = Math.floor(r() * SZ), y = m.alto(x, z); m.set(x, y, z, r() < 0.5 ? B.rocaM : B.rocaMO); if (r() < 0.3) m.set(x, y + 1, z, B.rocaMO); }
  const BX = 48, BZ = 14, by = m.alto(BX, BZ);
  m.caja(BX - 10, by - 1, BZ - 9, BX + 10, by, BZ + 9, B.panel);
  m.caja(BX - 10, by + 1, BZ - 9, BX + 10, SY - 1, BZ + 9, 0);
  for (let x = BX - 10; x <= BX + 10; x += 3) { m.set(x, by + 1, BZ - 9, B.luzPista); m.set(x, by + 1, BZ + 9, B.luzPista); }
  const peligros = [];
  for (let i = 0; i < 5; i++) peligros.push({ tipo: 'remolino', x: 10 + r() * (SX - 20), z: 30 + r() * 110, vx: (r() - 0.5) * 4, vz: (r() - 0.5) * 4 });
  const items = objetosVarios(m, r, { oxigeno: 7, racion: 3, botiquin: 2, moneda: 34, gema: 10 });
  return {
    mundo: m, inicio: { x: 48.5, z: 158.5, yaw: 0 }, meta: { x: BX + 0.5, y: by + 1, z: BZ + 0.5, r: 7, nombre: 'la colonia de Marte' },
    items, peligros, fragmentos: null, limite: 0,
    cielo: { arriba: '#b07a52', horizonte: '#e8c39a', niebla: '#d9a77c', sol: '#fff0dc', amb: 1.25 },
    decor: ['cupulas', 'fobos'], suelo: by
  };
}

function objetosVarios(m, r, cant) {
  const out = [];
  for (const tipo in cant) for (let i = 0; i < cant[tipo]; i++) {
    const x = 3 + Math.floor(r() * (SX - 6)), z = tipo === 'oxigeno' ? 150 - i * 19 + Math.floor(r() * 8) : 24 + Math.floor(r() * 130);
    out.push({ tipo, x: x + 0.5, z: Math.min(SZ - 3, Math.max(3, z)) + 0.5 });
  }
  return out;
}

export const NIVELES = { tierra: nivelTierra, luna: nivelLuna, marte: nivelMarte };
