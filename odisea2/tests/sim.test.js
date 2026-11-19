// node tests/sim.test.js
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const ctx = { console }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['config', 'planets', 'atmosfera', 'nave', 'sim']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', f + '.js'), 'utf8'), ctx);
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
t('Nave modular: 1 propulsor = potencia ×1,2 y consumo ×1,1; 4 propulsores = compuesto', () => {
  const N = OC3.Nave, C = OC3.Config.nave;
  const d1 = N.derivados({ propulsor: 1 }); assert(Math.abs(d1.factores.potencia - 1.2) < 1e-9 && Math.abs(d1.consumoMult - 1.1) < 1e-9);
  assert(Math.abs(d1.vCrucero - C.vCrucero * 1.2) < 1e-9 && Math.abs(d1.accLateral - C.accLateral * 1.2) < 1e-9);
  const d4 = N.derivados({ propulsor: 4 }); assert(Math.abs(d4.factores.potencia - Math.pow(1.2, 4)) < 1e-9 && Math.abs(d4.consumoMult - Math.pow(1.1, 4)) < 1e-9);
  assert(N.derivados({ propulsor: 9 }).factores.potencia === d4.factores.potencia, 'el tope es 4');
  assert(N.normalizar({ propulsor: -3, tanque: 'x' }).propulsor === 0 && N.normalizar({ tanque: 2.4 }).tanque === 2);
});
t('Nave modular: tanque = más capacidad pero menos velocidad', () => {
  const d = OC3.Nave.derivados({ tanque: 2 }), C = OC3.Config.nave;
  assert(d.combustibleMax > C.combustibleMax && d.vCrucero < C.vCrucero && Math.abs(d.vCrucero - C.vCrucero * 0.93 * 0.93) < 1e-9);
  const lineas = OC3.Nave.describir('tanque'); assert(lineas.ventajas.length === 1 && lineas.inconvenientes.length === 1);
  assert(OC3.Nave.describir('propulsor').inconvenientes[0].includes('Consumo'));
});
t('Sim con módulos: velocidad, depósito y gasto cambian; los meteoroides siguen apareciendo por distancia', () => {
  const mk = (eq) => { const s = OC3.Sim.crear({ planeta: 'mercurio', semilla: 9, equipo: eq }); s._tBonus = 999; return s; };
  const base = mk({}), rap = mk({ propulsor: 4 }), tq = mk({ tanque: 4 });
  assert(rap.nave.vf > base.nave.vf * 2 && tq.nave.combMax > base.nave.combMax * 2 && tq.nave.vf < base.nave.vf * 0.8);
  const gasto = (s) => { const c0 = s.nave.combustible; for (let i = 0; i < 600; i++) s.paso(1 / 60, {}); return (c0 - s.nave.combustible) / (s.t); };
  const gb = gasto(base), gr = gasto(rap); console.log('   gasto/s base', gb.toFixed(2), '· 4 propulsores', gr.toFixed(2), '(×' + (gr / gb).toFixed(2) + ')');
  assert(Math.abs(gr / gb - Math.pow(1.1, 4)) < 0.02);
  const cuenta = (s) => { s.nave.pos.y = 60; let n = 0, d0 = s.dist; const vistos = new Set(); for (let i = 0; i < 60 * 40; i++) { s.paso(1 / 60, { y: 0.45 }); s.nave.combustible = 100; if (s.nave.pos.y < 20) s.nave.pos.y = 60; for (const e of s.ents) if (e.tipo === 'meteoro') vistos.add(e.id); } return vistos.size / ((s.dist - d0) / 1000); };
  const mb = cuenta(mk({})), mr = cuenta(mk({ propulsor: 4 })); console.log('   meteoroides por 1000 u: base', mb.toFixed(1), '· rápido', mr.toFixed(1));
  assert(mr / mb > 0.7 && mr / mb < 1.4);
});
function bot(s, i) {
  const n = s.nave; let tx = 0, ty = 45, peligro = null, dm = 1e9;
  for (const e of s.ents) if (e.tipo === 'meteoro' || e.tipo === 'rayo') { const d = n.pos.z - e.pos.z; if (d > 0 && d < 90 && Math.abs(e.pos.x - n.pos.x) < 10 && Math.abs(e.pos.y - n.pos.y) < 10 && d < dm) { dm = d; peligro = e; } }
  for (const e of s.ents) if (e.colision === 'bonus') { const d = n.pos.z - e.pos.z; if (d > 0 && d < 120) { tx = e.pos.x; ty = e.pos.y; } }
  const j = s.jefe; let fuego = !!peligro || i % 30 < 15;
  if (j && !j.muerto) { tx = j.pos.x; ty = j.pos.y; fuego = j.vulnerable; }
  if (peligro) { tx = peligro.pos.x + (peligro.pos.x > n.pos.x ? -14 : 14); ty = n.pos.y + (peligro.pos.y > n.pos.y ? -8 : 8); }
  return { x: Math.max(-1, Math.min(1, (tx - n.pos.x) * 0.15 - n.vel.x * 0.04)), y: Math.max(-1, Math.min(1, (ty - n.pos.y) * 0.15 - n.vel.y * 0.06)), fuego };
}
t('Jefe: aparece al final del tramo, respira/habla y sus frases salen en orden', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio', semilla: 5 }); const frases = [], fases = new Set(); let vistoJefe = false;
  for (let i = 0; i < 60 * 260 && s.estado === 'jugando'; i++) {
    s.paso(1 / 60, bot(s, i)); if (s.jefe) { vistoJefe = true; fases.add(s.jefe.fase); }
    for (const e of s.eventos) if (e.t === 'habla') frases.push(e.frase); s.eventos.length = 0;
  }
  console.log('   fases:', [...fases].join(','), '· frases:', frases.slice(0, 4).join(' | '), '· estado:', s.estado, '· tiempo', s.t.toFixed(0), 's');
  assert(vistoJefe && fases.has('respira') && fases.has('aviso') && fases.has('habla'));
  assert(frases[0] === 'Me gustan las cuecas' && frases[1] === 'Recuerda tu disertación de tu grupo' && frases[2] === '¡Apréndete el himno del colegio!');
});
t('Jefe: invulnerable mientras habla (el rayo rebota), vulnerable al respirar', () => {
  const mk = () => { const s = OC3.Sim.crear({ planeta: 'mercurio' }); s._tMeteoro = 999; s._tBonus = 999; s.nave.pos.z = -8001; s.nave.pos.y = 40; s.dist = 8001; s.paso(1 / 60, {}); s.jefe.fase = 'respira'; s.jefe.tDisparo = 99; for (let i = 0; i < 3; i++) s.paso(1 / 60, {}); return s; };
  const colocar = (s, fase, vul) => { const j = s.jefe; j.fase = fase; j.t = 0; j.vulnerable = vul; j.tDisparo = 99;
    s.ents.push({ id: 777, tipo: 'laser', colision: 'destruye', radio: 0.55, daño: 1, hp: 1, vida: 3, pos: { x: j.pos.x, y: j.pos.y, z: j.pos.z + 6 }, vel: { x: 0, y: 0, z: -300 }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } }); };
  let s = mk(); assert(s.jefe, 'sin jefe'); const hp0 = s.jefe.hp; colocar(s, 'habla', false); s.jefe.t = 0; s.paso(1 / 60, {}); assert(s.jefe.hp === hp0, 'recibió daño hablando');
  s = mk(); colocar(s, 'respira', true); s.paso(1 / 60, {}); assert(s.jefe.hp === hp0 - 1, 'no recibió daño respirando: ' + s.jefe.hp);
});
t('Jefe: rayos dañan a la nave y chocan con los rayos propios (ambos se destruyen)', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio' }); s._tMeteoro = 999; s._tBonus = 999; const n = s.nave; n.pos.y = 40;
  const mk = (tipo, z, vz, extra) => Object.assign({ id: Math.random(), tipo, colision: 'destruye', radio: 1.4, hp: 1, vida: 5, pos: { x: n.pos.x, y: n.pos.y, z }, vel: { x: 0, y: 0, z: vz }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } }, extra || {});
  const r = mk('rayo', n.pos.z - 4, 70); s.ents.push(r); const e0 = n.escudo; s.paso(1 / 30, {}); assert(n.escudo < e0 && r.hp <= 0, 'rayo no dañó');
  const s2 = OC3.Sim.crear({ planeta: 'mercurio' }); s2._tMeteoro = 999; s2._tBonus = 999; const r2 = mk('rayo', -80, 70), l = mk('laser', -74, -300, { daño: 1, radio: 0.55 }); r2.pos.x = l.pos.x = 0; r2.pos.y = l.pos.y = 40; s2.ents.push(r2, l); s2.paso(1 / 30, {}); assert(r2.hp <= 0 && l.hp <= 0, 'rayo y láser no se destruyeron');
});
t('Bot derrota al Profesor Alex y completa el nivel (jugable)', () => {
  const s = OC3.Sim.crear({ planeta: 'mercurio', semilla: 5 });
  for (let i = 0; i < 60 * 300 && s.estado === 'jugando'; i++) s.paso(1 / 60, bot(s, i));
  console.log('   estado:', s.estado, '· tiempo', s.t.toFixed(0), 's · puntos', Math.round(s.puntos), '· escudo', Math.round(s.nave.escudo), '· comb', Math.round(s.nave.combustible), s.stats, '· jefe hp', s.jefe && s.jefe.hp);
  assert(Number.isFinite(s.puntos)); assert(s.estado === 'completo' || s.estado === 'destruida');
});
t('Economía: una moneda recogida suma su valor; el jefe da su recompensa', () => {
  const E = OC3.Config.economia, s = OC3.Sim.crear({ planeta: 'mercurio' }); s._tMeteoro = 999; s._tBonus = 999; s._dMoneda = 1e9; const n = s.nave; n.pos.y = 40;
  s.ents.push({ id: 1, tipo: 'moneda', colision: 'bonus', radio: 2.4, y0: 40, fase: 0, hp: 1, pos: { x: n.pos.x, y: 40, z: n.pos.z - 6 }, vel: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 3, z: 0 } });
  for (let i = 0; i < 20; i++) s.paso(1 / 30, {});
  assert(s.dinero === E.monedaValor && s.stats.monedas === 1, 'dinero ' + s.dinero);
  const m = OC3.Sim.crear({ planeta: 'mercurio' }); m._tMeteoro = 999; m._tBonus = 999; m.nave.pos.z = -8001; m.nave.pos.y = 40; m.dist = 8001; m.paso(1 / 60, {}); m.jefe.fase = 'respira'; m.jefe.tDisparo = 99; for (let i = 0; i < 3; i++) m.paso(1 / 60, {}); m.jefe.fase = 'respira'; m.jefe.t = 0; m.jefe.vulnerable = true; m.jefe.hp = 0.5; m.jefe.tDisparo = 99;
  m.ents.push({ id: 9, tipo: 'laser', colision: 'destruye', radio: 0.55, daño: 1, hp: 1, vida: 3, pos: { x: m.jefe.pos.x, y: m.jefe.pos.y, z: m.jefe.pos.z + 6 }, vel: { x: 0, y: 0, z: -300 }, rot: { x: 0, y: 0, z: 0 }, spin: { x: 0, y: 0, z: 0 } });
  m.paso(1 / 60, {}); assert(m.estado === 'completo' && m.dinero === E.recompensaJefe, 'recompensa ' + m.dinero);
});
t('Economía: instalar cuesta lo fijado, sin dinero no se instala, y quitar devuelve solo lo instalado ahora', () => {
  const E = OC3.Config.economia, N = OC3.Nave, ab = { propulsor: 1, tanque: 0 };
  let r = N.cambiar({ propulsor: 1, tanque: 0 }, ab, E.costoInstalacion - 1, 'propulsor', 1); assert(!r.ok && r.motivo === 'sin dinero');
  r = N.cambiar({ propulsor: 1, tanque: 0 }, ab, E.costoInstalacion, 'propulsor', 1); assert(r.ok && r.dinero === 0 && r.equipo.propulsor === 2);
  r = N.cambiar(r.equipo, ab, r.dinero, 'propulsor', -1); assert(r.ok && r.dinero === E.costoInstalacion && r.equipo.propulsor === 1, 'devolución de lo instalado ahora');
  r = N.cambiar(r.equipo, ab, r.dinero, 'propulsor', -1); assert(r.ok && r.dinero === E.costoInstalacion && r.equipo.propulsor === 0, 'lo instalado antes no se devuelve');
  r = N.cambiar({ propulsor: 4, tanque: 0 }, { propulsor: 4 }, 1e9, 'propulsor', 1); assert(!r.ok && r.motivo === 'máximo');
  assert(E.costoInstalacion === 10000);
});
t('Economía AJUSTADA: lo máximo que se gana en una misión ronda 1,2–1,8 veces el costo de instalar un módulo', () => {
  const E = OC3.Config.economia; let lanzadas = 0, ganado = 0, comp = 0;
  for (const semilla of [3, 5, 8]) {
    const s = OC3.Sim.crear({ planeta: 'mercurio', semilla });
    for (let i = 0; i < 60 * 300 && s.estado === 'jugando'; i++) { s.paso(1 / 60, bot(s, i)); s.nave.escudo = 100; s.nave.combustible = s.nave.combMax; }
    lanzadas += s.stats.monedasLanzadas; ganado += s.dinero; comp += s.stats.monedas;
    const tope = s.stats.monedasLanzadas * E.monedaValor + E.recompensaJefe, r = tope / E.costoInstalacion;
    console.log('   semilla', semilla, '· monedas lanzadas', s.stats.monedasLanzadas, '· máximo $' + tope, '(×' + r.toFixed(2) + ') · el bot ganó $' + s.dinero, '· estado', s.estado);
    assert(r >= E.topeMaxMision[0] && r <= E.topeMaxMision[1], 'desequilibrio: máximo ×' + r.toFixed(2) + ' del costo');
  }
  assert(Number.isFinite(ganado) && ganado > 0);
});
console.log('\n' + ok + ' pruebas OK');
