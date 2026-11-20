// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — interact(), salidas entre mapas, pasos
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function interact(){
  if(STATE!=='exploring') return;
  const [dx,dy]=DIRS[player.facing],tx=player.x+dx,ty=player.y+dy;
  // ── BuinZoo: interacciones propias (no usar NPC_ACT global) ──
  if(currentMap==='buinzoo'){ const zt=MAPS.buinzoo[ty]?.[tx]; if(zt&&buinzooInteract(zt)) return; }
  NPC_ACT[MAPS[currentMap][ty]?.[tx]]?.();
}

// ═══ MOVIMIENTO & SALIDAS ═══
function checkMapExit(){
  // ── Laboratorio / Taller (salas dedicadas) ──
  if(currentMap==='laboratorio'&&MAPS.laboratorio[player.y]?.[player.x]==='E'){
    const o=progress._labOrigin||{map:'biologia',x:1,y:2}; transitionTo(o.map,o.x,Math.min(o.y+1,9)); return true;
  }
  if(currentMap==='taller'&&MAPS.taller[player.y]?.[player.x]==='E'){
    const o=progress._tallerOrigin||{map:'reserva',x:3,y:28}; transitionTo(o.map,o.x,o.y); return true;
  }
  // ── Salas dedicadas (lab/taller) ──
  if(currentMap==='laboratorio'&&MAPS.laboratorio[player.y]?.[player.x]==='E'){
    const o=progress._labOrigin||{map:'biologia',x:5,y:5}; transitionTo(o.map,o.x,o.y); return true;
  }
  if(currentMap==='taller'&&MAPS.taller[player.y]?.[player.x]==='E'){
    const o=progress._tallerOrigin||{map:'reserva',x:5,y:5}; transitionTo(o.map,o.x,o.y); return true;
  }
  // ── VA Sector Norte ──
  if(currentMap==='estacion_villa'&&MAPS.estacion_villa[player.y]?.[player.x]==='E'){
    transitionTo('sector_norte',24,14); return true;
  }
  // ── Estaciones metro ──
  if(currentMap==='estacion_quilpue'&&MAPS.estacion_quilpue[player.y]?.[player.x]==='E'){
    transitionTo('estacion_villa',5,5); return true;
  }
  if(currentMap==='estacion_vina'&&MAPS.estacion_vina[player.y]?.[player.x]==='E'){
    transitionTo('estacion_villa',5,5); return true;
  }
  if(currentMap==='estacion_valpo'&&MAPS.estacion_valpo[player.y]?.[player.x]==='E'){
    transitionTo('estacion_villa',5,5); return true;
  }
  if(currentMap==='plaza'&&MAPS.plaza[player.y]?.[player.x]==='n'){
    transitionTo('sector_norte',1,2);
    setTimeout(()=>showDialog('🏘️ VA SECTOR NORTE\n\nBarrio antiguo de casas medievales\njunto a la Plaza Belén.\n\nAlgunas puertas se abren.\n¡Explora e interactúa!'),400); return true;
  }
  if(currentMap==='sector_norte'&&MAPS.sector_norte[player.y]?.[player.x]==='B'){
    transitionTo('plaza',36,5); return true;
  }
  // ── BUINZOO: entrada desde Plaza (Z) y salida (E) ──
  if(currentMap==='plaza'&&MAPS.plaza[player.y]?.[player.x]==='Z'){
    const first=!progress.buinzooVisited; if(first)progress.buinzooVisited=true;
    transitionTo('buinzoo',10,18);
    if(first)setTimeout(()=>showDialog('🦁 BUINZOO\n\n¡Bienvenido al zoológico de Villa Alemana!\n\nRecorre el PASILLO CENTRAL y observa\nlos animales a ambos lados.\n\n⚠️ Algunos animales escapan: pelea con\ncuidado. Aprende sobre CONSERVACIÓN.\n\n🛖 Tienda Safari (arriba a la derecha)\n🦏 Jefes en el centro.'),450);
    return true;
  }
  if(currentMap==='buinzoo'&&MAPS.buinzoo[player.y]?.[player.x]==='E'){
    transitionTo('plaza',7,10); return true;
  }
  if(currentMap==='sector_norte'&&MAPS.sector_norte[player.y]?.[player.x]==='N'){
    if(!progress.alexBossDefeated){
      player.y=Math.max(1,player.y-1);
      showDialog('🔒 ESTACIÓN CERRADA\n\nEl guardia no te deja pasar:\n"La estación está custodiada por\nel Profesor Alex en la Plaza Belén.\n\n¡Derrótalo primero!"');
      return true;
    }
    transitionTo('estacion_villa',5,5);
    setTimeout(()=>showDialog('🚉 ESTACIÓN DE VILLA ALEMANA\n\nAntiguo andén de piedra y\nrieles de hierro. ¡Por fin abierta!'),400); return true;
  }
  if(currentMap==='sector_norte'&&MAPS.sector_norte[player.y]?.[player.x]==='D'){
    const houses=['casa_1','casa_2','casa_3'];
    const h=houses[(player.x+player.y)%3];
    progress._lastHouse={x:player.x,y:player.y};
    transitionTo(h,5,4); return true;
  }
  if(['casa_1','casa_2','casa_3'].includes(currentMap)&&MAPS[currentMap][player.y]?.[player.x]==='E'){
    const lh=progress._lastHouse||{x:5,y:3};
    transitionTo('sector_norte',lh.x,lh.y+1); return true;
  }


  // ─── SEGUNDO PISO ────────────────────────────────────────
  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='^'){
    transitionTo('segundo_piso',3,4);
    setTimeout(()=>showDialog('🏫 SEGUNDO PISO\n\nAquí están las aulas de\n5°, 6°, 7° y 8° Básico.\n\nEl profe Felipe tiene su sala\nen 6° Básico.'),500);
    return true;
  }
  if(currentMap==='segundo_piso'){
    if(MAPS.segundo_piso[player.y]?.[player.x]==='^'){
      transitionTo('pasillo',7,3); return true;
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

  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='>'){
    transitionTo('jardin_eden',11,10);
    setTimeout(()=>showDialog('🌿 JARDÍN DEL EDÉN\n\nVolviste al jardín de inicio.\n\n¡Recarga energías y regresa!'),400);
    return true;
  }
  if(currentMap==='jardin_eden'){
    if(player.y===12&&MAPS.jardin_eden[12]?.[player.x]==='E'){
      if(!progress.edenDone){
        progress.edenDone=true;
        setTimeout(()=>showDialog('🏫 ¡Bienvenido al Colegio!\n\nRecuerda:\n• Habla con NPCs (OK)\n• Explora cada sala\n• Kella vende pociones\n• Vacúnate en la Farmacia\n\n¡Buena suerte, Profe Felipe!'),400);
      }
      transitionTo('pasillo',20,2); return true;
    }
    if(MAPS.jardin_eden[player.y]?.[player.x]==='H'){
      transitionTo('salon_trofeos',7,2);
      setTimeout(()=>showDialog('🏆 SALÓN DE TROFEOS\n\nAcceso directo desde el Jardín.'),400);
      return true;
    }
  }
  if(currentMap==='pasillo'){
    if(player.y===0&&MAPS.pasillo[0][player.x]==='E'){ if(!progress.canchaVisited){progress.canchaVisited=true; transitionTo('cancha',9,8); setTimeout(()=>showDialog('¡Bienvenido a la Cancha! 🏀\n\nHay un cofre misterioso en el centro.\nKella vende pociones a la derecha.\n¡Cuidado con el pasto verde!'),300);} else transitionTo('cancha',9,8); return true; }
    if(player.x===39&&MAPS.pasillo[player.y]?.[39]==='E'){ if(!progress.biblioVisited){progress.biblioVisited=true; transitionTo('biblioteca',1,5); setTimeout(()=>showDialog('¡Bienvenido a la Biblioteca! 📚\n\nLa Tía Jeanette está al centro.\nTiene chistes y acepta códigos.\nSalida: puerta dorada a la izquierda.'),300);} else transitionTo('biblioteca',1,5); return true; }
    if(player.x===15&&player.y===6){ if(!hasItem('vela')){player.x=14; showDialog('Está muy oscuro.\nNecesitas la 🕯 Vela de Sabiduría.\n\nHabla con la Tía Claudita.');} else {transitionTo('sala_vela',4,7); setTimeout(()=>showDialog('Entras a la Sala Secreta...\nLa vela ilumina las paredes.'),300);} return true; }
    // Plaza Belén ← puertas izquierdas (x=0)
    if(player.x===0&&MAPS.pasillo[player.y]?.[0]==='E'){
      const first=!progress.plazaVisited; if(first)progress.plazaVisited=true;
      transitionTo('plaza',2,1);
      if(first) setTimeout(()=>showDialog('🌳 PLAZA BELÉN\n\nBienvenido al espacio verde del colegio.\nCamina por el PASTO ALTO para encontrar\nenemigos y posibles compañeros de equipo!\n\n👥 Renata, Isi y Este Dev te esperan.'),400);
      return true;
    }
  }
  // Plaza → Pasillo
  if(currentMap==='plaza'){
    if(player.y===14&&MAPS.plaza[14]?.[player.x]==='E'){transitionTo('pasillo',2,8);return true;}
    if(player.x===0&&MAPS.plaza[player.y]?.[0]==='E'){transitionTo('pasillo',2,8);return true;}
  }
  // Bottom row exits (plaza)
  if(currentMap==='pasillo'&&player.y===15&&MAPS.pasillo[15]?.[player.x]==='E'){
    transitionTo('plaza',1,3); return true;
  }
  if(currentMap==='pasillo'&&(MAPS.pasillo[player.y]?.[player.x]==='Z')){
    const first=!progress.salaContVisited; if(first) progress.salaContVisited=true;
    transitionTo('sala_cont',4,7); startSalaContMusic();
    if(first) setTimeout(()=>showDialog('💜 SALA DE CONTENCIÓN\n\nEntraste a un espacio de calma y apoyo.\nConstanza y Paula te reciben.\n\n🎵 Escucha la música... respira.'),350);
    return true;
  }
  if(currentMap==='sala_cont'&&player.y===0&&(MAPS.sala_cont[0][player.x]==='E')){
    stopSalaContMusic(); transitionTo('pasillo',8,14); return true;
  }
  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='S'){
    transitionTo('secretaria',5,7);
    return true;
  }
  if(currentMap==='plaza'&&MAPS.plaza[player.y]?.[player.x]==='B'){
    const first=!progress.centroVisited; if(first)progress.centroVisited=true;
    transitionTo('centro_villa',14,6);
    if(first)setTimeout(()=>showDialog('\u{1F3D8} CENTRO VILLA ALEMANA\n\nInspectores municipales\nfiscalizan el tiempo de juego.\n\n+1 hora = multa de 30 monedas'),350);
    return true;
  }
  if(currentMap==='centro_villa'&&player.y===11&&MAPS.centro_villa[11]?.[player.x]==='E'){transitionTo('plaza',38,6);return true;}
  if(currentMap==='centro_villa'&&(player.x===0||player.x===29)&&MAPS.centro_villa[player.y]?.[player.x]==='E'){transitionTo('plaza',38,5);return true;}
  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='8'){
    const first=!progress.bioVisited; if(first)progress.bioVisited=true;
    transitionTo('biologia',6,5);
    if(first)setTimeout(()=>showDialog('🔬 BIOLOGÍA DE ECOSISTEMAS\n\n¡Bienvenido al laboratorio!\n\nYael te espera para evaluar\ntus conocimientos sobre\necosistemas y evolución.'),300);
    return true;
  }
  if(currentMap==='biologia'&&player.y===0&&MAPS.biologia[0]?.[player.x]==='9'){
    transitionTo('reserva',2,24);
    if(!progress.reservaVisited){progress.reservaVisited=true;
      setTimeout(()=>showDialog('🌿 RESERVA ECOLÓGICA\nDe Villa Alemana\n\nBosque Esclerófilo Nativo\nde Chile Central.\n\nEspecies: Quillay, Peumo,\nLitre, Boldo, Palma Chilena.\n\n⚠️ Zona de encuentros silvestres.\nExplora con cuidado.'),400);}
    return true;
  }
  if(currentMap==='reserva'&&player.x<=1&&(player.y===24||player.y===25)&&MAPS.reserva[player.y]?.[0]==='E'){
    transitionTo('biologia',6,8); return true;
  }
  if(currentMap==='biologia'&&player.y===9&&MAPS.biologia[9]?.[player.x]==='E'){
    transitionTo('pasillo',38,1); return true;
  }
  if(currentMap==='secretaria'&&player.y===9&&MAPS.secretaria[9]?.[player.x]==='E'){
    transitionTo('pasillo',38,4); return true;
  }
  if(currentMap==='biblioteca'&&MAPS.biblioteca[player.y]?.[player.x]==='H'){
    const first=!progress.salonVisited; if(first)progress.salonVisited=true;
    transitionTo('salon_trofeos',7,2);
    if(first)setTimeout(()=>showDialog('🏆 SALÓN DE TROFEOS\n\nBienvenido al salón de la fama\ndel colegio.\n\n¡Explora los trofeos con OK!'),300);
    return true;
  }
  if(currentMap==='salon_trofeos'&&player.y===11&&MAPS.salon_trofeos[11]?.[player.x]==='E'){
    transitionTo('biblioteca',18,5); return true;
  }
  if(currentMap==='cancha'&&MAPS.cancha[player.y]?.[player.x]==='E'){ transitionTo('pasillo',20,2); return true; }
  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='N'){
    transitionTo('sala_vela',4,7); return true;
  }
  if(currentMap==='sala_vela'&&player.y===8){ transitionTo('pasillo',20,5); return true; }
  if(currentMap==='pasillo'&&MAPS.pasillo[player.y]?.[player.x]==='V'){
    if(!progress.alexBossDefeated){player.x=13;showDialog('🔒 Acceso bloqueado.\n\n¡Derrota al Profe Alex\nprimero!\n\n🎸 Busca a Alex en la Plaza.');}
    else{ transitionTo('estacion_villa',5,5); setTimeout(()=>showDialog('🚂 ESTACIÓN VILLA ALEMANA\n\n¡Llegaste al pueblo!'),400); }
    return true;
  }
  if(currentMap==='estacion_villa'&&player.y===9&&MAPS.estacion_villa[9]?.[player.x]==='E'){
    transitionTo('pasillo',22,5); return true;
  }
  if(currentMap==='biblioteca'&&player.x===0&&player.y===5){ transitionTo('pasillo',38,2); return true; }
  return false;
}
function checkBlueCoin(){
  if(currentMap!=='pasillo'||progress.claudita!==1) return;
  const i=BCPOS.findIndex((cp,i)=>cp.x===player.x&&cp.y===player.y&&!bCC[i]);
  if(i>=0){ bCC[i]=true; progress.blueCoins++; addFloat(`+🔵 (${progress.blueCoins}/10)`,(player.x-camera.x)*TS+4,(player.y-camera.y)*TS+TS/2); syncUI(); }
}
function move(dx,dy,dir){
  if(STATE!=='exploring') return;
  player.facing=dir; player.dir=dir;
  const nx=player.x+dx,ny=player.y+dy;
  const map=MAPS[currentMap],mW=map[0].length,mH=map.length;
  if(nx<0||nx>=mW||ny<0||ny>=mH) return;
  const t=map[ny][nx];
  // Muebles sólidos en casas (b=estantería pese a ser flor en exterior)
  const _casa=['casa_1','casa_2','casa_3'].includes(currentMap);
  if(_casa && 'bcmtl'.includes(t)) return;
  const _lab=currentMap==='laboratorio'||currentMap==='taller';
  if(_lab && 'btkWmsiQR'.includes(t)) return;
  // Paredes de casas sólidas en Sector Norte (H es walkable por biblioteca)
  if(currentMap==='sector_norte' && 'HiYyO'.includes(t)) return;
  // BuinZoo: animales, recintos, bancas, tienda y jefe son sólidos (se interactúa al frente)
  if(currentMap==='buinzoo' && BUINZOO_SOLID.has(t)) return;
  if(!WALKABLE.has(t)&&!(inBoat&&(t==='w'||t==='D'||t==='0'))) return;
  if(inBoat&&t!=='w') inBoat=false;
  player.x=nx; player.y=ny; player.steps++; if((stats.hunger||100)>0) stats.hunger=Math.max(0,(stats.hunger||100)-0.08);
  updateCamera(); if(checkMapExit()) return; checkBlueCoin(); checkCandySpot(); checkAntiPickup();
  if(tick%90===0) checkCOVIDProximityAlert();
  if(currentMap==='reserva'){const rm=progress.rangerMissions;
    if(rm.silva===1&&player.x>280&&rm.silva<2){rm.silva=2;showDialog('📍 ¡Valle Central explorado!\n\n✅ Muestra obtenida.\nRegresa con Guardabosques Silva.');}
    if(rm.rojas===1&&player.x>293&&rm.rojas<2){rm.rojas=2;showDialog('🌲 ¡Bosque Primario alcanzado!\n\n✅ ¡El corazón de la reserva!\nRegresa con Guardabosques Rojas.');}
  }
  // Guardabosques mission progress based on position\n  if(currentMap==='reserva'){\n    const rm=progress.rangerMissions;\n    if(rm.silva===1&&player.x>280&&rm.silva!==2){rm.silva=2;showDialog('📍 ¡Llegaste al Valle Central profundo!\n\n✅ Muestra de ecosistema obtenida.\nRegresa con el Guardabosques Silva.');}\n    if(rm.rojas===1&&player.x>293&&rm.rojas!==2){rm.rojas=2;showDialog('🌲 ¡Llegaste al Bosque Primario!\n\n✅ ¡El corazón de la reserva!\nRegresa con el Guardabosques Rojas.');}\n  }\n
  if(player.steps>=3){
    if(currentMap==='jardin_eden') { /* no enemies in Eden */ }
    else if(currentMap==='pasillo'&&t==='g'&&Math.random()<(isNight()?1/4:1/9)){ triggerEncounterFromPool(ENEMIES); return; }
    else if(currentMap==='cancha'&&t==='g'&&Math.random()<1/10){ triggerEncounterFromPool(ENEMIES); return; }
    else if(currentMap==='plaza'&&t==='g'&&Math.random()<1/8){ triggerPlazaEvent(); return; }
    else if(currentMap==='reserva'&&t==='g'&&Math.random()<(isNight()?1/3:1/6)){ triggerEncounterFromPool(RESERVA_ENEMIES); return; }
    else if(currentMap==='centro_villa'&&t==='g'&&Math.random()<(isNight()?1/4:1/7)){ triggerEncounterFromPool(CENTRO_ENEMIES); return; }
    else if(currentMap==='buinzoo'&&(t==='.'||t==='c')&&Math.random()<1/7){ triggerEncounterFromPool(BUINZOO_ENEMIES); return; }
    // Pasillo: encounters only in plant zone ('g' tiles)
    if(currentMap==='pasillo'&&t==='g'&&Math.random()<(isNight()?1/4:1/9)){ triggerEncounterFromPool(ENEMIES); return; }
    // Cancha: encounters on grass only
    if(currentMap==='cancha'&&t==='g'&&Math.random()<1/10){ triggerEncounterFromPool(ENEMIES); return; }
    // No encounters in jardin_eden, biblioteca, secretaria, sala_cont, sala_vela, biologia
    if(currentMap==='pasillo'&&t==='.'&&Math.random()<1/18){ triggerEncounterFromPool(ENEMIES.filter(e=>!['paulina','dahian','alex','delinc','ambulante','pollito'].includes(e.id))); return; }
  }
}

