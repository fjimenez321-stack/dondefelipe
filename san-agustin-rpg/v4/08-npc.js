// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Diálogo base, volver, libros, NPC_ACT
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ DIÁLOGO ═══
function showDialog(text,choices=[]){ STATE='dialog'; EL.dt.textContent=text; EL.dbBtns.innerHTML=''; const close=()=>{ EL.dlgBox.style.display='none'; STATE='exploring'; }; (choices.length?choices:[{text:'Continuar',action:null}]).forEach(c=>{ const b=document.createElement('button'); b.className='dlg-btn'; b.textContent=c.text; b.onclick=()=>{ close(); c.action?.(); }; EL.dbBtns.appendChild(b); }); EL.dlgBox.style.display='block'; }

// ═══ VOLVER A PASILLO ═══
function goBack(){
  if(STATE!=='exploring') return;
  if(currentMap==='sala_cont') stopSalaContMusic();
  // Salas dedicadas: volver al origen guardado
  if(currentMap==='laboratorio'){ const o=progress._labOrigin||{map:'biologia',x:5,y:5}; _suppressOrigin=true; transitionTo(o.map,o.x,o.y); _suppressOrigin=false; return; }
  if(currentMap==='taller'){ const o=progress._tallerOrigin||{map:'reserva',x:5,y:5}; _suppressOrigin=true; transitionTo(o.map,o.x,o.y); _suppressOrigin=false; return; }
  // Casas: volver al Sector Norte junto a la puerta
  if(['casa_1','casa_2','casa_3'].includes(currentMap)){ const lh=progress._lastHouse||{x:5,y:3}; _suppressOrigin=true; transitionTo('sector_norte',lh.x,lh.y+1); _suppressOrigin=false; return; }
  // Mapas con salida fija a pasillo
  const exits={cancha:[9,2],biblioteca:[18,5],sala_vela:[14,5],sala_cont:[8,8],biologia:[38,1],secretaria:[38,4],segundo_piso:[7,3]};
  if(exits[currentMap]){ const pt=exits[currentMap]; _suppressOrigin=true; transitionTo('pasillo',pt[0],pt[1]); _suppressOrigin=false; return; }
  // Salidas entre mapas exteriores
  const ext={sala_5to:['segundo_piso',3,4],sala_6to:['segundo_piso',3,4],sala_7mo:['segundo_piso',3,4],sala_8vo:['segundo_piso',3,4],sector_norte:['plaza',20,2],estacion_villa:['sector_norte',24,13],centro_villa:['plaza',38,5],villa:['pasillo',20,5],reserva:['plaza',2,2],salon_trofeos:['plaza',2,2],buinzoo:['plaza',7,10],plaza:['pasillo',2,8]};
  if(ext[currentMap]){ const e=ext[currentMap]; _suppressOrigin=true; transitionTo(e[0],e[1],e[2]); _suppressOrigin=false; return; }
  // Último recurso: usar el origen guardado
  const o=progress._origin;
  if(o&&o.map&&MAPS[o.map]){ _suppressOrigin=true; transitionTo(o.map,o.x,o.y); _suppressOrigin=false; return; }
}

const LIBROS_CLASICOS=[
  {id:'principito',name:'El Principito',author:'Antoine de Saint-Exupéry (1943)',emoji:'🌹',
   summary:'Un aviador cae en el desierto y encuentra a un niño venido de un pequeño asteroide. El Principito le habla de su rosa, de los volcanes que cuida y de los planetas que visitó antes de llegar a la Tierra.\n\nCada habitante representa un defecto humano: el rey que ordena lo que ya ocurrirá, el vanidoso que quiere ser admirado, el hombre de negocios que cuenta estrellas sin disfrutarlas.\n\n"Lo esencial es invisible a los ojos." Una fábula filosófica sobre la amistad, el amor y cómo los adultos olvidan lo importante.'},
  {id:'quijote',name:'Don Quijote de la Mancha',author:'Miguel de Cervantes (1605)',emoji:'⚔️',
   summary:'Alonso Quijano, enloquecido de leer novelas de caballería, decide convertirse en el caballero Don Quijote de la Mancha. Con su fiel escudero Sancho Panza, sale a corregir injusticias y vivir aventuras.\n\nAtaca molinos de viento creyendo que son gigantes. Libera presos pensando que son víctimas. El mundo real choca constantemente con su mundo imaginado.\n\nLa primera novela moderna. Reflexión sobre la locura, la realidad y el idealismo frente al pragmatismo.'},
  {id:'cien_anos',name:'Cien Años de Soledad',author:'Gabriel García Márquez (1967)',emoji:'🦋',
   summary:'La saga de la familia Buendía a lo largo de siete generaciones en Macondo, un pueblo fundado en medio de la selva colombiana. Lo mágico y lo real coexisten con naturalidad: llueven flores amarillas, una mujer asciende al cielo mientras tiende ropa.\n\nJosé Arcadio Buendía funda el pueblo buscando una salida al mar. Sus descendientes repiten patrones de amor, guerra y soledad generación tras generación.\n\nObra cumbre del realismo mágico latinoamericano. Premio Nobel de Literatura 1982.'},
  {id:'metamorfosis',name:'La Metamorfosis',author:'Franz Kafka (1915)',emoji:'🪲',
   summary:'Gregor Samsa despierta una mañana transformado en un enorme insecto. Lo que más le preocupa no es su nueva forma, sino llegar tarde al trabajo.\n\nSu familia, inicialmente horrorizada, se va acostumbrando a mantenerlo escondido. Gregor escucha a su hermana tocar el violín y siente que aún comprende la belleza.\n\nAlegoría sobre la alienación, la familia y cómo la sociedad trata a quienes no son "productivos". Una de las obras más influyentes del siglo XX.'},
  {id:'fahrenheit',name:'Fahrenheit 451',author:'Ray Bradbury (1953)',emoji:'🔥',
   summary:'En un futuro distópico, los bomberos no apagan incendios: los inician. Su misión es quemar todos los libros, prohibidos porque generan ideas perturbadoras.\n\nGuy Montag es un bombero que comienza a leer en secreto tras conocer a Clarisse, una joven que le pregunta si es feliz. La pregunta lo cambia todo.\n\nCrítica a la censura, la televisión como distracción masiva y la pérdida del pensamiento crítico. Más vigente que nunca.'},
  {id:'orgullo',name:'Orgullo y Prejuicio',author:'Jane Austen (1813)',emoji:'💌',
   summary:'Elizabeth Bennet es la segunda de cinco hermanas en la Inglaterra del siglo XIX. Su madre tiene una obsesión: casarlas bien. Cuando el rico Mr. Darcy llega al vecindario, el choque de caracteres es inevitable.\n\nElizabeth lo encuentra arrogante. Darcy la considera por debajo de su clase. Pero bajo el orgullo de uno y el prejuicio de la otra, se esconde una atracción más profunda.\n\nComentario mordaz sobre el matrimonio, las clases sociales y la necesidad de superar los propios sesgos.'},
  {id:'crimen',name:'Crimen y Castigo',author:'Fyodor Dostoievski (1866)',emoji:'🪓',
   summary:'Raskolnikov, un estudiante ruso en la miseria, desarrolla la teoría de que los hombres extraordinarios tienen derecho a transgredir la ley si es por un bien mayor. Para probarse a sí mismo, mata a una prestamista usurera.\n\nPero el crimen no lo libera: lo aplasta. Lo persigue una culpa que ni siquiera reconoce como tal, mientras el detective Porfiry juega un duelo psicológico con él.\n\nEstudio profundo de la conciencia culpable, la redención y los peligros del nihilismo intelectual.'},
  {id:'aleph',name:'El Aleph',author:'Jorge Luis Borges (1945)',emoji:'✨',
   summary:'En el sótano de una casa en Buenos Aires, existe un punto del espacio que contiene todos los demás puntos: el Aleph. Quien lo mira puede ver simultáneamente todo el universo desde todos los ángulos.\n\nEl narrador descubre este objeto cuando visita a Carlos Argentino Daneri, un mediocre poeta que usa el Aleph para escribir un poema que describe literalmente cada rincón de la Tierra.\n\nObra maestra del cuento fantástico. Reflexión sobre el tiempo, la memoria, el infinito y los límites del lenguaje.'}
];
function readBook(bid){
  const book=LIBROS_CLASICOS.find(b=>b.id===bid)||inventory.find(i=>i.id===bid);
  if(!book) return;
  const txt=book.summary||(book.content?`"${book.content}"`:book.desc||'Sin resumen disponible.');
  showDialog(`${book.emoji||'📖'} ${book.name}\n${book.author||''}\n\n${txt}`);
}
// ═══ TABLA DE INTERACCIONES O(1) ═══
const NPC_ACT={
  b:()=>{ if(['casa_1','casa_2','casa_3'].includes(currentMap)){ const libros=['"Historia de Villa Alemana" — fundada en 1894.','"Tratado de Ciencias" del Profe Felipe.','"Métodos de Estudio" — capítulo 7.','"Leyendas del Valle" — cuentos antiguos.']; showDialog('📚 ESTANTERÍA\n\n'+libros[Math.floor(Math.random()*libros.length)]); } },

  // ─── PASILLO ───
  I:()=>{ if(currentMap==='pasillo') showDialog('👮 INSPECTOR\n\n"¡Oye! ¿A dónde vas con tanta prisa?\nEste establecimiento tiene normas.\n\n¡Saca tu identificación!"'); else showDialog('👮 Inspector'); },
  J:()=>{ showDialog('👦 José\n\nProfe, la Claudita busca monedas azules.\n\nSi le lleva 10, puede entrar\na la sala de velas...\n\n'+np('jose')); },
  '5':()=>{ showDialog('👩‍⚕️ Valeria (Psicóloga)\n\n"Hola profe Felipe. Si necesitas\napoyarte emocionalmente,\nestoy en la sala de al lado.\n\n¿Cómo estás hoy?"\n\n'+np('valeria')); },
  '6':()=>{ showDialog('👧 Sofía\n\n"¡Profe! ¿Ha visto a Claudita?\nElla estaba buscando monedas\nazules para hacer algo especial.\n\n¡Ayúdela si puede!"\n\n'+np('sofia')); },
  '7':()=>{
    const bc=progress.blueCoins||0;
    if(bc>=10&&!progress.psyAttackUnlocked){
      progress.psyAttackUnlocked=true;
      showDialog('🧠 Claudita\n\n¡10 monedas azules!\nTe enseño el secreto:\n\n☠️ ATAQUE PSICOLÓGICO\nÚsalo en Magia durante combate.');
    } else if(progress.psyAttackUnlocked){
      showDialog('🧠 Claudita\n\n¡Ya tienes el Ataque Psicológico! ☠️');
    } else {
      showDialog('🧠 Claudita\n\nTráeme 10 monedas azules 🔵\ny te enseño algo especial.\n\nMonedas: '+bc+'/10');
    }
  },
  N:()=>{ if(currentMap==='pasillo') transitionTo('sala_vela',4,7); },

  // ─── CANCHA ───
  K:()=>{
  
  // ─── SEGUNDO PISO ────────────────────────────────────────
  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='^'){
    transitionTo('segundo_piso',1,4);
    setTimeout(()=>showDialog('🏫 SEGUNDO PISO\n\nAquí están las aulas de\n5°, 6°, 7° y 8° Básico.\n\nEl profe Felipe tiene su sala\nen 6° Básico.'),500);
    return true;
  }
  if(currentMap==='segundo_piso'){
    if(MAPS.segundo_piso[player.y]?.[player.x]==='^'){
      transitionTo('pasillo',6,2); return true;
    }
    // Entrances: E tiles differentiated by position
    const spR=player.y, spC=player.x;
    if(MAPS.segundo_piso[spR]?.[spC]==='E'){
      if(spC<=6&&spR<=2){ transitionTo('sala_5to',11,5); return true; }
      if(spC>=8&&spC<=16&&spR<=2){ transitionTo('sala_6to',11,5); return true; }
      if(spC<=6&&spR>=3){ transitionTo('sala_7mo',11,5); return true; }
      if(spC>=8&&spR>=3){ transitionTo('sala_8vo',11,5); return true; }
    }
  }
  if(['sala_5to','sala_6to','sala_7mo','sala_8vo'].includes(currentMap)){
    if(MAPS[currentMap][player.y]?.[player.x]==='E'){
      transitionTo('segundo_piso',3,4); return true;
    }
  }
  if(currentMap==='jardin_eden'){
      showDialog('📚 Guardián del Saber\n\nSistemas del juego:\n\n⚗️ Laboratorios\n🔥 Forja Metalurgica\n🪚 Carpinteria\n⛏️ Minas\n🌱 Huerto\n\nFarmacia para vacunas COVID.\n\nEl saber te protege.'); return;
    }
    openShop();
  },
  G:()=>{
    if(currentMap==='reserva'){
      const rm=progress.rangerMissions;
      if(rm.martinez===2&&!rm.martRewarded){rm.martRewarded=true;coins+=40;syncUI();showDialog('🌲 Martínez:\n\n¡Misión cumplida!\n\n🪙 +40 monedas');}
      else if(rm.martinez===1){showDialog('🌲 Martínez:\n\nSigue observando fauna.\n'+(progress._obs?.j?'✅':'▫️')+' Ave  '+(progress._obs?.i?'✅':'▫️')+' Insecto  '+(progress._obs?.x?'✅':'▫️')+' Zorro');}
      else{rm.martinez=1;acceptQuest('martinez');showDialog('🌲 Guardabosques Martínez\n\nBienvenido a la Reserva.\n\n📋 Observa:\n🐦 Un ave nativa\n🦋 Un insecto\n🦊 Un zorro\n\n🪙 Premio: 40 monedas');}
    } else if(currentMap==='cancha'){
      const gm=progress.gonzaloMission;
      if(!gm||gm===0){showDialog('👨‍🏫 Profe Gonzalo\n\n¿Puedes plantar 5 semillas\nde tomate 🍅 en el huerto\nde la Reserva?\n\n🪙 Premio: 100 monedas',[{text:'✅ Acepto',action:()=>{progress.gonzaloMission=1;acceptQuest('gonzalo');}},{text:'Ahora no',action:()=>{}}]);}
      else if(gm===1){const c=Object.values(progress.garden||{}).filter(g=>g.seedId==='semilla_tomate').length;showDialog('👨‍🏫 Gonzalo: '+c+'/5 tomates plantados.');}
      else if(gm===2&&!progress.gonzaloRewarded){progress.gonzaloRewarded=true;coins+=100;syncUI();completeQuest('gonzalo');showDialog('👨‍🏫 Gonzalo:\n\n¡Lo lograste! 🌱\n\n🪙 +100 monedas');}
      else showDialog('👨‍🏫 Gonzalo:\n\n¡Gracias por cuidar\nel huerto! 🌱');
    } else showDialog('👨‍🏫 Profe Gonzalo.\n\n'+np('gonzalo'));
  },
  U:()=>{ showDialog('👦 Juan\n\n"¡Profe! El partido de fútbol\nempieza en 10 minutos.\n¿Va a participar?"\n\n'+np('juan')); },
  D:()=>{
    if(currentMap==='reserva'){
      if(inBoat){inBoat=false;showDialog('⛵ Amarraste la lancha.');}
      else if(progress.hasBoat){inBoat=true;showDialog('⛵ ¡A navegar!\n\nUsa las flechas.\nLa isla está al centro.');}
      else if(coins>=20){coins-=20;progress.hasBoat=true;inBoat=true;syncUI();showDialog('⛵ LANCHA ALQUILADA\n\n🪙 -20 monedas\n\n¡Navega hasta la isla!\nEl cofre tiene un código.\n\nPista: Salón de Trofeos.');}
      else showDialog('⛵ MUELLE\n\nAlquiler: 20 🪙\n\nNo tienes monedas.');
    } else if(currentMap==='cancha'){
      const dm=progress.dahianMission;
      if(!dm||dm===0){showDialog('🏃‍♀️ Profe Dahian\n\nMochi y Pichi necesitan comida.\n\n📋 Compra Comida de Gato 🐱\nen el KFC del Centro.\n\n🪙 Premio: 200 monedas',[{text:'✅ Acepto',action:()=>{progress.dahianMission=1;acceptQuest('dahian');}},{text:'Ahora no',action:()=>{}}]);}
      else if(dm===1&&progress.dahianCatFood){progress.dahianMission=2;const ci=inventory.findIndex(i=>i.id==='comida_gato');if(ci>=0)inventory.splice(ci,1);coins+=200;syncUI();completeQuest('dahian');showDialog('🏃‍♀️ Dahian:\n\n¡Gracias! Mochi y Pichi 😸\n\n🪙 +200 monedas');}
      else if(dm===1){showDialog('🏃‍♀️ Dahian:\n\nNecesito la Comida de Gato.\nBúscala en KFC Centro. 🐱');}
      else showDialog('🏃‍♀️ Dahian:\n\n¡Mochi y Pichi están felices!\n\n'+np('dahian'));
    } else showDialog('🏃‍♀️ Profe Dahian.\n\n'+np('dahian'));
  },
  C:()=>{
    // Profesora Carol — consejera en varios mapas
    const carolMaps=['jardin_eden','pasillo','biblioteca','salon_trofeos'];
    if(carolMaps.includes(currentMap)){
      const carIntro=!progress.carolMet;
      if(carIntro){
        progress.carolMet=true;
        showDialog('👩‍🏫 ¡HOLA! Soy la\nPROFESORA CAROL 💕\n\nSoy la consejera del colegio.\n¡Me alegra que estés aquí!\n\n¿Eres estudiante de\n7° Básico?',[
          {text:'✅ Sí, 7° Básico',action:()=>{
            progress.carolGrade='7mo';
            progress.antiQuestStarted=true;
            if(!progress.castMatUnlocked) progress.castMatUnlocked=true;
            syncUI();
            setTimeout(()=>showDialog('👩‍🏫 CAROL — MISIÓN ACTIVA 🎓\n\n¡Tu misión: Encuentra los\n10 métodos anticonceptivos\nescondidos en el colegio!\n\n✨ Busca el BRILLO DORADO\n\n📍 Ubicaciones:\n• Salas 5°,6°,7°,8° Básico\n• Biblioteca y Secretaría\n• Pasillo y Biología\n• Plaza y Jardín (¡aquí!)\n\n⚡ Nuevo poder desbloqueado:\nCAST. MATEMÁTICO (15 MP)'),200);
          }},
          {text:'❌ Otro curso',action:()=>{
            progress.carolGrade='otro';
            setTimeout(()=>showDialog('👩‍🏫 Carol:\n\n"¡Bienvenido!\n\nClaves del colegio:\n🏫 Salas en 2° piso\n⚔️ Combate en el pasto\n⬆️ Escalera en Pasillo\n🏥 Farmacia disponible\n🌿 Jardín = inicio\n\n¡Estoy en varios lugares!"'),200);
          }}
        ]); return;
      }
      const af=Object.keys(progress.antiItems||{}).length;
      if(progress.carolGrade==='7mo'&&!progress.antiQuestDone){
        showDialog('👩‍🏫 Carol:\n\n'+af+'/10 métodos encontrados.\n\n'+(af<3?'Empieza en las salas\ndel 2° piso y Biblioteca.':af<7?'¡Buen avance! Busca\nen Plaza y Jardín.':'¡Casi! Revisa todos\nlos rincones.'));
      } else if(progress.antiQuestDone){
        showDialog('👩‍🏫 Carol:\n\n"¡Completaste la actividad!\n\nRecuerda: el condón protege\nde ITS. ¡Comparte lo aprendido!"');
      } else {
        const t=['¡Explora todo el colegio!','Habla con el Tío Antonio.','Vacúnate en la Farmacia.','Sube al 2° piso.','¡Cuídate del COVID!'];
        showDialog('👩‍🏫 Carol:\n\n"'+t[Math.floor(Math.random()*t.length)]+'"');
      }
      return;
    }
    if(currentMap==='reserva'){triggerCatherine();return;}
    if(currentMap==='cancha'){
      if(!progress.chestOpened){showDialog('📦 Cofre de la Cancha\n\n¿Abrir?',[{text:'✅ Abrir',action:()=>{progress.chestOpened=true;coins+=30;inventory.push({id:'pocion_hp',name:'Poción HP',emoji:'🧪',type:'food',use:()=>{stats.hp=Math.min(stats.maxHp,stats.hp+30);syncUI();showDialog('🧪 +30 HP');}});syncUI();showDialog('📦 ¡Cofre abierto!\n\n🪙 +30 monedas\n🧪 Poción HP');}},{text:'Dejarlo',action:()=>{}}]);}
      else showDialog('📦 Cofre vacío. Ya fue abierto.');
    } else if(currentMap==='salon_trofeos'){showDialog('🏆 Trofeo de Campeón\n\n¡Los campeones del 4° Medio!\nAño 2025.\n\n"El esfuerzo siempre da frutos."');}
  },
  m:()=>{
    if(['casa_1','casa_2','casa_3'].includes(currentMap)){ stats.hunger=Math.min(stats.maxHunger,stats.hunger+20); syncUI(); showDialog('🔥 CHIMENEA\n\nTe calientas junto al fuego.\n🍽️ +20 Hambre'); return; }
    const modeMap={cancha:'futbol',biblioteca:'libros',sala_cont:'mates',secretaria:'historia',biologia:'ciencias',salon_trofeos:'trofeos'};
    let mode=modeMap[currentMap]||'futbol';
    if(currentMap==='cancha'){const fc=player.x+(player.dir==='right'?1:player.dir==='left'?-1:0);mode=fc<=8?'futbol':'basket';}
    const titles={futbol:'⚽ Memorice Fútbol',basket:'🏀 Memorice Básquet',libros:'📚 Literatura',mates:'📐 Matemáticas',ciencias:'🔬 Ciencias',historia:'🏛️ Historia',trofeos:'🏆 Trofeos'};
    showDialog(`${titles[mode]||'🎮 Memorice'}\n\n20 cartas · 10 pares\n\n¿Jugar?`,[{text:'🎮 ¡Jugar!',action:()=>openMemorice(mode)},{text:'Ahora no',action:()=>{}}]);
  },

  // ─── BIBLIOTECA ───
  Q:()=>{
    if(currentMap==='laboratorio'){ openLab(); return; }
    if(stats.level<2){showDialog('📚 Jeanette\n\n"Necesitas ser de nivel 2\npara acceder al archivo.\nSigue estudiando."');return;}
    if(progress.jeanette?.locked){showDialog('📚 Jeanette\n\n"Lo siento, acceso bloqueado.\nTe quedaste sin intentos."');return;}
    if(progress.codeOk){showDialog('📚 Jeanette\n\n"El archivo está desbloqueado.\nBuena suerte con la investigación."');return;}
    openKeypad('jeanette');
  },
  c:()=>{ if(['casa_1','casa_2','casa_3'].includes(currentMap)){ if(!progress._chests)progress._chests={}; if(progress._chests[currentMap]){showDialog('📦 El baúl ya está vacío.');return;} progress._chests[currentMap]=true; coins+=15; syncUI(); showDialog('📦 ¡BAÚL ABIERTO!\n\n🪙 +15 monedas\n\n"Alguien lo guardó hace años."'); return; } showDialog('📚 Computador de Biblioteca\n\n[CATÁLOGO ONLINE]\n\nBusca: "Bosque Esclerófilo Chile"\n\n"El bosque esclerófilo es el ecosistema\nboscoso más amenazado de Chile.\nSolo queda un 2% de su extensión original."'); },
  s:()=>{
    if(currentMap==='sala_vela'){
      const bc=progress.blueCoins||0;
      if(bc>=10&&!progress.psyAttackUnlocked){progress.psyAttackUnlocked=true;showDialog('🕯️ Sala Secreta\n\n¡Secreto desbloqueado!\n\n☠️ ATAQUE PSICOLÓGICO\nÚsalo en Magia.');}
      else if(progress.psyAttackUnlocked)showDialog('🕯️ Sala Secreta\n\nAtaque Psicológico desbloqueado ✅');
      else showDialog('🕯️ Sala Secreta\n\nNecesitas 10 monedas azules 🔵.\nMonedas: '+bc+'/10');
      return;
    }
    const books=['📖 Don Quijote\n\nCervantes, 1605.','📖 Cien Años de Soledad\n\nGarcía Márquez.','📖 El Principito\n\nSaint-Exupéry.','📖 Neruda\n\nVeinte Poemas de Amor.','📖 La Metamorfosis\n\nKafka.'];
    showDialog(books[Math.floor(Math.random()*books.length)]);
  },
  P:()=>{
    if(progress.psyAttackUnlocked){showDialog('😊 Paula\n\n"¡Ya tienes el Ataque Psicológico!\n¡Úsalo bien en los combates!"');return;}
    if(progress.paulaMission?.given){showDialog('😊 Paula\n\n"¿Listo? Cuéntame el chiste."',[{text:'🎤 Contar chiste',action:()=>{progress.paulaMission.completed=true;progress.psyAttackUnlocked=true;updateQuestStep('paula',1);showDialog('😂 ¡JAJAJA!\n\n"¡Ese es muy bueno profe!\n\nTe enseño el Ataque Psicológico:\n\n☠️ PREGUNTA EXISTENCIAL\nEn combate causa estrés máximo.\nDerrumba la voluntad del rival."');}},{text:'Mejor no',action:()=>{}}]);return;}
    showDialog('😊 Paula\n\n"Oye profe, ¿sabes chistes buenos?\nSi me cuentas uno te enseño\nalgo especial..."',[{text:'✅ Acepto',action:()=>{progress.paulaMission={given:true};acceptQuest('paula');}},{text:'Ahora no',action:()=>{}}]);
  },

  X:()=>{
    if(progress.franciscoMission?.given&&!progress.franciscoMission?.delivered){
      progress.franciscoMission.delivered=true;
      updateQuestStep('francisco',2);
      showDialog('Constanza\n\nGracias por el mensaje de Francisco.\nCuido el bienestar del equipo.');
    } else {
      showDialog('Constanza (Psicóloga)\n\nHola profe. Recuerda respirar\nprofundo antes de entrar a clases.');
    }
  },
  // ─── SECRETARÍA ───
  f:()=>{
    if(currentMap==='secretaria'){
      const fm=progress.franciscoMission;
      if(!fm){progress.franciscoMission={given:true};acceptQuest('francisco');showDialog('Francisco: Lleva este mensaje a Constanza. Premio: 50 monedas');}
      else if(fm.given&&!fm.delivered){showDialog('Francisco: Espera que hables con Constanza.');}
      else if(fm.delivered&&!fm.rewarded){fm.rewarded=true;coins+=50;syncUI();completeQuest('francisco');showDialog('Francisco: Gracias! +50 monedas');}
      else showDialog('Francisco: Todo bien. Gracias!');
        } else if(currentMap==='reserva'){
      // Pine tree handler
      const fd=player.dir,fdx=fd==='right'?1:fd==='left'?-1:0,fdy=fd==='down'?1:fd==='up'?-1:0;
      const tkey=`${player.x+fdx},${player.y+fdy}`;
      if(progress.cutTrees?.[tkey]){showDialog('🌲 Árbol ya talado.\nNecesita tiempo para recuperarse.');return;}
      showDialog('🌲 ÁRBOL INDUSTRIAL\n\nPino/Eucalipto (no nativo)\n\n¿Talar?',[{text:'🪓 Talar',action:()=>{if(!progress.cutTrees)progress.cutTrees={};progress.cutTrees[tkey]=true;const isEuc=Math.random()<.4;const w=isEuc?{id:'MaderaEuc',name:'Madera Eucalipto',emoji:'🪵',type:'resource'}:{id:'MaderaPino',name:'Madera de Pino',emoji:'🌲',type:'resource'};const qty=progress.hasAxe?4:2;for(let i=0;i<qty;i++)inventory.push({...w});syncUI();showDialog('🪓 +'+qty+' '+w.emoji+' '+w.name);}},{text:'Dejar',action:()=>{}}]);
    }
  },
  q:()=>{ if(currentMap==='secretaria'){secretariaLights=!secretariaLights;showDialog(secretariaLights?'💡 Luces encendidas.':'🌑 Luces apagadas. ¡Oscuridad total!');} },
  O:()=>{ showDialog('🖥️ PC Secretaría\n\n[SISTEMA ESCOLAR]\nUsuario: admin_secretaria\n\nREGISTRO DE NOTAS:\n• 7° A: Promedio 5.8\n• 7° B: Promedio 6.1\n• 8° A: Promedio 5.4\n\n"Los datos son confidenciales."'); },
  t:()=>{ if(['casa_1','casa_2','casa_3'].includes(currentMap)){ showDialog('🪵 MESA DE MADERA\n\nUna mesa rústica con marcas\nde muchas comidas.'); return; } showDialog('🗃️ Mesa de Secretaría\n\nHay pilas de documentos.\n\n"CIRCULAR N°47: Se recuerda a\ntodo el personal cumplir con el\nreglamento de convivencia escolar."'); },
  d:()=>{ showDialog('🚪 Puerta de Oficina\n\n"DIRECCIÓN - No molestar"\n\n[Sonido de papeles y teclas]'); },

  // ─── PLAZA ───
  R:()=>{
    if(currentMap==='taller'){ openCarpentry(); return; }
    if(progress.alexBossDefeated){showDialog('🎸 Profe Alex\n\n"Perdí esa batalla... pero\nel rock nunca muere.\n\nSigue adelante, profe."');return;}
    showDialog('🎸 PROFE ALEX\n\n"¡DETENTE! Este es mi territorio.\nNadie pasa por la plaza\nsin enfrentarme primero.\n\n¡PREPÁRATE PARA EL RIFF FINAL!"',[{text:'⚔️ ¡Pelear!',action:()=>{battle={enemy:normalizeEnemy(PLAZA_BOSS),busy:false,atkDebuff:0};STATE='battle';openBattle();}},{text:'🏃 Huir',action:()=>showDialog('🎸 Alex:\n\n"¡Cobarde! ¡Vuelve cuando\ntengas el valor!"')}]);
  },
  k:()=>{ openArtisanShop(); },
  A:()=>{
  
  // ─── SEGUNDO PISO ────────────────────────────────────────
  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='^'){
    transitionTo('segundo_piso',1,4);
    setTimeout(()=>showDialog('🏫 SEGUNDO PISO\n\nAquí están las aulas de\n5°, 6°, 7° y 8° Básico.\n\nEl profe Felipe tiene su sala\nen 6° Básico.'),500);
    return true;
  }
  if(currentMap==='segundo_piso'){
    if(MAPS.segundo_piso[player.y]?.[player.x]==='^'){
      transitionTo('pasillo',6,2); return true;
    }
    // Entrances: E tiles differentiated by position
    const spR=player.y, spC=player.x;
    if(MAPS.segundo_piso[spR]?.[spC]==='E'){
      if(spC<=6&&spR<=2){ transitionTo('sala_5to',11,5); return true; }
      if(spC>=8&&spC<=16&&spR<=2){ transitionTo('sala_6to',11,5); return true; }
      if(spC<=6&&spR>=3){ transitionTo('sala_7mo',11,5); return true; }
      if(spC>=8&&spR>=3){ transitionTo('sala_8vo',11,5); return true; }
    }
  }
  if(['sala_5to','sala_6to','sala_7mo','sala_8vo'].includes(currentMap)){
    if(MAPS[currentMap][player.y]?.[player.x]==='E'){
      transitionTo('segundo_piso',3,4); return true;
    }
  }
  if(currentMap==='jardin_eden'){
      const step=progress.edenStep||0;
      const msgs=['🌿 JARDIN DEL EDEN\n\nBienvenido, Profe Felipe.\n\nUsa las flechas para moverte\ny OK para interactuar con NPCs.','🏫 Tu objetivo:\n\nExplora el colegio, habla con\nalumnos, resuelve misiones.\n\nReune monedas y sube de nivel.\n\n¡Buena suerte!','⚔️ Combate:\n\nAl pisar pasto verde (tiles g)\npueden aparecer enemigos.\n\nAtaque | Magia | Objeto | Huir.','🦠 COVID-19:\n\nBrotes pueden aparecer.\nVacunate en la Farmacia.\nSin vacuna: 30% mortalidad.','🚀 Listo! Avanza hacia abajo.\n\nLa entrada al colegio brilla. 🏫'];
      progress.edenStep=(step+1)%msgs.length;
      showDialog(msgs[step]); return;
    }
    showDialog('🎭 Escenario de la Plaza\n\n"Aquí se realizan los eventos\nculturales del colegio.\n\nPróximo evento:\n🎵 Festival de Talentos\nViernes 18:00h"'); },

  // ─── CENTRO VILLA ALEMANA ───
  '3':()=>{showDialog('🍔 KFC del Centro\n\n¿Qué deseas?',[{text:'🍔 Pollo Frito -10🪙',action:()=>{if(coins>=10){coins-=10;stats.hp=Math.min(stats.maxHp,stats.hp+30);stats.hunger=Math.min(stats.maxHunger,stats.hunger+40);syncUI();showDialog('🍔 ¡Pollo Frito!\n+30 HP | +40 🍽️');}else showDialog('No tienes monedas.');}},{text:'🐱 Comida de Gato -8🪙',action:()=>{if(coins>=8){coins-=8;inventory.push({id:'comida_gato',name:'Comida de Gato',emoji:'🐱',type:'item',desc:'Para Mochi y Pichi'});progress.dahianCatFood=true;syncUI();showDialog('🐱 Comida de Gato!\n🪙 -8 monedas\nLlévala a Dahian.');}else showDialog('No tienes monedas.')}},{text:'No gracias.',action:()=>{}}]);},
  n:()=>{ if(currentMap==='centro_villa'){if(player.steps>3600){showDialog('👮 Inspector Municipal\n\n"¡Oiga usted! Lleva más de\n60 minutos en el Centro.\n\nMULTA: 30 🪙 por merodear.\n\n¡Circule, por favor!"');coins=Math.max(0,coins-30);syncUI();}else showDialog('👮 Inspector Municipal\n\n"Buenos días. Todo en orden.\nCirule tranquilo."');} },
  '4':()=>{showDialog('🌭 Puesto de Completos\n\n¿Comes algo?',[{text:'🌭 Completo -3🪙',action:()=>{if(coins>=3){coins-=3;stats.hp=Math.min(stats.maxHp,stats.hp+30);stats.hunger=Math.min(stats.maxHunger,stats.hunger+35);syncUI();showDialog('🌭 ¡Completo italiano!\n+30 HP | +35 🍽️');}else showDialog('Cuesta 3 🪙.');}},{text:'No gracias.',action:()=>{}}]);},

  // ─── BIOLOGÍA ───
  Y:()=>{
    if(!bioQuizState.active&&!bioQuizState.done){showDialog('👩‍🔬 Yael\n\n¿Lista para el quiz de\nEcosistemas y Evolución?\n\n• Cada acierto: +8 XP, +2🪙\n• Quiz perfecto: +30🪙',[{text:'🔬 ¡Comenzar!',action:startBioQuiz},{text:'Quizás después.',action:()=>{}}]);}
    else if(bioQuizState.done){showDialog('👩‍🔬 Yael\n\n"¡Ya completaste el quiz!\nScore: '+bioQuizState.score+'/10"');}
    else showDialog('👩‍🔬 Yael:\n\n"¡Ánimo con el quiz!"');
  },
  y:()=>{ showDialog('🔬 Microscopio\n\nLAMINILLA: Muestra de tejido vegetal\n\n"Se observan células con\npared celular y cloroplastos.\nConfirmado: tejido de hoja."'); },

  // ─── SALÓN TROFEOS ───
  '1':()=>{ showDialog('🏆 Trofeo Campeón 4° Medio 2025\n\n"Este trofeo pertenece a los\nalumnos que nunca se rindieron.\n\n4° Medio — Año 2025\nCampeonato Regional"'); },
  '2':()=>{ showDialog('🏅 Trofeo Alianza Vikingos 2026\n\n"Premio a la mejor alianza\nestratégica del año escolar.\n\nAño: 2026\n\n(¿Recuerdas este año?...)'); },

  // ─── SALA VELA ───
  // (handled via N transition to sala_vela map)

  // ─── RESERVA ───
  l:()=>{
    if(['casa_1','casa_2','casa_3'].includes(currentMap)){ stats.hp=Math.min(stats.maxHp,stats.hp+40); stats.mp=Math.min(stats.maxMp,stats.mp+20); syncUI(); showDialog('🛏️ CAMA\n\nDescansas un momento.\n❤️ +40 HP  💙 +20 MP'); return; }
    if(currentMap!=='reserva') return;
    const rm=progress.rangerMissions;
    if(rm.silva===2&&!rm.silvaRewarded){rm.silvaRewarded=true;coins+=60;stats.maxHp+=10;stats.hp=Math.min(stats.maxHp,stats.hp+10);syncUI();showDialog('🌿 Silva:\n\n¡Llegaste al Valle!\n\n🪙 +60 monedas\n❤️ +10 HP máximo');}
    else if(rm.silva===1){showDialog('🌿 Silva:\n\nExplora hasta columna 280+\ny regresa.');}
    else{rm.silva=1;acceptQuest('silva');showDialog('🌿 Guardabosques Silva\n\n📋 Explora el Valle:\nLlega hasta columna 280+.\n\n🪙 Premio: 60 monedas + 10HP');}
  },
  u:()=>{
    if(currentMap!=='reserva') return;
    const rm=progress.rangerMissions;
    if(rm.rojas===2&&!rm.rojasRewarded){rm.rojasRewarded=true;coins+=80;stats.atk+=3;syncUI();showDialog('🦅 Rojas:\n\n¡Llegaste al Bosque Primario!\n\n🪙 +80 monedas\n⚔️ +3 ATK');}
    else if(rm.rojas===1){showDialog('🦅 Rojas:\n\nLlega a la columna 295+\ny regresa.');}
    else{rm.rojas=1;acceptQuest('rojas');showDialog('🦅 Guardabosques Rojas\n\n📋 Llega al Bosque Primario:\nColumna 295+.\n\n🪙 Premio: 80 monedas + 3ATK');}
  },
  '0':()=>{
    if(progress.lakeChestreward){showDialog('📦 Cofre de la Isla\n\nYa fue abierto. 🏴‍☠️');return;}
    showDialog('🔒 COFRE MISTERIOSO\n\nCódigo de 4 dígitos.\n\nPista: "El año en que los\nVikingos ganaron la Alianza\n(Salón de Trofeos)."',
      [{text:'📱 2025',action:()=>showDialog('❌ Incorrecto.')},
       {text:'📱 2026',action:()=>{progress.lakeChestreward=true;coins+=100;stats.maxHp+=20;stats.hp=Math.min(stats.maxHp,stats.hp+20);inventory.push({id:'tesoro_lago',name:'Tesoro del Lago',emoji:'🏴‍☠️',type:'quest',desc:'Isla del lago'});syncUI();showDialog('✅ ¡CÓDIGO CORRECTO!\n\n📦 COFRE ABIERTO\n\n🪙 +100 monedas\n❤️ +20 HP máximo\n🏴‍☠️ Tesoro del Lago');}},
       {text:'📱 2027',action:()=>showDialog('❌ Incorrecto.')},
       {text:'Dejarlo.',action:()=>{}}]);
  },
  o:()=>{ if(!progress._rockCollected){progress._rockCollected=true;inventory.push({id:'SiO2',name:'Sílice',emoji:'🏖️',type:'resource',desc:'SiO₂'});inventory.push({id:'CaCO3',name:'Calcita',emoji:'🪨',type:'resource',desc:'CaCO₃'});if(Math.random()<.4)inventory.push({id:'Fe2O3',name:'Mineral Hierro',emoji:'🔩',type:'resource',desc:'Fe₂O₃'});syncUI();showDialog('⛏️ Minerales recolectados!\n\n🏖️ Sílice ×1\n🪨 Calcita ×1');}else{progress._rockCollected=false;showDialog('🪨 Afloramiento Rocoso\n\nYa recolectaste minerales.\nVuelve más tarde.');} },
  '@':()=>openPharmacy(),
  '%':()=>openCOVIDSign(),
  M:()=>openMine(),
  F:()=>openForge(),
  W:()=>{ if(currentMap==='reserva'||currentMap==='plaza'){ progress._tallerOrigin={map:currentMap,x:player.x,y:player.y}; transitionTo('taller',7,8); setTimeout(()=>showDialog('🪚 TALLER DE CARPINTERÍA\n\nBancos de trabajo, madera apilada\ny una estación de tallado 🪚.\n\nAcércate a la estación para crear.'),400); } else if(['laboratorio','taller','casa_1','casa_2','casa_3'].includes(currentMap)){} else showDialog('🪚 Carpintería\nNo disponible aquí.'); },


  
  r:()=>{
    if(currentMap!=='pasillo'){showDialog('🪖 Tío Antonio');return;}
    const am=progress.antonioMission||0;
    const ak=progress.antonioKills||0;
    const PHRASES=[
      '¡ATENCIÓN SOLDADO! ¡Pies juntos!',
      '¡Sin disciplina no hay progreso!',
      '¡El orden es la base del éxito!',
      '¡Arriba esa cabeza, muchacho!',
      '¡Las excusas son para los débiles!',
      '¡Un hombre se mide en el campo de batalla!',
    ];
    const fp=PHRASES[Math.floor(Math.random()*PHRASES.length)];
    if(am===0){
      showDialog('🪖 TÍO ANTONIO\n\n"¡FIRMES! Soy el Inspector Antonio.\nLlevo 20 años manteniendo\nel orden en este pasillo.\n\n'+fp+'\n\n¡Necesito que derrotes a 2 enemigos\nen este pasillo!\n¿Puedes, SOLDADO?"',[
        {text:'⚔️ ¡A sus órdenes!',action:()=>{
          progress.antonioMission=1;
          progress.antonioKills=0;
          if(typeof acceptQuest==='function') acceptQuest('antonio');
          showDialog('🪖 Antonio:\n\n"¡Bien! ¡Sin piedad!\n¡El pasillo debe estar limpio!\n\nPisa el pasto del pasillo\npara encontrar enemigos.\n\n¡DISCIPLINA Y HONOR!"');
        }},
        {text:'Ahora no.',action:()=>showDialog('🪖 Antonio:\n\n"¡Un soldado no se rinde!\nVuelve cuando estés listo."')}
      ]);
    } else if(am===1){
      const left=Math.max(0,2-ak);
      showDialog('🪖 TÍO ANTONIO\n\n"¡Reporte, soldado!\n\n'+ak+'/2 enemigos derrotados.\n\n'+(left>0?'¡Quedan '+left+'! ¡'+fp+'!':'¡MISIÓN CUMPLIDA!\n¡Repórtate para el premio!')+'"',
        ak>=2?[{text:'✅ Reportarse',action:()=>{progress.antonioMission=2;}}]:[]);
    } else if(am===2&&!progress.antonioRewarded){
      progress.antonioRewarded=true;
      coins+=10; syncUI();
      if(typeof completeQuest==='function') completeQuest('antonio');
      showDialog('🪖 TÍO ANTONIO\n\n"¡EXCELENTE, SOLDADO!\n¡Eso es lo que necesitamos!\n\n🪙 +10 monedas\n\n'+fp+'\n\n¡DESCANSE!\nPero siempre listo."');
    } else {
      showDialog('🪖 Tío Antonio:\n\n"'+fp+'\n\n¡Siga el ejemplo, muchacho!\nEl pasillo depende de nosotros."');
    }
  },
  '$':()=>{
    if(currentMap!=='pasillo'){showDialog('👴 Jorge');return;}
    const jp=progress.jorgeIdx||0;
    const msgs=[
      '👴 Jorge\n\n(Se ajusta los overoles)\n\n"Don Antonio es bravo pero\ntiene razón. Yo llevo 30 años\naquí con él.\n\nSi le dice que haga algo,\nhágalo no más... "\n\n(Sigue barriendo)',
      '👴 Jorge\n\n"¿Lo mandó Don Antonio?\n¡Ese hombre es tremendo!\n\nCuando yo era joven también\nle hacía caso. Y míreme...\n30 años después, ¡aquí sigo!\n\n(Ríe con tos)',
      '👴 Jorge\n\n"¿Ve este overol?\nMi señora me lo regaló hace\n15 años. Todavía aguanta.\n\nAsí tiene que ser usted,\njoven. ¡Resistente!"',
      '👴 Jorge\n\n(Susurra)\n\n"Le cuento un secreto...\nDon Antonio en el fondo\nes buena persona.\n\nSolo le gusta mandar.\n¡Pero tiene buen corazón!"',
      '👴 Jorge\n\n"Hoy me levanté a las 5am.\nDon Antonio necesitaba\nque preparara el pasillo.\n\n30 años haciendo eso...\n¡Y no me arrepiento!"',
    ];
    progress.jorgeIdx=(jp+1)%msgs.length;
    showDialog(msgs[jp]);
  },

  '^':()=>{
    if(currentMap==='pasillo') transitionTo('segundo_piso',1,4);
    else if(currentMap==='segundo_piso') transitionTo('pasillo',6,2);
    else showDialog('Escalera');
  },
  '!':()=>{
    // Profesor Jorge — 5to Básico, Región de Atacama
    if(currentMap!=='sala_5to'){showDialog('👨‍🏫 Profesor Jorge');return;}
    const msgs=[
      '👨‍🏫 Profesor Jorge\n(5° Básico — Región de Atacama)\n\n"Buenos días! Hoy veremos\nla geografía del norte de Chile.\n\nEl Desierto de Atacama es\nel más árido del mundo:\n< 1mm de lluvia al año.\n\n¿Saben qué fauna vive allí?"',
      '👨‍🏫 Jorge:\n\n"El norte de Chile tiene\ngrandes reservas de cobre.\n\nAntofagasta produce el 30%\ndel cobre mundial.\n\nLa minería es clave para\nla economía nacional."',
      '👨‍🏫 Jorge:\n\n"¿Conocen los geoglifos\nde Atacama?\n\nSon dibujos enormes en\nlas laderas de los cerros.\nHechos por culturas prehispánicas.\n\n¡La historia está en las rocas!"',
    ];
    const ji=progress.jorgeProfIdx||0;
    progress.jorgeProfIdx=(ji+1)%msgs.length;
    showDialog(msgs[ji]);
  },
  '~':()=>{
    // Profesor Felipe — 6to Básico, Región Metropolitana (protagonista)
    if(currentMap!=='sala_6to'){showDialog('👨‍🏫 Profe Felipe');return;}
    const msgs=[
      '👨‍🏫 PROFE FELIPE\n(6° Básico — Región Metropolitana)\n\nEsta es TU SALA, profe.\n\nSantiago tiene 7 millones\nde habitantes. La Región\nMetropolitana concentra el\n40% del PIB de Chile.\n\n¡Aquí enseñas geografía\nurbana y ciudadanía!',
      '👨‍🏫 Felipe:\n\n"La cordillera de los Andes\nrodea Santiago. En días\nclaro se ve el cerro El Plomo\n(5.424 msnm).\n\nEl smog es un problema\nreal de la ciudad."',
      '👨‍🏫 Felipe:\n\n"La Región Metropolitana\ntiene los mejores colegios\ny universidades del país.\n\nPero también la mayor\ndesigualdad educacional.\n\n¡Por eso importa lo que\nnosotros hacemos!"',
    ];
    const fi=progress.felipeSalaIdx||0;
    progress.felipeSalaIdx=(fi+1)%msgs.length;
    showDialog(msgs[fi]);
  },
  '?':()=>{
    // Profesor José — 7mo Básico, Región del Maule
    if(currentMap!=='sala_7mo'){showDialog('👨‍🏫 Profesor José');return;}
    const msgs=[
      '👨‍🏫 Profesor José\n(7° Básico — Región del Maule)\n\n"¡Hola chiquillos!\n\nLa Región del Maule produce\nel 70% del vino que Chile\nexporta al mundo.\n\nValle Central: suelo volcánico\nideal para la vid. Clima\nmediterráneo perfecto."',
      '👨‍🏫 José:\n\n"Talca es la capital\ndel Maule.\n\n(Sonríe)\n\nEl río Maule fue el límite\nsur del Imperio Inca.\n¡Los mapuches los detuvieron\nahí mismo!"',
      '👨‍🏫 José:\n\n"El terremoto del 2010\nafectó mucho esta región.\n\nM8.8 — uno de los más\nfuertes en la historia.\n\nNuestros suelos hablan\nde la actividad volcánica."',
    ];
    const jj=progress.joseProfIdx||0;
    progress.joseProfIdx=(jj+1)%msgs.length;
    showDialog(msgs[jj]);
  },
  '=':()=>{
    if(STATION_MAPS_SET&&STATION_MAPS_SET.has(currentMap)){openMetro();return;}
  },
  'L':()=>{
    // Profesora Camila — 8vo Básico, Región de La Araucanía
    if(STATION_MAPS_SET&&STATION_MAPS_SET.has(currentMap)){openMetro();return;}
    if(currentMap!=='sala_8vo'){showDialog('👩‍🏫 Profesora Camila');return;}
    const msgs=[
      '👩‍🏫 Profesora Camila\n(8° Básico — Región de La Araucanía)\n\n"¡Bienvenidos!\n\nLa Araucanía es la región\ncon mayor presencia del\npueblo mapuche de Chile.\n\nEl rehue, el kultrun y el\nchemamull son símbolos\nde la cultura mapuche."',
      '👩‍🏫 Camila:\n\n"Temuco es la capital.\nEl nombre significa\n"lugar de temu" (árbol nativo).\n\nLa región tiene los bosques\nvaldivianos más extensos.\n\nLlueve 2.500mm al año —\nmuy diferente al norte!"',
      '👩‍🏫 Camila:\n\n"El mapudungun es el idioma\nde los mapuche.\n\nHoy hay esfuerzos por\npreservarlo en los colegios.\n\nLa interculturalidad es\nclave en nuestra educación."',
    ];
    const ci=progress.camilaIdx||0;
    progress.camilaIdx=(ci+1)%msgs.length;
    showDialog(msgs[ci]);
  },
  z:()=>{ if(['biologia','secretaria','sala_cont','biblioteca'].includes(currentMap)){ progress._labOrigin={map:currentMap,x:player.x,y:player.y}; transitionTo('laboratorio',7,8); setTimeout(()=>showDialog('🔬 LABORATORIO DE CIENCIAS\n\nMesas con material, microscopios\ny una estación de síntesis ⚗️.\n\nAcércate a la estación para crear.'),400); } else showDialog('🔬 Laboratorio\nNo disponible aquí.'); },
  j:()=>{ if(currentMap==='reserva'&&progress.rangerMissions?.martinez===1){if(!progress._obs)progress._obs={};progress._obs.j=true;if(progress._obs.j&&progress._obs.i&&progress._obs.x){progress.rangerMissions.martinez=2;showDialog('✅ ¡3 especies observadas!\nRegresa con Martínez.');return;}}
    const birds=['🐦 Zorzal (Turdus falcklandii)\n\nEl pájaro más común del bosque.','🦜 Chucao\n\nAve endémica del bosque nativo.','🐦 Tenca\n\nAve endémica de Chile central.','🦅 Peuco\n\nRapaz del bosque esclerófilo.'];
    showDialog(birds[Math.floor(Math.random()*birds.length)]);
  },
  i:()=>{ if(currentMap==='reserva'&&progress.rangerMissions?.martinez===1){if(!progress._obs)progress._obs={};progress._obs.i=true;if(progress._obs.j&&progress._obs.i&&progress._obs.x){progress.rangerMissions.martinez=2;showDialog('✅ ¡3 especies observadas!\nRegresa con Martínez.');return;}}
    const ins=['🦋 Mariposa del Peumo\n\nPolinizador del bosque nativo.','🐝 Abeja Nativa\n\nPolinizador esencial.','🪲 Escarabajo del Quillay\n\nDescomponedor clave.','🦗 Grillo Escapulario\n\nAnnuncia la lluvia.'];
    showDialog(ins[Math.floor(Math.random()*ins.length)]);
  },
  x:()=>{ if(currentMap==='reserva'&&progress.rangerMissions?.martinez===1){if(!progress._obs)progress._obs={};progress._obs.x=true;if(progress._obs.j&&progress._obs.i&&progress._obs.x){progress.rangerMissions.martinez=2;showDialog('✅ ¡3 especies observadas!\nRegresa con Martínez.');return;}} showDialog('🦊 ZORRO CHILLA\n(Lycalopex griseus)\n\nMamífero nativo del bosque.\nDispersor de semillas del Boldo.'); },
  h:()=>{
    if(currentMap!=='reserva') return;
    const dx=[0,0,-1,1][['up','down','left','right'].indexOf(player.dir)];
    const dy=[-1,1,0,0][['up','down','left','right'].indexOf(player.dir)];
    const fx=player.x+dx, fy=player.y+dy;
    const key=`${fx},${fy}`;
    if(!progress.gardenTutorial){progress.gardenTutorial=true;showDialog('🌱 HUERTO DE LA RESERVA\n\nAquí puedes cultivar semillas.\n\nCómpralas en la tienda de Kella.');return;}
    const plot=progress.garden[key];
    const stage=plot?Math.min(3,Math.floor((tick-plot.planted)/1500)):0;
    if(!plot){
      const seeds=inventory.filter(i=>i.type==='seed');
      if(!seeds.length){showDialog('🌱 Parcela vacía\n\nNo tienes semillas.\nCómpralas en la tienda de Kella.');return;}
      const opts=seeds.slice(0,4).map(s=>({text:`${s.emoji} ${s.name}`,action:()=>{const si=inventory.findIndex(i=>i.id===s.id);if(si>=0)inventory.splice(si,1);progress.garden[key]={seedId:s.id,planted:tick};if(s.id==='semilla_tomate'&&progress.gonzaloMission===1){const tc=Object.values(progress.garden).filter(g=>g.seedId==='semilla_tomate').length+1;updateQuestStep('gonzalo',2);if(tc>=5){progress.gonzaloMission=2;updateQuestStep('gonzalo',2);}}showDialog(`${s.emoji} ¡Semilla plantada!`);}}));
      opts.push({text:'Cancelar',action:()=>{}});
      showDialog('🌱 ¿Qué semilla plantar?',opts);
    } else if(stage<3){
      const pct=Math.floor((tick-plot.planted)/4500*100);
      const em={semilla_tomate:'🍅',semilla_lechuga:'🥬',semilla_papa:'🥔',semilla_zanahoria:'🥕',semilla_cebolla:'🧅'}[plot.seedId]||'🌱';
      showDialog(`${em} Creciendo...\n\n[${'█'.repeat(Math.floor(pct/10))}${'░'.repeat(10-Math.floor(pct/10))}] ${Math.min(99,pct)}%\n\nEtapa ${stage}/3`);
    } else {
      const rv={semilla_tomate:{id:'tomate',name:'Tomate',emoji:'🍅',type:'food',use:()=>{stats.hp=Math.min(stats.maxHp,stats.hp+12);stats.hunger=Math.min(stats.maxHunger,stats.hunger+20);syncUI();showDialog('🍅 +12 HP | +20 🍽️');}},semilla_lechuga:{id:'lechuga',name:'Lechuga',emoji:'🥬',type:'food',use:()=>{stats.hp=Math.min(stats.maxHp,stats.hp+18);stats.hunger=Math.min(stats.maxHunger,stats.hunger+30);syncUI();showDialog('🥬 +18 HP | +30 🍽️');}},semilla_papa:{id:'papa',name:'Papa',emoji:'🥔',type:'food',use:()=>{stats.hp=Math.min(stats.maxHp,stats.hp+25);stats.hunger=Math.min(stats.maxHunger,stats.hunger+45);syncUI();showDialog('🥔 +25 HP | +45 🍽️');}},semilla_zanahoria:{id:'zanahoria',name:'Zanahoria',emoji:'🥕',type:'food',use:()=>{stats.mp=Math.min(stats.maxMp,stats.mp+15);stats.hunger=Math.min(stats.maxHunger,stats.hunger+25);syncUI();showDialog('🥕 +15 MP | +25 🍽️');}},semilla_cebolla:{id:'cebolla',name:'Cebolla',emoji:'🧅',type:'food',use:()=>{stats.atk+=2;stats.hunger=Math.min(stats.maxHunger,stats.hunger+15);syncUI();showDialog('🧅 +2 ATK | +15 🍽️');}}};
      const r2=rv[plot.seedId];
      if(r2){inventory.push({...r2});delete progress.garden[key];syncUI();showDialog(`${r2.emoji} ¡COSECHA LISTA!\n\n${r2.name} añadida al inventario.`);}
    }
  },
  petshop:()=>{ if(coins>=8){coins-=8;inventory.push({id:'comida_gato',name:'Comida de Gato',emoji:'🐱',type:'item',desc:'Para Mochi y Pichi'});progress.dahianCatFood=true;syncUI();showDialog('🐱 Comida de Gato comprada!\n🪙 -8 monedas\nLlévala a Dahian.');}else showDialog('Necesitas 8 🪙.'); },
};;

