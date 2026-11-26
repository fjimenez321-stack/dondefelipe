// ===================== MÓDULO core / app =====================
// Bucle de juego con paso fijo, pantallas, sonido y conexión entre módulos.
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  // ---------- roster (oficiales + comunidad guardados localmente) ----------
  const roster = Characters.OFICIALES.map(d => ({ def: d, community: false }));
  try {
    const saved = JSON.parse(localStorage.getItem('duelo-genios-comunidad') || '[]');
    for (const d of saved) if (Characters.validate(d).ok) roster.push({ def: d, community: true });
  } catch (_) {}
  const saveCommunity = () => { try { localStorage.setItem('duelo-genios-comunidad', JSON.stringify(roster.filter(r => r.community).map(r => r.def))); } catch (_) {} };

  // ---------- sonido sintetizado ----------
  let ac = null;
  const audioOn = () => { try { if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (_) {} };
  function tone(freq, dur, type = 'square', vol = 0.15, slide = 0) {
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
  }
  function noise(dur, vol = 0.3, freq = 1200) {
    if (!ac) return;
    const n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = vol;
    src.buffer = buf; src.connect(f).connect(g).connect(ac.destination); src.start();
  }
  const sfx = k => {
    if (k === 'hit') { noise(0.12, 0.35, 1800); tone(140, 0.12, 'sine', 0.3, -80); }
    else if (k === 'big') { noise(0.25, 0.5, 1200); tone(90, 0.3, 'sine', 0.45, -50); }
    else if (k === 'block') { noise(0.06, 0.25, 4000); tone(900, 0.05, 'square', 0.06); }
    else if (k === 'special') { tone(220, 0.25, 'sawtooth', 0.07, 500); }
    else if (k === 'ko') { tone(80, 0.9, 'sawtooth', 0.25, -40); noise(0.6, 0.3, 600); }
    else if (k === 'thud') { tone(70, 0.25, 'sine', 0.45, -30); noise(0.18, 0.25, 500); }
    else if (k === 'super') { tone(180, 0.6, 'sawtooth', 0.12, 900); setTimeout(() => tone(1200, 0.3, 'square', 0.06), 250); }
    else if (k === 'perfect') { tone(1320, 0.12, 'triangle', 0.15); setTimeout(() => tone(1760, 0.18, 'triangle', 0.12), 70); }
    else if (k === 'grab') { noise(0.08, 0.3, 900); }
    else if (k === 'whoosh') { noise(0.18, 0.18, 2500); }
    else if (k === 'dizzy') { tone(900, 0.5, 'sine', 0.08, -500); }
    else if (k === 'named') { [660, 880, 1100].forEach((f, i) => setTimeout(() => tone(f, 0.14, 'square', 0.07), i * 90)); }
    else if (k === 'fight') { tone(520, 0.12, 'square', 0.1); setTimeout(() => tone(780, 0.2, 'square', 0.1), 120); }
  };

  // ---------- pantallas ----------
  const show = id => {
    ['menu', 'select', 'taller'].forEach(s => $(s).classList.toggle('on', s === id));
    $('hud').classList.toggle('on', id === 'game');
    Input.touch.enabled = id === 'game' && isTouch;
    if (id !== 'game') running = false;
    if (id === 'taller') openTaller();
  };
  document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
  const toast = msg => { const t = $('toast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(toast.h); toast.h = setTimeout(() => t.style.display = 'none', 2200); };

  // ---------- selección ----------
  let mode = 'cpu', level = 1, pick = [0, 1], picking = 0;
  const LEVELS = ['Fácil', 'Normal', 'Difícil'];
  $('mDiff').onclick = () => { level = (level + 1) % 3; $('mDiff').textContent = 'Dificultad: ' + LEVELS[level]; };
  $('mHelp').onclick = () => $('help').classList.add('on');
  $('helpOk').onclick = () => $('help').classList.remove('on');
  // escena animada del menú
  (function hero() {
    const cv = $('hero'), c = cv.getContext('2d');
    const A = Characters.compile(Characters.OFICIALES[0]), Bc = Characters.compile(Characters.OFICIALES[1]);
    let fr = 0;
    const tick = () => {
      if ($('menu').classList.contains('on')) {
        fr++;
        c.clearRect(0, 0, cv.width, cv.height);
        const g = c.createRadialGradient(280, 170, 10, 280, 170, 120);
        g.addColorStop(0, 'rgba(255,160,100,0.35)'); g.addColorStop(1, 'rgba(255,160,100,0)');
        c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
        c.fillStyle = 'rgba(0,0,0,0.3)';
        c.beginPath(); c.ellipse(190, 238, 50, 9, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(370, 238, 50, 9, 0, 0, 7); c.fill();
        const b = Math.sin(fr * 0.08) * 3;
        const pa = Object.assign({}, A.poses.idle); pa.lean += b * 0.5; pa.ua += b; pa.ub += b;
        const pb = Object.assign({}, Bc.poses.idle); pb.lean -= b * 0.5; pb.ua -= b; pb.ub -= b;
        Render.drawFighter(c, A.def.rig, pa, 190, 236, 1, { frame: fr });
        Render.drawFighter(c, Bc.def.rig, pb, 370, 236, -1, { frame: fr, scale: 0.92 });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();
  $('mCPU').onclick = () => { audioOn(); mode = 'cpu'; openSelect(); };
  $('m2P').onclick = () => { audioOn(); mode = '2p'; openSelect(); };
  $('mTaller').onclick = () => { audioOn(); show('taller'); };

  function portrait(cv, def) {
    const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    const comp = Characters.compile(def);
    const sc = Math.min(1.25, 230 / comp.alto);
    Render.drawFighter(c, def.rig, comp.poses.idle, cv.width / 2, cv.height - 14, 1, { scale: sc });
  }
  function openSelect() {
    picking = 0; pick[1] = Math.min(pick[1], roster.length - 1); pick[0] = Math.min(pick[0], roster.length - 1);
    renderRoster(); show('select');
  }
  function renderRoster() {
    const el = $('roster'); el.innerHTML = '';
    $('selTitle').textContent = mode === 'cpu' ? 'Elige tu luchador y el de la CPU' : 'Elige luchadores';
    $('selHint').textContent = picking === 0 ? 'Toca para elegir el Jugador 1' : (mode === 'cpu' ? 'Ahora elige a la CPU' : 'Ahora elige el Jugador 2');
    roster.forEach((r, i) => {
      const d = document.createElement('div'); d.className = 'card' + (pick[0] === i ? ' p1' : '') + (pick[1] === i ? ' p2' : '');
      const cv = document.createElement('canvas'); cv.width = 220; cv.height = 240; d.appendChild(cv);
      d.insertAdjacentHTML('beforeend', `<b></b><span></span>${pick[0] === i ? '<i class="tag t1">J1</i>' : ''}${pick[1] === i ? `<i class="tag t2">${mode === 'cpu' ? 'CPU' : 'J2'}</i>` : ''}${r.community ? '<i class="tag com">COMUNIDAD</i>' : ''}`);
      d.querySelector('b').textContent = r.def.meta.nombre; d.querySelector('span').textContent = r.def.meta.lema || ('por ' + (r.def.meta.autor || 'anónimo'));
      d.onclick = () => { pick[picking] = i; picking = 1 - picking; renderRoster(); };
      el.appendChild(d); portrait(cv, r.def);
    });
  }
  $('sGo').onclick = () => { audioOn(); startMatch(); };

  // ---------- partida ----------
  let state = null, defs = null, cpu = null, running = false, paused = false, debug = false, acc = 0, lastT = 0, overShown = false;
  function goFull() {
    if (!isTouch) return;
    try { const de = document.documentElement; const r = de.requestFullscreen && de.requestFullscreen(); r && r.catch && r.catch(() => {}); } catch (_) {}
    try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (_) {}
  }
  function startMatch() {
    defs = [Characters.compile(roster[pick[0]].def), Characters.compile(roster[pick[1]].def)];
    state = Sim.create(defs, (Date.now() & 0xffff) | 1);
    cpu = mode === 'cpu' ? Input.makeCPU(1, level) : null;
    Render.reset(); paused = false; overShown = false; acc = 0; lastT = performance.now();
    $('pause').classList.remove('on');
    goFull(); show('game'); resize(); running = true;
    requestAnimationFrame(loop);
  }

  // ---------- tamaño y vista ----------
  let dpr = 1, view = { x: 0, y: 0, s: 1 };
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = innerWidth, H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const s = Math.min(W / Render.W, H / Render.H);
    const portraitMode = H > W;
    view = { s, x: (W - Render.W * s) / 2, y: portraitMode ? Math.max(0, (H - Render.H * s) * 0.18) : (H - Render.H * s) / 2 };
    Input.layout(W, H, mode === 'cpu' ? 'single' : 'dual');
  }
  addEventListener('resize', resize);

  function loop(t) {
    if (!running) return;
    const dt = Math.min(100, t - lastT); lastT = t;
    if (!paused) {
      acc += dt;
      let n = 0;
      while (acc >= 1000 / 60 && n < 5) {
        const a = Input.keyboardBits(0) | Input.touchBits(0);
        const b = cpu ? cpu(state, defs) : (Input.keyboardBits(1) | Input.touchBits(1));
        Sim.step(state, a, b, defs);
        Render.consumeEvents(state, sfx, defs);
        acc -= 1000 / 60; n++;
      }
      if (n === 5) acc = 0;
    }
    draw();
    if (state.phase === 'over' && !overShown && state.frame > 0) {
      overShown = true;
      setTimeout(() => { if (running) openPause(true); }, 1600);
    }
    requestAnimationFrame(loop);
  }
  function draw() {
    const W = innerWidth, H = innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0b0816'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(view.x, view.y); ctx.scale(view.s, view.s);
    ctx.beginPath(); ctx.rect(0, 0, Render.W, Render.H); ctx.clip();
    Render.frame(ctx, state, defs, { debug });
    ctx.restore();
    if (H > W && isTouch) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '600 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText('Gira el teléfono para jugar en grande ⟲', W / 2, view.y + Render.H * view.s + 24);
    }
    Input.drawTouch(ctx);
  }

  // ---------- pausa / fin ----------
  function moveList() {
    const el = $('pMoves'); el.innerHTML = '';
    const d = defs[0].def;
    const row = (a, b) => { const r = document.createElement('div'); r.className = 'mrow'; const x = document.createElement('span'); x.textContent = a; const y = document.createElement('code'); y.textContent = b; r.append(x, y); el.appendChild(r); };
    const sec = t => { const h = document.createElement('div'); h.className = 'msec'; h.textContent = t; el.appendChild(h); };
    const h = document.createElement('b'); h.textContent = d.meta.nombre; el.appendChild(h);
    if (d.meta.dato) { const p = document.createElement('p'); p.className = 'dato'; p.textContent = d.meta.dato; el.appendChild(p); }
    sec('Combos');
    const names = Object.fromEntries(d.moves.map(m => [m.id, m.nombre]));
    for (const c of d.combos || []) row(c.nombre, c.secuencia.map(t => t === 'perfecto' ? 'Bloqueo perfecto' : names[t]).join(' → '));
    sec('Defensa');
    row('Bloqueo perfecto', '← justo antes del golpe');
    row('Esquiva', '↓ + AGARRE');
    row('Escape de agarre', 'AGARRE al ser agarrado');
    row('Recuperación aérea', 'botón al caer');
    row('Levantarse rodando', '← o → en el suelo');
    sec('Golpes');
    for (const m of d.moves) row(m.nombre, Characters.notation(m));
    const sci = d.moves.filter(m => m.ciencia);
    if (sci.length) {
      sec('La ciencia detrás');
      for (const m of sci) { const r = document.createElement('div'); r.className = 'sci'; const b = document.createElement('b'); b.textContent = m.nombre + ': '; r.append(b, document.createTextNode(m.ciencia)); el.appendChild(r); }
    }
  }
  function openPause(over) {
    paused = true; moveList();
    $('pTitle').textContent = over ? `Gana ${defs[state.winner].def.meta.nombre}` : 'Pausa';
    $('pResume').style.display = over ? 'none' : 'block';
    $('pause').classList.add('on');
  }
  $('bPause').onclick = () => openPause(false);
  addEventListener('keydown', e => { if (e.code === 'Escape' && running) { if (paused && state.phase !== 'over') { paused = false; $('pause').classList.remove('on'); } else openPause(state.phase === 'over'); } });
  $('pResume').onclick = () => { paused = false; lastT = performance.now(); $('pause').classList.remove('on'); };
  $('pRematch').onclick = () => startMatch();
  $('pChars').onclick = () => { $('pause').classList.remove('on'); openSelect(); };
  $('pMenu').onclick = () => { $('pause').classList.remove('on'); show('menu'); };
  $('pDebug').onclick = () => { debug = !debug; $('pDebug').textContent = 'Ver cajas de golpe: ' + (debug ? 'sí' : 'no'); };

  // ---------- taller ----------
  let tSel = 0, prevAnim = null;
  function openTaller() {
    const l = $('tList'); l.innerHTML = '';
    roster.forEach((r, i) => {
      const b = document.createElement('button'); b.className = 'chip' + (i === tSel ? ' on' : '');
      b.textContent = r.def.meta.nombre + (r.community ? ' ★' : '');
      b.onclick = () => { tSel = i; openTaller(); };
      l.appendChild(b);
    });
    $('json').value = JSON.stringify(roster[tSel].def, null, 2);
    validateText();
    startPreview();
  }
  function parse() { try { return JSON.parse($('json').value); } catch (e) { return { __err: e.message }; } }
  function validateText() {
    const d = parse();
    const rep = $('report');
    if (d.__err) { rep.innerHTML = `<div class="bad">JSON mal formado</div><div class="mono"></div>`; rep.querySelector('.mono').textContent = d.__err; return null; }
    const r = Characters.validate(d);
    const pct = Math.min(100, Math.round(r.costo / r.presupuesto * 100));
    rep.innerHTML = `<div class="${r.ok ? 'ok' : 'bad'}">${r.ok ? '✓ Personaje válido' : '✗ ' + r.errores.length + ' problema(s)'}</div>
      <div style="margin-top:6px">Balance: <b>${r.costo}</b> / ${r.presupuesto} puntos</div>
      <div class="bar ${r.costo > r.presupuesto ? 'over' : ''}"><i style="width:${pct}%"></i></div>
      <div class="mono" id="desg"></div><ul id="errs" style="padding-left:18px;margin:6px 0"></ul>`;
    $('desg').textContent = r.desglose.map(([k, v]) => `${k}: ${v}`).join(' · ');
    const ul = $('errs');
    r.errores.forEach(e => { const li = document.createElement('li'); li.className = 'bad'; li.style.fontWeight = 400; li.textContent = e; ul.appendChild(li); });
    r.avisos.forEach(e => { const li = document.createElement('li'); li.className = 'warn'; li.textContent = e; ul.appendChild(li); });
    if (r.ok) prevDef = Characters.compile(d);
    return r.ok ? d : null;
  }
  let prevDef = null, prevT = 0, prevMove = -1;
  function startPreview() {
    if (prevAnim) cancelAnimationFrame(prevAnim);
    prevT = 0; prevMove = -1;
    const cv = $('prev'), c = cv.getContext('2d');
    let last = performance.now(), accP = 0, vis = null;
    const tick = now => {
      if (!$('taller').classList.contains('on')) { prevAnim = null; return; }
      accP += now - last; last = now;
      while (accP > 1000 / 30) { prevT++; accP -= 1000 / 30; }
      if (prevDef) {
        const d = prevDef.def, P = prevDef.poses, moves = d.moves;
        // ciclo: idle 30 cuadros, luego cada movimiento
        let label = 'idle', pose = P.idle, hb = null, t = prevT;
        const seq = [{ idle: 24 }, ...moves.map((m, i) => ({ i, len: m.startup + m.active + m.recovery + 10 }))];
        const total = seq.reduce((a, s) => a + (s.idle || s.len), 0);
        t = t % total;
        for (const s of seq) {
          const len = s.idle || s.len;
          if (t < len) {
            if (s.idle === undefined) {
              const m = moves[s.i]; const base = m.estado === 'agachado' ? P.crouch : m.estado === 'aire' ? P.jump : P.idle;
              const [pw, ph, palt] = m.poses.map(n => P[n]);
              const tt = t - 5;
              if (tt < 0) pose = base;
              else if (tt < m.startup) pose = Render.lerpPose(base, pw, Render.ease((tt + 1) / m.startup));
              else if (tt < m.startup + m.active) { pose = (palt && Math.floor((tt - m.startup) / 4) % 2) ? palt : ph; hb = m; }
              else pose = Render.lerpPose(ph, base, Render.ease((tt - m.startup - m.active) / Math.max(1, m.recovery)));
              label = `${m.nombre} · ${Characters.notation(m)}\n${m.startup}/${m.active}/${m.recovery} cuadros · daño ${m.damage}${m.golpes > 1 ? ' ×' + m.golpes : ''}${m.efecto ? ' · ' + m.efecto : ''}${m.lanza ? ' · lanza' : ''}${m.invul ? ' · invulnerable ' + m.invul : ''}`;
            }
            break;
          }
          t -= len;
        }
        vis = vis ? Render.lerpPose(vis, pose, 0.6) : pose;
        c.clearRect(0, 0, cv.width, cv.height);
        const sc = Math.min(1, 210 / prevDef.alto), fx = 110, fy = cv.height - 24;
        c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, fy, cv.width, 2);
        Render.drawFighter(c, d.rig, vis, fx, fy, 1, { scale: sc, frame: prevT });
        if (hb) {
          const h = hb.hitbox;
          c.strokeStyle = '#f43f5e'; c.fillStyle = 'rgba(244,63,94,0.25)'; c.lineWidth = 2;
          const x = fx + h.x * sc, y = fy - (h.y + h.h / 2) * sc;
          c.fillRect(x, y, h.w * sc, h.h * sc); c.strokeRect(x, y, h.w * sc, h.h * sc);
        }
        c.strokeStyle = 'rgba(74,222,128,0.6)'; c.lineWidth = 1.5;
        c.strokeRect(fx - prevDef.ancho * sc, fy - prevDef.alto * sc, prevDef.ancho * 2 * sc, prevDef.alto * sc);
        $('prevLbl').textContent = label;
      }
      prevAnim = requestAnimationFrame(tick);
    };
    prevAnim = requestAnimationFrame(tick);
  }
  let valT = null;
  $('json').addEventListener('input', () => { clearTimeout(valT); valT = setTimeout(validateText, 350); });
  $('tVal').onclick = () => { const ok = validateText(); toast(ok ? 'Personaje válido' : 'Revisa los problemas'); };
  $('tSave').onclick = () => {
    const d = validateText(); if (!d) { toast('No se puede guardar: tiene errores'); return; }
    const i = roster.findIndex(r => r.def.meta.id === d.meta.id);
    if (i >= 0 && !roster[i].community) { toast('Ese id es de un personaje oficial: cambia meta.id'); return; }
    if (i >= 0) roster[i] = { def: d, community: true }; else roster.push({ def: d, community: true });
    tSel = i >= 0 ? i : roster.length - 1;
    saveCommunity(); openTaller(); toast(`${d.meta.nombre} ya está en la selección`);
  };
  $('tNew').onclick = () => {
    const t = JSON.parse(JSON.stringify(Characters.OFICIALES[0]));
    t.meta = { id: 'mi-cientifico', nombre: 'Mi Científico', autor: 'tu nombre', version: 1, lema: 'Creado en el taller', dato: 'Escribe aquí quién fue y qué descubrió.' };
    t.rig.paleta = { piel: '#e0ac69', ropa: '#1d3557', acento: '#2a9d8f', ojos: '#111111', manos: '#e0ac69', mangas: '#14243a' };
    t.rig.piezas = [{ tipo: 'banda' }];
    $('json').value = JSON.stringify(t, null, 2); validateText(); toast('Plantilla lista: edita y guarda');
  };
  $('tCopy').onclick = async () => { try { await navigator.clipboard.writeText($('json').value); toast('JSON copiado'); } catch (_) { $('json').select(); toast('Selecciona y copia manualmente'); } };

  $('tDet').onclick = () => {
    const ds = [Characters.compile(roster[0].def), Characters.compile(roster[Math.min(1, roster.length - 1)].def)];
    const inputs = (() => { let r = 99; const out = []; let a = 0, b = 0; for (let i = 0; i < 6000; i++) { if (i % 5 === 0) { r = (Math.imul(r, 1103515245) + 12345) >>> 0; a = (r >>> 9) & 127; r = (Math.imul(r, 1103515245) + 12345) >>> 0; b = (r >>> 9) & 127; } out.push([a, b]); } return out; })();
    const play = (from, s) => { for (let i = from; i < inputs.length; i++) { Sim.step(s, inputs[i][0], inputs[i][1], ds); if (s.phase === 'over') { s.phase = 'fight'; } } return s; };
    const t0 = performance.now();
    const A = play(0, Sim.create(ds, 7));
    const t1 = performance.now();
    const B2 = play(0, Sim.create(ds, 7));
    // rollback: avanzar 3000, guardar, avanzar con inputs equivocados 8 cuadros, restaurar y re-simular
    const s = Sim.create(ds, 7); for (let i = 0; i < 3000; i++) Sim.step(s, inputs[i][0], inputs[i][1], ds);
    const snap = Sim.clone(s); for (let i = 0; i < 8; i++) Sim.step(s, 127, 0, ds);
    const C = play(3000, snap);
    const ms = (t1 - t0) / 6000;
    const same = Sim.checksum(A) === Sim.checksum(B2) && Sim.checksum(A) === Sim.checksum(C);
    $('detOut').textContent = `Partida 1: ${Sim.checksum(A)}\nPartida 2: ${Sim.checksum(B2)}\nCon rollback: ${Sim.checksum(C)}\n${same ? '✓ Idénticas: la simulación es determinista' : '✗ Difieren'}\nVelocidad: ${(ms * 1000).toFixed(1)} µs por cuadro → re-simular 8 cuadros cuesta ${(ms * 8).toFixed(3)} ms (presupuesto: 16,7 ms)`;
  };

  // ---------- arranque ----------
  Input.attachKeyboard(); Input.attachTouch(canvas);
  resize();
  // fondo animado en el menú
  (function idleBg(t) {
    if (!running) {
      const W = innerWidth, H = innerHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#140f24'; ctx.fillRect(0, 0, W, H);
    }
    if (!running) requestAnimationFrame(idleBg);
  })();
  const restartIdle = () => {};
  window.__pelea = { roster, Sim, Characters, get state() { return state; } };
})();

