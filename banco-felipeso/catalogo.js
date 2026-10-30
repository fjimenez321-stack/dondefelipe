/* Catálogo de beneficios que se compran con Hipopesos.
   Lo usan el Panel del profe (botones de compra) y el Mercado (los estudiantes piden la compra y el profe la autoriza).
   Para cambiar un precio o agregar un beneficio, edítalo aquí (y en banco-felipeso/bases.html y el ticker de index.html, que son texto fijo).
   desc: texto que se muestra en el Mercado y en las Bases · ocasion: true = solo cuando la ocasión lo amerite
   academico: true = compra académica (los gatitos héroe dan 30% de descuento en estas). */
window.CATALOGO_BENEFICIOS = [
  { ico: '📝', nombre: 'Borrar formativa',              precio: 300000, desc: 'Elimina una nota formativa a elección.', academico: true },
  { ico: '➕', nombre: '1 punto formativo',             precio: 10000,  desc: 'Suma 1 punto a una evaluación formativa.', academico: true },
  { ico: '🏫', nombre: 'Vuelta al colegio',             precio: 100000, desc: 'Permite volver a la sala tras un atraso o salida.', ocasion: true },
  { ico: '✂️', nombre: 'Eliminar décimas de una prueba', precio: 50000, desc: 'Prueba sumativa: se quitan las décimas descontadas en una pregunta mal respondida, según criterio del profesor. Son décimas de la nota, no puntos.', academico: true },
  { ico: '📱', nombre: 'Uso de celular libre',          precio: 150000, desc: 'Uso del celular durante una clase, sin fines pedagógicos.', ocasion: true },
  { ico: '🍪', nombre: 'Comer',                         precio: 50000,  desc: 'Permiso para comer algo durante la clase.' },
  { ico: '🎧', nombre: 'Su playlist en clases',         precio: 50000,  desc: 'Su playlist suena mientras se trabaja (contenido apropiado, volumen bajo).', ocasion: true },
  { ico: '💺', nombre: 'Cambio de puesto libre',        precio: 200000, desc: 'Se sienta donde quiera durante al menos una semana de clases (respetando la convivencia y las indicaciones del profesor).' }
];
