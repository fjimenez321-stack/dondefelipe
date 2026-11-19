/* ============================================================
   ODISEA 3D · sim.js
   SIMULACIÓN: física y reglas del juego. No dibuja nada ni usa three.js
   (por eso se puede probar en Node). La vista (view.js) solo lee este estado.

   Convención de ejes: X derecha · Y arriba (altitud sobre el suelo) ·
   Z hacia ATRÁS; la nave avanza hacia −Z, igual que la cámara de three.js.

   REGLAS
   1. COLISIONES  Todo objeto que choca con otro se destruye (o se daña, si tiene
                  más de 1 de vida) — salvo los BONUS (combustible, herramientas),
                  que no destruyen nada: solo la nave los recoge.
   2. GRAVEDAD    Cada planeta tira hacia el suelo con su propia g (planets.js).
                  Afecta a los meteoroides y a la nave (que compensa una parte).
   3. ATMÓSFERA  Frena según tipo y altitud (atmosfera.js). En Mercurio ≈ nada.
   ============================================================ */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* distancia mínima entre dos esferas en movimiento durante dt (colisión "barrida":
     evita que un rayo veloz atraviese un meteoroide entre dos cuadros) */
  function distMin(a, b, dt) {
    const px = a.pos.x - b.pos.x, py = a.pos.y - b.pos.y, pz = a.pos.z - b.pos.z;
    const vx = a.vel.x - b.vel.x, vy = a.vel.y - b.vel.y, vz = a.vel.z - b.vel.z;
    const vv = vx * vx + vy * vy + vz * vz;
    let t = vv > 1e-9 ? -(px * vx + py * vy + pz * vz) / vv : 0;
    t = clamp(t, 0, dt);
    const dx = px + vx * t, dy = py + vy * t, dz = pz + vz * t;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function crear(opt) {
    opt = opt || {};
    const C = OC3.Config, A = OC3.Atmosfera;
    const planetaId = opt.planeta && OC3.Planetas[opt.planeta] ? opt.planeta : OC3.PlanetaInicial;
    const P = OC3.Planetas[planetaId];
    const R = rng(opt.semilla || 7);
    const gJ = P.g * C.escala.gJuego;           // gravedad en u/s²
    const N = C.nave;

    const s = {
      planetaId, planeta: P, gJuego: gJ,
      t: 0, estado: 'jugando', puntos: 0, dist: 0,
      ents: [], eventos: [], _id: 1,
      stats: { destruidos: 0, golpes: 0, bonus: 0 },
      nave: {
        tipo: 'nave', pos: { x: 0, y: 40, z: 0 }, vel: { x: 0, y: 0, z: -N.vCrucero },
        vf: N.vCrucero, radio: N.radio, escudo: N.escudoMax, combustible: N.combustibleMax,
        cd: 0, lado: 1, inv: 0, impacto: 0
      },
      _tMeteoro: 2.0, _tBonus: 6.0, _ultimoBonus: ''
    };

    const ev = (t, o) => { o.t = t; s.eventos.push(o); };
    const alta = (e) => { e.id = s._id++; e.hp = e.hp || 1; s.ents.push(e); return e; };

    /* ---------- REGLAS DE COLISIÓN (tabla extensible) ---------- */
    function dañarNave(dmg, pos) {
      const n = s.nave;
      if (n.inv > 0) return;
      n.escudo = Math.max(0, n.escudo - dmg);
      n.inv = 0.6; n.impacto = 1; s.stats.golpes++;
      ev('daño', { pos: { x: pos.x, y: pos.y, z: pos.z }, dmg });
    }
    function explotar(e, tam, color) { ev('explosion', { pos: { x: e.pos.x, y: e.pos.y, z: e.pos.z }, tam, color: color || 'roca' }); }
    function romperMeteoro(m, porLaser) {
      m.hp = 0; s.stats.destruidos++;
      if (porLaser) s.puntos += C.meteoros.puntosPorTam * m.clase;
      explotar(m, m.escala * 1.6, 'roca');
    }
    const REGLAS = {
      'laser|meteoro': (l, m) => { l.hp = 0; m.hp -= l.daño; ev('chispa', { pos: { x: l.pos.x, y: l.pos.y, z: l.pos.z } }); if (m.hp <= 0) romperMeteoro(m, true); },
      'meteoro|nave': (m, n) => { dañarNave(C.meteoros.dañoBase + C.meteoros.dañoPorTam * m.clase, m.pos); romperMeteoro(m, false); },
      'meteoro|meteoro': (a, b) => { romperMeteoro(a, false); romperMeteoro(b, false); },
      'combustible|nave': (b, n) => { b.hp = 0; n.combustible = Math.min(N.combustibleMax, n.combustible + C.bonus.combustible); s.stats.bonus++; ev('bonus', { tipo: 'combustible', pos: b.pos }); },
      'herramientas|nave': (b, n) => { b.hp = 0; n.escudo = Math.min(N.escudoMax, n.escudo + C.bonus.herramientas); s.stats.bonus++; ev('bonus', { tipo: 'herramientas', pos: b.pos }); }
    };
    const clave = (a, b) => [a.tipo, b.tipo].sort().join('|');
    function resolver(a, b) {
      const k = clave(a, b), f = REGLAS[k];
      if (f) { const [t1] = k.split('|'); if (a.tipo === t1) f(a, b); else f(b, a); return; }
      /* regla general: dos objetos "destruye" que chocan se destruyen; los bonus no destruyen nada */
      if (a.colision === 'destruye' && b.colision === 'destruye') { a.hp = 0; b.hp = 0; explotar(a, 2); explotar(b, 2); }
    }
    function interactua(a, b) {
      if (a.tipo === 'laser' && b.tipo === 'laser') return false;
      if (a.tipo === 'laser' && b.tipo === 'nave' || a.tipo === 'nave' && b.tipo === 'laser') return false;
      if (a.colision === 'bonus' || b.colision === 'bonus') return clave(a, b) in REGLAS; // un bonus solo reacciona con la nave
      return true;
    }

    /* ---------- APARICIÓN ---------- */
    function lanzarMeteoro() {
      const M = C.meteoros, n = s.nave, p = clamp(s.dist / C.mundo.distanciaNivel, 0, 1);
      const esc = lerp(M.escala[0], M.escala[1], Math.pow(R(), 1.6));
      const clase = esc < 2.4 ? 1 : esc < 3.8 ? 2 : 3;
      const vz = R() * 10;
      let x, y;
      if (R() < M.apuntados) {
        /* apuntado a donde estará la nave: compensa la caída por gravedad durante el trayecto */
        const T = C.mundo.aparece / (n.vf + vz);
        x = n.pos.x + (R() - 0.5) * 16;
        y = n.pos.y + 0.5 * gJ * T * T * (0.85 + R() * 0.3) + (R() - 0.5) * 8;
      } else { x = (R() - 0.5) * 100; y = 6 + R() * 104; }
      alta({
        tipo: 'meteoro', colision: 'destruye', clase, escala: esc, radio: esc * 0.95, hp: clase,
        pos: { x, y: clamp(y, 4, 160), z: n.pos.z - C.mundo.aparece },
        vel: { x: (R() - 0.5) * 8, y: R() * 3 - 2, z: vz },
        rot: { x: R() * 6.28, y: R() * 6.28, z: R() * 6.28 },
        spin: { x: (R() - 0.5) * 1.6, y: (R() - 0.5) * 1.6, z: (R() - 0.5) * 1.6 }
      });
      return lerp(M.intervalo[0], M.intervalo[1], p) * (0.7 + R() * 0.6);
    }
    function lanzarBonus() {
      const n = s.nave;
      const pFuel = n.combustible < 45 ? 0.7 : (n.escudo < 50 ? 0.25 : 0.5);
      const tipo = R() < pFuel ? 'combustible' : 'herramientas';
      const y0 = 10 + R() * 55;
      alta({ tipo, colision: 'bonus', radio: C.bonus.radio, y0, fase: R() * 6.28,
        pos: { x: (R() - 0.5) * 60, y: y0, z: n.pos.z - C.mundo.aparece }, vel: { x: 0, y: 0, z: 0 },
        rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 1.2, z: 0 } });
      return C.bonus.intervalo[0] + R() * (C.bonus.intervalo[1] - C.bonus.intervalo[0]);
    }
    function disparar() {
      const n = s.nave, F = N.fuego;
      n.lado = -n.lado;
      alta({ tipo: 'laser', colision: 'destruye', radio: 0.55, daño: 1, hp: 1, vida: F.alcance / F.velocidad,
        pos: { x: n.pos.x + n.lado * 1.5, y: n.pos.y - 0.1, z: n.pos.z - 2.5 },
        vel: { x: 0, y: 0, z: -(F.velocidad + n.vf) }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } });
      ev('laser', {});
    }

    /* ---------- UN PASO DE SIMULACIÓN ---------- */
    function paso(dt, inp) {
      dt = clamp(dt, 0, 0.05);
      if (s.estado !== 'jugando' || dt === 0) return;
      inp = inp || {};
      const n = s.nave;
      const inX = clamp(inp.x || 0, -1, 1), inY = clamp(inp.y || 0, -1, 1);
      s.t += dt;

      /* --- nave: gravedad + mando + atmósfera --- */
      const vacio = n.combustible <= 0;
      const k = A.coefArrastre(s.planeta, n.pos.y);
      const potencia = vacio ? N.sinCombustible : 1;
      const asist = vacio ? 0 : N.asistenciaGrav;
      let vx = n.vel.x, vy = n.vel.y, vf = n.vf;
      vx += inX * N.accLateral * potencia * dt;
      vy += (-gJ * (1 - asist) + inY * N.accVertical * potencia) * dt;
      const amort = Math.exp(-N.estabilizador * dt);
      vx = A.frenar(vx * amort, k, dt);
      vy = A.frenar(vy * amort, k, dt);
      vf += ((vacio ? N.vCrucero * N.sinCombustible : N.vCrucero) - vf) * Math.min(1, N.govAdelante * dt);
      vf = A.frenar(vf, k, dt);
      n.vel.x = vx; n.vel.y = vy; n.vel.z = -vf; n.vf = vf;
      n.combustible = Math.max(0, n.combustible - (N.consumo.base + N.consumo.mando * (Math.abs(inX) + Math.abs(inY)) * 0.5) * dt);
      n.inv = Math.max(0, n.inv - dt); n.impacto = Math.max(0, n.impacto - dt * 2.5);

      /* --- disparo --- */
      n.cd -= dt;
      if (inp.fuego && n.cd <= 0) { disparar(); n.cd = N.fuego.cadencia; }

      /* --- aparición progresiva --- */
      s._tMeteoro -= dt; if (s._tMeteoro <= 0) s._tMeteoro = lanzarMeteoro();
      s._tBonus -= dt; if (s._tBonus <= 0) s._tBonus = lanzarBonus();

      /* --- objetos: gravedad y atmósfera (menos lasers y bonus) --- */
      for (const e of s.ents) {
        if (e.tipo === 'meteoro') {
          const ke = A.coefArrastre(s.planeta, e.pos.y);
          e.vel.y -= gJ * dt;
          e.vel.x = A.frenar(e.vel.x, ke, dt); e.vel.y = A.frenar(e.vel.y, ke, dt); e.vel.z = A.frenar(e.vel.z, ke, dt);
        } else if (e.tipo === 'combustible' || e.tipo === 'herramientas') {
          e.pos.y = e.y0 + Math.sin(s.t * 1.6 + e.fase) * 1.2;
        } else if (e.tipo === 'laser') { e.vida -= dt; if (e.vida <= 0) e.hp = 0; }
      }

      /* --- colisiones (antes de mover: se mide el recorrido de este cuadro) --- */
      const todos = s.ents.filter(e => e.hp > 0); todos.push(n);
      for (let i = 0; i < todos.length; i++) {
        for (let j = i + 1; j < todos.length; j++) {
          const a = todos[i], b = todos[j];
          if (a.hp <= 0 || b.hp <= 0 || !interactua(a, b)) continue;
          if (distMin(a, b, dt) <= a.radio + b.radio) resolver(a, b);
        }
      }

      /* --- mover --- */
      n.pos.x += n.vel.x * dt; n.pos.y += n.vel.y * dt; n.pos.z += n.vel.z * dt;
      for (const e of s.ents) {
        e.pos.x += e.vel.x * dt; e.pos.y += e.vel.y * dt; e.pos.z += e.vel.z * dt;
        e.rot.x += e.spin.x * dt; e.rot.y += e.spin.y * dt; e.rot.z += e.spin.z * dt;
      }

      /* --- límites del corredor, techo y suelo --- */
      if (Math.abs(n.pos.x) > N.xMax) { n.pos.x = Math.sign(n.pos.x) * N.xMax; n.vel.x = 0; }
      if (n.pos.y > N.yMax) { n.pos.y = N.yMax; if (n.vel.y > 0) n.vel.y = 0; }
      if (n.pos.y < n.radio * 0.6) {
        n.pos.y = n.radio * 0.6;
        dañarNave(C.suelo.daño, { x: n.pos.x, y: 0, z: n.pos.z });
        if (n.vel.y < C.suelo.rebote) n.vel.y = C.suelo.rebote;
        ev('polvo', { pos: { x: n.pos.x, y: 0, z: n.pos.z } });
      }
      for (const e of s.ents) {
        if (e.tipo === 'meteoro' && e.pos.y - e.radio <= 0 && e.hp > 0) {
          e.hp = 0; ev('explosion', { pos: { x: e.pos.x, y: 0.5, z: e.pos.z }, tam: e.escala * 1.4, color: 'polvo' });
        } else if (e.tipo === 'laser' && e.pos.y <= 0) e.hp = 0;
      }

      /* --- limpieza --- */
      s.ents = s.ents.filter(e => e.hp > 0 && e.pos.z < n.pos.z + C.mundo.atras && e.pos.y < 400);

      /* --- avance y fin --- */
      s.dist = -n.pos.z;
      s.puntos += vf * dt * 0.1;
      if (n.escudo <= 0) { s.estado = 'destruida'; ev('explosion', { pos: n.pos, tam: 9, color: 'nave' }); ev('fin', { ok: false }); }
      else if (s.dist >= C.mundo.distanciaNivel) { s.estado = 'completo'; ev('fin', { ok: true }); }
    }

    /* datos para el HUD */
    function info() {
      const n = s.nave;
      return {
        planeta: P.nombre, g: P.g, tipoAtm: P.atm.tipo, composicion: P.atm.composicion, presion: P.atm.presion,
        altKm: A.altitudKm(n.pos.y), densidad: A.densidad(P, n.pos.y), razon: A.razon(P, n.pos.y),
        velocidad: n.vf * C.escala.mPorUnidad / 1000 * 3600 / 1000, // «km/s» de juego
        progreso: clamp(s.dist / C.mundo.distanciaNivel, 0, 1)
      };
    }
    s.paso = paso; s.info = info;
    return s;
  }

  OC3.Sim = { crear, distMin };
})(typeof window !== 'undefined' ? window : globalThis);
