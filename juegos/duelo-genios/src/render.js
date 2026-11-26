// ===================== MÓDULO render =====================
// Solo lee el estado de la simulación y dibuja. Guarda su propio estado visual
// (poses suavizadas, partículas, sacudida) que nunca vuelve a la simulación.
const Render = (() => {
  const W = 960, H = 540, FLOOR = 468;
  const D2R = Math.PI / 180;
  const KEYS = Characters.POSE_KEYS;

  const lerpPose = (a, b, t) => { const o = {}; for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * t; return o; };
  const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r + amt))); g = Math.max(0, Math.min(255, Math.round(g + amt))); b = Math.max(0, Math.min(255, Math.round(b + amt)));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // ---------- escenario: laboratorio de ciencias ----------
  let stageLayers = null;
  function buildStage() {
    let seed = 2718;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    stageLayers = {
      dust: Array.from({ length: 30 }, () => [rnd() * W, 60 + rnd() * 300, rnd() * 1.2 + 0.4, rnd() * 6]),
      books: Array.from({ length: 22 }, (_, i) => [i, 8 + rnd() * 8, 30 + rnd() * 22, ['#8d3b2f', '#2f5d8d', '#3f7a3a', '#b08a2e', '#5b3f7a', '#7a5a3a'][Math.floor(rnd() * 6)]]),
    };
  }
  function chalk(ctx, txt, x, y, size, a = 0.85) {
    ctx.font = `italic ${size}px Georgia, 'Times New Roman', serif`; ctx.fillStyle = `rgba(240,245,235,${a})`; ctx.textAlign = 'left'; ctx.fillText(txt, x, y);
  }
  function drawBoard(ctx, off) {
    const x0 = 210 + off, y0 = 64, w = 540, h = 236;
    ctx.fillStyle = '#6e4a2b'; ctx.fillRect(x0 - 12, y0 - 12, w + 24, h + 24);
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#2b5244'); g.addColorStop(1, '#1f3e33');
    ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x0 + 30, y0 + 20, 200, 60); ctx.fillRect(x0 + 300, y0 + 140, 180, 50); // borrones
    ctx.fillStyle = '#5a3a20'; ctx.fillRect(x0 - 6, y0 + h + 8, w + 12, 8); // bandeja
    ctx.fillStyle = '#f4f1e8'; ctx.fillRect(x0 + 60, y0 + h + 4, 16, 5); ctx.fillStyle = '#ffd166'; ctx.fillRect(x0 + 90, y0 + h + 4, 12, 5);
    chalk(ctx, 'F = m · a', x0 + 26, y0 + 44, 26);
    chalk(ctx, 'F = G · m₁m₂ / r²', x0 + 26, y0 + 84, 22);
    chalk(ctx, 'V = I · R', x0 + 30, y0 + 128, 22, 0.75);
    chalk(ctx, '²²⁶Ra → ²²²Rn + α', x0 + 26, y0 + 172, 20, 0.8);
    chalk(ctx, 'v = λ · f', x0 + 30, y0 + 212, 20, 0.7);
    // el árbol "I think" del cuaderno de Darwin
    ctx.strokeStyle = 'rgba(240,245,235,0.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    const tx = x0 + 330, ty = y0 + 190;
    chalk(ctx, 'I think', tx - 40, y0 + 36, 18, 0.8);
    const br = (x, y, ang, len, d) => {
      if (d === 0) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y); ctx.stroke(); return; }
      const nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
      br(nx, ny, ang - 0.45, len * 0.72, d - 1); br(nx, ny, ang + 0.4, len * 0.68, d - 1);
    };
    br(tx, ty, -Math.PI / 2, 46, 4);
    // manzana dibujada
    ctx.beginPath(); ctx.arc(x0 + 470, y0 + 62, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + 470, y0 + 46); ctx.lineTo(x0 + 474, y0 + 36); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + 470, y0 + 84); ctx.lineTo(x0 + 470, y0 + 116); ctx.moveTo(x0 + 464, y0 + 108); ctx.lineTo(x0 + 470, y0 + 118); ctx.lineTo(x0 + 476, y0 + 108); ctx.stroke();
    chalk(ctx, 'g', x0 + 484, y0 + 110, 20);
    // jirafa esquemática (Lamarck)
    ctx.beginPath(); ctx.moveTo(x0 + 440, y0 + 210); ctx.lineTo(x0 + 450, y0 + 180); ctx.lineTo(x0 + 490, y0 + 180); ctx.lineTo(x0 + 500, y0 + 210);
    ctx.moveTo(x0 + 488, y0 + 180); ctx.lineTo(x0 + 508, y0 + 130); ctx.lineTo(x0 + 520, y0 + 132); ctx.stroke();
  }
  function drawCoil(ctx, x, frame) {
    // bobina de Tesla de utilería
    ctx.fillStyle = '#2a2a33'; ctx.fillRect(x - 26, FLOOR - 40, 52, 34);
    ctx.fillStyle = '#b87333'; ctx.fillRect(x - 12, FLOOR - 170, 24, 132);
    ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 1;
    for (let y = FLOOR - 168; y < FLOOR - 40; y += 4) { ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x + 12, y + 2); ctx.stroke(); }
    ctx.fillStyle = '#c9ccd6'; ctx.beginPath(); ctx.ellipse(x, FLOOR - 182, 40, 16, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(x - 8, FLOOR - 188, 22, 5, 0, 0, Math.PI * 2); ctx.fill();
    if ((frame % 97) < 10 || (frame % 61) < 4) {
      ctx.strokeStyle = 'rgba(160,220,255,0.9)'; ctx.lineWidth = 2; ctx.shadowColor = '#4cc9f0'; ctx.shadowBlur = 12;
      for (let k = 0; k < 3; k++) {
        let px = x + (Math.random() - 0.5) * 60, py = FLOOR - 186;
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
        ctx.beginPath(); ctx.moveTo(px, py);
        for (let q = 0; q < 6; q++) { px += Math.cos(ang) * 14 + (Math.random() - 0.5) * 14; py += Math.sin(ang) * 14 + (Math.random() - 0.5) * 14; ctx.lineTo(px, py); }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
  }
  function drawShelf(ctx, x, frame) {
    ctx.fillStyle = '#4a3020'; ctx.fillRect(x, 150, 120, 8); ctx.fillRect(x, 250, 120, 8); ctx.fillRect(x, 350, 120, 8);
    let bx = x + 4;
    for (const [i, bw, bh, c] of stageLayers.books.slice(0, 11)) { ctx.fillStyle = c; ctx.fillRect(bx, 150 - bh, bw, bh); bx += bw + 1; if (bx > x + 112) break; }
    const flask = (fx, fy, c, glow) => {
      if (glow) { ctx.shadowColor = c; ctx.shadowBlur = 14 + 6 * Math.sin(frame * 0.05); }
      ctx.fillStyle = 'rgba(220,240,255,0.25)'; ctx.beginPath(); ctx.moveTo(fx - 4, fy - 36); ctx.lineTo(fx + 4, fy - 36); ctx.lineTo(fx + 4, fy - 22); ctx.lineTo(fx + 14, fy); ctx.lineTo(fx - 14, fy); ctx.lineTo(fx - 4, fy - 22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(fx - 8, fy - 12); ctx.lineTo(fx + 8, fy - 12); ctx.lineTo(fx + 14, fy); ctx.lineTo(fx - 14, fy); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
    };
    flask(x + 22, 250, '#7cfc00', true); flask(x + 58, 250, '#f72585'); flask(x + 94, 250, '#4cc9f0');
    // microscopio
    ctx.fillStyle = '#2d2d35'; ctx.fillRect(x + 20, 340, 40, 8); ctx.fillRect(x + 34, 300, 8, 42); ctx.fillRect(x + 30, 292, 16, 12);
    ctx.save(); ctx.translate(x + 40, 300); ctx.rotate(-0.4); ctx.fillRect(-4, -26, 9, 30); ctx.restore();
    bx = x + 70;
    for (const [i, bw, bh, c] of stageLayers.books.slice(11)) { ctx.fillStyle = c; ctx.fillRect(bx, 350 - bh, bw, bh); bx += bw + 1; if (bx > x + 112) break; }
  }
  function drawStage(ctx, camX, frame) {
    if (!stageLayers) buildStage();
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
    g.addColorStop(0, '#152433'); g.addColorStop(1, '#2a4256');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // lámparas colgantes
    for (const lx of [300, 660]) {
      const x = lx - camX * 0.15;
      ctx.strokeStyle = '#0c141c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 30); ctx.stroke();
      ctx.fillStyle = '#0f1a24'; ctx.beginPath(); ctx.moveTo(x - 22, 46); ctx.lineTo(x + 22, 46); ctx.lineTo(x + 8, 30); ctx.lineTo(x - 8, 30); ctx.closePath(); ctx.fill();
      const lg = ctx.createRadialGradient(x, 46, 4, x, 200, 260);
      lg.addColorStop(0, 'rgba(255,230,170,0.22)'); lg.addColorStop(1, 'rgba(255,230,170,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(x - 20, 46); ctx.lineTo(x + 20, 46); ctx.lineTo(x + 230, FLOOR); ctx.lineTo(x - 230, FLOOR); ctx.closePath(); ctx.fill();
    }
    drawBoard(ctx, -camX * 0.25);
    drawShelf(ctx, 820 - camX * 0.35, frame);
    // zócalo de madera
    ctx.fillStyle = '#3d2a1c'; ctx.fillRect(0, 392, W, FLOOR - 392);
    ctx.fillStyle = 'rgba(255,220,180,0.08)'; ctx.fillRect(0, 392, W, 3);
    for (let i = -2; i < 14; i++) { const x = i * 90 - (camX * 0.4) % 90; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(x + 8, 404, 74, FLOOR - 420); }
    drawCoil(ctx, 70 - camX * 0.5, frame);
    for (const [x, y, r, ph] of stageLayers.dust) {
      ctx.globalAlpha = 0.15 + 0.15 * Math.sin(frame * 0.02 + ph);
      ctx.fillStyle = '#fff3c4'; ctx.fillRect(x, y + Math.sin(frame * 0.01 + ph) * 6, r, r);
    }
    ctx.globalAlpha = 1;
    // piso de tablas
    const fg = ctx.createLinearGradient(0, FLOOR - 10, 0, H);
    fg.addColorStop(0, '#7a5232'); fg.addColorStop(1, '#2e1d12');
    ctx.fillStyle = fg; ctx.fillRect(0, FLOOR - 6, W, H - FLOOR + 6);
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1;
    for (let i = -12; i <= 12; i++) {
      const x = 480 + i * 80 - camX;
      ctx.beginPath(); ctx.moveTo(x, FLOOR - 4); ctx.lineTo(480 + (x - 480) * 2.2, H); ctx.stroke();
    }
    for (const y of [FLOOR + 22, FLOOR + 48]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,220,170,0.2)'; ctx.fillRect(0, FLOOR - 6, W, 2);
  }

  // ---------- personaje (rig esqueletal 2D) ----------
  // Calcula las articulaciones de un rig en una pose. (x, baseY) = pies.
  function joints(rig, pose, x, baseY, dir, sc = 1, nk = 1) {
    const p = rig.proporciones;
    const L1 = p.muslo * sc, L2 = p.pierna * sc, T = p.torso * sc, A1 = p.brazo * sc, A2 = p.antebrazo * sc, C = p.cabeza * sc;
    const v = (a, len) => [Math.sin(a * D2R) * len * dir, Math.cos(a * D2R) * len];
    const reachA = L1 * Math.cos(pose.ta * D2R) + L2 * Math.cos(pose.sa * D2R);
    const reachB = L1 * Math.cos(pose.tb * D2R) + L2 * Math.cos(pose.sb * D2R);
    const hip = [x, baseY - Math.max(reachA, reachB, L1 * 0.4)];
    const add = (o, d) => [o[0] + d[0], o[1] + d[1]];
    const kneeA = add(hip, v(pose.ta, L1)), footA = add(kneeA, v(pose.sa, L2));
    const kneeB = add(hip, v(pose.tb, L1)), footB = add(kneeB, v(pose.sb, L2));
    const neck = add(hip, [Math.sin(pose.lean * D2R) * T * dir, -Math.cos(pose.lean * D2R) * T]);
    const sh = add(hip, [Math.sin(pose.lean * D2R) * T * 0.86 * dir, -Math.cos(pose.lean * D2R) * T * 0.86]);
    const ha = pose.lean + pose.head;
    const head = add(neck, [Math.sin(ha * D2R) * C * (1.05 + (nk - 1) * 1.3) * dir, -Math.cos(ha * D2R) * C * (1.05 + (nk - 1) * 1.3)]);
    const elbowA = add(sh, v(pose.ua, A1)), handA = add(elbowA, v(pose.fa, A2));
    const elbowB = add(sh, v(pose.ub, A1)), handB = add(elbowB, v(pose.fb, A2));
    return { hip, kneeA, footA, kneeB, footB, neck, sh, head, elbowA, handA, elbowB, handB, C, ha };
  }

  function limb(ctx, pts, w, color) {
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
  function dot(ctx, p, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fill(); }

  function drawFighter(ctx, rig, pose, x, baseY, dir, opts = {}) {
    const sc = opts.scale || 1, frame = opts.frame || 0;
    const flash = opts.flash;
    const col = c => flash ? '#ffffff' : c;
    const pal = rig.paleta, gr = rig.grosor;
    if (opts.armK && opts.armK !== 1) {
      const p = rig.proporciones;
      rig = Object.assign({}, rig, { proporciones: Object.assign({}, p, { brazo: p.brazo * opts.armK, antebrazo: p.antebrazo * opts.armK }) });
    }
    const nk = opts.neckK || 1;
    const J = joints(rig, pose, x, baseY, dir, sc, nk);
    const piezas = (rig.piezas || []).map(p => p.tipo);
    const pz = t => (rig.piezas || []).find(p => p.tipo === t) || {};
    const skin = col(pal.piel), skinD = col(shade(pal.piel, -35)), cloth = col(pal.ropa), clothD = col(shade(pal.ropa, -25));
    const acc = col(pal.acento);
    const hand = col(pal.manos || pal.acento), handD = col(shade(pal.manos || pal.acento, -40));
    const sleeve = pal.mangas ? col(pal.mangas) : skin, sleeveD = pal.mangas ? col(shade(pal.mangas, -25)) : skinD;
    const has = t => piezas.includes(t);
    // faldones de la levita (detrás de las piernas)
    if (has('levita')) {
      const w = gr.cuerpo * sc, hx0 = J.hip[0], hy0 = J.hip[1], L = rig.proporciones.muslo * sc;
      const sway = Math.sin(frame * 0.1) * 3 * sc;
      ctx.fillStyle = col(pz('levita').color || shade(pal.ropa, -20));
      ctx.beginPath(); ctx.moveTo(hx0 + dir * w * 0.55, hy0 - 10 * sc); ctx.lineTo(hx0 - dir * w * 0.6, hy0 - 12 * sc);
      ctx.lineTo(hx0 - dir * (w * 0.95 + sway), hy0 + L * 0.95); ctx.lineTo(hx0 - dir * w * 0.15, hy0 + L * 0.85);
      ctx.lineTo(hx0 + dir * w * 0.25, hy0 + L * 0.35); ctx.closePath(); ctx.fill();
    }

    // cola
    if (piezas.includes('cola')) {
      const sw = Math.sin(frame * 0.12) * 10;
      ctx.strokeStyle = skin; ctx.lineWidth = 7 * sc; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(J.hip[0] - dir * 6 * sc, J.hip[1] - 4 * sc);
      ctx.quadraticCurveTo(J.hip[0] - dir * 45 * sc, J.hip[1] + 10 * sc, J.hip[0] - dir * (60 + sw * 0.5) * sc, J.hip[1] - (30 + sw) * sc);
      ctx.stroke();
      dot(ctx, [J.hip[0] - dir * (60 + sw * 0.5) * sc, J.hip[1] - (30 + sw) * sc], 5 * sc, col(shade(pal.piel, -70)));
    }
    // alas (detrás, sobre brazo trasero y delantero)
    const wing = (sh, el, hd) => {
      if (!piezas.includes('alas')) return;
      ctx.fillStyle = col(pz('alas').color || shade(pal.piel, -20));
      ctx.beginPath(); ctx.moveTo(sh[0], sh[1]); ctx.lineTo(el[0], el[1]); ctx.lineTo(hd[0], hd[1]);
      const tipx = hd[0] + (hd[0] - el[0]) * 0.5, tipy = hd[1] + (hd[1] - el[1]) * 0.5 + 6 * sc;
      ctx.lineTo(tipx, tipy);
      for (let i = 1; i <= 4; i++) {
        const t = i / 5;
        const fx = hd[0] + (sh[0] - hd[0]) * t, fy = hd[1] + (sh[1] - hd[1]) * t;
        ctx.lineTo(fx + 4 * sc, fy + 26 * sc * (1 - t * 0.6)); ctx.lineTo(fx - 4 * sc * dir, fy + 10 * sc);
      }
      ctx.closePath(); ctx.fill();
    };
    // extremidades traseras
    wing(J.sh, J.elbowB, J.handB);
    limb(ctx, [J.hip, J.kneeB, J.footB], gr.pierna * sc, clothD);
    dot(ctx, J.footB, gr.pierna * 0.55 * sc, col(shade(pal.ropa, -45)));
    limb(ctx, [J.sh, J.elbowB, J.handB], gr.brazo * sc, sleeveD);
    dot(ctx, J.handB, gr.brazo * 0.8 * sc, handD);
    // torso
    limb(ctx, [J.hip, J.sh], gr.cuerpo * sc, cloth);
    ctx.strokeStyle = acc; ctx.lineWidth = 4 * sc;
    const bx = J.hip[0] + (J.sh[0] - J.hip[0]) * 0.12, by = J.hip[1] + (J.sh[1] - J.hip[1]) * 0.12;
    ctx.beginPath(); ctx.moveTo(bx - gr.cuerpo * 0.5 * sc, by); ctx.lineTo(bx + gr.cuerpo * 0.5 * sc, by); ctx.stroke(); // cinturón
    // pierna delantera
    limb(ctx, [J.hip, J.kneeA, J.footA], gr.pierna * sc, cloth);
    dot(ctx, J.footA, gr.pierna * 0.55 * sc, col(shade(pal.ropa, -45)));
    if (has('falda')) {
      const w = gr.cuerpo * sc, L = rig.proporciones.muslo * sc;
      const sway = Math.sin(frame * 0.09) * 3 * sc;
      ctx.fillStyle = col(pz('falda').color || pal.ropa);
      ctx.beginPath(); ctx.moveTo(J.hip[0] - w * 0.55, J.hip[1] - 8 * sc); ctx.lineTo(J.hip[0] + w * 0.55, J.hip[1] - 8 * sc);
      ctx.lineTo(J.hip[0] + w * 1.15 + sway, J.hip[1] + L * 1.05); ctx.quadraticCurveTo(J.hip[0], J.hip[1] + L * 1.15, J.hip[0] - w * 1.15 + sway, J.hip[1] + L * 1.05);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 2 * sc; ctx.beginPath(); ctx.moveTo(J.hip[0] - w * 1.05 + sway, J.hip[1] + L * 0.98); ctx.quadraticCurveTo(J.hip[0], J.hip[1] + L * 1.08, J.hip[0] + w * 1.05 + sway, J.hip[1] + L * 0.98); ctx.stroke();
    }
    if (has('levita') || has('corbatin')) {
      // pechera de camisa en V
      const ux = (J.hip[0] - J.neck[0]), uy = (J.hip[1] - J.neck[1]);
      ctx.fillStyle = col('#f2f0ea');
      ctx.beginPath(); ctx.moveTo(J.neck[0] - 7 * sc, J.neck[1] + 2 * sc); ctx.lineTo(J.neck[0] + 7 * sc, J.neck[1] + 2 * sc);
      ctx.lineTo(J.neck[0] + ux * 0.38 + dir * 2 * sc, J.neck[1] + uy * 0.38); ctx.closePath(); ctx.fill();
      if (has('levita')) {
        ctx.strokeStyle = col(pz('levita').color || shade(pal.ropa, -20)); ctx.lineWidth = 4 * sc;
        ctx.beginPath(); ctx.moveTo(J.neck[0] - 9 * sc, J.neck[1]); ctx.lineTo(J.neck[0] + ux * 0.45, J.neck[1] + uy * 0.45); ctx.lineTo(J.neck[0] + 9 * sc, J.neck[1]); ctx.stroke();
      }
    }
    if (has('corbatin')) {
      const c = col(pz('corbatin').color || '#ffffff'), nx = J.neck[0], ny = J.neck[1] + 4 * sc;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx - 8 * sc, ny - 5 * sc); ctx.lineTo(nx - 8 * sc, ny + 5 * sc); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(nx + 8 * sc, ny - 5 * sc); ctx.lineTo(nx + 8 * sc, ny + 5 * sc); ctx.closePath(); ctx.fill();
      dot(ctx, [nx, ny], 2.6 * sc, c);
    }
    // cuello largo (estiramiento lamarckiano)
    if (nk > 1.05) {
      const base = [J.neck[0], J.neck[1]], top = [J.head[0] - (J.head[0] - J.neck[0]) * (J.C * 0.9) / Math.hypot(J.head[0] - J.neck[0], J.head[1] - J.neck[1]), J.head[1] - (J.head[1] - J.neck[1]) * (J.C * 0.9) / Math.hypot(J.head[0] - J.neck[0], J.head[1] - J.neck[1])];
      limb(ctx, [base, top], J.C * 0.75, skin);
      ctx.fillStyle = col('#b9772f');
      for (let k = 1; k <= 4; k++) { const t = k / 5; dot(ctx, [base[0] + (top[0] - base[0]) * t + (k % 2 ? 2 : -2) * sc, base[1] + (top[1] - base[1]) * t], J.C * 0.16, col('#b9772f')); }
    }
    // collar
    if (piezas.includes('collar')) {
      ctx.fillStyle = col(pz('collar').color || '#ffffff');
      ctx.beginPath(); ctx.ellipse(J.neck[0], J.neck[1] + 2 * sc, 15 * sc, 8 * sc, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = -2; i <= 2; i++) dot(ctx, [J.neck[0] + i * 6 * sc, J.neck[1] + 6 * sc], 5 * sc, col(pz('collar').color || '#ffffff'));
    }
    // cabeza
    const hx = J.head[0], hy = J.head[1], C = J.C;
    const fwd = [Math.cos(J.ha * D2R) * dir, Math.sin(J.ha * D2R)];
    const upv = [Math.sin(J.ha * D2R) * dir, -Math.cos(J.ha * D2R)];
    const at = (f, u) => [hx + fwd[0] * f * C + upv[0] * u * C, hy + fwd[1] * f * C + upv[1] * u * C];
    const ring = (th0, th1, rOut, rIn, liftIn, color) => {
      ctx.fillStyle = col(color); ctx.beginPath();
      const n = 16;
      for (let k = 0; k <= n; k++) { const t = (th0 + (th1 - th0) * k / n) * D2R; const p = at(Math.cos(t) * rOut, Math.sin(t) * rOut); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      for (let k = n; k >= 0; k--) { const t = (th0 + (th1 - th0) * k / n) * D2R; const p = at(Math.cos(t) * rIn, Math.sin(t) * rIn + liftIn); ctx.lineTo(p[0], p[1]); }
      ctx.closePath(); ctx.fill();
    };
    // casquete de pelo: arco exterior + línea de nacimiento curva que pasa por (cf, cu)
    const cap = (th0, th1, rOut, cf, cu, color) => {
      ctx.fillStyle = col(color); ctx.beginPath();
      const n = 18;
      for (let k = 0; k <= n; k++) { const t = (th0 + (th1 - th0) * k / n) * D2R; const p = at(Math.cos(t) * rOut, Math.sin(t) * rOut); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      const c = at(cf, cu), e = at(Math.cos(th0 * D2R) * rOut, Math.sin(th0 * D2R) * rOut);
      ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]); ctx.closePath(); ctx.fill();
    };
    if (has('peluca')) { // rizos largos detrás (Newton)
      const c = pz('peluca').color || '#eeeeee';
      for (const [f, u] of [[-0.6, 0.75], [-1.0, 0.15], [-1.05, -0.55], [-0.9, -1.25], [-0.55, -1.7], [-0.1, 1.0], [0.35, 0.95], [-0.35, 1.1]]) dot(ctx, at(f, u), C * 0.52, col(shade(c, -18)));
    }
    if (has('mono')) dot(ctx, at(-0.85, 0.75), C * 0.5, col(pz('mono').color || '#4a3426'));
    if (piezas.includes('orejas')) {
      ctx.fillStyle = skin;
      for (const s of [-0.45, 0.35]) {
        const b = at(s, 0.7), t = at(s - 0.15, 1.45), c = at(s + 0.35, 0.85);
        ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill();
      }
    }
    if (piezas.includes('cuernos')) {
      ctx.strokeStyle = col(pz('cuernos').color || '#3d2b1f'); ctx.lineWidth = 3.5 * sc; ctx.lineCap = 'round';
      for (const s of [-0.25, 0.15]) { const b = at(s, 0.8), t = at(s - 0.1, 1.7); ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(t[0], t[1]); ctx.stroke(); }
    }
    dot(ctx, [hx, hy], C, skin);
    if (piezas.includes('pico')) {
      ctx.fillStyle = col(pz('pico').color || '#e0c080');
      const a = at(0.7, 0.25), b = at(1.75, -0.35), c = at(0.75, -0.35);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1] - 2, b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); ctx.fill();
    }
    if (piezas.includes('hocico')) {
      const m = at(0.95, -0.2); dot(ctx, m, C * 0.42, col(shade(pal.piel, 30))); dot(ctx, at(1.25, -0.1), C * 0.18, col(pz('hocico').color || '#222'));
    }
    if (piezas.includes('cresta')) {
      ctx.fillStyle = col(pz('cresta').color || '#c0392b');
      const a = at(0.1, 0.85), b = at(0.6, 1.3), c = at(0.85, 0.6);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]); ctx.closePath(); ctx.fill();
    }
    if (piezas.includes('banda')) {
      ctx.strokeStyle = acc; ctx.lineWidth = 5 * sc; ctx.lineCap = 'round';
      const a = at(-0.95, 0.35), b = at(0.95, 0.35);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      const sw = Math.sin(frame * 0.2) * 6 * sc;
      ctx.lineWidth = 3.5 * sc;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(a[0] - dir * 14 * sc, a[1] + 4 * sc, a[0] - dir * 28 * sc, a[1] + 10 * sc + sw); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(a[0] - dir * 12 * sc, a[1] + 8 * sc, a[0] - dir * 22 * sc, a[1] + 18 * sc - sw); ctx.stroke();
    }
    if (has('barba')) {
      const c = col(pz('barba').color || '#dddddd');
      const pts = [at(0.98, -0.12), at(0.92, -0.7), at(0.55, -1.45), at(0.05, -1.7), at(-0.42, -1.15), at(-0.6, -0.3), at(-0.2, -0.35), at(0.35, -0.05)];
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) { const m = [(pts[k - 1][0] + pts[k][0]) / 2, (pts[k - 1][1] + pts[k][1]) / 2]; ctx.quadraticCurveTo(pts[k - 1][0], pts[k - 1][1], m[0], m[1]); }
      ctx.closePath(); ctx.fill();
      dot(ctx, at(0.62, -0.42), C * 0.22, col(shade(pal.piel, -60))); // boca
    }
    if (has('bigote')) {
      ctx.strokeStyle = col(pz('bigote').color || '#222'); ctx.lineWidth = C * 0.26; ctx.lineCap = 'round';
      const a = at(1.0, -0.32), m = at(0.72, -0.28), b = at(0.42, -0.5);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(m[0], m[1] - 2 * sc, b[0], b[1]); ctx.stroke();
    }
    if (has('pelo')) cap(28, 215, 1.13, -0.15, 0.25, pz('pelo').color || '#222');
    if (has('mono')) cap(30, 205, 1.1, -0.1, 0.3, pz('mono').color || '#4a3426');
    if (has('calva')) ring(130, 228, 1.1, 0.72, 0, pz('calva').color || '#dddddd');
    if (has('peluca')) {
      const c = pz('peluca').color || '#eeeeee';
      cap(22, 215, 1.2, -0.2, 0.3, c);
      for (const [f, u] of [[-0.72, -0.3], [-0.78, -0.85], [-0.66, -1.4]]) dot(ctx, at(f, u), C * 0.38, col(c));
    }
    if (has('lentes')) {
      ctx.strokeStyle = col(pz('lentes').color || '#222'); ctx.lineWidth = 1.6 * sc;
      const e = at(0.5, 0.15); ctx.beginPath(); ctx.arc(e[0], e[1], C * 0.3, 0, Math.PI * 2); ctx.stroke();
    }
    // ojo
    const eye = at(0.45, 0.18);
    dot(ctx, eye, Math.max(1.8, C * 0.16), flash ? '#fff' : pal.ojos);
    if (!flash) dot(ctx, [eye[0] + dir * 0.6, eye[1] - 0.8], Math.max(0.7, C * 0.05), '#ffffff');
    // brazo delantero
    wing(J.sh, J.elbowA, J.handA);
    limb(ctx, [J.sh, J.elbowA, J.handA], gr.brazo * sc, sleeve);
    if (pal.mangas) { // puño de la camisa
      const cx = J.elbowA[0] + (J.handA[0] - J.elbowA[0]) * 0.82, cy = J.elbowA[1] + (J.handA[1] - J.elbowA[1]) * 0.82;
      dot(ctx, [cx, cy], gr.brazo * 0.55 * sc, col('#f2f0ea'));
    }
    dot(ctx, J.handA, gr.brazo * 0.85 * sc, hand);
    return J;
  }

  // ---------- estado visual por luchador ----------
  const vis = [null, null];
  let particles = [], shake = 0, flashT = [0, 0], texts = [], dispHp = [1, 1], comboShow = [{ n: 0, t: 0 }, { n: 0, t: 0 }];
  let zoom = { k: 1, x: 480, y: 300 }, screenFlash = 0, superInfo = null, popups = [], banners = [];
  // física de rotación (solo visual): ángulo y velocidad angular por luchador
  let rot = [{ ang: 0, om: 0 }, { ang: 0, om: 0 }];
  let ctx_bolts = [];
  const TAU = Math.PI * 2;
  const nearest = (target, ang) => target + TAU * Math.round((ang - target) / TAU);

  function reset() {
    vis[0] = vis[1] = null; particles = []; shake = 0; flashT = [0, 0]; texts = []; dispHp = [1, 1];
    comboShow = [{ n: 0, t: 0 }, { n: 0, t: 0 }]; zoom = { k: 1, x: 480, y: 300 }; screenFlash = 0; superInfo = null; popups = []; banners = [];
    rot = [{ ang: 0, om: 0 }, { ang: 0, om: 0 }]; ctx_bolts = [];
  }

  function attackPose(f, c, m) {
    const P = c.poses;
    const base = m.estado === 'agachado' ? P.crouch : m.estado === 'aire' ? P.jump : P.idle;
    const [pw, ph, palt] = m.poses.map(n => P[n]);
    if (f.t < m.startup) return lerpPose(base, pw, ease((f.t + 1) / m.startup));
    if (f.t < m.startup + m.active) return (palt && (f.hitIdx % 2 === 1 || (!f.hasHit && Math.floor((f.t - m.startup) / 4) % 2 === 1))) ? palt : ph;
    return lerpPose(ph, base, ease((f.t - m.startup - m.active) / Math.max(1, m.recovery)));
  }

  function targetPose(f, c, s, i) {
    const P = c.poses, m = f.move >= 0 ? c.def.moves[f.move] : null;
    const fr = s.frame;
    switch (f.state) {
      case 'walk': return lerpPose(P.walk1, P.walk2, (Math.sin(fr * 0.25 * (f.vx * f.dir > 0 ? 1 : -1)) + 1) / 2);
      case 'crouch': return P.crouch;
      case 'jump': return P.jump;
      case 'hitstun': {
        if (f.y > 0) return P.hurt_air;
        return { alto: P.hurt_high, medio: P.hurt_mid, bajo: P.hurt_low, aire: P.hurt_air }[f.hurtKind] || P.hurt;
      }
      case 'ko': return f.y > 0 ? P.hurt_air : P.down;
      case 'down': return P.down;
      case 'wakeup': return f.rollDir ? P.jump : P.crouch;
      case 'roll': case 'airtech': return P.jump;
      case 'grabbed': return P.grabbed;
      case 'dizzy': { const o = Object.assign({}, P.dizzy); const w = Math.sin(fr * 0.12); o.lean += w * 10; o.head += w * 14; o.ua += w * 20; o.ub -= w * 20; return o; }
      case 'blockstun': return (f.inp & Sim.B.D) ? P.cblock : P.block;
      case 'attack': return attackPose(f, c, m);
      default: {
        if ((s.phase === 'ko' || s.phase === 'over') && s.roundWinner === i && (s.phase === 'over' || s.phaseT < 120)) return P.win;
        const b = Math.sin(fr * 0.08) * 3;
        const o = Object.assign({}, P.idle); o.lean += b * 0.5; o.ua += b; o.ub += b; return o;
      }
    }
  }

  function burst(x, y, n, colors, speed, dirBias = 0, grav = 0.25, size = 3) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * speed;
      particles.push({ x, y, vx: Math.cos(a) * sp + dirBias * (1 + Math.random() * 4), vy: Math.sin(a) * sp - 1, g: grav,
        life: 16 + Math.random() * 14, c: colors[k % colors.length], r: 1.5 + Math.random() * size });
    }
  }
  function dust(x, n, strong) {
    for (let k = 0; k < n; k++) {
      const side = k % 2 ? 1 : -1;
      particles.push({ dust: true, x: x + side * Math.random() * 20, y: FLOOR - 4, vx: side * (1 + Math.random() * (strong ? 6 : 3)), vy: -Math.random() * (strong ? 3 : 1.5),
        g: 0.04, life: 26 + Math.random() * 18, c: 'rgba(214,170,130,', r: 6 + Math.random() * (strong ? 12 : 7) });
    }
  }

  function consumeEvents(s, sfx, defs) {
    for (const e of s.events) {
      if (e.t === 'hit' || e.t === 'block' || e.t === 'clash') {
        const block = e.t === 'block';
        const y = FLOOR - e.y;
        const n = block ? 10 : e.big ? 30 : 16;
        burst(e.x, y, n, block ? ['#9ad1ff', '#ffffff'] : e.counter ? ['#ff5d8f', '#ffffff', '#ffd166'] : ['#ffd166', '#ffffff', '#ff7b54'], e.big ? 9 : 6, (e.dir || 0) * (block ? 0.5 : 1.5), 0.25);
        particles.push({ ring: true, x: e.x, y, life: 12, max: 12, c: block ? '#9ad1ff' : e.counter ? '#ff5d8f' : '#fff3c4', R: e.big ? 64 : 44 });
        if (!block && e.big) {
          for (let k = 0; k < 6; k++) particles.push({ streak: true, x: e.x, y: y + (k - 2.5) * 9, len: 40 + Math.random() * 50, dir: e.dir || 1, life: 9, max: 9 });
          zoom = { k: e.counter ? 1.09 : 1.06, x: e.x, y }; screenFlash = e.counter ? 3 : 2;
        }
        shake = Math.max(shake, block ? 3 : e.big ? 12 : 6);
        if (e.t === 'hit' && s.fighters[e.who]) {
          const v = s.fighters[e.who], r = rot[e.who], fd = v.dir;
          if (e.efecto === 'suelo') r.om += fd * 0.22;
          else if (v.y > 0 || e.efecto || v.state === 'ko') r.om += -fd * (e.big ? 0.17 : 0.11);
          else if (v.hurtKind === 'alto') r.om += -fd * 0.07;
          else if (v.hurtKind === 'medio') r.om += fd * 0.05;
          else r.om += -fd * 0.04;
        }
        if (e.t === 'hit' && e.efecto === 'electro') {
          ctx_bolts.push({ x: e.x, y, t: 10 });
          burst(e.x, y, 16, ['#4cc9f0', '#ffffff', '#a0e7ff'], 8, 0, 0.05, 2);
          popups.push({ txt: '⚡', x: e.x, y: y - 46, t: 36, c: '#4cc9f0' });
        }
        if (e.t === 'hit' && e.rad) { burst(e.x, y, 12, ['#7cfc00', '#e6ffb3'], 5, 0, -0.02, 2.5); popups.push({ txt: '☢', x: e.x + 20, y: y - 40, t: 40, c: '#7cfc00' }); }
        if (e.t === 'hit' && e.atrae) { particles.push({ ring: true, x: e.x, y, life: 14, max: 14, c: '#b48cff', R: 70 }); }
        if (e.t === 'hit') {
          flashT[e.who] = e.big ? 6 : 4;
          if (e.combo >= 2) comboShow[1 - e.who] = { n: e.combo, t: 90 };
          if (e.counter) popups.push({ txt: '¡CONTRA!', x: e.x, y: y - 40, t: 50, c: '#ff5d8f' });
          if (e.agarre) popups.push({ txt: 'AGARRE', x: e.x, y: y - 40, t: 45, c: '#2dd4bf' });
          try { navigator.vibrate && navigator.vibrate(e.big ? 35 : 15); } catch (_) {}
        }
        sfx && sfx(block ? 'block' : e.big ? 'big' : 'hit');
      } else if (e.t === 'wall') {
        const wx = e.x < 480 ? 6 : W - 6;
        for (let k = 0; k < 14; k++) particles.push({ dust: true, x: wx, y: FLOOR - e.y + (Math.random() - 0.5) * 80, vx: (e.x < 480 ? 1 : -1) * (1 + Math.random() * 5), vy: (Math.random() - 0.5) * 3, g: 0.03, life: 30, c: 'rgba(230,190,160,', r: 8 + Math.random() * 10 });
        particles.push({ crack: true, x: wx, y: FLOOR - e.y, life: 40, max: 40 });
        shake = Math.max(shake, 14); sfx && sfx('big');
        if (s.fighters[e.who]) { const r = rot[e.who]; r.om = -r.om * 0.6 - s.fighters[e.who].dir * 0.08; }
      } else if (e.t === 'bounce') {
        dust(e.x, 14, true); shake = Math.max(shake, 10); sfx && sfx('thud');
        if (s.fighters[e.who]) { const r = rot[e.who]; r.om = -r.om * 0.5 - s.fighters[e.who].dir * 0.12; }
      } else if (e.t === 'perfect') {
        const y = FLOOR - e.y;
        particles.push({ ring: true, x: e.x, y, life: 16, max: 16, c: '#e0f7ff', R: 90 });
        particles.push({ ring: true, x: e.x, y, life: 10, max: 10, c: '#4cc9f0', R: 50 });
        burst(e.x, y, 18, ['#e0f7ff', '#4cc9f0'], 7, -(e.dir || 0) * 1.2, 0.05);
        popups.push({ txt: '¡PERFECTO!', x: e.x, y: y - 50, t: 55, c: '#4cc9f0' });
        zoom = { k: 1.05, x: e.x, y }; shake = Math.max(shake, 4); sfx && sfx('perfect');
      } else if (e.t === 'guard') {
        const f = s.fighters[e.who];
        popups.push({ txt: '¡CONTRAGOLPE!', x: f.x / Sim.SUB, y: FLOOR - 230, t: 55, c: '#ffd166' });
        screenFlash = 2; sfx && sfx('special');
      } else if (e.t === 'tech') {
        const txt = { aire: '¡RECUPERACIÓN!', agarre: '¡ESCAPE!', suelo: '' }[e.kind];
        if (txt) popups.push({ txt, x: e.x, y: FLOOR - (e.y || 0) - 60, t: 50, c: '#2dd4bf' });
        if (e.kind === 'agarre') { burst(e.x, FLOOR - e.y, 14, ['#2dd4bf', '#ffffff'], 6); shake = Math.max(shake, 6); sfx && sfx('block'); }
        else dust(e.x, 6, false);
      } else if (e.t === 'grab') { sfx && sfx('grab'); }
      else if (e.t === 'roll') { const f = s.fighters[e.who]; dust(f.x / Sim.SUB, 6, false); sfx && sfx('whoosh'); }
      else if (e.t === 'dizzy') { popups.push({ txt: '¡MAREADO!', x: e.x, y: FLOOR - 250, t: 70, c: '#ffd166' }); sfx && sfx('dizzy'); }
      else if (e.t === 'named') {
        banners.push({ txt: e.nombre.toUpperCase(), who: e.who, t: 110 }); sfx && sfx('named');
      }
      else if (e.t === 'pland') {
        burst(e.x, FLOOR - 10, e.big ? 26 : 14, ['#d62828', '#ff6b6b', '#4caf50', '#fff3c4'], e.big ? 8 : 5, 0, 0.3);
        dust(e.x, e.big ? 12 : 6, e.big); shake = Math.max(shake, e.big ? 8 : 3); sfx && sfx('thud');
      }
      else if (e.t === 'land') { dust(e.x, e.heavy ? 12 : 6, e.heavy); if (e.heavy) { shake = Math.max(shake, 6); sfx && sfx('thud'); } }
      else if (e.t === 'super') {
        superInfo = { who: e.who, nombre: e.nombre, t: 0 };
        screenFlash = 4; sfx && sfx('super');
      }
      else if (e.t === 'ko') { texts.push({ txt: 'K.O.', t: 150, big: true }); sfx && sfx('ko'); zoom = { k: 1.12, x: zoom.x, y: zoom.y }; }
      else if (e.t === 'timeout') texts.push({ txt: 'TIEMPO', t: 140, big: true });
      else if (e.t === 'special') { sfx && sfx('special'); }
      else if (e.t === 'fight') sfx && sfx('fight');
    }
  }

  function drawHUD(ctx, s, defs) {
    const F = s.fighters;
    for (let i = 0; i < 2; i++) {
      const max = defs[i].def.stats.vida, hp = F[i].hp / max;
      dispHp[i] = dispHp[i] > hp ? Math.max(hp, dispHp[i] - 0.006) : hp;
      const bw = 380, bh = 22, y = 22, x = i === 0 ? 24 : W - 24 - bw;
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x - 3, y - 3, bw + 6, bh + 6);
      ctx.fillStyle = '#5b1020'; ctx.fillRect(x, y, bw, bh);
      const fillTo = (v, c, yy = y, hh = bh) => { ctx.fillStyle = c; const w = bw * v; ctx.fillRect(i === 0 ? x + bw - w : x, yy, w, hh); };
      fillTo(dispHp[i], '#ff4d4d');
      const hg = ctx.createLinearGradient(0, y, 0, y + bh); hg.addColorStop(0, '#fff08a'); hg.addColorStop(1, '#f2b705');
      fillTo(hp, hg);
      const thr = defs[i].def.stats.vida * 0.35, st = Math.min(1, F[i].stunPts / thr);
      if (st > 0) fillTo(st, st > 0.75 ? '#ff7b54' : 'rgba(255,170,90,0.85)', y + bh + 3, 4);
      ctx.fillStyle = '#fff'; ctx.font = '700 18px system-ui, sans-serif'; ctx.textAlign = i === 0 ? 'left' : 'right';
      ctx.fillText(defs[i].def.meta.nombre.toUpperCase(), i === 0 ? x : x + bw, y + bh + 22);
      for (let w = 0; w < 2; w++) {
        const cx = i === 0 ? x + bw - 12 - w * 22 : x + 12 + w * 22;
        ctx.beginPath(); ctx.arc(cx, y + bh + 16, 7, 0, Math.PI * 2);
        ctx.fillStyle = F[i].wins > w ? '#ffd166' : 'rgba(255,255,255,0.2)'; ctx.fill();
      }
      // barra de súper (abajo)
      const mw = 230, mh = 12, my = H - 26, mx = i === 0 ? 24 : W - 24 - mw;
      const mv = F[i].meter / Sim.METER_MAX, full = mv >= 1;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);
      const mg = ctx.createLinearGradient(mx, 0, mx + mw, 0);
      if (full) { const p = 0.5 + 0.5 * Math.sin(s.frame * 0.2); mg.addColorStop(0, '#f72585'); mg.addColorStop(p, '#ffd166'); mg.addColorStop(1, '#4cc9f0'); }
      else { mg.addColorStop(0, '#3a86ff'); mg.addColorStop(1, '#8ecae6'); }
      ctx.fillStyle = mg; ctx.fillRect(i === 0 ? mx : mx + mw - mw * mv, my, mw * mv, mh);
      ctx.font = '800 12px system-ui, sans-serif'; ctx.fillStyle = full ? '#ffd166' : 'rgba(255,255,255,0.6)';
      ctx.textAlign = i === 0 ? 'left' : 'right';
      ctx.fillText(full ? 'SÚPER LISTO  ↓+S' : 'SÚPER', i === 0 ? mx : mx + mw, my - 6);
      const cs = comboShow[i];
      if (cs.t > 0) {
        cs.t--;
        ctx.globalAlpha = Math.min(1, cs.t / 20);
        ctx.font = '900 30px system-ui, sans-serif'; ctx.fillStyle = '#ffd166'; ctx.textAlign = i === 0 ? 'left' : 'right';
        ctx.fillText(`${cs.n} GOLPES`, i === 0 ? 24 : W - 24, 130);
        ctx.globalAlpha = 1;
      }
    }
    banners = banners.filter(b => b.t-- > 0);
    for (const b of banners) {
      const a = Math.min(1, b.t / 20, (110 - b.t) / 6);
      ctx.globalAlpha = a; ctx.textAlign = b.who === 0 ? 'left' : 'right';
      const x = b.who === 0 ? 24 : W - 24;
      ctx.font = '700 15px system-ui, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.fillText('COMBO', x, 158);
      ctx.font = '900 30px system-ui, sans-serif'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(b.txt, x, 190); ctx.fillStyle = '#2dd4bf'; ctx.fillText(b.txt, x, 190);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(W / 2 - 34, 14, 68, 46);
    ctx.fillStyle = '#fff'; ctx.font = '800 34px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(String(Math.ceil(s.timer / 60)).padStart(2, '0'), W / 2, 50);
    ctx.textAlign = 'center';
    if (s.phase === 'intro') bigText(ctx, s.phaseT > 35 ? `RONDA ${s.round}` : '¡PELEA!', s.phaseT > 35 ? '#ffffff' : '#ffd166');
    texts = texts.filter(t => t.t-- > 0);
    for (const t of texts) bigText(ctx, t.txt, '#ff5d5d');
    if (s.phase === 'over') bigText(ctx, `GANA ${defs[s.winner].def.meta.nombre.toUpperCase()}`, '#ffd166', 220);
  }
  function bigText(ctx, txt, color, y = 250, size = 72) {
    ctx.font = `900 ${size}px system-ui, sans-serif`;
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.strokeText(txt, W / 2, y);
    ctx.fillStyle = color; ctx.fillText(txt, W / 2, y);
  }

  function bolt(ctx, x0, y0, x1, y1, jag, segs) {
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let k = 1; k < segs; k++) { const t = k / segs; ctx.lineTo(x0 + (x1 - x0) * t + (Math.random() - 0.5) * jag, y0 + (y1 - y0) * t + (Math.random() - 0.5) * jag); }
    ctx.lineTo(x1, y1); ctx.stroke();
  }
  function drawApple(ctx, x, y, r, spin) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#ff6b6b'); g.addColorStop(0.6, '#d62828'); g.addColorStop(1, '#8a1010');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -r * 0.7);
    ctx.bezierCurveTo(r * 0.9, -r * 1.2, r * 1.3, r * 0.4, 0, r); ctx.bezierCurveTo(-r * 1.3, r * 0.4, -r * 0.9, -r * 1.2, 0, -r * 0.7); ctx.fill();
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = Math.max(2, r * 0.12); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -r * 0.65); ctx.lineTo(r * 0.12, -r * 1.05); ctx.stroke();
    ctx.fillStyle = '#4caf50'; ctx.beginPath(); ctx.ellipse(r * 0.38, -r * 0.98, r * 0.32, r * 0.14, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-r * 0.4, -r * 0.25, r * 0.15, r * 0.28, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawFinch(ctx, x, y, s, dir, flap) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    ctx.fillStyle = '#5b4632'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -4, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e0b04a'; ctx.beginPath(); ctx.moveTo(14, -6); ctx.lineTo(22, -3); ctx.lineTo(14, -1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3d2e20'; ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(-12, -2 - 12 * flap); ctx.lineTo(6, -3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-19, -4); ctx.lineTo(-19, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillRect(11, -6, 2, 2);
    ctx.restore();
  }
  function drawProjectile(ctx, p, defs, frame) {
    const pal = defs[p.owner].def.rig.paleta;
    const x = p.x / Sim.SUB, y = FLOOR - p.y / Sim.SUB, r = p.h / Sim.SUB / 2, rw = p.w / Sim.SUB / 2;
    if (p.forma === 'manzana') {
      // estela de caída
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * r * 0.5, y - r * 1.3); ctx.lineTo(x + k * r * 0.5, y - r * 1.3 - 30 - Math.abs(p.vy) / Sim.SUB * 3); ctx.stroke(); }
      // sombra en el suelo que avisa dónde cae
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x, FLOOR + 2, r * 1.1, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
      drawApple(ctx, x, y, r * 0.95, Math.sin(frame * 0.15) * 0.3);
      return;
    }
    if (p.forma === 'rayo') {
      ctx.save(); ctx.shadowColor = '#4cc9f0'; ctx.shadowBlur = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const len = rw * 2.4;
      for (let k = 0; k < (p.big ? 5 : 3); k++) {
        ctx.strokeStyle = k === 0 ? '#ffffff' : (k % 2 ? '#4cc9f0' : '#a0e7ff'); ctx.lineWidth = k === 0 ? (p.big ? 5 : 3) : 2;
        bolt(ctx, x - p.dir * len, y + (Math.random() - 0.5) * r, x + p.dir * rw * 0.6, y + (Math.random() - 0.5) * r * 0.6, r * 0.9, 7);
      }
      ctx.fillStyle = 'rgba(200,240,255,0.9)'; ctx.beginPath(); ctx.arc(x + p.dir * rw * 0.6, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (Math.random() < 0.6) particles.push({ x: x + (Math.random() - 0.5) * rw * 2, y: y + (Math.random() - 0.5) * r * 2, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, g: 0, life: 8, c: '#a0e7ff', r: 2 });
      return;
    }
    if (p.forma === 'pinzon') {
      const n = p.big ? 7 : 3;
      for (let k = 0; k < n; k++) {
        const ox = -p.dir * (k % 3) * 18 + Math.sin(frame * 0.2 + k) * 4, oy = (k - (n - 1) / 2) * (p.big ? 15 : 13) + Math.cos(frame * 0.25 + k * 2) * 5;
        drawFinch(ctx, x + ox, y + oy, p.big ? 1.15 : 1, p.dir, Math.abs(Math.sin(frame * 0.5 + k * 1.3)));
      }
      if (Math.random() < 0.3) particles.push({ x: x - p.dir * rw, y: y + (Math.random() - 0.5) * r, vx: -p.dir, vy: 0.6, g: 0.05, life: 30, c: '#7a5a3a', r: 1.5 });
      return;
    }
    if (p.forma === 'radio') {
      const pulse = 1 + 0.12 * Math.sin(frame * 0.3);
      const g = ctx.createRadialGradient(x, y, 2, x, y, r * 2.2 * pulse);
      g.addColorStop(0, 'rgba(230,255,200,1)'); g.addColorStop(0.35, 'rgba(124,252,0,0.85)'); g.addColorStop(1, 'rgba(124,252,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.2 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      for (let k = 0; k < 3; k++) { const a0 = frame * 0.05 + k * Math.PI * 2 / 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r * 0.55, a0, a0 + Math.PI / 3); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.arc(x, y, r * 0.13, 0, Math.PI * 2); ctx.fill();
      if (Math.random() < 0.5) particles.push({ x: x + (Math.random() - 0.5) * r, y: y + (Math.random() - 0.5) * r, vx: -p.dir * 1.2, vy: -0.6, g: -0.01, life: 22, c: '#7cfc00', r: 2.2 });
      return;
    }
    const g = ctx.createRadialGradient(x, y, 2, x, y, r * 1.6);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, p.big ? '#ffd166' : pal.acento); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = p.big ? 3 : 2;
    for (let k = 0; k < (p.big ? 5 : 3); k++) {
      ctx.beginPath(); ctx.arc(x - p.dir * k * 10, y, r * (0.6 + k * 0.22), frame * 0.3 + k, frame * 0.3 + k + 2.2); ctx.stroke();
    }
    if (Math.random() < 0.5) particles.push({ x: x - p.dir * r, y: y + (Math.random() - 0.5) * r, vx: -p.dir * 2, vy: 0, g: 0, life: 12, c: pal.acento, r: 2 });
  }
  // efectos de poderes cuerpo a cuerpo (solo visual)
  function drawMoveFx(ctx, f, c, m, frame) {
    const hb = Sim.hitboxWorld(f, m);
    const x0 = hb.x0 / Sim.SUB, x1 = hb.x1 / Sim.SUB, y0 = FLOOR - hb.y1 / Sim.SUB, y1 = FLOOR - hb.y0 / Sim.SUB;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, bx = f.x / Sim.SUB, by = FLOOR - f.y / Sim.SUB - c.alto * 0.55;
    const activeNow = f.t >= m.startup && f.t < m.startup + m.active;
    const charge = f.t < m.startup;
    ctx.save();
    if (m.fx === 'chispas') {
      ctx.shadowColor = '#4cc9f0'; ctx.shadowBlur = 14; ctx.lineCap = 'round';
      const n = activeNow ? 3 : charge ? 1 : 0;
      for (let k = 0; k < n; k++) {
        ctx.strokeStyle = k ? '#4cc9f0' : '#ffffff'; ctx.lineWidth = k ? 2 : 3;
        const sx = f.dir > 0 ? x0 : x1, ex = f.dir > 0 ? x1 : x0;
        bolt(ctx, charge ? bx + f.dir * 20 : sx, (charge ? by : cy) + (Math.random() - 0.5) * 20, charge ? bx + f.dir * 45 : ex, cy + (Math.random() - 0.5) * (y1 - y0), 18, 6);
      }
    } else if (m.fx === 'gravedad' && (activeNow || charge)) {
      for (let k = 0; k < 4; k++) {
        const t = ((frame * 0.04 + k / 4) % 1);
        ctx.strokeStyle = `rgba(180,140,255,${0.7 * (1 - t)})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(cx, cy, (x1 - x0) * 0.6 * (1 - t) + 6, (y1 - y0) * 0.5 * (1 - t) + 4, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (activeNow) {
        ctx.strokeStyle = 'rgba(220,200,255,0.8)'; ctx.lineWidth = 2;
        for (let k = -1; k <= 1; k++) { const yy = cy + k * 18, tip = bx + f.dir * 30; ctx.beginPath(); ctx.moveTo(x1 - (f.dir > 0 ? 0 : x1 - x0), yy); ctx.lineTo(tip, yy); ctx.lineTo(tip + f.dir * 10, yy - 7); ctx.moveTo(tip, yy); ctx.lineTo(tip + f.dir * 10, yy + 7); ctx.stroke(); }
      }
    } else if (m.fx === 'radiacion' && (activeNow || charge)) {
      const rx = m.hitbox.x < 0 ? bx : cx, ry = m.hitbox.x < 0 ? by : cy;
      for (let k = 0; k < 3; k++) {
        const t = ((frame * 0.05 + k / 3) % 1), R0 = charge ? 30 : Math.max(x1 - x0, y1 - y0) * 0.6;
        ctx.strokeStyle = `rgba(124,252,0,${0.75 * (1 - t)})`; ctx.lineWidth = 4 * (1 - t) + 1; ctx.shadowColor = '#7cfc00'; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.arc(rx, ry, 10 + R0 * t, 0, Math.PI * 2); ctx.stroke();
      }
      if (Math.random() < 0.7) particles.push({ x: rx + (Math.random() - 0.5) * 80, y: ry + (Math.random() - 0.5) * 80, vx: (Math.random() - 0.5) * 2, vy: -1 - Math.random(), g: -0.02, life: 24, c: '#7cfc00', r: 2.5 });
    } else if (m.fx === 'prisma' && activeNow) {
      const cols = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
      ctx.globalAlpha = 0.75; ctx.lineWidth = 5; ctx.lineCap = 'round';
      cols.forEach((col, k) => { ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(bx, by + 30); ctx.lineTo(bx + f.dir * (30 + k * 16), by - 120 - k * 8); ctx.stroke(); });
    } else if (m.fx === 'hojas' && activeNow) {
      for (let k = 0; k < 2; k++) particles.push({ leaf: true, x: cx + (Math.random() - 0.5) * (x1 - x0), y: cy + (Math.random() - 0.5) * (y1 - y0), vx: (Math.random() - 0.5) * 3, vy: -1.5 - Math.random() * 2, g: 0.06, life: 40, c: Math.random() < 0.5 ? '#7cb342' : '#aed581', r: 4 });
    }
    ctx.restore();
  }
  function stepRotation(f, c, r, s) {
    const lyingT = -f.dir * Math.PI / 2 * 0.95;
    const frozen = s.hitstop > 0 || s.freeze > 0;
    const spring = (target, k, damp) => { const T = nearest(target, r.ang); r.om += (T - r.ang) * k; r.om *= damp; r.ang += r.om; };
    if (f.state === 'roll') { r.ang = f.dir * TAU * ease(Math.min(1, f.t / 20)); r.om = 0; return; }
    if (f.state === 'airtech') { r.ang = -f.dir * TAU * ease(Math.min(1, f.t / 18)); r.om = 0; return; }
    if (f.state === 'wakeup' && f.rollDir) {
      const amount = f.rollDir > 0 ? 2.5 * Math.PI : 1.5 * Math.PI;
      r.ang = lyingT + f.rollDir * f.dir * amount * ease(Math.min(1, f.t / 20)); r.om = 0; return;
    }
    if (frozen) return;
    const air = f.y > 0;
    if ((f.state === 'hitstun' || f.state === 'ko') && air) {
      // vuelo libre: conserva el giro, con un leve torque que lo tiende a dejar de espaldas
      const T = nearest(lyingT, r.ang);
      r.om += (T - r.ang) * 0.006; r.om *= 0.992; r.ang += r.om;
    } else if ((f.state === 'down' || f.state === 'ko') && !air) spring(lyingT, 0.22, 0.55);
    else if (f.state === 'wakeup') spring(0, 0.16, 0.62);
    else if (f.state === 'jump' && Math.abs(f.vx) > 0) {
      const salto = c.def.stats.salto, p = Math.max(0, Math.min(1, (salto - f.vy) / (2 * salto)));
      r.ang = Math.sign(f.vx) * TAU * ease(p); r.om = 0;
    } else {
      spring(0, 0.28, 0.6);
      if (Math.abs(nearest(0, r.ang) - r.ang) < 0.003 && Math.abs(r.om) < 0.003) { r.ang = 0; r.om = 0; }
    }
  }

  function frame(ctx, s, defs, opts = {}) {
    const F = s.fighters;
    const mid = (F[0].x + F[1].x) / 2 / Sim.SUB;
    const camX = (mid - 480) * 0.6;
    ctx.save();
    // zoom de impacto
    if (zoom.k > 1.001) {
      ctx.translate(zoom.x, zoom.y); ctx.scale(zoom.k, zoom.k); ctx.translate(-zoom.x, -zoom.y);
      if (s.hitstop === 0 && s.freeze === 0) zoom.k = 1 + (zoom.k - 1) * 0.82;
    }
    if (shake > 0.2) { ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake); shake *= 0.86; }
    drawStage(ctx, camX, s.frame);
    // grietas en la pared
    for (const p of particles) if (p.crack) {
      ctx.globalAlpha = p.life / p.max; ctx.strokeStyle = '#fff3e0'; ctx.lineWidth = 2;
      const sx = p.x < 480 ? 1 : -1;
      ctx.beginPath();
      for (let k = 0; k < 5; k++) { ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + sx * (10 + k * 4), p.y - 40 + k * 20 + (k % 2) * 8); }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (s.freeze > 0 && superInfo) {
      ctx.fillStyle = `rgba(8,4,20,${Math.min(0.7, (40 - s.freeze) * 0.05 + 0.3)})`; ctx.fillRect(-50, -50, W + 100, H + 100);
      const f = F[superInfo.who], cx = f.x / Sim.SUB, cy = FLOOR - f.y / Sim.SUB - 100;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(s.frame * 0.02);
      for (let k = 0; k < 16; k++) {
        ctx.rotate(Math.PI / 8);
        ctx.fillStyle = k % 2 ? 'rgba(255,209,102,0.18)' : 'rgba(247,37,133,0.14)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(700, -60); ctx.lineTo(700, 60); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    const order = F[0].state === 'attack' ? [1, 0] : [0, 1];
    for (const i of order) {
      const f = F[i], c = defs[i];
      const tgt = targetPose(f, c, s, i);
      const snap = (f.state === 'attack' && f.t >= c.def.moves[f.move].startup) || f.state === 'hitstun' || f.state === 'grabbed';
      vis[i] = vis[i] ? lerpPose(vis[i], tgt, snap ? 0.85 : 0.45) : tgt;
      let x = f.x / Sim.SUB; const base = FLOOR - f.y / Sim.SUB;
      // el golpeado tiembla durante la pausa de impacto
      if (s.hitstop > 0 && (f.state === 'hitstun' || f.state === 'blockstun' || f.state === 'ko')) x += Math.sin(s.frame * 2.7) * Math.min(6, s.hitstop * 0.6);
      const hgt = Math.min(1, f.y / Sim.SUB / 220);
      ctx.fillStyle = `rgba(0,0,0,${0.35 * (1 - hgt * 0.6)})`;
      ctx.beginPath(); ctx.ellipse(x, FLOOR + 2, 42 * (1 - hgt * 0.4), 9 * (1 - hgt * 0.4), 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      const r = rot[i];
      stepRotation(f, c, r, s);
      // pivote en el centro del cuerpo; en el suelo, el punto más bajo del cuerpo rotado toca el piso
      const hh = c.alto * 0.9 / 2, ca = Math.abs(Math.cos(r.ang)), sa = Math.abs(Math.sin(r.ang));
      const cy = f.y > 0 ? base - hh : base - (hh * ca + 16 * sa);
      let drawBase = base;
      if (Math.abs(r.ang) > 0.001) {
        ctx.translate(x, cy); ctx.rotate(r.ang); ctx.translate(-x, -cy);
        drawBase = cy + hh;
      }
      // estela de velocidad en ataques con avance o lanzados
      if ((f.state === 'attack' && Math.abs(f.vx) > 700) || (f.state === 'hitstun' && Math.abs(f.vx) > 1100) || f.state === 'roll') {
        ctx.globalAlpha = 0.25;
        drawFighter(ctx, c.def.rig, vis[i], x - Math.sign(f.vx) * 18, drawBase, f.dir, { frame: s.frame, flash: true });
        ctx.globalAlpha = 1;
      }
      const flash = flashT[i] > 0; if (flashT[i] > 0 && s.hitstop === 0) flashT[i]--;
      const superGlow = s.freeze > 0 && superInfo && superInfo.who === i;
      if (f.rad > 0) { ctx.shadowColor = '#7cfc00'; ctx.shadowBlur = 10 + 8 * Math.sin(s.frame * 0.2); if (Math.random() < 0.25) particles.push({ x: x + (Math.random() - 0.5) * 40, y: base - Math.random() * c.alto, vx: 0, vy: -0.8, g: -0.01, life: 26, c: '#7cfc00', r: 2 }); }
      if (superGlow) { ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 30; }
      // estiramiento visual (Lamarck): crece en el arranque, se mantiene activo y vuelve en la recuperación
      let armK = 1, neckK = 1;
      if (f.state === 'attack') {
        const m = c.def.moves[f.move];
        if (m.estira || m.estiraCuello) {
          const k = f.t < m.startup ? ease((f.t + 1) / m.startup) : f.t < m.startup + m.active ? 1 : 1 - ease((f.t - m.startup - m.active) / Math.max(1, m.recovery));
          if (m.estira) armK = 1 + (m.estira / 100 - 1) * k;
          if (m.estiraCuello) neckK = 1 + (m.estiraCuello / 100 - 1) * k;
        }
      }
      const J = drawFighter(ctx, c.def.rig, vis[i], x, drawBase, f.dir, { frame: s.frame, flash, armK, neckK });
      if (f.state === 'dizzy') {
        for (let k = 0; k < 3; k++) {
          const a = s.frame * 0.12 + k * TAU / 3;
          const sx = J.head[0] + Math.cos(a) * 26, sy = J.head[1] - J.C - 10 + Math.sin(a) * 7;
          ctx.fillStyle = k % 2 ? '#ffd166' : '#ffffff'; ctx.beginPath();
          for (let q = 0; q < 10; q++) { const rr = q % 2 ? 3 : 7, aa = q * Math.PI / 5 - Math.PI / 2; ctx.lineTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr); }
          ctx.closePath(); ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      ctx.restore();
      if (opts.debug) {
        const hb = Sim.hurtbox(f, c);
        if (hb) {
          ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2;
          ctx.strokeRect(hb.x0 / Sim.SUB, FLOOR - hb.y1 / Sim.SUB, (hb.x1 - hb.x0) / Sim.SUB, (hb.y1 - hb.y0) / Sim.SUB);
        }
        if (f.state === 'attack') {
          const m = c.def.moves[f.move];
          if (!m.proyectil && f.t >= m.startup && f.t < m.startup + m.active) {
            const a = Sim.hitboxWorld(f, m);
            ctx.strokeStyle = '#f43f5e'; ctx.fillStyle = 'rgba(244,63,94,0.25)';
            ctx.fillRect(a.x0 / Sim.SUB, FLOOR - a.y1 / Sim.SUB, (a.x1 - a.x0) / Sim.SUB, (a.y1 - a.y0) / Sim.SUB);
            ctx.strokeRect(a.x0 / Sim.SUB, FLOOR - a.y1 / Sim.SUB, (a.x1 - a.x0) / Sim.SUB, (a.y1 - a.y0) / Sim.SUB);
          }
        }
        ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
        ctx.fillText(`${f.state}${f.state === 'attack' ? ' ' + c.def.moves[f.move].id + ' t' + f.t : ''}${f.juggle ? ' j' + f.juggle : ''}`, f.x / Sim.SUB, FLOOR + 22);
      }
    }
    for (const i of order) {
      const f = F[i];
      if (f.state === 'attack') { const m = defs[i].def.moves[f.move]; if (m.fx) drawMoveFx(ctx, f, defs[i], m, s.frame); }
    }
    for (const p of s.proj) drawProjectile(ctx, p, defs, s.frame);
    ctx_bolts = ctx_bolts.filter(b => b.t-- > 0);
    for (const b of ctx_bolts) {
      ctx.save(); ctx.shadowColor = '#4cc9f0'; ctx.shadowBlur = 16; ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) { ctx.strokeStyle = k ? '#4cc9f0' : '#fff'; ctx.lineWidth = k ? 2 : 3; const a = Math.random() * TAU; bolt(ctx, b.x, b.y, b.x + Math.cos(a) * 60, b.y + Math.sin(a) * 60, 16, 5); }
      ctx.restore();
    }
    // partículas
    const frozen = s.hitstop > 0 || s.freeze > 0;
    particles = particles.filter(p => p.life > 0);
    for (const p of particles) {
      if (!frozen || p.dust) p.life--;
      if (p.crack) continue;
      if (p.ring) {
        const t = 1 - p.life / p.max;
        ctx.strokeStyle = p.c; ctx.globalAlpha = 1 - t; ctx.lineWidth = 5 * (1 - t) + 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 8 + t * p.R, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
      } else if (p.streak) {
        const t = 1 - p.life / p.max;
        ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 1 - t; ctx.lineWidth = 3;
        const x0 = p.x + p.dir * t * 30;
        ctx.beginPath(); ctx.moveTo(x0, p.y); ctx.lineTo(x0 + p.dir * p.len, p.y); ctx.stroke(); ctx.globalAlpha = 1;
      } else if (p.dust) {
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.93; p.r *= 1.015;
        ctx.fillStyle = p.c + (0.35 * p.life / 40).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (p.leaf) {
        if (!frozen) { p.x += p.vx + Math.sin(p.life * 0.3); p.y += p.vy; p.vy = Math.min(p.vy + p.g, 1.5); }
        ctx.globalAlpha = Math.min(1, p.life / 10); ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * 1.6, p.r * 0.8, p.life * 0.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      } else {
        if (!frozen) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.94; }
        ctx.globalAlpha = Math.min(1, p.life / 10); ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    popups = popups.filter(p => p.t-- > 0);
    for (const p of popups) {
      ctx.globalAlpha = Math.min(1, p.t / 15); ctx.font = '900 28px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.strokeText(p.txt, p.x, p.y - (50 - p.t) * 0.6);
      ctx.fillStyle = p.c; ctx.fillText(p.txt, p.x, p.y - (50 - p.t) * 0.6); ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (screenFlash > 0) { ctx.fillStyle = `rgba(255,255,255,${0.18 * screenFlash})`; ctx.fillRect(0, 0, W, H); screenFlash--; }
    drawHUD(ctx, s, defs);
    if (s.freeze > 0 && superInfo) {
      ctx.save(); ctx.textAlign = 'center';
      const slide = Math.min(1, (40 - s.freeze) / 8);
      ctx.globalAlpha = slide;
      ctx.fillStyle = 'rgba(247,37,133,0.85)'; ctx.fillRect(0, 380, W, 56);
      ctx.font = '900 40px system-ui, sans-serif'; ctx.fillStyle = '#fff';
      ctx.fillText(superInfo.nombre.toUpperCase(), W / 2 + (1 - slide) * 300 * (superInfo.who ? 1 : -1), 422);
      ctx.restore();
    }
  }

  return { W, H, FLOOR, frame, drawFighter, consumeEvents, reset, lerpPose, ease, attackPose };
})();

