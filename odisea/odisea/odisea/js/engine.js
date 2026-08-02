/* ============================================================
   ODISEA CÓSMICA · engine.js
   MOTOR — estado, bucle, física, colisiones, input, podio.
   Orquesta Config + Worlds + Audio + Graphics.
   ============================================================ */
window.OC = window.OC || {};
OC.Engine = (function () {
  const C = OC.Config, SAGAS = OC.Sagas, A = OC.Audio, G = OC.Graphics;
  // La saga activa define los mundos y las preguntas. Se fija en el menú.
  let PLANETAS = SAGAS[0].worlds, PREGUNTAS = SAGAS[0].preguntas;
  const SUPERFICIE = ['mercurio', 'venus', 'litosfera', 'ecosistema'];

  let W = 0, H = 0, cv = null, stageEl = null;
  let last = performance.now();

  const state = {
    scene: 'menu', saga: SAGAS[0], sagaIndex: 0, level: 0, score: 0, lives: C.lives.start, nombre: '', curso: '',
    ship: { x: 0, y: 0, w: C.ship.w, h: C.ship.h, speed: 5, cd: 0 },
    bullets: [], enemies: [], powerups: [], particles: [], stars: [], bossShots: [],
    boss: null, bossPending: false, destroyed: 0, spawnT: 0, pending: false,
    speedBuff: 0, powerBuff: 0, storm: 0, eventT: 0, nextEvent: 9000, msgKilledBy: '', groundY: 0,
    temp: 0, tempActive: false, tempRate: 0, coolT: 0, tempWarned: false, currentQ: null, final: false,
    coins: 0, upgrades: { armadura: 0, armamento: 0, cadencia: 0, rayo_especial: 0, refrigeracion: 0 }, shield: 0, shieldMax: 0, invuln: 0
  };
  const keys = { left: false, right: false, fire: false };
  const $ = id => document.getElementById(id);

  /* -------- PODIO -------- */
  function loadLB() { try { return JSON.parse(localStorage.getItem('odisea_lb') || '[]'); } catch (e) { return (window.__lb || []); } }
  function saveLB(a) { try { localStorage.setItem('odisea_lb', JSON.stringify(a)); } catch (e) { window.__lb = a; } }
  async function pushToSheet(row) {
    if (!C.sheetEndpoint) return;
    try { await fetch(C.sheetEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row) }); } catch (e) {}
  }
  function fetchLeaderboard() {
    return new Promise(res => {
      if (!C.sheetEndpoint) { res(null); return; }
      const cb = '__lb_' + Date.now() + Math.floor(Math.random() * 9999);
      const s = document.createElement('script'); let done = false;
      const clean = () => { try { delete window[cb]; } catch (_) { window[cb] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); };
      const finish = v => { if (done) return; done = true; clearTimeout(t); clean(); res(v); };
      const t = setTimeout(() => finish(null), C.podium.fetchTimeoutMs);
      window[cb] = data => finish((data && data.top) ? data.top : null);
      s.onerror = () => finish(null);
      s.src = C.sheetEndpoint + (C.sheetEndpoint.indexOf('?') >= 0 ? '&' : '?') + 'action=top&limit=' + C.podium.topN + '&callback=' + cb + '&t=' + Date.now();
      document.body.appendChild(s);
    });
  }
  async function registrarPuntaje() {
    const p = PLANETAS[Math.min(state.level, PLANETAS.length - 1)];
    const row = { nombre: state.nombre || 'Anónimo', curso: state.curso || '', mision: p.num, planeta: p.nombre, puntaje: state.score, fecha: new Date().toISOString().slice(0, 10) };
    const lb = loadLB(); lb.push(row); lb.sort((a, b) => b.puntaje - a.puntaje); saveLB(lb.slice(0, C.podium.localMax));
    await pushToSheet(row);
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  async function renderPodio(elId, incluirActual) {
    const el = $(elId); if (!el) return;
    el.innerHTML = '<div class="podio-empty">Consultando el podio…</div>';
    let lb = await fetchLeaderboard(); const online = !!lb; if (!lb) lb = loadLB();
    lb = lb.slice().sort((a, b) => b.puntaje - a.puntaje);
    const med = ['🥇', '🥈', '🥉', '4', '5']; let html = '';
    const top = lb.slice(0, C.podium.topN);
    if (top.length === 0) html = '<div class="podio-empty">Aún no hay puntajes registrados.</div>';
    top.forEach((r, i) => {
      const me = (r.nombre === state.nombre && Number(r.puntaje) === state.score);
      html += `<div class="podio-row ${me ? 'me' : ''}"><span class="nm"><span class="med">${med[i] || (i + 1)}</span>${escapeHtml(r.nombre)}${r.curso ? ' · ' + escapeHtml(r.curso) : ''}</span><span class="sc">${r.puntaje}</span></div>`;
    });
    if (incluirActual) html += `<div class="podio-row me"><span class="nm"><span class="med">▸</span>${escapeHtml(state.nombre || 'TÚ')} (en curso)</span><span class="sc">${state.score}</span></div>`;
    html += `<div class="podio-empty" style="margin-top:6px;opacity:.7">${online ? '🌐 Podio del curso' : '💾 Podio local (sin conexión al Sheet)'}</div>`;
    el.innerHTML = html;
  }

  /* -------- PANTALLAS -------- */
  const screens = ['menu', 'nombre', 'intro', 'briefing', 'tienda', 'levelup', 'q-screen', 'gameover', 'victoria'];
  function show(id) {
    screens.forEach(s => { const el = $(s); if (el) el.classList.toggle('on', s === id); });
    $('hud').style.display = (state.scene === 'playing') ? 'flex' : 'none';
    $('hint').style.display = (state.scene === 'playing') ? 'block' : 'none';
    $('buffs').style.display = (state.scene === 'playing') ? 'block' : 'none';
    $('touch').classList.toggle('on', state.scene === 'playing' && isTouch);
    if (state.scene !== 'playing') clearPad();
  }

  /* -------- HUD -------- */
  function drawHUD() {
    const p = PLANETAS[state.level];
    $('hud-mision').textContent = 'MISIÓN ' + p.num + ' · ' + p.nombre.toUpperCase();
    $('hud-puntos').textContent = 'PTS ' + state.score;
    $('hud-vidas').textContent = (state.lives > 0 ? ('♥ '.repeat(state.lives)).trim() : '—');
    let bh = '<span class="b-coin">🪙 ' + state.coins + '</span>';
    if (state.shieldMax > 0) bh += '<span class="b-shield">🛡️ ' + state.shield + '</span>';
    if (state.speedBuff > 0) bh += '<span class="b-vel">⚡ VEL ' + Math.ceil(state.speedBuff / 1000) + '</span>';
    if (state.powerBuff > 0) bh += '<span class="b-pow">✦ PODER ' + Math.ceil(state.powerBuff / 1000) + '</span>';
    $('buffs').innerHTML = bh;
  }

  /* -------- ESTRELLAS -------- */
  function initStars() { state.stars = []; for (let i = 0; i < C.stars.count; i++) state.stars.push({ x: Math.random(), y: Math.random(), s: Math.random() * 1.6 + 0.4, v: 0.15 + Math.random() * 0.5 }); }
  function baseSpeed() { return C.ship.baseSpeed + state.level * C.ship.speedPerLevel; }

  /* -------- MENÚ DE SAGAS -------- */
  function buildMenu() {
    const cont = $('saga-cards'); if (!cont) return;
    cont.innerHTML = '';
    SAGAS.forEach((s, i) => {
      const card = document.createElement('button');
      card.className = 'saga-card';
      card.style.setProperty('--acc', s.color);
      card.innerHTML = '<span class="ic">' + (s.icono || '★') + '</span><span class="ti">' + escapeHtml(s.titulo) + '</span><span class="su">' + escapeHtml(s.subtitulo) + '</span>';
      card.onclick = () => { A.unlock(); selectSaga(i); };
      cont.appendChild(card);
    });
  }
  function resetRun() {
    state.level = 0; state.score = 0; state.lives = C.lives.start;
    state.coins = 0; state.upgrades = { armadura: 0, armamento: 0, cadencia: 0, rayo_especial: 0, refrigeracion: 0 };
    state.shield = 0; state.shieldMax = 0; state.final = false; state.msgKilledBy = ''; state.invuln = 0;
  }
  function selectSaga(i) {
    state.sagaIndex = i; state.saga = SAGAS[i];
    PLANETAS = state.saga.worlds; PREGUNTAS = state.saga.preguntas;
    resetRun();
    state.scene = 'nombre'; show('nombre'); setTimeout(() => $('in-nombre').focus(), 50);
  }
  function showIntro() {
    const s = state.saga;
    $('intro-sello').textContent = s.intro.sello;
    $('intro-titulo').textContent = s.titulo;
    $('intro-sub').textContent = 'de ' + s.intro.narrador;
    $('intro-texto').textContent = s.intro.texto;
    $('intro-firma').textContent = '— ' + s.intro.narrador;
    state.scene = 'intro'; show('intro');
  }

  /* -------- JEFE FINAL DE SAGA (El gran Profesor Felipe) -------- */
  function startFinalBoss() {
    const s = state.saga, last = PLANETAS[PLANETAS.length - 1]; resizeNow();
    state.scene = 'playing'; state.final = true;
    state.bullets = []; state.enemies = []; state.powerups = []; state.particles = []; state.bossShots = [];
    state.bossPending = false; state.destroyed = 0; state.spawnT = 0; state.pending = false;
    state.speedBuff = 0; state.powerBuff = 0; state.storm = 0; state.tempActive = false; state.msgKilledBy = ''; state.invuln = 0;
    state.ship.speed = baseSpeed();
    state.shieldMax = state.upgrades.armadura; state.shield = state.shieldMax;
    state.groundY = SUPERFICIE.includes(last.scene) ? H * 0.84 : H + 40;
    state.ship.x = W / 2 - state.ship.w / 2;
    state.ship.y = Math.min(H - state.ship.h - 14, state.groundY - state.ship.h - 6);
    initStars();
    const fb = s.finalBoss, hp = fb.hp || C.finalBoss.hpDefault;
    state.boss = { name: fb.nombre, color: fb.color, x: W / 2 - C.finalBoss.w / 2, y: H * C.boss.yFactor, w: C.finalBoss.w, h: C.finalBoss.h, hp: hp, maxhp: hp, vx: C.finalBoss.moveVx, cd: 400, t: 0, look: fb.look, shot: fb.shot, final: true, burst: 0 };
    drawHUD(); show('playing'); A.boss(); announce('★ JEFE FINAL: ' + fb.nombre, '#ffd76b');
  }

  /* -------- INICIO DE MISIÓN -------- */
  function startBriefing() {
    const p = PLANETAS[state.level];
    $('brief-sello').textContent = p.autor.sello;
    $('brief-titulo').textContent = 'Misión ' + p.num + ' · ' + p.nombre;
    $('brief-sub').textContent = p.sub;
    $('brief-texto').textContent = p.contexto;
    $('brief-boss').textContent = '⚠ Guardián de la misión: ' + p.boss.nombre;
    state.scene = 'briefing'; show('briefing'); A.stopAmbient();
  }
  function startLevel() {
    const p = PLANETAS[state.level]; resizeNow();
    state.scene = 'playing';
    state.bullets = []; state.enemies = []; state.powerups = []; state.particles = []; state.bossShots = [];
    state.boss = null; state.bossPending = false; state.destroyed = 0; state.spawnT = 0; state.pending = false;
    state.speedBuff = 0; state.powerBuff = 0; state.storm = 0; state.eventT = 0;
    state.nextEvent = C.events.firstMin + Math.random() * C.events.firstRand;
    state.tempActive = !!p.cooling; state.temp = 0; state.tempWarned = false; state.final = false; state.msgKilledBy = ''; state.invuln = 0;
    state.tempRate = C.temperature.rate * (1 - state.upgrades.refrigeracion * 0.2);
    state.coolT = C.temperature.coolFirst;
    state.shieldMax = state.upgrades.armadura; state.shield = state.shieldMax;
    state.ship.speed = baseSpeed();
    state.groundY = SUPERFICIE.includes(p.scene) ? H * 0.84 : H + 40;
    state.ship.x = W / 2 - state.ship.w / 2;
    state.ship.y = Math.min(H - state.ship.h - 14, state.groundY - state.ship.h - 6);
    initStars(); drawHUD(); show('playing'); A.ambient(p);
  }

  /* -------- SPAWN -------- */
  function spawnEnemy(forceAlien) {
    const meteor = forceAlien ? false : (Math.random() < C.enemy.alienChance);
    const size = meteor ? 20 + Math.random() * 16 : 22;
    const spd = (C.enemy.baseFall + state.level * C.enemy.fallPerLevel) * (0.7 + Math.random() * 0.6);
    state.enemies.push({ x: 20 + Math.random() * (W - 40 - size), y: -size, w: size, h: size, vy: spd, vx: (Math.random() - 0.5) * 1.2, type: meteor ? 'meteor' : 'alien', rot: 0, vr: (Math.random() - 0.5) * 0.1, seed: Math.random() * 6.28 });
  }
  function spawnWave() {
    const n = C.events.waveCount, gap = W / (n + 1);
    for (let i = 0; i < n; i++) state.enemies.push({ x: gap * (i + 1) - 11, y: -30 - (i % 2) * 22, w: 22, h: 22, vy: 1.1 + state.level * 0.1, vx: 0, type: 'alien', rot: 0, vr: 0, seed: i });
  }
  function spawnPowerup(kind) {
    if (kind === 'vida' && state.lives >= C.lives.max) kind = 'vel';
    state.powerups.push({ x: 20 + Math.random() * (W - 56), y: -24, w: C.powerups.size, h: C.powerups.size, vy: C.powerups.fallSpeed, t: 0, kind });
  }
  function randomPowerupKind() {
    const r = Math.random(), w = C.powerups.weights;
    return r < w.vida ? 'vida' : (r < w.vida + w.vel ? 'vel' : 'pow');
  }

  /* -------- EVENTOS -------- */
  function triggerEvent() {
    if (Math.random() < 0.5) { state.storm = C.events.stormMs; announce('☄ TORMENTA DE METEORITOS', '#f2a93b'); }
    else { announce('🛸 OLEADA ENEMIGA', '#ff6bd0'); spawnWave(); }
    A.event();
  }
  function announce(t, c) { const b = $('banner'); b.textContent = t; b.style.color = c; b.classList.add('show'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), 2400); }

  /* -------- DISPARO / PARTÍCULAS -------- */
  function fire() {
    if (state.ship.cd > 0) return;
    const up = state.upgrades, rapid = state.powerBuff > 0;
    state.ship.cd = Math.max(5, (rapid ? C.ship.fireCdRapid : C.ship.fireCd) - up.cadencia * 2);
    const bx = state.ship.x + state.ship.w / 2 - 2, by = state.ship.y - 6, sp = C.bullet.speed;
    const pierce = up.rayo_especial >= 1;
    const bd = 1 + (up.rayo_especial >= 2 ? 1 : 0);   // daño a jefes
    const triple = rapid || up.armamento >= 2;
    const doble = !triple && up.armamento >= 1;
    const mkB = (x, vx) => ({ x, y: by, w: C.bullet.w + (pierce ? 2 : 0), h: C.bullet.h, vy: sp, vx: vx || 0, pierce, bd });
    if (triple) {
      state.bullets.push(mkB(bx, 0));
      state.bullets.push(mkB(bx - 9, -C.bullet.spreadVx));
      state.bullets.push(mkB(bx + 9, C.bullet.spreadVx));
    } else if (doble) {
      state.bullets.push(mkB(bx - 6, 0));
      state.bullets.push(mkB(bx + 6, 0));
    } else {
      state.bullets.push(mkB(bx, 0));
    }
    A.shoot();
  }
  function boom(x, y, color) { for (let i = 0; i < 12; i++) { const a = Math.random() * 6.28, s = 1 + Math.random() * 3.5; state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color }); } }
  function hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function shake() { stageEl.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 180 }); }
  // Daño a la nave: el escudo (armadura) absorbe impactos antes de perder vida.
  // Daño a la nave: ventana de invulnerabilidad (i-frames) para no encajar
  // varios impactos en un mismo contacto (p. ej. rozar al jefe). El escudo
  // (armadura) absorbe impactos antes de perder vida.
  function hitShip(causa) {
    if (state.invuln > 0) return;
    state.invuln = C.ship.iframesMs;
    if (state.shield > 0) { state.shield--; A.power(); drawHUD(); shake(); boom(state.ship.x + state.ship.w / 2, state.ship.y, '#5bd6ff'); return; }
    loseLife(causa);
  }

  /* -------- JEFE -------- */
  function spawnBoss() {
    const p = PLANETAS[state.level];
    state.enemies = [];
    state.boss = { name: p.boss.nombre, color: p.boss.color, x: W / 2 - C.boss.w / 2, y: H * C.boss.yFactor, w: C.boss.w, h: C.boss.h, hp: p.boss.hp, maxhp: p.boss.hp, vx: C.boss.vxBase + state.level * C.boss.vxPerLevel, cd: 0, t: 0, look: p.boss.look || 'birrete', shot: p.boss.shot || 'bolt' };
    announce('☠ JEFE: ' + p.boss.nombre, '#ff4d57'); A.boss();
  }
  function updateBoss(dt) {
    const b = state.boss; b.t += dt;
    b.x += b.vx; if (b.x < 8) { b.x = 8; b.vx *= -1; } if (b.x > W - b.w - 8) { b.x = W - b.w - 8; b.vx *= -1; }
    b.y = H * C.boss.yFactor + Math.sin(b.t * (b.final ? 0.0032 : 0.002)) * (b.final ? 26 : 18);
    b.cd -= dt;
    if (b.cd <= 0) {
      const k = b.shot;
      const sz = k === 'roca' ? 16 : (k === 'roca_fuerte' || k === 'magma') ? 20 : (k === 'electron' ? 11 : (k === 'nota' ? 8 : 10));
      const baseSp = C.boss.shotSpeedBase + state.level * C.boss.shotSpeedPerLevel;
      const mk = (cxp, vy, vx) => ({ x: cxp - sz / 2, y: b.y + b.h, w: sz, h: (k === 'nota' ? 14 : sz), vy, vx: vx || 0, kind: k, sway: Math.random() * 6.28, rot: 0, vr: (Math.random() - 0.5) * 0.2 });
      if (b.final) {
        b.cd = C.finalBoss.shotCd;
        const sp = baseSp + 1.4;
        state.bossShots.push(mk(b.x + b.w / 2, sp, 0));
        state.bossShots.push(mk(b.x + b.w * 0.32, sp * 0.95, -1.6));
        state.bossShots.push(mk(b.x + b.w * 0.68, sp * 0.95, 1.6));
        b.burst = (b.burst || 0) + 1;
        if (b.burst % C.finalBoss.spreadEvery === 0) { // andanada más ancha
          state.bossShots.push(mk(b.x + b.w * 0.15, sp * 0.9, -3.0));
          state.bossShots.push(mk(b.x + b.w * 0.85, sp * 0.9, 3.0));
        }
      } else {
        b.cd = C.boss.shotCdBase - state.level * C.boss.shotCdPerLevel;
        state.bossShots.push(mk(b.x + b.w / 2, baseSp, 0));
        if (state.level >= C.boss.tripleFromLevel) {
          state.bossShots.push(mk(b.x + 12, baseSp * 0.9, 0));
          state.bossShots.push(mk(b.x + b.w - 12, baseSp * 0.9, 0));
        }
      }
      if (k === 'nota') A.noteMusical();
      else if (k === 'roca' || k === 'roca_fuerte' || k === 'magma') A.explosion();
      else if (k === 'electron') A.power();
    }
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      if (hit(state.bullets[i], b)) {
        b.hp -= (state.bullets[i].bd || 1); boom(state.bullets[i].x, state.bullets[i].y, b.color); state.bullets.splice(i, 1); A.explosion();
        state.score += C.score.bossHit; drawHUD();
        if (b.hp <= 0) { boom(b.x + b.w / 2, b.y + b.h / 2, b.color); const fue = b.final; state.coins += fue ? C.coins.perFinalDefeat : C.coins.perBossDefeat; state.boss = null; state.bossShots = []; if (fue) victoria(); else completeLevel(); return; }
      }
    }
    if (hit(state.ship, b)) hitShip('el jefe ' + b.name);
  }

  /* -------- BUCLE -------- */
  function loop(now) { const dt = Math.min(40, now - last); last = now; if (state.scene === 'playing') update(dt); render(); requestAnimationFrame(loop); }

  function update(dt) {
    const p = PLANETAS[state.level], sh = state.ship;
    const spd = sh.speed * (state.speedBuff > 0 ? C.buffs.speedMult : 1);
    if (keys.left) sh.x -= spd; if (keys.right) sh.x += spd;
    sh.x = Math.max(6, Math.min(W - sh.w - 6, sh.x));
    if (keys.fire) fire(); if (sh.cd > 0) sh.cd--;
    if (state.speedBuff > 0) state.speedBuff -= dt;
    if (state.powerBuff > 0) state.powerBuff -= dt;
    if (state.invuln > 0) state.invuln -= dt;
    if (state.speedBuff > 0 || state.powerBuff > 0) drawHUD();

    state.stars.forEach(s => { s.y += s.v * 0.004; if (s.y > 1) { s.y = 0; s.x = Math.random(); } });

    // TEMPERATURA (Venus)
    if (state.tempActive) {
      const T = C.temperature;
      state.temp += state.tempRate * dt * (state.boss ? T.bossHeatMult : 1);
      state.coolT -= dt;
      if (state.coolT <= 0) { state.coolT = T.coolIntervalMin + Math.random() * T.coolIntervalRand; spawnPowerup('frio'); }
      if (!state.tempWarned && state.temp >= T.warnAt) { state.tempWarned = true; announce('🔥 ¡SOBRECALENTAMIENTO!', '#ff4d57'); A.overheat(); }
      if (state.temp < T.warnResetBelow) state.tempWarned = false;
      if (state.temp >= T.maxTemp) { state.temp = T.maxTemp; state.msgKilledBy = 'el sobrecalentamiento del casco'; gameOver(); return; }
      drawHUD();
    }

    if (!state.boss) {
      state.spawnT += dt;
      const rate = Math.max(C.spawn.baseMin, p.baseSpawn - state.level * C.spawn.perLevelReduce);
      if (state.spawnT > rate) { state.spawnT = 0; spawnEnemy(); if (Math.random() < C.spawn.doubleChance) setTimeout(spawnEnemy, C.spawn.doubleDelay); }
      if (state.storm > 0) { state.storm -= dt; if (Math.random() < C.events.stormSpawnChance) spawnEnemy(false); }
      state.eventT += dt;
      if (state.eventT > state.nextEvent) { state.eventT = 0; state.nextEvent = C.events.nextMin + Math.random() * C.events.nextRand; triggerEvent(); }
      if (Math.random() < C.powerups.chance && state.powerups.length < C.powerups.maxOnScreen) spawnPowerup(randomPowerupKind());
      if (Math.random() < C.coins.pickupChance) spawnPowerup('moneda');
      if (state.destroyed >= p.meta && !state.bossPending) { state.bossPending = true; setTimeout(() => { if (state.scene === 'playing') spawnBoss(); }, 600); }
    }

    state.bullets.forEach(b => { b.y += b.vy; b.x += (b.vx || 0); });
    state.bullets = state.bullets.filter(b => b.y + b.h > 0 && b.x > -10 && b.x < W + 10);

    state.enemies.forEach(e => { e.y += e.vy; e.x += e.vx; e.rot += e.vr; if (e.type === 'alien') e.x += Math.sin((e.y + e.seed) * 0.04) * 0.7; if (e.x < 6) { e.x = 6; e.vx = Math.abs(e.vx); } if (e.x > W - e.w - 6) { e.x = W - e.w - 6; e.vx = -Math.abs(e.vx); } });

    state.powerups.forEach(pu => { pu.y += pu.vy; pu.t += dt; });
    state.bossShots.forEach(s => {
      s.y += s.vy; s.x += (s.vx || 0);
      if (s.kind === 'nota') { s.sway = (s.sway || 0) + 0.12; s.x += Math.sin(s.sway) * 1.5; }
      else if (s.kind === 'roca' || s.kind === 'roca_fuerte') { s.rot = (s.rot || 0) + (s.vr || 0.1); }
      else if (s.kind === 'magma') { s.sway = (s.sway || 0) + 0.08; s.x += Math.sin(s.sway) * 0.8; }
    });
    state.bossShots = state.bossShots.filter(s => s.y < H + 20 && s.x > -20 && s.x < W + 20);

    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const bu = state.bullets[i]; if (!bu) continue;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        if (hit(bu, state.enemies[j])) {
          const e = state.enemies[j]; boom(e.x + e.w / 2, e.y + e.h / 2, e.type === 'meteor' ? '#f2a93b' : '#ff8bd0'); A.explosion();
          state.enemies.splice(j, 1); state.score += C.score.enemy; state.coins += C.coins.perEnemy; state.destroyed++; drawHUD();
          if (!bu.pierce) { state.bullets.splice(i, 1); break; }
        }
      }
    }
    for (let j = state.powerups.length - 1; j >= 0; j--) {
      if (hit(sh, state.powerups[j])) {
        const k = state.powerups[j].kind; state.powerups.splice(j, 1);
        if (k === 'vida') { openQuestion(); return; }
        if (k === 'vel') { state.speedBuff = C.buffs.speedMs; A.power(); announce('⚡ VELOCIDAD', '#5bd6ff'); }
        if (k === 'pow') { state.powerBuff = C.buffs.powerMs; A.power(); announce('✦ PODER TRIPLE', '#ff9a3b'); }
        if (k === 'frio') { const amt = C.temperature.coolAmount + state.upgrades.refrigeracion * 8; state.temp = Math.max(0, state.temp - amt); A.coolant(); announce('❄ REFRIGERANTE −' + amt + '°', '#5bd6ff'); }
        if (k === 'moneda') { state.coins += C.coins.pickup; A.power(); announce('🪙 +' + C.coins.pickup, '#ffd76b'); }
        drawHUD();
      }
    }
    for (let j = state.enemies.length - 1; j >= 0; j--) {
      if (hit(sh, state.enemies[j])) { const e = state.enemies[j]; state.enemies.splice(j, 1); boom(sh.x + sh.w / 2, sh.y, '#7cff6b'); hitShip(e.type === 'meteor' ? 'un meteorito' : 'un alienígena'); return; }
    }
    for (let j = state.bossShots.length - 1; j >= 0; j--) {
      if (hit(sh, state.bossShots[j])) { state.bossShots.splice(j, 1); boom(sh.x + sh.w / 2, sh.y, '#7cff6b'); hitShip('el ataque del jefe'); return; }
    }
    const gy = state.groundY < H ? state.groundY : H;
    state.enemies = state.enemies.filter(e => e.y < gy + 10);
    state.powerups = state.powerups.filter(pu => pu.y < H + 30);
    state.particles.forEach(pt => { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.05; pt.life -= 0.03; });
    state.particles = state.particles.filter(pt => pt.life > 0);

    if (state.boss) updateBoss(dt);
  }

  function loseLife(causa) {
    state.lives--; A.hit(); drawHUD(); shake();
    if (state.lives <= 0) { state.msgKilledBy = state.msgKilledBy || causa; gameOver(); }
  }

  /* -------- PREGUNTA -------- */
  function openQuestion() {
    state.scene = 'question'; state.pending = true;
    const q = PREGUNTAS[Math.floor(Math.random() * PREGUNTAS.length)]; state.currentQ = q;
    $('q-text').textContent = q.q;
    const cont = $('q-opciones'); cont.innerHTML = ''; const L = ['A', 'B', 'C', 'D'];
    q.o.forEach((opt, idx) => { const b = document.createElement('button'); b.className = 'opcion'; b.innerHTML = '<span class="k">' + L[idx] + '</span>' + opt; b.onclick = () => answer(idx, b); cont.appendChild(b); });
    $('q-feedback').textContent = ''; show('q-screen');
  }
  function answer(idx, btn) {
    if (!state.pending) return; state.pending = false; const q = state.currentQ;
    const ops = [...document.querySelectorAll('#q-opciones .opcion')]; ops.forEach(o => o.style.pointerEvents = 'none');
    const fb = $('q-feedback');
    if (idx === q.c) { btn.classList.add('correcta'); if (state.lives < C.lives.max) { state.lives++; A.life(); } else A.correct(); fb.innerHTML = '✔ ¡Correcto! +1 vida. ' + q.e; }
    else { btn.classList.add('incorrecta'); ops[q.c].classList.add('correcta'); A.wrong(); fb.innerHTML = '✘ No es correcta. ' + q.e; }
    setTimeout(() => { state.scene = 'playing'; drawHUD(); show('playing'); }, 2200);
  }

  /* -------- FIN DE MISIÓN / JUEGO -------- */
  function completeLevel() {
    state.scene = 'levelup'; const p = PLANETAS[state.level]; A.stopAmbient();
    $('lu-planeta').textContent = p.nombre + ' explorado · ' + state.score + ' pts';
    $('lu-dato').textContent = '“' + p.dato + '”';
    renderPodio('lu-podio', true); A.levelup(); show('levelup');
  }

  /* -------- TALLER DE MEJORAS (entre niveles) -------- */
  function openShop() { state.scene = 'tienda'; renderShop(); show('tienda'); }
  function costeActual(it) { return it.baseCost + (state.upgrades[it.id] || 0) * it.costStep; }
  function renderShop() {
    $('shop-coins').textContent = state.coins;
    const cont = $('shop-items'); if (!cont) return; cont.innerHTML = '';
    C.shop.forEach(it => {
      const lvl = state.upgrades[it.id] || 0, maxed = lvl >= it.max, cost = costeActual(it);
      const afford = state.coins >= cost && !maxed;
      const card = document.createElement('div'); card.className = 'shop-card' + (maxed ? ' maxed' : '');
      card.innerHTML = '<span class="si">' + it.icon + '</span>'
        + '<span class="sn">' + it.nombre + '</span>'
        + '<span class="sd">' + it.desc + '</span>'
        + '<span class="slv">' + (maxed ? '★ MÁX' : ('Nivel ' + lvl + '/' + it.max)) + '</span>'
        + '<button class="shop-buy' + (afford ? '' : ' off') + '">' + (maxed ? '✓' : (cost + ' 🪙')) + '</button>';
      const btn = card.querySelector('.shop-buy');
      if (afford) btn.onclick = () => { state.coins -= cost; state.upgrades[it.id]++; A.power(); renderShop(); };
      cont.appendChild(card);
    });
  }
  function shopContinuar() { if (state.level + 1 >= PLANETAS.length) startFinalBoss(); else { state.level++; startBriefing(); } }

  async function gameOver() {
    state.scene = 'gameover'; A.stopAmbient();
    $('go-msg').textContent = 'La nave fue destruida por ' + state.msgKilledBy + ' cerca de ' + PLANETAS[state.level].nombre + '.';
    $('go-score').textContent = 'Puntaje final: ' + state.score + ' pts';
    show('gameover');
    await registrarPuntaje();
    setTimeout(() => renderPodio('go-podio', false), C.podium.postDelayMs);
  }
  async function victoria() {
    state.scene = 'victoria'; state.final = false; A.stopAmbient(); await registrarPuntaje();
    const s = state.saga;
    if ($('vic-titulo')) $('vic-titulo').textContent = '¡Saga completada!';
    if ($('vic-sub')) $('vic-sub').textContent = s.titulo;
    if ($('vic-texto')) $('vic-texto').textContent = 'Cruzaste cada nivel de ' + s.titulo + ' y derrotaste al guardián final, El gran Profesor Felipe. Pocos lo logran. El conocimiento es, por fin, tuyo.';
    $('vic-score').textContent = 'Puntaje final: ' + state.score + ' pts · ' + PLANETAS.length + ' niveles + jefe final';
    show('victoria');
  }
  function filaPlanilla() {
    const p = PLANETAS[Math.min(state.level, PLANETAS.length - 1)];
    return [state.nombre || 'Anónimo', state.curso || '', p.num, p.nombre, state.score, new Date().toISOString().slice(0, 10)].join('\t');
  }
  function copiar(btn) {
    const txt = filaPlanilla();
    const done = () => { const o = btn.textContent; btn.textContent = '✓ Copiado'; setTimeout(() => btn.textContent = o, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
    else fallbackCopy(txt, done);
  }
  function fallbackCopy(txt, done) { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(t); done(); }

  /* -------- RENDER (orquesta graphics.js) -------- */
  function render() {
    G.clear();
    const p = PLANETAS[Math.min(state.level, PLANETAS.length - 1)];
    if (state.scene === 'playing' || state.scene === 'question') {
      G.scene(p, state.stars, state.groundY);
      G.powerups(state.powerups);
      G.bullets(state.bullets);
      G.bossShots(state.bossShots);
      G.enemies(state.enemies);
      if (state.boss) G.boss(state.boss);
      G.particles(state.particles);
      if (!(state.invuln > 0 && Math.floor(state.invuln / 80) % 2 === 0))
        G.ship(state.ship, { speed: state.speedBuff > 0, power: state.powerBuff > 0, shield: state.shield > 0 }, state.saga.vehiculo);
      if (state.tempActive) { G.thermometer(state.temp); G.heatTint(state.temp); }
    } else {
      G.clear(); G.starfield(state.stars);
    }
  }

  /* -------- INPUT: teclado -------- */
  function bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'Spacebar'].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp') keys.fire = true;
      if (e.key === 'm' || e.key === 'M') { const m = A.mute(); announce(m ? '🔇 Silencio' : '🔊 Sonido', '#5bd6ff'); }
    });
    window.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp') keys.fire = false;
    });
  }

  /* -------- INPUT: táctil (Pointer Events) -------- */
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  let padEls = null;
  const activePtr = new Map();
  function pin(x, y, el) { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  function zoneAt(x, y) { if (pin(x, y, padEls.fire)) return 'fire'; if (pin(x, y, padEls.left)) return 'left'; if (pin(x, y, padEls.right)) return 'right'; return null; }
  function applyPad() {
    let L = false, R = false, F = false;
    for (const z of activePtr.values()) { if (z === 'left') L = true; else if (z === 'right') R = true; else if (z === 'fire') F = true; }
    keys.left = L; keys.right = R; keys.fire = F;
    padEls.left.classList.toggle('pressed', L); padEls.right.classList.toggle('pressed', R); padEls.fire.classList.toggle('pressed', F);
  }
  function clearPad() {
    activePtr.clear(); keys.left = keys.right = keys.fire = false;
    if (padEls) { padEls.left.classList.remove('pressed'); padEls.right.classList.remove('pressed'); padEls.fire.classList.remove('pressed'); }
  }
  function bindTouch() {
    padEls = { left: $('t-left'), right: $('t-right'), fire: $('t-fire') };
    stageEl.addEventListener('pointerdown', e => { if (state.scene !== 'playing') return; const z = zoneAt(e.clientX, e.clientY); if (z) { e.preventDefault(); activePtr.set(e.pointerId, z); applyPad(); } }, { passive: false });
    stageEl.addEventListener('pointermove', e => { if (!activePtr.has(e.pointerId)) return; e.preventDefault(); activePtr.set(e.pointerId, zoneAt(e.clientX, e.clientY)); applyPad(); }, { passive: false });
    const end = e => { if (activePtr.has(e.pointerId)) { activePtr.delete(e.pointerId); applyPad(); } };
    stageEl.addEventListener('pointerup', end); stageEl.addEventListener('pointercancel', end); stageEl.addEventListener('lostpointercapture', end);
    stageEl.addEventListener('contextmenu', e => { if (state.scene === 'playing') e.preventDefault(); });
    window.addEventListener('blur', clearPad);
  }

  function goMenu() { state.level = 0; state.score = 0; state.lives = C.lives.start; state.final = false; state.scene = 'menu'; show('menu'); }

  /* -------- BOTONES -------- */
  function bindButtons() {
    $('btn-nombre').onclick = () => {
      const n = $('in-nombre').value.trim();
      if (!n) { $('in-nombre').style.borderColor = 'var(--peligro)'; return; }
      state.nombre = n; state.curso = $('in-curso').value.trim();
      showIntro();
    };
    $('in-nombre').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-nombre').click(); });
    $('btn-intro').onclick = () => { A.unlock(); startBriefing(); };
    $('btn-lanzar').onclick = () => { A.unlock(); startLevel(); };
    $('btn-siguiente').onclick = openShop;
    $('btn-tienda').onclick = shopContinuar;
    $('btn-reintentar').onclick = () => { resetRun(); startBriefing(); };
    $('btn-otravez').onclick = goMenu;
    $('btn-menu-go').onclick = goMenu;
    $('btn-copiar-go').onclick = function () { copiar(this); };
    $('btn-copiar-vic').onclick = function () { copiar(this); };
  }

  /* -------- RESIZE / ARRANQUE -------- */
  function resizeNow() { const r = G.resize(); W = r.W; H = r.H; }
  function start() {
    cv = $('game'); stageEl = $('stage');
    G.init(cv); resizeNow();
    window.addEventListener('resize', resizeNow);
    initStars(); bindKeyboard(); bindTouch(); bindButtons(); buildMenu();
    state.scene = 'menu'; show('menu');
    requestAnimationFrame(loop);
  }

  return { start };
})();

document.addEventListener('DOMContentLoaded', OC.Engine.start);
