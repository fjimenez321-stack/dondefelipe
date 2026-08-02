/* ============================================================
   ODISEA CÓSMICA · config.js
   MOTOR DE JUEGO — todos los parámetros de jugabilidad.
   Cambia aquí para balancear el juego sin tocar la lógica.
   ============================================================ */
window.OC = window.OC || {};
OC.Config = {

  /* --- Conexión con Google Sheets (podio del curso) ---
     Pega la URL .../exec de tu Web App de Apps Script.
     Vacío => el juego usa el podio LOCAL del navegador. */
  sheetEndpoint: "",

  /* --- Vidas --- */
  lives: { start: 3, max: 5 },

  /* --- Nave --- */
  ship: {
    w: 34, h: 24,
    baseSpeed: 4.2,        // velocidad en la misión 1
    speedPerLevel: 0.55,   // cuánto más rápida por cada nivel
    fireCd: 13,            // enfriamiento de disparo (frames)
    fireCdRapid: 7,        // enfriamiento con potenciador de PODER
    iframesMs: 900         // invulnerabilidad tras recibir daño (ms)
  },

  /* --- Disparos del jugador --- */
  bullet: { w: 4, h: 12, speed: -9.5, spreadVx: 1.6 },

  /* --- Potenciadores temporales --- */
  buffs: { speedMs: 8000, powerMs: 8000, speedMult: 1.6 },

  /* --- Aparición de amenazas --- */
  spawn: {
    baseMin: 420,          // intervalo mínimo entre spawns (ms)
    perLevelReduce: 30,    // se reduce por nivel (más frecuentes)
    doubleChance: 0.30,    // prob. de soltar un segundo enemigo
    doubleDelay: 260
  },
  enemy: { alienChance: 0.60, baseFall: 1.0, fallPerLevel: 0.12 },

  /* --- Cápsulas de poder que caen --- */
  powerups: {
    chance: 0.0018,        // prob. por frame de soltar un potenciador
    maxOnScreen: 2,
    fallSpeed: 1.5, size: 26,
    weights: { vida: 0.40, vel: 0.30, pow: 0.30 } // 'frio' lo maneja la temperatura
  },

  /* --- Eventos (tormenta / oleada) --- */
  events: {
    firstMin: 8000, firstRand: 4000,
    nextMin: 10000, nextRand: 6000,
    stormMs: 3500, stormSpawnChance: 0.5,
    waveCount: 6
  },

  /* --- Temperatura (planetas con cooling, p. ej. Venus) --- */
  temperature: {
    rate: 0.0028,          // sube 100 en ~36 s sin refrigerante
    coolFirst: 2600,       // primera cápsula ❄
    coolIntervalMin: 5200, coolIntervalRand: 1800,
    coolAmount: 26,        // cuánto baja cada cápsula
    bossHeatMult: 1.25,    // el jefe calienta más
    warnAt: 78, warnResetBelow: 68, maxTemp: 100
  },

  /* --- Jefes --- */
  boss: {
    yFactor: 0.14, w: 68, h: 52,
    vxBase: 2, vxPerLevel: 0.2,
    shotCdBase: 760, shotCdPerLevel: 20,
    shotSpeedBase: 3.4, shotSpeedPerLevel: 0.15,
    tripleFromLevel: 3
  },

  /* --- Jefe FINAL de saga (El gran Profesor Felipe) --- */
  finalBoss: { w: 94, h: 76, hpDefault: 76, shotCd: 520, moveVx: 3.2, spreadEvery: 3 },

  /* --- Puntaje --- */
  score: { enemy: 10, bossHit: 5 },

  /* --- Monedas (economía) --- */
  coins: { perEnemy: 1, perBossDefeat: 12, perFinalDefeat: 30, pickup: 5, pickupChance: 0.0011 },

  /* --- Taller de mejoras (se compran entre niveles) ---
     El costo del siguiente nivel = baseCost + nivelActual * costStep. */
  shop: [
    { id: 'armadura',      nombre: 'Escudo reforzado', icon: '🛡️', desc: 'Absorbe +1 impacto por nivel',        baseCost: 15, costStep: 12, max: 3 },
    { id: 'armamento',     nombre: 'Armamento',        icon: '🔫', desc: 'Disparo doble y luego triple',          baseCost: 20, costStep: 20, max: 2 },
    { id: 'cadencia',      nombre: 'Cadencia',         icon: '⚡', desc: 'Disparas más rápido',                    baseCost: 15, costStep: 12, max: 3 },
    { id: 'rayo_especial', nombre: 'Rayo perforante',  icon: '✨', desc: 'Tus rayos atraviesan enemigos',          baseCost: 25, costStep: 20, max: 2 },
    { id: 'refrigeracion', nombre: 'Refrigeración',    icon: '❄️', desc: 'Menos calor y refrigerante más potente', baseCost: 15, costStep: 12, max: 2 }
  ],

  /* --- Podio --- */
  podium: { topN: 5, localMax: 20, fetchTimeoutMs: 5000, postDelayMs: 700 },

  /* --- Estrellas de fondo --- */
  stars: { count: 70 }
};
