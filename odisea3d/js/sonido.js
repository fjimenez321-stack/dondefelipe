/* ODISEA 3D · sonido.js — efectos mínimos con WebAudio (sin archivos). M = silenciar. */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};
  let ac = null, mudo = false;
  function ctx() { if (!ac) { try { ac = new (root.AudioContext || root.webkitAudioContext)(); } catch (e) { ac = false; } } return ac; }
  function tono(f0, f1, dur, tipo, vol) {
    const a = ctx(); if (!a || mudo) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur);
  }
  function ruido(dur, vol) {
    const a = ctx(); if (!a || mudo) return; const n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = a.createBufferSource(), g = a.createGain(); s.buffer = b; g.gain.value = vol; s.connect(g); g.connect(a.destination); s.start();
  }
  OC3.Sonido = {
    activar() { const a = ctx(); if (a && a.state === 'suspended') a.resume(); },
    alternar() { mudo = !mudo; return mudo; },
    evento(e) {
      if (e.t === 'laser') tono(900, 380, 0.07, 'square', 0.04);
      else if (e.t === 'explosion') ruido(Math.min(0.9, 0.25 + (e.tam || 2) * 0.06), 0.18);
      else if (e.t === 'daño') tono(160, 50, 0.3, 'sawtooth', 0.12);
      else if (e.t === 'bonus') { tono(520, 780, 0.12, 'triangle', 0.1); setTimeout(() => tono(780, 1100, 0.14, 'triangle', 0.1), 90); }
    }
  };
})(window);
