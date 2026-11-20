// ═══════════════════════════════════════════════════════════════
// INTELIGENCIA DE LOS NPC
// Cada comportamiento es un objeto con actualizar(npc, juego, dt).
// Solo se llama cuando el NPC está quieto y no está hablando.
//
// Tipos disponibles (se eligen en los datos con ia:{tipo:...}):
//   quieto     → no se mueve (puede mirar al jugador con def.mirar)
//   deambular  → pasea al azar dentro de un radio desde su casa
//   patrulla   → recorre una ruta de puntos en bucle (o ida y vuelta)
//   seguir     → sigue al jugador a cierta distancia (mascotas, acompañantes)
//   ir         → camina a un punto y se queda ahí (o ejecuta alLlegar)
//   horario    → cambia de comportamiento según la hora del juego
// ═══════════════════════════════════════════════════════════════
import { buscarRuta, LISTA_DIRS, DIRS } from './ruta.js';

const azar = (a, b) => a + Math.random() * (b - a);

/** Da UN paso hacia (tx,ty) usando BFS. Devuelve true si se movió. */
export function pasoHacia(npc, tx, ty, juego, { adyacente = false } = {}) {
  const ruta = buscarRuta(npc.x, npc.y, tx, ty,
    (x, y) => !!juego.obstaculo(x, y, npc), { adyacente, max: 1500 });
  if (!ruta || !ruta.length) return false;
  const p = ruta[0];
  const dir = LISTA_DIRS.find((d) => npc.x + DIRS[d].dx === p.x && npc.y + DIRS[d].dy === p.y);
  return npc.intentarMover(dir, juego);
}

class Quieto {
  actualizar() {}
}

class Deambular {
  constructor({ radio = 3, pausa = [1.2, 3.5], prob = 0.75 } = {}) {
    this.radio = radio; this.pausa = pausa; this.prob = prob;
    this.espera = azar(...pausa);
  }
  actualizar(npc, juego, dt) {
    this.espera -= dt;
    if (this.espera > 0) return;
    this.espera = azar(...this.pausa);
    if (Math.random() > this.prob) { // a veces solo mira a otro lado
      npc.dir = LISTA_DIRS[Math.floor(Math.random() * 4)];
      return;
    }
    // Elegir una dirección que no lo saque del radio
    const opciones = LISTA_DIRS.filter((d) => {
      const nx = npc.x + DIRS[d].dx, ny = npc.y + DIRS[d].dy;
      return Math.abs(nx - npc.casaX) <= this.radio && Math.abs(ny - npc.casaY) <= this.radio;
    });
    if (!opciones.length) return;
    npc.intentarMover(opciones[Math.floor(Math.random() * opciones.length)], juego);
  }
}

class Patrulla {
  /** ruta: [[x,y], ...]  idaYVuelta: recorre al revés al llegar al final */
  constructor({ ruta = [], pausa = [0.4, 1.2], idaYVuelta = false } = {}) {
    this.ruta = ruta; this.pausa = pausa; this.idaYVuelta = idaYVuelta;
    this.i = 0; this.paso = 1; this.espera = 0; this.atascado = 0;
  }
  actualizar(npc, juego, dt) {
    if (!this.ruta.length) return;
    if (this.espera > 0) { this.espera -= dt; return; }
    const [tx, ty] = this.ruta[this.i];
    if (npc.x === tx && npc.y === ty) {
      this.espera = azar(...this.pausa);
      if (this.idaYVuelta && (this.i + this.paso >= this.ruta.length || this.i + this.paso < 0)) this.paso *= -1;
      this.i = (this.i + this.paso + this.ruta.length) % this.ruta.length;
      return;
    }
    if (!pasoHacia(npc, tx, ty, juego)) {
      // Alguien le bloquea el paso: espera un poco; si sigue, salta al siguiente punto
      this.espera = 0.5;
      if (++this.atascado > 6) { this.atascado = 0; this.i = (this.i + 1) % this.ruta.length; }
    } else this.atascado = 0;
  }
}

class Seguir {
  constructor({ distancia = 1, objetivo = 'jugador' } = {}) { this.distancia = distancia; this.objetivo = objetivo; }
  actualizar(npc, juego) {
    const o = this.objetivo === 'jugador' ? juego.jugador : juego.entidad(this.objetivo);
    if (!o) return;
    const d = Math.abs(o.x - npc.x) + Math.abs(o.y - npc.y);
    if (d > this.distancia) pasoHacia(npc, o.x, o.y, juego, { adyacente: true });
    else npc.mirarA(o.x, o.y);
  }
}

class Ir {
  constructor({ x, y, alLlegar } = {}) { this.x = x; this.y = y; this.alLlegar = alLlegar; this.listo = false; }
  actualizar(npc, juego) {
    if (this.listo) return;
    if (npc.x === this.x && npc.y === this.y) { this.listo = true; this.alLlegar?.(npc, juego); return; }
    pasoHacia(npc, this.x, this.y, juego);
  }
}

class Horario {
  /** tramos: [{desde:8, hasta:13, ia:{...}}, ...]  porDefecto: ia fuera de esos tramos */
  constructor({ tramos = [], porDefecto = { tipo: 'quieto' } } = {}) {
    this.tramos = tramos.map((t) => ({ ...t, cerebro: crearIA(t.ia) }));
    this.defecto = crearIA(porDefecto);
  }
  actualizar(npc, juego, dt) {
    const h = juego.reloj.hora;
    const t = this.tramos.find((t) => (t.desde <= t.hasta ? h >= t.desde && h < t.hasta : h >= t.desde || h < t.hasta));
    (t ? t.cerebro : this.defecto).actualizar(npc, juego, dt);
  }
}

const TIPOS = { quieto: Quieto, deambular: Deambular, patrulla: Patrulla, seguir: Seguir, ir: Ir, horario: Horario };

/** Registrar comportamientos nuevos desde fuera del motor. */
export function registrarIA(nombre, Clase) { TIPOS[nombre] = Clase; }

export function crearIA(conf) {
  if (!conf) return new Quieto();
  if (typeof conf.actualizar === 'function') return conf; // ya es un cerebro
  const C = TIPOS[conf.tipo];
  if (!C) { console.warn('IA desconocida:', conf.tipo); return new Quieto(); }
  return new C(conf);
}
