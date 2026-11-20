// ═══════════════════════════════════════════════════════════════
// PUENTE v4 ↔ MOTOR NUEVO   (escrito a mano; NO lo genera el script)
//
// El contenido del v4 (mapas, NPC, combate, tiendas, misiones, oficios,
// COVID, música...) vive en v4/01..18 tal como estaba. Este archivo es el
// único lugar donde ambos mundos se tocan:
//
//   v4 → motor   transitionTo()  → juego.irA()   (fundido, cámara, NPC)
//                showDialog()    → juego.decir() (caja de diálogo nueva)
//                getGameTime()   → juego.reloj   (un solo reloj)
//   motor → v4   colisiones (WALKABLE + reglas por mapa), interact(),
//                lo que pasa al dar un paso (salidas, monedas, encuentros),
//                dibujo del mapa en dos capas, tick, hambre, COVID.
//
// Script clásico: ve las variables globales del v4 (player, STATE, MAPS...).
// Expone window.V4 para el módulo js/main.js.
// ═══════════════════════════════════════════════════════════════
(function () {
  'use strict';
  const A_V4 = { arriba: 'up', abajo: 'down', izquierda: 'left', derecha: 'right' };
  const A_NUEVO = { up: 'arriba', down: 'abajo', left: 'izquierda', right: 'derecha' };
  let juego = null;
  let dialogosV4 = 0; // diálogos del v4 abiertos o en cola

  const sincronizarJugador = () => {
    if (!juego || juego.modo === 'transicion') return;
    const j = juego.jugador;
    player.x = j.x; player.y = j.y;
    player.facing = player.dir = A_V4[j.dir] || 'down';
  };

  // ── Nombres de mapa ─────────────────────────────────────────
  const NOMBRES = {
    jardin_eden: '🌿 JARDÍN EDÉN', segundo_piso: '🏫 SEGUNDO PISO', sala_5to: '🏜️ SALA 5° · ATACAMA',
    sala_6to: '🏙️ SALA 6° · METROPOLITANA', sala_7mo: '🍇 SALA 7° · MAULE', sala_8vo: '🌲 SALA 8° · ARAUCANÍA',
    buinzoo: '🦁 BUINZOO', sector_norte: '🏘️ SECTOR NORTE', casa_1: '🏠 CASA 1', casa_2: '🏠 CASA 2', casa_3: '🏠 CASA 3',
    laboratorio: '⚗️ LABORATORIO', taller: '🪚 TALLER',
  };
  const nombreMapa = (id) => (typeof ML !== 'undefined' && ML[id]) || NOMBRES[id] || id.replace(/_/g, ' ').toUpperCase();

  // ── Colisión: mismas reglas que move() del v4 ───────────────
  const CASAS = new Set(['casa_1', 'casa_2', 'casa_3']);
  function bloqueado(mapaId, x, y) {
    const t = MAPS[mapaId]?.[y]?.[x];
    if (t === undefined) return true;
    if (CASAS.has(mapaId) && 'bcmtl'.includes(t)) return true;
    if ((mapaId === 'laboratorio' || mapaId === 'taller') && 'btkWmsiQR'.includes(t)) return true;
    if (mapaId === 'sector_norte' && 'HiYyO'.includes(t)) return true;
    if (mapaId === 'buinzoo' && BUINZOO_SOLID.has(t)) return true;
    if (!WALKABLE.has(t) && !(inBoat && (t === 'w' || t === 'D' || t === '0'))) return true;
    return false;
  }

  // ── Interacción: lo que hay frente al jugador ───────────────
  function interaccionEn(mapaId, x, y) {
    const t = MAPS[mapaId]?.[y]?.[x];
    if (t === undefined) return null;
    const hay = NPC_ACT[t] || (mapaId === 'buinzoo' && BUINZOO_SOLID.has(t));
    if (!hay) return null;
    return () => { sincronizarJugador(); interact(); };
  }

  // ── Al llegar a una casilla: el final de move() del v4 ──────
  function alPisar() {
    sincronizarJugador();
    const mapaAntes = currentMap, xAntes = player.x, yAntes = player.y;
    const t = MAPS[currentMap][player.y][player.x];
    if (inBoat && t !== 'w') inBoat = false;
    player.steps++;
    if ((stats.hunger || 100) > 0) stats.hunger = Math.max(0, (stats.hunger || 100) - 0.08);
    updateCamera();
    if (checkMapExit()) { corregirPosicion(mapaAntes, xAntes, yAntes); return true; }
    checkBlueCoin(); checkCandySpot(); checkAntiPickup();
    if (tick % 90 === 0) checkCOVIDProximityAlert();
    if (currentMap === 'reserva') {
      const rm = progress.rangerMissions;
      if (rm.silva === 1 && player.x > 280) { rm.silva = 2; showDialog('📍 ¡Valle Central explorado!\n\n✅ Muestra obtenida.\nRegresa con Guardabosques Silva.'); }
      if (rm.rojas === 1 && player.x > 293) { rm.rojas = 2; showDialog('🌲 ¡Bosque Primario alcanzado!\n\n✅ ¡El corazón de la reserva!\nRegresa con Guardabosques Rojas.'); }
    }
    if (player.steps >= 3) {
      const r = Math.random(), noche = isNight();
      if (currentMap === 'pasillo' && t === 'g' && r < (noche ? 1 / 4 : 1 / 9)) return encuentro(ENEMIES);
      if (currentMap === 'cancha' && t === 'g' && r < 1 / 10) return encuentro(ENEMIES);
      if (currentMap === 'plaza' && t === 'g' && r < 1 / 8) { triggerPlazaEvent(); return true; }
      if (currentMap === 'reserva' && t === 'g' && r < (noche ? 1 / 3 : 1 / 6)) return encuentro(RESERVA_ENEMIES);
      if (currentMap === 'centro_villa' && t === 'g' && r < (noche ? 1 / 4 : 1 / 7)) return encuentro(CENTRO_ENEMIES);
      if (currentMap === 'buinzoo' && (t === '.' || t === 'c') && r < 1 / 7) return encuentro(BUINZOO_ENEMIES);
      if (currentMap === 'pasillo' && t === '.' && r < 1 / 18)
        return encuentro(ENEMIES.filter((e) => !['paulina', 'dahian', 'alex', 'delinc', 'ambulante', 'pollito'].includes(e.id)));
    }
    corregirPosicion(mapaAntes, xAntes, yAntes);
    return false;
  }
  function encuentro(pool) {
    juego.eventos.emit('encuentro', { pool: 'v4', mapa: juego.mapa });
    triggerEncounterFromPool(pool);
    return true;
  }
  // Si el v4 movió al jugador dentro del mismo mapa (empujones, bloqueos), aplicarlo
  function corregirPosicion(mapaAntes, xAntes, yAntes) {
    if (currentMap !== mapaAntes || juego.modo === 'transicion') return;
    if (player.x !== xAntes || player.y !== yAntes) juego.jugador.teletransportar(player.x, player.y);
  }

  // ── Dibujo: el mapa del v4 en las coordenadas del motor ─────
  const proxyCanvas = { width: 400, height: 400 };
  function prepararVista(g, render, mapa) {
    const S = 32, z = render.zoom;
    // Durante el fundido el v4 ya cambió de mapa: dibujar el que muestra el motor
    const guardado = { mapa: currentMap, x: player.x, y: player.y };
    currentMap = mapa.id;
    if (juego.modo !== 'transicion') sincronizarJugador();
    else { player.x = juego.jugador.x; player.y = juego.jugador.y; }
    camera.x = Math.floor(render.cam.x); camera.y = Math.floor(render.cam.y);
    VW = Math.ceil(render.vistaW) + 2; VH = Math.ceil(render.vistaH) + 2;
    proxyCanvas.width = VW * TS; proxyCanvas.height = VH * TS;
    canvas = proxyCanvas; ctx = g;
    const esc = (S * z) / TS;
    const offX = (camera.x - render.cam.x) * S * z, offY = (camera.y - render.cam.y) * S * z;
    g.setTransform(esc, 0, 0, esc, Math.round(offX), Math.round(offY));
    g.imageSmoothingEnabled = true;
    return guardado;
  }
  function restaurar(g, guardado) {
    currentMap = guardado.mapa; player.x = guardado.x; player.y = guardado.y;
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.globalAlpha = 1; g.shadowBlur = 0;
  }
  function dibujarFondo(g, render, mapa) {
    g.save();
    const gd = prepararVista(g, render, mapa);
    try { v4DibujarFondo(); } catch (e) { console.error('[v4 fondo]', e); }
    restaurar(g, gd);
    g.restore();
  }
  function dibujarFrente(g, render, mapa) {
    g.save();
    const gd = prepararVista(g, render, mapa);
    try { v4DibujarFrente(); } catch (e) { console.error('[v4 frente]', e); }
    restaurar(g, gd);
    g.restore();
  }

  // ── Cada actualización del motor (60/s): lo que hacía loop() ──
  function frame() {
    tick++;
    if (STATE === 'battle') renderHeroToBattle();
    if (STATE === 'battle' && !battle && tick % 300 === 0) { STATE = 'exploring'; EL.battle?.classList.remove('on'); }
    COVID.tickUpdate();
    if (STATE === 'exploring' && juego.modo === 'explorar') {
      if (tick % 200 === 0 && (stats.hunger || 100) > 0) stats.hunger = Math.max(0, (stats.hunger || 100) - 0.8);
      if ((stats.hunger || 100) === 0 && tick % 300 === 0) stats.hp = Math.max(1, stats.hp - 2);
      if ((stats.hunger || 100) <= 50 && (stats.hunger || 100) > 49 && !progress._warn50) { progress._warn50 = true; showDialog('😐 ¡Tienes hambre!\n\nCome 🍬 caramelos o usa el huerto.'); }
      if ((stats.hunger || 100) <= 10 && (stats.hunger || 100) > 9 && !progress._warn10) { progress._warn10 = true; showDialog('🤢 ¡HAMBRE CRÍTICA!\n\n¡Come algo AHORA!'); }
    }
    if (STATE === 'battle' && battle?.enemy?.id === 'alex_boss') drawAlexCanvas();
    if (tick % 15 === 0) actualizarHUD();
  }

  function actualizarHUD() {
    const h = document.getElementById('hunger-bar');
    if (h) h.textContent = '🍽️' + Math.round(stats.hunger ?? 100);
    const s = document.getElementById('hud-stats');
    if (s) s.textContent = `LV ${stats.level} · ❤️ ${stats.hp}/${stats.maxHp} · 💙 ${stats.mp}/${stats.maxMp} · 🪙 ${coins}`;
    // Pista de mina cercana y conteo de la actividad (antes se dibujaban en el canvas de 400 px)
    const pista = document.getElementById('hud-pista');
    if (pista) {
      let txt = '';
      const nm = MINES.find((m) => m.map === currentMap && Math.abs(m.cx - player.x) <= 2 && Math.abs(m.cy - player.y) <= 2);
      if (nm) txt = `⛏️ ${nm.name || 'Mina'} cerca`;
      const found = Object.keys(progress.antiItems || {}).length;
      if (progress.antiQuestStarted || found) txt += (txt ? ' · ' : '') + `🎒 ${found}/10`;
      pista.textContent = txt; pista.style.display = txt ? '' : 'none';
    }
  }

  // ── El motor no deja caminar mientras hay un panel del v4 abierto ──
  function bloqueaMotor() {
    if (visible('stats-panel') || visible('memorice')) return true;
    if (STATE === 'exploring') return false;
    if (STATE === 'dialog' && dialogosV4 > 0) return false; // es nuestro diálogo
    return true;
  }

  // ── showDialog del v4 → caja de diálogo del motor ──────────
  function showDialogNuevo(text, choices = []) {
    STATE = 'dialog';
    dialogosV4++;
    let eligio = false;
    const opciones = (choices || []).map((c) => ({
      texto: c.text,
      accion: () => { eligio = true; STATE = 'exploring'; c.action?.(); },
    }));
    const nodo = opciones.length
      ? { texto: String(text ?? ''), opciones }
      : { texto: String(text ?? ''), accion: () => { eligio = true; if (STATE === 'dialog') STATE = 'exploring'; } };
    nodo.alMostrar = () => { if (STATE === 'exploring') STATE = 'dialog'; };
    juego.decir({ inicio: 'a', nodos: { a: nodo } }).then(() => {
      dialogosV4--;
      if (!eligio && STATE === 'dialog' && dialogosV4 === 0) STATE = 'exploring';
    });
  }

  // ── Partida ─────────────────────────────────────────────────
  function registrar(nombre) {
    nombre = (nombre || '').trim().slice(0, 20) || 'Profe';
    _playerName = nombre;
    if (!_playerKey) _playerKey = nombre.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 14) + '_' + Math.random().toString(36).slice(2, 6);
    try { localStorage.setItem('profeRpg_playerKey', _playerKey); localStorage.setItem('profeRpg_playerName', _playerName); } catch (e) {}
    try { _IDB.set('profeRpg_playerKey', _playerKey); _IDB.set('profeRpg_playerName', _playerName); } catch (e) {}
    try { _fbInit(); } catch (e) {}
  }
  function nombreGuardado() { try { return localStorage.getItem('profeRpg_playerName') || ''; } catch (e) { return ''; } }
  function partidaGuardada() {
    try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return d && MAPS[d.currentMap] ? d : null; } catch (e) { return null; }
  }
  function continuar() {
    const d = partidaGuardada();
    if (!d) return false;
    try { const k = localStorage.getItem('profeRpg_playerKey'); if (k) _playerKey = k; } catch (e) {}
    _applyGameState(d); // → __v4Cargado → motor
    return true;
  }
  function nuevaPartida() {
    juego.cargarMapa('jardin_eden', 11, 6, 'arriba');
    syncUI();
  }

  // ── Conexión ────────────────────────────────────────────────
  function conectar(j) {
    juego = j;
    window.showDialog = showDialogNuevo;
    window.getGameTime = () => ({ hour: juego.reloj.hora, min: juego.reloj.minuto });
    juego.reloj.minutos = 6 * 60; // el v4 empezaba a las 06:00
    // D-pad del v4 → cruceta del motor
    window.toggleDpad = () => document.getElementById('btn-tactil')?.click();
    window.toggleDpadSetting = (el) => window.__ponerTactil?.(el.checked);

    window.__v4Transicion = (id, tx, ty) => {
      if (!juego.mapa) return;
      juego.irA(id, tx, ty, A_NUEVO[player.facing] || juego.jugador.dir);
    };
    window.__v4Cargado = () => {
      juego.cargarMapa(currentMap, player.x, player.y, A_NUEVO[player.facing] || 'abajo');
    };

    juego.eventos.on('mapa:entrar', ({ mapa }) => {
      if (currentMap !== mapa.id) currentMap = mapa.id;
      sincronizarJugador();
      updateCamera();
      try { Music.play(mapa.id); } catch (e) {}
    });
  }

  // ── Teclado dentro de los paneles del v4 ─────────────────────
  const visible = (id) => { const el = document.getElementById(id); return el && getComputedStyle(el).display !== 'none'; };
  /** Esc / Q / botón B: cierra el panel del v4 que esté abierto. */
  function cerrarPanel() {
    const intentos = [
      ['keypad', () => STATE === 'keypad', closeKeypad],
      ['seven', () => STATE === 'seven', closeSevenPanel],
      ['levelup', () => STATE === 'levelup', closeLvlUp],
      ['memorice', () => visible('memorice'), closeMemorice],
      ['shop', () => STATE === 'shop', closeShop],
      ['inventario', () => STATE === 'inventory', closeInv],
      ['stats', () => visible('stats-panel'), closeStats],
      ['misiones', () => visible('quest-log'), toggleQuestLog],
      ['lab', () => visible('lab-panel'), closeLab],
      ['carp', () => visible('carp-panel'), closeCarpentry],
      ['forja', () => visible('forge-panel'), closeForge],
      ['farmacia', () => visible('pharm-panel'), closePharmacy],
      ['letrero', () => visible('sign-panel'), closeCOVIDSign],
      ['ajustes', () => visible('settings-panel'), closeSettings],
      ['ranking', () => visible('leaderboard-panel'), closeLeaderboard],
      ['metro', () => visible('metro-panel'), closeMetro],
    ];
    for (const [, abierto, cerrar] of intentos) if (abierto()) { try { cerrar(); } catch (e) {} return true; }
    return false;
  }
  /** Botones visibles del panel de batalla (para elegir con 1-9). */
  function botonesBatalla() {
    const zona = visible('b-party-panel') ? 'b-party-panel' : 'b-act';
    return [...document.querySelectorAll(`#${zona} button`)].filter((b) => b.offsetParent !== null && !b.disabled);
  }
  /** Lo llama el motor cada frame mientras un panel del v4 bloquea el juego. */
  function teclas(entrada) {
    const n = entrada.tomarNumero();
    if (STATE === 'battle' && n) botonesBatalla()[n - 1]?.click();
    if (STATE === 'levelup' && (entrada.pulso('accion') || entrada.pulso('cancelar'))) return closeLvlUp();
    if (entrada.pulso('cancelar') && STATE !== 'battle' && STATE !== 'transition') cerrarPanel();
    if (STATE === 'stats' || visible('stats-panel')) { if (entrada.pulso('accion')) closeStats(); }
  }
  // Teclado físico para el código de Jeanette y el modo administrador (como en el v4)
  addEventListener('keydown', (e) => {
    if (STATE === 'keypad') {
      if (e.key >= '0' && e.key <= '9') { kpPress(e.key); e.preventDefault(); }
      else if (e.key === 'Backspace' || e.key === 'Delete') { kpDel(); e.preventDefault(); }
      else if (e.key === 'Enter') { kpOk(); e.preventDefault(); }
      return;
    }
    if (STATE === 'exploring' && !e.repeat) _checkAdmin(e.key);
  });
  // La música del v4 parte con el primer toque (regla de los navegadores)
  const musicaInicio = () => { try { const ac = Music._ac; if (ac && ac.state === 'suspended') ac.resume(); Music.play(currentMap); } catch (e) {} };
  document.addEventListener('click', musicaInicio, { once: true });
  document.addEventListener('touchstart', musicaInicio, { once: true });

  // ── NPC del v4 que pasan a ser entidades con IA ─────────────
  /** Conversación con un NPC levantado: la de siempre del v4 (NPC_ACT).
   *  La promesa termina cuando se cerró todo lo que abrió (diálogos, tienda...). */
  function hablarNPC(letra, npc) {
    sincronizarJugador(); // el jugador ya mira al NPC (el motor lo giró)
    const fn = NPC_ACT[letra];
    if (!fn) return Promise.resolve();
    fn();
    return new Promise((listo) => {
      const revisar = () => (STATE === 'exploring' && !juego.dialogo.ocupado ? listo() : setTimeout(revisar, 120));
      setTimeout(revisar, 60);
    });
  }

  /** Saca la letra del NPC de la grilla del v4 y devuelve su definición de entidad. */
  function levantarNPCs(lista) {
    const porMapa = {};
    for (const n of lista) {
      const fila = MAPS[n.mapa]?.[n.y];
      if (!fila || fila[n.x] !== n.letra) { console.warn(`[npc-v4] "${n.letra}" no está en ${n.mapa} (${n.x},${n.y}); se deja como en el v4`); continue; }
      fila[n.x] = n.piso || '.';
      const id = `${n.mapa}:${n.letra}`;
      (porMapa[n.mapa] ||= []).push({
        ...n, id, uid: id, x: n.x, y: n.y,
        pisa: n.pisa || '.',
        alHablar: (j, npc) => hablarNPC(n.letra, npc),
      });
    }
    return porMapa;
  }

  /** Definiciones de mapa para el motor, a partir de MAPS del v4. */
  function mapas(extras = {}, npcs = {}) {
    const defs = {};
    for (const id of Object.keys(MAPS)) {
      defs[id] = { id, nombre: nombreMapa(id), tileset: 'v4', grilla: MAPS[id], ...(extras[id] || {}) };
      if (npcs[id]) defs[id].npcs = [...(defs[id].npcs || []), ...npcs[id]];
    }
    return defs;
  }

  /** Tileset para el motor: todo lo resuelve el v4. */
  const tileset = {
    id: 'v4',
    leyenda: new Proxy({}, { get: () => 'v4' }),
    tiles: { v4: { nombre: 'v4' }, _desconocido: { nombre: '?', solido: true } },
    gestionaNoche: true,
    solidoEn: (mapa, x, y) => bloqueado(mapa.id, x, y),
    npcPuedePisar: (mapa, x, y, quien) => (quien?.def?.pisa || '.').includes(MAPS[mapa.id]?.[y]?.[x]),
    interaccionEn: (mapa, x, y) => interaccionEn(mapa.id, x, y),
    alPisar: () => alPisar(),
    dibujarFondo, dibujarFrente,
  };

  window.V4 = {
    conectar, mapas, tileset, levantarNPCs, frame, bloqueaMotor, actualizarHUD, teclas, cerrarPanel,
    registrar, nombreGuardado, partidaGuardada, continuar, nuevaPartida,
    guardar: () => saveGame(), guardarSilencioso: () => saveGameSilent(),
    volver: () => goBack(),
    abrir: {
      mochila: () => openInv(), misiones: () => toggleQuestLog(), stats: () => openStats(),
      ajustes: () => openSettings(), ranking: () => openLeaderboard(), cargar: () => loadGame(), exportar: () => exportSave(),
    },
    admin: (tecla) => _checkAdmin(tecla),
    get STATE() { return STATE; },
  };
})();
