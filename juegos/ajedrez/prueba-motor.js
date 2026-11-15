// Pruebas del motor: node juegos/ajedrez/prueba-motor.js
// Compara el número de posiciones (perft) con valores conocidos y revisa los finales.
'use strict';
const A = require('./motor.js');
let fallas = 0;
function ok(cond, txt) { console.log((cond ? '  ✓ ' : '  ✗ ') + txt); if (!cond) fallas++; }

console.log('Perft (cantidad de posiciones a cierta profundidad)');
const casos = [
  ['Inicial', A.INICIAL, [20, 400, 8902, 197281]],
  ['Kiwipete', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],
  ['Posición 3', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]],
  ['Posición 4', 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [6, 264, 9467]],
  ['Posición 5', 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [44, 1486, 62379]]
];
for (const [n, f, vals] of casos) {
  const e = A.desdeFen(f);
  vals.forEach((v, i) => { const r = A.perft(e, i + 1); ok(r === v, `${n} prof ${i + 1}: ${r} (esperado ${v})`); });
}

console.log('Finales');
let e = A.partida(['f2f3', 'e7e5', 'g2g4', 'd8h4']);
ok(A.resultado(e).motivo === 'jaque-mate' && A.resultado(e).ganador === 'b', 'Mate del loco: ganan negras');
ok(e.historial[3].san === 'Dh4#', 'Notación del mate: ' + e.historial[3].san);
e = A.desdeFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
ok(A.resultado(e).motivo === 'ahogado', 'Rey ahogado');
e = A.desdeFen('8/8/4k3/8/8/2B5/4K3/8 w - - 0 1');
ok(A.resultado(e).motivo === 'material', 'Rey y alfil contra rey: tablas');
e = A.partida(['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8']);
ok(A.resultado(e).motivo === 'repeticion', 'Triple repetición');
e = A.partida(['e2e4', 'a7a6', 'e4e5', 'd7d5', 'e5d6']);
ok(e.historial[4].san === 'exd6' && !e.t[A.casilla('d5')], 'Captura al paso');
e = A.desdeFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
ok(A.legales(e, A.casilla('e1')).filter(m => m.tipo === 'enroque').length === 2, 'Dos enroques posibles');
e = A.jugarUci(e, 'e1g1');
ok(e.t[A.casilla('f1')] === 'R' && e.historial[0].san === 'O-O' && e.enroque === 'kq', 'Enroque corto');
e = A.desdeFen('8/P6k/8/8/8/8/8/K7 w - - 0 1');
e = A.jugarUci(e, 'a7a8q');
ok(e.t[A.casilla('a8')] === 'Q' && e.historial[0].san === 'a8=D', 'Coronación: ' + e.historial[0].san);
e = A.desdeFen('k7/8/8/8/8/8/8/1N3N1K w - - 0 1');
ok(A.san(e, A.buscarUci(e, 'b1d2')) === 'Cbd2', 'Desambiguación: Cbd2');
ok(A.resultadoPorTiempo(A.desdeFen('8/8/4k3/8/8/2B5/4K3/8 w - - 0 1'), 'b').ganador === '', 'Tiempo con rey y alfil: tablas');
ok(A.fen(A.nuevo()) === A.INICIAL, 'FEN de ida y vuelta');
const p = A.pgn(A.partida(['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4', 'g8f6', 'f3g5', 'f6e4', 'c4f7']), { Result: '1-0' });
ok(p.endsWith('\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 Nxe4 5. Bxf7+ 1-0'), 'PGN: ' + p.split('\n').pop());

console.log(fallas ? `\n${fallas} prueba(s) fallaron` : '\nTodo bien');
process.exit(fallas ? 1 : 0);
