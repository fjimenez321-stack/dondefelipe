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
//   Flechas          caminar (cada toque = un paso; mantener = caminar seguido)
//   Shift            correr
//   A / E / Espacio / Enter   hablar · interactuar · avanzar diálogo (A como en el v4)
//   Esc / Q          cancelar · cerrar
//   1-9              elegir opción de diálogo
//   G                guardar        H / F1   ayuda
//   I mochila   N cuaderno de misiones   P estadísticas   Esc (sin ruta) = volver/salir de la sala
//   M                silenciar      F3 / º   modo diseño (ver colisiones y zonas)
// Táctil:  JOYSTICK FLOTANTE: arrastrar el dedo sobre el mapa (como en Mapu)
//          tocar el mapa = caminar hasta ahí (y hablar si tocas a alguien)
//          A = acción, B = correr/cancelar, cruceta opcional (botón 🎮)
// Gamepad: cruceta o stick, A = acción, B = correr/cancelar, Start = ayuda
// ═══════════════════════════════════════════════════════════════

const TECLAS = {
  // Mismas teclas que el v4: flechas para caminar y A / Espacio / Enter para interactuar
  ArrowUp: 'arriba', ArrowDown: 'abajo', ArrowLeft: 'izquierda', ArrowRight: 'derecha',
  KeyA: 'accion',
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

  /**
   * Toques/clics sobre el canvas, con JOYSTICK FLOTANTE (como en Mapu):
   *  - tocar y soltar rápido sin arrastrar → caminar hasta ahí (o hablar)
   *  - tocar y arrastrar → aparece un círculo donde pusiste el dedo y el
   *    personaje camina hacia donde lo empujas; si arrastras más allá del
   *    borde, el círculo te sigue. Al soltar, desaparece.
   * joyEl / knobEl: el círculo y la perilla (opcionales; sin ellos no se dibuja).
   */
  vincularCanvas(canvas, joyEl = null, knobEl = null) {
    const R = 46;          // radio del círculo (px)
    const UMBRAL = 12;     // px de arrastre para que sea joystick y no toque
    const ZONA_MUERTA = 0.35;
    const ocultar = () => { if (joyEl) joyEl.style.display = 'none'; };
    const fin = (e) => {
      const j = this.joy;
      if (!j || (e && e.pointerId !== j.id)) return;
      if (e && !j.arrastre && performance.now() - j.t0 < 400) this.toque = { clientX: j.x0, clientY: j.y0 };
      this.joy = null;
      ocultar();
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || this.joy) return;
      e.preventDefault();
      this.joy = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ox: e.clientX, oy: e.clientY, t0: performance.now(), arrastre: false, dir: null, tDir: 0 };
      try { canvas.setPointerCapture(e.pointerId); } catch {}
    });
    canvas.addEventListener('pointermove', (e) => {
      const j = this.joy;
      if (!j || e.pointerId !== j.id) return;
      let dx = e.clientX - j.ox, dy = e.clientY - j.oy;
      if (!j.arrastre) {
        if (Math.hypot(dx, dy) < UMBRAL) return;
        j.arrastre = true;
        if (joyEl) { joyEl.style.left = j.ox + 'px'; joyEl.style.top = j.oy + 'px'; joyEl.style.display = 'block'; }
      }
      const m = Math.hypot(dx, dy);
      if (m > R) { // el círculo sigue al dedo
        j.ox += (dx / m) * (m - R); j.oy += (dy / m) * (m - R);
        dx = e.clientX - j.ox; dy = e.clientY - j.oy;
        if (joyEl) { joyEl.style.left = j.ox + 'px'; joyEl.style.top = j.oy + 'px'; }
      }
      if (knobEl) knobEl.style.transform = `translate(${dx}px,${dy}px)`;
      const nx = dx / R, ny = dy / R;
      let dir = null;
      if (Math.hypot(nx, ny) > ZONA_MUERTA) dir = Math.abs(nx) > Math.abs(ny) ? (nx > 0 ? 'derecha' : 'izquierda') : (ny > 0 ? 'abajo' : 'arriba');
      if (dir !== j.dir) { j.dir = dir; j.tDir = performance.now(); }
    });
    canvas.addEventListener('pointerup', fin);
    canvas.addEventListener('pointercancel', (e) => { if (this.joy) this.joy.arrastre = true; fin(e); });
    canvas.addEventListener('lostpointercapture', (e) => { if (this.joy?.id === e.pointerId) { this.joy.arrastre = true; fin(e); } });
    // Red de seguridad (como en Mapu): que el joystick nunca quede pegado
    addEventListener('blur', () => { this.joy = null; ocultar(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.joy = null; ocultar(); } });
  }

  /** La dirección mantenida más reciente (o null) y hace cuánto se mantiene (ms). */
  direccion() {
    let mejor = null, t0 = -1;
    for (const d of DIRECCIONES) {
      const t = this.mantenidas.get(d);
      if (t !== undefined && t > t0) { mejor = d; t0 = t; }
    }
    if (this.joy?.dir && this.joy.tDir > t0) { mejor = this.joy.dir; t0 = this.joy.tDir; }
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
