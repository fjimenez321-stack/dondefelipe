/* =====================================================================
   RUTA ESTELAR · VUELO 3D DE LA VOYAGER
   La cámara va detrás de la nave. Meteoritos y basura espacial vienen de
   frente; la nave se mueve en un plano (arriba/abajo, izquierda/derecha).
   Entorno = 'espacio': microgravedad (g = 0), el tiempo corre igual que el
   de la misión y el cuerpo sigue gastando energía y perdiendo músculo.
   ===================================================================== */
import * as THREE from '../lib/three.module.min.js';
import { crearVoyager, crearTierra, crearPlaneta, roca, basuraEspacial, estrellas, semilla } from './modelos.js';

export const TRAMOS = {
  'tierra>luna': { dur: 42, dens: 1.0, basura: 0.6, vel: 70, desde: 'tierra', hacia: 'luna' },   // órbita baja: mucha basura espacial
  'luna>marte':  { dur: 55, dens: 1.35, basura: 0.12, vel: 85, desde: 'luna', hacia: 'marte' }    // espacio profundo: meteoritos
};
const LX = 9, LY = 5.5;     // límites del plano de vuelo

export class Vuelo {
  constructor(escena, tramo, mej) {
    this.T = TRAMOS[tramo]; this.mej = mej; this.r = semilla(tramo.length * 7 + 3);
    this.g = new THREE.Group(); escena.add(this.g);
    this.g.add(estrellas(3000, 900));
    this.nave = crearVoyager(); this.nave.scale.setScalar(0.7); this.g.add(this.nave);
    this.p = { x: 0, y: 0, vx: 0, vy: 0 };
    this.casco = 3 + (mej.escudo || 0); this.golpeT = 0; this.t = 0; this.monedas = 0; this.objs = [];
    // planeta de partida (queda atrás y abajo) y de destino (crece al frente)
    const mk = id => id === 'tierra' ? crearTierra(120) : crearPlaneta(id, id === 'luna' ? 60 : 90);
    this.origen = mk(this.T.desde); this.origen.position.set(-20, -150, -40); this.g.add(this.origen);
    this.destino = mk(this.T.hacia); this.destino.position.set(30, 10, -1500); this.destino.scale.setScalar(0.5); this.g.add(this.destino);
    const sol = new THREE.DirectionalLight(0xffffff, 2.6); sol.position.set(-60, 40, 30); this.g.add(sol);
    this.g.add(new THREE.AmbientLight(0x404a66, 0.6));
    this.sigObj = 0;
  }
  quitar(escena) { escena.remove(this.g); this.g.traverse(o => { o.geometry?.dispose(); }); }

  nuevo() {
    const r = this.r, esBasura = r() < this.T.basura, tipo = r() < 0.16 ? (r() < 0.25 ? 'gema' : 'moneda') : esBasura ? 'basura' : 'roca';
    let o;
    if (tipo === 'roca') { const s = 0.8 + r() ** 2 * 3; o = roca(s, Math.floor(r() * 1e6), r() < 0.5 ? 0x6e6259 : 0x5a5048); o.userData.r = s * 0.85; }
    else if (tipo === 'basura') { o = basuraEspacial(Math.floor(r() * 1e6)); o.userData.r = 1.3; }
    else { o = new THREE.Mesh(tipo === 'gema' ? new THREE.OctahedronGeometry(0.6) : new THREE.TorusGeometry(0.5, 0.18, 8, 18), new THREE.MeshStandardMaterial({ color: tipo === 'gema' ? 0x5de0ff : 0xffc857, emissive: tipo === 'gema' ? 0x1a6a88 : 0x6a4a10, metalness: 0.6, roughness: 0.3 })); o.userData.r = 0.9; }
    o.userData.tipo = tipo; o.userData.giro = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(2);
    o.position.set((r() * 2 - 1) * (LX + 2), (r() * 2 - 1) * (LY + 1.5), -260);
    this.g.add(o); this.objs.push(o);
  }

  /* Devuelve 'llegada', 'destruida' o null. ctrl.eje() da la dirección; el dedo arrastra. */
  actualizar(dt, ctrl, cam, sonido) {
    this.t += dt;
    const T = this.T, p = this.p, maniobra = 1 + 0.12 * (this.mej.maniobra || 0);
    const { f, s } = ctrl.eje();
    const a = 38 * maniobra;
    p.vx += s * a * dt; p.vy += f * a * dt;
    p.vx *= Math.pow(0.04, dt); p.vy *= Math.pow(0.04, dt);   // los propulsores frenan la deriva
    p.x = Math.max(-LX, Math.min(LX, p.x + p.vx * dt)); p.y = Math.max(-LY, Math.min(LY, p.y + p.vy * dt));
    this.nave.position.set(p.x, p.y, 0);
    this.nave.rotation.set(p.vy * 0.03, Math.PI, -p.vx * 0.045);   // la antena va adelante; motores y módulo, hacia la cámara
    const ll = 0.8 + Math.sin(this.t * 40) * 0.2 + Math.hypot(s, f) * 0.4;
    for (const l of this.nave.userData.llamas) l.scale.set(1, 1, ll);
    // aparecen objetos según la densidad del tramo
    this.sigObj -= dt;
    if (this.t < T.dur - 3 && this.sigObj <= 0) { this.nuevo(); this.sigObj = (0.42 + this.r() * 0.35) / T.dens; }
    const vel = T.vel, iman = this.mej.iman || 0;
    for (let i = this.objs.length - 1; i >= 0; i--) {
      const o = this.objs[i], u = o.userData;
      o.position.z += vel * dt;
      o.rotation.x += u.giro.x * dt; o.rotation.y += u.giro.y * dt;
      if ((u.tipo === 'moneda' || u.tipo === 'gema') && iman) {
        const d = o.position.distanceTo(this.nave.position);
        if (d < 4 + iman * 3) o.position.lerp(this.nave.position, Math.min(1, dt * 4));
      }
      const d = Math.hypot(o.position.x - p.x, o.position.y - p.y, o.position.z);
      if (d < u.r + 1.1) {
        if (u.tipo === 'moneda' || u.tipo === 'gema') { this.monedas += u.tipo === 'gema' ? 5 : 1; sonido('moneda'); }
        else if (this.golpeT <= 0) { this.casco--; this.golpeT = 1.2; sonido('golpe'); this.sacudir = 0.5; }
        this.g.remove(o); this.objs.splice(i, 1); continue;
      }
      if (o.position.z > 30) { this.g.remove(o); this.objs.splice(i, 1); }
    }
    this.golpeT -= dt;
    this.nave.userData.luz.material.color.set(this.golpeT > 0 ? 0xff3344 : 0x5dff9a);
    this.nave.visible = this.golpeT <= 0 || Math.floor(this.t * 12) % 2 === 0;
    // planetas: el origen se aleja, el destino se acerca
    const u = Math.min(1, this.t / T.dur);
    this.origen.position.set(-20, -150 - u * 160, -40 + u * 260);
    this.destino.position.set(30 * (1 - u), 10 - u * 60, -1500 + u * 1250);
    this.origen.rotation.y += dt * 0.03; this.destino.rotation.y += dt * 0.02;
    if (this.origen.userData.nubes) this.origen.userData.nubes.rotation.y += dt * 0.01;
    // cámara de persecución
    const sh = this.sacudir > 0 ? (this.sacudir -= dt, this.sacudir) : 0;
    cam.position.set(p.x * 0.8 + 5.5 + (Math.random() - 0.5) * sh, p.y * 0.8 + 3.2 + (Math.random() - 0.5) * sh, 8.5);
    cam.lookAt(p.x * 0.85 + 1.5, p.y * 0.85 + 0.6, -16);
    if (this.casco <= 0) return 'destruida';
    if (this.t >= T.dur) return 'llegada';
    return null;
  }
  get progreso() { return Math.min(1, this.t / this.T.dur); }
}
