// ═══════════════════════════════════════════════════════════════
// PERSONAJES DE LA COMUNIDAD
// Aparecen solos en las ZONAS ACTIVAS que tengan `aparicion`.
// Cualquiera puede aportar uno: basta con agregar una entrada.
//
//   { id, nombre, rol:'alumno'|'funcionario'|'apoderado', curso?,
//     emoji, apariencia:{...}, frases:[...], dialogo?, ia? }
//
// ⚠️ Nombres inventados. Si se usan estudiantes reales, que sea con
//    su permiso (y el de su apoderado) y sin apellidos.
// ═══════════════════════════════════════════════════════════════

export const comunidad = [
  { id: 'martina', nombre: 'Martina', rol: 'alumno', curso: '6°B', emoji: '📚',
    apariencia: { piel: '#f1c9a5', pelo: '#6b3f1f', peinado: 'largo', ropa: '#1e3a8a', falda: true, mochila: '#f59e0b' },
    frases: ['Profe, ¿las células tienen sentimientos?', '¡Me saqué un 7 en la prueba!', 'Mañana traigo la maqueta, se lo juro.'] },
  { id: 'benjamin', nombre: 'Benjamín', rol: 'alumno', curso: '7°A', emoji: '⚽',
    apariencia: { piel: '#c99668', pelo: '#1c1310', peinado: 'corto', ropa: '#1e3a8a', mochila: '#16a34a' },
    frases: ['¿Viene a ver la Copa San Agustín?', '¡Ganamos 3 a 1 en el recreo!', 'Profe, ¿por qué la pelota cae?'] },
  { id: 'agustina', nombre: 'Agustina', rol: 'alumno', curso: '5°A', emoji: '🎨',
    apariencia: { piel: '#e0b48a', pelo: '#a0642c', peinado: 'cola', ropa: '#1e3a8a', falda: true, mochila: '#ec4899' },
    frases: ['Dibujé un ecosistema entero.', '¿Los pingüinos tienen rodillas?', '¡Hola, profe Felipe!'] },
  { id: 'tomas', nombre: 'Tomás', rol: 'alumno', curso: '8°B', emoji: '🎮',
    apariencia: { piel: '#a8754c', pelo: '#3b2416', peinado: 'corto', ropa: '#334155', lentes: true, mochila: '#0ea5e9' },
    frases: ['¿Cuándo sale el juego de pelea, profe?', 'Hice un mod para el Minecraft del colegio.', 'La física de los videojuegos es real, ¿cierto?'] },
  { id: 'florencia', nombre: 'Florencia', rol: 'alumno', curso: '1°M', emoji: '🔬',
    apariencia: { piel: '#f1c9a5', pelo: '#1c1310', peinado: 'moño', ropa: '#1e3a8a', falda: true, lentes: true },
    frases: ['¿El ADN se puede ver a simple vista?', 'Quiero estudiar biología marina.', '¿Hay ensayo PAES esta semana?'] },
  { id: 'vicente', nombre: 'Vicente', rol: 'alumno', curso: '4°M', emoji: '🎓',
    apariencia: { piel: '#c99668', pelo: '#2b2b2b', peinado: 'corto', ropa: '#1e3a8a' },
    frases: ['Profe, me falta poco para egresar...', 'Gracias por la ayuda con el proyecto.', '¿Me firma la autorización?'] },
  { id: 'don_luis', nombre: 'Don Luis', rol: 'funcionario', emoji: '🧹',
    apariencia: { piel: '#a8754c', pelo: '#9ca3af', peinado: 'corto', ropa: '#0f766e', pantalon: '#1f2937' },
    frases: ['Cuidado, el piso está mojado.', 'Buenos días, profesor.', 'Este colegio lo mantenemos entre todos.'] },
  { id: 'sra_patricia', nombre: 'Sra. Patricia', rol: 'apoderado', emoji: '👩',
    apariencia: { piel: '#e0b48a', pelo: '#3b2416', peinado: 'largo', ropa: '#9333ea', falda: true },
    frases: ['Profe, ¿podemos agendar una entrevista?', 'Mi hijo habla mucho de sus clases.', '¿Dónde queda la secretaría?'] },
];
