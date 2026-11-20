// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Alex (canvas), nivel, reloj, memorice, misiones, stats
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ LOOP ═══

function drawAlexCanvas(){
  const c=_('alex-c'); if(!c||c.style.display==='none') return;
  const cx=c.getContext('2d'); cx.clearRect(0,0,90,120);
  const b=Math.abs(Math.sin(tick*.07))*3;
  // Cuerpo — camisa a cuadros morada
  cx.fillStyle='#7c3aed'; cx.fillRect(28,52+b,34,40);
  for(let i=0;i<4;i++){cx.strokeStyle='rgba(255,255,255,.25)';cx.lineWidth=1;cx.beginPath();cx.moveTo(28+i*8,52+b);cx.lineTo(28+i*8,92+b);cx.stroke();}
  // Cuello
  cx.fillStyle='#fcd9b6'; cx.fillRect(40,40+b,10,15);
  // Piernas
  cx.fillStyle='#1e293b'; cx.fillRect(30,90+b,12,24); cx.fillRect(48,90+b,12,24);
  // Zapatos
  cx.fillStyle='#78350f'; cx.fillRect(26,111+b,17,8); cx.fillRect(47,111+b,17,8);
  // Brazos
  cx.fillStyle='#fcd9b6'; cx.fillRect(12,55+b,16,26); cx.fillRect(62,57+b,16,24);
  // Guitarra (brazo izquierdo)
  cx.fillStyle='#b45309'; cx.fillRect(8,60+b,35,26); cx.fillStyle='#78350f'; cx.beginPath(); cx.arc(26,72+b,9,0,Math.PI*2); cx.fill();
  cx.fillStyle='#0f172a'; cx.beginPath(); cx.arc(26,72+b,4,0,Math.PI*2); cx.fill();
  cx.strokeStyle='rgba(255,255,255,.4)'; cx.lineWidth=.8;
  for(let i=0;i<4;i++){cx.beginPath();cx.moveTo(10,62+i*5+b);cx.lineTo(42,62+i*5+b);cx.stroke();}
  // CABEZA — calvo con stubble
  cx.fillStyle='#fcd9b6'; cx.beginPath(); cx.arc(45,28+b,20,0,Math.PI*2); cx.fill();
  // Stubble (calvicie visible)
  cx.fillStyle='rgba(60,35,15,.35)';
  for(let i=0;i<6;i++) cx.fillRect(30+i*4,10+b,3,4);
  // BARBA — espesa y oscura
  cx.fillStyle='#3d2008'; cx.fillRect(29,36+b,32,18);
  cx.beginPath(); cx.arc(45,44+b,16,0,Math.PI); cx.fill();
  cx.strokeStyle='rgba(20,10,0,.4)'; cx.lineWidth=1;
  for(let i=0;i<5;i++){cx.beginPath();cx.moveTo(30+i*6,38+b);cx.lineTo(30+i*6,52+b);cx.stroke();}
  // Bigote
  cx.fillStyle='#2d1606'; cx.fillRect(34,36+b,22,6);
  // Gafas
  cx.strokeStyle='#374151'; cx.lineWidth=1.5;
  cx.strokeRect(32,22+b,12,9); cx.strokeRect(47,22+b,12,9);
  cx.beginPath();cx.moveTo(44,26+b);cx.lineTo(47,26+b);cx.stroke();
  cx.beginPath();cx.moveTo(30,26+b);cx.lineTo(32,26+b);cx.stroke();
  cx.beginPath();cx.moveTo(59,26+b);cx.lineTo(62,26+b);cx.stroke();
  // Ojos
  cx.fillStyle='#1a1a1a'; cx.fillRect(35,25+b,4,4); cx.fillRect(50,25+b,4,4);
  // Notas musicales flotantes
  cx.globalAlpha=.5+.5*Math.sin(tick*.09);
  cx.font='12px serif'; cx.fillStyle='#c084fc';
  cx.fillText('♪',76,28+Math.sin(tick*.1)*6);
  cx.fillText('♫',2,40+Math.sin(tick*.08+1)*6);
  cx.globalAlpha=1;
}

let _lvlConfRAF=null;
function showLvlUp(newLvl){
  STATE='levelup';
  const bonus=newLvl%2===0;
  if(bonus){
    coins+=20;
    inventory.push({id:'mp_lvl'+newLvl,name:'Poción de Maná',type:'consumable',effect:'mp',amount:30,desc:'+30 MP',emoji:'💙'});
    syncUI();
  }
  saveGameSilent();
  _('lu-lv').textContent='NIVEL '+newLvl;
  _('lu-gains').innerHTML='+12 HP máx &nbsp;|&nbsp; +3 ATK &nbsp;|&nbsp; +1 DEF<br>✅ HP y MP restaurados';
  const bd=_('lu-bonus');
  if(bonus){bd.style.display='block'; bd.innerHTML='🎁 BONIFICACIÓN NIVEL PAR<br>+20 🪙 monedas &nbsp; 💙 Poción de Maná';}
  else bd.style.display='none';
  _('lvlup').classList.add('show');
  _lvlConfetti();
}
function closeLvlUp(){
  STATE='exploring'; _('lvlup').classList.remove('show');
  if(_lvlConfRAF) cancelAnimationFrame(_lvlConfRAF);
  const c=_('lvlup-cf'); if(c) c.getContext('2d').clearRect(0,0,c.width,c.height);
}
function _lvlConfetti(){
  const cv=_('lvlup-cf'); cv.width=innerWidth; cv.height=innerHeight;
  const cx2=cv.getContext('2d');
  const cols=['#fbbf24','#f472b6','#60a5fa','#4ade80','#f87171','#c084fc','#fb923c'];
  const ps=Array.from({length:80},()=>({
    x:Math.random()*cv.width, y:Math.random()*cv.height*.5,
    vy:Math.random()*2.5+1, vx:(Math.random()-.5)*1.5,
    r:Math.random()*5+2, a:Math.random()*Math.PI*2,
    va:(Math.random()-.5)*.15, col:cols[Math.floor(Math.random()*cols.length)],
    sq:Math.random()>.5
  }));
  function draw(){
    cx2.clearRect(0,0,cv.width,cv.height);
    ps.forEach(p=>{
      p.y+=p.vy; p.x+=p.vx; p.a+=p.va;
      if(p.y>cv.height){p.y=-10; p.x=Math.random()*cv.width;}
      cx2.fillStyle=p.col; cx2.save(); cx2.translate(p.x,p.y); cx2.rotate(p.a);
      if(p.sq) cx2.fillRect(-p.r,-p.r/2,p.r*2,p.r);
      else{cx2.beginPath(); cx2.arc(0,0,p.r,0,Math.PI*2); cx2.fill();}
      cx2.restore();
    });
    if(_('lvlup').classList.contains('show')) _lvlConfRAF=requestAnimationFrame(draw);
  }
  _lvlConfRAF=requestAnimationFrame(draw);
}


// ═══ DÍA/NOCHE — RELOJ DE JUEGO ═══
const TICKS_PER_HOUR = 450; // 1 hora de juego = 450 ticks (~7.5s real)
function getGameTime(){
  const tot=Math.floor(tick/7.5); // minutos de juego
  const hour=(6+Math.floor(tot/60))%24; // empieza a las 06:00
  const min=tot%60;
  return {hour,min};
}
function isNight(){const h=getGameTime().hour; return h>=21||h<5;}
function isDawn(){const h=getGameTime().hour; return h>=5&&h<7;}
function isDusk(){const h=getGameTime().hour; return h>=19&&h<21;}

// ─── JEFA CATHERINE ───
const CATHERINE_BOSS={id:'catherine',name:'T\u00EDa Catherine',emoji:'\U0001F33F',maxHp:300,atk:26,def:12,xp:120,coins:60,glow:'rgba(34,197,94,.9)',noFlee:true,intro:'\u00A1La T\u00EDa Catherine aparece!\\n\"\u00A1Este bosque me pertenece!\"',attacks:[{name:'Enredadera T\u00F3xica',msg:'lanz\u00F3 enredadera!',power:35,effect:'poisoned',chance:.7},{name:'Esporas de Fuego',msg:'us\u00F3 Esporas!',power:30,effect:'stressed',chance:.6},{name:'Ra\u00EDz Asfixiante',msg:'atac\u00F3 con ra\u00EDces!',power:48},{name:'Polen Cegador',msg:'us\u00F3 Polen!',power:18,atkDebuff:6}]};
function triggerCatherine(){
  if(progress.catherineDefeated){showDialog('\U0001F33F La T\u00EDa Catherine fue derrotada.');return;}
  showDialog('\U0001F33F T\u00CDA CATHERINE\\n\\n\"\u00BFQui\u00E9n osa entrar\\nen mi santuario?\"',[
    {text:'\u2694\uFE0F \u00A1Pelear!',action:()=>{battle={enemy:normalizeEnemy(CATHERINE_BOSS),busy:false,atkDebuff:0};STATE='battle';openBattle();}},
    {text:'\U0001F3C3 Huir',action:()=>{}}
  ]);
}


// ═══ MEMORICE MINI-GAME ═══
const MEM_SETS={
  futbol:  ['⚽','🥅','🏆','🎽','👟','🦵','🏃','⚡','🎯','🥇'],
  basket:  ['🏀','🏆','🎯','🤾','🏅','⭐','💪','🎽','🏃','👑'],
  libros:  ['📚','📖','✏️','🖊️','📝','🔖','📜','🏛️','🧠','💡'],
  mates:   ['➕','➖','✖️','➗','📐','📏','🔢','🧮','∞','🔣'],
  ciencias:['🔬','🧬','🌿','🦠','⚗️','🧪','🌡️','🔭','💊','🧫'],
  historia:['🏛️','⚔️','🗺️','👑','🏺','📜','⚓','🗿','🎖️','🌍'],
  trofeos: ['🏆','🥇','🥈','🥉','🎖️','🏅','⭐','👑','🎯','🎪'],
};
let _prevState='exploring';
let memState={active:false,cards:[],revealed:[],matched:[],moves:0,busy:false,mode:'futbol'};
function openMemorice(mode){
  _prevState=STATE; STATE='minigame';
  STATE='minigame'; memState.active=true; memState.mode=mode; memState.moves=0;
  memState.revealed=[]; memState.matched=[];
  const syms=[...MEM_SETS[mode],...MEM_SETS[mode]];
  for(let i=syms.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[syms[i],syms[j]]=[syms[j],syms[i]];}
  memState.cards=syms;
  const _titles={futbol:'⚽ MEMORICE FÚTBOL',basket:'🏀 MEMORICE BÁSQUET',libros:'📚 MEMORICE LITERATURA',mates:'📐 MEMORICE MATEMÁTICAS',ciencias:'🔬 MEMORICE CIENCIAS',historia:'🏛️ MEMORICE HISTORIA',trofeos:'🏆 MEMORICE TROFEOS'};
  _('mem-title').textContent=(_titles[mode]||'🎮 MEMORICE')+' — 20 cartas';
  _('mem-pairs').textContent='0'; _('mem-moves').textContent='0';
  renderMemorice(); _('memorice').style.display='flex';
}
function renderMemorice(){
  const g=_('mem-grid'); g.innerHTML='';
  memState.cards.forEach((sym,i)=>{
    const d=document.createElement('div');
    const revealed=memState.revealed.includes(i)||memState.matched.includes(i);
    d.style.cssText='width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;font-size:18px;transition:all .15s;border:2px solid '+(memState.matched.includes(i)?'#22c55e':revealed?'#f59e0b':'#475569')+';background:'+(memState.matched.includes(i)?'#14532d':revealed?'#1e3a5f':'#1e293b');
    d.textContent=revealed?sym:'?';
    d.onclick=()=>flipCard(i);
    g.appendChild(d);
  });
}
function flipCard(i){
  if(memState.busy||memState.revealed.includes(i)||memState.matched.includes(i)) return;
  memState.revealed.push(i);
  renderMemorice();
  if(memState.revealed.length===2){
    memState.busy=true; memState.moves++;
    _('mem-moves').textContent=memState.moves;
    setTimeout(()=>{
      const [a,b]=memState.revealed;
      if(memState.cards[a]===memState.cards[b]){
        memState.matched.push(a,b);
        _('mem-pairs').textContent=memState.matched.length/2;
        if(memState.matched.length===20) setTimeout(memWin,300);
      }
      memState.revealed=[]; memState.busy=false;
      renderMemorice();
    },700);
  }
}
function memWin(){
  inventory.push(mkCandy(),mkCandy(),mkCandy()); syncUI();
  const _rewards={futbol:{c:15,x:30},basket:{c:20,x:40},libros:{c:18,x:35},mates:{c:22,x:45},ciencias:{c:20,x:40},historia:{c:18,x:35},trofeos:{c:30,x:60}};
  const _rw=_rewards[memState.mode]||{c:15,x:30};
  const bonus=_rw.c, xpBonus=_rw.x;
  coins+=bonus;
  stats.xp+=xpBonus;
  if(stats.xp>=stats.xpNext){stats.xp-=stats.xpNext;stats.level++;stats.xpNext=Math.floor(stats.xpNext*1.45);stats.maxHp+=12;stats.hp=stats.maxHp;showLvlUp(stats.level);}
  syncUI();
  inventory.push(mkCandy(),mkCandy(),mkCandy()); syncUI();
  _('mem-title').textContent='🏆 ¡GANASTE!';
  _('mem-grid').innerHTML='<div style="color:#fbbf24;font-size:.55rem;text-align:center;padding:20px">¡Completaste el Memorice!<br><br>🪙 +'+bonus+' monedas<br>⭐ +'+xpBonus+' XP<br><br>Intentos: '+memState.moves+'</div>';
}
function closeMemorice(){ STATE=(_prevState==='exploring'?'exploring':_prevState)||'exploring'; memState.active=false; _('memorice').style.display='none'; }


// ═══ SISTEMA DE MISIONES — CUADERNO DE NOTAS ═══
const QUEST_DEFS={
  gonzalo:{title:'Plantar Tomates',icon:'👨\u200d🏫',steps:['Hablar con el Profe Gonzalo','Comprar semillas de tomate 🍅','Plantar 5 semillas en el huerto','Regresar con Gonzalo']},
  dahian: {title:'Comida para Mochi',icon:'🏃\u200d♀️',steps:['Hablar con la Profe Dahian','Ir al Centro de Villa Alemana','Comprar Comida de Gato 🐱','Regresar con Dahian']},
  francisco:{title:'El Mensaje',icon:'👨',steps:['Recibir mensaje de Francisco','Ir a Sala Contabilidad','Hablar con Constanza','Regresar con Francisco']},
  martinez:{title:'Censo de Fauna',icon:'🌲',steps:['Hablar con Guardabosques Martínez','Observar un ave 🐦','Observar un insecto 🦋','Observar un zorro 🦊','Regresar con Martínez']},
  silva:  {title:'Explorar el Valle',icon:'🌿',steps:['Hablar con Guardabosques Silva','Explorar hasta columna 280+','Regresar con Silva']},
  rojas:  {title:'Bosque Primario',icon:'🦅',steps:['Hablar con Guardabosques Rojas','Llegar a columna 295+','Regresar con Rojas']},
  antonio:{id:'antonio',title:'🪖 La Misión del Tío Antonio',giver:'Tío Antonio',steps:['Conocer al Tío Antonio','Derrotar 2 enemigos en el pasillo','Reportarse con el Tío Antonio'],reward:'10🪙'},
  claudita:{title:'Monedas Azules',icon:'👧',steps:['Hablar con Claudita','Conseguir 10 monedas azules 🔵','Llevar las monedas']},
  paula:  {title:'El Chiste',icon:'😊',steps:['Hablar con Paula','Contar el chiste','Completar el ataque psicológico']},
};
if(!progress.questLog) progress.questLog={};
function acceptQuest(id){
  if(!QUEST_DEFS[id]) return;
  if(!progress.questLog[id]) progress.questLog[id]={active:true,steps:[1,...new Array(QUEST_DEFS[id].steps.length-1).fill(0)]};
  renderQuestLog();
  const toastDiv=document.createElement('div');
  toastDiv.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#14532d;color:#86efac;font-family:\'Press Start 2P\',monospace;font-size:.55rem;padding:10px 18px;border-radius:8px;border:2px solid #4ade80;z-index:500;text-align:center;pointer-events:none';
  toastDiv.innerHTML='📓 ¡Misión aceptada!<br><span style="color:#fbbf24;font-size:.45rem">'+QUEST_DEFS[id].title+'</span>';
  document.body.appendChild(toastDiv);
  setTimeout(()=>toastDiv.remove(),2000);
}
function updateQuestStep(id,step){
  if(!progress.questLog?.[id]) return;
  progress.questLog[id].steps[step]=1;
  renderQuestLog();
}
function completeQuest(id){
  if(!progress.questLog?.[id]) return;
  progress.questLog[id].active=false;
  progress.questLog[id].steps=progress.questLog[id].steps.map(()=>1);
  renderQuestLog();
}
function renderQuestLog(){
  const el=_('quest-list'); if(!el) return;
  const ql=progress.questLog||{};
  const active=Object.entries(ql).filter(([,q])=>q.active);
  const done=Object.entries(ql).filter(([,q])=>!q.active);
  if(!active.length&&!done.length){el.innerHTML='<div style="opacity:.4;text-align:center;padding:20px;font-size:.4rem">Sin misiones activas.<br>Habla con los NPCs.</div>';return;}
  el.innerHTML=active.map(([id,q])=>{
    const def=QUEST_DEFS[id]; if(!def) return '';
    const stepsHtml=def.steps.map((s,i)=>{
      const ok=q.steps[i]===1;
      return `<div style="margin:3px 0;font-size:.38rem;${ok?'color:#86efac;font-weight:bold':'opacity:.35'}">${ok?'✅':'▫️'} ${s}</div>`;
    }).join('');
    return `<div style="margin-bottom:10px;border-left:3px solid #4ade80;padding-left:8px"><div style="color:#fbbf24;font-size:.48rem;margin-bottom:3px">${def.icon} ${def.title}</div>${stepsHtml}</div>`;
  }).join('')
  +(done.length?'<div style="opacity:.35;font-size:.35rem;margin-top:8px">COMPLETADAS: '+done.map(([id])=>QUEST_DEFS[id]?.title||id).join(', ')+'</div>':'');
}
function toggleQuestLog(){
  const qd=_('quest-log');
  if(!qd) return;
  if(qd.style.display==='none'||!qd.style.display){
    renderQuestLog(); qd.style.display='flex'; if(STATE==='exploring') STATE='dialog';
  } else {
    qd.style.display='none'; if(STATE==='dialog') STATE='exploring';
  }
}


// ─── Caramelos ocultos en el mundo ───
const CANDY_SPOTS=[
  {map:'pasillo',x:8,y:4},{map:'pasillo',x:17,y:2},
  {map:'cancha',x:3,y:7},{map:'cancha',x:16,y:3},
  {map:'biblioteca',x:6,y:6},{map:'biblioteca',x:14,y:8},
  {map:'sala_cont',x:4,y:7},{map:'sala_vela',x:5,y:5},
  {map:'secretaria',x:7,y:6},{map:'secretaria',x:11,y:3},
  {map:'plaza',x:12,y:8},{map:'plaza',x:28,y:10},{map:'plaza',x:35,y:5},
  {map:'centro_villa',x:8,y:7},{map:'centro_villa',x:20,y:9},
  {map:'estacion_villa',x:10,y:5},{map:'salon_trofeos',x:8,y:7},
  {map:'biologia',x:5,y:5},{map:'biologia',x:10,y:7},
  {map:'reserva',x:40,y:24},{map:'reserva',x:95,y:10},{map:'reserva',x:140,y:38},
  {map:'reserva',x:200,y:24},{map:'reserva',x:260,y:16},{map:'reserva',x:285,y:38},
];
if(!progress.foundCandies) progress.foundCandies={};
function checkCandySpot(){
  const key=currentMap+':'+player.x+','+player.y;
  if(progress.foundCandies[key]) return;
  const spot=CANDY_SPOTS.find(s=>s.map===currentMap&&s.x===player.x&&s.y===player.y);
  if(spot){progress.foundCandies[key]=true;inventory.push(mkCandy());syncUI();
    showDialog('🍬 ¡Caramelo encontrado!\n\nHabía un caramelo escondido aquí.\n\n+1 Caramelo al inventario.');}
}

function openStats(){
  if(STATE==='battle'||STATE==='shop') return;
  updateStatsPanel(); _('stats-panel').style.display='flex';
}
function closeStats(){ _('stats-panel').style.display='none'; }
function updateStatsPanel(){
  const s=stats,e=equipment;
  const hpPct=(s.hp/s.maxHp*100).toFixed(1);
  const mpPct=(s.mp/s.maxMp*100).toFixed(1);
  const xpPct=(s.xp/s.xpNext*100).toFixed(1);
  const hg=Math.round(s.hunger||100);
  _('sp-hp')&&(_('sp-hp').textContent=s.hp+'/'+s.maxHp);
  _('sp-mp')&&(_('sp-mp').textContent=s.mp+'/'+s.maxMp);
  _('sp-xp')&&(_('sp-xp').textContent=s.xp+'/'+s.xpNext);
  _('sp-lv')&&(_('sp-lv').textContent=s.level);
  _('sp-atk')&&(_('sp-atk').textContent=s.atk);
  _('sp-def')&&(_('sp-def').textContent=s.def);
  _('sp-coins')&&(_('sp-coins').textContent=coins);
  _('sp-blue')&&(_('sp-blue').textContent=(progress.blueCoins||0)+'/10');
  _('sp-coffee')&&(_('sp-coffee').textContent=s.coffees||0);
  _('sp-hunger')&&(_('sp-hunger').textContent=(hg>60?'🍽️':hg>25?'😐':'🤢')+hg);
  if(_('sp-hp-bar'))_('sp-hp-bar').style.width=hpPct+'%';
  if(_('sp-mp-bar'))_('sp-mp-bar').style.width=mpPct+'%';
  if(_('sp-xp-bar'))_('sp-xp-bar').style.width=xpPct+'%';
  if(_('sp-equip'))_('sp-equip').innerHTML=(e?.armor?('<div>'+e.armor.emoji+' '+e.armor.name+' '+e.armor.desc+'</div>'):'')+(e?.weapon?('<div>'+e.weapon.emoji+' '+e.weapon.name+' +'+e.weapon.atk+' ATK</div>'):'')+(e?.accessory?('<div>'+e.accessory.emoji+' '+e.accessory.name+' '+e.accessory.desc+'</div>'):'')|| 'Sin equipamiento';
  if(_('sp-status'))_('sp-status').textContent=s.status?('⚠️ '+s.status.toUpperCase()+'  ('+s.statusTurns+' turnos)'):'';
}


