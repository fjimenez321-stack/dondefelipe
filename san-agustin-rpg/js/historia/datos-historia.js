// ═══════════════════════════════════════════════════════════════
// HISTORIA PRINCIPAL — «EL PLAN ASFALTO»  (solo datos; la lógica está en historia.js)
//
// Noviembre. Una ola de calor tiene al Colegio San Agustín a 38 °C.
// Termocorp, la empresa del Dr. Cálido Vapor, ofrece "la solución": talar
// el Jardín Edén, pavimentar la cancha para un estacionamiento y vender
// aires acondicionados gigantes al colegio. La Directora firmará el viernes…
// a menos que la comunidad presente un plan mejor.
//
// Un niño o una niña de 6° decide salvar el colegio: con la guía del
// Profe Felipe debe CONVENCER a la comunidad en debates (argumentos contra
// excusas), detener a la Ingeniera Brea y vencer al Dr. Vapor en la asamblea.
//
// Para cambiar textos, aliados o dificultad: editar este archivo.
// ═══════════════════════════════════════════════════════════════

export const TEMP_INICIAL = 38;  // °C en el patio al empezar
export const ALIADOS_PARA_BREA = 3;
export const ALIADOS_PARA_FINAL = 6;

// ── Categorías de argumento ─────────────────────────────────────
export const CATEGORIAS = {
  ciencia:  { emoji: '🔬', nombre: 'Dato científico', color: '#38bdf8' },
  cercania: { emoji: '💚', nombre: 'Cercanía',        color: '#4ade80' },
  ahorro:   { emoji: '💰', nombre: 'Ahorro',          color: '#fbbf24' },
  accion:   { emoji: '🛠️', nombre: 'Acción concreta', color: '#f472b6' },
};

// ── Argumentos del jugador ─────────────────────────────────────
// requiere: evidencia necesaria (si no, se tienen desde que el Profe Felipe explica el plan)
export const ARGUMENTOS = [
  { id: 'invernadero', cat: 'ciencia', poder: 16, nombre: 'Efecto invernadero',
    texto: 'Al quemar petróleo, gas y carbón liberamos CO₂. Ese gas atrapa calor en la atmósfera, como una frazada sobre la Tierra.' },
  { id: 'patio', cat: 'cercania', poder: 16, nombre: 'Nuestro patio',
    texto: '¿Te acuerdas de los recreos bajo los árboles del Jardín Edén? Sin ellos, el patio sería un horno.' },
  { id: 'pequenas', cat: 'accion', poder: 15, nombre: 'Pequeñas acciones',
    texto: 'Si cada curso apaga las luces y separa la basura, somos cientos de personas haciendo algo al mismo tiempo.' },
  { id: 'ahorrar', cat: 'ahorro', poder: 15, nombre: 'Ahorrar es ganar',
    texto: 'Lo que ahorramos en luz y agua puede usarse en materiales, talleres y salidas pedagógicas.' },
  { id: 'termometro', cat: 'ciencia', poder: 22, nombre: 'Registro del termómetro', requiere: 'termometro',
    texto: 'Medí 38 °C a la sombra en el patio. Bajo los árboles el suelo estaba mucho más fresco que el cemento al sol.' },
  { id: 'ipcc', cat: 'ciencia', poder: 24, nombre: 'Lo dicen los científicos', requiere: 'recorte',
    texto: 'Según el IPCC, la Tierra ya está más de 1 °C más caliente que antes de la era industrial, y la causa principal somos los humanos.' },
  { id: 'boleta', cat: 'ahorro', poder: 24, nombre: 'La cuenta de la luz', requiere: 'boleta',
    texto: 'Mire esta boleta: pagamos por salas iluminadas y vacías. Apagando a tiempo, la cuenta baja todos los meses.' },
  { id: 'plano', cat: 'accion', poder: 26, nombre: 'El plano de Termocorp', requiere: 'plano',
    texto: '¡Aquí está el plano! Quieren talar el jardín y pavimentar la cancha. Si no actuamos ahora, no habrá vuelta atrás.' },
];

// ── Evidencias que se encuentran explorando ───────────────────
export const EVIDENCIAS = {
  termometro: { emoji: '🌡️', nombre: 'Termómetro del patio', mapa: 'jardin_eden', x: 3, y: 2,
    texto: '🌡️ Encontraste un TERMÓMETRO clavado en un árbol.\n\nMarca 38 °C a la sombra.\nEn el pasto bajo el árbol se siente mucho más fresco que en el pavimento.\n\n🔬 Nuevo argumento: «Registro del termómetro»' },
  recorte: { emoji: '📰', nombre: 'Recorte de diario', mapa: 'biblioteca', x: 10, y: 6,
    texto: '📰 Un RECORTE DE DIARIO olvidado en una mesa:\n\n«Informe del IPCC: el planeta ya se calentó más de 1 °C por la actividad humana. Cada décima de grado importa.»\n\n🔬 Nuevo argumento: «Lo dicen los científicos»' },
  boleta: { emoji: '🧾', nombre: 'Boleta de la luz', mapa: 'secretaria', x: 11, y: 5,
    texto: '🧾 Una BOLETA DE LA LUZ del colegio.\n\nEl consumo sube en los meses de calor… y también en recreos y fines de semana, cuando las salas están vacías.\n\n💰 Nuevo argumento: «La cuenta de la luz»' },
};

// ── Personajes que hay que convencer (ids de npc-v4.js) ────────
// debil: categorías que más lo convencen (×2) · fuerte: las que casi no le hacen efecto (×½)
export const ALIADOS = {
  'pasillo:J': {
    nombre: 'José', emoji: '👦', resistencia: 60, debil: ['cercania'], fuerte: ['ciencia'],
    postura: '¿Salvar el colegio? Somos niños, no superhéroes.',
    excusas: [
      { texto: 'Somos niños. ¿Qué vamos a hacer nosotros?', dano: 9 },
      { texto: 'Mejor vamos a jugar a la pelota, hace mucho calor para pensar.', dano: 8 },
      { texto: 'Ya va a llegar algún adulto a arreglarlo.', dano: 10 },
    ],
    preocupacion: 'La verdad… me da miedo que esto no tenga arreglo. Prefiero no pensar en eso.',
    convencido: '¡Ya! Si lo hacemos juntos no da tanto miedo. Armo una brigada de reciclaje con el curso.',
    compromiso: { emoji: '♻️', titulo: 'Brigada de reciclaje' },
  },
  'pasillo:I': {
    nombre: 'Inspector', emoji: '👮', resistencia: 90, debil: ['accion'], fuerte: ['cercania'],
    postura: 'El reglamento interno no dice nada sobre el clima.',
    excusas: [
      { texto: 'El reglamento no dice nada del clima. Fin de la discusión.', dano: 11 },
      { texto: 'Primero el orden, después lo demás.', dano: 9 },
      { texto: '¡A la sala, que ya va a tocar el timbre!', dano: 12 },
    ],
    preocupacion: 'Si propongo algo nuevo y sale mal, la culpa va a ser mía.',
    convencido: 'Con un plan claro, puedo ponerle orden. Desde mañana hay Patrulla Apaga-Luces en cada recreo.',
    compromiso: { emoji: '💡', titulo: 'Patrulla Apaga-Luces' },
  },
  'pasillo:r': {
    nombre: 'Tío Antonio', emoji: '🪖', resistencia: 80, debil: ['accion'], fuerte: ['ahorro'],
    postura: 'En mis tiempos también hacía calor, {nombre}.',
    excusas: [
      { texto: 'En mis tiempos también hacía calor y nadie lloraba.', dano: 10 },
      { texto: 'Eso del calentamiento es pura exageración de la tele.', dano: 11 },
      { texto: 'Uno aguanta el calor y sigue trabajando.', dano: 9 },
    ],
    preocupacion: 'Yo cuidaba la huerta del colegio… pero hace años que nadie me ayuda.',
    convencido: '¡A la orden! Volvemos a abrir la huerta, con compostera. Los restos de la colación serán tierra fértil.',
    compromiso: { emoji: '🥬', titulo: 'Huerta y compost' },
  },
  'pasillo:$': {
    nombre: 'Jorge', emoji: '👴', resistencia: 70, debil: ['ahorro'], fuerte: ['ciencia'],
    postura: 'Las llaves del baño gotean desde que llegué. Así es.',
    excusas: [
      { texto: 'Las llaves gotean desde siempre. Así es este colegio.', dano: 8 },
      { texto: 'No me alcanza el día para arreglar todo.', dano: 10 },
      { texto: '¿Y quién paga los repuestos?', dano: 10 },
    ],
    preocupacion: 'Nadie me pregunta nunca qué hace falta reparar.',
    convencido: 'Bueno pues: hago la lista de goteras y las arreglo de a una. El agua es plata… y es vida.',
    compromiso: { emoji: '🚰', titulo: 'Cero goteras' },
  },
  'cancha:G': {
    nombre: 'Profe Gonzalo', emoji: '🏃', resistencia: 85, debil: ['cercania'], fuerte: ['ahorro'],
    postura: 'Un estacionamiento no está tan mal; los apoderados reclaman harto.',
    excusas: [
      { texto: 'Sin estacionamiento, ¿dónde dejan el auto los apoderados?', dano: 10 },
      { texto: 'Con este calor igual no se puede hacer clases afuera.', dano: 11 },
      { texto: 'El deporte no tiene nada que ver con el clima.', dano: 9 },
    ],
    preocupacion: 'Si pavimentan la cancha, nunca más voy a hacer clases al aire libre.',
    convencido: '¡Tienes razón, {nombre}! Organizo el Día Sin Auto: todos al colegio caminando o en bici.',
    compromiso: { emoji: '🚲', titulo: 'Día sin auto' },
  },
  'biologia:Y': {
    nombre: 'Yael', emoji: '👩‍🔬', resistencia: 75, debil: ['ciencia'], fuerte: ['cercania'],
    postura: 'Interesante… pero sin datos no hay conclusión.',
    excusas: [
      { texto: 'Una opinión no es evidencia.', dano: 10 },
      { texto: '¿Y cómo mides eso? Muéstrame los datos.', dano: 11 },
      { texto: 'Correlación no es causalidad.', dano: 12 },
    ],
    preocupacion: 'Me encantaría que los alumnos midieran el clima del colegio ellos mismos.',
    convencido: '¡Eso es pensamiento científico! Armemos un vivero de árboles nativos y una estación meteorológica.',
    compromiso: { emoji: '🌳', titulo: 'Vivero nativo y estación meteorológica' },
  },
  'secretaria:f': {
    nombre: 'Francisco', emoji: '🧑‍💼', resistencia: 95, debil: ['ahorro'], fuerte: ['cercania'],
    postura: 'Termocorp nos ofrece financiamiento. Los números mandan.',
    excusas: [
      { texto: 'El presupuesto de este año ya está cerrado.', dano: 11 },
      { texto: 'Termocorp nos ofreció financiar todo. ¿Quién más lo hace?', dano: 12 },
      { texto: 'Los paneles solares son carísimos.', dano: 10 },
    ],
    preocupacion: 'Si gastamos de más, el colegio no llega a fin de año. Esa es mi responsabilidad.',
    convencido: 'Si bajamos la cuenta de luz, el ahorro se paga solo. Reviso los consumos y postulamos a paneles solares.',
    compromiso: { emoji: '☀️', titulo: 'Ahorro de energía y paneles solares' },
  },
  'pasillo:7': {
    nombre: 'Tía Claudita', emoji: '🧠', resistencia: 85, debil: ['accion'], fuerte: ['ahorro'],
    postura: 'El currículum ya está lleno, {nombre}.',
    excusas: [
      { texto: 'El currículum ya está lleno, no caben más temas.', dano: 10 },
      { texto: 'No hay horas para proyectos.', dano: 10 },
      { texto: 'Primero están las evaluaciones.', dano: 11 },
    ],
    preocupacion: 'Quiero que aprendan de verdad, no solo para una prueba.',
    convencido: 'Un proyecto real es aprendizaje significativo. El clima entra en todas las asignaturas.',
    compromiso: { emoji: '📚', titulo: 'Proyecto clima en todas las asignaturas' },
  },
};

// ── Personajes nuevos de la historia ──────────────────────────
const piel = { clara: '#f1c9a5', media: '#e0b48a', morena: '#c99668' };
export const PERSONAJES_HISTORIA = [
  { id: 'directora', mapa: 'jardin_eden', x: 5, y: 5, nombre: 'Directora Marta', emoji: '👩‍💼',
    apariencia: { piel: piel.media, pelo: '#3b2416', peinado: 'moño', ropa: '#1e3a8a', falda: true, lentes: true },
    ia: { tipo: 'deambular', radio: 1, pausa: [4, 8] }, mirar: 3 },
  { id: 'brea', mapa: 'jardin_eden', x: 16, y: 9, nombre: 'Ingeniera Brea', emoji: '🦺',
    apariencia: { piel: piel.clara, pelo: '#2b2b2b', peinado: 'cola', ropa: '#f97316', pantalon: '#1f2937', gorro: '#facc15' },
    ia: { tipo: 'patrulla', ruta: [[16, 9], [16, 10], [13, 10], [13, 9]], pausa: [1, 2.5] }, mirar: 2,
    saludo: { radio: 3, cada: 9, frases: ['Árbol marcado: ✗', 'Aquí va el estacionamiento.', 'Midiendo… midiendo…'] } },
  { id: 'vapor', mapa: 'jardin_eden', x: 14, y: 5, nombre: 'Dr. Cálido Vapor', emoji: '😎',
    apariencia: { piel: piel.morena, pelo: '#e5e7eb', peinado: 'corto', ropa: '#7f1d1d', pantalon: '#111827', lentes: true },
    ia: { tipo: 'quieto' }, mirar: 6,
    saludo: { radio: 4, cada: 8, frases: ['¡Más calor, más ventas! Ja, ja.', 'El viernes se firma.', 'Termocorp: el frío tiene precio.'] } },
];

export const BREA = {
  nombre: 'Ingeniera Brea', emoji: '🦺', resistencia: 130, debil: ['ciencia'], fuerte: ['cercania'],
  postura: 'Árbol marcado, árbol que se corta. Son órdenes de Termocorp.',
  excusas: [
    { texto: 'El asfalto es progreso, {nombre}.', dano: 12 },
    { texto: 'Los árboles solo ensucian con hojas.', dano: 11 },
    { texto: 'Un estacionamiento da plata. Un jardín, no.', dano: 13 },
    { texto: 'Lo firmado, firmado está.', dano: 12 },
  ],
  preocupacion: '…Mi hija estudia en un colegio sin árboles. Todos los días llega reclamando por el calor.',
  convencido: 'No puedo seguir con esto. Toma… es el plano completo del Proyecto Asfalto. Muéstraselo a todos.',
};

export const VAPOR = {
  nombre: 'Dr. Cálido Vapor', emoji: '😎',
  fases: [
    { resistencia: 110, debil: ['ciencia'], fuerte: ['cercania'],
      postura: '¿Calentamiento global? ¡Calentamiento de mis ventas! Ja, ja, ja.',
      excusas: [
        { texto: 'El clima siempre ha cambiado. No es culpa de nadie.', dano: 13 },
        { texto: 'Un grado más, un grado menos… ¿qué tanto?', dano: 12 },
      ] },
    { resistencia: 110, debil: ['ahorro'], fuerte: ['ciencia'],
      postura: '¡Mis aires acondicionados lo arreglan todo!',
      excusas: [
        { texto: 'Con mis aires acondicionados nadie vuelve a pasar calor.', dano: 13 },
        { texto: 'La luz es barata. Gasten nomás.', dano: 12 },
      ] },
    { resistencia: 120, debil: ['accion'], fuerte: ['ahorro'],
      postura: 'Ustedes son niños. Nadie les va a hacer caso.',
      excusas: [
        { texto: 'Nadie escucha a un niño. ¡Firmen de una vez!', dano: 14 },
        { texto: 'Todos prefieren lo cómodo. Ya verán.', dano: 13 },
      ] },
  ],
  // Datos que el juego explica al pasar de fase (siempre correctos y simples)
  datosFase: [
    '📚 Los aires acondicionados no eliminan el calor: lo sacan hacia afuera y gastan mucha electricidad.',
    '📚 Si esa electricidad viene de centrales a carbón o gas, se emite más CO₂… y el planeta se calienta más.',
  ],
};
