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
  function init(cv) { canvas = cv; cx = cv.getContext('2d'); }
  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height; DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { W, H };
  }
  function clear() { cx.clearRect(0, 0, W, H); cx.fillStyle = '#05060e'; cx.fillRect(0, 0, W, H); }

  function starfield(stars) {
    cx.fillStyle = '#cddaff';
    stars.forEach(s => { cx.globalAlpha = 0.4 + s.s * 0.35; cx.fillRect(s.x * W, s.y * H, s.s, s.s); });
    cx.globalAlpha = 1;
  }

  /* --- escenarios --- */
  function surface(gy, c1, c2, c3) {
    cx.fillStyle = c1; cx.fillRect(0, gy, W, H - gy);
    cx.fillStyle = c2;
    cx.beginPath(); cx.moveTo(0, gy);
    for (let x = 0; x <= W; x += W / 10) cx.lineTo(x, gy - 6 + Math.sin(x * 0.05) * 5);
    cx.lineTo(W, gy + 14); cx.lineTo(0, gy + 14); cx.closePath(); cx.fill();
    cx.fillStyle = c3;
    for (let i = 0; i < 6; i++) { cx.beginPath(); cx.ellipse((i + 0.5) * W / 6, gy + 18 + ((i * 13) % 20), 10, 4, 0, 0, 6.28); cx.fill(); }
  }

  function scene(world, stars, groundY) {
    if (world.scene === 'mercurio') {
      const g = cx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#1a1712'); g.addColorStop(0.6, '#0d0b09'); g.addColorStop(1, '#070605');
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      const sx = W * 0.82, sy = H * 0.12, sr = Math.min(W, H) * 0.09;
      const sg = cx.createRadialGradient(sx, sy, 2, sx, sy, sr * 2.4);
      sg.addColorStop(0, '#fff7e0'); sg.addColorStop(0.4, '#ffd27a'); sg.addColorStop(1, 'rgba(255,180,80,0)');
      cx.fillStyle = sg; cx.beginPath(); cx.arc(sx, sy, sr * 2.4, 0, 6.28); cx.fill();
      cx.fillStyle = '#fff3d0'; cx.beginPath(); cx.arc(sx, sy, sr, 0, 6.28); cx.fill();
      cx.fillStyle = '#cbb';
      stars.forEach(s => { if (s.y < 0.7) { cx.globalAlpha = 0.25 + s.s * 0.2; cx.fillRect(s.x * W, s.y * H, s.s, s.s); } });
      cx.globalAlpha = 1;
      surface(groundY, '#8a8375', '#6b6558', '#4a4640');
    } else if (world.scene === 'venus') {
      const g = cx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#e8a24a'); g.addColorStop(0.35, '#c96a2c'); g.addColorStop(0.7, '#7d2f1c'); g.addColorStop(1, '#2a0f0a');
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      cx.fillStyle = 'rgba(255,220,150,0.18)'; cx.beginPath(); cx.arc(W * 0.3, H * 0.16, Math.min(W, H) * 0.16, 0, 6.28); cx.fill();
      cx.fillStyle = 'rgba(60,20,15,0.6)';
      for (const vx of [W * 0.18, W * 0.55, W * 0.8]) { cx.beginPath(); cx.moveTo(vx - 40, groundY); cx.lineTo(vx, groundY - 46); cx.lineTo(vx + 40, groundY); cx.closePath(); cx.fill(); }
      surface(groundY, '#4a221a', '#331410', '#1c0a08');
      cx.strokeStyle = '#ff7b2e'; cx.lineWidth = 2; cx.globalAlpha = 0.85;
      for (let i = 0; i < 5; i++) { const bx = (i + 1) * W / 6; cx.beginPath(); cx.moveTo(bx, groundY + 6); cx.lineTo(bx + 8, H - 24); cx.lineTo(bx - 6, H - 10); cx.stroke(); }
      cx.globalAlpha = 1;
      cx.fillStyle = 'rgba(255,150,60,0.06)'; cx.fillRect(0, 0, W, H);
    } else if (world.scene === 'litosfera' || world.scene === 'astenosfera' || world.scene === 'manto') {
      subsuelo(world, groundY);
    } else if (world.scene === 'galaxia') {
      nebula(world, stars);
    } else if (world.scene === 'organismo') {
      organico(world, stars);
    } else if (world.scene === 'ecosistema') {
      natura(world, groundY);
    } else {
      cx.fillStyle = '#05060e'; cx.fillRect(0, 0, W, H);
      starfield(stars);
      const pr = Math.min(W, H) * 0.16, px = W * 0.5, py = H * 0.16;
      const g = cx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
      g.addColorStop(0, lighten(world.color, 40)); g.addColorStop(1, world.color);
      cx.fillStyle = g; cx.beginPath(); cx.arc(px, py, pr, 0, 6.28); cx.fill();
      if (world.nombre === 'Saturno') {
        cx.strokeStyle = 'rgba(232,213,154,.7)'; cx.lineWidth = 3;
        cx.save(); cx.translate(px, py); cx.scale(1, 0.32); cx.beginPath(); cx.arc(0, 0, pr * 1.5, 0, 6.28); cx.stroke(); cx.restore();
      }
    }
  }

  // Subsuelo (Centro de la Tierra): estratos de roca + magma en profundidad
  function subsuelo(world, gy) {
    const magma = world.scene === 'manto' || world.scene === 'astenosfera';
    const g = cx.createLinearGradient(0, 0, 0, H);
    if (world.scene === 'manto') { g.addColorStop(0, '#5a1810'); g.addColorStop(0.55, '#8a1c10'); g.addColorStop(1, '#ff5a2a'); }
    else if (world.scene === 'astenosfera') { g.addColorStop(0, '#3a1c12'); g.addColorStop(0.6, '#7a331a'); g.addColorStop(1, '#d9702e'); }
    else { g.addColorStop(0, '#2a2018'); g.addColorStop(0.7, '#3a2c1e'); g.addColorStop(1, '#4a3826'); }
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // estratos
    cx.strokeStyle = 'rgba(0,0,0,.18)'; cx.lineWidth = 2;
    for (let i = 1; i < 8; i++) { const yy = H * i / 8; cx.beginPath(); cx.moveTo(0, yy + Math.sin(i) * 6); for (let x = 0; x <= W; x += W / 6) cx.lineTo(x, yy + Math.sin(i + x * 0.02) * 6); cx.stroke(); }
    // vetas de magma
    if (magma) { cx.strokeStyle = 'rgba(255,120,40,.5)'; cx.lineWidth = 2; for (let i = 0; i < 4; i++) { const bx = (i + 1) * W / 5; cx.beginPath(); cx.moveTo(bx, H * 0.4); cx.lineTo(bx + 10, H * 0.7); cx.lineTo(bx - 8, H); cx.stroke(); } }
    if (gy < H) surface(gy, '#5a4632', '#463322', '#2c2016');
  }
  // Galaxia (Viaje Galáctico): espacio profundo + nebulosa tintada
  function nebula(world, stars) {
    cx.fillStyle = '#04040c'; cx.fillRect(0, 0, W, H);
    const nx = W * 0.5, ny = H * 0.35, nr = Math.min(W, H) * 0.5;
    const g = cx.createRadialGradient(nx, ny, 10, nx, ny, nr);
    g.addColorStop(0, world.color); g.addColorStop(0.4, 'rgba(120,90,200,.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    cx.globalAlpha = 0.5; cx.fillStyle = g; cx.beginPath(); cx.arc(nx, ny, nr, 0, 6.28); cx.fill(); cx.globalAlpha = 1;
    starfield(stars);
    if (world.scene === 'galaxia' && world.nombre.indexOf('Agujero') === 0) {
      const px = W * 0.5, py = H * 0.16, pr = Math.min(W, H) * 0.11;
      cx.fillStyle = '#000'; cx.beginPath(); cx.arc(px, py, pr, 0, 6.28); cx.fill();
      cx.strokeStyle = 'rgba(255,180,80,.7)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(px, py, pr * 1.25, 0, 6.28); cx.stroke();
    }
  }
  // Organismo (Cuerpo Humano): interior orgánico con "células" flotando
  function organico(world, stars) {
    const g = cx.createLinearGradient(0, 0, 0, H);
    const base = world.color;
    g.addColorStop(0, lighten(base, -60)); g.addColorStop(0.5, lighten(base, -30)); g.addColorStop(1, lighten(base, -80));
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // paredes/vasos
    cx.strokeStyle = 'rgba(255,255,255,.06)'; cx.lineWidth = 10;
    cx.beginPath(); cx.moveTo(-10, H * 0.2); cx.quadraticCurveTo(W * 0.5, H * 0.35, W + 10, H * 0.15); cx.stroke();
    cx.beginPath(); cx.moveTo(-10, H * 0.8); cx.quadraticCurveTo(W * 0.5, H * 0.65, W + 10, H * 0.85); cx.stroke();
    // células flotando (reutiliza las "estrellas" como partículas)
    stars.forEach(s => { cx.globalAlpha = 0.10 + s.s * 0.06; cx.fillStyle = '#ffd6de'; cx.beginPath(); cx.arc(s.x * W, s.y * H, s.s * 3, 0, 6.28); cx.fill(); });
    cx.globalAlpha = 1;
  }
  // Ecosistema (Ecosistemas): cielo + suelo natural según el mundo
  function natura(world, gy) {
    let cielo1 = '#bfe6ff', cielo2 = '#7fbfe0', suelo = world.color;
    if (world.scene === 'ecosistema' && world.nombre.indexOf('Desierto') === 0) { cielo1 = '#ffe0a0'; cielo2 = '#e0a860'; }
    if (world.nombre.indexOf('Humedal') === 0) { cielo1 = '#cfe8f0'; cielo2 = '#9fc8d8'; }
    const g = cx.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, cielo1); g.addColorStop(1, cielo2);
    cx.fillStyle = g; cx.fillRect(0, 0, W, gy);
    // sol
    cx.fillStyle = 'rgba(255,245,200,.7)'; cx.beginPath(); cx.arc(W * 0.78, H * 0.14, Math.min(W, H) * 0.06, 0, 6.28); cx.fill();
    // colinas/relieve de fondo
    cx.fillStyle = lighten(suelo, -20); cx.beginPath(); cx.moveTo(0, gy);
    for (let x = 0; x <= W; x += W / 8) cx.lineTo(x, gy - 30 - Math.sin(x * 0.03) * 18);
    cx.lineTo(W, gy); cx.closePath(); cx.fill();
    // suelo
    surface(gy, suelo, lighten(suelo, -18), lighten(suelo, -34));
  }

  /* --- proyectiles y objetos --- */
  function bullets(list) {
    list.forEach(b => { cx.fillStyle = '#baffb0'; cx.fillRect(b.x, b.y, b.w, b.h); cx.fillStyle = 'rgba(124,255,107,.4)'; cx.fillRect(b.x - 1, b.y, b.w + 2, b.h); });
  }
  function bossShots(list) {
    list.forEach(s => {
      const cxp = s.x + s.w / 2, cyp = s.y + s.h / 2;
      if (s.kind === 'nota') {
        cx.save(); cx.fillStyle = '#ffe0a0'; cx.font = 'bold 20px Georgia'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.shadowColor = '#ffb24d'; cx.shadowBlur = 8;
        cx.fillText((Math.floor(s.y / 14) % 2) ? '♫' : '♪', cxp, cyp); cx.restore(); cx.shadowBlur = 0;
      } else if (s.kind === 'roca' || s.kind === 'roca_fuerte') {
        const r = s.w / 2, caliente = s.kind === 'roca_fuerte';
        cx.save(); cx.translate(cxp, cyp); cx.rotate(s.rot || 0);
        if (caliente) { cx.shadowColor = '#ff7b2e'; cx.shadowBlur = 10; }
        cx.fillStyle = caliente ? '#7a4a3a' : '#8a7a63';
        cx.beginPath();
        for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; const rr = r * (0.7 + ((i * 2.3) % 3) * 0.14); cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        cx.closePath(); cx.fill();
        if (caliente) { cx.strokeStyle = '#ff9a3b'; cx.lineWidth = 1.5; cx.stroke(); }
        cx.fillStyle = caliente ? '#5a2f22' : '#5c4f3e';
        cx.beginPath(); cx.arc(-r * 0.2, -r * 0.1, r * 0.22, 0, 6.28); cx.fill();
        cx.restore(); cx.shadowBlur = 0;
      } else if (s.kind === 'magma') {
        const r = s.w / 2, pulse = 0.85 + Math.sin((s.y) * 0.2) * 0.15;
        const g = cx.createRadialGradient(cxp, cyp, 1, cxp, cyp, r * pulse);
        g.addColorStop(0, '#fff2b0'); g.addColorStop(0.4, '#ff9a3b'); g.addColorStop(1, '#e0301a');
        cx.shadowColor = '#ff6a2a'; cx.shadowBlur = 12;
        cx.fillStyle = g; cx.beginPath(); cx.arc(cxp, cyp, r * pulse, 0, 6.28); cx.fill();
        cx.shadowBlur = 0;
      } else if (s.kind === 'electron') {
        cx.save(); cx.shadowColor = '#9fe0ff'; cx.shadowBlur = 10; cx.fillStyle = '#e6f7ff';
        cx.beginPath(); cx.arc(cxp, cyp, Math.max(4, s.w * 0.4), 0, 6.28); cx.fill(); cx.restore(); cx.shadowBlur = 0;
        cx.strokeStyle = 'rgba(159,224,255,.5)'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(cxp, cyp - 8); cx.lineTo(cxp, cyp); cx.stroke();
      } else {
        cx.fillStyle = '#ff6a6a'; cx.fillRect(s.x, s.y, s.w, s.h); cx.fillStyle = 'rgba(255,80,80,.4)'; cx.fillRect(s.x - 2, s.y, s.w + 4, s.h);
      }
    });
  }
  function particles(list) {
    list.forEach(pt => { cx.globalAlpha = Math.max(0, pt.life); cx.fillStyle = pt.color; cx.fillRect(pt.x, pt.y, 3, 3); });
    cx.globalAlpha = 1;
  }
  function powerups(list) {
    list.forEach(pu => {
      const cxp = pu.x + pu.w / 2, cyp = pu.y + pu.h / 2, pulse = 0.7 + Math.sin(pu.t * 0.01) * 0.3;
      let color = '#ffd76b', ch = '?';
      if (pu.kind === 'vel') { color = '#5bd6ff'; ch = '⚡'; }
      if (pu.kind === 'pow') { color = '#ff9a3b'; ch = '✦'; }
      if (pu.kind === 'frio') { color = '#9fe8ff'; ch = '❄'; }
      if (pu.kind === 'moneda') { color = '#ffd76b'; ch = '🪙'; }
      cx.save(); cx.globalAlpha = pulse; cx.fillStyle = color; cx.font = 'bold 20px Courier New'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.shadowColor = color; cx.shadowBlur = 14; cx.fillText(ch, cxp, cyp); cx.restore(); cx.shadowBlur = 0;
      cx.strokeStyle = color; cx.globalAlpha = 0.6; cx.lineWidth = 1.5; cx.strokeRect(pu.x, pu.y, pu.w, pu.h); cx.globalAlpha = 1;
    });
  }

  /* --- enemigos --- */
  function enemies(list) { list.forEach(e => e.type === 'meteor' ? meteor(e) : alien(e)); }
  function meteor(e) {
    cx.save(); cx.translate(e.x + e.w / 2, e.y + e.h / 2); cx.rotate(e.rot); const r = e.w / 2;
    cx.fillStyle = '#8a7a63'; cx.beginPath();
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28; const rr = r * (0.75 + ((i * e.seed) % 3) * 0.12); cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    cx.closePath(); cx.fill(); cx.fillStyle = '#5c4f3e';
    cx.beginPath(); cx.arc(-r * 0.25, -r * 0.15, r * 0.22, 0, 6.28); cx.fill();
    cx.beginPath(); cx.arc(r * 0.25, r * 0.2, r * 0.16, 0, 6.28); cx.fill(); cx.restore();
  }
  function alien(e) {
    const x = e.x, y = e.y, w = e.w, h = e.h;
    cx.fillStyle = '#ff6bd0'; cx.beginPath(); cx.arc(x + w / 2, y + h * 0.45, w * 0.34, Math.PI, 0); cx.fill();
    cx.fillStyle = '#c94ba8'; cx.beginPath(); cx.ellipse(x + w / 2, y + h * 0.55, w * 0.5, h * 0.22, 0, 0, 6.28); cx.fill();
    cx.fillStyle = '#ffe66b'; for (let i = -1; i <= 1; i++) cx.fillRect(x + w / 2 + i * 7 - 1.5, y + h * 0.55 - 1.5, 3, 3);
  }

  /* --- jefe --- */
  function boss(b) {
    const barW = Math.min(W * 0.7, 260), bx = W / 2 - barW / 2, by = H * 0.075;
    cx.fillStyle = 'rgba(0,0,0,.5)'; cx.fillRect(bx - 2, by - 2, barW + 4, 10);
    cx.fillStyle = '#3a1015'; cx.fillRect(bx, by, barW, 6);
    cx.fillStyle = '#ff4d57'; cx.fillRect(bx, by, barW * (b.hp / b.maxhp), 6);
    cx.fillStyle = b.final ? '#ffd0a0' : '#ffd0d4'; cx.font = 'bold 12px Courier New'; cx.textAlign = 'center'; cx.fillText((b.final ? '★ ' : '☠ ') + b.name, W / 2, by - 6);
    const x = b.x, y = b.y, w = b.w, h = b.h;
    if (b.look !== 'atomo_hierro') { cx.fillStyle = b.color; cx.beginPath(); cx.ellipse(x + w / 2, y + h * 0.6, w * 0.5, h * 0.4, 0, 0, 6.28); cx.fill(); }
    if (b.look === 'felipe') {
      // El gran Profesor Felipe: profesor imponente con aura y birrete
      const pulse = 0.5 + Math.sin(b.t * 0.005) * 0.35;
      cx.save(); cx.globalAlpha = 0.28 * pulse; cx.fillStyle = '#ffd76b'; cx.beginPath(); cx.arc(x + w / 2, y + h * 0.42, w * 0.58, 0, 6.28); cx.fill(); cx.restore();
      cx.fillStyle = '#e8c4a0'; cx.beginPath(); cx.arc(x + w / 2, y + h * 0.42, w * 0.30, 0, 6.28); cx.fill();
      cx.fillStyle = '#111'; cx.fillRect(x + w * 0.30, y + h * 0.18, w * 0.40, 6);
      cx.save(); cx.translate(x + w / 2, y + h * 0.14); cx.fillRect(-w * 0.32, -5, w * 0.64, 8); cx.restore();
      cx.strokeStyle = '#ffd76b'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(x + w / 2, y + h * 0.12); cx.lineTo(x + w * 0.74, y); cx.stroke();
      cx.fillStyle = '#ffd76b'; cx.beginPath(); cx.arc(x + w * 0.74, y, 3, 0, 6.28); cx.fill();
      cx.strokeStyle = '#222'; cx.lineWidth = 2; cx.beginPath(); cx.arc(x + w * 0.40, y + h * 0.42, 6, 0, 6.28); cx.arc(x + w * 0.60, y + h * 0.42, 6, 0, 6.28); cx.moveTo(x + w * 0.46, y + h * 0.42); cx.lineTo(x + w * 0.54, y + h * 0.42); cx.stroke();
      cx.fillStyle = '#ff2a2a'; cx.beginPath(); cx.arc(x + w * 0.40, y + h * 0.42, 2.6, 0, 6.28); cx.arc(x + w * 0.60, y + h * 0.42, 2.6, 0, 6.28); cx.fill();
      cx.strokeStyle = '#5a3a24'; cx.beginPath(); cx.moveTo(x + w * 0.33, y + h * 0.33); cx.lineTo(x + w * 0.47, y + h * 0.38); cx.moveTo(x + w * 0.67, y + h * 0.33); cx.lineTo(x + w * 0.53, y + h * 0.38); cx.stroke();
    } else if (b.look === 'atomo_hierro') {
      // El gran Profesor Felipe como gran átomo de hierro (Fe): núcleo + electrones
      const cxp = x + w / 2, cyp = y + h * 0.45;
      cx.strokeStyle = 'rgba(160,200,255,.5)'; cx.lineWidth = 1.5;
      for (let o = 0; o < 3; o++) { const a = o * 1.05; cx.save(); cx.translate(cxp, cyp); cx.rotate(a); cx.beginPath(); cx.ellipse(0, 0, w * 0.5, w * 0.2, 0, 0, 6.28); cx.stroke(); cx.restore(); }
      cx.fillStyle = '#9fe0ff'; cx.shadowColor = '#9fe0ff'; cx.shadowBlur = 8;
      for (let o = 0; o < 3; o++) { const a = o * 1.05, ang = b.t * 0.004 + o * 2.1; const ex = Math.cos(ang) * w * 0.5, ey = Math.sin(ang) * w * 0.2; const rx = cxp + (ex * Math.cos(a) - ey * Math.sin(a)), ry = cyp + (ex * Math.sin(a) + ey * Math.cos(a)); cx.beginPath(); cx.arc(rx, ry, 3, 0, 6.28); cx.fill(); }
      cx.shadowBlur = 0;
      cx.save(); cx.translate(cxp, cyp);
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28, rr = w * 0.14 * (i % 2 ? 1 : 0.55); cx.fillStyle = i % 2 ? '#ff7b5a' : '#c9ccd6'; cx.beginPath(); cx.arc(Math.cos(a) * rr, Math.sin(a) * rr, 4.2, 0, 6.28); cx.fill(); }
      cx.restore();
      cx.fillStyle = '#fff'; cx.font = 'bold 12px Courier New'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('Fe', cxp, cyp);
    } else if (b.look === 'minero') {
      // Tío/Tía minero: casco con lámpara + rostro (color por capa)
      cx.fillStyle = '#e8c4a0'; cx.beginPath(); cx.arc(x + w / 2, y + h * 0.46, w * 0.24, 0, 6.28); cx.fill(); // cara
      // casco
      cx.fillStyle = b.color;
      cx.beginPath(); cx.arc(x + w / 2, y + h * 0.40, w * 0.30, Math.PI, 0); cx.fill();
      cx.fillRect(x + w * 0.20, y + h * 0.38, w * 0.60, 4);
      cx.beginPath(); cx.moveTo(x + w * 0.80, y + h * 0.42); cx.lineTo(x + w * 0.92, y + h * 0.44); cx.lineTo(x + w * 0.80, y + h * 0.36); cx.closePath(); cx.fill(); // visera
      // lámpara del casco
      cx.fillStyle = '#fff7c0'; cx.beginPath(); cx.arc(x + w / 2, y + h * 0.26, 3.5, 0, 6.28); cx.fill();
      cx.fillStyle = 'rgba(255,247,160,.35)'; cx.beginPath(); cx.moveTo(x + w / 2, y + h * 0.26); cx.lineTo(x + w * 0.3, y - 8); cx.lineTo(x + w * 0.7, y - 8); cx.closePath(); cx.fill(); // haz de luz
      // ojos
      cx.fillStyle = '#101018'; cx.beginPath(); cx.arc(x + w * 0.42, y + h * 0.47, 2.6, 0, 6.28); cx.arc(x + w * 0.58, y + h * 0.47, 2.6, 0, 6.28); cx.fill();
      // bigote/boca simpática
      cx.strokeStyle = '#5a3a24'; cx.lineWidth = 2; cx.beginPath(); cx.arc(x + w / 2, y + h * 0.5, w * 0.1, 0.2, Math.PI - 0.2); cx.stroke();
    } else if (b.look === 'guardian') {
      // núcleo con púas y ojos (guardián genérico, temático por color)
      cx.save(); cx.translate(x + w / 2, y + h * 0.45);
      cx.fillStyle = lighten(b.color, -20);
      const spikes = 8, R = w * 0.34;
      cx.beginPath();
      for (let i = 0; i < spikes * 2; i++) { const a = i / (spikes * 2) * 6.28; const rr = (i % 2 ? R : R * 1.4); cx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      cx.closePath(); cx.fill();
      cx.fillStyle = b.color; cx.beginPath(); cx.arc(0, 0, R, 0, 6.28); cx.fill();
      cx.fillStyle = '#101018'; cx.beginPath(); cx.arc(-R * 0.35, -R * 0.1, 3.2, 0, 6.28); cx.arc(R * 0.35, -R * 0.1, 3.2, 0, 6.28); cx.fill();
      cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(-R * 0.35, -R * 0.1, 1.2, 0, 6.28); cx.arc(R * 0.35, -R * 0.1, 1.2, 0, 6.28); cx.fill();
      cx.restore();
    } else if (b.look === 'calvo') {
      cx.fillStyle = b.color; cx.beginPath(); cx.arc(x + w / 2, y + h * 0.44, w * 0.30, 0, 6.28); cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.45)'; cx.beginPath(); cx.ellipse(x + w * 0.42, y + h * 0.30, w * 0.09, h * 0.05, -0.5, 0, 6.28); cx.fill();
      cx.strokeStyle = '#5a3a24'; cx.lineWidth = 2;
      cx.beginPath(); cx.moveTo(x + w * 0.36, y + h * 0.40); cx.lineTo(x + w * 0.46, y + h * 0.42);
      cx.moveTo(x + w * 0.64, y + h * 0.40); cx.lineTo(x + w * 0.54, y + h * 0.42); cx.stroke();
      cx.fillStyle = '#101018'; cx.beginPath(); cx.arc(x + w * 0.42, y + h * 0.47, 3, 0, 6.28); cx.arc(x + w * 0.58, y + h * 0.47, 3, 0, 6.28); cx.fill();
      cx.strokeStyle = '#2a2a2a'; cx.lineWidth = 1.5; cx.beginPath();
      cx.arc(x + w * 0.42, y + h * 0.47, 5, 0, 6.28); cx.arc(x + w * 0.58, y + h * 0.47, 5, 0, 6.28);
      cx.moveTo(x + w * 0.47, y + h * 0.47); cx.lineTo(x + w * 0.53, y + h * 0.47); cx.stroke();
      cx.fillStyle = '#3a2e22'; cx.font = 'bold 16px Georgia'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('♪', x + w / 2, y + h * 0.72);
    } else {
      cx.fillStyle = lighten(b.color, -30); cx.beginPath(); cx.arc(x + w / 2, y + h * 0.45, w * 0.28, Math.PI, 0); cx.fill();
      cx.fillStyle = '#101018'; cx.beginPath(); cx.arc(x + w * 0.42, y + h * 0.42, 3, 0, 6.28); cx.arc(x + w * 0.58, y + h * 0.42, 3, 0, 6.28); cx.fill();
      cx.fillStyle = '#151515'; cx.fillRect(x + w * 0.36, y + h * 0.2, w * 0.28, 5);
      cx.save(); cx.translate(x + w / 2, y + h * 0.18); cx.fillRect(-w * 0.22, -4, w * 0.44, 6); cx.restore();
      cx.strokeStyle = '#ffd76b'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(x + w / 2, y + h * 0.16); cx.lineTo(x + w * 0.66, y + h * 0.05); cx.stroke();
      cx.fillStyle = '#ffd76b'; cx.beginPath(); cx.arc(x + w * 0.66, y + h * 0.05, 2.5, 0, 6.28); cx.fill();
    }
  }

  /* --- vehículo (cambia según la saga) --- */
  function ship(s, buffs, vehiculo) {
    if (buffs.shield) {
      cx.save(); cx.globalAlpha = 0.55; cx.strokeStyle = '#5bd6ff'; cx.lineWidth = 2; cx.shadowColor = '#5bd6ff'; cx.shadowBlur = 8;
      cx.beginPath(); cx.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w * 0.82, s.h * 0.95, 0, 0, 6.28); cx.stroke(); cx.restore(); cx.shadowBlur = 0;
    }
    switch (vehiculo) {
      case 'taladro': return vTaladro(s, buffs);
      case 'nanobot': return vNanobot(s, buffs);
      case 'jeep':    return vJeep(s, buffs);
      default:        return vNave(s, buffs);
    }
  }
  function vNave(s, buffs) {
    const x = s.x, y = s.y, w = s.w, h = s.h;
    cx.fillStyle = buffs.speed ? '#5bd6ff' : '#ff8b3b';
    cx.beginPath(); cx.moveTo(x + w * 0.5 - 4, y + h); cx.lineTo(x + w * 0.5, y + h + 8 + Math.random() * 4); cx.lineTo(x + w * 0.5 + 4, y + h); cx.closePath(); cx.fill();
    cx.fillStyle = buffs.power ? '#ffd76b' : '#7cff6b';
    cx.beginPath(); cx.moveTo(x + w / 2, y); cx.lineTo(x + w, y + h); cx.lineTo(x + w * 0.68, y + h * 0.78); cx.lineTo(x + w * 0.32, y + h * 0.78); cx.lineTo(x, y + h); cx.closePath(); cx.fill();
    cx.fillStyle = '#0a1a08'; cx.fillRect(x + w / 2 - 3, y + h * 0.35, 6, 7);
  }
  function vTaladro(s, buffs) {
    const x = s.x, y = s.y, w = s.w, h = s.h;
    // orugas
    cx.fillStyle = buffs.speed ? '#5bd6ff' : '#333';
    cx.fillRect(x, y + h * 0.55, w, h * 0.45);
    cx.fillStyle = '#555';
    for (let i = 0; i < 4; i++) { cx.beginPath(); cx.arc(x + 5 + i * (w - 10) / 3, y + h * 0.78, 3, 0, 6.28); cx.fill(); }
    // chasis
    cx.fillStyle = buffs.power ? '#ffd76b' : '#e0a020';
    cx.beginPath(); cx.moveTo(x + w * 0.2, y + h * 0.55); cx.lineTo(x + w * 0.8, y + h * 0.55); cx.lineTo(x + w * 0.66, y + h * 0.3); cx.lineTo(x + w * 0.34, y + h * 0.3); cx.closePath(); cx.fill();
    // broca (taladro) apuntando arriba, con brillo giratorio
    cx.fillStyle = '#c9ccd6';
    cx.beginPath(); cx.moveTo(x + w / 2, y - 4); cx.lineTo(x + w * 0.62, y + h * 0.3); cx.lineTo(x + w * 0.38, y + h * 0.3); cx.closePath(); cx.fill();
    cx.strokeStyle = '#8a8f9a'; cx.lineWidth = 1;
    const ph = (Date.now() % 400) / 400;
    for (let k = 0; k < 3; k++) { const yy = y + h * 0.3 - (k + ph) * h * 0.12; if (yy > y - 4) { cx.beginPath(); cx.moveTo(x + w * 0.4, yy); cx.lineTo(x + w * 0.6, yy - 3); cx.stroke(); } }
  }
  function vNanobot(s, buffs) {
    const x = s.x, y = s.y, w = s.w, h = s.h, cxp = x + w / 2, cyp = y + h * 0.55, r = w * 0.34;
    // propulsores glow
    cx.fillStyle = buffs.speed ? 'rgba(91,214,255,.8)' : 'rgba(120,255,180,.7)';
    for (let i = -1; i <= 1; i++) { cx.beginPath(); cx.arc(cxp + i * r * 0.8, y + h + 2, 2.5, 0, 6.28); cx.fill(); }
    // cuerpo esférico
    cx.fillStyle = buffs.power ? '#ffd76b' : '#8fd0e8';
    cx.beginPath(); cx.arc(cxp, cyp, r, 0, 6.28); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.5)'; cx.beginPath(); cx.arc(cxp - r * 0.3, cyp - r * 0.3, r * 0.28, 0, 6.28); cx.fill();
    // aro/hélice
    cx.strokeStyle = '#dff'; cx.lineWidth = 1.5; cx.beginPath(); cx.ellipse(cxp, cyp, r * 1.3, r * 0.5, 0, 0, 6.28); cx.stroke();
    // antena emisora arriba
    cx.strokeStyle = '#9fe8ff'; cx.beginPath(); cx.moveTo(cxp, cyp - r); cx.lineTo(cxp, y - 3); cx.stroke();
    cx.fillStyle = '#9fe8ff'; cx.beginPath(); cx.arc(cxp, y - 3, 2.5, 0, 6.28); cx.fill();
  }
  function vJeep(s, buffs) {
    const x = s.x, y = s.y, w = s.w, h = s.h;
    // ruedas
    cx.fillStyle = '#1a1a1a';
    cx.beginPath(); cx.arc(x + w * 0.25, y + h, 5, 0, 6.28); cx.arc(x + w * 0.75, y + h, 5, 0, 6.28); cx.fill();
    // carrocería
    cx.fillStyle = buffs.power ? '#ffd76b' : '#3f8f3f';
    cx.fillRect(x + 2, y + h * 0.45, w - 4, h * 0.4);
    cx.beginPath(); cx.moveTo(x + w * 0.18, y + h * 0.45); cx.lineTo(x + w * 0.3, y + h * 0.2); cx.lineTo(x + w * 0.62, y + h * 0.2); cx.lineTo(x + w * 0.72, y + h * 0.45); cx.closePath(); cx.fill();
    // parabrisas + ecólogo
    cx.fillStyle = '#bfeaff'; cx.fillRect(x + w * 0.34, y + h * 0.24, w * 0.24, h * 0.18);
    cx.fillStyle = '#e0b48a'; cx.beginPath(); cx.arc(x + w * 0.46, y + h * 0.3, 2.5, 0, 6.28); cx.fill();
    // faro/antena emisora
    cx.strokeStyle = buffs.speed ? '#5bd6ff' : '#dfe6a0'; cx.lineWidth = 1.5;
    cx.beginPath(); cx.moveTo(x + w * 0.5, y + h * 0.2); cx.lineTo(x + w * 0.5, y - 2); cx.stroke();
    cx.fillStyle = '#ffe66b'; cx.beginPath(); cx.arc(x + w * 0.5, y - 2, 2, 0, 6.28); cx.fill();
  }

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

  return { init, resize, clear, starfield, scene, bullets, bossShots, particles, powerups, enemies, boss, ship, thermometer, heatTint, lighten,
           get W() { return W; }, get H() { return H; } };
})();
