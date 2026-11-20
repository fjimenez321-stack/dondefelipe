// ═══════════════════════════════════════════════════════════════
// ZONAS ACTIVAS
// Rectángulos del mapa que reaccionan al jugador o generan vida:
//
// { id:'recreo', x, y, w, h,
//   alEntrar(juego, zona), alSalir(juego, zona), alPisar(juego, zona),
//   mensaje: 'Texto que aparece al entrar (una vez por visita)',
//   encuentros: { prob:0.12, pool:'pasillo', minPasos:3, horas:[8,18] },
//   aparicion:  { roles:['alumno'], max:3, cadaSeg:6, prob:0.7,
//                 horas:[8,18], vida:[40,90], ia:{tipo:'deambular', radio:2} } }
//
// `encuentros` NO hace combate: solo emite el evento 'encuentro'.
// El sistema de combate (cuando se porte) se suscribe a ese evento.
// `aparicion` hace aparecer personajes de la comunidad (datos/comunidad.js).
// ═══════════════════════════════════════════════════════════════
import { NPC } from './entidades.js';

/** Al llegar el jugador a una casilla. */
export function zonasAlPisar(juego) {
  const j = juego.jugador, mapa = juego.mapa;
  const ahora = new Set(mapa.zonasEn(j.x, j.y));
  const antes = juego._zonasActivas || new Set();

  for (const z of antes) if (!ahora.has(z)) { z.alSalir?.(juego, z); juego.eventos.emit('zona:salir', { zona: z, mapa }); }
  for (const z of ahora) if (!antes.has(z)) {
    z._pasos = 0;
    if (z.mensaje) juego.aviso(z.mensaje);
    z.alEntrar?.(juego, z);
    juego.eventos.emit('zona:entrar', { zona: z, mapa });
  }
  juego._zonasActivas = ahora;

  for (const z of ahora) {
    z._pasos = (z._pasos || 0) + 1;
    z.alPisar?.(juego, z);
    const e = z.encuentros;
    if (e && z._pasos >= (e.minPasos ?? 3) && (!e.horas || juego.reloj.enRango(e.horas)) && Math.random() < e.prob) {
      z._pasos = 0;
      juego.eventos.emit('encuentro', { zona: z, pool: e.pool, mapa });
      return true; // un encuentro corta el resto de la lógica del paso
    }
  }
  return false;
}

/** Cada frame: hace aparecer y desaparecer personajes de la comunidad. */
export function actualizarApariciones(juego, dt, inicial = false) {
  for (const z of juego.mapa.zonas) {
    const a = z.aparicion;
    if (!a) continue;
    const propios = juego.entidades.filter((e) => e.zonaOrigen === z);

    // Despedir a los que cumplieron su tiempo
    for (const e of propios) {
      if (e.ocupado) continue;
      e.vida -= dt;
      if (e.vida <= 0) {
        e.alfa -= dt * 1.5;
        if (e.alfa <= 0) juego.quitarEntidad(e);
      } else if (e.alfa < 1) e.alfa = Math.min(1, e.alfa + dt * 2);
    }
    if (a.horas && !juego.reloj.enRango(a.horas)) continue;

    z._cd = (z._cd ?? 0) - dt;
    const vivos = propios.filter((e) => e.vida > 0).length;
    const intentos = inicial ? Math.ceil((a.max || 3) * 0.6) : 1;
    for (let i = 0; i < intentos; i++) {
      if (!inicial && z._cd > 0) break;
      z._cd = a.cadaSeg ?? 8;
      if (vivos + i >= (a.max ?? 3) || (!inicial && Math.random() > (a.prob ?? 0.7))) continue;
      aparecerEnZona(juego, z, inicial);
    }
  }
}

function aparecerEnZona(juego, z, inicial) {
  const a = z.aparicion, j = juego.jugador;
  const presentes = new Set(juego.entidades.map((e) => e.def?.id));
  const roles = a.roles;
  const candidatos = juego.comunidad.filter((c) => (!roles || roles.includes(c.rol)) && !presentes.has(c.id) && (!c.si || c.si(juego)));
  if (!candidatos.length) return null;
  const pj = candidatos[Math.floor(Math.random() * candidatos.length)];

  // Casilla libre dentro de la zona, no pegada al jugador
  const libres = [];
  for (let y = z.y; y < z.y + z.h; y++) for (let x = z.x; x < z.x + z.w; x++) {
    if (juego.obstaculo(x, y, null) || juego.mapa.portalEn(x, y) || juego.mapa.puertaEn(x, y)) continue;
    if (Math.abs(x - j.x) + Math.abs(y - j.y) < 3) continue;
    libres.push([x, y]);
  }
  if (!libres.length) return null;
  const [x, y] = libres[Math.floor(Math.random() * libres.length)];
  const [vmin, vmax] = a.vida || [45, 90];
  const npc = new NPC({
    ...pj,
    uid: `${pj.id}_${Math.random().toString(36).slice(2, 6)}`,
    ia: pj.ia || a.ia || { tipo: 'deambular', radio: 2 },
    saludo: pj.saludo ?? { radio: 2, cada: 18 },
    mirar: pj.mirar ?? 2,
    temporal: true,
  }, x, y);
  npc.vida = vmin + Math.random() * (vmax - vmin);
  npc.alfa = inicial ? 1 : 0.01;
  npc.zonaOrigen = z;
  juego.agregarEntidad(npc);
  juego.eventos.emit('npc:aparece', { npc, zona: z });
  return npc;
}
