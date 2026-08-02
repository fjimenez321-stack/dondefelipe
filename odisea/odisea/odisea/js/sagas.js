/* ============================================================
   ODISEA CÓSMICA · sagas.js
   SAGAS — cada campaña es una disciplina con su vehículo, sus
   mundos y sus preguntas. El motor es el mismo para todas.
   Para agregar una saga: añade un objeto a OC.Sagas.
   Campos de saga: id, titulo, subtitulo, vehiculo
     ('nave'|'taladro'|'nanobot'|'jeep'), color, icono,
     intro:{narrador,sello,texto}, worlds:[...], preguntas:[...]
   ============================================================ */
window.OC = window.OC || {};
OC.Sagas = [

/* ===== SAGA 1 · SISTEMA SOLAR (nave) ===== */
{
  id:"sistema-solar", titulo:"Odisea Cósmica", subtitulo:"El Sistema Solar",
  finalBoss:{nombre:"El gran Profesor Felipe", hp:78, color:"#c8a24b", look:"felipe", shot:"bolt"},
  vehiculo:"nave", color:"#c8a24b", icono:"🪐",
  intro:{ narrador:"Galileo Galilei", sello:"G",
    texto:"Hola, soy Galileo. Escribo para las futuras generaciones que exploren lo que yo apenas comencé. Con mi anteojo vi montañas en la Luna y lunas girando en torno a Júpiter, y comprendí que somos nosotros quienes giramos alrededor del Sol. Te entrego mi nave: viaja desde Mercurio hasta la Nube de Oort. El verdadero explorador no solo navega, comprende." },
  worlds:[


 { nombre:"Mercurio", color:"#b8b0a0", num:1, scene:"mercurio",
   autor:{nombre:"Galileo", sello:"G"},
   sub:"Bitácora de Galileo",
   contexto:"Misión 1 · Mercurio. El mensajero de los dioses y el más veloz de todos: completa su órbita en apenas 88 días. No posee atmósfera que lo abrigue, así que su superficie es un desierto de cráteres golpeado por meteoritos y por el fuego del Sol cercano. Mirar de cerca al Sol siempre ha sido peligroso… yo lo sé bien. Despeja el camino y enfréntate a su guardián.",
   dato:"Mercurio no tiene atmósfera y su año dura solo 88 días.",
   meta:12, baseSpawn:1200, boss:{nombre:"Profesor Alex", hp:16, color:"#d9d2c2", look:"birrete", shot:"bolt"} },

 { nombre:"Venus", color:"#e0a648", num:2, scene:"venus", cooling:true,
   autor:{nombre:"Nicolás Copérnico", sello:"C"},
   sub:"Manuscrito de Nicolás Copérnico",
   contexto:"Misión 2 · Venus. Escribo yo, Nicolás Copérnico, que me atreví a mover la Tierra de su trono y poner al Sol en el centro. Contempla a Venus, el lucero del alba: brilla tanto que muchos lo tomaron por estrella. Bajo su velo de nubes esconde un infierno, pues un efecto invernadero desbocado eleva su calor sobre los 460 °C —más que Mercurio—. Aquí el calor es tu verdadero enemigo: el casco de tu nave se recalienta sin descanso. Vigila la barra de TEMPERATURA y recoge las cápsulas de refrigerante ❄ para enfriarla; si llega al máximo, la nave se funde. Al final te espera su guardián, el Profesor Carlos.",
   dato:"En Venus el efecto invernadero supera los 460 °C, más caliente que Mercurio.",
   meta:14, baseSpawn:1100, boss:{nombre:"Profesor Carlos", hp:22, color:"#f0d3ac", look:"calvo", shot:"nota"} },

 { nombre:"Tierra", color:"#4d9de0", num:3, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 3 · Tierra. Nuestro hogar, el punto azul pálido suspendido en un rayo de sol. El único mundo conocido con océanos líquidos y vida. Desde aquí desafié la idea de que fuéramos el centro inmóvil del cosmos; desde aquí tú continúas el viaje.",
   dato:"La Tierra es el único mundo conocido con vida y agua líquida.",
   meta:16, baseSpawn:1050, boss:{nombre:"Guardián Azul", hp:26, color:"#5bb0ff"} },

 { nombre:"Marte", color:"#d1603a", num:4, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 4 · Marte. El planeta rojo, teñido por el óxido de hierro de su suelo. Alberga a Olympus Mons, el volcán más alto del sistema solar, y guarda huellas de antiguos cauces de agua. Ábrete paso entre sus tormentas herrumbrosas.",
   dato:"El color rojo de Marte proviene del óxido de hierro de su superficie.",
   meta:18, baseSpawn:1000, boss:{nombre:"Ares, Señor Rojo", hp:30, color:"#ff6a44"} },

 { nombre:"Júpiter", color:"#d8a16b", num:5, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 5 · Júpiter. El gigante: cabrían más de mil Tierras en su interior. Su Gran Mancha Roja es una tormenta más ancha que nuestro mundo. Aquí vi por primera vez cuatro lunas girando a su alrededor —Ío, Europa, Ganímedes y Calisto—: la prueba de que no todo giraba en torno a la Tierra.",
   dato:"Galileo descubrió las 4 lunas mayores de Júpiter, hoy llamadas galileanas.",
   meta:20, baseSpawn:950, boss:{nombre:"Coloso de la Gran Mancha", hp:34, color:"#e0a86b"} },

 { nombre:"Saturno", color:"#e8d59a", num:6, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 6 · Saturno. El señor de los anillos, formados por miles de millones de fragmentos de hielo y roca. Es tan poco denso que flotaría en un océano suficientemente grande. Navega con cuidado entre los escombros de sus anillos.",
   dato:"Saturno es tan poco denso que flotaría en el agua; sus anillos son hielo y roca.",
   meta:22, baseSpawn:900, boss:{nombre:"Guardián de los Anillos", hp:38, color:"#efd98f"} },

 { nombre:"Urano", color:"#8fd3d8", num:7, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 7 · Urano. Un gigante de hielo verde-azulado por el metano de su atmósfera. Lo más extraño: gira acostado, con su eje inclinado casi 98°, como si rodara de lado por su órbita. El frío aquí es implacable.",
   dato:"Urano gira 'acostado', con su eje inclinado unos 98°.",
   meta:24, baseSpawn:870, boss:{nombre:"Centinela de Hielo", hp:42, color:"#9fe3e8"} },

 { nombre:"Neptuno", color:"#3f5cd8", num:8, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 8 · Neptuno. El más ventoso, con vendavales sobre 2.000 km/h. Su hallazgo fue un triunfo de las matemáticas: primero se predijo su posición con lápiz y papel a partir de las anomalías de Urano, y solo después el telescopio lo confirmó.",
   dato:"Neptuno fue predicho matemáticamente antes de ser observado con telescopio.",
   meta:26, baseSpawn:840, boss:{nombre:"Tempestad Azul", hp:46, color:"#5a72e6"} },

 { nombre:"Cinturón de Kuiper", color:"#9a86c4", num:9, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 9 · Cinturón de Kuiper. Más allá de Neptuno se abre un anillo helado de mundos pequeños y planetas enanos, entre ellos Plutón. Reliquia congelada de la formación del sistema solar. Dejas atrás los planetas conocidos.",
   dato:"El Cinturón de Kuiper alberga a Plutón y otros planetas enanos.",
   meta:28, baseSpawn:810, boss:{nombre:"Guardián Enano", hp:50, color:"#b19ad8"} },

 { nombre:"Nube de Oort", color:"#c9d6ff", num:10, scene:"space",
   autor:{nombre:"Galileo", sello:"G"}, sub:"Bitácora de Galileo",
   contexto:"Misión 10 · Nube de Oort. La frontera final: una inmensa cáscara esférica de cuerpos helados que envuelve el sistema solar y de donde llegan los cometas de largo periodo. Aquí la influencia del Sol se desvanece. Un último esfuerzo: alcanza el confín.",
   dato:"La Nube de Oort es la frontera del sistema solar y origen de cometas de largo periodo.",
   meta:30, baseSpawn:780, boss:{nombre:"El Cometa Ancestral", hp:60, color:"#d8e2ff"} }
  ],
  preguntas:[


 {q:"En el modelo heliocéntrico de Copérnico y Galileo, ¿qué ocupa el centro?",o:["La Tierra","El Sol","La Luna","Júpiter"],c:1,e:"El heliocentrismo sitúa al Sol en el centro."},
 {q:"Galileo descubrió con su telescopio cuatro lunas girando en torno a…",o:["Marte","Saturno","Júpiter","Venus"],c:2,e:"Las 4 lunas galileanas orbitan Júpiter."},
 {q:"El 'corrimiento al rojo' (efecto Doppler) en galaxias lejanas indica que…",o:["se acercan","están quietas","se alejan","emiten sonido"],c:2,e:"El redshift indica alejamiento: base de la expansión del universo."},
 {q:"¿Qué astrónomo propuso el modelo geocéntrico que dominó siglos?",o:["Copérnico","Ptolomeo","Newton","Kepler"],c:1,e:"Ptolomeo formalizó el geocentrismo."},
 {q:"La ley de gravitación universal que explica las órbitas la formuló…",o:["Newton","Galileo","Aristóteles","Hubble"],c:0,e:"Newton unificó caída y órbitas en una sola ley."},
 {q:"El planeta más cercano al Sol, con año de 88 días, es…",o:["Venus","Mercurio","Marte","La Tierra"],c:1,e:"Mercurio: el más cercano y veloz."},
 {q:"¿Por qué Venus es más caliente que Mercurio pese a estar más lejos?",o:["Su núcleo","Efecto invernadero","Gira rápido","Sus anillos"],c:1,e:"Su densa atmósfera de CO₂ atrapa el calor (>460 °C)."},
 {q:"El color rojizo de Marte se debe a…",o:["Lava activa","Óxido de hierro","Vegetación","Hielo teñido"],c:1,e:"El óxido de hierro le da su tono rojo."},
 {q:"La expansión del universo se describe mejor como…",o:["Planetas que huyen del Sol","El espacio que se expande","La Luna alejándose","Ilusión óptica"],c:1,e:"Es la expansión del espacio entre galaxias."},
 {q:"Neptuno destaca en la historia porque…",o:["Se vio a simple vista primero","Fue predicho con cálculos","Tiene vida","Es el más cercano"],c:1,e:"Su posición se predijo antes de observarlo."},
 {q:"Los anillos de Saturno son principalmente…",o:["Gas caliente","Hielo y roca","Metal fundido","Nubes"],c:1,e:"Partículas de hielo y roca."},
 {q:"La Nube de Oort es el origen de…",o:["Asteroides del cinturón","Cometas de largo periodo","Auroras","Eclipses"],c:1,e:"Cáscara helada que rodea el sistema solar."}
  ]
},

/* ===== SAGA 2 · VIAJE AL CENTRO DE LA TIERRA (taladro) ===== */
{
  id:"centro-tierra", titulo:"Viaje al Centro de la Tierra", subtitulo:"Las capas del planeta",
  finalBoss:{nombre:"El gran Profesor Felipe", hp:88, color:"#c9ccd6", look:"atomo_hierro", shot:"electron"},
  vehiculo:"taladro", color:"#c9622e", icono:"⛏️",
  intro:{ narrador:"Elena, geóloga", sello:"E",
    texto:"Soy Elena, geóloga. Bajo tus pies el planeta está hecho de capas con distinta física y química: la litosfera rígida que se quiebra en placas, la astenosfera que fluye como plastilina caliente, y un manto incandescente. Prepara tu taladro; cada capa esconde a su guardián. Desciende con cuidado: cuanto más profundo, mayor el calor y la presión." },
  worlds:[
    { nombre:"Litosfera", color:"#8a6a45", num:1, scene:"litosfera",
      autor:{nombre:"Elena", sello:"E"}, sub:"Bitácora de Elena",
      contexto:"Misión 1 · Litosfera. La capa externa rígida y frágil: la corteza más la parte superior del manto. Es sólida y quebradiza, por eso se fractura en placas tectónicas cuyos choques causan terremotos. Su guardián, el Tío Francisco, te arrojará rocas. Perfora entre las fracturas.",
      dato:"Litosfera: sólida y rígida, fragmentada en placas. La corteza continental es granítica (rica en Si y Al) y la oceánica, basáltica (rica en Fe y Mg). Espesor ~0–100 km.",
      meta:12, baseSpawn:1200, boss:{nombre:"Tío Francisco", hp:16, color:"#b08a5a", look:"minero", shot:"roca"} },
    { nombre:"Astenosfera", color:"#c9622e", num:2, scene:"astenosfera", cooling:true,
      autor:{nombre:"Elena", sello:"E"}, sub:"Bitácora de Elena",
      contexto:"Misión 2 · Astenosfera. Parte del manto superior que NO es líquida: es roca sólida pero plástica (dúctil), que fluye lentísimamente como plastilina caliente. Sobre ella se deslizan las placas. El calor aprieta: vigila la temperatura del taladro. El Tío Jorge lanza rocas semifundidas, más poderosas.",
      dato:"Astenosfera: roca sólida pero plástica (~1–5% fundida) a ~1300 °C. Es peridotita: silicatos de magnesio y hierro (olivino, piroxeno). Su plasticidad permite el movimiento de placas.",
      meta:16, baseSpawn:1000, boss:{nombre:"Tío Jorge", hp:24, color:"#e0752e", look:"minero", shot:"roca_fuerte"} },
    { nombre:"Manto", color:"#e03a2e", num:3, scene:"manto", cooling:true,
      autor:{nombre:"Elena", sello:"E"}, sub:"Bitácora de Elena",
      contexto:"Misión 3 · Manto. La capa más gruesa: roca sólida y caliente que fluye por convección, arrastrando los continentes. El magma —roca fundida— se forma solo en zonas puntuales y alimenta los volcanes. Más allá late el núcleo de hierro. La Tía Sandra domina el magma. Este es el corazón del viaje.",
      dato:"Manto: roca sólida caliente que fluye por convección (no es líquido). Silicatos densos de Mg y Fe (bridgmanita); hasta ~3500–4000 °C cerca del núcleo. El magma es líquido solo en zonas puntuales.",
      meta:20, baseSpawn:900, boss:{nombre:"Tía Sandra", hp:30, color:"#ff5a2a", look:"minero", shot:"magma"} }
  ],
  preguntas:[
    {q:"La litosfera se caracteriza por ser…",o:["Líquida y caliente","Rígida y fragmentada en placas","Gaseosa","Plástica y fluida"],c:1,e:"La litosfera es sólida y rígida; se quiebra en placas tectónicas."},
    {q:"La astenosfera, a diferencia de la litosfera, se comporta como…",o:["Un gas","Un líquido puro","Un sólido plástico que fluye","Metal fundido"],c:2,e:"Es roca sólida pero plástica: fluye muy lentamente."},
    {q:"El movimiento de las placas tectónicas es posible gracias a…",o:["El viento","La plasticidad de la astenosfera","La gravedad de la Luna","El magma de los volcanes"],c:1,e:"Las placas se deslizan sobre la astenosfera, que fluye."},
    {q:"¿En qué estado está el manto en su mayor parte?",o:["Líquido","Gaseoso","Sólido caliente que fluye","Congelado"],c:2,e:"Es roca sólida caliente que fluye por convección; NO es líquido."},
    {q:"El magma es…",o:["Roca fundida que se forma en zonas puntuales","Todo el manto","Agua caliente","Hierro sólido"],c:0,e:"El magma es roca fundida; el manto es mayormente sólido."},
    {q:"La corteza continental es principalmente de tipo…",o:["Basáltica (Fe, Mg)","Granítica (Si, Al)","Metálica (Fe, Ni)","Calcárea"],c:1,e:"La corteza continental es granítica, rica en silicio y aluminio."},
    {q:"El núcleo EXTERNO de la Tierra está en estado…",o:["Sólido","Líquido (hierro y níquel fundidos)","Gaseoso","Plástico"],c:1,e:"El núcleo externo es metal líquido: hierro y níquel."},
    {q:"El núcleo INTERNO es sólido pese al enorme calor porque…",o:["Está frío","La presión gigantesca lo mantiene sólido","No tiene metales","Está aislado"],c:1,e:"La presión altísima mantiene el hierro sólido pese a los ~5000 °C."},
    {q:"El campo magnético terrestre se genera por…",o:["La atmósfera","El movimiento del hierro líquido del núcleo externo","Los océanos","La corteza"],c:1,e:"El giro del hierro líquido del núcleo externo actúa como geodinamo."},
    {q:"Al descender hacia el centro de la Tierra, la temperatura y la presión…",o:["Disminuyen","Aumentan","Se mantienen iguales","Se vuelven cero"],c:1,e:"Ambas aumentan con la profundidad."},
    {q:"El principal metal del núcleo terrestre es…",o:["Aluminio","Hierro","Cobre","Plomo"],c:1,e:"El núcleo es sobre todo hierro (con níquel)."},
    {q:"La astenosfera está compuesta principalmente por…",o:["Granito","Peridotita (silicatos de Mg y Fe)","Hielo","Basalto puro"],c:1,e:"Peridotita: rica en silicatos de magnesio y hierro."}
  ]
},

/* ===== SAGA 3 · VIAJE GALÁCTICO (nave) ===== */
{
  id:"viaje-galactico", titulo:"Viaje Galáctico", subtitulo:"Más allá del Sistema Solar",
  finalBoss:{nombre:"El gran Profesor Felipe", hp:80, color:"#6a5cff", look:"felipe", shot:"bolt"},
  vehiculo:"nave", color:"#6a5cff", icono:"🌌",
  intro:{ narrador:"Hipatia de Alejandría", sello:"H",
    texto:"Soy Hipatia de Alejandría. Estudié los cielos cuando el mundo apenas comprendía su tamaño. Más allá de nuestro Sol hay miles de millones de estrellas, nubes donde nacen soles y abismos de los que ni la luz escapa. Vuela lejos, muy lejos, y no temas a lo inmenso." },
  worlds:[
    { nombre:"Alfa Centauri", color:"#ffd27a", num:1, scene:"galaxia",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 1 · Alfa Centauri. El sistema estelar más cercano, a 4,3 años luz: la luz que ves salió hace más de cuatro años. Tres estrellas danzan juntas en el vecindario del Sol.",
      dato:"Alfa Centauri es el sistema estelar más cercano, a unos 4,3 años luz.",
      meta:14, baseSpawn:1100, boss:{nombre:"Centinela Estelar", hp:18, color:"#ffd27a", look:"guardian", shot:"bolt"} },
    { nombre:"Nebulosa de Orión", color:"#ff6bd0", num:2, scene:"galaxia",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 2 · Nebulosa de Orión. Una guardería de estrellas: inmensas nubes de gas y polvo donde la gravedad enciende nuevos soles. Cuna, y no tumba, del cosmos.",
      dato:"Las nebulosas son nubes de gas y polvo donde nacen las estrellas.",
      meta:18, baseSpawn:950, boss:{nombre:"Guardián Nebular", hp:26, color:"#ff6bd0", look:"guardian", shot:"bolt"} },
    { nombre:"Agujero Negro", color:"#7a5cff", num:3, scene:"galaxia",
      autor:{nombre:"Hipatia", sello:"H"}, sub:"Notas de Hipatia",
      contexto:"Misión 3 · Agujero Negro. Donde una estrella masiva colapsó, la gravedad dobla el espacio y el tiempo. Cruzar su horizonte de sucesos es no volver jamás. Mantén tu distancia.",
      dato:"Un agujero negro tiene gravedad tan intensa que ni la luz escapa de su horizonte.",
      meta:22, baseSpawn:850, boss:{nombre:"Horizonte de Sucesos", hp:34, color:"#7a5cff", look:"guardian", shot:"bolt"} }
  ],
  preguntas:[
    {q:"Un año luz es una medida de…",o:["Tiempo","Distancia","Temperatura","Masa"],c:1,e:"Es la distancia que la luz recorre en un año."},
    {q:"El sistema estelar más cercano al Sol es…",o:["Sirio","Alfa Centauri","Vega","Betelgeuse"],c:1,e:"Alfa Centauri, a unos 4,3 años luz."},
    {q:"En una nebulosa como la de Orión, principalmente…",o:["Mueren planetas","Nacen estrellas","Se forman océanos","Hay vida"],c:1,e:"Son nubes de gas donde nacen las estrellas."},
    {q:"Nuestra galaxia se llama…",o:["Andrómeda","La Vía Láctea","El Grupo Local","Orión"],c:1,e:"Vivimos en la galaxia Vía Láctea."},
    {q:"De un agujero negro no puede escapar…",o:["El sonido","Ni la luz","El viento","El calor"],c:1,e:"Su gravedad es tan intensa que ni la luz escapa."}
  ]
},

/* ===== SAGA 4 · VIAJE AL CUERPO HUMANO (nanobot) ===== */
{
  id:"cuerpo-humano", titulo:"Viaje al Cuerpo Humano", subtitulo:"Sistemas del organismo",
  finalBoss:{nombre:"El gran Profesor Felipe", hp:80, color:"#e0466a", look:"felipe", shot:"bolt"},
  vehiculo:"nanobot", color:"#e0466a", icono:"🫀",
  intro:{ narrador:"Dra. Marta", sello:"M",
    texto:"Soy la doctora Marta. Te he miniaturizado a un nanobot para viajar por el cuerpo humano: ríos de sangre, bosques de neuronas y ejércitos que nos defienden. Un universo entero cabe bajo la piel. Cuida tu nanobot en el camino." },
  worlds:[
    { nombre:"Sistema Circulatorio", color:"#d23a4a", num:1, scene:"organismo",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 1 · Sistema Circulatorio. Navegas por arterias y venas empujado por los latidos del corazón. Los glóbulos rojos transportan oxígeno a cada célula; esquiva los coágulos.",
      dato:"El corazón bombea sangre que lleva oxígeno y nutrientes a todo el cuerpo.",
      meta:12, baseSpawn:1100, boss:{nombre:"Trombo", hp:18, color:"#ff4d5a", look:"guardian", shot:"bolt"} },
    { nombre:"Sistema Respiratorio", color:"#3a9fd2", num:2, scene:"organismo",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 2 · Sistema Respiratorio. En millones de alvéolos pulmonares, el aire entrega oxígeno a la sangre y recoge dióxido de carbono. Cada respiración es un intercambio de gases.",
      dato:"En los alvéolos, el oxígeno entra a la sangre y sale el CO₂.",
      meta:16, baseSpawn:1000, boss:{nombre:"Bronquio Obstruido", hp:24, color:"#4db0e0", look:"guardian", shot:"bolt"} },
    { nombre:"Sistema Nervioso", color:"#b46be0", num:3, scene:"organismo",
      autor:{nombre:"Dra. Marta", sello:"M"}, sub:"Bitácora de la Dra. Marta",
      contexto:"Misión 3 · Sistema Nervioso. Autopistas de neuronas llevan impulsos eléctricos a gran velocidad. Aquí se piensa, se siente y se ordena todo el cuerpo. El centro de mando.",
      dato:"Las neuronas transmiten señales eléctricas que controlan el cuerpo.",
      meta:20, baseSpawn:900, boss:{nombre:"Cortocircuito", hp:30, color:"#c47bff", look:"guardian", shot:"bolt"} }
  ],
  preguntas:[
    {q:"El órgano que bombea la sangre es…",o:["El pulmón","El hígado","El corazón","El riñón"],c:2,e:"El corazón impulsa la sangre por todo el cuerpo."},
    {q:"¿Qué células de la sangre transportan oxígeno?",o:["Glóbulos blancos","Glóbulos rojos","Plaquetas","Neuronas"],c:1,e:"Los glóbulos rojos llevan el oxígeno."},
    {q:"El intercambio de gases ocurre en…",o:["El estómago","Los alvéolos","El cerebro","Los músculos"],c:1,e:"En los alvéolos entra O₂ y sale CO₂."},
    {q:"Las neuronas transmiten información mediante…",o:["Señales eléctricas","Aire","Sangre","Luz"],c:0,e:"Transmiten impulsos eléctricos."},
    {q:"El sistema que controla y coordina el cuerpo es el…",o:["Digestivo","Nervioso","Óseo","Respiratorio"],c:1,e:"El sistema nervioso coordina todo el organismo."}
  ]
},

/* ===== SAGA 5 · VIAJE POR LOS ECOSISTEMAS (jeep) ===== */
{
  id:"ecosistemas", titulo:"Viaje por los Ecosistemas", subtitulo:"Ecosistemas de Chile",
  finalBoss:{nombre:"El gran Profesor Felipe", hp:78, color:"#4aa84a", look:"felipe", shot:"bolt"},
  vehiculo:"jeep", color:"#4aa84a", icono:"🌿",
  intro:{ narrador:"Antonia, ecóloga", sello:"A",
    texto:"Soy Antonia, ecóloga. Súbete al jeep: recorreremos los ecosistemas de Chile, del bosque lluvioso del sur al desierto más árido del mundo. Cada uno es una red viva donde todo depende de todo. Observa, y no rompas el equilibrio." },
  worlds:[
    { nombre:"Bosque Valdiviano", color:"#2f7a3a", num:1, scene:"ecosistema",
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 1 · Bosque Valdiviano. Selva fría y húmeda del sur de Chile, densa y verde, con especies únicas como el alerce milenario. Productores y consumidores en delicado equilibrio.",
      dato:"En una cadena trófica, los productores (plantas) sostienen a los consumidores.",
      meta:12, baseSpawn:1150, boss:{nombre:"Guardián del Bosque", hp:16, color:"#3f9a4a", look:"guardian", shot:"bolt"} },
    { nombre:"Desierto de Atacama", color:"#d9a24a", num:2, scene:"ecosistema", cooling:true,
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 2 · Desierto de Atacama. El lugar más árido del planeta. La vida sobrevive con poquísima agua bajo un sol implacable: vigila el calor del jeep y usa el refrigerante.",
      dato:"El desierto de Atacama es el más árido del mundo; la vida se adapta al agua escasa.",
      meta:16, baseSpawn:1000, boss:{nombre:"Espíritu del Desierto", hp:24, color:"#e0b05a", look:"guardian", shot:"bolt"} },
    { nombre:"Humedal Costero", color:"#3a86a8", num:3, scene:"ecosistema",
      autor:{nombre:"Antonia", sello:"A"}, sub:"Bitácora de Antonia",
      contexto:"Misión 3 · Humedal Costero. Donde el río se encuentra con el mar: un vivero de biodiversidad y descanso de aves migratorias. Frágil, y vital para el equilibrio de la costa.",
      dato:"Los humedales son cunas de biodiversidad y refugio de aves migratorias.",
      meta:20, baseSpawn:950, boss:{nombre:"Centinela del Humedal", hp:30, color:"#4aa0c0", look:"guardian", shot:"bolt"} }
  ],
  preguntas:[
    {q:"En una cadena trófica, los productores son…",o:["Los depredadores","Las plantas","Los hongos","Los carnívoros"],c:1,e:"Las plantas producen su alimento y sostienen la cadena."},
    {q:"Las plantas fabrican su alimento mediante…",o:["Respiración","Fotosíntesis","Digestión","Combustión"],c:1,e:"La fotosíntesis usa luz para producir alimento."},
    {q:"El desierto más árido del mundo está en…",o:["Chile (Atacama)","Sahara","Gobi","Australia"],c:0,e:"El desierto de Atacama, en el norte de Chile."},
    {q:"Un ecosistema con gran variedad de especies tiene alta…",o:["Aridez","Biodiversidad","Altitud","Salinidad"],c:1,e:"Biodiversidad es la variedad de seres vivos."},
    {q:"Un animal que se alimenta de plantas es un…",o:["Productor","Consumidor","Descomponedor","Mineral"],c:1,e:"Es un consumidor (herbívoro)."}
  ]
}

];
