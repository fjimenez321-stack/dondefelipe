/* ============================================================
   ODISEA CÓSMICA · sagas.js
   SAGAS — cada campaña es una disciplina con su vehículo, mundos
   y preguntas. Dificultad escalonada por nivel (meta/spawn/jefe).

   Estructura narrativa de cada saga:
   · intro        → el GUÍA (narrador de toda la saga) plantea el viaje.
   · world.autor  → quien firma la bitácora de ese mundo (en el Sistema
                    Solar es un relevo de sabios; en las otras, el guía).
   · world.contexto → lo que se lee antes de jugar la misión.
   · world.cierre → palabras del GUÍA al terminar: enlazan con el
                    siguiente destino.
   · finalBoss    → "Examen final": su propio texto de presentación.
   · epilogo      → texto de la pantalla de victoria.
   · world.fondo  → qué escenario dibujar (ver scenes.js).
   · boss.deco    → variante visual de los guardianes (ver sprites.js).
   ============================================================ */
window.OC = window.OC || {};
OC.Sagas = [

/* ============================================================
   1 · EL SISTEMA SOLAR — el relevo de los sabios
   ============================================================ */
{
  id:"sistema-solar", titulo:"Odisea Cósmica", subtitulo:"El Sistema Solar",
  vehiculo:"nave", vehiculoFrase:"La nave de Galileo fue destruida", color:"#c8a24b", icono:"🪐",
  guia:{nombre:"Galileo", sello:"G"},
  enemigos:{ meteoro:"un meteorito", alien:"una nave centinela" },
  eventos:{ tormenta:"☄ LLUVIA DE METEORITOS", oleada:"🛸 OLEADA DE CENTINELAS" },
  finalBoss:{nombre:"El gran Profesor Felipe", hp:78, color:"#c8a24b", look:"felipe", shot:"bolt",
    autor:{nombre:"Galileo", sello:"G"}, sub:"Última bitácora de Galileo",
    contexto:"Examen final. Llegaste al confín del sistema solar, mucho más lejos de lo que mi anteojo habría alcanzado jamás. Aquí te espera el último guardián, El gran Profesor Felipe, que custodia la frontera y solo deja pasar a quien demuestra lo que aprendió en el camino. Cada mundo que visitaste, cada sabio que tomó el relevo, es ahora tu arma. Demuestra que comprendes."},
  epilogo:"Superaste el examen final y cruzaste el confín del sistema solar. De Mercurio a la Nube de Oort, cada sabio tomó el relevo del anterior: Galileo, Kepler, Huygens, Herschel, Le Verrier, Tombaugh y Oort. Ahora el relevo lo tienes tú. El verdadero explorador no solo navega: comprende.",
  intro:{ narrador:"Galileo Galilei", sello:"G",
    texto:"Soy Galileo Galilei. Con mi anteojo vi montañas en la Luna, fases en Venus y cuatro lunas girando en torno a Júpiter, y comprendí que la Tierra se mueve alrededor del Sol. Pero mi anteojo era pequeño y el cielo es inmenso. Te entrego mi nave, equipada con instrumentos que yo solo pude imaginar: con ella viajarás desde Mercurio hasta la Nube de Oort. En cada mundo te esperan las anotaciones del sabio que lo comprendió y un guardián que solo deja pasar a quien demuestra lo que sabe; los meteoritos y las naves extrañas que verás son sus centinelas. El verdadero explorador no solo navega, comprende." },
  worlds:[

 { nombre:"Mercurio", color:"#b8b0a0", num:1, scene:"mercurio", fondo:"mercurio",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 1 · Mercurio. Apenas logré verlo: viaja tan cerca del Sol que se esconde en su resplandor. Tu nave sí puede acercarse. Es el planeta más pequeño y el más veloz: completa su órbita en solo 88 días. Casi no tiene atmósfera que lo proteja, así que su superficie es un desierto de cráteres golpeado por meteoritos. Despeja el camino y supera a su guardián.",
   dato:"Mercurio casi no tiene atmósfera y su año dura solo 88 días.",
   cierre:"Mercurio queda atrás. Sigue hacia Venus: con mi anteojo vi allí algo que cambió mi forma de entender el cielo.",
   meta:12, baseSpawn:1200, boss:{nombre:"Profesor Alex", hp:16, color:"#d9d2c2", look:"birrete", shot:"bolt"} },

 { nombre:"Venus", color:"#e0a648", num:2, scene:"venus", fondo:"venus", cooling:true,
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 2 · Venus. Con mi anteojo vi que Venus cambia de forma como la Luna: tiene fases. Eso solo ocurre si gira alrededor del Sol, y fue una de mis mejores pruebas a favor de Copérnico. Lo que yo no podía ver es lo que miden tus instrumentos: bajo su velo de nubes, un efecto invernadero desbocado supera los 460 °C, más que en Mercurio. Aquí el calor es tu enemigo: el casco se recalienta sin descanso. Vigila la barra de TEMPERATURA y recoge las cápsulas de refrigerante ❄; si llega al máximo, la nave se funde.",
   dato:"En Venus el efecto invernadero supera los 460 °C, más caliente que Mercurio.",
   cierre:"Venus queda atrás. Ahora vuelve a casa y mírala con otros ojos: la Tierra, el mundo que mi época creía inmóvil.",
   meta:14, baseSpawn:1100, boss:{nombre:"Profesor Carlos", hp:22, color:"#f0d3ac", look:"calvo", shot:"nota"} },

 { nombre:"Tierra", color:"#4d9de0", num:3, scene:"space", fondo:"tierra",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 3 · Tierra. Nuestro hogar. Se nos enseñó que era el centro inmóvil del universo; mis observaciones mostraron que es un mundo más, que gira alrededor del Sol. Es el único mundo conocido con océanos líquidos y con vida. Míralo con tus instrumentos: un pequeño mundo azul suspendido en el vacío. Desde aquí continúa tu viaje hacia afuera.",
   dato:"La Tierra es el único mundo conocido con vida y agua líquida.",
   cierre:"Dejas la Tierra. El siguiente mundo lo estudió Johannes Kepler, quien descubrió la forma real de las órbitas.",
   meta:16, baseSpawn:1050, boss:{nombre:"Guardián Azul", hp:26, color:"#5bb0ff", look:"guardian", deco:"vortice"} },

 { nombre:"Marte", color:"#d1603a", num:4, scene:"space", fondo:"marte",
   autor:{nombre:"Johannes Kepler", sello:"K"}, sub:"Cuaderno de Johannes Kepler",
   contexto:"Misión 4 · Marte. Soy Johannes Kepler. Estudiando las posiciones de Marte descubrí que los planetas no giran en círculos perfectos, sino en elipses, con el Sol en uno de sus focos. Es el planeta rojo, teñido por el óxido de hierro de su suelo, y alberga a Olympus Mons, el volcán más alto del sistema solar. Tus instrumentos detectan huellas de antiguos cauces de agua. Ábrete paso entre sus tormentas de polvo.",
   dato:"El color rojo de Marte proviene del óxido de hierro de su superficie.",
   cierre:"Marte queda atrás. Ahora el gigante: en Júpiter descubrí cuatro lunas que cambiaron mi vida.",
   meta:18, baseSpawn:1000, boss:{nombre:"Ares, Señor Rojo", hp:30, color:"#ff6a44", look:"guardian", deco:"espinas"} },

 { nombre:"Júpiter", color:"#d8a16b", num:5, scene:"space", fondo:"jupiter",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 5 · Júpiter. Aquí está mi mayor descubrimiento. En enero de 1610 vi cuatro puntos de luz junto a Júpiter que cambiaban de lugar noche tras noche: eran lunas que giraban a su alrededor —Ío, Europa, Ganímedes y Calisto—. No todo giraba en torno a la Tierra. Es el gigante del sistema solar: cabrían más de mil Tierras en su interior, y su Gran Mancha Roja es una tormenta más ancha que nuestro mundo.",
   dato:"Galileo descubrió las 4 lunas mayores de Júpiter, hoy llamadas galileanas.",
   cierre:"Júpiter queda atrás. Mi anteojo apenas distinguió el siguiente mundo, tan extraño que lo dibujé con 'orejas'. Otro sabio lo comprendió mejor que yo.",
   meta:20, baseSpawn:950, boss:{nombre:"Coloso de la Gran Mancha", hp:34, color:"#e0a86b", look:"guardian", deco:"bandas"} },

 { nombre:"Saturno", color:"#e8d59a", num:6, scene:"space", fondo:"saturno",
   autor:{nombre:"Christiaan Huygens", sello:"H"}, sub:"Diario de Christiaan Huygens",
   contexto:"Misión 6 · Saturno. Soy Christiaan Huygens. Galileo vio a Saturno con 'orejas' y no supo qué eran; con un telescopio mejor comprendí, en 1655, que lo rodea un anillo delgado y plano, y descubrí su luna Titán. Hoy se sabe que sus anillos son miles de millones de fragmentos de hielo y roca, y que Saturno es tan poco denso que flotaría en un océano suficientemente grande. Navega con cuidado entre los escombros.",
   dato:"Saturno es tan poco denso que flotaría en el agua; sus anillos son hielo y roca.",
   cierre:"Saturno queda atrás. Más allá, el siguiente mundo lo halló un músico que construía sus propios telescopios.",
   meta:22, baseSpawn:900, boss:{nombre:"Guardián de los Anillos", hp:38, color:"#efd98f", look:"guardian", deco:"anillo"} },

 { nombre:"Urano", color:"#8fd3d8", num:7, scene:"space", fondo:"urano",
   autor:{nombre:"William Herschel", sello:"W"}, sub:"Cuaderno de William Herschel",
   contexto:"Misión 7 · Urano. Soy William Herschel. En 1781, con un telescopio que construí yo mismo, vi un objeto que no era una estrella: al principio creí que era un cometa, pero resultó ser un planeta nuevo, el primero descubierto desde la Antigüedad. Es un gigante de hielo verde-azulado por el metano de su atmósfera, y lo más extraño es que gira acostado, con su eje inclinado casi 98°. El frío aquí es implacable.",
   dato:"Urano gira 'acostado', con su eje inclinado unos 98°.",
   cierre:"Urano queda atrás. Su órbita tenía irregularidades que nadie lograba explicar, y esas anomalías llevaron a un hallazgo asombroso.",
   meta:24, baseSpawn:870, boss:{nombre:"Centinela de Hielo", hp:42, color:"#9fe3e8", look:"guardian", deco:"cristal"} },

 { nombre:"Neptuno", color:"#3f5cd8", num:8, scene:"space", fondo:"neptuno",
   autor:{nombre:"Urbain Le Verrier", sello:"L"}, sub:"Cálculos de Urbain Le Verrier",
   contexto:"Misión 8 · Neptuno. Soy Urbain Le Verrier. Las irregularidades en la órbita de Urano sugerían que la gravedad de otro mundo lo estaba tirando. Con lápiz y papel calculé dónde debía estar (John Couch Adams llegó a un cálculo parecido) y, en 1846, un astrónomo apuntó su telescopio a ese punto y allí estaba: Neptuno. Es el planeta más ventoso, con vendavales de más de 2.000 km/h: un triunfo de las matemáticas.",
   dato:"Neptuno fue predicho matemáticamente antes de ser observado con telescopio.",
   cierre:"Neptuno queda atrás. Los planetas se acaban, pero el sistema solar no: más allá hay un anillo de mundos helados.",
   meta:26, baseSpawn:840, boss:{nombre:"Tempestad Azul", hp:46, color:"#5a72e6", look:"guardian", deco:"vortice"} },

 { nombre:"Cinturón de Kuiper", color:"#9a86c4", num:9, scene:"space", fondo:"kuiper",
   autor:{nombre:"Clyde Tombaugh", sello:"T"}, sub:"Notas de Clyde Tombaugh",
   contexto:"Misión 9 · Cinturón de Kuiper. Soy Clyde Tombaugh. En 1930 descubrí Plutón comparando placas fotográficas del cielo. Hoy se sabe que no está solo: forma parte del cinturón de Kuiper, un anillo helado de mundos pequeños y planetas enanos más allá de Neptuno, reliquia congelada de la formación del sistema solar. Dejas atrás los planetas conocidos.",
   dato:"El Cinturón de Kuiper alberga a Plutón y otros planetas enanos.",
   cierre:"Kuiper queda atrás. Solo falta la frontera: un lugar que nadie ha visto, pero que un astrónomo dedujo a partir de los cometas.",
   meta:28, baseSpawn:810, boss:{nombre:"Guardián Enano", hp:50, color:"#b19ad8", look:"guardian", deco:"espinas"} },

 { nombre:"Nube de Oort", color:"#c9d6ff", num:10, scene:"space", fondo:"oort",
   autor:{nombre:"Jan Oort", sello:"O"}, sub:"Hipótesis de Jan Oort",
   contexto:"Misión 10 · Nube de Oort. Soy Jan Oort. En 1950 propuse que los cometas de largo periodo llegan desde una inmensa cáscara esférica de cuerpos helados que envuelve el sistema solar. Nadie la ha observado directamente: es una hipótesis que explica lo que vemos. Aquí la influencia del Sol se desvanece. Es la frontera final: un último esfuerzo y alcanzarás el confín.",
   dato:"La Nube de Oort es una hipotética cáscara de cuerpos helados, origen probable de los cometas de largo periodo.",
   cierre:"Alcanzaste el confín del sistema solar. Pero para cruzarlo, el último guardián te pondrá a prueba: el examen final.",
   meta:30, baseSpawn:780, boss:{nombre:"El Cometa Ancestral", hp:60, color:"#d8e2ff", look:"guardian", deco:"cometa"} }
  ],
  preguntas:[
 {q:"En el modelo heliocéntrico de Copérnico y Galileo, ¿qué ocupa el centro?",o:["La Tierra","El Sol","La Luna","Júpiter"],c:1,e:"El heliocentrismo sitúa al Sol en el centro."},
 {q:"Galileo descubrió con su telescopio cuatro lunas girando en torno a…",o:["Marte","Saturno","Júpiter","Venus"],c:2,e:"Las 4 lunas galileanas orbitan Júpiter."},
 {q:"¿Qué observó Galileo en Venus que apoyaba el heliocentrismo?",o:["Anillos","Fases como las de la Luna","Volcanes","Lunas"],c:1,e:"Las fases de Venus solo se explican si gira alrededor del Sol."},
 {q:"¿Qué astrónomo propuso el modelo geocéntrico que dominó siglos?",o:["Copérnico","Ptolomeo","Newton","Kepler"],c:1,e:"Ptolomeo formalizó el geocentrismo."},
 {q:"Kepler descubrió, estudiando Marte, que las órbitas de los planetas son…",o:["Círculos perfectos","Elipses","Líneas rectas","Espirales"],c:1,e:"Los planetas orbitan en elipses, con el Sol en uno de sus focos."},
 {q:"La ley de gravitación universal que explica las órbitas la formuló…",o:["Newton","Galileo","Aristóteles","Hubble"],c:0,e:"Newton unificó caída y órbitas en una sola ley."},
 {q:"El planeta más cercano al Sol, con año de 88 días, es…",o:["Venus","Mercurio","Marte","La Tierra"],c:1,e:"Mercurio: el más cercano y veloz."},
 {q:"¿Por qué Venus es más caliente que Mercurio pese a estar más lejos?",o:["Su núcleo","Efecto invernadero","Gira rápido","Sus anillos"],c:1,e:"Su densa atmósfera de CO₂ atrapa el calor (>460 °C)."},
 {q:"El color rojizo de Marte se debe a…",o:["Lava activa","Óxido de hierro","Vegetación","Hielo teñido"],c:1,e:"El óxido de hierro le da su tono rojo."},
 {q:"Los anillos de Saturno son principalmente…",o:["Gas caliente","Hielo y roca","Metal fundido","Nubes"],c:1,e:"Partículas de hielo y roca."},
 {q:"Urano es peculiar porque…",o:["No tiene lunas","Gira 'acostado', con el eje muy inclinado","Es el más caliente","Tiene vida"],c:1,e:"Su eje está inclinado unos 98°."},
 {q:"Neptuno destaca en la historia porque…",o:["Se vio a simple vista primero","Fue predicho con cálculos","Tiene vida","Es el más cercano"],c:1,e:"Su posición se predijo antes de observarlo."},
 {q:"Plutón forma parte de…",o:["El cinturón de asteroides","El Cinturón de Kuiper","La Nube de Oort","Los anillos de Saturno"],c:1,e:"Es un planeta enano del Cinturón de Kuiper."},
 {q:"La Nube de Oort es el probable origen de…",o:["Asteroides del cinturón","Cometas de largo periodo","Auroras","Eclipses"],c:1,e:"Cáscara helada hipotética que rodea el sistema solar."}
  ]
},

/* ============================================================
   2 · CENTRO DE LA TIERRA — registro de descenso de Elena
   ============================================================ */
{
  id:"centro-tierra", titulo:"Viaje al Centro de la Tierra", subtitulo:"Las capas del planeta",
  vehiculo:"taladro", vehiculoFrase:"El taladro Verne-1 fue destruido", color:"#c9622e", icono:"⛏️",
  guia:{nombre:"Elena", sello:"E"},
  enemigos:{ meteoro:"un bloque de roca", alien:"una criatura de magma" },
  eventos:{ tormenta:"🪨 DERRUMBE DE ROCAS", oleada:"🔥 ENJAMBRE DE MAGMA" },
  finalBoss:{nombre:"El gran Profesor Felipe", hp:88, color:"#c9ccd6", look:"atomo_hierro", shot:"electron",
    autor:{nombre:"Elena", sello:"E"}, sub:"Registro de descenso · Elena",
    contexto:"Examen final. Estás en el centro de la Tierra, un corazón de hierro y níquel a 6.371 km de la superficie. Para volver arriba debes superar al último guardián: El gran Profesor Felipe, que aquí toma la forma del átomo de hierro (Fe), el elemento que domina el núcleo. Usa todo lo que aprendiste en cada capa."},
  epilogo:"Superaste el examen final y regresas a la superficie con una muestra de cada capa: litosfera rígida, astenosfera plástica, manto que fluye, núcleo externo líquido y núcleo interno sólido. Ahora sabes qué hay bajo tus pies. Julio Verne lo imaginó; tú lo comprendiste.",
  intro:{ narrador:"Elena, geóloga", sello:"E",
    texto:"Soy Elena, geóloga. Julio Verne imaginó este viaje; hoy lo hacemos con ciencia. Nuestro taladro experimental, el Verne-1, descenderá por las capas del planeta: la litosfera rígida, la astenosfera plástica, el manto incandescente y un núcleo de hierro, líquido por fuera y sólido por dentro. Cuanto más profundo, mayor el calor y la presión. En cada capa tomarás una muestra y deberás superar a su guardián, que enviará rocas y criaturas de magma para frenarte. Lleva la cuenta de tu profundidad: el centro está a 6.371 km." },
  worlds:[
    { nombre:"Litosfera", color:"#8a6a45", num:1, scene:"litosfera", fondo:"litosfera",
      autor:{nombre:"Elena", sello:"E"}, sub:"Registro de descenso · Elena",
      contexto:"Misión 1 · Litosfera (0 a ~100 km). Iniciamos el descenso por la capa externa, rígida y frágil: la corteza más la parte superior del manto. Es sólida y quebradiza, por eso se fractura en placas tectónicas. Toma tu primera muestra: la corteza continental es granítica (rica en silicio y aluminio) y la oceánica, basáltica (hierro y magnesio). Su guardián, el Tío Francisco, te arrojará rocas.",
      dato:"Litosfera: sólida y rígida, fragmentada en placas. Corteza continental granítica (Si, Al) y oceánica basáltica (Fe, Mg).",
      cierre:"Primera muestra tomada. Seguimos bajando: bajo la litosfera la roca ya no es tan rígida.",
      meta:12, baseSpawn:1180, boss:{nombre:"Tío Francisco", hp:16, color:"#b08a5a", look:"minero", shot:"roca"} },
    { nombre:"Astenosfera", color:"#c9622e", num:2, scene:"astenosfera", fondo:"astenosfera", cooling:true,
      autor:{nombre:"Elena", sello:"E"}, sub:"Registro de descenso · Elena",
      contexto:"Misión 2 · Astenosfera (desde ~100 km). La roca está aquí tan caliente, unos 1.300 °C, que aun siendo sólida fluye lentísimamente, como plastilina; sobre esta capa se deslizan las placas. Es peridotita, silicatos de magnesio y hierro. El calor aprieta: vigila la barra de temperatura y recoge el refrigerante ❄. El Tío Jorge lanza rocas semifundidas.",
      dato:"Astenosfera: roca sólida pero plástica a ~1300 °C. Es peridotita (silicatos de Mg y Fe). Su plasticidad mueve las placas.",
      cierre:"Segunda muestra tomada. Seguimos descendiendo: nos espera el manto, la capa más voluminosa del planeta.",
      meta:15, baseSpawn:1060, boss:{nombre:"Tío Jorge", hp:22, color:"#e0752e", look:"minero", shot:"roca_fuerte"} },
    { nombre:"Manto", color:"#e03a2e", num:3, scene:"manto", fondo:"manto", cooling:true,
      autor:{nombre:"Elena", sello:"E"}, sub:"Registro de descenso · Elena",
      contexto:"Misión 3 · Manto (hasta ~2.900 km). Es la capa más voluminosa del planeta: roca sólida y caliente que fluye por convección y arrastra los continentes. No es un océano de magma: el magma se forma solo en zonas puntuales. La temperatura llega a unos 3.500 °C, así que mantén vigilado el refrigerante. La Tía Sandra domina el magma.",
      dato:"Manto: roca sólida caliente que fluye por convección (no es líquido). Silicatos densos de Mg y Fe; hasta ~3500 °C.",
      cierre:"Tercera muestra tomada. Al final del manto cambia el material: de roca a metal. Entramos al núcleo.",
      meta:18, baseSpawn:960, boss:{nombre:"Tía Sandra", hp:28, color:"#ff5a2a", look:"minero", shot:"magma"} },
    { nombre:"Núcleo Externo", color:"#ff6a3a", num:4, scene:"nucleo_ext", fondo:"nucleo_ext", cooling:true,
      autor:{nombre:"Elena", sello:"E"}, sub:"Registro de descenso · Elena",
      contexto:"Misión 4 · Núcleo Externo (2.900 a 5.150 km). Un océano de hierro y níquel LÍQUIDOS a unos 4.000–5.000 °C. Su movimiento genera el campo magnético que nos protege: el geodinamo. El calor es extremo.",
      dato:"Núcleo externo: hierro y níquel líquidos a ~4000–5000 °C; su movimiento genera el campo magnético (geodinamo).",
      cierre:"Cuarta muestra tomada. Falta poco: más abajo la presión es tan grande que el metal vuelve a ser sólido.",
      meta:22, baseSpawn:890, boss:{nombre:"Geodinamo", hp:36, color:"#ff7b3a", look:"guardian", deco:"espinas", shot:"magma"} },
    { nombre:"Núcleo Interno", color:"#ffd0a0", num:5, scene:"nucleo_int", fondo:"nucleo_int", cooling:true,
      autor:{nombre:"Elena", sello:"E"}, sub:"Registro de descenso · Elena",
      contexto:"Misión 5 · Núcleo Interno (5.150 a 6.371 km). El corazón de la Tierra: hierro SÓLIDO pese a más de 5.000 °C, porque la presión inmensa impide que se funda. Estás por llegar al centro del planeta.",
      dato:"Núcleo interno: hierro SÓLIDO pese a ~5000–6000 °C; la presión gigantesca lo mantiene sólido. Es el centro de la Tierra.",
      cierre:"Llegaste al centro de la Tierra, a 6.371 km. Pero el último guardián custodia el secreto de este corazón de hierro: el examen final.",
      meta:26, baseSpawn:840, boss:{nombre:"Corazón Sólido", hp:44, color:"#ffe0b0", look:"guardian", deco:"cristal", shot:"electron"} }
  ],
  preguntas:[
    {q:"¿Orden correcto desde la superficie al centro?",o:["Núcleo, manto, corteza","Corteza, manto, núcleo","Manto, corteza, núcleo","Corteza, núcleo, manto"],c:1,e:"De afuera hacia adentro: corteza, manto y núcleo."},
    {q:"La litosfera se caracteriza por ser…",o:["Líquida y caliente","Rígida y fragmentada en placas","Gaseosa","Plástica y fluida"],c:1,e:"Es sólida y rígida; se quiebra en placas tectónicas."},
    {q:"La astenosfera se comporta como…",o:["Un gas","Un líquido puro","Un sólido plástico que fluye","Metal fundido"],c:2,e:"Roca sólida pero plástica: fluye muy lentamente."},
    {q:"El movimiento de las placas es posible gracias a…",o:["El viento","La plasticidad de la astenosfera","La Luna","Los volcanes"],c:1,e:"Las placas se deslizan sobre la astenosfera."},
    {q:"¿En qué estado está el manto en su mayor parte?",o:["Líquido","Gaseoso","Sólido caliente que fluye","Congelado"],c:2,e:"Roca sólida caliente que fluye por convección; NO es líquido."},
    {q:"El magma es…",o:["Roca fundida en zonas puntuales","Todo el manto","Agua caliente","Hierro sólido"],c:0,e:"Roca fundida; el manto es mayormente sólido."},
    {q:"La corteza continental es de tipo…",o:["Basáltica (Fe, Mg)","Granítica (Si, Al)","Metálica (Fe, Ni)","Calcárea"],c:1,e:"Granítica, rica en silicio y aluminio."},
    {q:"El núcleo EXTERNO está en estado…",o:["Sólido","Líquido (hierro y níquel)","Gaseoso","Plástico"],c:1,e:"Metal líquido: hierro y níquel."},
    {q:"El núcleo INTERNO es sólido pese al calor porque…",o:["Está frío","La presión lo mantiene sólido","No tiene metales","Está aislado"],c:1,e:"La presión altísima lo mantiene sólido."},
    {q:"El campo magnético terrestre se genera por…",o:["La atmósfera","El hierro líquido del núcleo externo","Los océanos","La corteza"],c:1,e:"El geodinamo: hierro líquido en movimiento."},
    {q:"Al descender hacia el centro, temperatura y presión…",o:["Disminuyen","Aumentan","Se mantienen","Se anulan"],c:1,e:"Ambas aumentan con la profundidad."},
    {q:"El principal metal del núcleo es…",o:["Aluminio","Hierro","Cobre","Plomo"],c:1,e:"Hierro (con níquel)."},
    {q:"La astenosfera está compuesta principalmente por…",o:["Granito","Peridotita (Mg, Fe)","Hielo","Basalto puro"],c:1,e:"Peridotita: silicatos de magnesio y hierro."}
  ]
},

/* ============================================================
   3 · VIAJE GALÁCTICO — el ciclo de vida de las estrellas
   ============================================================ */
{
  id:"viaje-galactico", titulo:"Viaje Galáctico", subtitulo:"Más allá del Sistema Solar",
  vehiculo:"nave", vehiculoFrase:"La nave Alejandría fue destruida", color:"#6a5cff", icono:"🌌",
  guia:{nombre:"Hipatia", sello:"H"},
  enemigos:{ meteoro:"un fragmento de cristal estelar", alien:"un platillo invasor" },
  eventos:{ tormenta:"☄ LLUVIA DE CRISTALES", oleada:"🛸 FLOTA INVASORA" },
  finalBoss:{nombre:"El gran Profesor Felipe", hp:82, color:"#6a5cff", look:"felipe", shot:"bolt",
    autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
    contexto:"Examen final. Recorriste el ciclo de las estrellas: su vecindario, su nacimiento, su juventud, su muerte y una galaxia vecina. El último guardián, El gran Profesor Felipe, custodia el camino de regreso y comprobará que comprendes lo que viste."},
  epilogo:"Superaste el examen final. Viste el vecindario del Sol, una guardería de estrellas, un cúmulo joven, el final de una estrella masiva y una galaxia vecina. Yo solo tenía ojos y astrolabio; tú viajaste. Sigue preguntando.",
  intro:{ narrador:"Hipatia de Alejandría", sello:"H",
    texto:"Soy Hipatia de Alejandría. Estudié los cielos con astrolabio y geometría, cuando el mundo apenas comprendía su tamaño. Te entrego la nave Alejandría, con instrumentos que ni imaginé. Seguiremos el ciclo de vida de las estrellas: partiremos del vecindario del Sol, visitaremos el lugar donde nacen, uno donde son jóvenes y otro donde mueren, y terminaremos en otra galaxia. En cada destino te espera un guardián que custodia ese saber. Vuela lejos, muy lejos." },
  worlds:[
    { nombre:"Alfa Centauri", color:"#ffd27a", num:1, scene:"galaxia", fondo:"alfa_centauri",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 1 · Alfa Centauri. Empezamos por el vecindario del Sol. Es el sistema estelar más cercano, a 4,3 años luz: la luz que ves salió hace más de cuatro años. Lo forman tres estrellas: dos que danzan juntas y una pequeña y roja, Próxima, la más cercana a nosotros.",
      dato:"Alfa Centauri es el sistema estelar más cercano, a unos 4,3 años luz.",
      cierre:"El vecindario queda atrás. Ahora vamos a un lugar donde la gravedad está encendiendo estrellas nuevas.",
      meta:12, baseSpawn:1180, boss:{nombre:"Centinela Estelar", hp:16, color:"#ffd27a", look:"guardian", deco:"espinas", shot:"bolt"} },
    { nombre:"Nebulosa de Orión", color:"#ff6bd0", num:2, scene:"galaxia", fondo:"orion",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 2 · Nebulosa de Orión. Aquí nacen las estrellas. Una nebulosa es una nube de gas y polvo donde la gravedad va juntando materia hasta encender nuevos soles. A simple vista se ve como una mancha difusa en la espada de Orión, a unos 1.300 años luz.",
      dato:"Las nebulosas son nubes de gas y polvo donde nacen las estrellas.",
      cierre:"Las estrellas que nacen juntas viajan unidas por un tiempo. Vamos a ver un cúmulo joven.",
      meta:15, baseSpawn:1060, boss:{nombre:"Guardián Nebular", hp:22, color:"#ff6bd0", look:"guardian", deco:"vortice", shot:"bolt"} },
    { nombre:"Cúmulo de las Pléyades", color:"#9fd0ff", num:3, scene:"galaxia", fondo:"pleyades",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 3 · Las Pléyades. Un cúmulo abierto de estrellas jóvenes, calientes y azuladas, nacidas juntas de la misma nube de gas hace unos cien millones de años. Se ven a simple vista como un pequeño racimo de luces.",
      dato:"Las Pléyades son un cúmulo de estrellas jóvenes nacidas de la misma nube de gas.",
      cierre:"Las estrellas jóvenes brillan con fuerza, pero ninguna es eterna. Veamos cómo mueren las más masivas.",
      meta:18, baseSpawn:960, boss:{nombre:"Señor del Cúmulo", hp:28, color:"#9fd0ff", look:"guardian", deco:"cristal", shot:"bolt"} },
    { nombre:"Agujero Negro", color:"#7a5cff", num:4, scene:"galaxia", fondo:"agujero_negro",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 4 · Agujero Negro. Cuando una estrella muy masiva agota su combustible, su núcleo colapsa y la gravedad dobla el espacio y el tiempo. Del agujero negro que queda no escapa ni la luz: más allá de su horizonte de sucesos no hay regreso.",
      dato:"Un agujero negro tiene gravedad tan intensa que ni la luz escapa de su horizonte.",
      cierre:"Dejas el abismo. Ahora, el salto final: salir de nuestra propia galaxia.",
      meta:22, baseSpawn:890, boss:{nombre:"Horizonte de Sucesos", hp:36, color:"#7a5cff", look:"guardian", deco:"anillo", shot:"bolt"} },
    { nombre:"Galaxia de Andrómeda", color:"#c8b0ff", num:5, scene:"galaxia", fondo:"andromeda",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 5 · Andrómeda. La galaxia grande más cercana a la nuestra, a 2,5 millones de años luz. Se acerca a la Vía Láctea y, dentro de unos 4.500 millones de años, ambas chocarán y se fusionarán.",
      dato:"Andrómeda es la galaxia grande más cercana; se acerca a la Vía Láctea.",
      cierre:"Cruzaste el abismo entre dos galaxias. Solo falta el examen final.",
      meta:26, baseSpawn:840, boss:{nombre:"Guardián de Andrómeda", hp:44, color:"#c8b0ff", look:"guardian", deco:"vortice", shot:"bolt"} }
  ],
  preguntas:[
    {q:"Un año luz es una medida de…",o:["Tiempo","Distancia","Temperatura","Masa"],c:1,e:"La distancia que la luz recorre en un año."},
    {q:"El sistema estelar más cercano al Sol es…",o:["Sirio","Alfa Centauri","Vega","Betelgeuse"],c:1,e:"Alfa Centauri, a ~4,3 años luz."},
    {q:"¿Cuántas estrellas componen el sistema Alfa Centauri?",o:["Una","Dos","Tres","Siete"],c:2,e:"Alfa Centauri A, B y Próxima Centauri."},
    {q:"En una nebulosa como la de Orión, principalmente…",o:["Mueren planetas","Nacen estrellas","Se forman océanos","Hay vida"],c:1,e:"Son nubes de gas donde nacen las estrellas."},
    {q:"Un cúmulo estelar es…",o:["Un grupo de estrellas nacidas juntas","Un planeta gigante","Una galaxia","Un cometa"],c:0,e:"Estrellas formadas de la misma nube, como las Pléyades."},
    {q:"Las estrellas de las Pléyades son…",o:["Viejas y rojas","Jóvenes y azuladas","Estrellas apagadas","Planetas"],c:1,e:"Son jóvenes, calientes y azuladas."},
    {q:"Nuestra galaxia se llama…",o:["Andrómeda","La Vía Láctea","El Grupo Local","Orión"],c:1,e:"Vivimos en la Vía Láctea."},
    {q:"De un agujero negro no puede escapar…",o:["El sonido","Ni la luz","El viento","El calor"],c:1,e:"Su gravedad es tan intensa que ni la luz escapa."},
    {q:"El límite de un agujero negro, desde el que nada vuelve, se llama…",o:["Corona","Horizonte de sucesos","Núcleo estelar","Órbita"],c:1,e:"El horizonte de sucesos."},
    {q:"Andrómeda es…",o:["Una estrella","La galaxia grande más cercana","Un planeta","Un cometa"],c:1,e:"La galaxia grande más cercana a la nuestra."},
    {q:"¿Qué ocurrirá con Andrómeda y la Vía Láctea en miles de millones de años?",o:["Se alejarán","Chocarán y se fusionarán","Se apagarán","Nada"],c:1,e:"Se acercan y terminarán fusionándose."}
  ]
},

/* ============================================================
   4 · CUERPO HUMANO — el camino del oxígeno
   ============================================================ */
{
  id:"cuerpo-humano", titulo:"Viaje al Cuerpo Humano", subtitulo:"Sistemas del organismo",
  vehiculo:"nanobot", vehiculoFrase:"El nanobot fue destruido", color:"#e0466a", icono:"🫀",
  guia:{nombre:"Dra. Marta", sello:"M"},
  enemigos:{ meteoro:"un coágulo", alien:"un patógeno" },
  eventos:{ tormenta:"🩸 CORRIENTE DE COÁGULOS", oleada:"🦠 OLEADA DE PATÓGENOS" },
  finalBoss:{nombre:"El gran Profesor Felipe", hp:82, color:"#e0466a", look:"felipe", shot:"bolt",
    autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
    contexto:"Examen final. Recorriste el cuerpo: pulmones, sangre, intestino, defensas y cerebro. El último guardián, El gran Profesor Felipe, aparece en el centro de mando para comprobar que comprendes cómo todos los sistemas trabajan juntos."},
  epilogo:"Superaste el examen final y recuperas tu tamaño. Seguiste el camino del oxígeno y viste cómo la respiración, la circulación, la digestión, las defensas y el sistema nervioso trabajan juntos. Cuidar el cuerpo empieza por conocerlo.",
  intro:{ narrador:"Dra. Marta", sello:"M",
    texto:"Soy la doctora Marta. Te he miniaturizado a un nanobot para seguir el camino del oxígeno por el cuerpo humano: entra por los pulmones, la sangre lo reparte junto con los nutrientes del intestino, las defensas protegen el viaje y el sistema nervioso lo coordina todo. Pero algo falla: coágulos, patógenos y obstrucciones se interponen. En cada sistema deberás superar a su guardián y entender cómo funciona. Un universo entero cabe bajo la piel." },
  worlds:[
    { nombre:"Sistema Respiratorio", color:"#3a9fd2", num:1, scene:"organismo", fondo:"respiratorio",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 1 · Respiratorio. Tu viaje empieza con una respiración: entras por la nariz, bajas por la tráquea y llegas a millones de alvéolos, donde el oxígeno pasa a la sangre y sale el dióxido de carbono. Cada respiración es un intercambio de gases. Un bronquio obstruido bloquea el paso.",
      dato:"En los alvéolos, el oxígeno entra a la sangre y sale el CO₂.",
      cierre:"El oxígeno ya está en la sangre. Sigámoslo: ella lo llevará a todo el cuerpo.",
      meta:12, baseSpawn:1180, boss:{nombre:"Bronquio Obstruido", hp:16, color:"#3a9fd2", look:"guardian", deco:"organico", shot:"bolt"} },
    { nombre:"Sistema Circulatorio", color:"#d23a4a", num:2, scene:"organismo", fondo:"circulatorio",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 2 · Circulatorio. Los glóbulos rojos cargados de oxígeno te arrastran por arterias y venas, impulsados por los latidos del corazón. La sangre lleva oxígeno y nutrientes a todo el cuerpo y recoge los desechos. Esquiva los coágulos que obstruyen el paso.",
      dato:"El corazón bombea sangre que lleva oxígeno y nutrientes a todo el cuerpo.",
      cierre:"La sangre también transporta nutrientes. ¿De dónde salen? Del sistema digestivo.",
      meta:15, baseSpawn:1060, boss:{nombre:"Trombo", hp:22, color:"#d23a4a", look:"guardian", deco:"organico", shot:"bolt"} },
    { nombre:"Sistema Digestivo", color:"#d98a3a", num:3, scene:"organismo", fondo:"digestivo",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 3 · Digestivo. Del estómago al intestino, los alimentos se descomponen en nutrientes que la sangre absorbe para dar energía al cuerpo; la mayor parte se absorbe en el intestino delgado. Cuidado con el ácido gástrico.",
      dato:"El sistema digestivo transforma los alimentos en nutrientes que la sangre absorbe.",
      cierre:"Oxígeno y nutrientes ya viajan por el cuerpo. Pero también pueden entrar intrusos: es hora de conocer las defensas.",
      meta:18, baseSpawn:960, boss:{nombre:"Ácido Gástrico", hp:28, color:"#d98a3a", look:"guardian", deco:"organico", shot:"bolt"} },
    { nombre:"Sistema Inmunológico", color:"#5ac47a", num:4, scene:"organismo", fondo:"inmunologico",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 4 · Inmunológico. El ejército del cuerpo: los glóbulos blancos detectan y destruyen virus y bacterias que intentan enfermarnos, y algunos producen anticuerpos. Los patógenos que ves a tu alrededor son justo lo que debes frenar.",
      dato:"Los glóbulos blancos defienden al cuerpo de virus y bacterias.",
      cierre:"Las defensas resisten. Falta el centro de mando que lo coordina todo: el sistema nervioso.",
      meta:22, baseSpawn:890, boss:{nombre:"Patógeno Invasor", hp:36, color:"#5ac47a", look:"guardian", deco:"organico", shot:"bolt"} },
    { nombre:"Sistema Nervioso", color:"#b46be0", num:5, scene:"organismo", fondo:"nervioso",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 5 · Nervioso. Autopistas de neuronas llevan impulsos eléctricos a gran velocidad y se comunican en las sinapsis. Aquí se piensa, se siente y se ordena: el centro de mando del cuerpo.",
      dato:"Las neuronas transmiten señales eléctricas que controlan el cuerpo.",
      cierre:"Llegaste al centro de mando. Solo falta el examen final.",
      meta:26, baseSpawn:840, boss:{nombre:"Cortocircuito", hp:44, color:"#b46be0", look:"guardian", deco:"vortice", shot:"bolt"} }
  ],
  preguntas:[
    {q:"El órgano que bombea la sangre es…",o:["El pulmón","El hígado","El corazón","El riñón"],c:2,e:"El corazón impulsa la sangre por el cuerpo."},
    {q:"¿Qué células transportan oxígeno?",o:["Glóbulos blancos","Glóbulos rojos","Plaquetas","Neuronas"],c:1,e:"Los glóbulos rojos llevan el oxígeno."},
    {q:"El intercambio de gases ocurre en…",o:["El estómago","Los alvéolos","El cerebro","Los músculos"],c:1,e:"En los alvéolos entra O₂ y sale CO₂."},
    {q:"El gas que la sangre deja en los alvéolos para ser exhalado es…",o:["Oxígeno","Dióxido de carbono","Nitrógeno","Hidrógeno"],c:1,e:"El CO₂, desecho del metabolismo celular."},
    {q:"El sistema digestivo transforma los alimentos en…",o:["Aire","Nutrientes","Sangre","Hormonas"],c:1,e:"Nutrientes que la sangre absorbe."},
    {q:"La mayor parte de los nutrientes se absorbe en el…",o:["Estómago","Intestino delgado","Esófago","Hígado"],c:1,e:"El intestino delgado absorbe la mayoría de los nutrientes."},
    {q:"¿Qué células defienden el cuerpo de infecciones?",o:["Glóbulos rojos","Glóbulos blancos","Plaquetas","Neuronas"],c:1,e:"Los glóbulos blancos son la defensa."},
    {q:"Las neuronas transmiten información mediante…",o:["Señales eléctricas","Aire","Sangre","Luz"],c:0,e:"Impulsos eléctricos."},
    {q:"Las neuronas se comunican entre sí en las…",o:["Sinapsis","Arterias","Vellosidades","Cuerdas vocales"],c:0,e:"La sinapsis es el punto de comunicación entre neuronas."},
    {q:"El sistema que controla y coordina el cuerpo es el…",o:["Digestivo","Nervioso","Óseo","Respiratorio"],c:1,e:"El sistema nervioso coordina todo."}
  ]
},

/* ============================================================
   5 · ECOSISTEMAS DE CHILE — de sur a norte
   ============================================================ */
{
  id:"ecosistemas", titulo:"Viaje por los Ecosistemas", subtitulo:"Ecosistemas de Chile",
  vehiculo:"jeep", vehiculoFrase:"El jeep fue destruido", color:"#4aa84a", icono:"🌿",
  guia:{nombre:"Antonia", sello:"A"},
  enemigos:{ meteoro:"una roca", alien:"una nube de contaminación" },
  eventos:{ tormenta:"🪨 DESPRENDIMIENTO DE ROCAS", oleada:"☁ NUBES TÓXICAS" },
  finalBoss:{nombre:"El gran Profesor Felipe", hp:80, color:"#4aa84a", look:"felipe", shot:"bolt",
    autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
    contexto:"Examen final. Recorriste Chile de sur a norte y viste que cada ecosistema es una red donde todo depende de todo. El último guardián, El gran Profesor Felipe, custodia esa red de la vida y comprobará que sabes qué la mantiene en equilibrio."},
  epilogo:"Superaste el examen final. Recorriste Chile de sur a norte: bosque, humedal, mar, altiplano y desierto. En cada uno viste cómo la vida se adapta y cómo todo depende de todo. Conocer los ecosistemas es el primer paso para cuidarlos.",
  intro:{ narrador:"Antonia, ecóloga", sello:"A",
    texto:"Soy Antonia, ecóloga. Súbete al jeep: recorreremos Chile de sur a norte —el bosque lluvioso, un humedal costero, el mar de Humboldt, el altiplano y el desierto más árido del mundo—. Cada ecosistema es una red viva donde todo depende de todo, y todos están amenazados por la contaminación: las nubes tóxicas que verás son su señal. En cada lugar deberás superar a su guardián y entender qué lo mantiene en equilibrio." },
  worlds:[
    { nombre:"Bosque Valdiviano", color:"#2f7a3a", num:1, scene:"ecosistema", fondo:"bosque",
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 1 · Bosque Valdiviano. Selva fría y húmeda del sur de Chile, con especies únicas como el alerce milenario. Aquí las plantas fabrican su alimento con la luz del sol y sostienen a todos los consumidores: son el primer eslabón de la cadena trófica.",
      dato:"En una cadena trófica, los productores (plantas) sostienen a los consumidores.",
      cierre:"Subimos hacia el norte, hasta donde el río se encuentra con el mar.",
      meta:12, baseSpawn:1180, boss:{nombre:"Guardián del Bosque", hp:16, color:"#2f7a3a", look:"guardian", deco:"hojas", shot:"bolt"} },
    { nombre:"Humedal Costero", color:"#3a86a8", num:2, scene:"ecosistema", fondo:"humedal",
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 2 · Humedal Costero. Donde el río se encuentra con el mar: un vivero de biodiversidad y descanso de aves migratorias. Filtra el agua y protege la costa. Frágil y vital.",
      dato:"Los humedales son cunas de biodiversidad y refugio de aves migratorias.",
      cierre:"Del humedal pasamos al mar abierto, donde una corriente fría sostiene la pesca.",
      meta:15, baseSpawn:1060, boss:{nombre:"Centinela del Humedal", hp:22, color:"#3a86a8", look:"guardian", deco:"hojas", shot:"bolt"} },
    { nombre:"Océano de Humboldt", color:"#2f6fa8", num:3, scene:"ecosistema", fondo:"oceano",
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 3 · Océano de Humboldt. Recorres la costa frente al mar. La corriente fría de Humboldt sube nutrientes del fondo y hace del mar chileno uno de los más productivos: fitoplancton, anchoveta, aves y lobos marinos.",
      dato:"La corriente de Humboldt, fría y rica en nutrientes, sostiene la pesca chilena.",
      cierre:"Dejamos la costa y subimos a los Andes, a más de 4.000 metros de altura.",
      meta:18, baseSpawn:960, boss:{nombre:"Guardián de Humboldt", hp:28, color:"#2f6fa8", look:"guardian", deco:"vortice", shot:"bolt"} },
    { nombre:"Altiplano Andino", color:"#c48a5a", num:4, scene:"ecosistema", fondo:"altiplano",
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 4 · Altiplano Andino. Alturas del norte: frío, poco oxígeno y salares. La vicuña y la llareta se adaptan a condiciones extremas.",
      dato:"En el altiplano andino la vida se adapta a la altura, el frío y la sequedad.",
      cierre:"Bajamos a la última prueba: el lugar más seco del planeta.",
      meta:22, baseSpawn:890, boss:{nombre:"Espíritu Andino", hp:36, color:"#c48a5a", look:"guardian", deco:"cristal", shot:"bolt"} },
    { nombre:"Desierto de Atacama", color:"#d9a24a", num:5, scene:"ecosistema", fondo:"atacama", cooling:true,
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 5 · Desierto de Atacama. El lugar más árido del planeta: en algunas zonas pasan años sin que caiga una gota. La vida sobrevive con poquísima agua bajo un sol implacable: vigila el calor del jeep y recoge el refrigerante ❄.",
      dato:"El desierto de Atacama es el más árido del mundo; la vida se adapta al agua escasa.",
      cierre:"Recorriste Chile de sur a norte. Solo falta el examen final.",
      meta:26, baseSpawn:840, boss:{nombre:"Espíritu del Desierto", hp:44, color:"#d9a24a", look:"guardian", deco:"espinas", shot:"bolt"} }
  ],
  preguntas:[
    {q:"En una cadena trófica, los productores son…",o:["Los depredadores","Las plantas","Los hongos","Los carnívoros"],c:1,e:"Las plantas producen su alimento y sostienen la cadena."},
    {q:"Las plantas fabrican su alimento mediante…",o:["Respiración","Fotosíntesis","Digestión","Combustión"],c:1,e:"La fotosíntesis usa luz para producir alimento."},
    {q:"Un animal que come plantas es un…",o:["Productor","Consumidor","Descomponedor","Mineral"],c:1,e:"Es un consumidor (herbívoro)."},
    {q:"Los hongos y bacterias que descomponen restos orgánicos son…",o:["Productores","Consumidores","Descomponedores","Depredadores"],c:2,e:"Los descomponedores reciclan la materia orgánica."},
    {q:"Los humedales son importantes porque…",o:["Son desiertos","Albergan biodiversidad y aves migratorias","No tienen agua","Carecen de plantas"],c:1,e:"Son cunas de biodiversidad y refugio de aves."},
    {q:"Un ecosistema con muchas especies tiene alta…",o:["Aridez","Biodiversidad","Altitud","Salinidad"],c:1,e:"Biodiversidad es la variedad de seres vivos."},
    {q:"La corriente de Humboldt hace el mar chileno muy…",o:["Cálido y pobre","Frío y productivo","Dulce","Seco"],c:1,e:"Fría y rica en nutrientes: gran productividad pesquera."},
    {q:"Una cadena trófica marina parte con…",o:["Los lobos marinos","El fitoplancton","Las aves","Las ballenas"],c:1,e:"El fitoplancton produce alimento con la luz del sol."},
    {q:"En el altiplano, los seres vivos se adaptan sobre todo a…",o:["El exceso de agua","La altura y el frío","La oscuridad","La sal marina"],c:1,e:"Altura, frío y aire con poco oxígeno."},
    {q:"El desierto más árido del mundo está en…",o:["Chile (Atacama)","Sahara","Gobi","Australia"],c:0,e:"El desierto de Atacama, norte de Chile."}
  ]
}

];
