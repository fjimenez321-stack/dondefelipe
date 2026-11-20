// ═══════════════════════════════════════════════════════════════
// GUARDADO LOCAL (localStorage). Más adelante se puede cambiar por
// Firestore sin tocar el resto: basta con reemplazar estas 3 funciones.
// ═══════════════════════════════════════════════════════════════
const CLAVE = 'sarpg_partida_v1';

export function guardarPartida(juego) {
  const j = juego.jugador;
  const puertas = {};
  for (const [id, m] of juego.mapas) {
    const ab = [...m.puertas.values()].filter((p) => p.abierta && !p.autoCerrar).map((p) => [p.x, p.y]);
    const desbloq = [...m.puertas.values()].filter((p) => p._desbloqueada).map((p) => [p.x, p.y]);
    if (ab.length || desbloq.length) puertas[id] = { ab, desbloq };
  }
  const datos = {
    version: 1,
    fecha: new Date().toISOString(),
    mapa: juego.mapa.id, x: j.x, y: j.y, dir: j.dir,
    minutos: juego.reloj.minutos,
    estado: juego.estado,
    puertas,
  };
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); return true; } catch { return false; }
}

export function leerPartida() {
  try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch { return null; }
}

export function borrarPartida() { try { localStorage.removeItem(CLAVE); } catch {} }
