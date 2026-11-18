/* =====================================================================
   RUTA ESTELAR · CONTROLES Y MOVIMIENTO (como Minecraft)
   ---------------------------------------------------------------------
   Computador: clic para capturar el mouse · W A S D o flechas · Espacio salta
               · Shift corre · C cambia la cámara · E toma lo que mira el rayo
   Celular:    joystick a la izquierda · arrastrar a la derecha para mirar ·
               botones SALTAR, CORRER, 👁 y ✋ · salto automático ante un bloque
   La física sale del entorno (reglas.js): aceleración máxima = μ·g
   (con poca gravedad el pie resbala), velocidad por la ley de la marcha,
   salto con v₀ fija y caída con daño si v de impacto > v segura.
   ===================================================================== */
import * as THREE from '../lib/three.module.min.js';
import { impactoCaida, factorMovimiento } from './vitalidad.js';

export const esTactil = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

export class Controles {
  constructor(lienzo, tactil) {
    this.k = new Set(); this.yaw = 0; this.pitch = 0;
    this.joy = { x: 0, y: 0 }; this.correrT = false; this.saltoT = false;
    this.pulsos = new Set();       // acciones de un toque: 'camara', 'usar', 'pausa'
    this.activo = false; this.sens = 0.0024;
    addEventListener('keydown', e => {
      if (!this.activo) return;
      const c = e.code;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(c)) e.preventDefault();
      if (!this.k.has(c)) { if (c === 'KeyC' || c === 'F5') this.pulsos.add('camara'); if (c === 'KeyE' || c === 'KeyF') this.pulsos.add('usar'); }
      if (c === 'F5') e.preventDefault();
      this.k.add(c);
    });
    addEventListener('keyup', e => this.k.delete(e.code));
    addEventListener('blur', () => this.k.clear());
    lienzo.addEventListener('click', () => { if (this.activo && !esTactil && document.pointerLockElement !== lienzo) lienzo.requestPointerLock?.(); });
    document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement && this.activo && !esTactil) this.pulsos.add('pausa'); });
    addEventListener('mousemove', e => {
      if (document.pointerLockElement !== lienzo) return;
      this.mirar(e.movementX, e.movementY);
    });
    addEventListener('mousedown', e => { if (document.pointerLockElement === lienzo && e.button === 0) this.pulsos.add('usar'); });
    if (tactil) this.tactil(lienzo, tactil);
  }
  mirar(dx, dy, s = this.sens) {
    this.yaw -= dx * s;
    this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch - dy * s));
  }
  tactil(lienzo, panel) {
    const joyEl = panel.querySelector('.joy'), perilla = joyEl.querySelector('i');
    let jId = null, j0 = null, mId = null, m0 = null;
    const R = 52;
    lienzo.addEventListener('touchstart', e => {
      for (const t of e.changedTouches) {
        if (t.clientX < innerWidth * 0.42 && jId === null) {
          jId = t.identifier; j0 = { x: t.clientX, y: t.clientY };
          joyEl.style.left = (t.clientX - R) + 'px'; joyEl.style.top = (t.clientY - R) + 'px'; joyEl.classList.add('on');
        } else if (mId === null) { mId = t.identifier; m0 = { x: t.clientX, y: t.clientY }; }
      }
      e.preventDefault();
    }, { passive: false });
    lienzo.addEventListener('touchmove', e => {
      for (const t of e.changedTouches) {
        if (t.identifier === jId) {
          let dx = t.clientX - j0.x, dy = t.clientY - j0.y; const d = Math.hypot(dx, dy);
          if (d > R) { dx *= R / d; dy *= R / d; }
          this.joy.x = dx / R; this.joy.y = dy / R;
          perilla.style.transform = `translate(${dx}px,${dy}px)`;
        } else if (t.identifier === mId) {
          this.mirar(t.clientX - m0.x, t.clientY - m0.y, 0.0055); m0 = { x: t.clientX, y: t.clientY };
        }
      }
      e.preventDefault();
    }, { passive: false });
    const fin = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === jId) { jId = null; this.joy.x = this.joy.y = 0; perilla.style.transform = ''; joyEl.classList.remove('on'); }
        if (t.identifier === mId) mId = null;
      }
    };
    lienzo.addEventListener('touchend', fin); lienzo.addEventListener('touchcancel', fin);
    panel.querySelectorAll('button').forEach(b => {
      const a = b.dataset.a;
      b.addEventListener('touchstart', e => {
        e.preventDefault(); e.stopPropagation();
        if (a === 'saltar') this.saltoT = true;
        else if (a === 'correr') { this.correrT = !this.correrT; b.classList.toggle('on', this.correrT); }
        else this.pulsos.add(a);
      }, { passive: false });
      b.addEventListener('touchend', e => { e.preventDefault(); if (a === 'saltar') this.saltoT = false; });
    });
  }
  /* dirección pedida en el plano (adelante = -z local) */
  eje() {
    const k = this.k;
    let f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    if (this.joy.x || this.joy.y) { f = -this.joy.y; s = this.joy.x; }
    return { f, s };
  }
  get salto() { return this.k.has('Space') || this.saltoT; }
  get correr() { return this.k.has('ShiftLeft') || this.k.has('ShiftRight') || this.k.has('ControlLeft') || this.correrT; }
  pulso(a) { const h = this.pulsos.has(a); this.pulsos.delete(a); return h; }
}

export class Jugador {
  constructor() {
    this.c = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 };
    this.suelo = false; this.esf = 0; this.paso = 0; this.caidaMax = 0;
    this.terceraPersona = false; this.ultImpacto = 0;
  }
  ponerEn(x, y, z, yaw, ctrl) { Object.assign(this.c, { x, y, z, vx: 0, vy: 0, vz: 0 }); ctrl.yaw = yaw; ctrl.pitch = -0.08; }

  actualizar(dt, ent, mundo, ctrl, cuerpo) {
    const G = ent.G, c = this.c;
    const { f, s } = ctrl.eje();
    const mag = Math.min(1, Math.hypot(f, s));
    const corre = ctrl.correr && mag > 0.2;
    const vMax = (corre ? G.vCorrer : G.vCaminar) * factorMovimiento(cuerpo);
    // dirección deseada en el mundo
    const sy = Math.sin(ctrl.yaw), cy = Math.cos(ctrl.yaw);
    let dx = -sy * f + cy * s, dz = -cy * f - sy * s;
    const dl = Math.hypot(dx, dz) || 1; dx /= dl; dz /= dl;
    const tx = dx * vMax * mag, tz = dz * vMax * mag;
    // aceleración: en el suelo, la que permite el roce (μ·g); en el aire, poca
    const aMax = this.suelo ? Math.max(1.2, 1.0 * G.g) : 1.6 + G.controlAire * G.g;
    const ax = tx - c.vx, az = tz - c.vz, an = Math.hypot(ax, az), paso = aMax * dt;
    if (an <= paso) { c.vx = tx; c.vz = tz; } else { c.vx += ax / an * paso; c.vz += az / an * paso; }

    // salto (y salto automático en celular al topar un bloque de 1 m)
    let salta = ctrl.salto;
    if (!salta && this.suelo && ctrl.joy && (ctrl.joy.x || ctrl.joy.y) && mag > 0.5) {
      const fx = c.x + dx * 0.55, fz = c.z + dz * 0.55, by = Math.floor(c.y + 0.1);
      if (mundo.solido(Math.floor(fx), by, Math.floor(fz)) && !mundo.solido(Math.floor(fx), by + 1, Math.floor(fz)) && !mundo.solido(Math.floor(fx), by + 2, Math.floor(fz))) salta = true;
    }
    if (salta && this.suelo) { c.vy = G.vSalto; this.suelo = false; cuerpo.bpm += 4; this.saltoAhora = true; }

    c.vy -= G.g * dt;
    const r = mundo.mover(c, dt);
    if (r.suelo && r.vImpacto > 0) {
      const d = impactoCaida(cuerpo, ent, r.vImpacto);
      if (d > 0) this.ultImpacto = d;
      this.aterrizo = r.vImpacto;
    }
    this.suelo = r.suelo;
    const vh = Math.hypot(c.vx, c.vz);
    this.esf = !this.suelo ? Math.max(this.esf * 0.98, 0.6) : vh < 0.15 ? 0 : corre ? 2.5 : 1;
    if (this.suelo) this.paso += vh * dt * 1.9;
    this.vh = vh;
    if (c.y < -20) { c.y = mundo.sy; c.vy = 0; }     // por si acaso
  }

  /* Posición de la cámara. En 3ª persona retrocede hasta donde el rayo no choca. */
  camara(cam, ctrl, mundo, nervio) {
    const c = this.c;
    const bob = this.suelo ? Math.sin(this.paso * Math.PI) * 0.05 * Math.min(1, this.vh / 3) : 0;
    const t = performance.now() / 1000;
    const mareo = nervio < 40 ? (40 - nervio) / 40 : 0;   // sistema nervioso dañado: la vista se mueve
    const yaw = ctrl.yaw + Math.sin(t * 1.3) * 0.05 * mareo, pitch = ctrl.pitch + Math.sin(t * 1.7) * 0.04 * mareo;
    cam.rotation.set(pitch, yaw, Math.sin(t * 0.9) * 0.06 * mareo, 'YXZ');
    const ojo = new THREE.Vector3(c.x, c.y + 1.62 + bob, c.z);
    if (!this.terceraPersona) { cam.position.copy(ojo); return; }
    const atras = new THREE.Vector3(0, 0, 1).applyEuler(cam.rotation);
    const h = mundo.rayo(ojo, atras, 4.5);
    const d = h ? Math.max(0.6, h.t - 0.3) : 4.5;
    cam.position.copy(ojo).addScaledVector(atras, d).add(new THREE.Vector3(0, 0.25, 0));
  }
}
