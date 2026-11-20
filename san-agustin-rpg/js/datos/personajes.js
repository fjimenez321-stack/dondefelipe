// ═══════════════════════════════════════════════════════════════
// PERSONAJES FIJOS (catálogo). El mapa decide DÓNDE aparecen;
// aquí se define QUIÉNES son, cómo se ven, cómo piensan y qué dicen.
//
// Campos:
//   nombre, emoji, sprite ('persona' | 'gato')
//   apariencia  { piel, pelo, peinado, ropa, pantalon, falda, lentes, mochila }
//   ia          { tipo:'quieto'|'deambular'|'patrulla'|'seguir'|'horario', ... }
//   mirar       radio en que gira para mirar al profe
//   saludo      { radio, cada, frases } → burbuja espontánea al pasar cerca
//   frases      rotan cada vez que hablas (si no hay `dialogo`)
//   dialogo     texto | lista | árbol | función (juego, npc) => guion
//               (la función puede ser async: ahí se conectaría un LLM)
//   personalidad  texto libre para un futuro cerebro conversacional
// ═══════════════════════════════════════════════════════════════

export const personajes = {
  inspector: {
    nombre: 'Inspector', emoji: '👮',
    apariencia: { piel: '#c99668', pelo: '#2b2b2b', peinado: 'corto', ropa: '#0f172a', pantalon: '#111827', lentes: true },
    velocidad: 2.2,
    saludo: { radio: 2, cada: 14, frases: ['¡Sin correr por el pasillo!', 'Buenos días, profe.', '¿Y su credencial?'] },
    personalidad: 'Inspector estricto pero afectuoso. Cree que el orden es la base del aprendizaje.',
    dialogo: (j) => {
      if (!j.flag('llave_bodega')) return {
        inicio: 'a',
        nodos: {
          a: { texto: '"¡Oye! ¿A dónde vas con tanta prisa?\nEste establecimiento tiene normas."',
            opciones: [
              { texto: 'Necesito material de la bodega.', ir: 'b' },
              { texto: 'Solo estoy de paso.', ir: 'c' },
            ] },
          b: { texto: '"¿De la bodega? Mmm... está bien.\nPero me la devuelve, ¿ah?"', ir: 'd' },
          c: { texto: '"El orden no es rigidez.\nEs el primer paso hacia la creatividad."' },
          d: { texto: '🔑 Recibiste la LLAVE DE LA BODEGA.', quien: '', retrato: '🔑',
            accion: (j) => { j.flag('llave_bodega', true); j.dar('llave_bodega'); j.aviso('🔑 + Llave de la bodega'); } },
        },
      };
      return null; // usa sus frases en rotación
    },
    frases: [
      'Una clase bien gestionada es tierra fértil\ndonde florece el aprendizaje.',
      'La disciplina con afecto transforma vidas.\n¡Tú lo sabes!',
      '¡Tu constancia inspira a tus alumnos\nmás de lo que imaginas!',
    ],
  },

  kella: {
    nombre: 'Kella', emoji: '🛒',
    apariencia: { piel: '#e0b48a', pelo: '#6b3f1f', peinado: 'cola', ropa: '#be185d', falda: false },
    mirar: 4,
    saludo: { radio: 3, cada: 20, frases: ['¡Sopaipillas calentitas!', '¡Kiosco abierto!'] },
    dialogo: (j) => ({
      inicio: 'a',
      nodos: {
        a: { texto: () => `¡Bienvenido al Kiosco de Kella! 🛒\n¿Qué necesitas, profe?   (tienes 🪙 ${j.monedas()})`,
          opciones: [
            { texto: 'Caramelo — 3 🪙', ir: 'comprar' },
            { texto: 'Café — 5 🪙', ir: 'cafe' },
            { texto: 'Nada, gracias.', ir: 'chao' },
          ] },
        comprar: { texto: () => (j.monedas() >= 3 ? '¡Excelente elección! 🍬' : 'Uy, no te alcanza, profe.'),
          accion: (j) => { if (j.monedas() >= 3) { j.monedas(-3); j.dar('caramelo'); j.aviso('🍬 + Caramelo'); } } },
        cafe: { texto: () => (j.monedas() >= 5 ? '¡Un cafecito para aguantar la jornada! ☕' : 'Te faltan monedas para el café.'),
          accion: (j) => { if (j.monedas() >= 5) { j.monedas(-5); j.dar('cafe'); j.aviso('☕ + Café'); } } },
        chao: { texto: '¡Vuelve pronto, profe!' },
      },
    }),
  },

  valeria: {
    nombre: 'Valeria', emoji: '👩‍⚕️',
    apariencia: { piel: '#f1c9a5', pelo: '#a0642c', peinado: 'largo', ropa: '#0d9488', falda: true },
    mirar: 3,
    frases: [
      'Hola profe Felipe. Si necesitas apoyarte\nemocionalmente, estoy en la sala de al lado.',
      'El autocuidado es parte del trabajo.',
      '¡Tu bienestar importa, profe!',
      'Recuerda respirar.',
    ],
  },

  jose: {
    nombre: 'José', emoji: '👦',
    apariencia: { piel: '#c99668', pelo: '#1c1310', peinado: 'corto', ropa: '#1e3a8a', mochila: '#dc2626' },
    ia: { tipo: 'deambular', radio: 3 },
    mirar: 2,
    saludo: { radio: 2, cada: 16, frases: ['¡Profe!', '¿Pondrá prueba?'] },
    frases: [
      'Profe, el Inspector tiene la llave de la bodega.\nDicen que ahí hay un cofre...',
      '¡Profe, usted es el mejor!',
      '¿Pondrá prueba esta semana?',
      '¡Ya hice la tarea!',
    ],
  },

  sofia: {
    nombre: 'Sofía', emoji: '👧',
    apariencia: { piel: '#e0b48a', pelo: '#3b2416', peinado: 'cola', ropa: '#1e3a8a', falda: true, mochila: '#7c3aed' },
    ia: { tipo: 'deambular', radio: 4, pausa: [0.8, 2.5] },
    mirar: 2,
    frases: ['¡El recreo es lo mejor!', '¿Juega con nosotros?', '¡Sus clases son buenas!'],
  },

  claudita: {
    nombre: 'Claudita', emoji: '🧠',
    apariencia: { piel: '#f1c9a5', pelo: '#1c1310', peinado: 'moño', ropa: '#7b3245', falda: true, lentes: true },
    mirar: 3,
    frases: [
      'El aprendizaje significativo ocurre cuando\nconectas lo nuevo con lo que ya saben.',
      'No evalúes solo el producto.\nEl proceso dice mucho más del alumno.',
      'Un alumno que pregunta es un alumno que piensa.\n¡Celébralo!',
    ],
  },

  gonzalo: {
    nombre: 'Profe Gonzalo', emoji: '🏃',
    apariencia: { piel: '#a8754c', pelo: '#1c1310', peinado: 'corto', ropa: '#dc2626', pantalon: '#1e3a8a' },
    ia: { tipo: 'patrulla', ruta: [[7, 5], [14, 5], [14, 7], [7, 7]], pausa: [0.2, 0.6] },
    velocidad: 3.5,
    saludo: { radio: 2, cada: 12, frases: ['¡Una vuelta más!', '¡Vamos, profe, a trotar!'] },
    frases: [
      'La cancha también es aula.\nAquí aprendemos perseverancia. 🏃',
      '¿Sabías que el ejercicio aumenta la neuroplasticidad?',
      'Un buen profe, como un deportista,\nno se rinde tras el primer error.',
    ],
  },

  mochi: {
    nombre: 'Mochi', emoji: '🐱', sprite: 'gato',
    apariencia: { pelo: '#f59e0b', manchas: '#fef3c7' },
    ia: { tipo: 'deambular', radio: 3, pausa: [0.5, 2] },
    velocidad: 3.5,
    solido: true,
    saludo: { radio: 2, cada: 10, frases: ['miau', 'mrrr...', '¡miau!'] },
    dialogo: (j, npc) => {
      const sigue = j.acompanantes.includes(npc);
      return {
        inicio: 'a',
        nodos: {
          a: { texto: sigue ? 'Mochi ronronea a tu lado. 🐾' : 'Mochi te mira con curiosidad. 🐾',
            opciones: sigue
              ? [{ texto: 'Quédate aquí, Mochi.', accion: (j) => { j.separar(npc); j.aviso('🐱 Mochi se queda'); } },
                 { texto: 'Vamos, sigue conmigo.' }]
              : [{ texto: '¿Vienes conmigo?', accion: (j) => { j.unirse(npc); j.aviso('🐱 ¡Mochi te sigue!'); } },
                 { texto: 'Acariciar y seguir.' }] },
        },
      };
    },
  },
};
