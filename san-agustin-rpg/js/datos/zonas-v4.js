// ═══════════════════════════════════════════════════════════════
// ZONAS ACTIVAS sobre los mapas del v4
// Hacen aparecer personajes de la comunidad (datos/comunidad.js) que
// caminan con IA por el piso libre ('.') sin tapar salidas ni NPC del v4.
// Formato: igual que `zonas` en cualquier mapa (ver README).
// ═══════════════════════════════════════════════════════════════
const todo = (mapa, ancho, alto, aparicion) => [{ id: `vida_${mapa}`, x: 1, y: 1, w: ancho - 2, h: alto - 2, aparicion }];
const alumnos = (max, extra = {}) => ({ roles: ['alumno'], max, cadaSeg: 7, prob: 0.6, horas: [8, 18], vida: [35, 80], ...extra });

export const zonasV4 = {
  pasillo: { zonas: todo('pasillo', 40, 16, { roles: ['alumno', 'funcionario'], max: 4, cadaSeg: 6, prob: 0.6, horas: [8, 18], vida: [30, 70] }) },
  segundo_piso: { zonas: todo('segundo_piso', 28, 7, alumnos(3)) },
  sala_5to: { zonas: todo('sala_5to', 22, 10, alumnos(4, { ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] } })) },
  sala_6to: { zonas: todo('sala_6to', 22, 10, alumnos(4, { ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] } })) },
  sala_7mo: { zonas: todo('sala_7mo', 22, 10, alumnos(4, { ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] } })) },
  sala_8vo: { zonas: todo('sala_8vo', 22, 10, alumnos(4, { ia: { tipo: 'deambular', radio: 2, pausa: [2, 5] } })) },
  jardin_eden: { zonas: todo('jardin_eden', 22, 13, { roles: ['alumno', 'apoderado'], max: 3, cadaSeg: 8, prob: 0.5, horas: [7, 19], vida: [40, 90] }) },
  plaza: { zonas: todo('plaza', 40, 15, { roles: ['alumno', 'apoderado', 'funcionario'], max: 5, cadaSeg: 6, prob: 0.6, horas: [7, 21], vida: [40, 90] }) },
  centro_villa: { zonas: todo('centro_villa', 30, 12, { roles: ['apoderado', 'alumno', 'funcionario'], max: 4, cadaSeg: 6, prob: 0.6, horas: [7, 21], vida: [40, 90] }) },
  sector_norte: { zonas: todo('sector_norte', 30, 16, { roles: ['apoderado', 'alumno'], max: 3, cadaSeg: 8, prob: 0.5, horas: [7, 20], vida: [40, 90] }) },
  biblioteca: { zonas: todo('biblioteca', 20, 10, alumnos(2, { ia: { tipo: 'deambular', radio: 2, pausa: [3, 6] } })) },
  buinzoo: { zonas: todo('buinzoo', 22, 20, { roles: ['apoderado', 'alumno'], max: 3, cadaSeg: 8, prob: 0.5, horas: [9, 18], vida: [40, 90] }) },
};
