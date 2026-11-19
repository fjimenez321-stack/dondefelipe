/* ============================================================
   ODISEA 3D · assets.js
   REGISTRO DE ASSETS 3D.
   Cada objeto del juego tiene un NOMBRE. El registro entrega un modelo:
     · si hay un .glb indicado en el manifiesto y carga bien → se usa ese;
     · si no → se usa el ESQUEMA BÁSICO (formas simples) de este archivo.
   Para cambiar un esquema por tu asset: pon el .glb en assets/ y escribe su ruta
   en el manifiesto (glb:'assets/combustible.glb'). No hay que tocar nada más.

   Convención de los modelos: origen centrado, ~2 unidades de diámetro,
   el "frente" de la nave mira hacia −Z.
   ============================================================ */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};

  const MANIFIESTO = {
    meteoroide:   { glb: 'assets/meteoroide_rocoso.glb' },   // asset real (paquete del desarrollador)
    nave:         { glb: null },                              // esquema básico por ahora
    combustible:  { glb: null },                              // carga de combustible (esquema)
    herramientas: { glb: null }                               // kit de herramientas (esquema)
  };

  const modelos = {};

  function glowTex(c0, c1) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const x = cv.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, c0); g.addColorStop(0.35, c1); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  }
  function glow(color, size, op) {
    const m = new THREE.SpriteMaterial({ map: glowTex('#ffffff', color), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op == null ? 0.9 : op });
    const s = new THREE.Sprite(m); s.scale.set(size, size, 1); return s;
  }

  /* ---------- ESQUEMAS BÁSICOS ---------- */
  function esquemaNave() {
    const g = new THREE.Group();
    const casco = new THREE.MeshStandardMaterial({ color: 0xd9dee8, roughness: 0.45, metalness: 0.45, flatShading: true });
    const acento = new THREE.MeshStandardMaterial({ color: 0xccff00, roughness: 0.5, metalness: 0.2, flatShading: true });
    const cuerpo = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4.4, 6).rotateX(-Math.PI / 2), casco); g.add(cuerpo);
    const forma = new THREE.Shape(); forma.moveTo(0.3, -0.5); forma.lineTo(3.7, 1.7); forma.lineTo(3.7, 2.3); forma.lineTo(0.3, 1.7); forma.closePath();
    const geoAla = new THREE.ExtrudeGeometry(forma, { depth: 0.14, bevelEnabled: false }).rotateX(Math.PI / 2); // plana, vista desde arriba
    for (const sg of [-1, 1]) {
      const ala = new THREE.Mesh(geoAla, casco); ala.scale.x = sg; ala.position.set(0, 0.07, 0); g.add(ala);
      const punta = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.34, 1.0), acento); punta.position.set(sg * 3.7, 0.05, 1.9); g.add(punta);
    }
    const aleta = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.3), casco); aleta.position.set(0, 0.7, 1.4); g.add(aleta);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 8), new THREE.MeshStandardMaterial({ color: 0x4fd8ff, emissive: 0x0a3a55, roughness: 0.2, metalness: 0.6 }));
    cab.scale.set(1, 0.7, 1.7); cab.position.set(0, 0.35, -0.2); g.add(cab);
    const fuego = glow('rgba(80,200,255,0.9)', 1.7, 0.8); fuego.position.set(0, 0, 2.4); fuego.name = 'motor'; g.add(fuego);
    g.scale.setScalar(1.3);
    return g;
  }
  function aura(color) { const a = glow(color, 7, 0.55); a.name = 'aura'; return a; }
  function esquemaCombustible() {
    const g = new THREE.Group();
    const lata = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.9, 14), new THREE.MeshStandardMaterial({ color: 0xff8a1f, emissive: 0x4a2000, roughness: 0.5, metalness: 0.3 }));
    g.add(lata);
    for (const sy of [-1, 1]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.22, 14), new THREE.MeshStandardMaterial({ color: 0x8c93a1, roughness: 0.4, metalness: 0.7 })); t.position.y = sy * 1.0; g.add(t); }
    const franja = new THREE.Mesh(new THREE.CylinderGeometry(0.87, 0.87, 0.35, 14), new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0x554400 })); g.add(franja);
    g.add(aura('rgba(255,150,40,0.8)'));
    return g;
  }
  function esquemaHerramientas() {
    const g = new THREE.Group();
    const caja = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.3, 1.3), new THREE.MeshStandardMaterial({ color: 0xd93636, emissive: 0x3a0808, roughness: 0.5, metalness: 0.3 }));
    g.add(caja);
    const blanco = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x555555 });
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 0.06), blanco); c1.position.z = 0.67;
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.06), blanco); c2.position.z = 0.67;
    const c3 = c1.clone(); c3.position.z = -0.67; const c4 = c2.clone(); c4.position.z = -0.67;
    g.add(c1, c2, c3, c4);
    const asa = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.09, 8, 16, Math.PI), new THREE.MeshStandardMaterial({ color: 0x8c93a1, metalness: 0.7, roughness: 0.4 }));
    asa.position.y = 0.65; g.add(asa);
    g.add(aura('rgba(90,255,150,0.8)'));
    return g;
  }
  function esquemaMeteoroide() { // por si el GLB no carga: roca irregular
    const geo = new THREE.IcosahedronGeometry(1, 2), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const k = 1 + 0.12 * Math.sin(p.getX(i) * 5 + p.getY(i) * 3) * Math.cos(p.getZ(i) * 4); p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); }
    geo.computeVertexNormals();
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x6b645c, roughness: 0.95, metalness: 0.05 })));
    return g;
  }
  const ESQUEMAS = { nave: esquemaNave, combustible: esquemaCombustible, herramientas: esquemaHerramientas, meteoroide: esquemaMeteoroide };

  /* ---------- carga ---------- */
  function b64ToBuf(b64) { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }

  function prepararGLB(scene) {
    scene.traverse(o => {
      if (!o.isMesh) return;
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();   // el GLB trae solo posición y color
      const m = o.material; m.flatShading = false; m.roughness = 0.92; m.metalness = 0.05; m.needsUpdate = true;
    });
    return scene;
  }

  function cargarUno(nombre, cb) {
    const def = MANIFIESTO[nombre];
    const usarEsquema = (why) => { if (why) console.info('[assets] ' + nombre + ': uso el esquema básico (' + why + ')'); modelos[nombre] = { crear: ESQUEMAS[nombre], real: false }; cb(); };
    if (!def.glb || !THREE.GLTFLoader) return usarEsquema(def.glb ? 'sin GLTFLoader' : null);
    const ok = (gltf) => { const base = prepararGLB(gltf.scene); modelos[nombre] = { crear: () => base.clone(true), real: true }; cb(); };
    const loader = new THREE.GLTFLoader();
    loader.load(def.glb, ok, undefined, () => {
      /* sin servidor (file://) la descarga falla: se usa la copia incrustada en assets_embed.js */
      const emb = OC3.GLB64 && OC3.GLB64[nombre];
      if (emb) { try { loader.parse(b64ToBuf(emb), '', ok, () => usarEsquema('GLB dañado')); } catch (e) { usarEsquema('GLB dañado'); } }
      else usarEsquema('no se pudo cargar ' + def.glb);
    });
  }

  function cargar(listo) {
    const nombres = Object.keys(MANIFIESTO); let n = 0;
    nombres.forEach(k => cargarUno(k, () => { if (++n === nombres.length) listo(); }));
  }
  /* devuelve una instancia nueva (THREE.Group) del modelo */
  function crear(nombre) { return modelos[nombre].crear(); }
  function esReal(nombre) { return !!(modelos[nombre] && modelos[nombre].real); }

  OC3.Assets = { MANIFIESTO, cargar, crear, esReal, glow, glowTex };
})(window);
