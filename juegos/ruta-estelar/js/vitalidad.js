/* =====================================================================
   RUTA ESTELAR · VITALIDAD (la cuarta variable)
   ---------------------------------------------------------------------
   El astronauta tiene 5 sistemas, de 0 a 100. Si uno llega a 0, la misión
   se interrumpe. Todos avanzan en TIEMPO PROPIO (dτ), no en el de la misión:
   cuanto más profundo el pozo de gravedad, más lento envejece el cuerpo.

   Cardiovascular  pulso (lpm) según esfuerzo y gravedad; si pasa de 140 se daña.
   Nervioso        golpes y radiación lo dañan; bajo, el mundo se ve borroso y se mueve.
   Respiratorio    sin aire respirable se gasta el tanque de O₂, más rápido con esfuerzo.
   Digestivo       energía de los alimentos; con poca, el astronauta se mueve más lento.
   Musculoesquel.  caídas fuertes (v de impacto > v segura) y la falta de gravedad lo dañan.
   ===================================================================== */

export const SISTEMAS = [
  { id: 'cardio',  nombre: 'Cardiovascular',     icono: '❤️', color: '#ff4d6d' },
  { id: 'nervio',  nombre: 'Nervioso',           icono: '🧠', color: '#c77dff' },
  { id: 'resp',    nombre: 'Respiratorio',       icono: '🫁', color: '#4cc9f0' },
  { id: 'dige',    nombre: 'Digestivo',          icono: '🍎', color: '#ffb703' },
  { id: 'musc',    nombre: 'Musculoesquelético', icono: '🦴', color: '#e9edf5' }
];

/* Por qué falla cada sistema (para la pantalla de fallo). */
export const CAUSAS = {
  cardio: 'Tu corazón no aguantó: estuviste demasiado tiempo con el pulso sobre 140. Caminar (sin correr) lo deja recuperarse.',
  nervio: 'Tu sistema nervioso colapsó por los golpes y la radiación. Sin atmósfera ni campo magnético, la radiación del Sol llega directo.',
  resp:   'Se acabó el oxígeno del tanque. Sin atmósfera respirable, cada esfuerzo gasta más O₂: busca tanques 🟦.',
  dige:   'Te quedaste sin energía. El cuerpo saca energía de los alimentos que digiere: recoge raciones 🍎.',
  musc:   'Tus huesos y músculos no resistieron las caídas. Con más gravedad, caer de la misma altura golpea más fuerte (v = √2gh).'
};

export function nuevoCuerpo() {
  return { cardio: 100, nervio: 100, resp: 100, dige: 100, musc: 100, bpm: 70, tau: 0, caida: null, avisos: {} };
}

const lim = v => Math.max(0, Math.min(100, v));

/* Un paso de simulación.
   dt: segundos de misión · ent: entorno() · esf: 0 quieto, 1 caminar, 2,5 correr. */
export function pasoCuerpo(cu, dt, ent, esf) {
  const dtau = dt * ent.T.factor;          // el cuerpo vive en tiempo propio
  cu.tau += dtau;
  const V = ent.V;

  // ❤️ Pulso: en reposo ~62 lpm; el esfuerzo y la gravedad lo suben. Con poca energía, el corazón compensa.
  const objetivo = 62 * (0.8 + 0.2 * V.cargaCardio) + esf * 35 * (0.55 + 0.45 * V.cargaCardio) + (cu.dige < 25 ? 15 : 0);
  cu.bpm += (objetivo - cu.bpm) * Math.min(1, dtau / 2.5);
  if (cu.bpm > 140) cu.cardio -= (cu.bpm - 140) * 0.045 * dtau;
  else cu.cardio += 1.2 * dtau;

  // 🫁 Respiración
  if (V.aireLibre) cu.resp += 6 * dtau;
  else cu.resp -= (0.32 + 0.22 * esf) * dtau / V.tanque;

  // 🍎 Digestión: gasto basal + esfuerzo
  cu.dige -= (0.09 + 0.07 * esf) * dtau;

  // 🦴 Sin carga de gravedad, músculos y huesos se debilitan (como en la Estación Espacial)
  cu.musc -= V.atrofia * 0.06 * dtau;

  // 🧠 Radiación: depende del escudo natural del lugar. En la Tierra se recupera.
  if (V.radiacion > 0) cu.nervio -= V.radiacion * 0.045 * dtau;
  else cu.nervio += 0.4 * dtau;

  for (const s of SISTEMAS) cu[s.id] = lim(cu[s.id]);
  return dtau;
}

/* Golpe por caída: v = velocidad vertical al tocar el suelo. Devuelve el daño (0 si nada). */
export function impactoCaida(cu, ent, v) {
  const exceso = v - ent.G.vSegura;
  if (exceso <= 0) return 0;
  const d = exceso * 9;
  cu.musc = lim(cu.musc - d);
  cu.nervio = lim(cu.nervio - exceso * 2.5);
  return d;
}

/* Golpe de un peligro (auto, dron, roca, remolino…). */
export function golpe(cu, fuerza = 1) {
  cu.musc = lim(cu.musc - 10 * fuerza);
  cu.nervio = lim(cu.nervio - 14 * fuerza);
  cu.bpm += 18 * fuerza;
}

/* Objetos que restauran sistemas. */
export const CONSUMIBLES = {
  racion:    { nombre: 'Ración',            efecto: { dige: 35 } },
  oxigeno:   { nombre: 'Tanque de O₂',       efecto: { resp: 40 } },
  botiquin:  { nombre: 'Botiquín',          efecto: { musc: 25, nervio: 25, cardio: 15 } }
};
export function consumir(cu, tipo) {
  const e = CONSUMIBLES[tipo].efecto;
  for (const k in e) cu[k] = lim(cu[k] + e[k]);
}

/* El primer sistema en cero (o null). */
export const sistemaCaido = cu => SISTEMAS.find(s => cu[s.id] <= 0)?.id || null;

/* Velocidad efectiva: con poca energía o músculos débiles, el astronauta es más lento. */
export function factorMovimiento(cu) {
  let f = 1;
  if (cu.dige < 25) f *= 0.75;
  if (cu.musc < 30) f *= 0.85;
  return f;
}
