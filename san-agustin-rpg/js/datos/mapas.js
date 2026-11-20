// ═══════════════════════════════════════════════════════════════
// MAPAS — solo datos. Para agregar un lugar: copiar uno, cambiar la
// grilla y declarar portales, puertas, objetos, NPC y zonas.
//
// Leyenda (tileset colegio):
//   .  piso      ,  pasto     p  sendero    f  flores    g  jardinera
//   E  salida    ^  escalera  a  alfombra   D  puerta (se define en `puertas`)
//   #  muro      v  ventana   P  pizarra    h  casillero m  mesa
//   b  estante   B  banca     k  mostrador  T  árbol     Y  arbusto
//   o  roca      w  agua
// Coordenadas: x = columna, y = fila, ambas desde 0 (arriba a la izquierda).
// Tecla F3 (o º) en el juego muestra colisiones, zonas y coordenadas.
// ═══════════════════════════════════════════════════════════════

const jardin = {
  id: 'jardin', nombre: 'Jardín Edén', tileset: 'colegio', fondo: '#14532d',
  grilla: [
    'TTTTTTTTTTTTTTTTTTTTTT',
    'TfY,,,,,,,pp,,,,,,,YfT',
    'T,,,o,,f,,pp,,f,,o,,,T',
    'T,,,,,f,,,pp,,,f,,,,,T',
    'TppppppppppppppppppppT',
    'T,B,,,,,pppppp,,,,,B,T',
    'T,,,,f,,ppwwpp,,f,,,,T',
    'T,B,,,,,pppppp,,,,,B,T',
    'TppppppppppppppppppppT',
    'T,,,f,,,,,pp,,,,,f,,,T',
    'TfY,,,,o,,pp,,o,,,,YfT',
    'TTTTTTTTTTEETTTTTTTTTT',
  ],
  portales: [
    { x: 10, y: 11, w: 2, a: 'pasillo', ax: 18, ay: 1, dir: 'abajo', etiqueta: 'PASILLO', etiquetaAbajo: false },
  ],
  objetos: [
    { x: 9, y: 2, tipo: 'letrero', nombre: 'Letrero', emoji: '🪧',
      texto: 'JARDÍN EDÉN\n\n"Nadie sabe lo que puede un cuerpo."\n— Spinoza\n\n(Prueba el modo diseño con F3)' },
  ],
  npcs: [
    { id: 'gonzalo', x: 7, y: 5 },
    { id: 'mochi', x: 16, y: 9 },
  ],
  zonas: [
    { id: 'patio', x: 1, y: 1, w: 20, h: 10,
      aparicion: { roles: ['alumno', 'apoderado'], max: 4, cadaSeg: 6, prob: 0.6, horas: [7, 19], vida: [40, 90],
        ia: { tipo: 'deambular', radio: 3 } } },
    { id: 'fuente', x: 8, y: 5, w: 6, h: 3, mensaje: '💧 Se escucha el agua de la fuente.' },
  ],
};

const pasillo = {
  id: 'pasillo', nombre: 'Pasillo', tileset: 'colegio', interior: true,
  grilla: [
    '##############P###EE##P#################',
    '#^^..hhhhhh.............hhhhhh....k...b#',
    '#.................................k...b#',
    'v.................................k...bv',
    '#.................................kkkkk#',
    'v.......BB................BB...........#',
    '#......................................v',
    'v...........ggggggggg..................#',
    '#...........ggggggggg..................#',
    'v......................................v',
    '#......................................#',
    'v......................................v',
    '#......................................#',
    '######D#####vv######vv########D###vv####',
  ],
  portales: [
    { x: 18, y: 0, w: 2, a: 'jardin', ax: 10, ay: 10, dir: 'arriba', etiqueta: 'JARDÍN', etiquetaAbajo: true },
    { x: 1, y: 1, w: 2, a: 'segundo_piso', ax: 2, ay: 5, dir: 'derecha', etiqueta: '2° PISO', etiquetaAbajo: true },
    { x: 30, y: 13, a: 'bodega', ax: 4, ay: 1, dir: 'abajo' },
  ],
  puertas: [
    { x: 6, y: 13, etiqueta: 'PROFESORES', color: '#1e3a8a',
      requiere: () => false, bloqueada: '🚪 SALA DE PROFESORES\n\nHay reunión de consejo.\nMejor no interrumpir.' },
    { x: 30, y: 13, etiqueta: 'BODEGA', llave: 'llave_bodega', nombreLlave: 'Llave de la bodega',
      bloqueada: '🔒 BODEGA\n\nEstá cerrada con llave.\nEl Inspector debe tenerla.' },
  ],
  objetos: [
    { x: 14, y: 0, tipo: 'pizarra', nombre: 'Diario mural', emoji: '📌',
      texto: '📌 DIARIO MURAL\n\n• Copa San Agustín: inscripciones abiertas\n• Feria científica: viernes\n• "La ciencia es una forma de mirar."' },
    { x: 22, y: 0, tipo: 'pizarra', nombre: 'Horario', emoji: '🗓️',
      texto: (j) => `🗓️ HORARIO\n\nSon las ${j.reloj.texto}.\n${j.reloj.hora < 13 ? 'Jornada de la mañana.' : j.reloj.hora < 18 ? 'Jornada de la tarde.' : 'El colegio está por cerrar.'}` },
  ],
  npcs: [
    { id: 'inspector', x: 4, y: 4, ia: { tipo: 'patrulla', ruta: [[4, 4], [30, 4], [30, 11], [4, 11]], pausa: [0.6, 1.6] } },
    { id: 'kella', x: 35, y: 2, dir: 'izquierda' },
    { id: 'valeria', x: 7, y: 2 },
    { id: 'jose', x: 16, y: 10 },
    { id: 'sofia', x: 25, y: 9 },
    { id: 'claudita', x: 31, y: 2 },
  ],
  zonas: [
    { id: 'jardineras', x: 12, y: 7, w: 9, h: 2,
      encuentros: { prob: 0.15, pool: 'pasillo', minPasos: 2 } },
    { id: 'recreo', x: 2, y: 9, w: 30, h: 4,
      aparicion: { roles: ['alumno', 'funcionario'], max: 3, cadaSeg: 7, prob: 0.6, horas: [8, 18], vida: [30, 70] } },
    { id: 'kiosco', x: 31, y: 1, w: 3, h: 4, mensaje: '🥟 Huele a sopaipillas...' },
  ],
};

const segundoPiso = {
  id: 'segundo_piso', nombre: 'Segundo Piso', tileset: 'colegio', interior: true,
  grilla: [
    '##v#D##v##D##v##D##v##D##v##',
    '#..........................#',
    '#..........................#',
    '#.......B...........B......#',
    '#..........................#',
    '#^.........................#',
    '######v#####v#####v#####v###',
  ],
  portales: [
    { x: 1, y: 5, a: 'pasillo', ax: 3, ay: 1, dir: 'derecha', etiqueta: 'BAJAR' },
    { x: 10, y: 0, a: 'sala_6to', ax: 10, ay: 8, dir: 'arriba' },
  ],
  puertas: [
    { x: 4, y: 0, etiqueta: '5° BÁSICO', etiquetaAbajo: true, requiere: () => false,
      bloqueada: '🚪 5° BÁSICO\n\nSe escucha a alguien explicando fracciones.\nClase en curso.' },
    { x: 10, y: 0, etiqueta: '6° BÁSICO', etiquetaAbajo: true, color: '#166534', autoCerrar: 3 },
    { x: 16, y: 0, etiqueta: '7° BÁSICO', etiquetaAbajo: true, requiere: (j) => j.reloj.hora >= 13,
      bloqueada: '🚪 7° BÁSICO\n\nEn la mañana tienen prueba.\nSe abre después de las 13:00.' },
    { x: 22, y: 0, etiqueta: '8° BÁSICO', etiquetaAbajo: true, requiere: () => false,
      bloqueada: '🚪 8° BÁSICO\n\nSalieron a laboratorio.' },
  ],
  zonas: [
    { id: 'pasillo2', x: 2, y: 1, w: 24, h: 5,
      aparicion: { roles: ['alumno'], max: 3, cadaSeg: 8, prob: 0.6, horas: [8, 18], vida: [25, 60] } },
  ],
};

const sala6 = {
  id: 'sala_6to', nombre: 'Sala 6° Básico', tileset: 'colegio', interior: true,
  grilla: [
    '#######PPPPPPPP#######',
    '#...................b#',
    '#.........mm........b#',
    'v...................b#',
    '#..mm..mm....mm..mm..#',
    '#....................#',
    'v..mm..mm....mm..mm..#',
    '#........aaaa........#',
    '#....................#',
    '###v######D######v####',
  ],
  portales: [{ x: 10, y: 9, a: 'segundo_piso', ax: 10, ay: 1, dir: 'abajo' }],
  puertas: [{ x: 10, y: 9, color: '#166534', autoCerrar: 3 }],
  objetos: [
    { x: 10, y: 0, tipo: 'pizarra', nombre: 'Pizarra', emoji: '🟩',
      texto: '🟩 PIZARRA\n\nHOY: Ecosistemas de Chile central\n\n1. Productores\n2. Consumidores\n3. Descomponedores\n\n"¿Qué pasaría si desaparecen las abejas?"' },
  ],
  zonas: [
    { id: 'clase', x: 1, y: 3, w: 19, h: 5,
      aparicion: { roles: ['alumno'], max: 5, cadaSeg: 5, prob: 0.8, horas: [8, 17], vida: [60, 120],
        ia: { tipo: 'deambular', radio: 1, pausa: [2, 5] } } },
  ],
};

const bodega = {
  id: 'bodega', nombre: 'Bodega', tileset: 'colegio', interior: true,
  grilla: [
    '####D####',
    '#b.....b#',
    '#.......#',
    '#.......#',
    '#bbbbbbb#',
    '#########',
  ],
  portales: [{ x: 4, y: 0, a: 'pasillo', ax: 30, ay: 12, dir: 'arriba' }],
  puertas: [{ x: 4, y: 0, abierta: true }],
  objetos: [
    { x: 6, y: 2, tipo: 'cofre', nombre: 'Cofre', emoji: '🧰', flag: 'cofre_bodega',
      accion: (j) => {
        if (j.flag('cofre_bodega')) return j.decir('🧰 El cofre está vacío.');
        j.flag('cofre_bodega', true);
        j.monedas(20);
        j.dar('microscopio');
        j.aviso('🪙 +20 · 🔬 Microscopio');
        return j.decir('🧰 ¡Abriste el cofre!\n\n🪙 20 monedas\n🔬 Un microscopio antiguo\n\n(Así se conectan las recompensas: flags + inventario)');
      } },
    { x: 2, y: 2, tipo: 'letrero', nombre: 'Nota', emoji: '📝',
      texto: '📝 "Material de laboratorio.\nNO SACAR sin avisar al Inspector."' },
  ],
};

export const mapas = { jardin, pasillo, segundo_piso: segundoPiso, sala_6to: sala6, bodega };
