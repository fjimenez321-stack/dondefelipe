/* Catálogo de la tienda de gatitos.
   ¡Ojo! Los precios también están en firebase/firestore.rules (función precioGatito):
   si cambias uno aquí, cámbialo allá y vuelve a publicar las reglas. */
window.RAREZAS = {
  comun:      { nombre: 'Común',      color: '#9aa3b2' },
  pococomun:  { nombre: 'Poco común', color: '#4bd08c' },
  raro:       { nombre: 'Raro',       color: '#22a7ff' },
  epico:      { nombre: 'Épico',      color: '#b26bff' },
  legendario: { nombre: 'Legendario', color: '#ff9f1c' },
  mitico:     { nombre: 'Mítico',     color: '#ff2e7e' },
  heroe:      { nombre: 'Héroe',      color: '#ffd23f' }
};
window.GATITOS = [
  { id: 'naranjo',     nombre: 'Michi Naranjo',        precio: 10000,   rareza: 'comun',      txt: 'El clásico. Curioso, glotón y siempre al sol.' },
  { id: 'gris',        nombre: 'Gris Atigrado',        precio: 12000,   rareza: 'comun',      txt: 'Discreto como la niebla de la mañana.' },
  { id: 'dormilon',    nombre: 'Dormilón',             precio: 15000,   rareza: 'comun',      txt: 'Duerme 16 horas al día y no se arrepiente.' },
  { id: 'patitas',     nombre: 'Patitas Arriba',       precio: 18000,   rareza: 'comun',      txt: 'Te muestra la guatita. No caigas: es una trampa.' },
  { id: 'aseo',        nombre: 'Gatito Pulcro',        precio: 25000,   rareza: 'pococomun',  txt: 'Siempre impecable, sobre todo antes de una prueba.' },
  { id: 'blanconegro', nombre: 'Esmoquin',             precio: 30000,   rareza: 'pococomun',  txt: 'Blanco y negro, listo para la gala de fin de año.' },
  { id: 'tricolor',    nombre: 'Tricolor',             precio: 35000,   rareza: 'pococomun',  txt: 'Tres colores, cero dudas sobre quién manda.' },
  { id: 'comelon',     nombre: 'Comelón',              precio: 40000,   rareza: 'pococomun',  txt: 'Su plato nunca está lo bastante lleno.' },
  { id: 'siames',      nombre: 'Siamés',               precio: 60000,   rareza: 'raro',       txt: 'Ojos de cielo y opiniones muy firmes.', poderes: ['🔁 Cambio de puesto (cuando amerite)'] },
  { id: 'negro',       nombre: 'Medianoche',           precio: 70000,   rareza: 'raro',       txt: 'Trae buena suerte a quien lo cuida.', poderes: ['🎵 Elegir la música de la clase (cuando amerite)'] },
  { id: 'estirado',    nombre: 'Estiramiento',         precio: 80000,   rareza: 'raro',       txt: 'Experto en elongación antes de Educación Física.', poderes: ['🧘 Pausa activa de 2 minutos en clase'] },
  { id: 'jugueton',    nombre: 'Juguetón',             precio: 100000,  rareza: 'raro',       txt: 'Un ovillo de lana y es feliz toda la tarde.', poderes: ['🤝 Elegir compañero/a en trabajos en pareja'] },
  { id: 'caja',        nombre: 'Gato en Caja',         precio: 150000,  rareza: 'epico',      txt: '¿Está dormido o despierto? Abre la caja y descúbrelo.', poderes: ['📦 Elegir su grupo de trabajo'] },
  { id: 'tronco',      nombre: 'Guardián del Bosque',  precio: 200000,  rareza: 'epico',      txt: 'Vigila el bosque nativo desde su tronco de coihue.', poderes: ['🔔 Salir primero al recreo'] },
  { id: 'barril',      nombre: 'Gato del Barril',      precio: 250000,  rareza: 'epico',      txt: 'Viajó de polizón en un barril desde Valparaíso.', poderes: ['🎤 Elegir el orden de su disertación'] },
  { id: 'muro',        nombre: 'Explorador del Muro',  precio: 400000,  rareza: 'legendario', txt: 'Ha recorrido todos los techos de Villa Alemana.', poderes: ['🚶 Permiso de paseo por el colegio en cada clase (cuando amerite)'] },
  { id: 'fantasma',    nombre: 'Gato Fantasma',        precio: 500000,  rareza: 'legendario', txt: 'Aparece en los pasillos cuando nadie mira.', poderes: ['📓 Uso del cuaderno 5 minutos en cada evaluación'] },
  { id: 'ava',         nombre: 'Ava',                  precio: 450000,  rareza: 'legendario', txt: 'Ava ♀. Gatita especial: trae un premio único de 5 décimas formativas y 2 sumativas. Camina, corre, juega y duerme siesta.', premio: { formativas: 5, sumativas: 2 }, anim: true, poderes: ['💎 Premio único: 5 décimas formativas y 2 sumativas', '🚶 Permiso de paseo por el colegio en cada clase (cuando amerite)'] },
  { id: 'calha',       nombre: 'Calha',                precio: 450000,  rareza: 'legendario', txt: 'Calha ♀. Gatita especial y compañera de Ava: trae un premio único de 5 décimas formativas y 2 sumativas.', premio: { formativas: 5, sumativas: 2 }, anim: true, poderes: ['💎 Premio único: 5 décimas formativas y 2 sumativas', '📓 Uso del cuaderno 5 minutos en cada evaluación'] },
  { id: 'nietzsche',   nombre: 'Gato Nietzsche',       precio: 500000,  rareza: 'legendario', txt: 'Filósofo, explorador y pensador. Cada mes: 5 décimas formativas y 2 sumativas.', anim: true, diarias: 0, mensual: { formativas: 5, sumativas: 2 }, poderes: ['📜 5 décimas formativas y 2 sumativas cada mes'] },
  // Héroes: edición limitada (el profe los publica de vez en cuando, con pocas unidades; «Publicar todo el catálogo» no los incluye).
  // Beneficio: 30% de descuento en las compras académicas del Mercado (ver «academico» en banco-felipeso/catalogo.js). No se suma entre ellos.
  { id: 'rayo',        nombre: 'Rayo',                 precio: 600000,  rareza: 'heroe',      txt: 'Velocidad y valentía. Edición limitada.', anim: true, exclusivo: true, diarias: 0, descuentoAcademico: 0.3, poderes: ['🎓 30% de descuento en compras académicas (puntos, formativas, décimas)'] },
  { id: 'sombra',      nombre: 'Sombra',               precio: 600000,  rareza: 'heroe',      txt: 'Sigilo y estrategia. Edición limitada.', anim: true, exclusivo: true, diarias: 0, descuentoAcademico: 0.3, poderes: ['🎓 30% de descuento en compras académicas (puntos, formativas, décimas)'] },
  { id: 'luna',        nombre: 'Luna',                 precio: 600000,  rareza: 'heroe',      txt: 'Sabiduría y apoyo. Edición limitada.', anim: true, exclusivo: true, diarias: 0, descuentoAcademico: 0.3, poderes: ['🎓 30% de descuento en compras académicas (puntos, formativas, décimas)'] },
  { id: 'cosmico',     nombre: 'Gato Cósmico',         precio: 750000,  rareza: 'mitico',     txt: 'Lleva una constelación en el pelaje. Vino del observatorio.', poderes: ['🚶 Paseo por el colegio en cada clase (cuando amerite)', '📓 Cuaderno 5 minutos en cada evaluación'] },
  // Edición limitada de 2 unidades («stock»): al publicar el catálogo, su oferta sale con ese stock.
  { id: 'cesar',       nombre: 'Gato del tío César',   precio: 1000000, rareza: 'mitico',     txt: 'Huaso de chupalla y poncho, el gatito del tío César: baila cueca, toca guitarra y duerme siesta. Edición limitada: solo 2. Cada mes: 5 décimas formativas y 2 sumativas.', anim: true, stock: 2, diarias: 0, mensual: { formativas: 5, sumativas: 2 }, poderes: ['📜 5 décimas formativas y 2 sumativas cada mes'] },
  // La gatita de la profe Paulina: matemática de corazón.
  { id: 'grunona',     nombre: 'Gruñona',              precio: 5000000, rareza: 'mitico',     txt: 'La gatita de la profe Paulina: cuenta del 0 al 9, suma, resta, multiplica y divide, y nunca suelta su calculadora. Cada mes: 5 décimas formativas y 2 sumativas.', anim: true, diarias: 0, mensual: { formativas: 5, sumativas: 2 }, poderes: ['📜 5 décimas formativas y 2 sumativas cada mes'] },
  { id: 'dorado',      nombre: 'Gato Dorado',          precio: 1000000, rareza: 'mitico',     txt: 'El más valioso del colegio. Muy pocos lo tendrán.', poderes: ['🚶 Paseo por el colegio en cada clase (cuando amerite)', '📓 Cuaderno 5 minutos en cada evaluación', '🎵 Elegir la música de la clase'] }
];

/* ═════ Poderes de los gatitos ═════
   Cada gatito que tienes da décimas formativas por día (se reclaman en el Mercado, pestaña Mi colección):
   común y poco común: 1 · raro y épico: 2 · legendario y mítico: 3. Máximo 3 décimas por día en total.
   Premio único (campo «premio»): Ava y Calha dan, además, 5 décimas formativas y 2 sumativas UNA sola vez
   por cuenta y por gatita (se reclama en Mi colección).
   Gato Nietzsche y Gato del tío César (diarias: 0, mensual): no dan décimas diarias; cada uno da 5 formativas
   y 2 sumativas una vez al mes.
   Además, raros, épicos, legendarios y míticos dan un poder permanente (campo «poderes»), que el profe
   respeta cuando la clase lo permite.
   ¡Ojo! Las décimas por rareza y el máximo también están en firebase/firestore.rules (decimasPoder). */
window.PODER_DECIMAS = { comun: 1, pococomun: 1, raro: 2, epico: 2, legendario: 3, mitico: 3, heroe: 0 };
window.PODER_MAX_DIA = 3;
window.GATITOS_ESPECIALES = {};   // (sin gatitos con décimas diarias especiales por ahora)
// Lo que da un gatito por día y lo que dan todos juntos hoy.
window.poderGato = function (g) {
  if (g.diarias === 0) return { formativas: 0, sumativas: 0 };
  var e = window.GATITOS_ESPECIALES[g.id];
  return e ? { formativas: e.formativas, sumativas: e.sumativas } : { formativas: window.PODER_DECIMAS[g.rareza] || 0, sumativas: 0 };
};
window.poderDelDia = function (ids) {
  var n = 0, f = 0, s = 0;
  (ids || []).forEach(function (id) {
    var g = window.GATITOS.find(function (x) { return x.id === id; }); if (!g) return;
    var e = window.GATITOS_ESPECIALES[id];
    if (g.diarias === 0) return;
    if (e) { f = Math.max(f, e.formativas); s = Math.max(s, e.sumativas); } else n += window.PODER_DECIMAS[g.rareza] || 0;
  });
  return { formativas: Math.max(f, Math.min(n, window.PODER_MAX_DIA)), sumativas: s };
};
// Poder mensual (Gato Nietzsche, Gato del tío César): CADA gatito con «mensual» se reclama una vez
// por mes calendario (si tienes los dos, reclamas los dos). Igual que opPoderMes() en las reglas.
window.mensualesDe = function (ids) {
  return window.GATITOS.filter(function (g) { return g.mensual && (ids || []).indexOf(g.id) >= 0; });
};
// Documento que marca el reclamo del mes (el de Nietzsche conserva el formato antiguo).
window.idPoderMes = function (cuenta, mes, gid) { return gid === 'nietzsche' ? cuenta + '__' + mes : cuenta + '__' + mes + '__' + gid; };
window.textoMensual = function (g) { return g.nombre + ': ' + window.textoPoderDia(g.mensual) + ' del mes'; };
window.poderDelMes = function (ids) {
  var f = 0, s = 0;
  (ids || []).forEach(function (id) { var g = window.GATITOS.find(function (x) { return x.id === id; }); if (g && g.mensual) { f = Math.max(f, g.mensual.formativas); s = Math.max(s, g.mensual.sumativas); } });
  return { formativas: f, sumativas: s };
};
// Mes escolar (hora de Chile aproximada, UTC−4) como número: año × 12 + mes (0-11). Igual que mesHoy() en las reglas.
window.mesHoy = function () { var d = new Date((window.DF && DF.ahora ? DF.ahora() : Date.now()) - 14400000); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };
// Descuento de los gatitos héroe en compras académicas: el mayor que tengas (no se suman).
window.descuentoAcademico = function (ids) {
  var d = 0; (ids || []).forEach(function (id) { var g = window.GATITOS.find(function (x) { return x.id === id; }); if (g && g.descuentoAcademico > d) d = g.descuentoAcademico; });
  return d;
};
window.precioConDescuento = function (precio, d) { return d ? Math.round(precio * (1 - d) / 100) * 100 : precio; };
window.textoPremio = function (g) { return g.nombre + ': premio único de ' + window.textoPoderDia(g.premio); };
window.textoPoderDia = function (p) {
  return window.textoDecimas(p.formativas) + (p.sumativas ? ' y ' + (p.sumativas === 1 ? '1 décima sumativa' : p.sumativas + ' décimas sumativas') : '');
};
window.decimasDeGatitos = function (ids) { return window.poderDelDia(ids).formativas; };
window.textoDecimas = function (n) { return n === 1 ? '1 décima formativa' : n + ' décimas formativas'; };
