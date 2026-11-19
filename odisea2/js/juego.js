/* ============================================================
   ODISEA 3D · juego.js
   Bucle principal, entrada (teclado / táctil), HUD y pantallas.
   ============================================================ */
(function (root) {
  const OC3 = root.OC3, $ = (id) => document.getElementById(id), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const q = new URLSearchParams(location.search);
  const PLANETA = OC3.Planetas[q.get('planeta')] ? q.get('planeta') : OC3.PlanetaInicial;
  const canvas = $('c3d');
  let sim = null, vista = null, pausado = true, ultimo = 0, enMarcha = false;
  const teclas = {}, tactil = { x: 0, y: 0, fuego: false };
  const cache = {};

  /* ---------- entrada ---------- */
  function entrada() {
    const kx = (teclas.ArrowRight || teclas.KeyD ? 1 : 0) - (teclas.ArrowLeft || teclas.KeyA ? 1 : 0);
    const ky = (teclas.ArrowUp || teclas.KeyW ? 1 : 0) - (teclas.ArrowDown || teclas.KeyS ? 1 : 0);
    return { x: clamp(kx + tactil.x, -1, 1), y: clamp(ky + tactil.y, -1, 1), fuego: !!(teclas.Space || teclas.KeyJ || tactil.fuego) };
  }
  addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    teclas[e.code] = true;
    if (e.code === 'KeyP' || e.code === 'Escape') alternarPausa();
    if (e.code === 'KeyM') OC3.Sonido.alternar();
    if (e.code === 'KeyR' && sim && sim.estado !== 'jugando') reiniciar();
    if ((e.code === 'Enter' || e.code === 'Space') && !$('pantalla').hidden && enMarcha === false) comenzar();
  });
  addEventListener('keyup', (e) => { teclas[e.code] = false; });
  addEventListener('blur', () => { for (const k in teclas) teclas[k] = false; if (enMarcha) pausar(true); });

  /* táctil: arrastrar en la mitad izquierda = mando; botón derecho = fuego */
  (function () {
    const z = $('zona-mando'), anillo = $('anillo'), punto = $('punto'); let id = null, ox = 0, oy = 0; const R = 56;
    z.addEventListener('pointerdown', (e) => { if (id !== null) return; id = e.pointerId; ox = e.clientX; oy = e.clientY; z.setPointerCapture(id); anillo.style.cssText = 'left:' + ox + 'px;top:' + oy + 'px;display:block'; punto.style.cssText = 'left:' + ox + 'px;top:' + oy + 'px;display:block'; OC3.Sonido.activar(); });
    z.addEventListener('pointermove', (e) => { if (e.pointerId !== id) return; const dx = clamp(e.clientX - ox, -R, R), dy = clamp(e.clientY - oy, -R, R); tactil.x = dx / R; tactil.y = -dy / R; punto.style.left = ox + dx + 'px'; punto.style.top = oy + dy + 'px'; });
    const fin = (e) => { if (e.pointerId !== id) return; id = null; tactil.x = tactil.y = 0; anillo.style.display = punto.style.display = 'none'; };
    z.addEventListener('pointerup', fin); z.addEventListener('pointercancel', fin);
    const b = $('btn-fuego');
    b.addEventListener('pointerdown', (e) => { tactil.fuego = true; b.setPointerCapture(e.pointerId); b.classList.add('on'); OC3.Sonido.activar(); });
    const off = () => { tactil.fuego = false; b.classList.remove('on'); }; b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off);
    $('btn-pausa').addEventListener('click', () => alternarPausa());
  })();

  /* ---------- HUD ---------- */
  function txt(id, v) { if (cache[id] !== v) { cache[id] = v; $(id).textContent = v; } }
  function ancho(id, f, bajo) { const e = $(id), w = Math.round(clamp(f, 0, 1) * 100) + '%'; if (cache[id] !== w) { cache[id] = w; e.style.width = w; e.classList.toggle('bajo', !!bajo && f < 0.25); } }
  const nf = (v, d) => v.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
  function pct(r) { const p = r * 100; return p < 0.001 ? '< 0,001 %' : p < 1 ? nf(p, 2) + ' %' : nf(p, 0) + ' %'; }
  function hud() {
    const n = sim.nave, i = sim.info(), N = OC3.Config.nave;
    txt('h-planeta', i.planeta.toUpperCase());
    txt('h-g', nf(i.g, 2) + ' m/s²  (' + nf(i.g / 9.81, 2) + ' g)');
    txt('h-atm', i.tipoAtm + ' · densidad ' + (i.razon >= 1 ? '×' + nf(i.razon, 1) + ' la de la Tierra' : pct(i.razon) + ' de la Tierra'));
    txt('h-alt', nf(i.altKm, 1) + ' km');
    txt('h-vel', nf(n.vf * 0.1, 1) + ' km/s');
    txt('h-puntos', Math.round(sim.puntos).toLocaleString('es-CL'));
    ancho('b-escudo', n.escudo / N.escudoMax, true); ancho('b-comb', n.combustible / N.combustibleMax, true);
    ancho('b-prog', i.progreso);
    /* jefe: barra de vida, estado, frase y mensajes */
    const jf = i.jefe, hj = $('hud-jefe'), dg = $('dialogo'), IMG = OC3.IMG64 || {};
    hj.classList.toggle('on', !!jf && !jf.muerto);
    if (jf && !jf.muerto) {
      ancho('b-jefe', jf.hp / jf.hpMax);
      const ej = $('j-est'), t = jf.fase === 'habla' ? 'HABLA · invulnerable: esquiva los rayos' : jf.vulnerable ? 'RESPIRA · ¡dispárale ahora!' : jf.fase === 'aviso' ? 'toma aire…' : 'se acerca…';
      if (cache.jt !== t) { cache.jt = t; ej.textContent = t; ej.className = jf.fase === 'habla' ? 'hab' : jf.vulnerable ? 'vul' : ''; }
    }
    const frase = jf && !jf.muerto && jf.fase === 'habla' ? jf.frase : '';
    dg.classList.toggle('on', !!frase || (!!jf && jf.muerto));
    if (jf) {
      const quien = jf.muerto ? 'alex_p_sonrie' : jf.fase === 'habla' ? 'alex_p_grita' : jf.fase === 'aviso' ? 'alex_p_enojo' : 'alex_p_calma';
      if (cache.dq !== quien) { cache.dq = quien; $('d-img').src = IMG[quien] || ''; }
      const tf = jf.muerto ? '¡Bravo! Eso sí fue afinado…' : frase; if (cache.df !== tf) { cache.df = tf; $('d-frase').textContent = tf; }
    }
    const m = $('mensaje'), mt = sim.msg.t > 0 ? sim.msg.texto : ''; if (cache.mm !== mt) { cache.mm = mt; m.textContent = mt || m.textContent; m.classList.toggle('on', !!mt); }
    const f = $('flash'); const o = n.impacto > 0 ? Math.min(0.55, n.impacto * 0.55) : 0; if (cache.f !== o) { cache.f = o; f.style.opacity = o; }
  }

  /* ---------- pantallas ---------- */
  function pantalla(html, botones) {
    const p = $('pantalla'); p.hidden = false; $('p-cuerpo').innerHTML = html; const b = $('p-botones'); b.innerHTML = '';
    for (const [t, f, sec] of botones) { const e = document.createElement('button'); e.textContent = t; if (sec) e.className = 'sec'; e.onclick = f; b.appendChild(e); }
  }
  function cerrarPantalla() { $('pantalla').hidden = true; }
  function pausar(v) { if (!sim || sim.estado !== 'jugando') return; pausado = v; if (v) pantalla('<h2>Pausa</h2><p>Respira. El tiempo está detenido.</p>', [['Continuar', () => pausar(false)], ['Reiniciar', reiniciar, 1]]); else { cerrarPantalla(); ultimo = performance.now(); } }
  function alternarPausa() { if (enMarcha) pausar(!pausado); }

  function pantallaInicio() {
    const P = OC3.Planetas, opts = Object.keys(P).map(k => '<option value="' + k + '"' + (k === PLANETA ? ' selected' : '') + '>' + P[k].nombre + (k === OC3.PlanetaInicial ? ' · mundo jugable' : ' · solo prueba de física') + '</option>').join('');
    pantalla(
      '<h1>ODISEA <span>2</span></h1><p class="sub">Mercurio en 3D · te espera el Profesor Alex</p>' +
      '<p class="reglas">Reglas: <b>choques</b> (todo se destruye, menos los bonus) · <b>gravedad</b> de cada planeta · <b>atmósfera</b> que frena según su densidad y tu altitud.</p>' +
      '<label class="sel">Planeta <select id="sel-planeta">' + opts + '</select></label>' +
      '<p class="ctl"><b>← ↑ ↓ →</b> / <b>WASD</b> mover · <b>Espacio</b> disparar · <b>P</b> pausa · <b>M</b> sonido<br>Táctil: arrastra a la izquierda para mover, botón <b>FUEGO</b> a la derecha.</p>' +
      '<p class="ctl">Al final del tramo te espera el <b style="color:#ffd24d">Profesor Alex</b>: cuando <b>respira</b> puedes dañarlo; cuando <b>habla</b> es invulnerable y lanza rayos.</p>' +
      '<p class="ctl">Recoge <b style="color:#ffa53b">combustible</b> y <b style="color:#5dffa0">kits de herramientas</b> (reparan el escudo). Con la gravedad del planeta, soltar los mandos te hace caer.</p>',
      [['Iniciar', comenzar]]);
    $('sel-planeta').onchange = (e) => { const u = new URL(location.href); u.searchParams.set('planeta', e.target.value); location.href = u.toString(); };
  }
  function comenzar() { OC3.Sonido.activar(); cerrarPantalla(); pausado = false; enMarcha = true; ultimo = performance.now(); }
  function reiniciar() {
    sim = OC3.Sim.crear({ planeta: PLANETA, semilla: (Math.random() * 1e9) | 0 }); vista.reiniciar(sim);
    for (const k in cache) delete cache[k]; cerrarPantalla(); pausado = false; ultimo = performance.now();
  }
  function enviarPuntaje(s, ok) {
    /* ranking del colegio (firebase/df.js); si el sitio no lo carga, no hace nada */
    try {
      if (window.DF && Math.round(s.puntos) > 0) {
        DF.ofrecer({ tipo: 'puntaje', juego: 'odisea2', titulo: 'Odisea 2', puntaje: Math.round(s.puntos),
          extra: { planeta: OC3.Planetas[PLANETA].nombre, victoria: !!ok, golpesJefe: s.stats.golpesJefe, jefe: s.jefe ? Math.round(s.jefe.hp) : 0 } });
      }
    } catch (e) {}
  }
  function fin() {
    const s = sim, ok = s.estado === 'completo';
    if (PLANETA === OC3.PlanetaInicial) enviarPuntaje(s, ok);
    pantalla('<h2>' + (ok ? '¡Profesor Alex derrotado!' : 'Nave destruida') + '</h2><p class="sub">' + (ok ? 'Cruzaste ' + OC3.Planetas[PLANETA].nombre + ' y silenciaste al profesor de música.' : (s.jefe ? 'Alex te alcanzó con ' + Math.round(s.jefe.hp / s.jefe.hpMax * 100) + ' % de vida.' : 'Recorriste el ' + Math.round(s.dist / OC3.Config.mundo.distanciaNivel * 100) + ' % del tramo.')) + '</p>' +
      '<p class="reglas">Puntos <b>' + Math.round(s.puntos) + '</b> · meteoroides destruidos <b>' + s.stats.destruidos + '</b> · golpes <b>' + s.stats.golpes + '</b> · bonus <b>' + s.stats.bonus + '</b></p>' +
      '', [['Jugar de nuevo', reiniciar], ['Menú', () => location.reload(), 1]]);
  }

  /* ---------- bucle ---------- */
  function bucle(now) {
    requestAnimationFrame(bucle);
    const dt = Math.min(0.05, (now - ultimo) / 1000 || 0); ultimo = now;
    if (!sim) return;
    if (!pausado) {
      const antes = sim.estado; sim.paso(dt, enMarcha ? entrada() : {});
      if (antes === 'jugando' && sim.estado !== 'jugando') setTimeout(fin, 1400);
    }
    vista.actualizar(pausado ? 0 : dt); hud();
  }

  /* ---------- arranque ---------- */
  OC3.Assets.cargar(() => {
    sim = OC3.Sim.crear({ planeta: PLANETA, semilla: +q.get('semilla') || 11 });
    vista = OC3.Vista.crear(canvas, sim);
    $('carga').hidden = true; ultimo = performance.now(); requestAnimationFrame(bucle);
    $('h-aviso').hidden = PLANETA === OC3.PlanetaInicial;
    if (q.get('auto') === '1') comenzar(); else pantallaInicio();
  });

  OC3.Juego = { get sim() { return sim; }, get vista() { return vista; }, comenzar, reiniciar, pausar, entrada, tactil, teclas };
})(window);
