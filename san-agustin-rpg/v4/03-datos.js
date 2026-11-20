// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Frases, monedas azules, enemigos, equipo, kiosco
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ FRASES ═══
const PH={
  jose:['¡Profe, usted es el mejor!','¿Pondrá prueba esta semana?','¡Ya hice la tarea!'],
  valeria:['El autocuidado es parte del trabajo.','¡Tu bienestar importa, profe!','Recuerda respirar.'],
  sofia:['¡El recreo es lo mejor!','¿Juega con nosotros?','¡Sus clases son buenas!'],
  dahian:['¡Mochi y Pichi te saludan!','¡El deporte es vida!','Gracias, profe.'],
  inspector:["El orden no es rigidez.\nEs el primer paso hacia la creatividad.","Una clase bien gestionada es tierra fértil\ndonde florece el aprendizaje.","La disciplina con afecto transforma vidas.\n¡Tú lo sabes!","¡Tu constancia inspira a tus alumnos\nmás de lo que imaginas!"],
  psico_r:["¡Eres más resiliente de lo que crees!\nCada clase difícil te fortalece.","El bienestar docente es la base\nde todo aprendizaje genuino.","Tus alumnos llevan tus palabras\nmucho más tiempo del que imaginas.","El estrés es temporal.\nTu impacto en ellos es permanente. ✨"],
  psico_m:["La emoción es el motor del aprendizaje.\n¡Y tú eres el conductor, profe!","Cuando un alumno te desafía,\nes porque confía en que no lo renderás.","Cuídate primero. No puedes dar lo que no tienes.","Cada error es una oportunidad disfrazada de caos. 💡"],
  claudita:["El aprendizaje significativo ocurre cuando\nconectas el contenido nuevo con lo que ya saben.","No evalúes solo el producto.\nEl proceso dice mucho más del alumno.","La diversidad no es un obstáculo.\nEs tu materia prima más rica.","Un alumno que pregunta es un alumno que piensa.\n¡Celébralo!"],
  gonzalo:["La cancha también es aula.\nAquí aprendemos perseverancia y trabajo en equipo. 🏃","¿Sabías que el ejercicio aumenta la neuroplasticidad?\n¡Mueve a tus alumnos para que aprendan mejor!","Un buen profe, como un deportista,\nno se rinde tras el primer error. ¡Tú puedes!","La cancha y el aula comparten la misma raíz:\nel deseo de mejorar. 💪"],
  juan:["La colaboración entre profesores es el\nmejor ejemplo que damos a nuestros alumnos.","Nadie enseña solo. Compartir es crecer. 🤝","La sala de profesores no es solo para el café.\nEs para construir comunidad docente. ✨","¡Equipo docente!\nJuntos somos más que la suma de nuestras asignaturas."],
  shrine:["Nadie sabe lo que puede un aula...\nhasta que el docente deja de temer\ny empieza a confiar.\n\n— Inspirado en Spinoza","En la sociedad del rendimiento,\nla verdadera revolución es enseñar\na contemplar, a detenerse, a pensar.\n\n— Inspirado en Byung-Chul Han","El conocimiento más poderoso no se mide en pruebas.\nVive en el momento donde un alumno\nse descubre a sí mismo capaz."],
  constanza:["La contención emocional no es debilidad.\nEs la fuerza que nos permite seguir. 💙","Cada profe necesita un espacio seguro.\nEste es el tuyo. 💜","El autocuidado no es egoísmo.\nEs la base de todo lo que das a tus alumnos.","Cuando sientas el peso del aula,\nrecuerda que no lo cargas solo. 🌸","Tus emociones son válidas.\nSentirte cansado es humano, profe. ✨"],
  paula:["La risa sana el alma.\nY la conexión emocional, la cura. 💜","Cada alumno que ríe contigo\nes un alumno que confía en ti.","Un profe que sonríe crea\nun aula donde se aprende mejor.","El humor sano en el aula\nbaja el estrés y sube el aprendizaje. 💙"],
  jeanette:["¿Por qué el libro de matemáticas estaba triste?\n\nPorque tenía demasiados problemas. 😄","¿Qué le dijo un libro a otro libro?\n\n¡Oye, para de leerme! 📖","¿Por qué el diccionario está siempre ocupado?\n\nPorque tiene muchas palabras que atender. 😊","¿Cuál es el animal que más lee?\n\nEl elefante... siempre tiene la trompa en un libro. 🐘","¿Qué hace una abeja en la biblioteca?\n\nBusca la miel-enciclopedia, claro. 🐝","¿Por qué los libros no pelean?\n\nPorque solucionan todo con palabras. 📝","¿Cuál es el libro más peligroso?\n\n¡El libro-mbres! 👻","¿Qué le dijo el marcapáginas al libro?\n\n¡Aquí te espero siempre! 🔖","¿Por qué los escritores van al gimnasio?\n\nPara tener buena forma... literaria. 💪","¿Cómo se llama el libro más raro?\n\nLibro Raro. 😅"]
};
const pidx={};
const np=k=>{ if(!PH||!PH[k]||!PH[k].length) return ''; pidx[k]=(pidx[k]||0); const t=PH[k][pidx[k]%PH[k].length]; pidx[k]++; return t; };

// ═══ MONEDAS AZULES ═══
const BCPOS=[{x:3,y:2},{x:7,y:2},{x:12,y:2},{x:17,y:2},{x:3,y:4},{x:8,y:4},{x:12,y:5},{x:17,y:5},{x:3,y:6},{x:8,y:7},{x:12,y:7},{x:17,y:7},{x:3,y:8},{x:8,y:8},{x:12,y:8},{x:17,y:8}];
let bCC=new Array(BCPOS.length).fill(false);
let floats=[];
const addFloat=(t,sx,sy,c='#93c5fd')=>floats.push({t,x:sx,y:sy,a:1,vy:-.9,life:75,c});

// ═══ ENEMIGOS ═══
const ENEMIES=[
  {id:'cansado',name:'Alumno Cansado',emoji:'😴',maxHp:28,atk:7,def:2,xp:15,coins:5,glow:'rgba(156,163,175,.7)',intro:'¡Un Alumno Cansado apareció!\n¡Bosteza sin parar!',attacks:[{name:'Bostezo',power:7,effect:null,chance:0,msg:'bostezó y contagió el cansancio.'},{name:'Microsiesta',power:4,effect:'confused',chance:.38,msg:'se echó una siesta. ¡Confundido!'}],weak:'Motivar',resist:'Explicar'},
  {id:'desmot',name:'Desmotivación',emoji:'😤',maxHp:42,atk:13,def:5,xp:28,coins:10,glow:'rgba(220,38,38,.7)',intro:'¡La Desmotivación apareció!\n"¿Para qué sirve esto?"',attacks:[{name:'Apatía',power:11,mpDrain:8,effect:null,chance:0,msg:'lanzó apatía. ¡-MP!'},{name:'¿Para Qué?',power:13,effect:null,chance:0,msg:'cuestionó el sentido de todo.'}],weak:'Explicar',resist:'Motivar'},
  {id:'prueba',name:'Prueba Sorpresa',emoji:'📝',maxHp:50,atk:16,def:8,xp:45,coins:15,glow:'rgba(124,58,237,.7)',intro:'¡Una PRUEBA SORPRESA apareció!\n¡Pánico en el aula!',attacks:[{name:'Estrés',power:20,effect:'stressed',chance:.65,msg:'causó estrés. ¡Daño crítico!'},{name:'Hoja en Blanco',power:12,effect:null,chance:0,msg:'dejó la mente en blanco.'}],weak:'Motivar',resist:'Explicar'},
  {id:'resfrio',name:'Resfriado',emoji:'🤒',maxHp:35,atk:9,def:3,xp:22,coins:7,glow:'rgba(8,145,178,.7)',intro:'¡Un Resfriado entró! ¡Achú!',attacks:[{name:'Estornudo',power:9,effect:'poisoned',chance:.5,msg:'estornudó. ¡Intoxicado!'},{name:'Fiebre',power:11,effect:null,chance:0,msg:'subió la temperatura.'}],weak:'Café',resist:'Motivar'},
  {id:'celular',name:'Celular en Clase',emoji:'📱',maxHp:38,atk:11,def:5,xp:30,coins:12,glow:'rgba(14,165,233,.7)',intro:'¡Un Celular apareció!\n¡Scrollea TikTok sin parar!',attacks:[{name:'Notificación',power:8,effect:'confused',chance:.55,msg:'bombardeó notificaciones. ¡Confundido!'},{name:'Reels',power:11,effect:null,chance:0,msg:'reprodujo un video que no para.'}],weak:'Explicar',resist:null},
  {id:'inspector_b',name:'Inspector',emoji:'👔',maxHp:65,atk:18,def:10,xp:60,coins:22,glow:'rgba(15,23,42,.95)',intro:'¡Un INSPECTOR apareció!\n¡La clase debe ser perfecta!',attacks:[{name:'Observación',power:18,effect:'stressed',chance:.7,mpDrain:0,msg:'anotó observaciones. ¡Estrés máximo!'},{name:'Revisión',power:14,effect:null,chance:0,mpDrain:12,msg:'pidió la planificación. ¡-MP!'}],weak:'Motivar',resist:'Huir',noFlee:true},
  {id:'paulina',name:'Profa Paulina',emoji:'📐',maxHp:52,atk:16,def:9,xp:40,coins:14,glow:'rgba(234,179,8,.75)',intro:'\u00a1La Profa Paulina apareci\u00f3!\n"\u00a1Demuestren el teorema de Pit\u00e1goras!"',attacks:[{name:'Ecuaci\u00f3n Dif\u00edcil',power:16,effect:'stressed',chance:.5,msg:'plante\u00f3 una ecuaci\u00f3n imposible. \u00a1Estr\u00e9s!'},{name:'Prueba de \u00c1lgebra',power:20,effect:null,chance:0,msg:'lanz\u00f3 \u00e1lgebra sin aviso.'}],weak:'Caf\u00e9',resist:'Explicar'},
  {id:'dahian',name:'Profe Dahian',emoji:'🏃‍♀️',maxHp:48,atk:19,def:5,xp:38,coins:13,glow:'rgba(34,197,94,.75)',intro:'\u00a1El Profe Dahian apareci\u00f3!\n"\u00a1Veinte vueltas al patio!"',attacks:[{name:'Trote con Gatos',power:15,effect:null,chance:0,msg:'entrenó con sus gatos. ¡Sin descanso!'},{name:'¡Los Gatos Atacan!',power:12,effect:'confused',chance:.65,msg:'Sus gatos confundieron al profe. ¡Confundidoes. \u00a1Confundido!'}],weak:'Motivar',resist:'Huir'},
  {id:'alex',name:'Profe Alex',emoji:'\U0001f3b5',maxHp:44,atk:14,def:7,xp:35,coins:12,glow:'rgba(168,85,247,.75)',intro:'\u00a1El Profe Alex apareci\u00f3!\n"\u00a1Sigan el ritmo!"',attacks:[{name:'Nota Desafinada',power:11,effect:'confused',chance:.65,msg:'toc\u00f3 nota desafinada. \u00a1Confundido!'},{name:'Volumen al M\u00e1ximo',power:18,effect:'stressed',chance:.4,msg:'subi\u00f3 el volumen al m\u00e1ximo. \u00a1Estr\u00e9s!'}],weak:'Explicar',resist:'Caf\u00e9'}
];
const PLAZA_ENEMIES=[
  {id:'delinc',name:'Delincuente',emoji:'😈',maxHp:35,atk:12,def:4,xp:20,coins:8,glow:'rgba(220,38,38,.75)',intro:'¡Un Delincuente apareció!\n"¡La billetera o la vida!"',attacks:[{name:'Robo Rápido',power:10,effect:null,chance:0,stealCoins:5,msg:'intentó robar. ¡-5 monedas!'},{name:'Navajeo',power:15,effect:'poisoned',chance:.4,msg:'sacó la navaja. ¡Envenenado!'}],weak:'Motivar',resist:'Café'},
  {id:'ambulante',name:'Ambulante',emoji:'🥤',maxHp:30,atk:10,def:3,xp:18,coins:6,glow:'rgba(245,158,11,.75)',intro:'¡Un Ambulante apareció!\n"¿Helados, bebidas, choclos?"',attacks:[{name:'Bebida Dudosa',power:8,effect:'confused',chance:.7,msg:'vendió bebida dudosa. ¡Confundido!'},{name:'Choclo Volador',power:12,effect:null,chance:0,msg:'lanzó un choclo sin aviso.'}],weak:'Explicar',resist:'Motivar'},
  {id:'pollito',name:'Pollito de KFC',emoji:'🍗',maxHp:28,atk:9,def:2,xp:15,coins:5,glow:'rgba(234,179,8,.75)',intro:'¡Un Pollito de KFC apareció!\n"¡Finger lickin bad!"',attacks:[{name:'Aceite Caliente',power:9,effect:'poisoned',chance:.5,msg:'salpicó aceite caliente. ¡Envenenado!'},{name:'Empanizado',power:12,effect:null,chance:0,msg:'atacó con crujiente empanado.'}],weak:'Café',resist:'Explicar'}
];
let party=[];
const PARTY_MEMBERS=[
  {id:'renata',name:'Renata Oros',emoji:'🌟',maxHp:60,hp:60,atk:18,def:8,ability:'Consejo Dorado',abDesc:'25 daño + sana 30 HP',glow:'rgba(253,212,66,.85)',found:false,inTeam:false,usedThisBattle:false},
  {id:'isi',name:'Isi Fernan',emoji:'💙',maxHp:70,hp:70,atk:22,def:12,ability:'Bloqueo Técnico',abDesc:'30 daño + debilita al enemigo',glow:'rgba(96,165,250,.85)',found:false,inTeam:false,usedThisBattle:false},
  {id:'este',name:'Este Dev',emoji:'💻',maxHp:50,hp:50,atk:20,def:6,ability:'Debug Total',abDesc:'28 daño + cura estado',glow:'rgba(167,139,250,.85)',found:false,inTeam:false,usedThisBattle:false}
];

// ═══ TIENDA ═══
const KELLA_ITEMS=[
  {id:'hp_s',name:'Poción HP',emoji:'🧪',effect:'hp',amount:25,cost:8,desc:'+25 HP'},
  {id:'hp_l',name:'Poción HP+',emoji:'💊',effect:'hp',amount:60,cost:18,desc:'+60 HP'},
  {id:'mp_s',name:'Poción MP',emoji:'💙',effect:'mp',amount:15,cost:8,desc:'+15 MP'},
  {id:'mp_l',name:'Elixir Mente',emoji:'✨',effect:'mp',amount:35,cost:15,desc:'+35 MP'},
  {id:'elixir',name:'Elixir Dorado',emoji:'⭐',effect:'both',hp:35,mp:25,cost:28,desc:'+35HP +25MP'},
  {id:'herb',name:'Té de Hierbas',emoji:'🍵',effect:'cure',cost:12,desc:'Cura estados'},
  {id:'cafe',name:'Café Extra',emoji:'☕',effect:'coffee',cost:10,desc:'+1 uso de café'},
  {id:'full',name:'Reparación Total',emoji:'🌟',effect:'full',cost:45,desc:'HP y MP máximo'},
  {id:'atk',name:'Tiza de Poder',emoji:'🖊️',effect:'atk',amount:5,cost:35,desc:'+5 ATK permanente'},
  {id:'caramelo',name:'Caramelo',emoji:'🍬',cost:3,type:'food',use:()=>{stats.hunger=Math.min(stats.maxHunger,stats.hunger+50);syncUI();showDialog('🍬 +50 🍽️ ¡Dulce energía!');},desc:'+50 Hambre',effect:'custom'},
  {id:'semilla_tomate',name:'Semilla Tomate',emoji:'🍅',cost:5,type:'seed',desc:'Planta en el huerto',effect:'seed'},
  {id:'semilla_lechuga',name:'Semilla Lechuga',emoji:'🥬',cost:4,type:'seed',desc:'Planta en el huerto',effect:'seed'},
  {id:'semilla_papa',name:'Semilla Papa',emoji:'🥔',cost:6,type:'seed',desc:'Planta en el huerto',effect:'seed'},
  {id:'semilla_zanahoria',name:'Semilla Zanahoria',emoji:'🥕',cost:5,type:'seed',desc:'Planta en el huerto',effect:'seed'},
  {id:'semilla_cebolla',name:'Semilla Cebolla',emoji:'🧅',cost:7,type:'seed',desc:'+2 ATK perm',effect:'seed'},
  {id:'linterna',name:'Linterna',emoji:'🔦',cost:25,type:'equip',desc:'Ilumina la noche',effect:'equip'}
];
const KELLA_G=["¡Bienvenido al Kiosco de Kella! 🛒\n¿Qué necesitas, profe?","¡Profe Felipe! Tengo lo mejor del colegio.","¡Las mejores pociones del pasillo!","¡Repón fuerzas antes de seguir!","Tengo Elixir Dorado fresco llegado hoy. ⭐"];
const KELLA_B=["¡Excelente elección!","¡Te irá mucho mejor!","¡Eso es lo que necesitabas!","¡Vuelve pronto, profe!"];

