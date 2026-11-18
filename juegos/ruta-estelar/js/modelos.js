/* =====================================================================
   RUTA ESTELAR · MODELOS 3D
   Astronauta (con animación de marcha), brazo en primera persona, Tierra
   (continentes reales, nubes y atmósfera), Luna, Marte, Voyager, asteroide
   K-77, rocas y basura espacial. Todo con primitivas: no hay archivos .glb.
   ===================================================================== */
import * as THREE from '../lib/three.module.min.js';

const BASE = new URL('..', import.meta.url).href;
const cargador = new THREE.TextureLoader();
const textura = (f, srgb = true) => {
  const t = cargador.load(BASE + 'tex/' + f);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
};

/* ---------- materiales comunes ---------- */
const M = {
  traje:   new THREE.MeshStandardMaterial({ color: 0xf1f2f0, roughness: 0.78, metalness: 0 }),
  trajeSo: new THREE.MeshStandardMaterial({ color: 0xd9dcdc, roughness: 0.85 }),
  junta:   new THREE.MeshStandardMaterial({ color: 0x6f7682, roughness: 0.55, metalness: 0.4 }),
  metal:   new THREE.MeshStandardMaterial({ color: 0xb9c0c9, roughness: 0.3, metalness: 0.9 }),
  visor:   new THREE.MeshStandardMaterial({ color: 0xffb84a, roughness: 0.12, metalness: 0.85, emissive: 0x4a2c00, envMapIntensity: 1.6 }),
  bota:    new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: 0.9 }),
  azul:    new THREE.MeshStandardMaterial({ color: 0x2a6fdb, roughness: 0.5 }),
  rojo:    new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.5 }),
  luzVerde:new THREE.MeshBasicMaterial({ color: 0x5dff9a }),
  luzRoja: new THREE.MeshBasicMaterial({ color: 0xff4d4d }),
  oro:     new THREE.MeshStandardMaterial({ color: 0xc8a046, roughness: 0.35, metalness: 0.85 }),
  blanco:  new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.5, metalness: 0.1 }),
  oscuro:  new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.6, metalness: 0.5 })
};
const malla = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const capsula = (r, l, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 14), m);

/* Bandera de Chile para el hombro (canvas). */
function texBandera() {
  const c = document.createElement('canvas'); c.width = 96; c.height = 64; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 96, 32); x.fillStyle = '#d52b1e'; x.fillRect(0, 32, 96, 32);
  x.fillStyle = '#0039a6'; x.fillRect(0, 0, 32, 32);
  x.fillStyle = '#fff'; x.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 4.5 : 11, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(16 + r * Math.cos(a), 16 + r * Math.sin(a)); }
  x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ================= ASTRONAUTA (1,8 m, pies en y = 0, mira hacia -z) ================= */
export function crearAstronauta() {
  const raiz = new THREE.Group();
  const cuerpo = new THREE.Group(); raiz.add(cuerpo);
  const P = {};

  // piernas: cadera → muslo → rodilla → canilla → bota
  for (const lado of [-1, 1]) {
    const cadera = new THREE.Group(); cadera.position.set(0.12 * lado, 0.92, 0); cuerpo.add(cadera);
    const muslo = capsula(0.1, 0.3, M.traje); muslo.position.y = -0.22; cadera.add(muslo);
    const rod = new THREE.Group(); rod.position.y = -0.44; cadera.add(rod);
    rod.add(malla(new THREE.SphereGeometry(0.095, 12, 10), M.trajeSo));
    const canilla = capsula(0.092, 0.26, M.traje); canilla.position.y = -0.2; rod.add(canilla);
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.018, 6, 16), M.junta); anillo.rotation.x = Math.PI / 2; anillo.position.y = -0.36; rod.add(anillo);
    const bota = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.12, 0.3), M.bota); bota.position.set(0, -0.42, -0.04); rod.add(bota);
    const suela = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.31), M.junta); suela.position.set(0, -0.48, -0.04); rod.add(suela);
    P['cadera' + lado] = cadera; P['rodilla' + lado] = rod;
  }
  // torso
  const torso = capsula(0.22, 0.32, M.traje); torso.scale.set(1, 1, 0.78); torso.position.y = 1.2; cuerpo.add(torso);
  const cintura = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 24), M.junta); cintura.rotation.x = Math.PI / 2; cintura.scale.set(1, 0.8, 1); cintura.position.y = 0.97; cuerpo.add(cintura);
  // panel del pecho (DCM) con luces
  const dcm = malla(new THREE.BoxGeometry(0.26, 0.13, 0.07), M.trajeSo, 0, 1.18, -0.19); cuerpo.add(dcm);
  [[-0.08, M.luzVerde], [-0.03, M.azul], [0.03, M.rojo], [0.08, M.oscuro]].forEach(([x, m]) => cuerpo.add(malla(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 10).rotateX(Math.PI / 2), m, x, 1.19, -0.23)));
  const franja = malla(new THREE.BoxGeometry(0.44, 0.04, 0.36), M.rojo, 0, 1.38, 0); franja.scale.z = 1; cuerpo.add(franja);
  // mochila de soporte vital (PLSS)
  const plss = malla(new THREE.BoxGeometry(0.44, 0.56, 0.2), M.trajeSo, 0, 1.22, 0.24); cuerpo.add(plss);
  cuerpo.add(malla(new THREE.BoxGeometry(0.4, 0.12, 0.17), M.blanco, 0, 1.53, 0.24));
  for (const lado of [-1, 1]) {
    const tubo = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 6, 14, Math.PI), M.junta);
    tubo.position.set(0.15 * lado, 1.08, -0.05); tubo.rotation.y = Math.PI / 2; cuerpo.add(tubo);
  }
  cuerpo.add(malla(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), M.metal, 0.16, 1.62, 0.3));   // antena
  // detalles de la mochila: rejilla de ventilación, franjas, manilla y válvulas
  cuerpo.add(malla(new THREE.BoxGeometry(0.3, 0.2, 0.012), M.oscuro, 0, 1.12, 0.346));
  for (let i = 0; i < 5; i++) cuerpo.add(malla(new THREE.BoxGeometry(0.26, 0.012, 0.016), M.junta, 0, 1.04 + i * 0.04, 0.35));
  for (const lado of [-1, 1]) cuerpo.add(malla(new THREE.BoxGeometry(0.03, 0.5, 0.205), lado < 0 ? M.azul : M.rojo, 0.205 * lado, 1.22, 0.24));
  cuerpo.add(malla(new THREE.TorusGeometry(0.07, 0.014, 6, 14, Math.PI), new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.4 }), 0, 1.38, 0.35));
  for (const lado of [-1, 1]) cuerpo.add(malla(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10).rotateX(Math.PI / 2), M.metal, 0.12 * lado, 1.3, 0.352));
  // número de misión en el pecho
  cuerpo.add(malla(new THREE.SphereGeometry(0.02, 8, 6), M.luzRoja, 0.16, 1.78, 0.3));

  // cabeza: anillo del cuello, casco, visor dorado y luces
  const cabeza = new THREE.Group(); cabeza.position.y = 1.56; cuerpo.add(cabeza);
  const cuello = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.035, 8, 24), M.metal); cuello.rotation.x = Math.PI / 2; cabeza.add(cuello);
  const casco = new THREE.Mesh(new THREE.SphereGeometry(0.2, 28, 20), M.blanco); casco.position.y = 0.15; cabeza.add(casco);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.205, 28, 16, Math.PI * 1.17, Math.PI * 0.66, Math.PI * 0.27, Math.PI * 0.42), M.visor);
  visor.position.y = 0.15; cabeza.add(visor);
  const marco = new THREE.Mesh(new THREE.TorusGeometry(0.168, 0.016, 6, 30, Math.PI * 1.1), M.trajeSo);
  marco.position.set(0, 0.17, -0.07); marco.rotation.set(0.25, 0, Math.PI * 0.95); cabeza.add(marco);
  for (const lado of [-1, 1]) {
    const lamp = malla(new THREE.BoxGeometry(0.05, 0.04, 0.07), M.junta, 0.17 * lado, 0.25, -0.06); cabeza.add(lamp);
    cabeza.add(malla(new THREE.CircleGeometry(0.016, 10), new THREE.MeshBasicMaterial({ color: 0xfff6d5 }), 0.17 * lado, 0.25, -0.096).rotateY(Math.PI));
  }
  P.cabeza = cabeza;

  // brazos: hombro → brazo → codo → antebrazo → guante
  const bandera = new THREE.MeshStandardMaterial({ map: texBandera(), roughness: 0.7 });
  for (const lado of [-1, 1]) {
    const hombro = new THREE.Group(); hombro.position.set(0.29 * lado, 1.38, 0); cuerpo.add(hombro);
    hombro.add(malla(new THREE.SphereGeometry(0.1, 14, 10), M.traje));
    const brazo = capsula(0.085, 0.22, M.traje); brazo.position.y = -0.17; hombro.add(brazo);
    if (lado === -1) { const p = malla(new THREE.PlaneGeometry(0.11, 0.075), bandera, -0.088, -0.1, 0); p.rotation.y = -Math.PI / 2; hombro.add(p); }
    const codo = new THREE.Group(); codo.position.y = -0.34; hombro.add(codo);
    const ante = capsula(0.078, 0.2, M.traje); ante.position.y = -0.14; codo.add(ante);
    const pun = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 14), M.junta); pun.rotation.x = Math.PI / 2; pun.position.y = -0.27; codo.add(pun);
    const guante = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), M.bota); guante.scale.set(0.9, 1.25, 0.75); guante.position.y = -0.36; codo.add(guante);
    P['hombro' + lado] = hombro; P['codo' + lado] = codo;
  }
  raiz.traverse(o => { if (o.isMesh) o.castShadow = true; });
  raiz.userData.P = P; raiz.userData.cuerpo = cuerpo;
  return raiz;
}

/* Animación: fase de paso (rad), rapidez 0-1, en el aire o no. */
export function animarAstronauta(a, fase, rapidez, enAire, t) {
  const P = a.userData.P, amp = enAire ? 0.35 : 0.75 * rapidez;
  const s = Math.sin(fase);
  P['cadera-1'].rotation.x = s * amp; P['cadera1'].rotation.x = -s * amp;
  P['rodilla-1'].rotation.x = Math.max(0, -Math.cos(fase)) * amp * 1.2 + (enAire ? 0.5 : 0);
  P['rodilla1'].rotation.x = Math.max(0, Math.cos(fase)) * amp * 1.2 + (enAire ? 0.5 : 0);
  P['hombro-1'].rotation.x = -s * amp * 0.8; P['hombro1'].rotation.x = s * amp * 0.8;
  P['hombro-1'].rotation.z = enAire ? -0.5 : -0.12; P['hombro1'].rotation.z = enAire ? 0.5 : 0.12;
  P['codo-1'].rotation.x = -0.35 - rapidez * 0.4; P['codo1'].rotation.x = -0.35 - rapidez * 0.4;
  a.userData.cuerpo.position.y = enAire ? 0 : Math.abs(Math.cos(fase)) * 0.035 * rapidez;
  P.cabeza.rotation.y = Math.sin(t * 0.4) * 0.06;
}

/* Brazo derecho en primera persona (se cuelga de la cámara). */
export function crearBrazoFP() {
  const g = new THREE.Group();
  const ante = capsula(0.075, 0.42, M.traje); ante.rotation.x = Math.PI / 2; g.add(ante);
  const pun = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.022, 6, 14), M.junta); pun.position.z = -0.27; g.add(pun);
  const guante = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), M.bota); guante.scale.set(1, 0.75, 1.3); guante.position.z = -0.36; g.add(guante);
  const pulgar = capsula(0.026, 0.06, M.bota); pulgar.position.set(-0.07, 0.01, -0.34); pulgar.rotation.z = 0.8; g.add(pulgar);
  const pant = malla(new THREE.BoxGeometry(0.07, 0.02, 0.1), M.oscuro, 0, 0.08, -0.12); g.add(pant);
  g.add(malla(new THREE.PlaneGeometry(0.05, 0.075), new THREE.MeshBasicMaterial({ color: 0x5dff9a }), 0, 0.092, -0.12).rotateX(-Math.PI / 2));
  g.scale.setScalar(0.8); g.position.set(0.34, -0.32, -0.45); g.rotation.set(0.1, -0.15, 0);
  g.traverse(o => { if (o.isMesh) { o.renderOrder = 10; o.material = o.material.clone(); o.material.depthTest = false; o.material.fog = false; } });
  return g;
}

/* ================= TIERRA ================= */
export function crearTierra(radio = 1) {
  const g = new THREE.Group();
  const sup = new THREE.Mesh(new THREE.SphereGeometry(radio, 96, 64),
    new THREE.MeshPhongMaterial({ map: textura('tierra.jpg'), shininess: 18, specular: 0x334466 }));
  g.add(sup);
  const nubes = new THREE.Mesh(new THREE.SphereGeometry(radio * 1.012, 96, 64),
    new THREE.MeshLambertMaterial({ color: 0xffffff, alphaMap: textura('nubes.jpg', false), transparent: true, depthWrite: false }));
  g.add(nubes);
  g.add(atmosfera(radio * 1.07, new THREE.Color(0.35, 0.6, 1.0), 3.2));
  g.userData.nubes = nubes;
  g.rotation.z = 0.41;            // inclinación del eje: 23,4°
  return g;
}
/* Halo de atmósfera: más brillo en el borde (efecto Fresnel). */
export function atmosfera(r, color, potencia = 3) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 64, 40), new THREE.ShaderMaterial({
    uniforms: { c: { value: color }, p: { value: potencia } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; uniform float p; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - abs(dot(vN, vV)), p); gl_FragColor = vec4(c, 1.) * f * 1.4; }',
    blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true, depthWrite: false
  }));
}

/* ================= LUNA y MARTE (texturas generadas) ================= */
function texPlaneta(tipo) {
  const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const rnd = semilla(tipo === 'luna' ? 5 : 9);
  if (tipo === 'luna') {
    x.fillStyle = '#9a9a98'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(70,70,74,.55)'; x.beginPath(); x.ellipse(rnd() * W, 60 + rnd() * 120, 30 + rnd() * 70, 18 + rnd() * 40, rnd() * 3, 0, 7); x.fill(); }
    for (let i = 0; i < 380; i++) {
      const cx = rnd() * W, cy = rnd() * H, r = 1 + rnd() ** 3 * 16;
      x.fillStyle = 'rgba(40,40,40,.35)'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
      x.strokeStyle = 'rgba(220,220,215,.35)'; x.lineWidth = 1; x.beginPath(); x.arc(cx - r * 0.15, cy - r * 0.15, r, 3.3, 5.6); x.stroke();
    }
  } else {
    const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#c9875f'); gr.addColorStop(0.5, '#b3542f'); gr.addColorStop(1, '#a8603e');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${70 + rnd() * 30},${30 + rnd() * 15},20,.35)`; x.beginPath(); x.ellipse(rnd() * W, 70 + rnd() * 110, 20 + rnd() * 80, 8 + rnd() * 28, rnd() * 3, 0, 7); x.fill(); }
    x.fillStyle = 'rgba(60,20,10,.4)'; x.fillRect(120, 120, 150, 6);         // Valles Marineris
    x.fillStyle = '#f3ece6'; x.fillRect(0, 0, W, 10); x.fillRect(0, H - 8, W, 8);   // casquetes polares
    x.fillStyle = 'rgba(230,140,100,.6)'; x.beginPath(); x.arc(90, 105, 12, 0, 7); x.fill();   // Monte Olimpo
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function crearPlaneta(tipo, radio = 1) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(radio, 64, 40), new THREE.MeshLambertMaterial({ map: texPlaneta(tipo) })));
  if (tipo === 'marte') g.add(atmosfera(radio * 1.04, new THREE.Color(1, 0.55, 0.35), 4));
  return g;
}

/* ================= VOYAGER (versión tripulada del juego) =================
   Antena de 3,7 m, cuerpo de 10 lados con aislante dorado, brazos del
   magnetómetro y de los generadores nucleares (RTG), plataforma de
   instrumentos y, agregado para la historia, un módulo para la tripulación. */
export function crearVoyager() {
  const v = new THREE.Group();
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.5, 10), M.oro); bus.rotation.x = Math.PI / 2; v.add(bus);
  // antena parabólica (mira hacia +z, a la Tierra)
  const perfil = []; for (let i = 0; i <= 16; i++) { const r = 1.85 * i / 16; perfil.push(new THREE.Vector2(r, r * r * 0.12)); }
  const plato = new THREE.Mesh(new THREE.LatheGeometry(perfil, 40), new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.45, side: THREE.DoubleSide }));
  plato.rotation.x = -Math.PI / 2; plato.position.z = 0.4; v.add(plato);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const p = malla(new THREE.CylinderGeometry(0.015, 0.015, 1.25, 5), M.oscuro, Math.cos(a) * 0.5, Math.sin(a) * 0.5, 1.15); p.lookAt(0, 0, 1.75); p.rotateX(Math.PI / 2); v.add(p); }
  v.add(malla(new THREE.CylinderGeometry(0.06, 0.1, 0.2, 10).rotateX(Math.PI / 2), M.oscuro, 0, 0, 1.75));
  // brazo del magnetómetro (largo y fino)
  const mag = malla(new THREE.CylinderGeometry(0.025, 0.025, 6.5, 6), M.oscuro, 0, 0, 0); mag.rotation.z = Math.PI / 2; mag.position.set(3.6, 0.5, -0.1); v.add(mag);
  // brazo de los RTG (3 cilindros con aletas)
  const rtgB = malla(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6), M.metal); rtgB.rotation.z = Math.PI / 2; rtgB.position.set(-1.9, -0.3, 0); v.add(rtgB);
  for (let i = 0; i < 3; i++) {
    const r = malla(new THREE.CylinderGeometry(0.15, 0.15, 0.45, 8), M.oscuro); r.rotation.z = Math.PI / 2; r.position.set(-1.9 - i * 0.5, -0.3, 0); v.add(r);
    for (let k = 0; k < 4; k++) { const al = malla(new THREE.BoxGeometry(0.4, 0.02, 0.38), M.oscuro); al.position.copy(r.position); al.rotation.x = k * Math.PI / 4; v.add(al); }
  }
  // plataforma de instrumentos
  const ci = malla(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6), M.metal); ci.rotation.z = Math.PI / 2; ci.position.set(1.7, -0.4, 0); v.add(ci);
  v.add(malla(new THREE.BoxGeometry(0.4, 0.35, 0.4), M.oro, 2.8, -0.4, 0));
  v.add(malla(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 10).rotateX(Math.PI / 2), M.oscuro, 2.8, -0.15, -0.3));
  // módulo de tripulación detrás del cuerpo (agregado para la historia), con ventanas iluminadas
  const mod = malla(new THREE.CylinderGeometry(0.62, 0.75, 1.5, 16).rotateX(Math.PI / 2), M.blanco, 0, 0, -1.0); v.add(mod);
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const w = malla(new THREE.CircleGeometry(0.1, 12), new THREE.MeshBasicMaterial({ color: 0xbfe3ff }), Math.cos(a) * 0.7, Math.sin(a) * 0.7, -0.9); w.lookAt(Math.cos(a) * 3, Math.sin(a) * 3, -0.9); v.add(w); }
  v.add(malla(new THREE.CylinderGeometry(0.66, 0.66, 0.12, 16).rotateX(Math.PI / 2), M.oscuro, 0, 0, -1.8));
  // motores en la cola del módulo (el chorro sale hacia -z) y luz de estado (roja con un golpe)
  const tob = new THREE.MeshBasicMaterial({ color: 0x7fc8ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const llamas = [];
  for (const [x, y] of [[0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]]) {
    v.add(malla(new THREE.CylinderGeometry(0.1, 0.16, 0.25, 12).rotateX(Math.PI / 2), M.metal, x, y, -1.95));
    const l = malla(new THREE.ConeGeometry(0.13, 0.9, 12).rotateX(-Math.PI / 2), tob, x, y, -2.5); v.add(l); llamas.push(l);
  }
  const luz = malla(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0x5dff9a }), 0, 0.75, -1.2); v.add(luz);
  v.userData = { llamas, luz };
  return v;
}

/* ================= ROCAS, ASTEROIDE Y BASURA ================= */
export function roca(r = 1, sem = 1, color = 0x6e6259) {
  const g = new THREE.IcosahedronGeometry(r, 2), p = g.attributes.position, rnd = semilla(sem);
  const desv = Array.from({ length: 6 }, () => [rnd() * 6, rnd() * 6, rnd() * 6, 0.12 + rnd() * 0.18]);
  for (let i = 0; i < p.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(p, i); let k = 1;
    for (const [a, b, c, s] of desv) k += Math.sin(v.x * a + v.y * b + v.z * c) * s / r;
    v.multiplyScalar(Math.max(0.6, k)); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true }));
}
export function asteroideK77() {
  const g = new THREE.Group();
  const r = roca(1, 77, 0x4a3b33); g.add(r);
  const brillo = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  g.add(brillo);
  const cola = new THREE.Mesh(new THREE.ConeGeometry(1.3, 9, 20, 1, true).translate(0, 4.5, 0), new THREE.MeshBasicMaterial({ color: 0xffa35a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  g.add(cola); g.userData = { roca: r, cola };
  return g;
}
export function basuraEspacial(sem) {
  const g = new THREE.Group(), rnd = semilla(sem);
  g.add(malla(new THREE.BoxGeometry(0.8, 0.8, 1.1), rnd() < 0.5 ? M.oro : M.metal));
  const panel = new THREE.MeshStandardMaterial({ color: 0x1f3a8a, roughness: 0.3, metalness: 0.6 });
  if (rnd() < 0.8) { const p = malla(new THREE.BoxGeometry(2.2 + rnd(), 0.04, 0.8), panel, 1.6, 0, 0); p.rotation.x = rnd(); g.add(p); }
  if (rnd() < 0.5) { const p = malla(new THREE.BoxGeometry(2.0, 0.04, 0.8), panel, -1.5, 0, 0); p.rotation.x = rnd(); g.add(p); }
  return g;
}

/* ================= CIELO ================= */
export function estrellas(n = 2500, r = 900) {
  const p = new Float32Array(n * 3), col = new Float32Array(n * 3), rnd = semilla(3);
  for (let i = 0; i < n; i++) {
    const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    p.set([Math.cos(a) * s * r, u * r, Math.sin(a) * s * r], i * 3);
    const b = 0.5 + rnd() * 0.5, tono = rnd();
    col.set([b * (tono > 0.8 ? 1 : 0.85), b * 0.9, b * (tono < 0.2 ? 0.8 : 1)], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, fog: false, depthWrite: false }));
}
/* Cúpula de cielo con degradado (cenit → horizonte). */
export function cupula(arriba, horizonte, r = 600) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.ShaderMaterial({
    uniforms: { a: { value: new THREE.Color(arriba) }, h: { value: new THREE.Color(horizonte) } },
    vertexShader: 'varying float y; void main(){ y = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 a; uniform vec3 h; varying float y; void main(){ gl_FragColor = vec4(mix(h, a, pow(clamp(y,0.,1.), .55)), 1.); }',
    side: THREE.BackSide, depthWrite: false, fog: false
  }));
}

export function semilla(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
