/* =====================================================================
   RUTA ESTELAR · MOTOR DE REGLAS
   ---------------------------------------------------------------------
   Un objeto principal (el astronauta) y un entorno con 4 variables:

     G  GRAVEDAD   cambia por planeta. Decide la física del movimiento:
                   velocidad al caminar y correr, altura y largo del salto,
                   y con qué velocidad se llega al suelo al caer.
     T  TIEMPO     se dilata según la gravedad: el reloj del astronauta
                   (tiempo propio) avanza más lento que el de la misión.
                   El cuerpo vive en tiempo propio.
     E  ESPACIO    mundo 3D condicionado por G y T: el horizonte depende del
                   radio del planeta, el relieve posible depende de G, y el
                   rayo de foco llega hasta donde alcanza la vista.
     V  VITALIDAD  los sistemas del cuerpo (cardiovascular, nervioso,
                   respiratorio, digestivo y musculoesquelético). Cada uno
                   responde a G, a T y al esfuerzo. Está en vitalidad.js.

   Todo lo que el juego necesita saber de un lugar sale de entorno(cuerpo).
   Para agregar un planeta basta con sus datos físicos en CUERPOS.
   ===================================================================== */

export const G_TIERRA = 9.81;            // m/s²
const C = 299792458;                     // velocidad de la luz, m/s

/* Datos físicos reales. GM en m³/s², R en m.
   atm: si se puede respirar el aire · claridad: cuánto deja ver el aire (1 = vacío)
   escudo: protección natural contra la radiación (campo magnético + atmósfera, 0 a 1) */
export const CUERPOS = {
  tierra:  { nombre: 'Tierra',  g: 9.81, GM: 3.986e14, R: 6.371e6, atm: true,  claridad: 0.80, escudo: 1.0 },
  luna:    { nombre: 'Luna',    g: 1.62, GM: 4.905e12, R: 1.737e6, atm: false, claridad: 1.00, escudo: 0.0 },
  marte:   { nombre: 'Marte',   g: 3.71, GM: 4.283e13, R: 3.390e6, atm: false, claridad: 0.88, escudo: 0.3 },
  // dentro de la Voyager, en viaje: microgravedad; la nave da aire y blindaje parcial
  espacio: { nombre: 'Espacio', g: 0,    GM: 0,        R: 0,       atm: true,  claridad: 1.00, escudo: 0.6 }
};

/* Constantes del juego (las únicas "perillas"). */
export const JUEGO = {
  G_ESCALA: 60,      // escala de la dilatación del tiempo: el efecto real es diminuto, aquí se exagera para verlo
  ESC_HORIZ: 0.024,  // metros de mundo de juego por metro de horizonte real
  PIERNA: 0.9,       // largo de pierna del astronauta (m), para la ley de la marcha
  FROUDE: 2.2,       // número de Froude de la marcha del juego (en personas reales ≈ 0,5 al pasar de caminar a trotar)
  V_SALTO: 5.0,      // m/s con que despegan las piernas (en la Tierra da 1,27 m: sube un bloque, como en Minecraft)
  V_SEGURA: 7.5,     // m/s de impacto que el cuerpo aguanta sin daño (≈ caer 2,9 m en la Tierra)
  OJO: 1.62          // altura de los ojos (m)
};

/* Las 4 variables de un lugar, con todo lo que se deriva de ellas.
   mej: niveles de mejoras { salto, velocidad, tanque } (opcional). */
export function entorno(id, mej = {}) {
  const c = CUERPOS[id];
  if (!c) throw new Error('Cuerpo desconocido: ' + id);
  const g = c.g, rel = g / G_TIERRA;

  /* ---- G: GRAVEDAD → movimiento ----
     Ley de la marcha (número de Froude): v = √(Fr·g·L). Con menos gravedad
     el pie "agarra" menos y la marcha natural es más lenta; por eso en la
     Luna conviene avanzar a saltos, como los astronautas del Apolo. */
  const vCaminar = g > 0 ? Math.sqrt(JUEGO.FROUDE * g * JUEGO.PIERNA) * (1 + 0.08 * (mej.velocidad || 0)) : 0;
  const vSalto = JUEGO.V_SALTO * (1 + 0.07 * (mej.salto || 0));
  const G = {
    g,
    relTierra: rel,
    vCaminar,
    vCorrer: vCaminar * 1.45,
    vSalto,
    hSalto: g > 0 ? vSalto * vSalto / (2 * g) : Infinity,          // altura máxima: v²/2g
    tVuelo: g > 0 ? 2 * vSalto / g : Infinity,                     // tiempo en el aire: 2v/g
    controlAire: 0.25,                                            // cuánto se puede corregir en el aire
    vSegura: JUEGO.V_SEGURA,
    hSegura: g > 0 ? JUEGO.V_SEGURA ** 2 / (2 * g) : Infinity     // altura desde la que caer ya duele
  };
  G.dSalto = G.vCorrer * G.tVuelo;                                 // largo de un salto corriendo

  /* ---- T: TIEMPO ← G ----
     Dilatación gravitacional: dτ/dt = √(1 − 2GM/(R·c²)). En la Tierra es
     de solo ~60 microsegundos por día (los GPS deben corregirla).
     El juego usa la misma forma con una escala visible: √(1 − g/G_ESCALA). */
  const real = c.GM ? 1 - Math.sqrt(1 - 2 * c.GM / (c.R * C * C)) : 0;   // fracción real
  const T = {
    factor: Math.sqrt(1 - g / JUEGO.G_ESCALA),     // segundos propios por segundo de misión
    usPorDiaReal: real * 86400 * 1e6               // microsegundos que se "atrasa" el reloj por día, en la realidad
  };

  /* ---- E: ESPACIO ← G y T ----
     Horizonte real a la altura de los ojos: d = √(2·R·h). Un planeta chico
     curva antes. Sin aire se ve más lejos (claridad). El relieve posible
     crece cuando baja la gravedad (las montañas más altas del sistema solar
     están en Marte: el Monte Olimpo). */
  const horizonte = c.R ? Math.sqrt(2 * c.R * JUEGO.OJO) : Infinity;
  const vis = c.R ? Math.round(horizonte * JUEGO.ESC_HORIZ * c.claridad + 35) : 400;
  const E = {
    horizonte,                                     // m reales
    vis,                                           // m de juego: hasta dónde se ve (y llega el rayo de foco)
    relieve: g > 0 ? Math.min(14, 3 * Math.pow(1 / rel, 0.7)) : 0,   // amplitud del terreno (m)
    alcanceFoco: vis,                              // el rayo identifica el punto foco hasta el límite visible
    alcanceBrazo: 4.5                              // tomar objetos
  };

  /* ---- V: VITALIDAD ← G, T y el lugar ---- (los usa vitalidad.js) */
  const V = {
    cargaCardio: rel,                              // el corazón bombea contra la gravedad
    atrofia: g > 0 ? Math.max(0, 1 - rel) : 1,     // sin carga, músculos y huesos se debilitan
    aireLibre: c.atm,                              // si no, se gasta el tanque de oxígeno
    radiacion: 1 - c.escudo,
    tanque: 1 + 0.3 * (mej.tanque || 0)            // capacidad del tanque
  };

  return { id, nombre: c.nombre, G, T, E, V };
}

/* Velocidad de impacto al caer desde h metros: v = √(2gh). */
export const vImpacto = (ent, h) => Math.sqrt(2 * ent.G.g * Math.max(0, h));
