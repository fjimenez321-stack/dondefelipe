// ═══════════════════════════════════════════════════════════════
// ENTIDADES: todo lo que se mueve por la grilla
//
// Movimiento por casillas con interpolación suave:
//   - (x,y) es la casilla LÓGICA (a donde va o donde está)
//   - (desdeX,desdeY) es la casilla de donde viene
//   - progreso 0→1 interpola el dibujo entre ambas
// Mientras se mueve ocupa las DOS casillas, así nadie se le cruza.
// ═══════════════════════════════════════════════════════════════
import { DIRS } from './ruta.js';
import { crearIA } from './ia.js';

let _sig = 1;

export class Entidad {
  constructor({ id, x = 0, y = 0, dir = 'abajo', velocidad = 4.5, solido = true } = {}) {
    this.id = id || `ent${_sig++}`;
    this.x = x; this.y = y;
    this.desdeX = x; this.desdeY = y;
    this.dir = dir;
    this.velocidad = velocidad; // casillas por segundo
    this.progreso = 1;
    this.moviendo = false;
    this.solido = solido;
    this.pasos = 0;
    this.burbuja = null; // {texto, t, dur}
    this.alfa = 1;       // para aparecer/desaparecer
  }

  /** Posición para dibujar (en casillas, con decimales). */
  get px() { return this.desdeX + (this.x - this.desdeX) * this.progreso; }
  get py() { return this.desdeY + (this.y - this.desdeY) * this.progreso; }

  ocupa(x, y) {
    return (this.x === x && this.y === y) || (this.moviendo && this.desdeX === x && this.desdeY === y);
  }

  delante() { const d = DIRS[this.dir]; return { x: this.x + d.dx, y: this.y + d.dy }; }

  mirarA(x, y) {
    const dx = x - this.x, dy = y - this.y;
    if (dx === 0 && dy === 0) return;
    this.dir = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'derecha' : 'izquierda') : (dy > 0 ? 'abajo' : 'arriba');
  }

  /**
   * Intenta dar un paso. Siempre gira hacia la dirección.
   * @returns true si empezó a moverse; si no, el motivo del bloqueo queda en this.ultimoBloqueo
   */
  intentarMover(dir, mundo, vel) {
    if (this.moviendo) return false;
    this.dir = dir;
    const d = DIRS[dir];
    const nx = this.x + d.dx, ny = this.y + d.dy;
    const obst = mundo.obstaculo(nx, ny, this);
    this.ultimoBloqueo = obst;
    if (obst) return false;
    this.desdeX = this.x; this.desdeY = this.y;
    this.x = nx; this.y = ny;
    this.progreso = 0;
    this.moviendo = true;
    this._vel = vel || this.velocidad;
    return true;
  }

  /** Colocar sin animación (al cambiar de mapa, al aparecer). */
  teletransportar(x, y, dir) {
    this.x = this.desdeX = x; this.y = this.desdeY = y;
    this.progreso = 1; this.moviendo = false;
    if (dir) this.dir = dir;
  }

  decir(texto, dur = 2.6) { this.burbuja = { texto, t: 0, dur }; }

  /** Avanza la animación. Devuelve true en el frame en que llega a la casilla. */
  actualizarMovimiento(dt) {
    if (this.burbuja) { this.burbuja.t += dt; if (this.burbuja.t > this.burbuja.dur) this.burbuja = null; }
    if (!this.moviendo) return false;
    this.progreso += dt * this._vel;
    if (this.progreso >= 1) {
      this.progreso = 1; this.moviendo = false;
      this.desdeX = this.x; this.desdeY = this.y;
      this.pasos++;
      return true;
    }
    return false;
  }
}

// ── Jugador ─────────────────────────────────────────────────────
export class Jugador extends Entidad {
  constructor(opts = {}) {
    super({ id: 'jugador', velocidad: 4.5, ...opts });
    this.velCorrer = 8;
    this.sprite = 'profe';
  }
}

// ── NPC ─────────────────────────────────────────────────────────
/**
 * Definición (ver datos/personajes.js):
 * { id, nombre, emoji, sprite:'persona'|'gato', apariencia:{...},
 *   ia:{tipo:'deambular', radio:3}, dialogo: string|array|guion|fn(juego,npc),
 *   frases:[...], saludo:{radio, frases, cada}, mirar: radio }
 */
export class NPC extends Entidad {
  constructor(def, x, y) {
    super({ id: def.uid || def.id, x, y, dir: def.dir || 'abajo', velocidad: def.velocidad || 2.6 });
    this.def = def;
    this.nombre = def.nombre || def.id;
    this.emoji = def.emoji || '';
    this.sprite = def.sprite || 'persona';
    this.apariencia = def.apariencia || {};
    this.casaX = x; this.casaY = y; // centro para deambular
    this.ocupado = false;           // true mientras habla con el jugador
    this.cerebro = crearIA(def.ia);
    this._saludoCd = Math.random() * 4;
    this._idxFrase = 0;
    this.temporal = !!def.temporal; // aparecido por una zona (se puede ir)
    this.vida = def.vida ?? Infinity;
  }

  cambiarIA(conf) { this.cerebro = crearIA(conf); }

  /** Siguiente frase en rotación (como np() del v4). */
  siguienteFrase() {
    const fr = this.def.frases;
    if (!fr || !fr.length) return '';
    return fr[this._idxFrase++ % fr.length];
  }

  actualizar(dt, juego) {
    const llego = this.actualizarMovimiento(dt);
    if (this.ocupado) return llego;
    const j = juego.jugador;
    const dist = Math.abs(j.x - this.x) + Math.abs(j.y - this.y);

    // Saludo espontáneo (burbuja) cuando el profe pasa cerca
    const s = this.def.saludo;
    if (s) {
      this._saludoCd -= dt;
      if (this._saludoCd <= 0 && dist <= (s.radio || 2) && !this.burbuja) {
        const fr = s.frases || this.def.frases || ['¡Hola, profe!'];
        this.decir(fr[Math.floor(Math.random() * fr.length)]);
        this._saludoCd = s.cada || 15;
      }
    }

    // Mirar al jugador si está cerca y el NPC está quieto
    if (this.def.mirar && !this.moviendo && dist <= this.def.mirar) this.mirarA(j.x, j.y);

    if (!this.moviendo) this.cerebro?.actualizar(this, juego, dt);
    return llego;
  }
}
