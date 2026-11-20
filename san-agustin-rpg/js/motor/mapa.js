// ═══════════════════════════════════════════════════════════════
// MAPA
// Convierte la definición de datos de un mapa (grilla de texto +
// portales + puertas + objetos + zonas + NPC) en una estructura
// consultable por el motor. NO dibuja ni mueve nada.
//
// Capas de colisión (de abajo hacia arriba):
//   1. Tile de la grilla  → sólido según el tileset (muro, mesa...)
//   2. Puertas            → sólidas mientras estén cerradas
//   3. Objetos            → letreros, cofres (sólidos por defecto)
//   4. Entidades          → NPC y jugador (lo resuelve el Mundo)
// ═══════════════════════════════════════════════════════════════

const k = (x, y) => `${x},${y}`;

export class Mapa {
  constructor(def, tileset) {
    if (!tileset) throw new Error(`Mapa "${def.id}": tileset "${def.tileset}" no existe`);
    this.def = def;
    this.id = def.id;
    this.nombre = def.nombre || def.id;
    this.tileset = tileset;
    this.interior = !!def.interior;
    this.fondo = def.fondo || '#0b0f19';

    // ── Grilla ──
    this.celdas = def.grilla.map((fila) => [...fila]);
    this.alto = this.celdas.length;
    this.ancho = Math.max(...this.celdas.map((f) => f.length));
    this.celdas.forEach((f, y) => {
      if (f.length !== this.ancho) console.warn(`Mapa "${this.id}": fila ${y} mide ${f.length}, se esperaban ${this.ancho}`);
    });
    for (let y = 0; y < this.alto; y++) for (let x = 0; x < this.ancho; x++) {
      const c = this.celdas[y][x];
      if (c !== undefined && !tileset.leyenda[c]) console.warn(`Mapa "${this.id}": carácter "${c}" en (${x},${y}) no está en la leyenda`);
    }

    // ── Portales (salidas a otros mapas) ──
    // {x,y,w?,h?, a:'mapa', ax, ay, dir?, etiqueta?, requiere?(juego), bloqueado?:'texto'}
    this.portales = (def.portales || []).map((p) => ({ w: 1, h: 1, ...p }));

    // ── Puertas (tiles dinámicos) ──
    // {x,y, abierta?, llave?, requiere?(juego), bloqueada?:'texto', autoCerrar?:seg, etiqueta?}
    this.puertas = new Map();
    for (const p of def.puertas || []) {
      this.puertas.set(k(p.x, p.y), {
        ...p,
        abierta: !!p.abierta,
        apertura: p.abierta ? 1 : 0, // 0 = cerrada, 1 = abierta (animación)
        tiempoAbierta: 0,
      });
    }

    // ── Objetos interactuables (letreros, cofres, pizarras) ──
    // {x,y, tipo, texto|dialogo|accion(juego), solido?}
    this.objetos = new Map();
    for (const o of def.objetos || []) this.objetos.set(k(o.x, o.y), { solido: true, ...o });

    // ── Zonas activas ──
    this.zonas = (def.zonas || []).map((z) => ({ w: 1, h: 1, ...z }));
  }

  dentro(x, y) { return x >= 0 && y >= 0 && x < this.ancho && y < this.alto; }
  char(x, y) { return this.dentro(x, y) ? this.celdas[y][x] : undefined; }
  tile(x, y) {
    const c = this.char(x, y);
    return c === undefined ? null : this.tileset.tiles[this.tileset.leyenda[c]] || this.tileset.tiles._desconocido;
  }
  setChar(x, y, c) { if (this.dentro(x, y)) this.celdas[y][x] = c; }

  puertaEn(x, y) { return this.puertas.get(k(x, y)) || null; }
  objetoEn(x, y) { return this.objetos.get(k(x, y)) || null; }
  portalEn(x, y) {
    return this.portales.find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) || null;
  }
  zonasEn(x, y) {
    return this.zonas.filter((z) => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
  }

  /** Solidez SIN considerar entidades. Devuelve el motivo o null si se puede pisar. */
  obstaculo(x, y) {
    if (!this.dentro(x, y)) return 'borde';
    const p = this.puertaEn(x, y);
    if (p) return p.apertura >= 1 ? null : 'puerta';
    const o = this.objetoEn(x, y);
    if (o && o.solido) return 'objeto';
    const t = this.tile(x, y);
    if (!t || t.solido) return 'muro';
    return null;
  }
}
