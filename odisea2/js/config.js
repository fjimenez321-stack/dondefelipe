/* ============================================================
   ODISEA 3D · config.js
   Todos los números ajustables del juego en un solo lugar.
   Unidades del juego: 1 unidad = 100 m (solo para mostrar altitud).
   ============================================================ */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};
  OC3.Config = {
    escala: {
      mPorUnidad: 100,     // 1 unidad de mundo = 100 m (altitud en km = y * 0.1)
      gJuego: 1.25         // u/s² de juego por cada m/s² real de gravedad
    },
    atm: {
      rhoRef: 1.225,       // densidad de referencia (Tierra, nivel del mar) kg/m³
      arrastre: 0.025      // aceleración de frenado = arrastre · (ρ/ρref) · |v| · v
    },
    nave: {
      radio: 1.7,
      escudoMax: 100, combustibleMax: 100,
      vCrucero: 62,        // velocidad hacia adelante con el motor al ritmo normal
      govAdelante: 0.9,    // qué tan rápido la nave recupera su velocidad de crucero
      accLateral: 72,      // aceleración por el mando (u/s²)
      accVertical: 70,
      estabilizador: 1.6,  // amortiguación inercial propia de la nave (1/s)
      asistenciaGrav: 0.6, // fracción de la gravedad que el motor compensa solo
      xMax: 38, yMax: 120, yMin: 0,
      consumo: { base: 0.9, mando: 1.4 }, sinCombustible: 0.3,
      fuego: { cadencia: 0.16, velocidad: 240, alcance: 420 }
    },
    mundo: {
      distanciaNivel: 8000,   // unidades que dura el tramo (~2 min a vCrucero)
      aparece: 260,           // a qué distancia delante aparecen los objetos
      atras: 40               // cuánto detrás se eliminan
    },
    meteoros: {
      intervalo: [1.7, 0.55], // segundos entre meteoroides: [inicio, final del tramo]
      escala: [1.2, 5.0],
      apuntados: 0.4,         // fracción lanzada hacia la posición actual de la nave
      dañoBase: 12, dañoPorTam: 6,
      puntosPorTam: 10
    },
    bonus: {
      intervalo: [10, 18],
      radio: 3.0,
      combustible: 35, herramientas: 30
    },
    /* Jefe del tramo: el Profesor Alex. Respira → es vulnerable · Habla → lanza rayos y es invulnerable */
    jefe: {
      activo: true, nombre: 'Profesor Alex', hp: 30, radio: 11,
      distEntrada: 320, dist: 115, entra: 2.6,
      respira: 3.8, aviso: 0.9, habla: 3.4,   // duración de cada fase (s); se acortan con poca vida
      cadencia: 0.42, velRayo: 72, dañoRayo: 14, puntos: 1500,
      frases: [
        'Me gustan las cuecas',
        'Recuerda tu disertación de tu grupo',
        '¡Apréndete el himno del colegio!',
        '¡Afina esa voz!',
        '¿Ya practicaste la flauta?',
        'Un, dos, tres… ¡a tempo!',
        'La música también es ciencia',
        'Silencio… ¡empieza el ensayo!',
        'Sin ritmo no hay disertación'
      ],
      fijas: 3    // las primeras 3 frases salen en orden; el resto, al azar
    },
    suelo: { daño: 30, rebote: 18 }
  };
})(typeof window !== 'undefined' ? window : globalThis);
