// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Combate por turnos
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ BATALLA ═══

// Asegura que todo enemigo tenga los campos requeridos por el sistema de batalla
function normalizeEnemy(tmpl){
  const e={...tmpl, hp:tmpl.maxHp};
  if(!e.intro) e.intro='¡'+(e.name||'Un enemigo')+' apareció!';
  if(!e.attacks||!e.attacks.length){
    e.attacks=[{name:'Ataque',power:e.atk||5,effect:null,chance:0,msg:'atacó.'}];
  }
  if(!e.weak) e.weak='Explicar';
  if(!e.resist) e.resist='';
  if(e.def==null) e.def=2;
  if(e.xp==null) e.xp=10;
  if(e.coins==null) e.coins=3;
  return e;
}

function triggerEncounterFromPool(pool){
  if(STATE==='battle'||STATE==='dialog'||STATE==='shop') return;
  if(STATE!=='exploring') return; STATE='transition';
  const tmpl=pool[Math.floor(Math.random()*pool.length)];
  battle={enemy:normalizeEnemy(tmpl),busy:false,atkDebuff:0};
  EL.encFlash.classList.remove('flashing'); void EL.encFlash.offsetWidth; EL.encFlash.classList.add('flashing');
  EL.encFlash.addEventListener('animationend',()=>{ EL.encFlash.classList.remove('flashing'); openBattle(); },{once:true});
}
const ETYPES_MAP={cansado:'📚 Alumno',desmot:'📚 Alumno',prueba:'📚 Aula',resfrio:'🏥 Salud',celular:'📱 Distrac.',inspector_b:'👔 Admin',paulina:'📐 Docente',dahian:'🏃 Docente',alex:'🎵 Docente',delinc:'🌳 Calle',ambulante:'🌳 Calle',pollito:'🌳 Plaza',capibara:'🦁 Zoo',tapir:'🦁 Zoo',flamenco:'🦁 Zoo',mono:'🦁 Zoo',leon_marino:'🦁 Zoo',cocodrilo:'🦁 Zoo',oso:'🦁 Zoo',serpiente:'🦁 Zoo',rinoceronte:'🦏 JEFE',elefante:'🐘 JEFE'}; const ARENA_MAP={cansado:'t-aula',desmot:'t-aula',prueba:'t-aula',resfrio:'t-aula',celular:'t-aula',inspector_b:'t-admin',paulina:'t-docente',dahian:'t-docente',alex:'t-docente',delinc:'t-calle',ambulante:'t-calle',pollito:'t-plaza',capibara:'t-calle',tapir:'t-calle',flamenco:'t-calle',mono:'t-calle',leon_marino:'t-calle',cocodrilo:'t-calle',oso:'t-calle',serpiente:'t-calle',rinoceronte:'t-calle',elefante:'t-calle'};
function openBattle(){
  Music.battleIn();
  const _ab=_('btn-ascuas');if(_ab)_ab.style.display=inventory.some(i=>i.id==='ascuas_magicas')?'inline-block':'none'; STATE='battle'; EL.battle.classList.add('on'); PARTY_MEMBERS.forEach(m=>m.usedThisBattle=false); battle.atkDebuff=battle.atkDebuff||0;
  const e=battle.enemy;
  const alexC=_('alex-c'); if(alexC) alexC.style.display=e.id==='alex_boss'?'block':'none';
  EL.bArena.className=''; EL.bArena.classList.add(ARENA_MAP[e.id]||'t-aula');
  if(EL.bEnemyBg) EL.bEnemyBg.style.background=`radial-gradient(circle,`+e.glow.replace(/[0-9.]+\)$/,'.45)')+` 0%,transparent 70%)`;
  if(EL.bEtype) EL.bEtype.textContent=ETYPES_MAP[e.id]||'❓ Desconocido'; EL.bEs.textContent=e.emoji; EL.bEs.style.filter=`drop-shadow(0 0 20px ${e.glow})`; syncBE(); syncBP(); hideBact(); typeMsg(e.intro,()=>typeMsg('¿Qué hará Profe Felipe?',showBact)); }
function syncBE(){ const e=battle.enemy,p=e.hp/e.maxHp; EL.bEn.textContent=e.name.toUpperCase(); EL.bHt.textContent=`HP: ${e.hp}/${e.maxHp}`; EL.bEhp.style.cssText=`width:${(p*100).toFixed(1)}%;background:${hpColor(p)}`; }
function syncBP(){
  const hp=stats.hp/stats.maxHp,mp=stats.mp/stats.maxMp;
  EL.bHf.style.cssText=`width:${(hp*100).toFixed(1)}%;background:${hpColor(hp)}`; EL.bMf.style.width=(mp*100).toFixed(1)+'%'; EL.bHn.textContent=stats.hp; EL.bMn.textContent=stats.mp;
  const ST={poisoned:['🤒 RESFRIADO','#0891b2','white'],confused:['😵 CONFUNDIDO','#d97706','#000'],stressed:['😰 ESTRESADO','#dc2626','white']};
  if(stats.status&&ST[stats.status]){const[tx,bg,col]=ST[stats.status]; EL.bSt.textContent=tx; EL.bSt.style.cssText=`display:inline-block;background:${bg};color:${col};font-family:'VT323',monospace;font-size:.68rem;padding:2px 6px;border-radius:3px`;}
  else EL.bSt.style.display='none';
}
function typeMsg(text,cb=null){ text=(text==null?'':String(text)); if(twT) clearTimeout(twT); EL.bMsg.textContent=''; let i=0; const s=()=>{ if(i<text.length){EL.bMsg.textContent=text.slice(0,++i); twT=setTimeout(s,18);} else if(cb) twT=setTimeout(()=>{try{cb();}catch(e){console.warn('typeMsg cb',e);}},250); }; s(); }
function showBact(){ if(!battle||STATE!=='battle') return; battle.busy=false; EL.bAct.classList.add('on'); EL.btnCof.textContent=`☕ CAFÉ (${stats.coffees})`; EL.btnRun.disabled=!!battle.enemy.noFlee; if(EL.btnPsy)EL.btnPsy.style.display=progress.psyAttackUnlocked?'flex':'none'; if(EL.btnTeam)EL.btnTeam.style.display=party.length>0?'flex':'none'; const _pan=_('btn-pan'); if(_pan)_pan.style.display=progress.powerAnimal?'flex':'none'; const _pcon=_('btn-pcon'); if(_pcon)_pcon.style.display=progress.powerConservacion?'flex':'none'; }
function hideBact(){ EL.bAct.classList.remove('on'); }
function doMove(idx){
  if(!battle||battle.busy||STATE!=='battle') return;
  // Castigo Matemático (idx=4)
  if(idx===4){
    if(!progress.castMatUnlocked){ showBact(); return; }
    if(stats.mp<15){ typeMsg('No tienes suficiente MP (necesitas 15).',showBact); return; }
    stats.mp=Math.max(0,stats.mp-15); syncUI();
    battle.busy=true; hideBact();
    battle.enemy.confused=true; battle.enemy.confusedTurns=3;
    const dmg=Math.max(5,Math.floor(stats.atk*.6));
    battle.enemy.hp=Math.max(0,battle.enemy.hp-dmg);
    typeMsg('⚡ CASTIGO MATEMÁTICO!\n\n"¿Cuánto es √(-1)?\n¡Resuelve esto AHORA!"\n\n🌀 Enemigo confundido (-50% ATK, falla 40%)\n-'+dmg+' HP',()=>{
      if(battle.enemy.hp<=0){ battleWin(); return; }
      enemyTurn();
    }); return;
  }
  battle.busy=true; hideBact();
  const e=battle.enemy,rng=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  if(stats.status==='confused'&&Math.random()<.33){ typeMsg('¡El profe está confundido!\n¡Perdió el turno!',()=>enemyTurn()); return; }
  let dmg=0,msg='';
  if(idx===0){ dmg=Math.max(1,stats.atk+(equipment.weapon?.atk||0)+rng(0,8)-e.def); if(e.weak==='Explicar') dmg=Math.floor(dmg*1.5); if(e.resist==='Explicar') dmg=Math.floor(dmg*.6); e.hp=Math.max(0,e.hp-dmg); msg=`⚡ Profe explica el contenido.\n${e.weak==='Explicar'?'¡Súper efectivo! ':''}¡${e.name} recibe ${dmg}!`; hitAnim('b-es'); dmgPop(dmg,true); }
  else if(idx===1){ if(stats.mp<12){typeMsg('¡No tienes suficiente MP!',showBact);return;} stats.mp=Math.max(0,stats.mp-12); dmg=Math.max(1,stats.atk+10+rng(0,12)-e.def); if(e.weak==='Motivar') dmg=Math.floor(dmg*1.5); if(e.resist==='Motivar') dmg=Math.floor(dmg*.6); e.hp=Math.max(0,e.hp-dmg); msg=`💡 ¡Profe motiva!\n${e.weak==='Motivar'?'¡Súper efectivo! ':''}¡${e.name} recibe ${dmg}!`; hitAnim('b-es'); dmgPop(dmg,true); }
  else if(idx===2){ if(stats.coffees<=0){typeMsg('☕ ¡No queda café!\nVisita el Kiosco de Kella.',showBact);return;} stats.coffees--; const heal=20+rng(0,12); stats.hp=Math.min(stats.maxHp,stats.hp+heal); const cured=stats.status==='poisoned'; if(cured){stats.status=null;stats.statusTurns=0;} msg=`☕ ¡Profe bebió su café!\n+${heal} HP.${cured?'\n¡Y curó el resfriado!':''}`; dmgPop(heal,false,'#4ade80'); syncBP(); syncUI(); typeMsg(msg,()=>enemyTurn()); return; }
  else if(idx===3){ if(e.noFlee){typeMsg('¡No puedes huir del Inspector!',showBact);return;} if(Math.random()<(stats.status==='stressed'?.25:.65)) typeMsg('¡Profe se escabulló!\n¡Huiste!',()=>closeBattle()); else typeMsg('¡No pudiste escapar!',()=>enemyTurn()); return; }
  else if(idx===5){ // DEFENDER
    const mpGain=8; stats.mp=Math.min(stats.maxMp,stats.mp+mpGain);
    battle.defending=true; syncUI();
    typeMsg('🛡️ ¡Profe se cubre!\n\nReduce el próximo golpe a la mitad.\n💙 +'+mpGain+' MP recuperado.',()=>enemyTurn()); return;
  }
  else if(idx===4){ if(!progress.psyAttackUnlocked||stats.mp<15){typeMsg(progress.psyAttackUnlocked?'¡No tienes suficiente MP! (15 MP)':'Ataque no disponible aún.',showBact);return;} stats.mp=Math.max(0,stats.mp-15);const r2=(a,b)=>Math.floor(Math.random()*(b-a+1))+a; dmg=Math.max(1,stats.atk+15+r2(0,15)-Math.floor(e.def*.5)); e.hp=Math.max(0,e.hp-dmg); stats.hp=Math.min(stats.maxHp,stats.hp+8); msg=`💜 ¡Ataque Psicológico!\n¡${e.name} recibe ${dmg} de impacto emocional!\nEl profe recupera 8 HP.`; hitAnim('b-es'); dmgPop(dmg,true); }
  else if(idx===6){ // PODER ANIMAL
    if(!progress.powerAnimal){ typeMsg('Poder no disponible aún.',showBact); return; }
    if(stats.mp<18){ typeMsg('¡No tienes suficiente MP! (18 MP)',showBact); return; }
    stats.mp=Math.max(0,stats.mp-18);
    const r3=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    dmg=Math.max(1,stats.atk+22+r3(0,16)-Math.floor(e.def*.4));
    if(e.weak==='PoderAnimal') dmg=Math.floor(dmg*1.6);
    e.hp=Math.max(0,e.hp-dmg);
    msg=`🐾 ¡PODER ANIMAL!\n${e.weak==='PoderAnimal'?'¡Súper efectivo! ':''}La fuerza de la fauna golpea.\n¡${e.name} recibe ${dmg}!`;
    hitAnim('b-es'); dmgPop(dmg,true);
  }
  else if(idx===7){ // PODER DE CONSERVACIÓN
    if(!progress.powerConservacion){ typeMsg('Poder no disponible aún.',showBact); return; }
    if(stats.mp<20){ typeMsg('¡No tienes suficiente MP! (20 MP)',showBact); return; }
    stats.mp=Math.max(0,stats.mp-20);
    const r4=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    dmg=Math.max(1,stats.atk+14+r4(0,12)-Math.floor(e.def*.5));
    if(e.weak==='PoderConservacion') dmg=Math.floor(dmg*1.6);
    e.hp=Math.max(0,e.hp-dmg);
    const heal=24+r4(0,14); stats.hp=Math.min(stats.maxHp,stats.hp+heal);
    if(stats.status){stats.status=null;stats.statusTurns=0;}
    msg=`🌍 ¡PODER DE CONSERVACIÓN!\n${e.weak==='PoderConservacion'?'¡Súper efectivo! ':''}La naturaleza te protege.\n¡${e.name} recibe ${dmg}! +${heal} HP`;
    hitAnim('b-es'); dmgPop(dmg,true); dmgPop(heal,false,'#4ade80');
  }
  syncBE(); syncBP(); syncUI();
  if(e.hp<=0){typeMsg(msg+`\n\n¡${e.name} fue vencido! ¡Bien hecho!`,()=>battleWin()); return;}
  typeMsg(msg,()=>enemyTurn());
}
function enemyTurn(){
  if(!battle||STATE!=='battle'){ if(STATE==='battle'){STATE='exploring';} return; }
  // Confusion effect (Castigo Matemático)
  if(battle.enemy.confused){
    battle.enemy.confusedTurns--;
    if(battle.enemy.confusedTurns<=0) delete battle.enemy.confused;
    if(Math.random()<.4){
      typeMsg('🌀 '+battle.enemy.name+' está confundido...\n¡Falla su ataque!',showBact);
      return;
    }
  }
  stats.hunger=Math.max(0,stats.hunger-2.5); const e=battle.enemy,rng=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  if(e.burn&&e.burnTurns>0){const bd=Math.floor(Math.random()*8)+5;e.hp=Math.max(0,e.hp-bd);if(--e.burnTurns<=0)e.burn=false;syncBP();}
  if(stats.status==='poisoned'){stats.hp=Math.max(1,stats.hp-5); if(--stats.statusTurns<=0) stats.status=null;}
  const _atks=e.attacks&&e.attacks.length?e.attacks:[{name:'Ataque',power:0,effect:null,chance:0,msg:'atacó directamente.'}];
  const atk=_atks[Math.floor(Math.random()*_atks.length)];
  let dmg=Math.max(1,e.atk+rng(0,6)-stats.def-(battle.atkDebuff||0)-(equipment?.armor?.def||0)); if(stats.status==='stressed') dmg=Math.floor(dmg*1.35);
  if(battle.defending){dmg=Math.floor(dmg*.5); battle.defending=false;}
  stats.hp=Math.max(0,stats.hp-dmg); if(atk&&atk.mpDrain) stats.mp=Math.max(0,stats.mp-atk.mpDrain);
  if(atk&&atk.effect&&Math.random()<(atk.chance||0)){stats.status=atk.effect;stats.statusTurns=3;} if(atk&&atk.stealCoins){const stolen=Math.min(coins,atk.stealCoins);coins=Math.max(0,coins-stolen);syncUI();}
  hitAnim('b-ps'); dmgPop(dmg,false); syncBP(); syncUI();
  let msg=`${e.name} usó ${atk?.name||'Ataque'}!\n${atk?.msg||'Atacó directamente.'}\n¡El profe recibe ${dmg}!`; if(atk.mpDrain) msg+=`\n¡Y pierde ${atk.mpDrain} MP!`;
  if(stats.hp<=0){typeMsg(msg+'\n\n💔 ¡El profe cayó agotado!',()=>battleLose()); return;}
  typeMsg(msg,()=>typeMsg('¿Qué hará Profe Felipe?',showBact));
}

function useAscuas(){
  if(!battle||battle.busy||!inventory.some(i=>i.id==='ascuas_magicas')) return;
  battle.busy=true;
  const e=battle.enemy;
  const dmg=Math.max(1,stats.atk*2-(e.def||0)+Math.floor(Math.random()*10));
  e.hp=Math.max(0,e.hp-dmg);
  if(Math.random()<.8){e.burn=true;e.burnTurns=3;}
  hitAnim('b-es'); dmgPop(dmg,true); syncBP(); syncUI();
  const bm=e.burn?'\U0001F525 \u00A1QUEMADO!':'';
  typeMsg(`\U0001F525 Ascuas M\u00E1gicas! ${dmg} da\u00F1o${bm?'\\n'+bm:''}`,()=>{
    if(e.hp<=0) setTimeout(battleWin,600);
    else{battle.busy=false;setTimeout(enemyTurn,800);}
  });
}
function battleWin(){ Music.battleOut();
  // Track Antonio mission kills in pasillo
  if(currentMap==='pasillo'&&(progress.antonioMission||0)===1){
    progress.antonioKills=(progress.antonioKills||0)+1;
    if(progress.antonioKills===2) showDialog('💪 ¡2 enemigos derrotados!\n\nRegresa con el Tío Antonio.');
  }
  const e=battle.enemy;
  if(e.candy&&Math.random()<.35){inventory.push(mkCandy());syncUI();showDialog('🍬 ¡'+e.name+' soltó un caramelo!');}
  stats.xp+=e.xp; coins+=e.coins; stats.hp=Math.min(stats.maxHp,stats.hp+8);
  let msg=`✨ ¡VICTORIA!\n+${e.xp} XP  +${e.coins} monedas`;
  if(stats.xp>=stats.xpNext){
    stats.xp-=stats.xpNext; stats.level++; stats.xpNext=Math.floor(stats.xpNext*1.45);
    stats.maxHp+=12; stats.hp=stats.maxHp; stats.maxMp+=6; stats.mp=stats.maxMp; stats.atk+=3; stats.def+=1;
    setTimeout(()=>showLvlUp(stats.level),400);
    // Desbloquear teclado Jeanette al llegar al nivel 2
    if(stats.level>=2&&progress.jeanette.locked){
      progress.jeanette.locked=false; progress.jeanette.attempts=0;
      msg+='\n\n🔓 Teclado de Jeanette desbloqueado.\n¡Vuelve a intentar el código!';
    }
  }
  if(battle?.enemy?.id==='alex_boss'&&!progress.alexBossDefeated){
    progress.alexBossDefeated=true;
    equipment.armor={id:'armadura_bronce',name:'Armadura de Bronce',emoji:'🛡️',def:8,desc:'+8 DEF permanente'};
    msg+='\n\n🛡️ ¡ARMADURA DE BRONCE obtenida! (+8 DEF)\n🚉 ¡El camino a la ESTACIÓN está libre!';
    setTimeout(()=>showDialog('🎸 ¡VENCISTE al PROFESOR ALEX!\n\n🛡️ Armadura de Bronce equipada\n🚉 Acceso a la Estación desbloqueado\n\n"El rock nunca muere... pero tú\neres más fuerte, profe."'),600);
  }
  // ── Jefes del BuinZoo: armadura continental + poder nuevo ──
  if(battle?.enemy?.isBoss&&battle.enemy.reward&&(battle.enemy.id==='rinoceronte'||battle.enemy.id==='elefante')){
    const bk=battle.enemy.id;
    if(!progress.buinzooBosses[bk]){
      progress.buinzooBosses[bk]=true;
      equipZooArmor(battle.enemy.reward);
      const ar=ZOO_ARMORS[battle.enemy.reward];
      msg+='\n\n'+ar.emoji+' ¡'+ar.name+' equipada! ('+ar.desc.split('—')[0].trim()+')';
      if(bk==='rinoceronte'&&!progress.powerAnimal){
        progress.powerAnimal=true;
        msg+='\n\n🐾 ¡Aprendiste PODER ANIMAL!';
        setTimeout(()=>showDialog('🦏 ¡VENCISTE AL RINOCERONTE!\n\n'+ar.emoji+' '+ar.name+' equipada\n('+ar.desc+')\n\n🐾 NUEVO PODER: PODER ANIMAL\nInvoca la fuerza de la fauna en combate.\nÚsalo desde el botón 🐾 en batalla.\n\n"Lo calmaste con respeto, no con miedo."'),600);
      } else if(bk==='elefante'&&!progress.powerConservacion){
        progress.powerConservacion=true;
        msg+='\n\n🌍 ¡Aprendiste PODER DE CONSERVACIÓN!';
        setTimeout(()=>showDialog('🐘 ¡VENCISTE AL ELEFANTE!\n\n'+ar.emoji+' '+ar.name+' equipada\n('+ar.desc+')\n\n🌍 NUEVO PODER: PODER DE CONSERVACIÓN\nSana y protege con la energía de la\nnaturaleza. Úsalo con el botón 🌍.\n\n"Proteger la vida es la mayor victoria."'),600);
      }
    }
  }
  syncBP(); syncUI(); EL.bMsg.textContent=msg; hideBact();
  EL.bAct.innerHTML=`<button class="bb bi" style="grid-column:1/3" onclick="closeBattle()">¡Continuar!</button>`; EL.bAct.classList.add('on');
  battle=null; saveGameSilent();
}
function battleLose(){
  if(twT){ clearTimeout(twT); twT=null; }   // cancel any pending typeMsg
  Music.battleOut();
  stats.hp=60; stats.mp=Math.max(stats.mp,30);
  stats.status=null; stats.statusTurns=0;
  syncBP(); syncUI();
  EL.bMsg.textContent='😔 ¡El Profe cayó agotado!\n\nPero la vocación docente\nnunca se rinde.\n\nVisita a Kella para recuperarte.';
  hideBact();
  EL.bAct.innerHTML='<button class="bb br" style="grid-column:1/3;font-size:.55rem" onclick="closeBattle()">💪 Recuperarse</button>';
  EL.bAct.classList.add('on');
  battle=null;
  // STATE stays 'battle' so the overlay is visible — closeBattle resets it
}
function closeBattle(){
  if(twT){ clearTimeout(twT); twT=null; }
  EL.battle.classList.remove('on'); EL.bAct.innerHTML=`<button class="bb ba" onclick="doMove(0)">⚡ EXPLICAR</button><button class="bb bm" id="btn-mat" onclick="doMove(4)" style="display:none;background:linear-gradient(135deg,#312e81,#4338ca)">🔢 C.MAT</button><button class="bb bs" onclick="doMove(1)">💡 MOTIVAR</button><button class="bb bi" id="btn-cof" onclick="doMove(2)">☕ CAFÉ</button><button class="bb bd" id="btn-def" onclick="doMove(5)" style="background:linear-gradient(135deg,#475569,#64748b)">🛡️ DEFENDER</button><button class="bb br" id="btn-run" onclick="doMove(3)">🚪 HUIR</button><button class="bb bp" id="btn-psy" onclick="doMove(4)" style="display:none;grid-column:1/3">💜 ATAQUE PSICOLÓGICO</button><button class="bb bt" id="btn-team" onclick="openBParty()" style="display:none;grid-column:1/3">👥 LLAMAR EQUIPO</button><button class="bb" id="btn-pan" onclick="doMove(6)" style="display:none;grid-column:1/3;background:linear-gradient(135deg,#92400e,#b45309)">🐾 PODER ANIMAL</button><button class="bb" id="btn-pcon" onclick="doMove(7)" style="display:none;grid-column:1/3;background:linear-gradient(135deg,#166534,#15803d)">🌍 PODER DE CONSERVACIÓN</button>`; EL.btnCof=_('btn-cof'); EL.btnRun=_('btn-run'); EL.btnPsy=_('btn-psy'); EL.btnTeam=_('btn-team'); player.steps=0; battle=null; STATE='exploring'; syncUI(); }
function hitAnim(id){ const el=_(id); el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); setTimeout(()=>el.classList.remove('hit'),500); }
function dmgPop(val,isEnemy,color=null){ const pop=document.createElement('div'); pop.className='dmg-pop'; pop.textContent=(isEnemy?'-':'+')+val; const c=color||(isEnemy?'#f87171':'#60a5fa'); pop.style.cssText=`color:${c};text-shadow:0 0 8px ${c};left:${isEnemy?62+Math.random()*28:15+Math.random()*22}%;top:${isEnemy?20+Math.random()*18:42+Math.random()*12}%`; EL.bArena.appendChild(pop); setTimeout(()=>pop.remove(),950); }

