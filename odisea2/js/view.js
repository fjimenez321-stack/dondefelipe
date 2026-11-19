/* ============================================================
   ODISEA 3D · view.js
   VISTA: dibuja con three.js el estado de la simulación (sim.js).
   Cámara trasera estilo Star Fox 64: detrás y un poco arriba de la nave.
   No decide reglas: solo lee `sim` y consume `sim.eventos`.
   ============================================================ */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};
  const TILE = 70; // tamaño (u) de una baldosa de textura del suelo

  function texturaSuelo(base) {
    const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S;
    const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, S, S);
    let a = 12345; const r = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
    for (let i = 0; i < 2600; i++) { const g = 200 + r() * 55; x.fillStyle = 'rgba(' + g + ',' + g + ',' + g + ',' + (0.25 + r() * 0.4) + ')'; x.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2); }
    for (let i = 0; i < 16; i++) {
      const cx = r() * S, cy = r() * S, rad = 14 + r() * 50;
      for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
        const gr = x.createRadialGradient(cx + dx, cy + dy, rad * 0.2, cx + dx, cy + dy, rad);
        gr.addColorStop(0, 'rgba(70,70,70,.55)'); gr.addColorStop(0.8, 'rgba(110,110,110,.35)'); gr.addColorStop(0.92, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = gr; x.beginPath(); x.arc(cx + dx, cy + dy, rad, 0, 6.283); x.fill();
      }
    }
    x.strokeStyle = 'rgba(40,40,40,.22)'; x.lineWidth = 2; x.strokeRect(0, 0, S, S); // junta de baldosa: da sensación de velocidad
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
  }

  function crear(canvas, sim0) {
    let sim = sim0;
    const planeta = sim.planeta, razonSuelo = OC3.Atmosfera.razon(planeta, 0);
    const movil = matchMedia('(pointer:coarse)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !movil, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, movil ? 1.5 : 2));
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x02030a);
    /* La niebla es el único rastro visual de la atmósfera: depende de la densidad real
       (en Mercurio es 0 → vacío total). Aquí NO se dibuja atmósfera alguna. */
    const nieb = Math.min(0.012, razonSuelo * 0.0006);
    if (nieb > 0.00005) scene.fog = new THREE.FogExp2(new THREE.Color(planeta.visual.suelo).multiplyScalar(0.6), nieb);

    const camera = new THREE.PerspectiveCamera(68, 1, 0.5, 2600);
    camera.position.set(0, 44, 14);

    const sol = new THREE.DirectionalLight(0xfff4e0, 1.0 * planeta.visual.luz);
    sol.position.set(-60, 90, 40); scene.add(sol, sol.target);
    scene.add(new THREE.AmbientLight(0x9aa2c4, 0.6 + Math.min(0.35, razonSuelo * 0.3)));

    /* estrellas */
    const ne = 1200, pe = new Float32Array(ne * 3);
    for (let i = 0; i < ne; i++) { const u = Math.random() * 6.283, v = Math.acos(2 * Math.random() - 1), R = 1100; pe[i * 3] = R * Math.sin(v) * Math.cos(u); pe[i * 3 + 1] = Math.abs(R * Math.cos(v)) * 0.9 + 20; pe[i * 3 + 2] = R * Math.sin(v) * Math.sin(u); }
    const geoE = new THREE.BufferGeometry(); geoE.setAttribute('position', new THREE.BufferAttribute(pe, 3));
    const estrellas = new THREE.Points(geoE, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false })); scene.add(estrellas);

    /* suelo */
    const tex = texturaSuelo(); tex.repeat.set(2600 / TILE, 2400 / TILE);
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(2600, 2400), new THREE.MeshStandardMaterial({ map: tex, color: planeta.visual.suelo, roughness: 1, metalness: 0 }));
    suelo.rotation.x = -Math.PI / 2; scene.add(suelo);

    /* nave */
    let nave = null, motor = null, vitrina = false, giro = 0;
    function construirNave(eq) {
      if (nave) scene.remove(nave);
      nave = OC3.Assets.crearNave(eq); scene.add(nave); motor = nave.getObjectByName('motor');
    }
    construirNave(sim.equipo);

    /* jefe: sprites del Profesor Alex (billboards) con aura de estado */
    const IMG = OC3.IMG64 || {}, cargador = new THREE.TextureLoader(), PX = 0.3;   // unidades por píxel del sprite
    const TX = {}; ['alex_idle', 'alex_idle2', 'alex_habla', 'alex_onda'].forEach(k => { if (IMG[k]) TX[k] = cargador.load(IMG[k]); });
    function fijarMarco(sp, tex) { const im = tex.image; if (im && im.width) sp.scale.set(im.width * PX, im.height * PX, 1); }
    let alex = null, aura = null, escudo = null;
    function crearAlex() {
      if (!TX.alex_idle) return;
      alex = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.alex_idle, transparent: true, fog: false })); alex.scale.set(52, 32, 1);
      aura = OC3.Assets.glow('rgba(80,255,170,0.9)', 78, 0.0); aura.material.fog = false;
      escudo = OC3.Assets.glow('rgba(255,90,70,0.9)', 90, 0.0); escudo.material.fog = false;
      scene.add(aura, escudo, alex);
    }
    function actualizarAlex(dt) {
      const j = sim.jefe;
      if (!j) { if (alex) { alex.visible = aura.visible = escudo.visible = false; } return; }
      if (!alex) crearAlex(); if (!alex) return;
      alex.visible = !j.muerto; aura.visible = escudo.visible = !j.muerto;
      alex.position.set(j.pos.x, j.pos.y, j.pos.z); aura.position.copy(alex.position); escudo.position.copy(alex.position); aura.position.z += 1; escudo.position.z += 1.5;
      const bob = Math.sin(sim.t * 3) * 1.2; alex.position.y += bob;
      let k = 'alex_idle', pulso = 0.5 + 0.5 * Math.sin(sim.t * 6);
      if (j.fase === 'habla') k = 'alex_habla'; else if (Math.floor(sim.t * 1.6) % 2) k = 'alex_idle2';
      alex.material.map = TX[k]; fijarMarco(alex, TX[k]);
      alex.material.color.setRGB(1, 1 - j.golpe * 0.6, 1 - j.golpe * 0.6);
      aura.material.opacity = j.vulnerable ? 0.35 + 0.25 * pulso : (j.fase === 'aviso' ? 0.5 * (Math.floor(sim.t * 10) % 2) : 0);
      aura.material.color.set(j.fase === 'aviso' ? 0xffd24d : 0x5dffa0);
      escudo.material.opacity = j.fase === 'habla' ? 0.30 + 0.12 * pulso : 0;
    }

    /* objetos de la simulación */
    const mallas = new Map();
    const laserGeo = new THREE.CylinderGeometry(0.13, 0.13, 6, 6).rotateX(Math.PI / 2);
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x7dffa8 });
    function nuevaMalla(e) {
      let m;
      if (e.tipo === 'meteoro') { m = OC3.Assets.crear('meteoroide'); m.scale.setScalar(e.escala); }
      else if (e.tipo === 'laser') { m = new THREE.Mesh(laserGeo, laserMat); }
      else if (e.tipo === 'rayo') {   // rayo de Alex: pentagrama de notas + núcleo brillante
        m = new THREE.Group();
        const onda = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.alex_onda, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); onda.scale.set(10, 3, 1); m.add(onda);
        const nuc = OC3.Assets.glow('rgba(255,170,40,0.95)', 5.5, 0.95); nuc.material.fog = false; m.add(nuc);
      }
      else m = OC3.Assets.crear(e.tipo);
      scene.add(m); return m;
    }

    /* partículas (con la gravedad y la atmósfera del planeta: el polvo cae lento en Mercurio y no se frena) */
    const NP = 500, pPos = new Float32Array(NP * 3), pCol = new Float32Array(NP * 3), pSize = new Float32Array(NP), pAlfa = new Float32Array(NP);
    const pVel = new Float32Array(NP * 3), pVida = new Float32Array(NP), pVida0 = new Float32Array(NP), pS0 = new Float32Array(NP);
    const geoP = new THREE.BufferGeometry();
    geoP.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); geoP.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    geoP.setAttribute('size', new THREE.BufferAttribute(pSize, 1)); geoP.setAttribute('alfa', new THREE.BufferAttribute(pAlfa, 1));
    const matP = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'attribute float size; attribute float alfa; attribute vec3 color; varying vec3 vC; varying float vA; void main(){ vC=color; vA=alfa; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size*(420.0/-mv.z); gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'varying vec3 vC; varying float vA; void main(){ float d=length(gl_PointCoord-0.5)*2.0; if(d>1.0) discard; gl_FragColor=vec4(vC, vA*(1.0-d*d)); }'
    });
    const puntos = new THREE.Points(geoP, matP); puntos.frustumCulled = false; scene.add(puntos);
    let pi = 0;
    const COLORES = { roca: [[1, .6, .25], [.75, .7, .65]], polvo: [[.7, .62, .5], [.5, .45, .4]], nave: [[1, .55, .2], [1, .9, .5]], chispa: [[.6, 1, .7], [1, 1, 1]], bonus: [[.5, 1, .8], [1, 1, .6]], rebote: [[1, .35, .3], [1, .8, .5]] };
    function rafaga(pos, n, vel, tipo, tam, vida) {
      const cs = COLORES[tipo] || COLORES.roca;
      for (let i = 0; i < n; i++) {
        const k = pi++ % NP, c = cs[i % cs.length], u = Math.random() * 6.283, v = Math.acos(2 * Math.random() - 1), sp = vel * (0.25 + Math.random() * 0.75);
        pPos[k * 3] = pos.x; pPos[k * 3 + 1] = pos.y; pPos[k * 3 + 2] = pos.z;
        pVel[k * 3] = sp * Math.sin(v) * Math.cos(u); pVel[k * 3 + 1] = sp * Math.cos(v) * 0.8 + vel * 0.15; pVel[k * 3 + 2] = sp * Math.sin(v) * Math.sin(u);
        pCol[k * 3] = c[0]; pCol[k * 3 + 1] = c[1]; pCol[k * 3 + 2] = c[2];
        pVida[k] = pVida0[k] = vida * (0.6 + Math.random() * 0.6); pS0[k] = tam * (0.6 + Math.random() * 0.8);
      }
    }
    let sacudida = 0;

    function eventos() {
      for (const e of sim.eventos) {
        if (e.t === 'explosion') {
          const big = e.tam || 2;
          rafaga(e.pos, Math.min(60, 12 + big * 6), 8 + big * 2.2, e.color === 'nave' ? 'nave' : e.color === 'polvo' ? 'polvo' : 'roca', 1.2 + big * 0.35, 1.0 + big * 0.1);
          if (e.color !== 'polvo') rafaga(e.pos, 8, 5 + big, 'nave', 2 + big * 0.5, 0.35);
          sacudida = Math.max(sacudida, Math.min(1, big / 9));
        } else if (e.t === 'chispa') rafaga(e.pos, 5, 9, 'chispa', 0.7, 0.3);
        else if (e.t === 'rebote') rafaga(e.pos, 7, 11, 'rebote', 0.9, 0.35);
        else if (e.t === 'golpe-jefe') { sacudida = Math.max(sacudida, 0.25); }
        else if (e.t === 'daño') sacudida = Math.max(sacudida, 0.7);
        else if (e.t === 'polvo') rafaga(e.pos, 16, 7, 'polvo', 1.6, 1.2);
        else if (e.t === 'bonus') rafaga(e.pos, 22, 9, 'bonus', 1.0, 0.8);
        if (OC3.Sonido) OC3.Sonido.evento(e);
      }
      sim.eventos.length = 0;
    }

    const cam = { x: 0, y: 44, z: 14 };
    let roll = 0, cabeceo = 0;

    function actualizar(dt) {
      const n = sim.nave, gJ = sim.gJuego, ratio = OC3.Atmosfera.razon(planeta, 8);
      eventos();

      /* nave: alabeo y cabeceo según la velocidad (se inclina al virar) */
      roll += (-n.vel.x * 0.022 - roll) * Math.min(1, dt * 8);
      cabeceo += (n.vel.y * 0.012 - cabeceo) * Math.min(1, dt * 8);
      nave.position.set(n.pos.x, n.pos.y, n.pos.z);
      giro = vitrina ? giro + dt * 0.9 : 0;            // en el hangar la nave gira para lucir sus módulos
      nave.rotation.set(Math.max(-0.5, Math.min(0.5, cabeceo)), giro, Math.max(-0.9, Math.min(0.9, roll)), 'YXZ');
      nave.visible = sim.estado !== 'destruida';
      if (motor) { const f = 0.85 + Math.sin(sim.t * 40) * 0.15; motor.scale.setScalar((n.combustible > 0 ? 1.7 * (motor.userData.base || 1) : 0.6) * f); }
      if (nave.userData.llamas) for (const l of nave.userData.llamas) l.scale.setScalar((n.combustible > 0 ? 1.3 : 0.35) * (0.85 + Math.sin(sim.t * 45 + l.id) * 0.15));
      if (n.inv > 0 && sim.estado === 'jugando') nave.visible = Math.floor(sim.t * 18) % 2 === 0;   // parpadeo tras un golpe

      actualizarAlex(dt);

      /* objetos */
      const vivos = new Set();
      for (const e of sim.ents) {
        vivos.add(e.id);
        let m = mallas.get(e.id); if (!m) { m = nuevaMalla(e); mallas.set(e.id, m); }
        m.position.set(e.pos.x, e.pos.y, e.pos.z);
        if (e.tipo !== 'laser' && e.tipo !== 'rayo') m.rotation.set(e.rot.x, e.rot.y, e.rot.z);
      }
      for (const [id, m] of mallas) if (!vivos.has(id)) { scene.remove(m); mallas.delete(id); }

      /* partículas */
      const damp = Math.exp(-(0.15 + ratio * 4) * dt);
      for (let k = 0; k < NP; k++) {
        if (pVida[k] <= 0) { pAlfa[k] = 0; pSize[k] = 0; continue; }
        pVida[k] -= dt; const f = Math.max(0, pVida[k] / pVida0[k]);
        pVel[k * 3 + 1] -= gJ * 0.7 * dt;
        pVel[k * 3] *= damp; pVel[k * 3 + 1] *= damp; pVel[k * 3 + 2] *= damp;
        pPos[k * 3] += pVel[k * 3] * dt; pPos[k * 3 + 1] += pVel[k * 3 + 1] * dt; pPos[k * 3 + 2] += pVel[k * 3 + 2] * dt;
        if (pPos[k * 3 + 1] < 0.1) { pPos[k * 3 + 1] = 0.1; pVel[k * 3 + 1] *= -0.3; }
        pAlfa[k] = f; pSize[k] = pS0[k] * (0.4 + f * 0.6);
      }
      geoP.attributes.position.needsUpdate = geoP.attributes.alfa.needsUpdate = geoP.attributes.size.needsUpdate = geoP.attributes.color.needsUpdate = true;

      /* cámara trasera: detrás y arriba; sigue con retardo suave */
      const kc = 1 - Math.exp(-7 * dt);
      cam.x += (n.pos.x * 0.8 - cam.x) * kc;
      cam.y += (Math.max(3, n.pos.y + 5.6) - cam.y) * kc;
      cam.z = n.pos.z + (camera.aspect < 0.8 ? 17 : 13) + (vitrina ? (camera.aspect < 0.8 ? 6 : -3) : 0);
      let sx = 0, sy = 0; if (sacudida > 0) { sx = (Math.random() - 0.5) * sacudida * 1.6; sy = (Math.random() - 0.5) * sacudida * 1.6; sacudida = Math.max(0, sacudida - dt * 2.2); }
      camera.position.set(cam.x + sx, Math.max(1.5, cam.y + sy), cam.z);
      camera.lookAt(n.pos.x * 0.65, n.pos.y * 0.85 + 0.5, n.pos.z - 30);
      camera.rotation.z += -roll * 0.18;

      /* suelo y cielo siguen a la nave; la textura queda fija en el mundo */
      const czs = n.pos.z - 600;   // el centro del plano va delante de la nave
      suelo.position.set(n.pos.x, 0, czs);
      tex.offset.set(n.pos.x / TILE, -czs / TILE);
      estrellas.position.set(n.pos.x, 0, n.pos.z);
      sol.position.set(n.pos.x - 60, 90, n.pos.z + 40); sol.target.position.set(n.pos.x, 0, n.pos.z);

      renderer.render(scene, camera);
    }

    /* reinicio con una simulación nueva del MISMO planeta (sin recrear el renderizador) */
    function reiniciar(nuevo) {
      sim = nuevo; construirNave(sim.equipo);
      for (const m of mallas.values()) scene.remove(m); mallas.clear();
      pVida.fill(0); if (alex) { alex.visible = aura.visible = escudo.visible = false; } roll = 0; cabeceo = 0; sacudida = 0; cam.x = 0; cam.y = 44;
    }

    function tamano() {
      const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 80 : 68; camera.updateProjectionMatrix();
    }
    addEventListener('resize', tamano); tamano();

    return { actualizar, reiniciar, set vitrina(v) { vitrina = !!v; }, tamano, renderer, scene, camera, destruir() { removeEventListener('resize', tamano); renderer.dispose(); } };
  }
  OC3.Vista = { crear };
})(window);
