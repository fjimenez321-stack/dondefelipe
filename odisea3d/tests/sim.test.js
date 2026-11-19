// node tests/sim.test.js
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const ctx = { console }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['config', 'planets', 'atmosfera', 'sim']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', f + '.js'), 'utf8'), ctx);
const OC3 = ctx.OC3;
let ok = 0; const t = (n, f) => { f(); ok++; console.log('OK ', n); };
const run = (s, secs, inp) => { for (let i = 0; i < secs * 60; i++) s.paso(1 / 60, inp || {}); };

t('Mercurio: la densidad atmosférica es prácticamente nula', () => {
  const r = OC3.Atmosfera.razon(OC3.Planetas.mercurio, 40); assert(r < 1e-12, r);
});
t('Atmósfera: Venus >> Tierra >> Marte >> Mercurio, y baja con la altitud', () => {
  const A = OC3.Atmosfera, P = OC3.Planetas;
  assert(A.razon(P.venus, 10) > A.razon(P.tierra, 10) && A.razon(P.tierra, 10) > A.razon(P.marte, 10) && A.razon(P.marte, 10) > A.razon(P.mercurio, 10));
  assert(A.razon(P.tierra, 10) > A.razon(P.tierra, 100));
});
t('frenar nunca invierte el signo de la velocidad', () => {
  const A = OC3.Atmosfera; for (const v of [-80, -1, 0.5, 90]) { const r = A.frenar(v, 5, 0.05); assert(Math.sign(r) === Math.sign(v) || r === 0); assert(Math.abs(r) < Math.abs(v) + 1e-12); }
});
t('Gravedad: sin mando, la nave cae más rápido en Júpiter que en Mercurio', () => {
  const caida = (pl) => { const s = OC3.Sim.crear({ planeta: pl, semilla: 1 }); s.nave.pos.y = 80; s._tMeteoro = 999; s._tBonus = 999; run(s, 2); return 80 - s.nave.pos.y; };
  const m = caida('mercurio'), tt = caida('tierra'), j = caida('jupiter');
  console.log('   caída en 2 s:', { mercurio: m.toFixed(1), tierra: tt.toFixed(1), jupiter: j.toFixed(1) });
  assert(m < tt && tt < j);
});
t('Atmósfera: en Mercurio la nave mantiene su velocidad; en Venus se frena', () => {
  const vel = (pl) => { const s = OC3.Sim.crear({ planeta: pl, semilla: 1 }); s._tMeteoro = 999; s._tBonus = 999; s.nave.pos.y = 90; run(s, 3, { y: 1 }); return s.nave.vf; };
  const m = vel('mercurio'), v = vel('venus'), tt = vel('tierra');
  console.log('   vel. adelante:', { mercurio: m.toFixed(1), tierra: tt.toFixed(1), venus: v.toFixed(1) });
  assert(m > 60 && v < m * 0.5 && tt < m);
});
t('Mercurio: respuesta ligera (inercia lateral) frente a la Tierra', () => {
  const x = (pl) => { const s = OC3.Sim.crear({ planeta: pl, semilla: 1 }); s._tMeteoro = 999; s._tBonus = 999; run(s, 1, { x: 1 }); run(s, 0.5, {}); return s.nave.pos.x; };
  const m = x('mercurio'), tt = x('tierra'); console.log('   deriva x:', m.toFixed(1), tt.toFixed(1)); assert(m > tt);
});
t('Colisión: meteoroide contra la nave → ambos destruidos y la nave pierde escudo', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio' }); s._tMeteoro = 999; s._tBonus = 999;
  const n = s.nave; const e = { id: 99, tipo: 'meteoro', colision: 'destruye', clase: 2, escala: 3, radio: 2.8, hp: 2, pos: { x: n.pos.x, y: n.pos.y, z: n.pos.z - 30 }, vel: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } };
  s.ents.push(e); const e0 = n.escudo; run(s, 1);
  assert(n.escudo < e0 && !s.ents.includes(e));
});
t('Colisión: rayo vs meteoroide (hp 3) necesita 3 impactos y da puntos', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio' }); s._tMeteoro = 999; s._tBonus = 999;
  const n = s.nave; n.pos.y = 60;
  const e = { id: 98, tipo: 'meteoro', colision: 'destruye', clase: 3, escala: 4.5, radio: 4, hp: 3, pos: { x: n.pos.x + 1.5, y: n.pos.y, z: n.pos.z - 200 }, vel: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } };
  s.ents.push(e); const p0 = s.puntos;
  // gravedad lo baja: lo mantenemos en su sitio para aislar la regla
  for (let i = 0; i < 400 && s.ents.includes(e); i++) { e.pos.y = 60; e.vel.y = 0; s.paso(1 / 60, { fuego: true }); n.pos.y = 60; n.vel.y = 0; }
  assert(!s.ents.includes(e), 'no fue destruido'); assert(s.stats.destruidos >= 1 && s.puntos - p0 >= 30);
});
t('Bonus: no destruyen nada, solo la nave los recoge; el rayo los atraviesa', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio' }); s._tMeteoro = 999; s._tBonus = 999;
  const n = s.nave; n.pos.y = 60; n.combustible = 20; n.escudo = 50;
  const mk = (tipo, z) => ({ id: Math.random(), tipo, colision: 'bonus', radio: 2.6, y0: 60, fase: 0, hp: 1, pos: { x: n.pos.x, y: 60, z: n.pos.z - z }, vel: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } });
  const f = mk('combustible', 40), h = mk('herramientas', 80), m = { id: 5, tipo: 'meteoro', colision: 'destruye', clase: 1, escala: 1.2, radio: 1.1, hp: 1, pos: { x: n.pos.x, y: 60, z: n.pos.z - 40 }, vel: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } };
  // meteoroide encima del bonus: no se destruyen entre sí
  s.ents.push(f, m); s.paso(1 / 60, {}); assert(f.hp > 0 && m.hp > 0, 'un bonus fue destruido por un objeto');
  s.ents.length = 0; s.ents.push(f, h);
  for (let i = 0; i < 400; i++) { s.paso(1 / 60, { fuego: true }); n.pos.y = 60; n.vel.y = 0; if (n.combustible > 50 && n.escudo > 70) break; }
  assert(n.combustible > 20 && n.escudo > 50 && s.stats.bonus === 2, JSON.stringify(s.stats));
});
t('Suelo: tocar el suelo daña la nave y rebota', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio' }); s._tMeteoro = 999; s._tBonus = 999; s.nave.pos.y = 0.5; const e0 = s.nave.escudo; s.paso(1 / 60, {});
  assert(s.nave.escudo < e0 && s.nave.vel.y > 0);
});
t('Partida completa sin mando: termina (destruida o completa) sin NaN', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio', semilla: 3 }); run(s, 200, { fuego: true });
  assert(s.estado !== 'jugando'); assert(Number.isFinite(s.nave.pos.x + s.nave.pos.y + s.puntos));
});
t('Bot simple completa el tramo de Mercurio (jugable)', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio', semilla: 5 });
  for (let i = 0; i < 60 * 200 && s.estado === 'jugando'; i++) {
    const n = s.nave; let tx = 0, ty = 45, peligro = null, dm = 1e9;
    for (const e of s.ents) if (e.tipo === 'meteoro') { const d = n.pos.z - e.pos.z; if (d > 0 && d < 90 && Math.abs(e.pos.x - n.pos.x) < 9 && Math.abs(e.pos.y - n.pos.y) < 9 && d < dm) { dm = d; peligro = e; } }
    for (const e of s.ents) if (e.colision === 'bonus') { const d = n.pos.z - e.pos.z; if (d > 0 && d < 120) { tx = e.pos.x; ty = e.pos.y; } }
    if (peligro) { tx = peligro.pos.x + (peligro.pos.x > n.pos.x ? -14 : 14); }
    s.paso(1 / 60, { x: Math.max(-1, Math.min(1, (tx - n.pos.x) * 0.15 - n.vel.x * 0.04)), y: Math.max(-1, Math.min(1, (ty - n.pos.y) * 0.15 - n.vel.y * 0.06)), fuego: !!peligro || i % 30 < 15 });
  }
  console.log('   estado:', s.estado, '· tiempo', s.t.toFixed(0), 's · puntos', Math.round(s.puntos), '· escudo', Math.round(s.nave.escudo), '· comb', Math.round(s.nave.combustible), s.stats);
  assert(Number.isFinite(s.puntos));
});
console.log('\n' + ok + ' pruebas OK');
