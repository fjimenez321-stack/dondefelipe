/* =====================================================================
   RUTA ESTELAR · Misión Voyager — juego 3D con motor de reglas
   ---------------------------------------------------------------------
   reglas.js     las 4 variables del entorno (G, T, E, V) y lo que derivan
   vitalidad.js  los 5 sistemas del cuerpo
   voxel.js      mundo de bloques, choques y rayo de foco (DDA)
   jugador.js    controles y movimiento tipo Minecraft
   niveles.js    Tierra, Luna y Marte · vuelo.js: viaje de la Voyager
   modelos.js    astronauta, Tierra, Voyager, rocas…
   Este archivo: escena, bucle, peligros, HUD, pantallas y tienda.
   ===================================================================== */
import * as THREE from '../lib/three.module.min.js';
import { entorno, CUERPOS } from './reglas.js';
import { SISTEMAS, CAUSAS, nuevoCuerpo, pasoCuerpo, golpe, consumir, sistemaCaido } from './vitalidad.js';
import { Controles, Jugador, esTactil } from './jugador.js';
import { NIVELES, B } from './niveles.js';
import { Vuelo, TRAMOS } from './vuelo.js';
import { crearAstronauta, animarAstronauta, crearBrazoFP, crearTierra, crearPlaneta, crearVoyager, asteroideK77, roca, estrellas, cupula, atmosfera, semilla } from './modelos.js';

/* ---------- datos de la misión ---------- */
const RUTA = ['tierra', 'luna', 'marte'];
const NOMBRE = { tierra: 'Tierra', luna: 'Luna', marte: 'Marte' }, ART = { tierra: 'la Tierra', luna: 'la Luna', marte: 'Marte' };
const MEJORAS = {
  salto:     { nombre: 'Botas de impulso',   desc: '+7 % de velocidad de despegue: saltas más alto en todos los planetas' },
  velocidad: { nombre: 'Traje ligero',       desc: '+8 % de velocidad al caminar y correr' },
  tanque:    { nombre: 'Tanque de O₂ mayor', desc: '+30 % de oxígeno por tanque en la Luna y Marte' },
  iman:      { nombre: 'Imán de monedas',    desc: 'Atrae monedas cercanas (a pie y en la nave)' },
  escudo:    { nombre: 'Escudo de la nave',  desc: '+1 impacto resistido en vuelo' },
  maniobra:  { nombre: 'Propulsores',        desc: '+12 % de maniobra de la nave' }
};
const COSTOS = [25, 50, 80];
const RELATO_HANGAR = [
  'Despegaste justo a tiempo: el K-77 ya brilla sobre la ciudad. Ahora hay que atravesar la órbita baja, llena de basura espacial.',
  'Hiciste escala en la base lunar y recargaste oxígeno. Próximo destino: la colonia de Marte, donde el Disco de Oro II quedará a salvo.'
];
const DATOS = [
  'Los relojes de los satélites GPS, a 20.200 km de altura, se adelantan unos 45 microsegundos por día respecto de los de la superficie, por estar más lejos del pozo de gravedad de la Tierra. Sin corregir esa dilatación del tiempo, el GPS se equivocaría en kilómetros.',
  'En la Luna los astronautas del Apolo avanzaban a saltitos: con 1/6 de la gravedad, el pie agarra poco y caminar es torpe. En Marte la gravedad es un poco más de 1/3 de la terrestre.'
];
const OBJ = {
  moneda:   { nombre: 'Moneda' }, gema: { nombre: 'Gema (+5)' },
  racion:   { nombre: 'Ración 🍎 digestivo +35' }, oxigeno: { nombre: 'Tanque de O₂ 🫁 +40' }, botiquin: { nombre: 'Botiquín 🦴🧠 +25' }
};

/* ---------- motor gráfico ---------- */
const lienzo = document.getElementById('c');
const rend = new THREE.WebGLRenderer({ canvas: lienzo, antialias: !esTactil, powerPreference: 'high-performance' });
rend.setPixelRatio(Math.min(devicePixelRatio, esTactil ? 1.25 : 1.75));
rend.outputColorSpace = THREE.SRGBColorSpace;
rend.toneMapping = THREE.ACESFilmicToneMapping; rend.toneMappingExposure = 1.05;
rend.shadowMap.enabled = !esTactil; rend.shadowMap.type = THREE.PCFSoftShadowMap;
const escena = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(72, 1, 0.05, 1200);
escena.add(cam);
const pmrem = new THREE.PMREMGenerator(rend);
function ajustar() { rend.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
addEventListener('resize', ajustar); ajustar();

const $ = id => document.getElementById(id);
const ov = $('ov'), panel = $('panel'), hud = $('hud'), tactil = $('tactil');
const ctrl = new Controles(lienzo, esTactil ? tactil : null);
const fmt = (n, d = 1) => n.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
const reloj = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return String(m).padStart(2, '0') + ':' + (r < 10 ? '0' : '') + fmt(r, 1); };

/* ---------- estado de la misión ---------- */
const E = { modo: 'titulo', etapa: 0, dinero: 0, mej: { salto: 0, velocidad: 0, tanque: 0, iman: 0, escudo: 0, maniobra: 0 }, t: 0 };
let L = null;        // nivel en curso (superficie)
let V = null;        // vuelo en curso
let fondo = null;    // escena de la portada

/* ---------- sonido ---------- */
let ac = null, sonOn = true, ultLatido = 0;
function bip(f, d, tipo = 'sine', v = 0.08, f2) {
  if (!ac || !sonOn) return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
  o.type = tipo; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d);
}
function sonido(k) {
  ({ moneda: () => { bip(880, 0.08, 'square', 0.04); setTimeout(() => bip(1320, 0.12, 'square', 0.04), 60); },
     salto: () => bip(300, 0.18, 'sine', 0.05, 520),
     golpe: () => bip(160, 0.3, 'sawtooth', 0.09, 60),
     boom: () => { bip(90, 0.8, 'sawtooth', 0.14, 30); bip(60, 1.0, 'sine', 0.2, 25); },
     alarma: () => bip(740, 0.25, 'square', 0.05, 520),
     tomar: () => bip(520, 0.15, 'triangle', 0.07, 1040),
     latido: () => { bip(62, 0.12, 'sine', 0.22); setTimeout(() => bip(52, 0.1, 'sine', 0.16), 140); },
     meta: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => bip(f, 0.3, 'triangle', 0.08), i * 110))
  }[k] || (() => {}))();
}
$('son').onclick = () => { sonOn = !sonOn; $('son').textContent = sonOn ? '🔊' : '🔇'; };
$('bpausa').onclick = () => pausar();
$('bcam').onclick = () => { if (L) L.jug.terceraPersona = !L.jug.terceraPersona; };
$('reglas').onclick = () => $('reglas').classList.toggle('abierto');

/* ---------- utilidades de escena ---------- */
function limpiarEscena() {
  for (const o of [...escena.children]) if (o !== cam) { escena.remove(o); }
  cam.children.slice().forEach(c => cam.remove(c));
  escena.fog = null; escena.background = null; escena.environment = null;
}
function texSol(color) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.18, color); g.addColorStop(0.45, 'rgba(255,230,180,.25)'); g.addColorStop(1, 'rgba(255,220,160,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function sinNiebla(o) { o.traverse(m => { if (m.material) { m.material = m.material.clone(); m.material.fog = false; } }); return o; }
function entorno3D(arriba, horizonte) {        // mapa de reflejos para el visor y los metales
  const s = new THREE.Scene(); s.add(cupula(arriba, horizonte, 50));
  const sol = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); sol.position.set(20, 25, -10); s.add(sol);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: new THREE.Color(horizonte).multiplyScalar(0.5) })); suelo.rotation.x = -Math.PI / 2; suelo.position.y = -2; s.add(suelo);
  return pmrem.fromScene(s, 0.02).texture;
}

/* ================= PORTADA: la Tierra y el astronauta ================= */
function escenaPortada() {
  limpiarEscena();
  const g = new THREE.Group(); escena.add(g);
  g.add(estrellas(3000, 800));
  escena.environment = entorno3D('#0a1530', '#203a6a');
  const ancho = innerWidth >= 1100; const tierra = crearTierra(3.2); tierra.position.set(ancho ? 3.6 : 2.4, -0.6, -9); g.add(tierra);
  const astro = crearAstronauta(); astro.position.set(ancho ? 1.3 : -1.25, -0.85, -3.6); astro.rotation.set(0.15, Math.PI + 0.55, 0.2); g.add(astro);
  animarAstronauta(astro, 0.6, 0.5, true, 0);
  const sol = new THREE.DirectionalLight(0xfff4e0, 3.4); sol.position.set(-2.5, 2.5, 6); g.add(sol);
  g.add(new THREE.AmbientLight(0x30406a, 0.5));
  const brillo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texSol('#fff2c8'), blending: THREE.AdditiveBlending, depthWrite: false }));
  brillo.position.set(-40, 20, 25); brillo.scale.setScalar(30); g.add(brillo);
  cam.position.set(0, 0, 0); cam.rotation.set(0, 0, 0);
  fondo = { tierra, astro };
}

/* ================= SUPERFICIE ================= */
const NOMBRE_BLOQUE = id => {
  if (id === 0) return 'Suelo';
  if (B.auto.includes(id) || id === B.vidrio || id === B.rueda) return 'Auto';
  if (B.muro.includes(id) || id === B.ventana || id === B.techoR || id === B.techoG) return 'Casa';
  return ({ [B.asfalto]: 'Calle', [B.vereda]: 'Vereda', [B.pasto]: 'Pasto', [B.franja]: 'Paso de cebra', [B.linea]: 'Calle', [B.bus]: 'Bus', [B.cono]: 'Cono',
    [B.hormigon]: 'Plataforma de lanzamiento', [B.tronco]: 'Árbol', [B.hojas]: 'Árbol', [B.torre]: 'Torre', [B.torreR]: 'Torre', [B.regolito]: 'Regolito', [B.regOsc]: 'Regolito',
    [B.rocaL]: 'Roca lunar', [B.oroL]: 'Módulo lunar', [B.panel]: 'Base', [B.marte]: 'Suelo marciano', [B.marteC]: 'Polvo marciano', [B.rocaM]: 'Meseta', [B.rocaMO]: 'Roca basáltica',
    [B.luzPista]: 'Baliza', [B.roca]: 'Roca' })[id] || 'Bloque';
};
const GEO = {
  moneda: new THREE.CylinderGeometry(0.32, 0.32, 0.07, 20).rotateX(Math.PI / 2),
  gema: new THREE.OctahedronGeometry(0.32),
  racion: new THREE.SphereGeometry(0.26, 16, 12),
  oxigeno: new THREE.CapsuleGeometry(0.17, 0.42, 6, 14),
  botiquin: new THREE.BoxGeometry(0.5, 0.36, 0.3)
};
const MAT = {
  moneda: new THREE.MeshStandardMaterial({ color: 0xffc857, emissive: 0x6a4a10, metalness: 0.8, roughness: 0.25 }),
  gema: new THREE.MeshStandardMaterial({ color: 0x5de0ff, emissive: 0x1a6a88, metalness: 0.3, roughness: 0.1 }),
  racion: new THREE.MeshStandardMaterial({ color: 0xe63946, emissive: 0x3a0808, roughness: 0.4 }),
  oxigeno: new THREE.MeshStandardMaterial({ color: 0x3a86ff, emissive: 0x0a2a66, metalness: 0.5, roughness: 0.3 }),
  botiquin: new THREE.MeshStandardMaterial({ color: 0xf4f4f2, emissive: 0x333333, roughness: 0.5 })
};
function mallaObjeto(tipo) {
  const g = new THREE.Group(), m = new THREE.Mesh(GEO[tipo], MAT[tipo]); m.castShadow = true; g.add(m);
  if (tipo === 'racion') { const h = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3fa66b })); h.scale.set(1.6, 0.5, 0.8); h.position.y = 0.27; g.add(h); }
  if (tipo === 'oxigeno') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.1, 14), new THREE.MeshStandardMaterial({ color: 0xffffff })); g.add(b); }
  if (tipo === 'botiquin') { const cr = new THREE.MeshBasicMaterial({ color: 0xe63946 }); const a = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.31), cr), b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.31), cr); g.add(a, b); }
  // halo para verlos de lejos
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX_HALO, color: MAT[tipo].color, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(1.3); g.add(halo);
  return g;
}
const TEX_HALO = texSol('#ffffff');

function mallaAuto(color) {
  const g = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(4, 0.9, 1.9), new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.35 })); cuerpo.position.y = 0.75; g.add(cuerpo);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 1.7), new THREE.MeshStandardMaterial({ color: 0x22324a, metalness: 0.6, roughness: 0.15 })); cab.position.set(-0.2, 1.5, 0); g.add(cab);
  for (const [x, z] of [[1.3, 0.9], [-1.3, 0.9], [1.3, -0.9], [-1.3, -0.9]]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 14).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x151515 })); r.position.set(x, 0.38, z); g.add(r); }
  for (const z of [0.6, -0.6]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.4), new THREE.MeshBasicMaterial({ color: 0xfff3c4 })); f.position.set(2.01, 0.8, z); g.add(f); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function mallaDron() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.6), new THREE.MeshStandardMaterial({ color: 0x2b2f36, metalness: 0.6, roughness: 0.4 })));
  const helices = [];
  for (const [x, z] of [[0.45, 0.45], [-0.45, 0.45], [0.45, -0.45], [-0.45, -0.45]]) {
    const brazo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 6), new THREE.MeshStandardMaterial({ color: 0x555 })); brazo.rotation.z = Math.PI / 2; brazo.rotation.y = Math.atan2(z, x); brazo.position.set(x / 2, 0, z / 2); g.add(brazo);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.01, 0.06), new THREE.MeshStandardMaterial({ color: 0xdddddd })); h.position.set(x, 0.12, z); g.add(h); helices.push(h);
  }
  const luz = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3344 })); luz.position.y = -0.12; g.add(luz);
  g.userData.helices = helices; g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function mallaRemolino() {
  const n = 700, p = new Float32Array(n * 3), r = semilla(5);
  for (let i = 0; i < n; i++) { const h = r() * 11, a = r() * Math.PI * 2, rad = 0.4 + h * 0.18 + r() * 0.4; p.set([Math.cos(a) * rad, h, Math.sin(a) * rad], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xd9a070, size: 0.22, transparent: true, opacity: 0.65, depthWrite: false }));
}
function cupulas(x, y, z, verde) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const blanco = new THREE.MeshStandardMaterial({ color: 0xeef0f2, roughness: 0.5, metalness: 0.1 });
  const vidrio = new THREE.MeshStandardMaterial({ color: verde ? 0x9dffb0 : 0xa9dcff, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.45, emissive: verde ? 0x1e5a2a : 0x0a2244 });
  [[-5, -4, 3.2, blanco], [5, -4, 2.6, blanco], [0, -5.5, 2.2, vidrio], [-6, 3, 2.4, vidrio], [6, 3, 3, blanco]].forEach(([dx, dz, r, m]) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), m); d.position.set(dx, 0, dz); d.castShadow = true; g.add(d);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.4, 28), blanco); base.position.set(dx, 0.2, dz); g.add(base);
  });
  const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 10, 12).rotateZ(Math.PI / 2), blanco); tubo.position.set(0, 0.6, -4); g.add(tubo);
  const ant = new THREE.Group(); ant.position.set(-7.5, 0, -6.5); g.add(ant);
  const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), blanco); mastil.position.y = 2; ant.add(mastil);
  const plato = new THREE.Mesh(new THREE.SphereGeometry(1.2, 20, 10, 0, Math.PI * 2, 0, 0.9), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })); plato.position.y = 4.4; plato.rotation.x = 2.3; ant.add(plato);
  for (let i = 0; i < 3; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(3, 0.06, 1.6), new THREE.MeshStandardMaterial({ color: 0x1f3a8a, metalness: 0.6, roughness: 0.3 })); sp.position.set(-2 + i * 3.4, 1.2, 6.5); sp.rotation.x = -0.5; g.add(sp); }
  return g;
}

function cargarNivel(id) {
  limpiarEscena(); fondo = null;
  const ent = entorno(id, E.mej), N = NIVELES[id](ent), mundo = N.mundo, C = N.cielo;
  const cielo = new THREE.Group(); escena.add(cielo);                 // sigue a la cámara: queda "en el infinito"
  cielo.add(cupula(C.arriba, C.horizonte, 700));
  if (id !== 'tierra') cielo.add(estrellas(id === 'luna' ? 3500 : 600, 650));
  escena.fog = new THREE.Fog(C.niebla, ent.E.vis * 0.3, ent.E.vis);
  escena.environment = entorno3D(C.arriba, C.horizonte);
  // luz del Sol
  const dirSol = new THREE.Vector3(id === 'marte' ? 0.5 : -0.45, id === 'luna' ? 0.55 : 0.75, 0.35).normalize();
  const sol = new THREE.DirectionalLight(C.sol, id === 'luna' ? 3.4 : id === 'marte' ? 2.4 : 2.8);
  sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024);
  Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 }); sol.shadow.bias = -0.0008;
  escena.add(sol, sol.target);
  escena.add(new THREE.HemisphereLight(id === 'luna' ? 0x6a7384 : C.arriba, id === 'tierra' ? 0x5c6a40 : id === 'luna' ? 0x4a4a48 : C.horizonte, C.amb));   // en la Luna, la luz que rebota del suelo
  const disco = new THREE.Sprite(new THREE.SpriteMaterial({ map: texSol(C.sol), blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  disco.position.copy(dirSol).multiplyScalar(600); disco.scale.setScalar(id === 'marte' ? 45 : 70); cielo.add(disco);
  escena.add(mundo.construir());

  // decorados
  const dec = {};
  if (N.decor.includes('voyagerRampa')) { const v = crearVoyager(); v.scale.setScalar(1.5); v.rotation.x = -Math.PI / 2; v.position.set(N.meta.x, N.meta.y + 4.2, N.meta.z); /* motores abajo, antena al cielo */ v.traverse(o => { if (o.isMesh) o.castShadow = true; }); v.userData.llamas.forEach(l => l.visible = false); escena.add(v); dec.voyager = v; }
  if (N.decor.includes('k77')) { const k = sinNiebla(asteroideK77()); k.position.set(160, 300, -420); cielo.add(k); dec.k77 = k; }
  if (N.decor.includes('tierraCielo')) { const t = sinNiebla(crearTierra(34)); t.position.set(-170, 110, -380); cielo.add(t); dec.tierra = t; }
  if (N.decor.includes('fobos')) { const f = sinNiebla(roca(5, 8, 0x6a5a50)); f.position.set(-150, 180, -300); cielo.add(f); }
  if (N.decor.includes('cupulas')) escena.add(cupulas(N.meta.x, N.meta.y, N.meta.z, id === 'marte'));

  // objetos sobre el terreno
  const items = N.items.map(it => {
    const y = mundo.alto(Math.floor(it.x), Math.floor(it.z)) + 0.8, m = mallaObjeto(it.tipo);
    m.position.set(it.x, y, it.z); escena.add(m);
    return { ...it, y, m, vivo: true };
  });
  // peligros en movimiento
  const peligros = N.peligros.map(p => {
    let m;
    if (p.tipo === 'auto') { m = mallaAuto(p.color); if (p.v < 0) m.rotation.y = Math.PI; }
    else if (p.tipo === 'dron') m = mallaDron();
    else m = mallaRemolino();
    escena.add(m);
    return { ...p, m, x0: p.x };
  });

  // astronauta, brazo y ayudas del rayo
  const astro = crearAstronauta(); escena.add(astro);
  const brazo = crearBrazoFP(); cam.add(brazo);
  const rayoGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]);
  const rayo = new THREE.Line(rayoGeo, new THREE.LineDashedMaterial({ color: 0x7fd6ff, dashSize: 0.5, gapSize: 0.5, transparent: true, opacity: 0.75, fog: false, depthWrite: false }));
  rayo.frustumCulled = false; escena.add(rayo);
  const marca = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 24), new THREE.MeshBasicMaterial({ color: 0x7fd6ff, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthTest: false, fog: false }));
  marca.renderOrder = 5; escena.add(marca);
  const arcoGeo = new THREE.BufferGeometry(); arcoGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 400), 3));
  const arco = new THREE.Line(arcoGeo, new THREE.LineDashedMaterial({ color: 0x8dffb0, dashSize: 0.25, gapSize: 0.25, transparent: true, opacity: 0.55, fog: false, depthWrite: false }));
  arco.frustumCulled = false; escena.add(arco);
  const caida = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.45, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x8dffb0, transparent: true, opacity: 0.8, fog: false, depthWrite: false }));
  escena.add(caida);

  const jug = new Jugador();
  const y0 = mundo.alto(Math.floor(N.inicio.x), Math.floor(N.inicio.z));
  jug.ponerEn(N.inicio.x, y0, N.inicio.z, N.inicio.yaw, ctrl);
  L = { id, ent, N, mundo, cielo, sol, dirSol, dec, items, peligros, astro, brazo, rayo, marca, arco, caida, jug,
    cuerpo: nuevoCuerpo(), t: 0, monedas: 0, frag: N.fragmentos ? { t: 6, caen: [] } : null, invul: 0, hudT: 0, arcoT: 0, foco: null,
    usar: 0, parts: [] };
}

/* rayo de foco: el primer choque contra bloques u objetos */
const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _tmp = new THREE.Vector3();
function rayoEsfera(o, d, c, r) {
  _tmp.subVectors(c, o); const b = _tmp.dot(d), q = _tmp.lengthSq() - r * r, disc = b * b - q;
  if (disc < 0) return Infinity; const t = b - Math.sqrt(disc); return t > 0 ? t : Infinity;
}
function enfocar() {
  cam.getWorldPosition(_o); cam.getWorldDirection(_d);
  const max = L.ent.E.alcanceFoco;
  const h = L.mundo.rayo(_o, _d, max);
  let mejor = h ? { t: h.t, nombre: NOMBRE_BLOQUE(h.tipo), n: h.n } : null;
  for (const it of L.items) if (it.vivo) { const t = rayoEsfera(_o, _d, it.m.position, 0.55); if (t < (mejor?.t ?? max)) mejor = { t, nombre: OBJ[it.tipo].nombre, item: it }; }
  for (const p of L.peligros) { const r = p.tipo === 'auto' ? 1.6 : p.tipo === 'dron' ? 0.8 : 2.2; _tmp.copy(p.m.position); _tmp.y += p.tipo === 'auto' ? 0.9 : p.tipo === 'remolino' ? 3 : 0;
    const t = rayoEsfera(_o, _d, _tmp, r); if (t < (mejor?.t ?? max)) mejor = { t, nombre: { auto: 'Auto en movimiento ⚠', dron: 'Dron de evacuación ⚠', remolino: 'Remolino de polvo ⚠' }[p.tipo] }; }
  if (L.frag) for (const f of L.frag.caen) { const t = rayoEsfera(_o, _d, f.roca.position, 1.2); if (t < (mejor?.t ?? max)) mejor = { t, nombre: 'Fragmento del ' + (L.id === 'tierra' ? 'K-77' : 'meteorito') + ' ⚠' }; }
  if (mejor) mejor.p = _o.clone().addScaledVector(_d, mejor.t);
  return mejor;
}

/* trayectoria prevista del salto (parábola con la g del lugar) hasta tocar un bloque */
function calcularArco() {
  const c = L.jug.c, G = L.ent.G;
  let vx = c.vx, vz = c.vz;
  if (Math.hypot(vx, vz) < 0.5) { const s = Math.sin(ctrl.yaw), co = Math.cos(ctrl.yaw); vx = -s * G.vCaminar; vz = -co * G.vCaminar; }
  const pos = L.arco.geometry.attributes.position.array;
  // posición exacta en cada instante: x = x₀ + v·t ; y = y₀ + v₀·t − g·t²/2
  const y0 = c.y, dt = Math.max(0.02, G.tVuelo / 70);
  let x = c.x, y = y0, z = c.z, n = 0, hMax = y0;
  for (let i = 1; i < 400; i++) {
    pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = z; n++;
    const t = i * dt; x = c.x + vx * t; z = c.z + vz * t; y = y0 + G.vSalto * t - 0.5 * G.g * t * t;
    hMax = Math.max(hMax, y);
    if (G.vSalto - G.g * t < 0 && L.mundo.solido(Math.floor(x), Math.floor(y), Math.floor(z))) { y = Math.floor(y) + 1; break; }
  }
  hMax = Math.max(hMax, y0 + G.hSalto);   // el punto más alto exacto: v₀²/2g
  pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = z; n++;
  L.arco.geometry.setDrawRange(0, n); L.arco.geometry.attributes.position.needsUpdate = true; L.arco.computeLineDistances();
  L.caida.position.set(x, y + 0.03, z);
  L.saltoPrev = { largo: Math.hypot(x - c.x, z - c.z), alto: hMax - c.y };
}

/* fragmentos que caen del cielo: el rayo marca dónde van a caer */
function nuevoFragmento() {
  const c = L.jug.c, s = Math.sin(ctrl.yaw), co = Math.cos(ctrl.yaw), r = Math.random;
  const ad = 6 + r() * 14, lat = (r() - 0.5) * 12;
  let x = c.x - s * ad + co * lat, z = c.z - co * ad - s * lat;
  x = Math.max(3, Math.min(L.mundo.sx - 4, x)); z = Math.max(3, Math.min(L.mundo.sz - 4, z));
  if (Math.hypot(x - L.N.meta.x, z - L.N.meta.z) < 14) return;
  const y = L.mundo.alto(Math.floor(x), Math.floor(z));
  const fin = new THREE.Vector3(x, y, z), ini = fin.clone().add(new THREE.Vector3(30 + r() * 20, 140, -40));
  const rocaM = sinNiebla(roca(0.9, Math.floor(r() * 1e5), 0x3a2b24));
  const fuego = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff8a3a, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  rocaM.add(fuego); rocaM.position.copy(ini); escena.add(rocaM);
  const linea = new THREE.Line(new THREE.BufferGeometry().setFromPoints([ini, fin]), new THREE.LineDashedMaterial({ color: 0xff5544, dashSize: 1, gapSize: 1, transparent: true, opacity: 0.6, fog: false }));
  linea.computeLineDistances(); escena.add(linea);
  const aro = new THREE.Mesh(new THREE.RingGeometry(L.N.fragmentos.radio, L.N.fragmentos.radio + 0.35, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.8, depthWrite: false, fog: false }));
  aro.position.set(x, y + 0.04, z); escena.add(aro);
  L.frag.caen.push({ ini, fin, roca: rocaM, linea, aro, t: 0, dur: 2.4 });
  sonido('alarma');
}
function impactoFragmento(f) {
  const R = L.N.fragmentos.radio, m = L.mundo, { x, y, z } = f.fin;
  for (let yy = Math.floor(y - R); yy <= Math.ceil(y + R); yy++) for (let zz = Math.floor(z - R); zz <= Math.ceil(z + R); zz++) for (let xx = Math.floor(x - R); xx <= Math.ceil(x + R); xx++)
    if (yy >= 1 && Math.hypot(xx + 0.5 - x, (yy + 0.5 - y) * 1.3, zz + 0.5 - z) < R) m.set(xx, yy, zz, 0);
  m.actualizarZona(Math.floor(x - R), Math.floor(z - R), Math.ceil(x + R), Math.ceil(z + R));
  for (const it of L.items) if (it.vivo && Math.hypot(it.x - x, it.z - z) < R + 1) { it.y = m.alto(Math.floor(it.x), Math.floor(it.z)) + 0.8; }
  const c = L.jug.c, d = Math.hypot(c.x - x, c.y - y, c.z - z);
  if (d < R + 2.5) {
    golpe(L.cuerpo, 0.4 + 1.1 * (1 - d / (R + 2.5)));
    const k = 7 / Math.max(1, d); c.vx += (c.x - x) * k; c.vz += (c.z - z) * k; c.vy = Math.max(c.vy, 4);
    marcarDano();
  }
  // polvo de la explosión
  const n = 120, p = new Float32Array(n * 3), v = [];
  for (let i = 0; i < n; i++) { p.set([x, y + 0.3, z], i * 3); v.push(new THREE.Vector3((Math.random() - 0.5) * 9, 3 + Math.random() * 9, (Math.random() - 0.5) * 9)); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: L.id === 'tierra' ? 0xffa060 : 0xb9b9b4, size: 0.28, transparent: true, opacity: 1, depthWrite: false }));
  escena.add(pts); L.parts.push({ pts, v, t: 0 });
  sonido('boom');
}

let danoT = 0;
function marcarDano() { danoT = 0.6; sonido('golpe'); }

function actualizarSuperficie(dt) {
  const { ent, mundo, jug, cuerpo } = L, c = jug.c;
  L.t += dt; L.invul -= dt;
  const yAntes = jug.suelo;
  jug.actualizar(dt, ent, mundo, ctrl, cuerpo);
  if (jug.saltoAhora) { sonido('salto'); jug.saltoAhora = false; }
  if (jug.ultImpacto > 0) { marcarDano(); aviso('¡Caída fuerte!', 'Llegaste al suelo a ' + fmt(jug.aterrizo) + ' m/s (más de ' + fmt(ent.G.vSegura) + ' m/s duele)'); jug.ultImpacto = 0; }
  pasoCuerpo(cuerpo, dt, ent, jug.esf);

  // peligros
  for (const p of L.peligros) {
    if (p.tipo === 'auto') {
      p.x += p.v * dt; if (p.x > mundo.sx + 8) p.x = -8; if (p.x < -8) p.x = mundo.sx + 8;
      p.m.position.set(p.x, L.N.suelo, p.z);
      if (L.invul <= 0 && Math.abs(c.x - p.x) < 2.3 && Math.abs(c.z - p.z) < 1.3 && c.y < L.N.suelo + 1.9) {
        golpe(cuerpo, 1); c.vx += Math.sign(p.v) * 9; c.vy = 5; L.invul = 1.2; marcarDano(); aviso('¡Cuidado con los autos!', 'Cruza las calles mirando a los lados');
      }
    } else if (p.tipo === 'dron') {
      p.m.position.set(p.x0 + Math.sin(L.t * p.vel + p.fase) * p.amp, p.y + Math.sin(L.t * 2.3 + p.fase) * 0.4, p.z + Math.cos(L.t * p.vel * 0.7 + p.fase) * 3);
      for (const h of p.m.userData.helices) h.rotation.y += dt * 40;
      if (L.invul <= 0 && p.m.position.distanceTo(_tmp.set(c.x, c.y + 1, c.z)) < 1.2) { golpe(cuerpo, 0.6); L.invul = 1; marcarDano(); }
    } else {   // remolino
      p.x += p.vx * dt; p.z += p.vz * dt;
      if (p.x < 6 || p.x > mundo.sx - 6) p.vx *= -1; if (p.z < 20 || p.z > mundo.sz - 10) p.vz *= -1;
      const y = mundo.alto(Math.floor(p.x), Math.floor(p.z)); p.m.position.set(p.x, y, p.z); p.m.rotation.y += dt * 4;
      const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz);
      if (d < 3 && c.y < y + 10) {
        c.vx += (-dz / d * 9 + dx / d * 2) * dt * 3; c.vz += (dx / d * 9 + dz / d * 2) * dt * 3; c.vy += 6 * dt;
        cuerpo.nervio -= 5 * dt; if (!L.avRem) { aviso('¡Remolino de polvo!', 'El polvo marciano tiene carga eléctrica: daña tu sistema nervioso'); L.avRem = true; }
      }
    }
  }
  // objetos
  const iman = E.mej.iman;
  for (const it of L.items) {
    if (!it.vivo) continue;
    it.m.rotation.y += dt * 2; it.m.position.y = it.y + Math.sin(L.t * 2 + it.x) * 0.12;
    const d = Math.hypot(c.x - it.x, c.y + 0.9 - it.y, c.z - it.z);
    if (iman && (it.tipo === 'moneda' || it.tipo === 'gema') && d < 3 + iman * 2) { it.x += (c.x - it.x) * dt * 5; it.z += (c.z - it.z) * dt * 5; it.y += (c.y + 0.9 - it.y) * dt * 5; it.m.position.x = it.x; it.m.position.z = it.z; }
    if (d < 1.3) tomar(it);
  }
  // fragmentos
  if (L.frag) {
    L.frag.t -= dt;
    if (L.frag.t <= 0 && L.t > 5) { nuevoFragmento(); L.frag.t = L.N.fragmentos.cada * (0.7 + Math.random() * 0.6); }
    for (let i = L.frag.caen.length - 1; i >= 0; i--) {
      const f = L.frag.caen[i]; f.t += dt; const u = Math.min(1, f.t / f.dur);
      f.roca.position.lerpVectors(f.ini, f.fin, u * u); f.roca.rotation.x += dt * 5;
      f.aro.material.opacity = 0.4 + 0.5 * Math.abs(Math.sin(f.t * 8));
      if (u >= 1) { impactoFragmento(f); for (const o of [f.roca, f.linea, f.aro]) escena.remove(o); L.frag.caen.splice(i, 1); }
    }
  }
  for (let i = L.parts.length - 1; i >= 0; i--) {
    const P = L.parts[i]; P.t += dt; const a = P.pts.geometry.attributes.position;
    for (let k = 0; k < P.v.length; k++) { P.v[k].y -= ent.G.g * dt; a.array[k * 3] += P.v[k].x * dt; a.array[k * 3 + 1] += P.v[k].y * dt; a.array[k * 3 + 2] += P.v[k].z * dt; }
    a.needsUpdate = true; P.pts.material.opacity = 1 - P.t / 1.6;
    if (P.t > 1.6) { escena.remove(P.pts); L.parts.splice(i, 1); }
  }

  // acciones de un toque
  if (ctrl.pulso('camara')) jug.terceraPersona = !jug.terceraPersona;
  const usar = ctrl.pulso('usar');
  if (ctrl.pulso('pausa')) { pausar(); return; }

  // cámara, astronauta y brazo
  jug.camara(cam, ctrl, mundo, cuerpo.nervio);
  cam.updateMatrixWorld(true);
  L.astro.visible = jug.terceraPersona;
  L.astro.position.set(c.x, c.y, c.z); L.astro.rotation.y = ctrl.yaw;
  animarAstronauta(L.astro, jug.paso * Math.PI, Math.min(1, (jug.vh || 0) / 5), !jug.suelo, L.t);
  L.brazo.visible = !jug.terceraPersona;
  L.usar = usar ? 0.3 : Math.max(0, L.usar - dt);
  const bob = jug.suelo ? Math.sin(jug.paso * Math.PI) * 0.025 * Math.min(1, jug.vh / 3) : 0;
  L.brazo.position.set(0.34 + bob * 0.6, -0.32 + Math.abs(bob), -0.45 - L.usar * 0.5);
  L.brazo.rotation.x = 0.1 + L.usar * 1.2;
  L.cielo.position.copy(cam.position);
  L.sol.position.set(c.x, c.y, c.z).addScaledVector(L.dirSol, 60); L.sol.target.position.set(c.x, c.y, c.z);
  if (L.dec.tierra) { L.dec.tierra.rotation.y += dt * 0.02; }
  if (L.dec.k77) { const u = L.N.limite ? Math.min(1, L.t / L.N.limite) : 0; L.dec.k77.scale.setScalar(3 + u * u * 26); L.dec.k77.rotation.z += dt * 0.1; L.dec.k77.userData.roca.rotation.y += dt * 0.3; }

  // rayo de foco: hasta donde alcanza la vista (E)
  const f = enfocar(); L.foco = f;
  if (f) {
    const mano = new THREE.Vector3(jug.terceraPersona ? 0.25 : 0.3, jug.terceraPersona ? -0.2 : -0.28, -0.75).applyMatrix4(cam.matrixWorld);
    if (jug.terceraPersona) mano.set(c.x + Math.cos(ctrl.yaw) * 0.35, c.y + 1.1, c.z - Math.sin(ctrl.yaw) * 0.35);
    const ra = L.rayo.geometry.attributes.position; ra.setXYZ(0, mano.x, mano.y, mano.z); ra.setXYZ(1, f.p.x, f.p.y, f.p.z); ra.needsUpdate = true;
    L.rayo.computeLineDistances(); L.rayo.visible = true;
    L.marca.position.copy(f.p); L.marca.lookAt(cam.position); L.marca.scale.setScalar(Math.max(1, f.t * 0.12)); L.marca.visible = true;
    if (usar && f.item && f.t <= L.ent.E.alcanceBrazo + 1.5) tomar(f.item);
    else if (usar && f.item) aviso('Muy lejos', 'El brazo alcanza ' + fmt(L.ent.E.alcanceBrazo) + ' m y eso está a ' + fmt(f.t) + ' m');
  } else { L.rayo.visible = false; L.marca.visible = false; }
  // trayectoria del salto
  L.arcoT -= dt;
  if (jug.suelo && L.arcoT <= 0) { calcularArco(); L.arcoT = 0.12; }
  L.caida.visible = jug.suelo; L.arco.visible = jug.suelo && jug.terceraPersona;   // en 1ª persona la parábola se ve de canto: basta el punto de caída

  // latido audible cuando el pulso está alto
  if (cuerpo.bpm > 115 && performance.now() - ultLatido > 60000 / cuerpo.bpm) { ultLatido = performance.now(); sonido('latido'); }

  // ¿meta?
  const M = L.N.meta;
  if (Math.hypot(c.x - M.x, c.z - M.z) < M.r && c.y >= M.y - 0.6) return terminarSuperficie();
  const caido = sistemaCaido(cuerpo);
  if (caido) return fallo('sistema', caido);
  if (L.N.limite && L.t >= L.N.limite) return fallo('tiempo');

  L.hudT -= dt; if (L.hudT <= 0) { pintarHUD(); L.hudT = 0.1; }
}
function tomar(it) {
  it.vivo = false; escena.remove(it.m);
  if (it.tipo === 'moneda' || it.tipo === 'gema') { L.monedas += it.tipo === 'gema' ? 5 : 1; sonido('moneda'); }
  else { consumir(L.cuerpo, it.tipo); sonido('tomar'); aviso(OBJ[it.tipo].nombre, ''); }
}

/* ---------- HUD ---------- */
let avisoT = 0;
function aviso(a, b) { $('aviso').innerHTML = '<b>' + a + '</b>' + (b || ''); avisoT = 3.2; }
function barra(s, v) { return `<div class="sis${v < 25 ? ' mal' : ''}" title="${s.nombre}"><span>${s.icono}</span><span class="bar"><i style="width:${v}%;background:${s.color}"></i></span><span>${Math.round(v)}</span></div>`; }
function pintarHUD() {
  const { ent, cuerpo, jug } = L, G = ent.G, T = ent.T, Ev = ent.E;
  const sp = L.saltoPrev;
  $('reglas').innerHTML =
    `<div class="f"><span class="l">G</span><span><em>${fmt(G.g, 2)}</em> m/s² <small>(${fmt(G.relTierra, 2)} g)</small><span class="det"><br>paso <em>${fmt(G.vCaminar)}</em> m/s · salto <em>${fmt(sp ? sp.alto : G.hSalto, 2)}</em> m alto, <em>${fmt(sp ? sp.largo : G.dSalto)}</em> m largo<br>caer duele desde <em>${fmt(G.hSegura)}</em> m</span></span></div>` +
    `<div class="f"><span class="l">T</span><span>tu reloj <em>${reloj(cuerpo.tau)}</em><span class="det"> · misión <em>${reloj(L.t)}</em><br>dτ/dt = <em>${fmt(T.factor, 3)}</em> <small>(real: −${fmt(T.usPorDiaReal, 1)} µs/día)</small></span></span></div>` +
    `<div class="f"><span class="l">E</span><span>foco <em>${L.foco ? fmt(L.foco.t) + ' m' : '—'}</em> · visión <em>${Ev.vis} m</em><span class="det"><br>horizonte real <em>${fmt(Ev.horizonte / 1000)} km</em> · relieve <em>${fmt(Ev.relieve)} m</em></span></span></div>` +
    `<div class="f"><span class="l">V</span><span>❤️ <em>${Math.round(cuerpo.bpm)}</em> lpm${cuerpo.bpm > 140 ? ' <b style="color:#ff6b6b">¡baja el ritmo!</b>' : ''}</span></div>` +
    SISTEMAS.map(s => barra(s, cuerpo[s.id])).join('');
  $('foco').textContent = L.foco ? L.foco.nombre + ' · ' + fmt(L.foco.t) + ' m' : '';
  const r = $('reloj');
  if (L.N.limite) { const q = L.N.limite - L.t; r.textContent = '☄ Impacto del K-77 en ' + reloj(q).slice(0, 5); r.classList.toggle('alerta', q < 30); }
  else { r.textContent = NOMBRE[L.id] + ' · misión ' + reloj(L.t).slice(0, 5); r.classList.remove('alerta'); }
  // rumbo a la meta
  const M = L.N.meta, c = jug.c, dx = M.x - c.x, dz = M.z - c.z;
  let ang = Math.atan2(-dx, -dz) - ctrl.yaw; ang = Math.atan2(Math.sin(ang), Math.cos(ang));
  const fl = ['↑', '↖', '←', '↙', '↓', '↘', '→', '↗'][((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8];
  $('rumbo').textContent = fl + ' ' + M.nombre + ' · ' + Math.round(Math.hypot(dx, dz)) + ' m';
  $('monedas').textContent = '🪙 ' + (E.dinero + L.monedas);
}

/* ================= VUELO ================= */
let entEspacio = null;
function iniciarVuelo() {
  limpiarEscena(); fondo = null; L = null;
  const tramo = RUTA[E.etapa] + '>' + RUTA[E.etapa + 1];
  V = new Vuelo(escena, tramo, E.mej); V.cuerpo = nuevoCuerpo(); entEspacio = entorno('espacio', E.mej);
  escena.environment = entorno3D('#050814', '#101830');
  modo('vuelo'); ctrl.activo = true;
  aviso('Rumbo a ' + ART[RUTA[E.etapa + 1]], 'Esquiva meteoritos y basura espacial · microgravedad: g = 0');
  if (!esTactil) lienzo.requestPointerLock?.();
}
function actualizarVuelo(dt) {
  const r = V.actualizar(dt, ctrl, cam, sonido);
  pasoCuerpo(V.cuerpo, dt, entEspacio, 0.3);
  if (V.sacudir > 0.45) marcarDano();
  if (ctrl.pulso('pausa')) { pausar(); return; }
  ctrl.pulso('usar'); ctrl.pulso('camara');
  const cu = V.cuerpo, T = entEspacio.T;
  $('reglas').innerHTML =
    `<div class="f"><span class="l">G</span><span><em>0</em> m/s² <small>microgravedad</small><span class="det"><br>la nave cae junto contigo: flotas</span></span></div>` +
    `<div class="f"><span class="l">T</span><span>tu reloj <em>${reloj(cu.tau)}</em><span class="det"> · dτ/dt = <em>${fmt(T.factor, 3)}</em><br>lejos de los planetas el tiempo no se dilata</span></span></div>` +
    `<div class="f"><span class="l">E</span><span>casco <em>${'■'.repeat(Math.max(0, V.casco))}${'□'.repeat(Math.max(0, 3 + E.mej.escudo - V.casco))}</em></span></div>` +
    `<div class="f"><span class="l">V</span><span>❤️ <em>${Math.round(cu.bpm)}</em> lpm</span></div>` + SISTEMAS.map(s => barra(s, cu[s.id])).join('');
  $('reloj').textContent = 'Rumbo a ' + ART[RUTA[E.etapa + 1]]; $('reloj').classList.remove('alerta');
  $('rumbo').textContent = Math.round(V.progreso * 100) + ' % del tramo';
  $('barra').firstElementChild.style.width = (V.progreso * 100) + '%';
  $('monedas').textContent = '🪙 ' + (E.dinero + V.monedas);
  $('foco').textContent = '';
  if (r === 'llegada') { E.dinero += V.monedas; V.quitar(escena); V = null; E.etapa++; sonido('meta'); pantallaIntro(); }
  else if (r === 'destruida') { V.quitar(escena); V = null; fallo('nave'); }
}

/* ================= PANTALLAS ================= */
function modo(m) {
  E.modo = m;
  const juego = m === 'superficie' || m === 'vuelo';
  hud.hidden = !juego; tactil.hidden = !(esTactil && juego);
  $('mira').style.display = $('foco').style.display = m === 'superficie' ? '' : 'none';
  $('barra').hidden = m !== 'vuelo';
  tactil.querySelectorAll('[data-a="usar"],[data-a="camara"],[data-a="correr"]').forEach(b => b.style.visibility = m === 'vuelo' ? 'hidden' : '');
  tactil.querySelector('[data-a="saltar"]').style.visibility = m === 'vuelo' ? 'hidden' : '';
}
function mostrar(html) { panel.innerHTML = html; ov.hidden = false; panel.scrollTop = 0; ctrl.activo = false; if (document.pointerLockElement) document.exitPointerLock(); }
function chipsRuta(hechas) { return '<div class="ruta">' + RUTA.map((id, i) => '<span class="' + (i < hechas ? 'ok' : i === hechas ? 'sig' : '') + '">' + NOMBRE[id] + '</span>').join('<i>→</i>') + '</div>'; }
const CONTROLES = esTactil
  ? '<p><b>Controles:</b> el joystick de la izquierda mueve, arrastra el dedo a la derecha para mirar. <b>SALTAR</b>, <b>CORRER</b>, 👁 cambia la cámara y ✋ toma lo que apunta el rayo. Si chocas con un bloque de 1 m, saltas solo.</p>'
  : '<p><b>Controles:</b> haz clic en el juego para capturar el mouse. <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas para moverte, el mouse para mirar, <kbd>Espacio</kbd> salta, <kbd>Shift</kbd> corre, <kbd>C</kbd> cambia a 3ª persona, clic o <kbd>E</kbd> toma lo que apunta el rayo. <kbd>Esc</kbd> pausa.</p>';

function pantallaTitulo() {
  modo('titulo'); escenaPortada();
  mostrar('<a class="volver" href="../../">← El Mundo de Felipe</a>' +
    '<h1>RUTA ESTELAR</h1><p class="sub">MISIÓN VOYAGER · MAPA 1: SISTEMA SOLAR INTERIOR</p>' + chipsRuta(-1) +
    '<div class="historia"><b>Año 2077.</b> El asteroide <b>K-77</b> va en rumbo de choque con la Tierra: el impacto es en minutos. ' +
    'Alguien tiene que sacar del planeta el <b>Disco de Oro II</b>, la memoria de la Tierra: semillas, ADN, libros y música. La única nave lista es la Voyager, reconstruida para llevar tripulación.<br><br>' +
    'Cruza la ciudad en plena evacuación, sube a la Voyager antes del impacto y lleva el disco a la colonia de Marte, con escala en la base lunar.</div>' +
    '<p><b>Las reglas del juego son las de la física.</b> Cada lugar tiene 4 variables: <b>G</b> gravedad (cómo caminas, saltas y caes), <b>T</b> tiempo (tu reloj se atrasa en un pozo de gravedad), <b>E</b> espacio (hasta dónde ves y llega tu rayo de foco) y <b>V</b> vitalidad (tu corazón, nervios, pulmones, digestión y huesos).</p>' +
    CONTROLES + '<button class="gr" data-acc="empezar">Comenzar misión</button>');
}
function pantallaIntro() {
  modo('intro');
  const id = RUTA[E.etapa], e = entorno(id, E.mej), c = CUERPOS[id];
  if (!fondo) escenaPortada();
  const meta = { tierra: 'Llega a la Voyager, en la plataforma de lanzamiento, antes de que impacte el K-77. Caen fragmentos: el rayo rojo marca dónde.',
    luna: 'Llega a la base lunar. No hay aire: tu tanque de O₂ se gasta, más rápido si corres. Busca tanques 🟦 y raciones 🍎.',
    marte: 'Lleva el Disco de Oro II a la colonia. Cuidado con los remolinos de polvo y con el oxígeno.' }[id];
  mostrar(`<h2>Entorno: ${ART[id]}</h2>${chipsRuta(E.etapa)}<p class="relato">${meta}</p>
    <div class="vars">
      <div><b>G · GRAVEDAD</b><em>${fmt(e.G.g, 2)} m/s²</em> (${fmt(e.G.relTierra, 2)} g)<br>caminas a ${fmt(e.G.vCaminar)} m/s<br>saltas ${fmt(e.G.hSalto, 2)} m de alto y ${fmt(e.G.dSalto)} m de largo</div>
      <div><b>T · TIEMPO</b>tu reloj avanza <em>${fmt(e.T.factor, 3)} s</em> por cada segundo de misión<br><small>en la realidad se atrasa ${fmt(e.T.usPorDiaReal, 1)} µs por día</small></div>
      <div><b>E · ESPACIO</b>horizonte real ${fmt(e.E.horizonte / 1000)} km<br>ves y enfocas hasta <em>${e.E.vis} m</em><br>relieve de hasta ${fmt(e.E.relieve)} m</div>
      <div><b>V · VITALIDAD</b>${c.atm ? 'aire respirable' : '<em>sin aire: usas el tanque</em>'}<br>radiación ${c.escudo >= 1 ? 'bloqueada' : 'alta: ' + Math.round((1 - c.escudo) * 100) + ' %'}<br>${e.V.atrofia > 0 ? 'poca carga: tus músculos se debilitan' : 'tu corazón trabaja contra 1 g'}</div>
    </div>
    <p><small>¿Por qué? El salto es v₀²/2g, el tiempo se dilata con √(1 − g/${60}) (escala del juego) y el horizonte es √(2Rh).</small></p>
    ${CONTROLES}<button class="gr" data-acc="bajar">${E.etapa === 0 ? 'Salir a la calle' : 'Bajar al terreno'}</button>`);
}
function pantallaHangar() {
  modo('hangar'); escenaPortada();
  const sig = RUTA[E.etapa + 1];
  let h = '<h2>' + (E.etapa === 0 ? 'A bordo de la Voyager' : 'Base lunar') + '</h2><p class="relato">' + RELATO_HANGAR[E.etapa] + '</p><p>Recolectaste ' + (E.ultimas || 0) + ' en esta etapa. Saldo: <span class="saldo">' + E.dinero + ' monedas</span></p>' + chipsRuta(E.etapa + 1) + '<div class="tienda">';
  for (const k in MEJORAS) {
    const n = E.mej[k], max = n >= COSTOS.length, costo = COSTOS[n];
    h += '<div class="item"><b>' + MEJORAS[k].nombre + ' <span class="niv">' + '●'.repeat(n) + '○'.repeat(COSTOS.length - n) + '</span></b>' +
      '<button data-acc="comprar" data-k="' + k + '"' + (max || E.dinero < costo ? ' disabled' : '') + '>' + (max ? 'Máximo' : costo + ' monedas') + '</button><small>' + MEJORAS[k].desc + '</small></div>';
  }
  h += '</div><div class="dato"><b>Dato real.</b> ' + DATOS[E.etapa] + '</div><button class="gr" data-acc="despegar">Despegar hacia ' + ART[sig] + '</button>';
  mostrar(h);
}
function pantallaFin() {
  modo('fin'); escenaPortada();
  mostrar('<h2>El Disco de Oro II está a salvo</h2>' + chipsRuta(RUTA.length) +
    '<p class="relato">Llegaste a la colonia de Marte. La memoria de la Tierra quedó resguardada y la humanidad tiene un lugar desde donde volver a empezar.</p>' +
    '<p>Terminaste con <span class="saldo">' + E.dinero + ' monedas</span>.</p>' +
    '<div class="dato"><b>Lo que pasó en la realidad.</b> Las Voyager nunca fueron a la Luna ni a Marte: pasaron por Júpiter y Saturno, y la Voyager 2 siguió a Urano y Neptuno. En 2012 la Voyager 1 llegó al espacio interestelar; la Voyager 2, en 2018. Cada una lleva un Disco de Oro real con sonidos, música e imágenes de la Tierra.</div>' +
    '<div class="dato"><b>¿Y el asteroide?</b> El K-77 es inventado. En 2022 la misión DART de la NASA chocó a propósito con el asteroide Dimorphos y logró cambiar su órbita: la primera prueba de defensa planetaria.</div>' +
    '<button class="gr" data-acc="reiniciar">Jugar de nuevo</button>');
}
function fallo(causa, sistema) {
  const enVuelo = causa === 'nave';
  if (L) { E.ultimas = 0; L = null; }
  modo('fallo'); escenaPortada();
  const motivo = causa === 'tiempo' ? 'El K-77 llegó antes de que alcanzaras la Voyager.' : enVuelo ? 'La nave no resistió más impactos.' : CAUSAS[sistema];
  const s = sistema && SISTEMAS.find(x => x.id === sistema);
  mostrar('<h2>Misión interrumpida</h2>' + (s ? '<p><b>' + s.icono + ' Falló el sistema ' + s.nombre.toLowerCase() + '.</b></p>' : '') + '<p>' + motivo +
    '</p><p>Conservas tu saldo de <span class="saldo">' + E.dinero + ' monedas</span> y tus mejoras.</p><button class="gr" data-acc="' + (enVuelo ? 'revuelo' : 'reintentar') + '">Reintentar etapa</button>');
}
function terminarSuperficie() {
  sonido('meta');
  E.ultimas = L.monedas; E.dinero += L.monedas; L = null;
  if (E.etapa >= RUTA.length - 1) pantallaFin(); else pantallaHangar();
}
function pausar() {
  if (E.modo !== 'superficie' && E.modo !== 'vuelo') return;
  E.pausaDe = E.modo; modo('pausa');
  mostrar('<h2>Pausa</h2>' + CONTROLES + '<button class="gr" data-acc="seguir">Continuar</button><button class="gr sec" data-acc="salir">Salir al inicio</button>');
}
function iniciarSuperficie() {
  cargarNivel(RUTA[E.etapa]); modo('superficie'); ctrl.activo = true;
  aviso('Entorno: ' + ART[RUTA[E.etapa]], 'g = ' + fmt(L.ent.G.g, 2) + ' m/s² · tu salto: ' + fmt(L.ent.G.hSalto, 2) + ' m');
  if (!esTactil) lienzo.requestPointerLock?.();
}
panel.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const acc = b.dataset.acc;
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (err) { } }
  if (acc === 'comprar') {
    const k = b.dataset.k, costo = COSTOS[E.mej[k]];
    if (costo !== undefined && E.dinero >= costo) { E.dinero -= costo; E.mej[k]++; sonido('tomar'); pantallaHangar(); }
    return;
  }
  ov.hidden = true;
  if (acc === 'empezar') { E.etapa = 0; pantallaIntro(); }
  else if (acc === 'bajar' || acc === 'reintentar') iniciarSuperficie();
  else if (acc === 'despegar' || acc === 'revuelo') iniciarVuelo();
  else if (acc === 'seguir') { modo(E.pausaDe); ctrl.activo = true; if (!esTactil) lienzo.requestPointerLock?.(); }
  else if (acc === 'salir') { L = null; if (V) { V.quitar(escena); V = null; } pantallaTitulo(); }
  else if (acc === 'reiniciar') { E.dinero = 0; for (const k in E.mej) E.mej[k] = 0; E.etapa = 0; pantallaIntro(); }
});

/* ---------- bucle ---------- */
let antes = 0;
function cuadro(ms) {
  const dt = Math.min(0.05, (ms - antes) / 1000 || 0); antes = ms; E.t += dt;
  if (avisoT > 0) { avisoT -= dt; if (avisoT <= 0) $('aviso').innerHTML = ''; }
  if (danoT > 0) danoT -= dt;
  const baja = L && SISTEMAS.some(s => L.cuerpo[s.id] < 25);
  $('dano').style.boxShadow = `inset 0 0 ${danoT > 0 ? 160 : 120}px rgba(255,30,40,${danoT > 0 ? 0.55 : baja ? 0.18 + 0.12 * Math.sin(E.t * 5) : 0})`;
  if (E.modo === 'superficie' && L) actualizarSuperficie(dt);
  else if (E.modo === 'vuelo' && V) actualizarVuelo(dt);
  else if (fondo) {
    fondo.tierra.rotation.y += dt * 0.05; fondo.tierra.userData.nubes.rotation.y += dt * 0.012;
    fondo.astro.rotation.y = Math.PI + 0.55 + Math.sin(E.t * 0.3) * 0.35; fondo.astro.position.y = -0.85 + Math.sin(E.t * 0.7) * 0.08;
    cam.position.set(0, 0, 0); cam.rotation.set(0, 0, 0);
  }
  rend.render(escena, cam);
  requestAnimationFrame(cuadro);
}
pantallaTitulo(); requestAnimationFrame(cuadro);
window.__rs = { E, get L() { return L; }, get V() { return V; }, ctrl, cam };   // para pruebas
