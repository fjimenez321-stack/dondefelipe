// ═══════════════════════════════════════════════════════════════
// BÚSQUEDA DE RUTAS (BFS en grilla, 4 direcciones)
// Lo usan: tocar-para-caminar del jugador y la IA de los NPC.
// ═══════════════════════════════════════════════════════════════

export const DIRS = {
  arriba:    { dx: 0, dy: -1 },
  abajo:     { dx: 0, dy: 1 },
  izquierda: { dx: -1, dy: 0 },
  derecha:   { dx: 1, dy: 0 },
};
export const LISTA_DIRS = Object.keys(DIRS);

export function dirEntre(ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'derecha' : dx < 0 ? 'izquierda' : (dy > 0 ? 'abajo' : 'arriba');
  return dy > 0 ? 'abajo' : 'arriba';
}

/**
 * Busca la ruta más corta de (sx,sy) a (tx,ty).
 * @param bloqueado (x,y) => true si no se puede pisar
 * @param opts.adyacente  si true, basta con llegar al lado del objetivo
 *                        (para hablar con un NPC o abrir una puerta)
 * @param opts.max        límite de casillas exploradas
 * @returns array de {x,y} (sin la casilla de inicio) o null
 */
export function buscarRuta(sx, sy, tx, ty, bloqueado, { adyacente = false, max = 4000 } = {}) {
  const esMeta = adyacente
    ? (x, y) => Math.abs(x - tx) + Math.abs(y - ty) === 1
    : (x, y) => x === tx && y === ty;
  if (esMeta(sx, sy)) return [];

  const clave = (x, y) => (y << 16) | (x & 0xffff);
  const previo = new Map([[clave(sx, sy), null]]);
  const cola = [[sx, sy]];
  let i = 0;

  while (i < cola.length && previo.size < max) {
    const [x, y] = cola[i++];
    for (const d of LISTA_DIRS) {
      const nx = x + DIRS[d].dx, ny = y + DIRS[d].dy, k = clave(nx, ny);
      if (previo.has(k)) continue;
      if (bloqueado(nx, ny)) continue;
      const meta = esMeta(nx, ny);
      previo.set(k, [x, y]);
      if (meta) {
        const ruta = [];
        let p = [nx, ny];
        while (p && !(p[0] === sx && p[1] === sy)) { ruta.push({ x: p[0], y: p[1] }); p = previo.get(clave(p[0], p[1])); }
        return ruta.reverse();
      }
      cola.push([nx, ny]);
    }
  }
  return null;
}
