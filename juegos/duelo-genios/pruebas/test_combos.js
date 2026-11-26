// Busca tiempos de input que hagan conectar cada combo con nombre (rival quieto, sin bloquear).
const fs = require('fs');
const code = ['characters.js', 'sim.js'].map(n => fs.readFileSync(__dirname + '/../src/' + n, 'utf8')).join('\n');
const { Characters, Sim } = eval(code + ';({Characters, Sim})');
const B = Sim.B;
const only = process.argv[2];
function seqFor(m) {
  const F = B.R, btn = m.boton === 'PK' ? (B.P | B.K) : B[m.boton];
  const d = m.dir === 'adelante' ? F : m.dir === 'atras' ? B.L : 0;
  if (m.super) return [B.D | B.S];
  if (m.motion === 'QCF') return [B.D, B.D | F, F | B.P];
  if (m.motion === 'DP') return [F, B.D, B.D | F | B.P];
  if (m.estado === 'agachado') return [B.D, B.D | btn];
  if (m.estado === 'aire') return [(m.dir === 'abajo' ? B.D : 0) | btn];
  return [d | btn];
}
function run(defs, plan, dist, foeDef) {
  const s = Sim.create(defs, 7);
  for (let i = 0; i < 95; i++) Sim.step(s, 0, 0, defs);
  s.fighters[0].x = 400 * Sim.SUB; s.fighters[1].x = (400 + dist) * Sim.SUB;
  s.fighters[0].meter = Sim.METER_MAX;
  const inputs = [];
  for (const [at, seq] of plan) seq.forEach((b, k) => inputs[at + k] = (inputs[at + k] || 0) | b);
  let named = [], maxCombo = 0;
  for (let f = 0; f < 260; f++) {
    Sim.step(s, inputs[f] || 0, 0, defs);
    for (const e of s.events) { if (e.t === 'named' && e.who === 0) named.push(e.nombre); if (e.t === 'hit' && e.who === 1) maxCombo = Math.max(maxCombo, e.combo); }
  }
  return { named, maxCombo };
}
let fails = 0;
for (const def of Characters.OFICIALES) {
  if (only && def.meta.id !== only) continue;
  const defs = [Characters.compile(def), Characters.compile(Characters.OFICIALES[0])];
  const byId = Object.fromEntries(def.moves.map(m => [m.id, m]));
  for (const c of def.combos) {
    if (c.secuencia.includes('perfecto')) continue;
    let found = null;
    const first = byId[c.secuencia[0]];
    const pre = first.estado === 'aire' ? [[0, [B.U | B.R]]] : [];
    const start0 = first.estado === 'aire' ? 1 : 0;
    outer:
    for (const dist of [70, 90, 110, 140, 180]) {
      for (let s0 = start0; s0 < (first.estado === 'aire' ? 40 : 1); s0 += 2) {
        // búsqueda en profundidad de los retrasos
        const rec = (i, plan, lastAt) => {
          if (i === c.secuencia.length) { const r = run(defs, plan, dist); if (r.named.includes(c.nombre)) { found = { dist, plan: plan.map(p => p[0]) }; return true; } return false; }
          const m = byId[c.secuencia[i]];
          for (let dl = 3; dl <= 40; dl++) if (rec(i + 1, [...plan, [lastAt + dl, seqFor(m)]], lastAt + dl)) return true;
          return false;
        };
        if (rec(1, [...pre, [s0, seqFor(first)]], s0)) break outer;
      }
    }
    if (!found) fails++;
    console.log(def.meta.id.padEnd(8), (found ? 'OK  ' : 'FALLA'), c.nombre.padEnd(20), c.secuencia.join(' > '), found ? JSON.stringify(found) : '');
  }
}
process.exit(fails ? 1 : 0);
