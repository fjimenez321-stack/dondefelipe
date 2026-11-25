// ═══════════════════════════════════════════════════════════════
// RENDER + CÁMARA
// Dibuja SOLO lo que se ve. Los tiles los dibuja el tileset (datos),
// así cada lugar (colegio, plaza, reserva) puede tener su propio estilo
// sin tocar el motor.
// ═══════════════════════════════════════════════════════════════
import { dibujarProfe, dibujarPersona, dibujarGato } from './sprites.js';

export const S = 32;                 // tamaño de casilla en unidades del mundo
const CASILLAS_LADO_CORTO = 11;      // cuántas casillas caben en el lado corto de la pantalla

const SPRITES = {
  profe: (g, e, px, py, t) => dibujarProfe(g, px, py, S, e.moviendo ? Math.abs(Math.sin(t * 12)) * 2 : 0, e.dir, e.moviendo ? t * 60 : 0),
  persona: (g, e, px, py, t) => dibujarPersona(g, px, py, S, e.apariencia, e.dir, t * 14, e.moviendo),
  gato: (g, e, px, py, t) => dibujarGato(g, px, py, S, e.apariencia, e.dir, t * 14, e.moviendo),
};
export function registrarSprite(nombre, fn) { SPRITES[nombre] = fn; }

// Objetos que flotan y brillan (evidencias, pistas): un emoji con halo
SPRITES.emoji = (g, e, px, py, t) => {
  const cx = px + S / 2, cy = py + S / 2 - 2 + Math.sin(t * 3 + e.x) * 2;
  const brillo = 0.35 + 0.25 * Math.sin(t * 4);
  g.fillStyle = `rgba(253,224,71,${brillo})`;
  g.beginPath(); g.arc(cx, cy, S * 0.42, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.beginPath(); g.ellipse(cx, py + S * 0.92, S * 0.22, S * 0.06, 0, 0, Math.PI * 2); g.fill();
  g.font = `${Math.round(S * 0.62)}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(e.emoji || '❓', cx, cy + 1);
};

export class Render {
  constructor(canvas) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.cam = { x: 0, y: 0 };
    this.fundido = 0;   // 0..1 negro para transiciones
    this.cartel = null; // nombre del mapa al entrar {texto, t}
    this.depurar = false;
    this.redimensionar();
    addEventListener('resize', () => this.redimensionar());
  }

  redimensionar() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.round(r.width * dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    this.rect = r;
    this._calcularZoom();
  }

  /** Zoom: ~11 casillas en el lado corto, pero si el mapa es chico (o la
   *  pantalla es vertical) se acerca para no dejar franjas vacías. */
  _calcularZoom(mapa = this._mapa) {
    const W = this.canvas.width, H = this.canvas.height, corto = Math.min(W, H);
    let z = corto / (CASILLAS_LADO_CORTO * S);
    if (mapa) {
      const llenar = Math.max(W / (mapa.ancho * S), H / (mapa.alto * S));
      z = Math.min(Math.max(z, llenar), corto / (8 * S));
    }
    this.zoom = z;
    this.vistaW = W / z / S; // en casillas
    this.vistaH = H / z / S;
  }

  /** Coordenadas de pantalla (clientX/Y) → casilla del mapa. */
  pantallaACasilla(cx, cy) {
    const r = this.canvas.getBoundingClientRect();
    const fx = (cx - r.left) / r.width * this.vistaW, fy = (cy - r.top) / r.height * this.vistaH;
    return { x: Math.floor(fx + this.cam.x), y: Math.floor(fy + this.cam.y) };
  }

  seguir(mapa, ent, dt, instantaneo = false) {
    if (mapa !== this._mapa) { this._mapa = mapa; this._calcularZoom(mapa); }
    const objetivo = (pos, vista, tam) => tam <= vista ? (tam - vista) / 2 : Math.max(0, Math.min(pos + 0.5 - vista / 2, tam - vista));
    const tx = objetivo(ent.px, this.vistaW, mapa.ancho), ty = objetivo(ent.py, this.vistaH, mapa.alto);
    const k = instantaneo ? 1 : 1 - Math.exp(-dt * 10);
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * k;
  }

  mostrarCartel(texto) { this.cartel = { texto, t: 0 }; }

  dibujar(juego, dt) {
    const { g } = this;
    const mapa = juego.mapa, ts = mapa.tileset, t = juego.tiempo;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = mapa.fondo; g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    g.imageSmoothingEnabled = false;
    // Cámara en múltiplos de píxel para que no "tiemble"
    const camX = Math.round(this.cam.x * S * this.zoom) / this.zoom;
    const camY = Math.round(this.cam.y * S * this.zoom) / this.zoom;
    g.setTransform(this.zoom, 0, 0, this.zoom, -camX * this.zoom, -camY * this.zoom);

    const x0 = Math.max(0, Math.floor(this.cam.x) - 1), y0 = Math.max(0, Math.floor(this.cam.y) - 1);
    const x1 = Math.min(mapa.ancho - 1, Math.ceil(this.cam.x + this.vistaW) + 1);
    const y1 = Math.min(mapa.alto - 1, Math.ceil(this.cam.y + this.vistaH) + 1);
    const dentro = (x, y) => x >= x0 - 1 && x <= x1 + 1 && y >= y0 - 1 && y <= y1 + 1;

    // 1) Tiles (o el dibujo completo del mapa, si el tileset lo hace él mismo)
    if (ts.dibujarFondo) {
      g.save(); ts.dibujarFondo(g, this, mapa); g.restore();
      g.setTransform(this.zoom, 0, 0, this.zoom, -camX * this.zoom, -camY * this.zoom);
    } else for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const tile = mapa.tile(x, y);
      tile?.dibujar?.(g, x * S, y * S, S, { x, y, t, mapa, hash: hash(x, y) });
    }

    // 2) Puertas
    for (const p of mapa.puertas.values()) {
      if (!dentro(p.x, p.y)) continue;
      (ts.puerta || puertaGenerica)(g, p.x * S, p.y * S, S, p, t);
    }

    // 3) Objetos (letreros, cofres...)
    for (const o of mapa.objetos.values()) {
      if (!dentro(o.x, o.y)) continue;
      const fn = ts.objetos?.[o.tipo];
      if (fn) fn(g, o.x * S, o.y * S, S, o, t, juego);
    }

    // 4) Etiquetas de portales
    for (const p of mapa.portales) {
      if (!p.etiqueta || !dentro(p.x, p.y)) continue;
      etiqueta(g, (p.x + p.w / 2) * S, p.y * S + (p.etiquetaAbajo ? S + 6 : -4), p.etiqueta, '#fbbf24');
    }
    for (const p of mapa.puertas.values()) {
      if (!p.etiqueta || !dentro(p.x, p.y)) continue;
      etiqueta(g, (p.x + 0.5) * S, p.y * S + (p.etiquetaAbajo ? S + 6 : -4), p.etiqueta, p._desbloqueada || !p.llave ? '#e2e8f0' : '#fbbf24');
    }

    // 5) Entidades ordenadas por profundidad (las de más abajo encima)
    const ents = juego.entidades.filter((e) => dentro(Math.round(e.px), Math.round(e.py)));
    ents.sort((a, b) => a.py - b.py);
    for (const e of ents) {
      g.save();
      g.globalAlpha = e.alfa;
      (SPRITES[e.sprite] || SPRITES.persona)(g, e, e.px * S, e.py * S, t);
      g.restore();
    }

    // 5b) Capa superior del tileset (noche, luces, letreros) — oscurece también a los personajes
    if (ts.dibujarFrente) {
      g.save(); ts.dibujarFrente(g, this, mapa); g.restore();
      g.setTransform(this.zoom, 0, 0, this.zoom, -camX * this.zoom, -camY * this.zoom);
    }

    // 6) Nombres de NPC cercanos, burbujas y aviso de interacción
    const j = juego.jugador;
    for (const e of ents) {
      if (e === j) continue;
      const d = Math.abs(e.x - j.x) + Math.abs(e.y - j.y);
      if (d <= 3 && e.nombre && !e.burbuja) etiqueta(g, (e.px + 0.5) * S, e.py * S - 2, (e.emoji ? e.emoji + ' ' : '') + e.nombre, '#fff', 0.55 + 0.45 * (1 - d / 4));
    }
    for (const e of ents) if (e.burbuja) burbuja(g, (e.px + 0.5) * S, e.py * S - 4, e.burbuja);

    const obj = juego.objetivoInteraccion;
    if (obj && juego.modo === 'explorar') {
      const pulso = 0.6 + 0.4 * Math.sin(t * 6);
      const bx = (obj.x + 0.5) * S, by = obj.y * S - (obj.alto || 0) - 14 - pulso * 2;
      g.save(); g.globalAlpha = 0.95;
      g.fillStyle = '#fbbf24'; g.beginPath(); g.arc(bx, by, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#111'; g.font = 'bold 9px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(juego.tactil ? 'A' : 'E', bx, by + 0.5);
      g.restore();
    }

    // 7) Ruta de tocar-para-caminar
    if (juego.rutaJugador?.length) {
      const fin = juego.rutaJugador[juego.rutaJugador.length - 1];
      g.strokeStyle = 'rgba(251,191,36,.8)'; g.lineWidth = 2;
      g.strokeRect(fin.x * S + 6, fin.y * S + 6, S - 12, S - 12);
    }

    if (this.depurar) this._depuracion(juego, x0, y0, x1, y1);

    // ── Capas de pantalla (sin cámara) ──
    g.setTransform(1, 0, 0, 1, 0, 0);
    const W = this.canvas.width, H = this.canvas.height;
    const noche = ts.gestionaNoche ? 0 : juego.reloj.oscuridad * (mapa.interior ? 0.35 : 0.62);
    if (noche > 0.01) { g.fillStyle = `rgba(10,14,48,${noche})`; g.fillRect(0, 0, W, H); }
    if (this.cartel) {
      this.cartel.t += dt;
      const a = Math.min(1, this.cartel.t * 3, Math.max(0, 2.6 - this.cartel.t));
      if (a <= 0) this.cartel = null;
      else {
        const fs = Math.round(14 * this.zoom);
        g.font = `bold ${fs}px "Press Start 2P", system-ui`;
        const w = g.measureText(this.cartel.texto).width + fs * 2;
        g.globalAlpha = a;
        g.fillStyle = 'rgba(15,23,42,.85)'; g.fillRect((W - w) / 2, fs, w, fs * 2.4);
        g.strokeStyle = '#fbbf24'; g.lineWidth = 2; g.strokeRect((W - w) / 2, fs, w, fs * 2.4);
        g.fillStyle = '#fde68a'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(this.cartel.texto, W / 2, fs * 2.2);
        g.globalAlpha = 1;
      }
    }
    if (this.fundido > 0) { g.fillStyle = `rgba(0,0,0,${this.fundido})`; g.fillRect(0, 0, W, H); }
  }

  _depuracion(juego, x0, y0, x1, y1) {
    const g = this.g, mapa = juego.mapa;
    g.save();
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const o = juego.obstaculo(x, y, juego.jugador);
      if (o) { g.fillStyle = o === 'entidad' ? 'rgba(59,130,246,.35)' : 'rgba(239,68,68,.30)'; g.fillRect(x * S, y * S, S, S); }
      if (mapa.portalEn(x, y)) { g.strokeStyle = '#38bdf8'; g.lineWidth = 2; g.strokeRect(x * S + 2, y * S + 2, S - 4, S - 4); }
    }
    for (const z of mapa.zonas) {
      g.strokeStyle = z.aparicion ? '#a855f7' : z.encuentros ? '#ef4444' : '#22c55e';
      g.setLineDash([4, 3]); g.lineWidth = 1.5;
      g.strokeRect(z.x * S, z.y * S, z.w * S, z.h * S);
      g.setLineDash([]);
      g.fillStyle = g.strokeStyle; g.font = '8px monospace'; g.textAlign = 'left';
      g.fillText(z.id, z.x * S + 3, z.y * S + 10);
    }
    for (const e of juego.entidades) {
      if (e.cerebro?.ruta) { // patrullas
        g.strokeStyle = 'rgba(250,204,21,.6)'; g.beginPath();
        e.cerebro.ruta.forEach(([x, y], i) => (i ? g.lineTo : g.moveTo).call(g, (x + 0.5) * S, (y + 0.5) * S));
        g.closePath(); g.stroke();
      }
    }
    g.restore();
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const j = juego.jugador, fs = Math.round(10 * Math.max(1, this.zoom / 1.5));
    g.font = `${fs}px monospace`; g.fillStyle = 'rgba(0,0,0,.7)';
    const lineas = [`${mapa.id} (${j.x},${j.y}) ${j.dir}`, `tile "${mapa.char(j.x, j.y)}" · ${Math.round(juego.fps)} fps`,
      `zonas: ${mapa.zonasEn(j.x, j.y).map((z) => z.id).join(', ') || '—'}`, `entidades: ${juego.entidades.length}`];
    g.fillRect(4, this.canvas.height - lineas.length * fs * 1.3 - 10, fs * 30, lineas.length * fs * 1.3 + 6);
    g.fillStyle = '#86efac'; g.textAlign = 'left'; g.textBaseline = 'top';
    lineas.forEach((l, i) => g.fillText(l, 8, this.canvas.height - (lineas.length - i) * fs * 1.3 - 4));
    g.restore();
  }
}

// ── Utilidades de dibujo ─────────────────────────────────────────
export function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function etiqueta(g, x, y, texto, color = '#fff', alfa = 1) {
  g.save();
  g.globalAlpha = alfa;
  g.font = 'bold 7px system-ui, sans-serif';
  const w = g.measureText(texto).width + 8;
  g.fillStyle = 'rgba(15,23,42,.82)';
  g.beginPath(); g.roundRect ? g.roundRect(x - w / 2, y - 11, w, 11, 3) : g.rect(x - w / 2, y - 11, w, 11); g.fill();
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(texto, x, y - 5.2);
  g.restore();
}

function burbuja(g, x, y, b) {
  const a = Math.min(1, b.t * 5, (b.dur - b.t) * 3);
  if (a <= 0) return;
  g.save(); g.globalAlpha = a;
  g.font = '8px system-ui, sans-serif';
  const lineas = partir(g, b.texto, 110);
  const w = Math.max(...lineas.map((l) => g.measureText(l).width)) + 10, h = lineas.length * 10 + 6;
  const bx = x - w / 2, by = y - h - 6;
  g.fillStyle = '#fff'; g.strokeStyle = '#0f172a'; g.lineWidth = 1;
  g.beginPath(); g.roundRect ? g.roundRect(bx, by, w, h, 4) : g.rect(bx, by, w, h); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(x - 4, by + h); g.lineTo(x, by + h + 5); g.lineTo(x + 4, by + h); g.fill();
  g.fillStyle = '#0f172a'; g.textAlign = 'center'; g.textBaseline = 'top';
  lineas.forEach((l, i) => g.fillText(l, x, by + 4 + i * 10));
  g.restore();
}

function partir(g, texto, max) {
  const out = []; let linea = '';
  for (const p of String(texto).split(' ')) {
    const prueba = linea ? linea + ' ' + p : p;
    if (g.measureText(prueba).width > max && linea) { out.push(linea); linea = p; } else linea = prueba;
  }
  if (linea) out.push(linea);
  return out;
}

function puertaGenerica(g, x, y, S, p) {
  g.fillStyle = '#1f2937'; g.fillRect(x, y, S, S);
  const a = p.apertura;
  g.fillStyle = '#92400e'; g.fillRect(x + 3 + a * (S - 6) * 0.85, y + 2, (S - 6) * (1 - a * 0.85), S - 2);
}
