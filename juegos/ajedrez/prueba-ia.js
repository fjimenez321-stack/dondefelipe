// Pruebas de la máquina: node juegos/ajedrez/prueba-ia.js
'use strict';
const A = require('./motor.js'), IA = require('./ia.js');
let fallas = 0;
function ok(c, t) { console.log((c ? '  ✓ ' : '  ✗ ') + t); if (!c) fallas++; }
function jugada(fen, nivel) { const t0 = Date.now(); const m = IA.elegir(A.desdeFen(fen), nivel); return { u: A.uci(m), ms: Date.now() - t0 }; }
let r = jugada('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'medio'); ok(r.u === 'd1d8', 'Mate en 1 con la torre (medio): ' + r.u + ' ' + r.ms + ' ms');
r = jugada('6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'dificil'); ok(r.u === 'd1d8', 'Mate en 1 (difícil): ' + r.u + ' ' + r.ms + ' ms');
r = jugada('rnb1kbnr/pppp1ppp/8/4p3/3qP3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 1', 'dificil'); ok(r.u !== '' , 'Responde en una apertura: ' + r.u + ' ' + r.ms + ' ms');
r = jugada('4k3/8/8/3q4/8/8/8/3RK3 w - - 0 1', 'medio'); ok(r.u === 'd1d5', 'Captura la dama colgada: ' + r.u);
r = jugada(A.INICIAL, 'dificil'); ok(r.ms < 4000, 'Primera jugada en menos de 4 s: ' + r.u + ' ' + r.ms + ' ms');
// partida completa máquina contra máquina, para revisar que no se cuelgue
let e = A.nuevo(), n = 0;
while (!A.resultado(e).fin && n < 160) { const m = IA.elegir(e, n % 2 ? 'facil' : 'medio'); e = A.jugar(e, m); n++; }
ok(true, `Partida medio vs fácil: ${n} jugadas, ${A.resultado(e).fin ? A.MOTIVOS[A.resultado(e).motivo] + ' ' + (A.resultado(e).ganador || '') : 'sin terminar'}`);
console.log(fallas ? `\n${fallas} prueba(s) fallaron` : '\nTodo bien');
process.exit(fallas ? 1 : 0);
