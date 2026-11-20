// ═══════════════════════════════════════════════════════════════
// NPC DEL v4 QUE AHORA CAMINAN
// En el v4 cada personaje era una LETRA fija en la grilla. Aquí se
// "levanta": la casilla pasa a ser piso y en su lugar aparece una
// entidad del motor, con sprite propio e IA. Lo que dice y hace sigue
// siendo exactamente lo del v4 (NPC_ACT[letra]).
//
// Campos:
//   mapa, x, y, letra   dónde estaba en el v4 (se verifica al cargar)
//   piso                carácter que queda en su lugar (por defecto '.')
//   pisa                caracteres por los que puede caminar (por defecto '.')
//   nombre, emoji, apariencia, ia, mirar, saludo, velocidad   → ver README
//
// Para que otro NPC camine: agregar una entrada. Para devolverlo a como
// era en el v4: borrar su entrada.
// ═══════════════════════════════════════════════════════════════

const piel = { clara: '#f1c9a5', media: '#e0b48a', morena: '#c99668', oscura: '#a8754c' };

export const npcV4 = [
  // ── PASILLO ──────────────────────────────────────────────────
  { mapa: 'pasillo', x: 8, y: 1, letra: 'I', nombre: 'Inspector', emoji: '👮',
    apariencia: { piel: piel.morena, pelo: '#2b2b2b', peinado: 'corto', ropa: '#0f172a', pantalon: '#111827', lentes: true },
    ia: { tipo: 'patrulla', ruta: [[8, 2], [30, 2], [30, 12], [8, 12]], pausa: [0.8, 2] }, velocidad: 2.2,
    saludo: { radio: 2, cada: 14, frases: ['¡Sin correr por el pasillo!', 'Buenos días, profe.', '¿Y la credencial?'] } },

  { mapa: 'pasillo', x: 15, y: 1, letra: 'J', nombre: 'José', emoji: '👦',
    apariencia: { piel: piel.morena, pelo: '#1c1310', peinado: 'corto', ropa: '#1e3a8a', mochila: '#dc2626' },
    ia: { tipo: 'deambular', radio: 3 }, mirar: 2,
    saludo: { radio: 2, cada: 16, frases: ['¡Profe!', '¿Pondrá prueba?'] } },

  { mapa: 'pasillo', x: 31, y: 1, letra: '7', nombre: 'Tía Claudita', emoji: '🧠',
    apariencia: { piel: piel.clara, pelo: '#1c1310', peinado: 'moño', ropa: '#7b3245', falda: true, lentes: true },
    ia: { tipo: 'deambular', radio: 1, pausa: [3, 7] }, mirar: 3 },

  { mapa: 'pasillo', x: 7, y: 4, letra: '5', nombre: 'Valeria', emoji: '👩‍⚕️',
    apariencia: { piel: piel.clara, pelo: '#d6b36a', peinado: 'largo', ropa: '#7c3aed', falda: true },
    ia: { tipo: 'deambular', radio: 1, pausa: [4, 8] }, mirar: 3,
    saludo: { radio: 2, cada: 25, frases: ['Recuerda respirar 💜', '¿Cómo estás hoy, profe?'] } },

  { mapa: 'pasillo', x: 18, y: 5, letra: 'r', nombre: 'Tío Antonio', emoji: '🪖',
    apariencia: { piel: piel.oscura, pelo: '#9ca3af', peinado: 'corto', ropa: '#3f6212', pantalon: '#365314' },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 2 },

  { mapa: 'pasillo', x: 18, y: 6, letra: '$', nombre: 'Jorge', emoji: '👴',
    apariencia: { piel: piel.media, pelo: '#e5e7eb', peinado: 'calvo', ropa: '#1d4ed8', pantalon: '#1d4ed8' },
    ia: { tipo: 'deambular', radio: 4, pausa: [1.5, 4] }, velocidad: 1.8, mirar: 2,
    saludo: { radio: 2, cada: 20, frases: ['Cuidado, que acabo de trapear.', 'Buenas, profe.'] } },

  // ── SALAS (segundo piso) ─────────────────────────────────────
  { mapa: 'sala_5to', x: 3, y: 4, letra: '!', nombre: 'Prof. Jorge', emoji: '👨‍🏫',
    apariencia: { piel: piel.media, pelo: '#3b2416', peinado: 'corto', ropa: '#92400e', lentes: true },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 3 },
  { mapa: 'sala_6to', x: 3, y: 4, letra: '~', nombre: 'Profe Felipe', emoji: '👨‍🏫',
    apariencia: { piel: piel.morena, pelo: '#1c1310', peinado: 'corto', ropa: '#7b3245', lentes: true },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 3 },
  { mapa: 'sala_7mo', x: 3, y: 4, letra: '?', nombre: 'Prof. José', emoji: '👨‍🏫',
    apariencia: { piel: piel.clara, pelo: '#6b3f1f', peinado: 'corto', ropa: '#166534' },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 3 },
  { mapa: 'sala_8vo', x: 3, y: 4, letra: 'L', nombre: 'Prof. Camila', emoji: '👩‍🏫',
    apariencia: { piel: piel.media, pelo: '#3b2416', peinado: 'cola', ropa: '#0e7490', falda: true },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 3 },

  // ── CANCHA (piso 'v') ────────────────────────────────────────
  { mapa: 'cancha', x: 2, y: 3, letra: 'G', piso: 'v', pisa: 'v', nombre: 'Profe Gonzalo', emoji: '🏃',
    apariencia: { piel: piel.oscura, pelo: '#1c1310', peinado: 'corto', ropa: '#dc2626', pantalon: '#1e3a8a' },
    ia: { tipo: 'patrulla', ruta: [[2, 2], [2, 7], [16, 8], [17, 1], [3, 1]], pausa: [0.2, 0.6] }, velocidad: 3.5,
    saludo: { radio: 2, cada: 12, frases: ['¡Una vuelta más!', '¡Vamos, profe, a trotar!'] } },
  { mapa: 'cancha', x: 17, y: 6, letra: 'U', piso: 'v', pisa: 'v', nombre: 'Juan', emoji: '⚽',
    apariencia: { piel: piel.media, pelo: '#3b2416', peinado: 'corto', ropa: '#0284c7', mochila: '#16a34a' },
    ia: { tipo: 'deambular', radio: 2, pausa: [0.6, 2] }, velocidad: 3.2, mirar: 2,
    saludo: { radio: 2, cada: 15, frases: ['¡El partido empieza pronto!', '¡Profe, juegue con nosotros!'] } },

  // ── SALA DE CONTENCIÓN (piso 'a') ────────────────────────────
  { mapa: 'sala_cont', x: 2, y: 3, letra: 'X', piso: 'a', pisa: 'a', nombre: 'Constanza', emoji: '👩‍⚕️',
    apariencia: { piel: piel.clara, pelo: '#6b3f1f', peinado: 'largo', ropa: '#c084fc', falda: true },
    ia: { tipo: 'deambular', radio: 1, pausa: [4, 8] }, mirar: 3 },
  { mapa: 'sala_cont', x: 6, y: 3, letra: 'P', piso: 'a', pisa: 'a', nombre: 'Paula', emoji: '🧘‍♀️',
    apariencia: { piel: piel.media, pelo: '#1c1310', peinado: 'moño', ropa: '#f472b6', falda: true },
    ia: { tipo: 'quieto' }, mirar: 3 },

  // ── SECRETARÍA Y BIOLOGÍA ────────────────────────────────────
  { mapa: 'secretaria', x: 3, y: 6, letra: 'f', nombre: 'Francisco', emoji: '🧑‍💼',
    apariencia: { piel: piel.media, pelo: '#2b2b2b', peinado: 'corto', ropa: '#334155', lentes: true },
    ia: { tipo: 'deambular', radio: 2, pausa: [3, 6] }, mirar: 3 },
  { mapa: 'biologia', x: 6, y: 7, letra: 'Y', nombre: 'Yael', emoji: '👩‍🔬',
    apariencia: { piel: piel.clara, pelo: '#a0642c', peinado: 'cola', ropa: '#f8fafc', pantalon: '#1e3a8a', lentes: true },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 3 },

  // ── RESERVA (piso '.' y pasto 'g') ───────────────────────────
  { mapa: 'reserva', x: 15, y: 24, letra: 'G', pisa: '.g', nombre: 'Guardabosques Martínez', emoji: '🌲',
    apariencia: { piel: piel.morena, pelo: '#3b2416', peinado: 'corto', ropa: '#3f6212', pantalon: '#78350f', gorro: '#365314' },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 3 },
  { mapa: 'reserva', x: 253, y: 24, letra: 'u', pisa: '.g', nombre: 'Guardabosques Rojas', emoji: '🦅',
    apariencia: { piel: piel.oscura, pelo: '#1c1310', peinado: 'corto', ropa: '#3f6212', pantalon: '#78350f', gorro: '#365314' },
    ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] }, mirar: 3 },
];
