// ═══════════════════════════════════════════════════════════════
// BUS DE EVENTOS
// El motor avisa lo que pasa (cambio de mapa, entrar a una zona,
// hablar con un NPC, abrir una puerta...). Los sistemas de juego
// (combate, misiones, laboratorios) se suscriben sin tocar el motor.
//
//   bus.on('zona:entrar', ({zona, mapa}) => { ... });
//   bus.emit('encuentro', {pool:'pasillo'});
// ═══════════════════════════════════════════════════════════════

export class Eventos {
  constructor() { this._h = new Map(); }

  on(nombre, fn) {
    if (!this._h.has(nombre)) this._h.set(nombre, new Set());
    this._h.get(nombre).add(fn);
    return () => this.off(nombre, fn); // devuelve la función para desuscribirse
  }

  once(nombre, fn) {
    const off = this.on(nombre, (d) => { off(); fn(d); });
    return off;
  }

  off(nombre, fn) { this._h.get(nombre)?.delete(fn); }

  emit(nombre, datos = {}) {
    const hs = this._h.get(nombre);
    if (hs) for (const fn of [...hs]) {
      try { fn(datos); } catch (e) { console.error(`[evento ${nombre}]`, e); }
    }
    // Comodín: escuchar todo (útil para depurar)
    const todos = this._h.get('*');
    if (todos) for (const fn of [...todos]) fn({ nombre, ...datos });
  }
}
