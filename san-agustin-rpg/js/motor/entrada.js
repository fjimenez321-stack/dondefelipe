// ═══════════════════════════════════════════════════════════════
// ENTRADA: teclado, pantalla táctil, mouse y control (gamepad)
// Todo se traduce a ACCIONES, así el resto del juego no sabe
// si el jugador usa teclado o celular.
//
//   Direcciones (se mantienen):  arriba abajo izquierda derecha
//   Botones (se mantienen):      correr
//   Pulsaciones (una vez):       accion, cancelar, guardar, ayuda, depurar, silencio
//
// Teclado:
//   Flechas / WASD   caminar (mantener = caminar seguido; toque corto = solo girar)
//   Shift            correr
//   E / Espacio / Enter   hablar · interactuar · avanzar diálogo
//   Esc / Q          cancelar · cerrar
//   1-9              elegir opción de diálogo
//   G                guardar        H / F1   ayuda
//   I mochila   N cuaderno de misiones   P estadísticas   Esc (sin ruta) = volver/salir de la sala
//   M                silenciar      F3 / º   modo diseño (ver colisiones y zonas)
// Táctil:  cruceta (mantener), A = acción, B = correr/cancelar,
//          tocar el mapa = caminar hasta ahí (y hablar si tocas a alguien)
// Gamepad: cruceta o stick, A = acción, B = correr/cancelar, Start = ayuda
// ═══════════════════════════════════════════════════════════════

const TECLAS = {
  ArrowUp: 'arriba', KeyW: 'arriba',
  ArrowDown: 'abajo', KeyS: 'abajo',
  ArrowLeft: 'izquierda', KeyA: 'izquierda',
  ArrowRight: 'derecha', KeyD: 'derecha',
  ShiftLeft: 'correr', ShiftRight: 'correr',
  KeyE: 'accion', Space: 'accion', Enter: 'accion', NumpadEnter: 'accion',
  Escape: 'cancelar', KeyQ: 'cancelar', Backspace: 'cancelar',
  KeyG: 'guardar', KeyH: 'ayuda', F1: 'ayuda', KeyM: 'silencio',
  KeyI: 'mochila', KeyN: 'misiones', KeyP: 'perfil',
  F3: 'depurar', Backquote: 'depurar', IntlBackslash: 'depurar',
};
const DIRECCIONES = ['arriba', 'abajo', 'izquierda', 'derecha'];

export class Entrada {
  constructor() {
    this.mantenidas = new Map(); // accion → timestamp en que se presionó
    this.pulsos = new Set();     // acciones que ocurrieron este frame
    this.numero = null;          // 1-9 para opciones de diálogo
    this.toque = null;           // {clientX, clientY} pendiente de procesar
    this._padPrev = {};

    addEventListener('keydown', (e) => {
      if (e.target.closest?.('input,textarea')) return;
      if (/^Digit[1-9]$/.test(e.code)) { this.numero = +e.code.slice(5); return; }
      const a = TECLAS[e.code];
      if (!a) return;
      e.preventDefault();
      if (e.repeat) return;
      this._presionar(a);
    });
    addEventListener('keyup', (e) => { const a = TECLAS[e.code]; if (a) this._soltar(a); });
    addEventListener('blur', () => this.mantenidas.clear());
  }

  _presionar(a) {
    if (!this.mantenidas.has(a)) this.mantenidas.set(a, performance.now());
    this.pulsos.add(a);
  }
  _soltar(a) { this.mantenidas.delete(a); }

  /** Conecta un botón de pantalla (cruceta táctil) a una acción. */
  vincularBoton(el, accion) {
    const on = (e) => { e.preventDefault(); el.classList.add('activo'); this._presionar(accion); el.setPointerCapture?.(e.pointerId); };
    const off = (e) => { e.preventDefault(); el.classList.remove('activo'); this._soltar(accion); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('lostpointercapture', off);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Toques/clics sobre el canvas → caminar hasta ahí. */
  vincularCanvas(canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.toque = { clientX: e.clientX, clientY: e.clientY };
    });
  }

  /** La dirección mantenida más reciente (o null) y hace cuánto se mantiene (ms). */
  direccion() {
    let mejor = null, t0 = -1;
    for (const d of DIRECCIONES) {
      const t = this.mantenidas.get(d);
      if (t !== undefined && t > t0) { mejor = d; t0 = t; }
    }
    return mejor ? { dir: mejor, ms: performance.now() - t0 } : null;
  }

  /** Dirección pulsada y soltada en el mismo frame (toque rápido). */
  toqueDireccion() {
    const d = DIRECCIONES.find((x) => this.pulsos.has(x) && !this.mantenidas.has(x));
    return d ? { dir: d, ms: 0 } : null;
  }

  mantiene(a) { return this.mantenidas.has(a); }
  pulso(a) { return this.pulsos.has(a); }
  tomarNumero() { const n = this.numero; this.numero = null; return n; }
  tomarToque() { const t = this.toque; this.toque = null; return t; }

  /** Llamar al inicio de cada frame lógico (lee el gamepad). */
  leerGamepad() {
    const pads = navigator.getGamepads?.() || [];
    const p = [...pads].find(Boolean);
    if (!p) return;
    const b = (i) => !!p.buttons[i]?.pressed;
    const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
    const estado = {
      arriba: b(12) || ay < -0.5, abajo: b(13) || ay > 0.5,
      izquierda: b(14) || ax < -0.5, derecha: b(15) || ax > 0.5,
      accion: b(0), correr: b(1), cancelar: b(1), ayuda: b(9),
    };
    for (const [a, on] of Object.entries(estado)) {
      const k = 'pad_' + a;
      if (on && !this._padPrev[k]) this._presionar(a);
      if (!on && this._padPrev[k]) this._soltar(a);
      this._padPrev[k] = on;
    }
  }

  /** Llamar al final de cada frame lógico. */
  finFrame() { this.pulsos.clear(); }
}
