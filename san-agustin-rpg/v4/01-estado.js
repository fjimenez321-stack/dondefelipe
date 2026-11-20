// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — DOM, estado del jugador, progreso
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ DOM CACHE ═══
const _=id=>document.getElementById(id);
const EL={
  hpV:_('hp-v'),mpV:_('mp-v'),xpV:_('xp-v'),hpBar:_('hp-bar'),mpBar:_('mp-bar'),xpBar:_('xp-bar'),
  lvBadge:_('lv-badge'),coinN:_('coin-n'),blueDisp:_('blue-display'),blueN:_('blue-n'),mapLabel:_('map-label'),
  encFlash:_('enc-flash'),hungerDisp:_('hunger-bar'),zoneTag:_('zone-tag'),
  battle:_('battle'),bEs:_('b-es'),bEn:_('b-en'),bHt:_('b-ht'),bEhp:_('b-ehp'),
  bPs:_('b-ps'),bHf:_('b-hf'),bMf:_('b-mf'),bHn:_('b-hn'),bMn:_('b-mn'),
  bEtype:_('b-etype'),bEnemyBg:_('b-enemy-bg'),bSt:_('b-st'),bMsg:_('b-msg'),bAct:_('b-act'),bArena:_('b-arena'),
  btnCof:_('btn-cof'),btnRun:_('btn-run'),btnPsy:_('btn-psy'),btnBack:_('btn-back'),btnTeam:_('btn-team'),
  dlgBox:_('dlg-box'),dt:_('dt'),dbBtns:_('db-btns'),
  invPanel:_('inv-panel'),invList:_('inv-list'),
  shopPanel:_('shop-panel'),kellaMsg:_('kella-msg'),shopCoins:_('shop-coins'),shopFb:_('shop-fb'),shopItems:_('shop-items'),
  kpPanel:_('keypad-panel'),kpAtt:_('kp-att'),kpMsg:_('kp-msg'),kpDisp:_('kp-disp'),
  sevenPanel:_('seven-panel')
};

// ═══ ESTADO ═══
let canvas={width:400,height:400},ctx=null;const TS=40;let VW=10,VH=10; // el motor asigna ctx/canvas/VW/VH al dibujar
let STATE='exploring',tick=0,currentMap='jardin_eden',battle=null,twT=null;
let camera={x:0,y:0};
const gameStartTime=Date.now();
let inBoat=false;
let hungerTimer=0; // hunger passive decrease
let secretariaLights=true;
let player={x:11,y:6,facing:'up',dir:'up',steps:0};
let stats={hp:180,maxHp:180,mp:90,maxMp:90,xp:0,xpNext:80,level:1,atk:28,def:14,coffees:3,status:null,statusTurns:0,hunger:100,maxHunger:100};
let coins=0,inventory=[]; // start with 3 candies (added after mkCandy is defined)
// Factory de caramelos
function mkCandy(){return {id:'caramelo',name:'Caramelo',emoji:'🍬',type:'food',use:()=>{stats.hunger=Math.min(stats.maxHunger,stats.hunger+50);syncUI();showDialog('🍬 +50 🍽️ ¡Dulce energía!');}};}
inventory.push(mkCandy(),mkCandy(),mkCandy()); // inicio con 3 caramelos
let progress={
  quests:{psico:0},unlocked:{psicoped:false},
  claudita:0,blueCoins:0,
  canchaVisited:false,biblioVisited:false,
  codeOk:false,chestOpened:false,
  jeanette:{attempts:0,locked:false},
  salaContVisited:false, plazaVisited:false,
  paulaMission:{given:false,completed:false,rewarded:false},
  psyAttackUnlocked:false,
  alexBossDefeated:false,
  villaVisited:false,
  salonVisited:false,
  centroVisited:false,
  bioVisited:false,
  reservaVisited:false,
  buinzooVisited:false,
  buinzooBosses:{},
  powerAnimal:false,
  powerConservacion:false,
  hasBoat:false,
  lakeChestreward:false,
  garden:{},
  gonzaloMission:0,
  antonioMission:0,
  antonioKills:0,
  antonioRewarded:false,
  jorgeIdx:0,
  jorgeProfIdx:0,
  antiItems:{},
  carolIdx:0,
  carolMet:false,
  carolGrade:'',
  antiQuestStarted:false,
  antiQuestDone:false, felipeSalaIdx:0, joseProfIdx:0, camilaIdx:0,
  dahianMission:0,
  dahianCatFood:false,
  gardenTutorial:false,
  cutTrees:{},
  hasAxe:false,
  hasPico:false,
  hasLabKit:false,
  hasCaldero:false,
  gonzaloRewarded:false,
  dahianRewarded:false,
  minedAt:{},
  rangerMissions:{martinez:0,silva:0,rojas:0},
  rangerSeeds:0,
  franciscoMission:{given:false,delivered:false,rewarded:false}
};

