/* ============================================================
   ODISEA CÓSMICA · audio.js
   SONIDO — síntesis Web Audio (sin archivos externos).
   Enriquecido: ganancia maestra, silenciador, envolventes,
   ambiente por mundo y efectos con más cuerpo.
   API: OC.Audio.{unlock, mute, isMuted, shoot, explosion, hit,
        correct, wrong, levelup, life, power, coolant, overheat,
        boss, event, noteMusical, ambient(world), stopAmbient}
   ============================================================ */
window.OC = window.OC || {};
OC.Audio = (function () {
  let ctx = null, master = null, muted = false;
  let ambientNodes = null;
  // Nota base del zumbido ambiental por escenario (Hz): graves hondos bajo tierra, más agudos en el cuerpo.
  const AMB = { mercurio: 70, venus: 55, tierra: 50, marte: 60, jupiter: 38, saturno: 42, urano: 48, neptuno: 46, kuiper: 36, oort: 33,
    litosfera: 46, astenosfera: 41, manto: 36, nucleo_ext: 31, nucleo_int: 27,
    alfa_centauri: 52, orion: 44, pleyades: 58, agujero_negro: 28, andromeda: 40,
    respiratorio: 66, circulatorio: 49, digestivo: 54, inmunologico: 62, nervioso: 74,
    bosque: 64, humedal: 58, oceano: 45, altiplano: 68, atacama: 52 };
  const LATIDO = { circulatorio: 1.2, nervioso: 3.4 };   // pulso suave del ambiente (Hz)

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    return ctx;
  }

  // Oscilador con envolvente ADSR simple.
  function osc(freq, dur, { type = 'square', vol = 0.12, to = null, attack = 0.005, decay = null } = {}) {
    if (muted) return;
    try {
      const c = ensure(), o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime);
      if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), c.currentTime + dur);
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(vol, c.currentTime + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (decay || dur));
      o.connect(g); g.connect(master);
      o.start(); o.stop(c.currentTime + dur + 0.02);
    } catch (e) {}
  }

  // Ráfaga de ruido (para explosiones con textura).
  function noise(dur, { vol = 0.12, lp = 1200 } = {}) {
    if (muted) return;
    try {
      const c = ensure();
      const n = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, n, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp;
      const g = c.createGain(); g.gain.value = vol;
      src.connect(f); f.connect(g); g.connect(master);
      src.start();
    } catch (e) {}
  }

  const seq = (notes, gap, opt) => notes.forEach((f, i) => setTimeout(() => osc(f, opt && opt.dur || 0.14, opt), i * gap));

  return {
    unlock() { try { ensure(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) {} },
    mute(v) { muted = (v === undefined) ? !muted : !!v; if (muted) this.stopAmbient(); return muted; },
    isMuted() { return muted; },

    shoot()      { osc(880, 0.10, { type: 'square', vol: 0.06, to: 240 }); },
    explosion()  { noise(0.28, { vol: 0.16, lp: 900 }); osc(150, 0.24, { type: 'sawtooth', vol: 0.10, to: 40 }); },
    hit()        { noise(0.2, { vol: 0.18, lp: 500 }); osc(90, 0.4, { type: 'sawtooth', vol: 0.16, to: 30 }); },
    correct()    { seq([523, 659, 784], 110, { type: 'square', vol: 0.12, dur: 0.16 }); },
    wrong()      { osc(200, 0.25, { type: 'square', vol: 0.14, to: 120 }); },
    levelup()    { seq([392, 523, 659, 784, 1047], 120, { type: 'triangle', vol: 0.12, dur: 0.18 }); },
    life()       { osc(659, 0.12, { type: 'triangle', vol: 0.13 }); setTimeout(() => osc(988, 0.2, { type: 'triangle', vol: 0.13 }), 120); },
    power()      { osc(440, 0.08, { type: 'square', vol: 0.10 }); setTimeout(() => osc(660, 0.12, { type: 'square', vol: 0.10 }), 80); },
    coolant()    { osc(1200, 0.10, { type: 'sine', vol: 0.12, to: 500 }); setTimeout(() => osc(700, 0.14, { type: 'sine', vol: 0.10, to: 300 }), 80); },
    overheat()   { osc(120, 0.5, { type: 'sawtooth', vol: 0.18, to: 300 }); noise(0.4, { vol: 0.10, lp: 1600 }); },
    boss()       { osc(70, 0.5, { type: 'sawtooth', vol: 0.2, to: 50 }); setTimeout(() => osc(110, 0.4, { type: 'square', vol: 0.15 }), 200); },
    event()      { osc(300, 0.2, { type: 'square', vol: 0.12, to: 180 }); setTimeout(() => osc(240, 0.25, { type: 'square', vol: 0.12, to: 140 }), 160); },
    // "notas musicales" del Profesor Carlos: una nota aleatoria de una escala
    noteMusical() {
      const escala = [523, 587, 659, 698, 784, 880, 988];
      osc(escala[Math.floor(Math.random() * escala.length)], 0.18, { type: 'triangle', vol: 0.10 });
    },

    // Zumbido ambiental sutil, distinto por mundo (drone de dos osciladores).
    ambient(world) {
      this.stopAmbient();
      if (muted) return;
      try {
        const c = ensure();
        const f = world && (world.fondo || world.scene);
        const base = AMB[f] || 44;
        const g = c.createGain(); g.gain.value = 0.0; g.connect(master);
        g.gain.setTargetAtTime(0.035, c.currentTime, 1.2);
        const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = base;
        const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = base * 1.5;
        o1.connect(g); o2.connect(g); o1.start(); o2.start();
        let lfo = null;
        if (f && LATIDO[f]) {
          lfo = c.createOscillator(); lfo.frequency.value = LATIDO[f];
          const depth = c.createGain(); depth.gain.value = 0.02; lfo.connect(depth); depth.connect(g.gain); lfo.start();
        }
        ambientNodes = { g, o1, o2, lfo };
      } catch (e) {}
    },
    stopAmbient() {
      if (!ambientNodes) return;
      try {
        const c = ensure();
        ambientNodes.g.gain.setTargetAtTime(0.0001, c.currentTime, 0.3);
        const n = ambientNodes; setTimeout(() => { try { n.o1.stop(); n.o2.stop(); if (n.lfo) n.lfo.stop(); } catch (e) {} }, 600);
      } catch (e) {}
      ambientNodes = null;
    }
  };
})();
