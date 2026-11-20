// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Admin, ajustes, Firebase, ranking, metro, guardado
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ════════════════════════════════════════════════════════════
// TILECACHE — OffscreenCanvas por mapa (motor inspirado en AoE2)
// Los tiles estáticos se pre-renderizan UNA VEZ por mapa.
// drawMap() solo llama ctx.drawImage() para la capa estática.
// ════════════════════════════════════════════════════════════
const TileCache = (()=>{
  const store=new Map();
  const ANIMATED=new Set(['E','S','8','Z','V','N','^','>','*','@','%','C','r','$','!','~','?','L','M','F','W','z','w']);
  const isStatic=t=>!ANIMATED.has(t);

  return {
    prerender(mapname, mapData, drawFn){
      if(!mapData||!mapData.length) return;
      const R=mapData.length, C=mapData[0].length;
      let oc;
      try { oc=new OffscreenCanvas(C*TS, R*TS); } 
      catch(e){ return; } // fallback: navegadores sin OffscreenCanvas
      const octx=oc.getContext('2d');
      for(let r=0;r<R;r++) for(let c=0;c<C;c++){
        const t=mapData[r][c];
        if(isStatic(t)) drawFn(t,c*TS,r*TS,r,c,octx);
      }
      store.set(mapname, oc);
    },
    get(mapname){ return store.get(mapname)||null; },
    invalidate(mapname){ store.delete(mapname); },
    blit(ctx, mapname, camera){
      const oc=store.get(mapname);
      if(!oc) return false;
      ctx.drawImage(oc, -camera.x*TS, -camera.y*TS);
      return true;
    },
    isStatic
  };
})();

// ═══ MODO ADMINISTRATIVO — CÓDIGO SECRETO ═══
// Secuencia: ↑ ↓ ↑ ↑ ↓ ↓ A
const ADMIN_SEQ=['ArrowUp','ArrowDown','ArrowUp','ArrowUp','ArrowDown','ArrowDown','a'];
let _adminBuf=[]; let _adminActive=false;
function _checkAdmin(key){
  _adminBuf.push(key.toLowerCase()==='a'?'a':key);
  if(_adminBuf.length>ADMIN_SEQ.length) _adminBuf.shift();
  if(_adminBuf.length===ADMIN_SEQ.length&&_adminBuf.every((k,i)=>k===ADMIN_SEQ[i])){
    _activateAdmin();
  }
}
function _activateAdmin(){
  _adminActive=true; _adminBuf=[];
  // Desbloquear todo el progreso
  progress.alexBossDefeated=true;
  progress.villaVisited=true; progress.salonVisited=true;
  progress.bioVisited=true; progress.reservaVisited=true;
  progress.centroVisited=true; progress.canchaVisited=true;
  progress.biblioVisited=true; progress.salaContVisited=true;
  progress.plazaVisited=true; progress.psyAttackUnlocked=true;
  progress.codeOk=true; progress.chestOpened=false;
  progress.jeanette={attempts:0,locked:false};
  progress.paulaMission={given:true,completed:true,rewarded:true};
  progress.franciscoMission={given:true,delivered:true,rewarded:true};
  progress.quests={psico:2}; progress.unlocked={psicoped:true};
  progress.claudita=10; progress.blueCoins=10;
  // Equipar armadura
  equipment.armor={id:'armadura_bronce',name:'Armadura de Bronce',emoji:'🛡️',def:8,desc:'+8 DEF'};
  // Boost de stats
  coins+=999; stats.level=10; stats.xpNext=9999;
  stats.maxHp=250; stats.hp=250;
  stats.maxMp=120; stats.mp=120;
  stats.atk=35; stats.def=18; stats.coffees=10;
  // Desbloquear ataque psicológico
  if(!ENEMIES.find(e=>e.id==='psicologico')) stats.atk+=0;
  syncUI();
  // Badge visual
  const badge=document.createElement('div');
  badge.id='admin-badge';
  badge.style.cssText="position:fixed;top:8px;right:8px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fef9c3;font-size:.45rem;padding:4px 8px;border-radius:6px;z-index:999;border:1.5px solid #fbbf24;box-shadow:0 0 12px rgba(168,85,247,.6);pointer-events:none"
  badge.textContent='🔑 ADMIN';
  document.body.appendChild(badge);
  showDialog('🔓 MODO ADMINISTRATIVO\n\n⚡ ¡Código secreto activado!\n\n✅ Todas las puertas abiertas\n✅ Nivel 10 | 250HP | 120MP\n✅ +999 🪙 monedas\n✅ Armadura de Bronce\n✅ Todas las misiones\n✅ Café x10\n\n"Con gran poder viene\ngran responsabilidad."\n\n🔑 Modo Admin activo');
}

// ═══ PANEL DE CONTROL ═══
function openSettings(){
  const tglMusic=_('tgl-music');
  if(tglMusic) tglMusic.checked=!Music.muted;
  const tglDpad=_('tgl-dpad');
  if(tglDpad) tglDpad.checked=_('ctrl').style.display!=='none';
  _('settings-panel').style.display='block';
  STATE='dialog';
}
function closeSettings(){
  _('settings-panel').style.display='none';
  if(STATE==='dialog') STATE='exploring';
}
function switchStab(tab){
  ['music','controls','tutorial'].forEach(t=>{
    _('stab-'+t).classList.toggle('on',t===tab);
    _('sc-'+t).classList.toggle('on',t===tab);
  });
}
function toggleMusicSetting(el){
  const on=Music.toggle(); el.checked=on;
  const btn=_('btn-music');
  if(btn){btn.textContent=on?'🎵':'🔇';btn.style.opacity=on?'1':'.45';}
}
function toggleDpadSetting(el){
  const ctrl=_('ctrl'),btn=_('ctrl-toggle'),show=el.checked;
  ctrl.style.display=show?'flex':'none';
  if(btn) btn.textContent=show?'🎮 Ocultar controles':'🎮 Mostrar controles';
  try{localStorage.setItem('rpg_dpad',show?'1':'0');}catch(e){}
}

// ═══ FIREBASE + MULTIJUGADOR ═══
// 👉 Reemplaza estos valores con los de tu proyecto en console.firebase.google.com
const FB_CONFIG={
  apiKey:"TU_API_KEY",
  authDomain:"TU-PROYECTO.firebaseapp.com",
  databaseURL:"https://TU-PROYECTO-default-rtdb.firebaseio.com",
  projectId:"TU-PROYECTO",
  storageBucket:"TU-PROYECTO.appspot.com",
  messagingSenderId:"000000000000",
  appId:"1:000000000000:web:abcdef"
};
let _db=null,_playerKey=null,_playerName='';

function _fbInit(){
  try{
    if(!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
    _db=firebase.database();
  }catch(e){console.warn('Firebase no disponible:',e);}
}

// ── IndexedDB (almacenamiento más confiable en Android Chrome) ──
const _IDB=(function(){
  let _idb=null;
  function _open(){
    if(_idb) return Promise.resolve(_idb);
    return new Promise((res,rej)=>{
      const r=indexedDB.open('profeRpgDB',1);
      r.onupgradeneeded=e=>e.target.result.createObjectStore('saves',{keyPath:'k'});
      r.onsuccess=e=>{_idb=e.target.result;res(_idb);};
      r.onerror=()=>rej(r.error);
    });
  }
  return{
    set(k,v){_open().then(db=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({k,v});}).catch(()=>{});},
    get(k){return _open().then(db=>new Promise((res,rej)=>{const tx=db.transaction('saves','readonly');const r=tx.objectStore('saves').get(k);r.onsuccess=()=>res(r.result?r.result.v:null);r.onerror=()=>rej(r.error);})).catch(()=>null);}
  };
})();

// ── Ranking local (fallback sin Firebase) ──
const _LB_KEY='profeRpg_lb_v2';
function _updateLocalLB(){
  if(!_playerKey) return;
  const entry={key:_playerKey,name:_playerName,level:stats.level,coins,xp:stats.xp,lastSeen:Date.now()};
  const _mergeLB=rows=>{const idx=rows.findIndex(e=>e.key===_playerKey);if(idx>=0)rows[idx]=entry;else rows.push(entry);rows.sort((a,b)=>b.level-a.level||b.coins-a.coins||b.xp-a.xp);return rows.slice(0,50);};
  try{const lb=_mergeLB(JSON.parse(localStorage.getItem(_LB_KEY)||'[]'));localStorage.setItem(_LB_KEY,JSON.stringify(lb));}catch(e){}
  _IDB.get(_LB_KEY).then(d=>{_IDB.set(_LB_KEY,JSON.stringify(_mergeLB(d?JSON.parse(d):[])));}).catch(()=>{});
}

// ── Export / Import ──
function exportSave(){
  let data=null;
  try{data=localStorage.getItem(SAVE_KEY);}catch(e){}
  if(!data){showDialog('⚠️ Guarda la partida primero antes de exportar.');return;}
  try{
    const blob=new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='profeRpg_save.json';document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showDialog('📤 Partida exportada.\nGuarda el archivo .json como respaldo.');
  }catch(e){showDialog('❌ Error al exportar: '+e.message);}
}
function _onImportFile(el){
  const file=el.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      _applyGameState(data);
      saveGameSilent();
      showDialog('📥 Partida importada con éxito.\n¡Bienvenido de vuelta, Profe Felipe!');
    }catch(err){showDialog('❌ Archivo inválido o corrupto.');}
  };
  reader.readAsText(file);
  el.value='';
}

function _fbSave(){
  if(!_db||!_playerKey) return;
  try{
    const partyData=PARTY_MEMBERS.map(m=>({id:m.id,hp:m.hp,found:m.found,inTeam:m.inTeam}));
    const invData=inventory.map(({use,...r})=>r);
    const fullState={player,stats,coins,progress,currentMap,equipment,party:partyData,inventory:invData};
    const MAP_LABELS={pasillo:'Pasillo',patio:'Patio',jardin_eden:'Jardín Edén',segundo_piso:'2do Piso',sala_5to:'Sala 5to',sala_6to:'Sala 6to',sala_7mo:'Sala 7mo',sala_8vo:'Sala 8vo',biblioteca:'Biblioteca',cancha:'Cancha',villa_alemana:'Villa Alemana',centro_villa:'Centro Villa',buin_zoo:'Buin Zoo',reserva:'Reserva Natural',lago:'Lago'};
    _db.ref('players/'+_playerKey).set({
      name:_playerName, level:stats.level, coins, xp:stats.xp,
      hp:stats.hp, maxHp:stats.maxHp, currentMap,
      mapLabel:MAP_LABELS[currentMap]||currentMap,
      lastSeen:Date.now(), fullState
    });
  }catch(e){console.warn('Firebase save error:',e);}
}

// ── Registro de jugador ──
function registerPlayer(){
  const input=_('reg-name-input'), errEl=_('reg-error');
  const name=input.value.trim();
  if(name.length<2){errEl.textContent='⚠ Mínimo 2 caracteres';return;}
  if(name.length>20){errEl.textContent='⚠ Máximo 20 caracteres';return;}
  _playerName=name;
  const sanitized=name.toLowerCase().replace(/[^a-z0-9]/g,'_').slice(0,14);
  _playerKey=sanitized+'_'+Math.random().toString(36).slice(2,6);
  try{localStorage.setItem('profeRpg_playerKey',_playerKey);}catch(e){}
  try{localStorage.setItem('profeRpg_playerName',_playerName);}catch(e){}
  _IDB.set('profeRpg_playerKey',_playerKey);
  _IDB.set('profeRpg_playerName',_playerName);
  _fbInit();
  _('register-screen').style.display='none';
  _startGameLoop();
}

// ── Leaderboard ──
const _MAP_SHORT={pasillo:'Pasillo',patio:'Patio',jardin_eden:'Jardín Edén',segundo_piso:'2do Piso',sala_5to:'Sala 5to',sala_6to:'Sala 6to',sala_7mo:'Sala 7mo',sala_8vo:'Sala 8vo',biblioteca:'Biblioteca',cancha:'Cancha',villa_alemana:'Villa Alemana',centro_villa:'Centro Villa',buin_zoo:'Buin Zoo',reserva:'Reserva',lago:'Lago'};
let _lbRef=null;

function _renderLBRows(rows,list,isLocal){
  const medals=['🥇','🥈','🥉'];
  _('lb-count').textContent=rows.length+(isLocal?' jugadores (local)':' jugadores');
  if(!rows.length){list.innerHTML='<div style="text-align:center;color:#6b7280;padding:16px;font-family:\'VT323\',monospace">Sin jugadores aún</div>';return;}
  const header=isLocal?'<div style="font-size:.65rem;color:#6b7280;text-align:center;margin-bottom:6px;font-family:\'VT323\',monospace">📱 Ranking local · Guarda partida para aparecer</div>':'';
  list.innerHTML=header+rows.slice(0,20).map((p,i)=>{
    const isMe=p.key===_playerKey;
    const ago=p.lastSeen?Math.round((Date.now()-p.lastSeen)/60000):null;
    const agoStr=ago===null?'':ago<1?'🟢 ahora':ago<60?ago+'m':ago<1440?Math.floor(ago/60)+'h':Math.floor(ago/1440)+'d';
    const rank=i<3?medals[i]:`#${i+1}`;
    const sub=isLocal?`Lv${p.level} · ${p.xp||0} XP`:(_MAP_SHORT[p.currentMap]||p.currentMap||'?');
    return `<div style="display:flex;align-items:center;gap:8px;background:${isMe?'rgba(253,212,66,.1)':'#1e293b'};border:1px solid ${isMe?'#fcd34d':'#374151'};padding:7px 10px;border-radius:7px">
      <div style="font-size:.9rem;min-width:22px;text-align:center">${rank}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'VT323',monospace;font-size:.92rem;color:${isMe?'#fcd34d':'#f1f5f9'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}${isMe?' ◀':''}</div>
        <div style="font-size:.62rem;color:#6b7280">${sub}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-family:'Press Start 2P',monospace;font-size:.42rem;color:#a78bfa">Lv${p.level}</div>
        <div style="font-size:.68rem;color:#fcd34d">🪙${p.coins||0}</div>
      </div>
      <div style="font-size:.55rem;color:#4b5563;min-width:30px;text-align:right">${agoStr}</div>
    </div>`;
  }).join('');
}

function _showLocalLB(list){
  const render=rows=>_renderLBRows(rows,list,true);
  let rows=[];
  try{rows=JSON.parse(localStorage.getItem(_LB_KEY)||'[]');}catch(e){}
  if(rows.length){render(rows);return;}
  _IDB.get(_LB_KEY).then(d=>{try{rows=d?JSON.parse(d):[];}catch(e){}render(rows);}).catch(()=>render([]));
}

function openLeaderboard(){
  const panel=_('leaderboard-panel'); panel.style.display='block'; STATE='dialog';
  const list=_('lb-list'); list.innerHTML='<div style="text-align:center;color:#6b7280;padding:16px;font-family:\'VT323\',monospace">Cargando...</div>';
  if(!_db){_showLocalLB(list);return;}
  _lbRef=_db.ref('players').orderByChild('level');
  _lbRef.on('value',snap=>{
    const rows=[];
    snap.forEach(child=>rows.push({key:child.key,...child.val()}));
    rows.sort((a,b)=>b.level-a.level||b.coins-a.coins||b.xp-a.xp);
    _renderLBRows(rows,list,false);
  });
}

function closeLeaderboard(){
  _('leaderboard-panel').style.display='none';
  if(_lbRef) _lbRef.off(); _lbRef=null;
  if(STATE==='dialog') STATE='exploring';
}

// ═══ METRO MERVAL ═══
const METRO_DESTS={
  estacion_villa: {name:'Villa Alemana',emoji:'🌿',color:'#4ade80'},
  estacion_quilpue:{name:'Quilpué',     emoji:'🏫',color:'#fbbf24'},
  estacion_vina:  {name:'Viña del Mar', emoji:'🌊',color:'#38bdf8'},
  estacion_valpo: {name:'Valparaíso',   emoji:'🎨',color:'#c084fc'},
};

function openMetro(){
  if(!STATION_MAPS_SET.has(currentMap)) return;
  STATE='dialog';
  const panel=_('metro-panel'), opts=_('metro-options');
  opts.innerHTML='';
  Object.entries(METRO_DESTS).forEach(([mapId,d])=>{
    if(mapId===currentMap) return;
    const btn=document.createElement('button');
    btn.className='dlg-btn';
    btn.style.cssText=`text-align:left;padding:10px 14px;border:1px solid ${d.color}40;background:${d.color}15;color:${d.color};font-size:.65rem`;
    btn.innerHTML=`${d.emoji} <strong>${d.name}</strong>`;
    btn.onclick=()=>boardMetro(mapId);
    opts.appendChild(btn);
  });
  panel.style.display='block';
}

function closeMetro(){
  _('metro-panel').style.display='none';
  STATE='exploring';
}

function boardMetro(destMap){
  _('metro-panel').style.display='none';
  STATE='exploring';
  // Efecto de transición: fade negro breve
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:#000;opacity:0;z-index:9999;pointer-events:none;transition:opacity .4s';
  document.body.appendChild(ov);
  requestAnimationFrame(()=>{
    ov.style.opacity='1';
    setTimeout(()=>{
      transitionTo(destMap,5,5);
      setTimeout(()=>{ ov.style.opacity='0'; setTimeout(()=>ov.remove(),420); },200);
    },420);
  });
}

// ═══ SISTEMA DE GUARDADO ═══
const SAVE_KEY='profeRpgSave_v4';

function _rehydrateItem(item){
  if(!item) return item;
  if(item.id==='caramelo'||item.type==='food')
    item.use=()=>{stats.hunger=Math.min(stats.maxHunger,(stats.hunger||100)+50);syncUI();showDialog('🍬 +50 🍽️ ¡Dulce energía!');};
  if(item.id==='linterna')
    item.use=()=>showDialog('🔦 Linterna activa.\nIlumina automáticamente la noche.');
  return item;
}

function saveGameSilent(){
  let saved=false;
  try{
    const partyData=PARTY_MEMBERS.map(m=>({id:m.id,hp:m.hp,found:m.found,inTeam:m.inTeam}));
    const invData=inventory.map(({use,...rest})=>rest);
    const data={player,stats,coins,progress,currentMap,equipment,party:partyData,inventory:invData};
    const json=JSON.stringify(data);
    try{localStorage.setItem(SAVE_KEY,json);saved=true;}catch(e){console.warn('localStorage fallo:',e);}
    _IDB.set(SAVE_KEY,json);  // respaldo en IndexedDB (async, más confiable en Android)
    _updateLocalLB();
    saved=true;
  }catch(e){console.warn('Save error:',e);}
  _fbSave();
  return saved;
}

function saveGame(){
  const ok=saveGameSilent();
  if(ok) showDialog('💾 Partida guardada con éxito.');
  else showDialog('❌ Error al guardar.\nUsa 📤 para exportar tu partida como respaldo.');
}

function _applyGameState(data){
  player=data.player; player.px=player.x*40; player.py=player.y*40;
  stats=data.stats; coins=data.coins; progress=data.progress||{};
  currentMap=data.currentMap;
  equipment=data.equipment||{armor:null,weapon:null,accessory:null};
  if(data.party){data.party.forEach(sv=>{const m=PARTY_MEMBERS.find(p=>p.id===sv.id);if(m){m.hp=sv.hp;m.found=sv.found;m.inTeam=sv.inTeam;}});}
  inventory=(data.inventory||[]).map(_rehydrateItem);
  if(!progress.questLog) progress.questLog={};
  syncUI(); updateCamera();
  window.__v4Cargado?.(); // el motor carga el mapa guardado
}

function _loadLocal(){
  // 1. Intenta localStorage
  try{
    const saved=localStorage.getItem(SAVE_KEY);
    if(saved){_applyGameState(JSON.parse(saved));showDialog('📂 Partida cargada.\n¡Bienvenido de vuelta, Profe Felipe!');return;}
  }catch(e){}
  // 2. Intenta IndexedDB (más confiable en Android Chrome)
  _IDB.get(SAVE_KEY).then(idbSaved=>{
    if(idbSaved){
      try{_applyGameState(JSON.parse(idbSaved));showDialog('📂 Partida cargada.\n¡Bienvenido de vuelta, Profe Felipe!');return;}
      catch(e){}
    }
    showDialog('⚠️ No hay ninguna partida guardada.',[{text:'📥 Importar desde archivo',action:()=>_('import-file-input').click()},{text:'Cerrar',action:null}]);
  }).catch(()=>{
    showDialog('⚠️ No hay ninguna partida guardada.',[{text:'📥 Importar desde archivo',action:()=>_('import-file-input').click()},{text:'Cerrar',action:null}]);
  });
}

function loadGame(){
  if(_db&&_playerKey){
    _db.ref('players/'+_playerKey+'/fullState').once('value',snap=>{
      const fbData=snap.val();
      if(fbData){_applyGameState(fbData);showDialog('📂 Partida cargada desde la nube ☁️');}
      else _loadLocal();
    });
  } else {
    _loadLocal();
  }
}

