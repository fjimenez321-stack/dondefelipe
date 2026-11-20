// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Tiendas, quiz de biología, BuinZoo, artesanos
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ SHOP ═══
function openShop(){ STATE='shop'; EL.kellaMsg.textContent=KELLA_G[Math.floor(Math.random()*KELLA_G.length)]; EL.shopFb.textContent=''; renderShop(); EL.shopPanel.style.display='block'; }
function renderShop(){ EL.shopCoins.textContent=coins; EL.shopItems.innerHTML=''; KELLA_ITEMS.forEach(item=>{ const cb=coins>=item.cost,row=document.createElement('div'); row.className='shop-row'; row.innerHTML=`<div class="shop-lft"><span class="shop-emoji">${item.emoji}</span><div><div class="shop-name">${item.name}</div><div class="shop-desc">${item.desc}</div></div></div><div class="shop-rgt"><span class="shop-cost">🪙${item.cost}</span><button class="shop-btn" onclick="buyItem('${item.id}')" ${cb?'':'disabled'}>${cb?'COMPRAR':'SIN FONDOS'}</button></div>`; EL.shopItems.appendChild(row); }); }
function buyItem(id){
  const item=KELLA_ITEMS.find(i=>i.id===id);
  if(!item||coins<item.cost){if(item)showDialog('🛒 Monedas insuficientes.\n\nNecesitas '+item.cost+'🪙');return;}
  coins-=item.cost;
  // Seeds and equip go to inventory
  if(item.type==='seed'||item.type==='equip'||item.type==='food'){
    const invItem={id:item.id,name:item.name,emoji:item.emoji,type:item.type,desc:item.desc||''};
    if(item.type==='food') invItem.use=item.use||(()=>{stats.hunger=Math.min(stats.maxHunger,(stats.hunger||100)+30);syncUI();});
    if(item.type==='equip'&&item.id==='linterna'){invItem.use=()=>showDialog('🔦 Linterna activa.\nIlumina automáticamente la noche.');}
    inventory.push(invItem); syncUI();
    EL.shopFb.textContent='✅ '+item.name+' → Mochila'; EL.kellaMsg.textContent=KELLA_B[Math.floor(Math.random()*KELLA_B.length)];
    renderShop(); return;
  }
  if(item.effect==='custom'&&typeof item.use==='function'){item.use();syncUI();EL.shopFb.textContent='✅ '+item.name;renderShop();return;}
  let msg=''; const S=stats; switch(item.effect){ case 'hp':S.hp=Math.min(S.maxHp,S.hp+item.amount);msg=`+${item.amount} HP ❤️`;break; case 'mp':S.mp=Math.min(S.maxMp,S.mp+item.amount);msg=`+${item.amount} MP 💙`;break; case 'both':S.hp=Math.min(S.maxHp,S.hp+item.hp);S.mp=Math.min(S.maxMp,S.mp+item.mp);msg=`+${item.hp}HP +${item.mp}MP`;break; case 'cure':S.status=null;S.statusTurns=0;msg='¡Estado curado! ✅';break; case 'coffee':S.coffees++;msg=`+1 café ☕`;break; case 'full':S.hp=S.maxHp;S.mp=S.maxMp;msg='¡HP y MP máximo! 🌟';break; case 'atk':S.atk+=item.amount;msg=`+${item.amount} ATK 🖊️`;break; } syncUI(); renderShop(); EL.shopFb.textContent=`✅ ${item.name}: ${msg}`; EL.kellaMsg.textContent=KELLA_B[Math.floor(Math.random()*KELLA_B.length)]; }

const RESERVA_ENEMIES=[
  {id:'serpiente',name:'Serpiente del Monte',emoji:'🐍',maxHp:45,atk:13,def:3,xp:18,coins:4,glow:'rgba(34,197,94,.9)',
   intro:'¡Una serpiente del bosque esclerófilo!'},
  {id:'zorro_chilla',name:'Zorro Chilla',emoji:'🦊',maxHp:65,atk:15,def:5,xp:25,coins:8,glow:'rgba(251,146,60,.9)',
   intro:'¡Un zorro chilla se defiende!'},
  {id:'araña_pollito',name:'Araña Pollito',emoji:'🕷️',maxHp:30,atk:11,def:2,xp:12,coins:3,glow:'rgba(88,28,135,.9)',
   intro:'¡Una araña pollito gigante!'},
  {id:'lagartija',name:'Lagartija Nativa',emoji:'🦎',candy:true,maxHp:20,atk:6,def:1,xp:8,coins:2,glow:'rgba(20,184,166,.9)',
   intro:'¡Una lagartija endémica!'},
  {id:'peuco',name:'Peuco en Picada',emoji:'🦅',maxHp:55,atk:18,def:4,xp:22,coins:6,glow:'rgba(251,191,36,.9)',
   intro:'¡Un peuco ataca desde el cielo!'},
  {id:'avispon',name:'Avispón Nativo',emoji:'🐝',maxHp:25,atk:9,def:0,xp:10,coins:2,glow:'rgba(253,224,71,.9)',
   intro:'¡Un avispón furioso!'},
  {id:'mariposa_niña',name:'Mariposa Peumo',emoji:'🦋',maxHp:20,atk:6,def:0,xp:9,coins:2,glow:'rgba(251,191,36,.9)',
   intro:'¡Una Mariposa del Peumo vuela hacia ti!'},
  {id:'abejorro_nativo',name:'Abejorro Nativo',emoji:'🐝',maxHp:35,atk:12,def:1,xp:14,coins:3,glow:'rgba(253,224,71,.9)',
   intro:'¡Un Abejorro Bombus dahlbomii ataca!'},
  {id:'escarabajo_boldo',name:'Escarabajo del Boldo',emoji:'🪲',maxHp:28,atk:9,def:3,xp:11,coins:2,glow:'rgba(34,197,94,.9)',
   intro:'¡Un Escarabajo del Boldo se defiende!'},
  {id:'tijereta',name:'Tijereta Nativa',emoji:'🦟',maxHp:15,atk:8,def:0,xp:7,coins:1,glow:'rgba(88,28,135,.9)',
   intro:'¡Una Tijereta nativa te ataca!'},
  {id:'cuncuna',name:'Cuncuna Peluda',emoji:'🐛',maxHp:22,atk:5,def:2,xp:8,coins:2,glow:'rgba(20,184,166,.9)',candy:true,
   intro:'¡Una Cuncuna peluda del quillay!'},
  {id:'chinche',name:'Chinche del Arbusto',emoji:'🪳',maxHp:18,atk:7,def:1,xp:8,coins:1,glow:'rgba(120,53,15,.9)',
   intro:'¡Un Chinche de arbusto ataca!'},
  {id:'camib',name:'CamiB',emoji:'📓',maxHp:60,atk:16,def:5,xp:25,coins:7,glow:'rgba(244,114,182,.9)',
   intro:'¡CamiB aparece en el sendero!',
   attacks:[{name:'Apuntes Voladores',msg:'lanzó apuntes!',power:22},{name:'Ensayo Largo',msg:'usó Ensayo Largo!',power:30},{name:'Pregunta Difícil',msg:'hizo una pregunta difícil!',power:18,effect:'stressed',chance:.5}]},
  {id:'julio',name:'Julio',emoji:'🎒',maxHp:70,atk:18,def:7,xp:28,coins:8,glow:'rgba(251,146,60,.9)',
   intro:'¡Julio bloquea el camino!',
   attacks:[{name:'Mochila Cargada',msg:'golpeó con la mochila!',power:26},{name:'Excusa Creativa',msg:'usó Excusa Creativa!',power:20,atkDebuff:4},{name:'Energía Extra',msg:'atacó con energía!',power:32}]},
  {id:'renata',name:'Renata',emoji:'🌸',maxHp:55,atk:15,def:6,xp:23,coins:6,glow:'rgba(196,181,253,.9)',
   intro:'¡Renata emerge del bosque!',
   attacks:[{name:'Flores Tóxicas',msg:'lanzó flores tóxicas!',power:20,effect:'poisoned',chance:.6},{name:'Mirada Penetrante',msg:'usó Mirada Penetrante!',power:24},{name:'Critica de Amiga',msg:'criticó fuerte!',power:28,effect:'stressed',chance:.4}]},
  {id:'said',name:'Said',emoji:'⚡',maxHp:80,atk:20,def:8,xp:32,coins:9,glow:'rgba(250,204,21,.9)',
   intro:'¡Said aparece con energía!',
   attacks:[{name:'Velocidad Máxima',msg:'atacó velocísimo!',power:28},{name:'Remate de Gol',msg:'pateó fuerte!',power:35},{name:'Presión Alta',msg:'aplicó presión!',power:22,effect:'stressed',chance:.55}]},
  {id:'martinau',name:'MartinaU',emoji:'🎵',maxHp:65,atk:17,def:6,xp:26,coins:7,glow:'rgba(52,211,153,.9)',
   intro:'¡MartinaU canta su batalla!',
   attacks:[{name:'Nota Aguda',msg:'lanzó nota aguda!',power:24},{name:'Ritmo Confuso',msg:'usó Ritmo Confuso!',power:20,atkDebuff:3},{name:'Coro Final',msg:'cantó el coro final!',power:32}]}
];

const BIO_QUESTIONS=[
  {q:"¿Qué son los productores en un ecosistema?",
   opts:["Animales herbívoros","Organismos autótrofos que fabrican su alimento","Organismos descomponedores","Carnívoros de tope"],
   ans:1, exp:"Los productores (plantas, algas) fabrican su propio alimento mediante fotosíntesis. Son la base de toda cadena trófica."},
  {q:"¿Cuál de los siguientes NO es un factor abiótico?",
   opts:["Temperatura","Humedad del suelo","Luz solar","Hongos descomponedores"],
   ans:3, exp:"Los hongos son seres vivos (factor biótico). Los factores abióticos son elementos físico-químicos: luz, temperatura, agua, etc."},
  {q:"¿Qué es la biodiversidad?",
   opts:["La masa total de organismos en un área","La variedad de especies y genes en un ecosistema","El flujo de energía entre organismos","El ciclo del nitrógeno"],
   ans:1, exp:"La biodiversidad abarca la variedad de especies, genes y ecosistemas en un área determinada."},
  {q:"¿Cuál es el nivel más alto de organización ecológica?",
   opts:["Comunidad","Ecosistema","Población","Biosfera"],
   ans:3, exp:"La biosfera es el nivel más amplio e incluye todos los ecosistemas del planeta Tierra."},
  {q:"¿Cómo se llama la relación donde ambas especies se benefician?",
   opts:["Parasitismo","Comensalismo","Mutualismo","Depredación"],
   ans:2, exp:"El mutualismo beneficia a ambas especies. Ejemplo: las flores y sus polinizadores."},
  {q:"¿Qué describe el 'nicho ecológico' de una especie?",
   opts:["El hábitat físico donde vive","El papel funcional que cumple en el ecosistema","La cantidad de individuos de la especie","Su rango de temperatura tolerable"],
   ans:1, exp:"El nicho ecológico es el rol funcional de un organismo: qué come, cómo se reproduce, cómo afecta al ambiente."},
  {q:"¿Qué planteó Darwin en su teoría de la evolución?",
   opts:["Los seres vivos evolucionan por el uso y desuso de órganos","Las especies cambian por selección natural de variaciones heredables","Todos los organismos provienen de un mismo progenitor químico","Los fósiles prueban la creación especial"],
   ans:1, exp:"Darwin propuso que los individuos con variaciones favorables sobreviven y se reproducen más, transmitiendo esas características."},
  {q:"¿Qué es la selección natural?",
   opts:["La reproducción sexual de los organismos","El proceso por el cual los más aptos sobreviven y se reproducen","Un tipo de mutación genética","El aislamiento geográfico de poblaciones"],
   ans:1, exp:"La selección natural es el mecanismo evolutivo que favorece a individuos con características ventajosas para su entorno."},
  {q:"¿Cómo se llama el conjunto de todas las poblaciones de distintas especies que viven en un área?",
   opts:["Bioma","Ecosistema","Comunidad (biocenosis)","Biosfera"],
   ans:2, exp:"La comunidad o biocenosis es el conjunto de poblaciones de distintas especies que coexisten e interactúan en un lugar."},
  {q:"¿Qué mide la 'eficiencia ecológica' en una cadena trófica?",
   opts:["El número de organismos en cada nivel","La energía transferida entre niveles tróficos (≈10%)","La diversidad de especies productoras","La tasa de descomposición"],
   ans:1, exp:"Solo ~10% de la energía se transfiere de un nivel trófico al siguiente. El 90% restante se pierde como calor."},
];
let bioQuizState={active:false,q:0,score:0,done:false};
function startBioQuiz(){bioQuizState={active:true,q:0,score:0,done:false};askBioQ();}
function askBioQ(){
  const i=bioQuizState.q;
  if(i>=BIO_QUESTIONS.length){finishBioQuiz();return;}
  const q=BIO_QUESTIONS[i];
  showDialog('🔬 PREGUNTA '+(i+1)+'/'+BIO_QUESTIONS.length+'\n\n'+q.q,
    q.opts.map((o,k)=>({text:['A)','B)','C)','D)'][k]+' '+o,action:()=>answerBioQ(k)})));
}
function answerBioQ(chosen){
  const q=BIO_QUESTIONS[bioQuizState.q];
  const ok=chosen===q.ans;
  if(ok){bioQuizState.score++;stats.xp+=8;coins+=2;syncUI();}
  showDialog((ok?'✅ ¡CORRECTO! +8XP +2🪙':'❌ INCORRECTO')+'\n\n'+(ok?'':'Respuesta: '+q.opts[q.ans]+'\n\n')+q.exp,
    [{text:'Siguiente →',action:()=>{bioQuizState.q++;askBioQ();}}]);
}
function finishBioQuiz(){
  bioQuizState.active=false; bioQuizState.done=true;
  const s=bioQuizState.score,t=BIO_QUESTIONS.length;
  let bon=''; 
  if(s===t){coins+=30;syncUI();bon='\n\n🏆 ¡PERFECTO! +30 🪙\n¡Eres un genio de la biología!';}
  else if(s>=Math.ceil(t*.7)){coins+=15;syncUI();bon='\n\n🎉 ¡Muy bien! +15 🪙';}
  showDialog('🔬 FIN DEL CUESTIONARIO\n\n'+s+'/'+t+' respuestas correctas'+bon+'\n\n¡Gracias por estudiar\ncon la profesora Yael!');
}

const CENTRO_ENEMIES=[
  {id:'perro',name:'Perro Callejero',emoji:'🐕',maxHp:40,atk:10,def:3,xp:15,coins:3,glow:'rgba(139,90,43,.9)'},
  {id:'paloma',name:'Paloma Agresiva',emoji:'🕊️',maxHp:25,atk:8,def:1,xp:10,coins:2,glow:'rgba(200,200,200,.9)'},
  {id:'skater',name:'Skater Rebelde',emoji:'🛹',maxHp:55,atk:12,def:4,xp:20,coins:6,glow:'rgba(168,85,247,.9)'},
  {id:'vendedor_c',name:'Vendedor de Completos',emoji:'🌭',maxHp:45,atk:9,def:2,xp:18,coins:8,glow:'rgba(251,191,36,.9)'},
];

// ═══ BUINZOO — Animales (encuentros educativos de conservación) ═══
const BUINZOO_ENEMIES=[
  {id:'capibara',name:'Capibara',emoji:'🦫',maxHp:50,atk:11,def:4,xp:18,coins:5,glow:'rgba(180,130,70,.9)',
   intro:'¡Un Capibara curioso se acerca!\nEl roedor más grande del mundo.',
   attacks:[{name:'Mordisco',msg:'dio un mordisco tranquilo.',power:14},{name:'Chapuzón',msg:'salpicó agua.',power:18},{name:'Empujón',msg:'empujó con su cuerpo.',power:22}]},
  {id:'tapir',name:'Tapir',emoji:'🐗',maxHp:70,atk:14,def:6,xp:24,coins:7,glow:'rgba(90,70,50,.9)',
   intro:'¡Un Tapir aparece en el sendero!\nDispersor clave de semillas.',
   attacks:[{name:'Embestida',msg:'embistió con fuerza.',power:24},{name:'Trompa Veloz',msg:'usó su trompa prensil.',power:18},{name:'Carga',msg:'cargó a gran velocidad.',power:28}]},
  {id:'flamenco',name:'Flamenco',emoji:'🦩',maxHp:38,atk:12,def:2,xp:15,coins:4,glow:'rgba(244,114,182,.9)',
   intro:'¡Un Flamenco rosado extiende sus alas!',
   attacks:[{name:'Picotazo',msg:'lanzó un picotazo.',power:16},{name:'Aleteo',msg:'aleteó con fuerza.',power:20,effect:'confused',chance:.3}]},
  {id:'mono',name:'Mono Araña',emoji:'🐒',maxHp:45,atk:13,def:3,xp:17,coins:6,glow:'rgba(120,90,60,.9)',
   intro:'¡Un Mono Araña salta entre las ramas!',
   attacks:[{name:'Salto Ágil',msg:'saltó y golpeó.',power:18},{name:'Tirón de Cola',msg:'usó su cola prensil.',power:15},{name:'Lluvia de Frutas',msg:'lanzó frutas.',power:22}]},
  {id:'leon_marino',name:'León Marino',emoji:'🦭',maxHp:60,atk:13,def:5,xp:21,coins:6,glow:'rgba(100,120,140,.9)',
   intro:'¡Un León Marino ladra desafiante!',
   attacks:[{name:'Coletazo',msg:'dio un coletazo.',power:20},{name:'Embiste Marino',msg:'embistió.',power:24}]},
  {id:'cocodrilo',name:'Cocodrilo',emoji:'🐊',maxHp:85,atk:18,def:8,xp:30,coins:9,glow:'rgba(60,110,60,.9)',
   intro:'¡Un Cocodrilo abre sus fauces!\n¡Cuidado, es un depredador!',
   attacks:[{name:'Mordida Brutal',msg:'mordió con fuerza brutal.',power:30},{name:'Giro Mortal',msg:'hizo el giro de la muerte.',power:26},{name:'Coletazo',msg:'azotó con la cola.',power:22}]},
  {id:'oso',name:'Oso de Anteojos',emoji:'🐻',maxHp:90,atk:19,def:9,xp:32,coins:10,glow:'rgba(80,60,40,.9)',
   intro:'¡Un Oso de Anteojos se alza!\nÚnico oso de Sudamérica.',
   attacks:[{name:'Zarpazo',msg:'lanzó un zarpazo.',power:28},{name:'Abrazo de Oso',msg:'usó abrazo aplastante.',power:32},{name:'Rugido',msg:'rugió con furia.',power:18,effect:'stressed',chance:.4}]},
  {id:'serpiente',name:'Boa',emoji:'🐍',maxHp:48,atk:15,def:4,xp:19,coins:5,glow:'rgba(120,150,60,.9)',
   intro:'¡Una Boa se desliza hacia ti!',
   attacks:[{name:'Constricción',msg:'apretó con fuerza.',power:22},{name:'Mordida',msg:'mordió rápido.',power:18,effect:'poisoned',chance:.4}]},
];

// Jefes animales del BuinZoo (cada uno entrega una recompensa de armadura)
const BUINZOO_BOSSES={
  rinoceronte:{id:'rinoceronte',name:'RINOCERONTE 🦏',emoji:'🦏',maxHp:220,hp:220,atk:30,def:16,xp:160,coins:55,glow:'rgba(150,150,160,.98)',
    intro:'🦏 ¡EL RINOCERONTE BLANCO CARGA!\n"Protejo mi territorio."\n\n⚠️ JEFE — Especie en peligro',
    attacks:[
      {name:'Carga del Cuerno',power:38,msg:'cargó con su cuerno. ¡Demoledor!'},
      {name:'Pisotón',power:30,effect:'stressed',chance:.6,msg:'pisoteó el suelo. ¡Temblor!'},
      {name:'Embestida Final',power:44,msg:'¡EMBESTIDA TOTAL!'}
    ],weak:'PoderAnimal',resist:'Huir',noFlee:true,isBoss:true,reward:'armadura_africa'},
  elefante:{id:'elefante',name:'ELEFANTE 🐘',emoji:'🐘',maxHp:260,hp:260,atk:32,def:18,xp:190,coins:65,glow:'rgba(160,160,170,.98)',
    intro:'🐘 ¡EL ELEFANTE BARRITA CON FUERZA!\n"El gigante gentil también se defiende."\n\n⚠️ JEFE — Memoria de la sabana',
    attacks:[
      {name:'Trompazo',power:40,msg:'golpeó con la trompa. ¡Enorme daño!'},
      {name:'Barrito Ensordecedor',power:28,effect:'confused',chance:.7,msg:'barritó. ¡Te aturdió!'},
      {name:'Pisada Colosal',power:48,msg:'¡PISADA COLOSAL!'}
    ],weak:'PoderConservacion',resist:'Huir',noFlee:true,isBoss:true,reward:'armadura_asia'},
};

// ═══ ARMADURAS CONTINENTALES del BuinZoo ═══
const ZOO_ARMORS={
  armadura_africa:{id:'armadura_africa',name:'Armadura de África',emoji:'🦁',def:18,
    desc:'+18 DEF — pieles y escamas de la sabana'},
  armadura_asia:{id:'armadura_asia',name:'Armadura de Asia',emoji:'🐯',def:22,
    desc:'+22 DEF — laca y placas de la jungla'},
  armadura_america:{id:'armadura_america',name:'Armadura de América',emoji:'🦅',def:14,
    desc:'+14 DEF — plumas andinas y cuero'},
  armadura_oceania:{id:'armadura_oceania',name:'Armadura de Oceanía',emoji:'🦘',def:16,
    desc:'+16 DEF — fibras del Pacífico'},
};
function equipZooArmor(id){
  const a=ZOO_ARMORS[id]; if(!a) return;
  equipment.armor={id:a.id,name:a.name,emoji:a.emoji,def:a.def,desc:a.desc};
  // guardar también en inventario como referencia
  if(!inventory.some(i=>i.id===a.id)) inventory.push({id:a.id,name:a.name,emoji:a.emoji,type:'equip',desc:a.desc});
  syncUI();
}

// ═══ TIENDA SAFARI (BuinZoo) ═══
const SAFARI_ITEMS=[
  {id:'armadura_america',name:'Armadura de América',emoji:'🦅',cost:120,type:'zooarmor',desc:'+14 DEF — plumas andinas'},
  {id:'armadura_oceania',name:'Armadura de Oceanía',emoji:'🦘',cost:160,type:'zooarmor',desc:'+16 DEF — fibras del Pacífico'},
  {id:'safari_hp',name:'Ración Safari',emoji:'🍖',effect:'hp',amount:90,cost:14,desc:'+90 HP'},
  {id:'safari_mp',name:'Agua Mineral',emoji:'💧',effect:'mp',amount:45,cost:12,desc:'+45 MP'},
  {id:'safari_full',name:'Botiquín del Guardafauna',emoji:'🧰',effect:'full',cost:50,desc:'HP y MP al máximo'},
  {id:'safari_cafe',name:'Café de Sabana',emoji:'☕',effect:'coffee',cost:9,desc:'+1 uso de café'},
];
function openSafariShop(){
  STATE='shop';
  EL.kellaMsg.textContent='🛖 ¡Bienvenido a la Tienda Safari!\nEquípate para proteger la fauna.';
  EL.shopFb.textContent=''; renderSafariShop(); EL.shopPanel.style.display='block';
}
function renderSafariShop(){
  EL.shopCoins.textContent=coins; EL.shopItems.innerHTML='';
  SAFARI_ITEMS.forEach(item=>{
    const owned=item.type==='zooarmor'&&inventory.some(i=>i.id===item.id);
    const cb=coins>=item.cost&&!owned;
    const row=document.createElement('div'); row.className='shop-row';
    row.innerHTML=`<div class="shop-lft"><span class="shop-emoji">${item.emoji}</span><div><div class="shop-name">${item.name}</div><div class="shop-desc">${item.desc}</div></div></div><div class="shop-rgt"><span class="shop-cost">🪙${item.cost}</span><button class="shop-btn" onclick="buySafari('${item.id}')" ${cb?'':'disabled'}>${owned?'EQUIPADA':(cb?'COMPRAR':'SIN FONDOS')}</button></div>`;
    EL.shopItems.appendChild(row);
  });
}
function buySafari(id){
  const item=SAFARI_ITEMS.find(i=>i.id===id);
  if(!item||coins<item.cost) return;
  coins-=item.cost;
  if(item.type==='zooarmor'){
    equipZooArmor(item.id);
    EL.shopFb.textContent='✅ '+item.name+' equipada (+'+ZOO_ARMORS[item.id].def+' DEF)';
    renderSafariShop(); return;
  }
  const S=stats;
  switch(item.effect){
    case 'hp':S.hp=Math.min(S.maxHp,S.hp+item.amount);break;
    case 'mp':S.mp=Math.min(S.maxMp,S.mp+item.amount);break;
    case 'full':S.hp=S.maxHp;S.mp=S.maxMp;break;
    case 'coffee':S.coffees++;break;
  }
  syncUI(); renderSafariShop(); EL.shopFb.textContent='✅ '+item.name;
}

// ═══ Datos de animales (educativo) ═══
const ZOO_FACTS={
  t:'🐗 TAPIR\n\nMamífero con trompa corta y prensil.\nDispersa semillas por el bosque.\n⚠️ Vulnerable por la caza y deforestación.',
  p:'🦫 CAPIBARA\n\nEl roedor más grande del mundo.\nVive en grupos cerca del agua.\nMuy sociable y herbívoro.',
  m:'🐒 MONO ARAÑA\n\nUsa su cola como una quinta mano.\nClave para esparcir semillas.\n⚠️ En peligro por pérdida de selva.',
  f:'🦩 FLAMENCO\n\nSu color rosado viene de su dieta\n(camarones y algas).\nFiltra el agua con su pico curvo.',
  l:'🦭 LEÓN MARINO\n\nMamífero marino muy ágil.\nVive en colonias en la costa de Chile.',
  o:'🐻 OSO DE ANTEOJOS\n\nÚnico oso de Sudamérica.\nVive en los Andes.\n⚠️ En peligro de extinción.',
  j:'🦒 JIRAFA\n\nEl animal terrestre más alto.\nSu cuello tiene 7 vértebras, como tú.\nRamonea hojas de acacia.',
  k:'🐊 COCODRILO\n\nDepredador antiquísimo.\nControla las poblaciones de presas.\nImportante para el equilibrio del río.',
  s:'🐍 BOA / SERPIENTES\n\nControlan plagas de roedores.\nNo todas son venenosas.\nMerecen respeto, no miedo.',
  e:'🐘 ELEFANTE\n\nGran ingeniero del ecosistema.\nDispersa semillas y abre caminos.\n⚠️ Amenazado por el marfil.',
  r:'🦏 RINOCERONTE\n\nHerbívoro de piel gruesa.\n⚠️ En grave peligro por la caza furtiva\nde su cuerno. ¡Hay que protegerlo!',
};

// ═══ Interacción dentro del BuinZoo ═══
function buinzooInteract(zt){
  if(zt==='I'){
    showDialog('🗺️ GUÍA DEL BUINZOO\n\n"¡Hola, Profe Felipe!\n\nObserva a los animales tocándolos\nde frente para aprender sobre ellos.\n\nDerrota a los JEFES 🦏🐘 para ganar\nlas Armaduras Continentales.\n\nVisita la 🛖 Tienda Safari para más\nequipo. ¡Y recuerda: conservar es\nproteger nuestro futuro!"');
    return true;
  }
  if(zt==='S'){ openSafariShop(); return true; }
  if(zt==='B'){ startZooBoss(); return true; }
  if(ZOO_FACTS[zt]){ showDialog(ZOO_FACTS[zt]+'\n\n💡 Pelea con animales sueltos en\nel pasillo para entrenar.'); return true; }
  return false;
}

// ═══ Lanzar combate de jefe del zoo ═══
function startZooBoss(){
  // Elegir jefe pendiente: primero rinoceronte, luego elefante
  let key=null;
  if(!progress.buinzooBosses.rinoceronte) key='rinoceronte';
  else if(!progress.buinzooBosses.elefante) key='elefante';
  if(!key){
    showDialog('🏆 ARENA DE JEFES\n\n¡Ya venciste a todos los jefes\ndel BuinZoo!\n\n🦁 Armadura de África ✔\n🐯 Armadura de Asia ✔\n\n¡Eres un campeón de la conservación!');
    return;
  }
  const boss=BUINZOO_BOSSES[key];
  showDialog((key==='rinoceronte'
      ? '🦏 ARENA DEL RINOCERONTE\n\nUn rinoceronte herido y asustado\nbloquea el camino.\n\n¿Lo enfrentas para calmarlo?'
      : '🐘 ARENA DEL ELEFANTE\n\nUn elefante enorme se ha agitado.\n\n¿Lo enfrentas para protegerlo?'),
    [
      {text:'⚔️ ¡Enfrentar!',action:()=>{ _startBossBattle(boss); }},
      {text:'Aún no',action:()=>{}}
    ]);
}
function _startBossBattle(tmpl){
  if(STATE==='battle') return; STATE='transition';
  battle={enemy:normalizeEnemy(tmpl),busy:false,atkDebuff:0};
  EL.encFlash.classList.remove('flashing'); void EL.encFlash.offsetWidth; EL.encFlash.classList.add('flashing');
  EL.encFlash.addEventListener('animationend',()=>{ EL.encFlash.classList.remove('flashing'); openBattle(); },{once:true});
}


const PLAZA_BOSS={id:'alex_boss',name:'PROFESOR ALEX 🎸',emoji:'🎸',maxHp:200,hp:200,atk:30,def:15,xp:150,coins:50,glow:'rgba(168,85,247,.98)',
  intro:'🎸 ¡EL PROFESOR ALEX APARECIÓ!\n"¡Nadie puede sobrevivir mis acordes!"\n\n⚠️ JEFE DE LA PLAZA BELÉN',
  attacks:[
    {name:'Acorde de Guitarra',power:35,effect:null,chance:0,msg:'tocó un acorde devastador. ¡Daño crítico!'},
    {name:'Acordeón Letal',power:28,mpDrain:20,effect:null,chance:0,msg:'desplegó el acordeón. ¡Drena MP!'},
    {name:'Diapasón Atómico',power:45,effect:'stressed',chance:.85,msg:'¡DIAPASÓN ATÓMICO! ¡Estrés máximo!'}
  ],weak:'Explicar',resist:'Huir',noFlee:true,isBoss:true};

const ARTISAN_ITEMS=[
  {id:'art_hp',name:'Poción Artesanal',emoji:'🧪',effect:'hp',amount:80,cost:12,desc:'+80 HP — receta local'},
  {id:'art_mp',name:'Filtro Mental',emoji:'🔮',effect:'mp',amount:40,cost:10,desc:'+40 MP — hierbas seleccionadas'},
  {id:'art_atk',name:'Elixir de Fuerza',emoji:'⚡',effect:'atk',amount:8,cost:22,desc:'+8 ATK permanente'},
  {id:'art_def',name:'Ungüento Dérmico',emoji:'🛡️',effect:'def',amount:4,cost:20,desc:'+4 DEF permanente'},
  {id:'art_maxhp',name:'Gema de Poder',emoji:'💎',effect:'maxhp',amount:20,cost:28,desc:'+20 HP máximo'},
  {id:'art_cure',name:'Antídoto Natural',emoji:'🌿',effect:'cure',cost:14,desc:'Cura todos los estados'},
  {id:'art_full',name:'Elixir Supremo',emoji:'✨',effect:'full',cost:55,desc:'HP y MP al máximo'},
  {id:'art_cafe',name:'Café Especial',emoji:'☕',effect:'coffee',cost:8,desc:'+2 usos de café'},
];

let equipment={armor:null, weapon:null, accessory:null};

function openArtisanShop(){
  STATE='shop';
  EL.kellaMsg.textContent='🎨 Feria Artesanal de la Plaza Belén\nPociones exclusivas artesanales.';
  EL.shopFb.textContent='';
  EL.shopCoins.textContent=coins;
  EL.shopItems.innerHTML='';
  ARTISAN_ITEMS.forEach(item=>{
    const cb=coins>=item.cost;
    const row=document.createElement('div'); row.className='shop-row';
    row.innerHTML=`<div class="shop-lft"><span class="shop-emoji">${item.emoji}</span><div><div class="shop-name">${item.name}</div><div class="shop-desc">${item.desc}</div></div></div><div class="shop-rgt"><span class="shop-cost">🪙${item.cost}</span><button class="shop-btn" onclick="buyArtItem('${item.id}')" ${cb?'':'disabled'}>${cb?'COMPRAR':'SIN FONDOS'}</button></div>`;
    EL.shopItems.appendChild(row);
  });
  EL.shopPanel.style.display='block';
}
function buyArtItem(id){
  const item=ARTISAN_ITEMS.find(i=>i.id===id); if(!item||coins<item.cost) return;
  coins-=item.cost; let msg='';
  const S=stats;
  switch(item.effect){
    case 'hp': S.hp=Math.min(S.maxHp,S.hp+item.amount);msg=`+${item.amount} HP`;break;
    case 'mp': S.mp=Math.min(S.maxMp,S.mp+item.amount);msg=`+${item.amount} MP`;break;
    case 'atk': S.atk+=item.amount;msg=`+${item.amount} ATK`;break;
    case 'def': S.def+=item.amount;msg=`+${item.amount} DEF`;break;
    case 'maxhp': S.maxHp+=item.amount;S.hp=Math.min(S.maxHp,S.hp+item.amount);msg=`+${item.amount} HP máximo`;break;
    case 'cure': S.status=null;S.statusTurns=0;msg='¡Estado curado!';break;
    case 'full': S.hp=S.maxHp;S.mp=S.maxMp;msg='¡HP y MP máximo!';break;
    case 'coffee': S.coffees+=2;msg='+2 cafés';break;
  }
  EL.shopFb.textContent=`✅ ${item.name}: ${msg}`;
  EL.shopCoins.textContent=coins;
  EL.shopItems.querySelectorAll('.shop-btn').forEach((b,i)=>{ b.disabled=coins<ARTISAN_ITEMS[i].cost; b.textContent=coins>=ARTISAN_ITEMS[i].cost?'COMPRAR':'SIN FONDOS'; });
  syncUI();
}

function closeShop(){ EL.shopPanel.style.display='none'; STATE='exploring'; }

