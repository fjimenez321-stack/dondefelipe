/* =====================================================================
   RUTA ESTELAR · MUNDO DE BLOQUES (vóxeles de 1 m)
   ---------------------------------------------------------------------
   - Malla por trozos de 16×16 columnas: solo se dibujan las caras que dan
     al aire, con sombreado de esquinas (oclusión ambiental) como Minecraft.
   - Choques del astronauta (caja de 0,6 × 1,8 × 0,6 m) eje por eje.
   - Rayo DDA (Amanatides y Woo): avanza de bloque en bloque y devuelve el
     primero que toca, con su distancia exacta. Es el "rayo de foco".
   ===================================================================== */
import * as THREE from '../lib/three.module.min.js';

export const TROZO = 16;

/* paleta[id] = { c: '#rrggbb', v: variación de tono (0-1), luz: brilla en la oscuridad, pasa: no choca } */
export class Mundo {
  constructor(sx, sy, sz, paleta, semilla = 1) {
    this.sx = sx; this.sy = sy; this.sz = sz;
    this.b = new Uint8Array(sx * sy * sz);
    this.paleta = paleta.map(p => p && { ...p, rgb: new THREE.Color(p.c) });
    this.semilla = semilla;
    this.trozos = new Map();
    this.grupo = new THREE.Group();
  }
  i(x, y, z) { return (y * this.sz + z) * this.sx + x; }
  dentro(x, y, z) { return x >= 0 && y >= 0 && z >= 0 && x < this.sx && y < this.sy && z < this.sz; }
  get(x, y, z) { return this.dentro(x, y, z) ? this.b[this.i(x, y, z)] : 0; }
  set(x, y, z, t) { if (this.dentro(x, y, z)) this.b[this.i(x, y, z)] = t; }
  /* ¿choca? Afuera del mapa por los lados hay un muro invisible; abajo, roca. */
  solido(x, y, z) {
    if (y < 0) return true;
    if (x < 0 || z < 0 || x >= this.sx || z >= this.sz) return true;
    if (y >= this.sy) return false;
    const t = this.b[this.i(x, y, z)];
    return t !== 0 && !this.paleta[t].pasa;
  }
  caja(x0, y0, z0, x1, y1, z1, t) {   // rellena [x0,x1]×[y0,y1]×[z0,z1]
    for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.set(x, y, z, t);
  }
  /* Altura del primer bloque sólido de la columna (desde arriba). */
  alto(x, z) {
    for (let y = this.sy - 1; y >= 0; y--) if (this.solido(x, y, z) && this.get(x, y, z)) return y + 1;
    return 0;
  }

  /* ---------- malla ---------- */
  construir() {
    for (const m of this.trozos.values()) { this.grupo.remove(m); m.geometry.dispose(); }
    this.trozos.clear();
    this.mat = this.mat || new THREE.MeshLambertMaterial({ vertexColors: true });
    for (let cz = 0; cz < this.sz; cz += TROZO) for (let cx = 0; cx < this.sx; cx += TROZO) {
      const g = this.mallaTrozo(cx, cz);
      if (!g) continue;
      const m = new THREE.Mesh(g, this.mat);
      m.matrixAutoUpdate = false; m.receiveShadow = true;
      this.grupo.add(m); this.trozos.set(cx + ',' + cz, m);
    }
    return this.grupo;
  }
  /* Rehace solo los trozos que tocan la zona (después de un cráter). */
  actualizarZona(x0, z0, x1, z1) {
    for (let cz = Math.floor(Math.max(0, z0 - 1) / TROZO) * TROZO; cz <= Math.min(this.sz - 1, z1 + 1); cz += TROZO)
      for (let cx = Math.floor(Math.max(0, x0 - 1) / TROZO) * TROZO; cx <= Math.min(this.sx - 1, x1 + 1); cx += TROZO) {
        const k = cx + ',' + cz, viejo = this.trozos.get(k);
        if (viejo) { this.grupo.remove(viejo); viejo.geometry.dispose(); this.trozos.delete(k); }
        const g = this.mallaTrozo(cx, cz); if (!g) continue;
        const m = new THREE.Mesh(g, this.mat); m.matrixAutoUpdate = false; m.receiveShadow = true;
        this.grupo.add(m); this.trozos.set(k, m);
      }
  }
  mallaTrozo(cx, cz) {
    const pos = [], nor = [], col = [], idx = [];
    const opaco = (x, y, z) => { const t = this.get(x, y, z); return t !== 0 && !this.paleta[t].pasa; };
    const tmp = new THREE.Color();
    for (let y = 0; y < this.sy; y++) for (let z = cz; z < Math.min(cz + TROZO, this.sz); z++) for (let x = cx; x < Math.min(cx + TROZO, this.sx); x++) {
      const t = this.get(x, y, z); if (!t) continue;
      const p = this.paleta[t];
      // variación de tono por bloque (determinista)
      const h = hash3(x, y, z, this.semilla), k = 1 + (h - 0.5) * (p.v ?? 0.12);
      for (const f of CARAS) {
        const nx = x + f.n[0], ny = y + f.n[1], nz = z + f.n[2];
        if (opaco(nx, ny, nz)) continue;
        if (ny < 0) continue;
        const base = pos.length / 3;
        for (let v = 0; v < 4; v++) {
          const c = f.v[v];
          pos.push(x + c[0], y + c[1], z + c[2]);
          nor.push(f.n[0], f.n[1], f.n[2]);
          // oclusión ambiental: 2 lados + esquina
          const a = f.ao[v];
          const s1 = opaco(nx + a[0][0], ny + a[0][1], nz + a[0][2]), s2 = opaco(nx + a[1][0], ny + a[1][1], nz + a[1][2]);
          const cc = opaco(nx + a[2][0], ny + a[2][1], nz + a[2][2]);
          const ao = s1 && s2 ? 0 : 3 - (s1 + s2 + cc);
          const luz = p.luz ? 1 : (0.55 + 0.15 * ao) * f.l;
          tmp.copy(p.rgb).multiplyScalar(k * luz);
          col.push(tmp.r, tmp.g, tmp.b);
        }
        idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
      }
    }
    if (!idx.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
  }

  /* ---------- rayo de foco (DDA) ----------
     o: origen, d: dirección normalizada (THREE.Vector3), max: alcance.
     Devuelve { t, x, y, z, n:[nx,ny,nz], tipo } o null. */
  rayo(o, d, max) {
    let x = Math.floor(o.x), y = Math.floor(o.y), z = Math.floor(o.z);
    const px = d.x > 0 ? 1 : -1, py = d.y > 0 ? 1 : -1, pz = d.z > 0 ? 1 : -1;
    const tdx = Math.abs(1 / d.x), tdy = Math.abs(1 / d.y), tdz = Math.abs(1 / d.z);
    let tx = (d.x > 0 ? x + 1 - o.x : o.x - x) * tdx;
    let ty = (d.y > 0 ? y + 1 - o.y : o.y - y) * tdy;
    let tz = (d.z > 0 ? z + 1 - o.z : o.z - z) * tdz;
    let t = 0, n = [0, 0, 0];
    while (t <= max) {
      const b = this.get(x, y, z);
      if (b && !this.paleta[b].pasa) return { t, x, y, z, n, tipo: b };
      if (tx < ty && tx < tz) { x += px; t = tx; tx += tdx; n = [-px, 0, 0]; }
      else if (ty < tz) { y += py; t = ty; ty += tdy; n = [0, -py, 0]; }
      else { z += pz; t = tz; tz += tdz; n = [0, 0, -pz]; }
      if (y < 0 && d.y < 0) return { t, x, y: 0, z, n: [0, 1, 0], tipo: 0 };
      if (y >= this.sy && d.y > 0) return null;
      if ((x < 0 && d.x < 0) || (z < 0 && d.z < 0) || (x >= this.sx && d.x > 0) || (z >= this.sz && d.z > 0)) return null;
    }
    return null;
  }

  /* ---------- choques del cuerpo ----------
     c: { x,y,z (pies, centro), vx,vy,vz }, medio ancho a, alto h.
     Mueve dt segundos; devuelve { suelo, vImpacto, techo, pared }. */
  mover(c, dt, a = 0.3, h = 1.8) {
    const res = { suelo: false, vImpacto: 0, techo: false, pared: false };
    const pasos = Math.max(1, Math.ceil(Math.max(Math.abs(c.vx), Math.abs(c.vy), Math.abs(c.vz)) * dt / 0.35));
    const sdt = dt / pasos;
    for (let s = 0; s < pasos; s++) {
      // X
      c.x += c.vx * sdt;
      if (this.chocaCaja(c.x - a, c.y, c.z - a, c.x + a, c.y + h, c.z + a)) {
        if (!this.subir(c, a, h)) { c.x = c.vx > 0 ? Math.floor(c.x + a) - a - 1e-4 : Math.floor(c.x - a) + 1 + a + 1e-4; c.vx = 0; res.pared = true; }
      }
      // Z
      c.z += c.vz * sdt;
      if (this.chocaCaja(c.x - a, c.y, c.z - a, c.x + a, c.y + h, c.z + a)) {
        if (!this.subir(c, a, h)) { c.z = c.vz > 0 ? Math.floor(c.z + a) - a - 1e-4 : Math.floor(c.z - a) + 1 + a + 1e-4; c.vz = 0; res.pared = true; }
      }
      // Y
      c.y += c.vy * sdt;
      if (this.chocaCaja(c.x - a, c.y, c.z - a, c.x + a, c.y + h, c.z + a)) {
        if (c.vy < 0) { c.y = Math.floor(c.y) + 1; res.suelo = true; res.vImpacto = Math.max(res.vImpacto, -c.vy); }
        else { c.y = Math.floor(c.y + h) - h - 1e-4; res.techo = true; }
        c.vy = 0;
      }
    }
    if (!res.suelo) res.suelo = this.chocaCaja(c.x - a, c.y - 0.05, c.z - a, c.x + a, c.y - 0.01, c.z + a);
    return res;
  }
  /* Escalón de medio bloque (losas, veredas): se sube solo, sin saltar. */
  subir(c, a, h) {
    const y2 = Math.floor(c.y) + 1;
    if (y2 - c.y > 0.55) return false;
    if (this.chocaCaja(c.x - a, y2, c.z - a, c.x + a, y2 + h, c.z + a)) return false;
    c.y = y2; return true;
  }
  chocaCaja(x0, y0, z0, x1, y1, z1) {
    for (let y = Math.floor(y0); y <= Math.floor(y1 - 1e-6); y++)
      for (let z = Math.floor(z0); z <= Math.floor(z1 - 1e-6); z++)
        for (let x = Math.floor(x0); x <= Math.floor(x1 - 1e-6); x++)
          if (this.solido(x, y, z)) return true;
    return false;
  }
}

export function hash3(x, y, z, s = 0) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + s * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* Caras de un cubo: normal, 4 vértices (antihorario visto desde afuera), luz por orientación
   y, para cada vértice, los 3 vecinos (lado, lado, esquina) que lo oscurecen. */
const CARAS = (() => {
  const def = [
    { n: [1, 0, 0], v: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], l: 0.86 },
    { n: [-1, 0, 0], v: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], l: 0.86 },
    { n: [0, 1, 0], v: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], l: 1.0 },
    { n: [0, -1, 0], v: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], l: 0.55 },
    { n: [0, 0, 1], v: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], l: 0.94 },
    { n: [0, 0, -1], v: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], l: 0.94 }
  ];
  for (const f of def) {
    f.ao = f.v.map(c => {
      // ejes de la cara (los dos que no son la normal)
      const ej = [0, 1, 2].filter(k => f.n[k] === 0);
      const s = ej.map(k => c[k] === 1 ? 1 : -1);
      const a = [0, 0, 0], b = [0, 0, 0], e = [0, 0, 0];
      a[ej[0]] = s[0]; b[ej[1]] = s[1]; e[ej[0]] = s[0]; e[ej[1]] = s[1];
      return [a, b, e];
    });
  }
  return def;
})();
