/* ============================================================
   ODISEA CÓSMICA · graphics.js
   GRÁFICOS — texturas, polígonos y sprites. Sin lógica de juego.
   El motor (engine.js) decide QUÉ y CUÁNDO; aquí está el CÓMO.
   ============================================================ */
window.OC = window.OC || {};
OC.Graphics = (function () {
  let canvas = null, cx = null, W = 0, H = 0, DPR = 1;

  function lighten(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  /* --- base --- */
  function init(cv) { canvas = cv; cx = cv.getContext('2d'); OC.Sprites.init(cx); OC.Scenes.init(cx); }
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height; DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    OC.Scenes.resize(W, H, DPR);
    return { W, H };
  }
  function clear() { cx.clearRect(0, 0, W, H); cx.fillStyle = '#05060e'; cx.fillRect(0, 0, W, H); }

  function starfield(stars) { OC.Scenes.stars(stars); }

  /* --- escenarios: todo el fondo vive en scenes.js --- */
  function scene(world, stars, groundY) { OC.Scenes.draw(world, stars, groundY); }
  function dim(a) { cx.fillStyle = 'rgba(3,4,12,' + a + ')'; cx.fillRect(0, 0, W, H); }

  /* --- entidades: el dibujo vive en sprites.js --- */
  function bullets(list)            { OC.Sprites.bullets(list); }
  function bossShots(list)          { OC.Sprites.bossShots(list); }
  function particles(list)          { OC.Sprites.particles(list); }
  function powerups(list)           { OC.Sprites.powerups(list); }
  function enemies(list, theme)     { OC.Sprites.enemies(list, theme); }
  function boss(b, env)             { OC.Sprites.boss(b, W, H, env); }
  function ship(s, buffs, vehiculo, env) { OC.Sprites.ship(s, buffs, vehiculo, env); }

  /* --- termómetro y tinte de calor --- */
  function thermometer(temp) {
    const bw = 13, bh = H * 0.34, bx = W - 24, by = H * 0.16, t = Math.min(1, temp / 100);
    const col = t > 0.8 ? '#ff3b3b' : t > 0.55 ? '#ff9a3b' : '#5bd6ff';
    cx.fillStyle = 'rgba(0,0,0,.5)'; cx.fillRect(bx - 4, by - 16, bw + 8, bh + 30);
    cx.fillStyle = '#20242e'; cx.fillRect(bx, by, bw, bh);
    cx.fillStyle = col; cx.fillRect(bx, by + bh * (1 - t), bw, bh * t);
    cx.beginPath(); cx.arc(bx + bw / 2, by + bh + 8, 9, 0, 6.28); cx.fillStyle = col; cx.fill();
    cx.fillStyle = '#dfe6ff'; cx.font = 'bold 10px Courier New'; cx.textAlign = 'center';
    cx.fillText('🌡', bx + bw / 2, by - 6);
    cx.fillText(Math.floor(temp) + '°', bx + bw / 2, by + bh + 26);
  }
  function heatTint(temp) {
    if (temp > 78) { cx.fillStyle = 'rgba(255,40,20,' + Math.min(0.28, (temp - 78) / 22 * 0.28) + ')'; cx.fillRect(0, 0, W, H); }
  }

  return { init, resize, clear, starfield, scene, dim, bullets, bossShots, particles, powerups, enemies, boss, ship, thermometer, heatTint, lighten,
           get W() { return W; }, get H() { return H; } };
})();
