// ===================== MÓDULO input =====================
// Convierte teclado, pantalla táctil o la CPU en bits por cuadro. La simulación solo ve números.
const Input = (() => {
  const B = Sim.B;

  // ---------- teclado ----------
  const keys = new Set();
  const KEYMAP = [
    { KeyA: B.L, KeyD: B.R, KeyW: B.U, KeyS: B.D, KeyJ: B.P, KeyK: B.K, KeyL: B.S, KeyH: B.P | B.K, KeyU: B.P, KeyI: B.K, KeyO: B.S },
    { ArrowLeft: B.L, ArrowRight: B.R, ArrowUp: B.U, ArrowDown: B.D, Numpad1: B.P, Numpad2: B.K, Numpad3: B.S, Comma: B.P, Period: B.K, Slash: B.S, Minus: B.S, KeyM: B.P | B.K, Numpad4: B.P | B.K },
  ];
  function attachKeyboard() {
    addEventListener('keydown', e => { keys.add(e.code); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
    addEventListener('keyup', e => keys.delete(e.code));
    addEventListener('blur', () => keys.clear());
  }
  function keyboardBits(player) {
    let b = 0; const m = KEYMAP[player];
    for (const k of keys) if (m[k]) b |= m[k];
    return b;
  }

  // ---------- táctil ----------
  const touch = { mode: 'single', W: 0, H: 0, pads: [], ptr: new Map(), enabled: false, used: false };
  function layout(W, H, mode) {
    touch.W = W; touch.H = H; touch.mode = mode;
    const r = mode === 'single' ? Math.max(30, Math.min(54, Math.min(W, H) * 0.085)) : Math.max(18, Math.min(54, Math.min(W, H) * 0.085, W / 20));
    // botonera estilo arcade: fila de abajo puño/patada, fila de arriba especial/agarre (desplazada)
    const mk = (cx, cy) => [
      { id: 'P', bits: B.P, x: cx - 1.2 * r, y: cy + 1.1 * r, r, label: 'PUÑO', color: '#ffd166' },
      { id: 'K', bits: B.K, x: cx + 1.2 * r, y: cy + 1.1 * r, r, label: 'PATADA', color: '#4cc9f0' },
      { id: 'S', bits: B.S, x: cx - 0.55 * r, y: cy - 1.15 * r, r, label: 'ESPECIAL', color: '#f72585' },
      { id: 'G', bits: B.P | B.K, x: cx + 1.85 * r, y: cy - 1.15 * r, r: r * 0.85, label: 'AGARRE', color: '#2dd4bf' },
    ];
    const cy = H - 2.3 * r - 12;
    if (mode === 'single') {
      touch.pads = [{ joy: { x0: 0, x1: W * 0.5, rest: [Math.max(110, W * 0.14), H - 2 * r - 30] }, btns: mk(W - 2.8 * r - 12, cy), R: r * 1.4 }];
    } else {
      touch.pads = [
        { joy: { x0: 0, x1: W * 0.25, rest: [W * 0.11, H - 2 * r - 30] }, btns: mk(W * 0.36, cy), R: r * 1.25 },
        { joy: { x0: W * 0.75, x1: W, rest: [W * 0.89, H - 2 * r - 30] }, btns: mk(W * 0.64, cy), R: r * 1.25 },
      ];
    }
    touch.pads.forEach(p => { p.stick = null; p.down = new Set(); });
  }
  function attachTouch(el) {
    const pos = e => { const rc = el.getBoundingClientRect(); return [e.clientX - rc.left, e.clientY - rc.top]; };
    el.addEventListener('pointerdown', e => {
      if (!touch.enabled) return;
      if (e.pointerType === 'mouse') return;
      touch.used = true;
      const [x, y] = pos(e);
      for (let pi = 0; pi < touch.pads.length; pi++) {
        const pad = touch.pads[pi];
        for (const b of pad.btns) {
          if (Math.hypot(x - b.x, y - b.y) < b.r * 1.2) {
            touch.ptr.set(e.pointerId, { pi, btn: b.id }); pad.down.add(b.id);
            try { navigator.vibrate && navigator.vibrate(8); } catch (_) {}
            e.preventDefault(); return;
          }
        }
      }
      for (let pi = 0; pi < touch.pads.length; pi++) {
        const pad = touch.pads[pi];
        if (x >= pad.joy.x0 && x < pad.joy.x1 && y > touch.H * 0.22 && !pad.stick) {
          pad.stick = { id: e.pointerId, ox: x, oy: y, x, y };
          touch.ptr.set(e.pointerId, { pi, stick: true }); e.preventDefault(); return;
        }
      }
    }, { passive: false });
    el.addEventListener('pointermove', e => {
      const t = touch.ptr.get(e.pointerId); if (!t || !t.stick) return;
      const pad = touch.pads[t.pi]; const [x, y] = pos(e);
      pad.stick.x = x; pad.stick.y = y;
      // el centro sigue al dedo si se aleja mucho (joystick flotante)
      const dx = x - pad.stick.ox, dy = y - pad.stick.oy, d = Math.hypot(dx, dy), max = pad.R * 1.1;
      if (d > max) { pad.stick.ox = x - dx / d * max; pad.stick.oy = y - dy / d * max; }
      e.preventDefault();
    }, { passive: false });
    const up = e => {
      const t = touch.ptr.get(e.pointerId); if (!t) return;
      const pad = touch.pads[t.pi];
      if (t.stick) pad.stick = null; else pad.down.delete(t.btn);
      touch.ptr.delete(e.pointerId);
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  function touchBits(pi) {
    const pad = touch.pads[pi]; if (!pad) return 0;
    let b = 0;
    for (const id of pad.down) b |= pad.btns.find(x => x.id === id).bits;
    if (pad.stick) {
      const dx = pad.stick.x - pad.stick.ox, dy = pad.stick.y - pad.stick.oy, dead = pad.R * 0.32;
      if (Math.hypot(dx, dy) > dead) {
        const a = Math.atan2(dy, dx); // 8 direcciones
        const oct = Math.round(a / (Math.PI / 4));
        const map = { 0: B.R, 1: B.R | B.D, 2: B.D, 3: B.L | B.D, 4: B.L, '-4': B.L, '-3': B.L | B.U, '-2': B.U, '-1': B.R | B.U };
        b |= map[oct] || 0;
      }
    }
    return b;
  }
  function drawTouch(ctx) {
    if (!touch.enabled) return;
    for (const pad of touch.pads) {
      const st = pad.stick, R = pad.R;
      const [ox, oy] = st ? [st.ox, st.oy] : pad.joy.rest;
      ctx.globalAlpha = st ? 0.55 : 0.28;
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ox, oy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      let kx = ox, ky = oy;
      if (st) { const dx = st.x - ox, dy = st.y - oy, d = Math.hypot(dx, dy) || 1, m = Math.min(d, R * 0.7); kx = ox + dx / d * m; ky = oy + dy / d * m; }
      ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.arc(kx, ky, R * 0.42, 0, Math.PI * 2); ctx.fill();
      for (const b of pad.btns) {
        const on = pad.down.has(b.id);
        ctx.globalAlpha = on ? 0.85 : 0.42;
        ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (on ? 0.92 : 1), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = on ? 1 : 0.85;
        ctx.fillStyle = '#111'; ctx.font = `800 ${Math.round(b.r * 0.3)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x, b.y + 1);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------- CPU ----------
  // Elige intenciones (bloquear, antiaéreo, agarre, combo, súper) y las convierte en bits.
  function makeCPU(pi, level = 1) {
    let hold = 0, last = 0, queue = [];
    const p = [0.3, 0.6, 0.85][level];
    const react = [9, 6, 4][level];          // cuadros que tarda en reaccionar a un ataque
    let mash = 0;
    return (s, defs) => {
      const me = s.fighters[pi], op = s.fighters[1 - pi];
      if (s.phase !== 'fight') return 0;
      // técnicas de escape
      if (me.state === 'dizzy') { mash++; return (mash % 3 === 0 && Math.random() < p) ? B.P : 0; }
      if (me.state === 'grabbed') return Math.random() < p * 0.12 ? (B.P | B.K) : 0;
      if (me.state === 'hitstun' && me.y > 0 && me.vy < 0 && me.t >= 16 && Math.random() < p * 0.08) return B.K;
      if (me.state === 'down' && me.t >= 10 && Math.random() < p * 0.05) return Math.random() < 0.5 ? B.L : B.R;
      if (queue.length) return queue.shift();
      const dist = Math.abs(op.x - me.x) / Sim.SUB;
      const fw = op.x > me.x ? B.R : B.L, bk = op.x > me.x ? B.L : B.R;
      const rnd = Math.random();
      const moves = defs[pi].def.moves;
      const has = pred => moves.some(pred);
      const free = ['idle', 'walk', 'crouch'].includes(me.state) && me.y === 0;
      // antiaéreo contra saltos
      if (free && op.y > 40 * Sim.SUB && dist < 170 && op.vy < 0 && rnd < p * 0.5 && has(m => m.motion === 'DP')) return fw | B.S;
      // contragolpe o esquiva desde la guardia
      if (me.state === 'blockstun') {
        if (me.meter >= 500 && rnd < p * 0.25) return fw | B.S;
        if (me.meter >= 250 && rnd < p * 0.06) return B.D | B.P | B.K;
        return bk;
      }
      // bloquear ataques (después de su tiempo de reacción; a veces sale perfecto)
      if (op.state === 'attack' && me.state !== 'attack' && op.t >= react) {
        const m = defs[1 - pi].def.moves[op.move];
        if ((dist < 200 || m.proyectil) && rnd < p * 0.75) { last = bk | (m.nivel === 'bajo' ? B.D : 0); hold = 6; return last; }
        if (dist < 150 && rnd < p * 0.08) return B.D | B.P | B.K; // esquiva
      }
      if (s.proj.some(q => q.owner !== pi && Math.abs(q.x - me.x) / Sim.SUB < 220) && rnd < p * 0.5) {
        last = rnd < p * 0.2 ? (B.U | fw) : bk; hold = 8; return last;
      }
      // combo si conectó: encadenar hacia algo más fuerte
      if (me.state === 'attack' && me.hasHit && rnd < p) {
        if (me.meter >= Sim.METER_MAX && rnd < 0.5) return B.D | B.S;
        return [B.S, fw | B.P, B.K, fw | B.S][Math.floor(Math.random() * 4)];
      }
      // golpear al rival en el aire (juggle)
      if (op.state === 'hitstun' && op.y > 0 && dist < 150 && free && rnd < p * 0.6) return rnd < 0.5 ? (fw | B.S) : B.P;
      if (hold > 0) { hold--; return last & (B.L | B.R | B.U | B.D); }
      const hasProj = has(m => m.proyectil && !m.super);
      if (me.meter >= Sim.METER_MAX && dist < (has(m => m.super && m.proyectil) ? 500 : 160) && rnd < 0.04 * (level + 1)) return B.D | B.S;
      if (dist > 260) {
        if (hasProj && rnd < 0.035 * (level + 1)) return B.S;
        if (rnd < 0.015) { last = B.U | fw; hold = 4; queue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, B.D | B.K]; return last; }
        last = fw; hold = 6 + Math.floor(Math.random() * 8); return last;
      }
      if (dist > 120) {
        if (rnd < 0.04 * (level + 1)) return fw | B.P;
        if (rnd < 0.07 * (level + 1)) return B.K;
        if (rnd < 0.09 * (level + 1)) return B.S;
        if (rnd < 0.11) { last = B.U | fw; hold = 4; queue = Array(10).fill(0).concat([rnd < 0.5 ? B.K : B.D | B.K]); return last; }
        if (rnd < 0.16) { last = bk; hold = 10; return last; }
        last = fw; hold = 4; return last;
      }
      if (rnd < 0.03 * (level + 1)) return B.P | B.K;
      if (rnd < 0.10 * (level + 1)) return B.P;
      if (rnd < 0.13 * (level + 1)) return fw | B.K;
      if (rnd < 0.17 * (level + 1)) return B.K;
      if (rnd < 0.20 * (level + 1)) return B.D | B.K;
      if (rnd < 0.26) { last = bk; hold = 10; return last; }
      if (rnd < 0.30) { last = B.D | bk; hold = 10; return last; }
      return 0;
    };
  }

  return { attachKeyboard, keyboardBits, attachTouch, layout, touchBits, drawTouch, touch, makeCPU };
})();

