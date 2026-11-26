const fs = require('fs');
const code = ['characters.js', 'sim.js'].map(n => fs.readFileSync(__dirname + '/../src/' + n, 'utf8')).join('\n');
const { Characters, Sim } = eval(code + ';({Characters, Sim})');
const B = Sim.B, O = Characters.OFICIALES, C = d => Characters.compile(d);
const byId = id => O.find(d => d.meta.id === id);
let bad = 0; const ok = (c, msg) => { console.log((c ? 'OK   ' : 'FALLA') + ' ' + msg); if (!c) bad++; };
function setup(a, b, dist = 120) {
  const defs = [C(byId(a)), C(byId(b))]; const s = Sim.create(defs, 3);
  for (let i = 0; i < 95; i++) Sim.step(s, 0, 0, defs);
  s.fighters[0].x = 400 * Sim.SUB; s.fighters[1].x = (400 + dist) * Sim.SUB; s.fighters[0].meter = Sim.METER_MAX;
  return { s, defs };
}
const play = (s, defs, seq, n = 120, ev = []) => { for (let f = 0; f < n; f++) { Sim.step(s, seq[f] || 0, 0, defs); ev.push(...s.events); } return ev; };
const QCF = [B.D, B.D | B.R, B.R | B.P];
// 1) manzana cae sobre un rival quieto lejos
{ const { s, defs } = setup('newton', 'darwin', 400); const hp = s.fighters[1].hp; const ev = play(s, defs, QCF, 120);
  ok(s.fighters[1].hp < hp && ev.some(e => e.t === 'hit'), `Manzana cae del cielo y golpea a 400 px (vida ${hp} → ${s.fighters[1].hp})`); }
// 2) gravitación atrae
{ const { s, defs } = setup('newton', 'darwin', 170); const d0 = s.fighters[1].x - s.fighters[0].x; play(s, defs, [B.R | B.S], 30);
  const d1 = s.fighters[1].x - s.fighters[0].x; ok(d1 < d0, `Gravitación atrae al rival (distancia ${d0 / 100} → ${d1 / 100} px)`); }
// 3) radiación de Curie: daño lento después del golpe
{ const { s, defs } = setup('curie', 'newton', 300); play(s, defs, QCF, 70); const f = s.fighters[1]; const hpA = f.hp, radA = f.rad;
  play(s, defs, [], 120); ok(radA > 0 && f.hp < hpA, `Radio irradia (rad ${radA}) y sigue quitando vida: ${hpA} → ${f.hp}`); }
// 4) electro de Tesla: más aturdimiento
{ const { s, defs } = setup('tesla', 'newton', 300); const ev = play(s, defs, QCF, 60); const h = ev.find(e => e.t === 'hit');
  ok(h && h.efecto === 'electro', 'Bobina de Tesla golpea con efecto eléctrico'); }
// 5) bloqueo de la manzana: se bloquea de pie (nivel alto)
{ const { s, defs } = setup('newton', 'darwin', 520); const ev = [];
  for (let f = 0; f < 120; f++) { Sim.step(s, QCF[f] || 0, B.R, defs); ev.push(...s.events); }
  ok(ev.some(e => e.t === 'block' || e.t === 'perfect'), 'La manzana se puede bloquear'); }
// 6) determinismo y rollback con inputs aleatorios en todos los cruces
let rngS = 99; const rnd = () => (rngS = (rngS * 16807) % 2147483647) / 2147483647;
const bits = () => { let b = 0; for (const k of [B.L, B.R, B.U, B.D, B.P, B.K, B.S]) if (rnd() < 0.18) b |= k; return b; };
let detOk = true;
for (const a of O) for (const b of O) {
  const defs = [C(a), C(b)]; const ins = Array.from({ length: 4000 }, () => [bits(), bits()]);
  const r1 = Sim.create(defs, 5), r2 = Sim.create(defs, 5);
  ins.forEach(([x, y]) => Sim.step(r1, x, y, defs)); ins.forEach(([x, y]) => Sim.step(r2, x, y, defs));
  // rollback: guarda en 2000, avanza 7 con inputs falsos, vuelve y reproduce
  const r3 = Sim.create(defs, 5); let snap = null;
  for (let i = 0; i < ins.length; i++) {
    if (i === 2000) { snap = Sim.clone(r3); for (let k = 0; k < 7; k++) Sim.step(r3, 0, B.P, defs); Object.keys(r3).forEach(k => delete r3[k]); Object.assign(r3, snap); }
    Sim.step(r3, ins[i][0], ins[i][1], defs);
  }
  const c1 = Sim.checksum(r1), c2 = Sim.checksum(r2), c3 = Sim.checksum(r3);
  if (!(c1 === c2 && c2 === c3)) { detOk = false; console.log('  difiere', a.meta.id, b.meta.id, c1, c2, c3); }
}
ok(detOk, 'Determinismo + rollback en los 25 cruces de personajes');
process.exit(bad ? 1 : 0);
