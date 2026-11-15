// Pruebas de la máquina: node juegos/ajedrez/prueba-ia.js
'use strict';
const A = require('./motor.js'), IA = require('./ia.js');
let fallas = 0;
function ok(c, t) { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fallas++; }
function jugada(fen, nivel) { const t0 = Date.now(); const m = IA.elegir(A.desdeFen(fen), nivel); return { u: A.uci(m), ms: Date.now() - t0 }; }
let r = jugada('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'maestro'); ok(r.u === 'd1d8', 'Mate en 1 con la torre (maestro): ' + r.u + ' ' + r.ms + ' ms');
r = jugada('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'dificil'); ok(r.u === 'd1d8', 'Mate en 1 (difícil): ' + r.u + ' ' + r.ms + ' ms');
r = jugada('rnb1kbnr/pppp1ppp/8/4p3/3qP3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 1', 'dificil'); ok(r.u !== '' , 'Responde en una apertura: ' + r.u + ' ' + r.ms + ' ms');
r = jugada('4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1', 'dificil'); ok(r.u === 'd1d5', 'Captura la dama colgada: ' + r.u);
r = jugada(A.INICIAL, 'dificil'); ok(r.ms < 4000, 'Primera jugada en menos de 4 s: ' + r.u + ' ' + r.ms + ' ms');
// partida completa máquina contra máquina, para revisar que no se cuelgue
let e = A.nuevo(), n = 0;
while (!A.resultado(e).fin && n < 160) { const m = IA.elegir(e, n % 2 ? 'facil' : 'medio'); e = A.jugar(e, m); n++; }
ok(true, `Partida medio vs fácil: ${n} jugadas, ${A.resultado(e).fin ? A.MOTIVOS[A.resultado(e).motivo] + ' ' + (A.resultado(e).ganador || '') : 'sin terminar'}`);
// análisis: en el mate del loco, g4 es el error grave y Dh4# la mejor jugada
global.window = undefined; global.Ajedrez = A; require('./agustin.js'); const Ag = globalThis.Agustin;
const an = IA.analizar(['f2f3', 'e7e5', 'g2g4', 'd8h4'], 250);
ok(an[2].categoria === 'grave', 'Análisis: g4 es un error grave (' + an[2].categoria + ', pierde ' + an[2].perdida + ')');
ok(an[3].categoria === 'mejor', 'Análisis: Dh4# es la mejor jugada (' + an[3].categoria + ')');
console.log('    Explicación de g4: ' + Ag.explicar(an[2]));
const an2 = IA.analizar(['e2e4', 'e7e5', 'd1h5', 'b8c6', 'f1c4', 'g8f6', 'h5f7'], 250);
ok(['error', 'grave'].includes(an2[5].categoria), 'Análisis: Cf6?? permite el mate del pastor (' + an2[5].categoria + ')');
console.log('    Explicación de Cf6: ' + Ag.explicar(an2[5]));
const e2 = A.partida(['e2e4', 'e7e5', 'g1f3', 'd7d6', 'f1c4', 'c8g4', 'b1c3', 'g7g6', 'f3e5']);
console.log('    San Agustín tras Cxe5 (trampa de Legal): ' + JSON.stringify(Ag.comentar(e2.anterior, e2, { modo: 'local' })));
ok(Ag.amenazas(e2, 'b').some(x => x.tipo === 'b'), 'Detecta el alfil negro amenazado en g4');
console.log(fallas ? `\n${fallas} prueba(s) fallaron` : '\nTodo bien');
process.exit(fallas ? 1 : 0);
