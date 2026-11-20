// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Laboratorio, carpintería, metalurgia, minas
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══════════════════════════════════════════════════════
// SISTEMA DE LABORATORIOS — Química Realista
// ═══════════════════════════════════════════════════════
const LAB_MODES={
  biologia: {name:'🧬 Laboratorio de Biología', color:'#22c55e'},
  secretaria:{name:'⚗️ Laboratorio de Química',  color:'#f59e0b'},
  sala_cont: {name:'⚙️ Laboratorio de Física',   color:'#60a5fa'},
  biblioteca:{name:'🔬 Lab. de Materiales',       color:'#a78bfa'},
};

// ─ Definición de reactivos ─
const REACTIVOS={
  H2O:     {id:'H2O',     name:'Agua',          formula:'H₂O',    emoji:'💧', color:'#60a5fa'},
  SiO2:    {id:'SiO2',    name:'Sílice',         formula:'SiO₂',   emoji:'🏖️', color:'#d97706'},
  CaCO3:   {id:'CaCO3',   name:'Calcita',        formula:'CaCO₃',  emoji:'🪨', color:'#9ca3af'},
  Fe2O3:   {id:'Fe2O3',   name:'Mineral Hierro', formula:'Fe₂O₃',  emoji:'🔩', color:'#b45309'},
  C:       {id:'C',       name:'Carbón',         formula:'C',      emoji:'⚫', color:'#374151'},
  NaCl:    {id:'NaCl',    name:'Sal Común',      formula:'NaCl',   emoji:'🧂', color:'#e2e8f0'},
  Arcilla: {id:'Arcilla', name:'Arcilla',        formula:'Al₂Si₂O₅',emoji:'🟫', color:'#92400e'},
  PlantaM: {id:'PlantaM', name:'Planta Medicinal',formula:'C₁₄H₂₀O₄',emoji:'🌿', color:'#15803d'},
  ADN:     {id:'ADN',     name:'Muestra ADN',    formula:'C₅H₁₀O₄', emoji:'🧬', color:'#a78bfa'},
  MaderaPino:{id:'MaderaPino',name:'Madera Pino', formula:'(C₆H₁₀O₅)n',emoji:'🌲',color:'#166534'},
  MaderaEuc: {id:'MaderaEuc', name:'Madera Eucalipto',formula:'Lignocel.',emoji:'🪵',color:'#92400e'},
};

// ─ Recetas del laboratorio ─
const LAB_RECIPES=[
  // ── QUÍMICA BÁSICA
  {id:'cal_viva', lab:['secretaria','biblioteca'],
   name:'Cal Viva', emoji:'⬜', cat:'quim',
   reaccion:'CaCO₃ → CaO + CO₂↑  (900 °C)',
   concepto:'Descomposición térmica. ΔH = +178 kJ/mol',
   ing:['CaCO3'], xp:15,
   result:{id:'cal_viva',name:'Cal Viva',emoji:'⬜',type:'resource',desc:'CaO - 90° calcinación'}},

  {id:'cemento', lab:['secretaria','sala_cont'],
   name:'Cemento Portland', emoji:'🪣', cat:'quim',
   reaccion:'CaO + SiO₂ → CaSiO₃  (1450 °C)',
   concepto:'Clinkerización. Silicato cálcico: módulo de fineza 350 m²/kg',
   ing:['cal_viva','SiO2'], xp:20,
   result:{id:'cemento',name:'Cemento',emoji:'🪣',type:'resource',desc:'CaSiO₃ — material aglomerante'}},

  {id:'ladrillo', lab:['secretaria','sala_cont'],
   name:'Ladrillo Cocido', emoji:'🧱', cat:'const',
   reaccion:'Al₂Si₂O₅ + calor(900°C) → Ladrillo',
   concepto:'Sinterización arcilla. Resistencia compresiva: 15 MPa\nPorosidad: 20-30%, densidad: 1800 kg/m³',
   ing:['Arcilla','Arcilla','H2O'], xp:18,
   result:{id:'ladrillo',name:'Ladrillo',emoji:'🧱',type:'resource',desc:'Arcilla sinterizada 900°C'}},

  {id:'concreto', lab:['secretaria','sala_cont'],
   name:'Hormigón', emoji:'🏗️', cat:'const',
   reaccion:'CaSiO₃ + SiO₂ + H₂O → Hormigón (hidratación)',
   concepto:'Relación a/c = 0.45. f\'c = 25 MPa (28 días)\nRigidez: E = 23 GPa',
   ing:['cemento','SiO2','H2O'], xp:25,
   result:{id:'concreto',name:'Hormigón',emoji:'🏗️',type:'resource',desc:'f\'c=25MPa — material constructivo'}},

  {id:'vidrio', lab:['secretaria','biblioteca'],
   name:'Vidrio', emoji:'🔲', cat:'quim',
   reaccion:'SiO₂ + Na₂CO₃ → Na₂SiO₃ + CO₂↑  (1400°C)',
   concepto:'Red vítrea amorfa. n=1.5, T softening=730°C\nTransmitancia: 90% visible',
   ing:['SiO2','SiO2','NaCl'], xp:28,
   result:{id:'vidrio',name:'Vidrio',emoji:'🔲',type:'resource',desc:'SiO₂ amorfo — óptico'}},

  {id:'acero', lab:['sala_cont','biblioteca'],
   name:'Acero', emoji:'⚙️', cat:'metal',
   reaccion:'Fe₂O₃ + 3CO → 2Fe + 3CO₂  (Reducción)',
   concepto:'Proceso alto horno. %C = 0.2-0.8%\nσy = 250 MPa, E = 200 GPa',
   ing:['Fe2O3','C','C'], xp:35,
   result:{id:'acero',name:'Acero',emoji:'⚙️',type:'resource',desc:'Fe+C — E=200 GPa'}},

  {id:'acido_hcl', lab:['secretaria'],
   name:'Ácido Clorhídrico', emoji:'🧪', cat:'quim',
   reaccion:'NaCl + H₂SO₄ → HCl↑ + NaHSO₄',
   concepto:'Síntesis HCl gas. pH < 1, pKa = -7\nBurbujeo en agua → HCl(aq)',
   ing:['NaCl','SiO2'], xp:22,
   result:{id:'acido_hcl',name:'HCl',emoji:'🧪',type:'food',
     use:()=>{if(window.battle){battle.enemy.hp=Math.max(0,battle.enemy.hp-Math.floor(stats.atk*1.5));syncBP();showDialog('🧪 ¡HCl corrosivo!\nDaño ácido: '+Math.floor(stats.atk*1.5));}else showDialog('🧪 HCl — usar en combate.')},
     desc:'pH<1 — arma ácida'}},

  {id:'jabon', lab:['secretaria','biologia'],
   name:'Jabón', emoji:'🧼', cat:'quim',
   reaccion:'NaOH + R-COOH → R-COONa + H₂O  (Saponificación)',
   concepto:'Emulsificación micelas. CMC = 0.002 mol/L\nHLB = 12-18 (surfactante)',
   ing:['NaCl','H2O','PlantaM'], xp:18,
   result:{id:'jabon',name:'Jabón',emoji:'🧼',type:'food',
     use:()=>{stats.status=null;stats.statusTurns=0;stats.hunger=Math.min(stats.maxHunger,stats.hunger+15);syncUI();showDialog('🧼 ¡Limpio y fresco!\nEstado curado. +15 🍽️\nSaponificación NaOH+ácido graso.')},
     desc:'Cura estado + +15 hambre'}},

  {id:'solucion_curativa', lab:['biologia','secretaria'],
   name:'Solución Curativa', emoji:'💊', cat:'bio',
   reaccion:'Extracción: C₁₄H₂₀O₄ + EtOH → Fitol activo',
   concepto:'Alcaloides: IC₅₀=12μg/mL\npH tampón: 6.5 (citrato)\nBiodisponibilidad oral: 78%',
   ing:['PlantaM','H2O'], xp:20,
   result:{id:'solucion_curativa',name:'Solución Curativa',emoji:'💊',type:'food',
     use:()=>{stats.hp=Math.min(stats.maxHp,stats.hp+45);stats.hunger=Math.min(stats.maxHunger,stats.hunger+20);syncUI();showDialog('💊 +45 HP | +20 🍽️\nFitoquímica activa. pH=6.5')},
     desc:'+45 HP +20 hambre'}},

  {id:'antidoto', lab:['secretaria','biologia'],
   name:'Antídoto', emoji:'💉', cat:'bio',
   reaccion:'Neutralización: HA + B⁻ → A⁻ + HB',
   concepto:'Carbón activado: 1500 m²/g\nAdsorción toxinas: isoterma Freundlich\nKd = 500 L/kg',
   ing:['PlantaM','C'], xp:25,
   result:{id:'antidoto',name:'Antídoto',emoji:'💉',type:'food',
     use:()=>{stats.status=null;stats.statusTurns=0;syncUI();showDialog('💉 ¡Estado curado!\nNeutralización ácido-base.')},
     desc:'Cura envenenamiento/estrés'}},

  {id:'super_semilla', lab:['biologia'],
   name:'Súper Semilla Tomate', emoji:'🍅⚡', cat:'bio',
   reaccion:'NPK(aq) + Semilla → enriquecimiento osmótico',
   concepto:'Gibberelinas: elongación celular\nProductividad: +200%\n6CO₂+6H₂O→C₆H₁₂O₆+6O₂',
   ing:['semilla_tomate','H2O','SiO2'], xp:30,
   result:{id:'super_semilla_tomate',name:'Súper Semilla Tomate',emoji:'🍅⚡',type:'seed',
     desc:'Crece 3× rápido, cosecha doble'}},

  {id:'transgenico', lab:['biologia'],
   name:'Semilla Transgénica', emoji:'🧬🌱', cat:'bio',
   reaccion:'CRISPR-Cas9: sgRNA + Cas9 → corte dsDNA',
   concepto:'Locus Xa21: gen resistencia RB\nTransformación Agrobacterium\nSelección: kan 50mg/L',
   ing:['semilla_tomate','ADN','H2O'], xp:40,
   result:{id:'semilla_transgenica',name:'Semilla Transgénica',emoji:'🧬🌱',type:'seed',
     desc:'Resistente a plagas y sequía'}},

  {id:'armadura_lab', lab:['sala_cont','biblioteca'],
   name:'Armadura Compuesta', emoji:'🦺', cat:'metal',
   reaccion:'Fe + C + Al₂O₃ → Compósito metálico',
   concepto:'Dureza HV=850 / σy=1200 MPa\nCapas: acero / cerámica / fibra\nEnergia impacto: 45 J/cm²',
   ing:['acero','CaCO3','C'], xp:45,
   result:{id:'armadura_lab',name:'Armadura Compuesta',emoji:'🦺',type:'equip',def:15,
     use:()=>{equipment.armor={id:'armadura_lab',name:'Armadura Compuesta',emoji:'🦺',def:15,desc:'+15 DEF'};syncUI();showDialog('🦺 ¡Armadura Compuesta equipada!\n+15 DEF\nHV=850, σy=1200 MPa')}}},
];

// ─ Mapa nombre→id reactivo ─
const ING_META={
  H2O:{emoji:'💧',name:'Agua (H₂O)'},
  SiO2:{emoji:'🏖️',name:'Sílice (SiO₂)'},
  CaCO3:{emoji:'🪨',name:'Calcita (CaCO₃)'},
  Fe2O3:{emoji:'🔩',name:'Hierro (Fe₂O₃)'},
  C:{emoji:'⚫',name:'Carbón (C)'},
  NaCl:{emoji:'🧂',name:'Sal (NaCl)'},
  Arcilla:{emoji:'🟫',name:'Arcilla'},
  PlantaM:{emoji:'🌿',name:'Planta Med.'},
  ADN:{emoji:'🧬',name:'ADN'},
  semilla_tomate:{emoji:'🍅',name:'Semilla Tomate'},
  cal_viva:{emoji:'⬜',name:'Cal Viva'},
  cemento:{emoji:'🪣',name:'Cemento'},
  acero:{emoji:'⚙️',name:'Acero'},
};
function ingMeta(id){return ING_META[id]||{emoji:'📦',name:id};}
function hasIng(id,qty){return inventory.filter(i=>i.id===id).length>=(qty||1);}

let labCurrentMode=null;
function openLab(){
  if(STATE==='battle'||STATE==='shop'||STATE==='minigame') return;
  STATE='dialog';
  const modeMap={biologia:'biologia',secretaria:'secretaria',sala_cont:'sala_cont',biblioteca:'biblioteca'};
  labCurrentMode=modeMap[currentMap]||'secretaria';
  STATE='dialog'; renderLab(); _('lab-panel').style.display='flex';
}
function closeLab(){_('lab-panel').style.display='none';if(STATE==='dialog')STATE='exploring';}

function renderLab(){
  const mode=labCurrentMode;
  const def=LAB_MODES[mode]||LAB_MODES.secretaria;
  _('lab-title').textContent=def.name; _('lab-title').style.color=def.color;

  // Available reagents
  const allIds=[...new Set(LAB_RECIPES.flatMap(r=>r.ing))];
  const avail=allIds.filter(id=>inventory.some(i=>i.id===id));
  _('lab-avail').innerHTML=avail.length
    ?avail.map(id=>{const m=ingMeta(id); return `<span style="font-size:.35rem;padding:2px 5px;background:rgba(255,255,255,.07);border-radius:4px;margin:1px">${m.emoji} ${m.name}</span>`;}).join('')
    :'<span style="opacity:.35;font-size:.35rem">Ningún reactivo. Explora para recolectar.</span>';

  // Recipes for this lab
  const recipes=LAB_RECIPES.filter(r=>r.lab.includes(mode));
  _('lab-recipe-list').innerHTML=recipes.map(r=>{
    const canMake=r.ing.every(id=>hasIng(id));
    const ingHtml=r.ing.map(id=>{
      const m=ingMeta(id); const ok=hasIng(id);
      return `<span style="${ok?'color:#86efac':'opacity:.3'}">${m.emoji}</span>`;
    }).join('<span style="opacity:.5;font-size:.55rem"> + </span>');
    const borderColor=canMake?def.color:'#334155';
    return `<div style="border:1px solid ${borderColor};border-radius:6px;padding:8px;margin-bottom:6px;background:${canMake?'rgba(255,255,255,.04)':'transparent'};cursor:${canMake?'pointer':'default'}"
        onclick="${canMake?`craftItem('${r.id}')`:''}"  >
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:.45rem;color:${canMake?'#f1f5f9':'#64748b'}">${r.emoji} ${r.name}</span>
        <span style="font-size:.35rem;color:#fbbf24">+${r.xp}XP</span>
      </div>
      <div style="font-size:.32rem;color:#475569;margin:3px 0;font-family:monospace">${r.reaccion}</div>
      <div style="display:flex;align-items:center;gap:4px;margin:4px 0">${ingHtml}
        <span style="opacity:.4;font-size:.55rem">→</span>
        <span style="font-size:.7rem">${r.emoji}</span>
      </div>
      <div style="font-size:.3rem;color:#334155;font-family:monospace;white-space:pre-line">${r.concepto}</div>
      ${canMake?`<div style="text-align:center;margin-top:5px;font-size:.38rem;color:${def.color};border-top:1px solid ${def.color}33;padding-top:4px">⚗️ SINTETIZAR</div>`:''}
    </div>`;
  }).join('');
}

function craftItem(rid){
  const r=LAB_RECIPES.find(x=>x.id===rid); if(!r) return;
  if(!r.ing.every(id=>hasIng(id))){showDialog('⚗️ Faltan reactivos.');return;}
  r.ing.forEach(id=>{const i=inventory.findIndex(x=>x.id===id);if(i>=0)inventory.splice(i,1);});
  inventory.push({...r.result});
  stats.xp+=r.xp;
  if(stats.xp>=stats.xpNext){stats.xp-=stats.xpNext;stats.level++;stats.xpNext=Math.floor(stats.xpNext*1.45);stats.maxHp+=12;stats.hp=stats.maxHp;setTimeout(()=>showLvlUp(stats.level),300);}
  syncUI(); closeLab();
  showDialog(`⚗️ ¡SÍNTESIS COMPLETADA!\n${r.emoji} ${r.name}\n\n${r.reaccion}\n\n+${r.xp} XP`);
}

// ═══════════════════════════════════════════════════════
// SISTEMA DE CARPINTERÍA
// ═══════════════════════════════════════════════════════
const CARP_RECIPES=[
  {id:'cama',name:'Cama',emoji:'🛏️',
   ing:[{id:'MaderaPino',qty:3},{id:'fibra_vegetal',qty:2}],
   desc:'Tablas de pino + relleno vegetal',
   result:{id:'cama',name:'Cama',emoji:'🛏️',type:'furniture',
     use:()=>{stats.hp=stats.maxHp;stats.mp=stats.maxMp;stats.hunger=Math.min(stats.maxHunger,stats.hunger+70);syncUI();
       showDialog('🛏️ ¡Dormiste 8 horas!\n\n❤️ HP completo\n💙 MP completo\n🍽️ +70 Hambre\n\n"El descanso es productividad."');}}},
  {id:'velador',name:'Velador',emoji:'🪔',
   ing:[{id:'MaderaPino',qty:1},{id:'MaderaEuc',qty:1}],
   desc:'Mixto pino-eucalipto',
   result:{id:'velador',name:'Velador',emoji:'🪔',type:'furniture',
     use:()=>{stats.atk+=2;syncUI();showDialog('🪔 ¡Velador instalado!\n+2 ATK permanente\n(La luz mejora la concentración)');}}},
  {id:'banca',name:'Banca',emoji:'🪑',
   ing:[{id:'MaderaPino',qty:2}],
   desc:'2 tablas de pino',
   result:{id:'banca',name:'Banca',emoji:'🪑',type:'furniture',
     use:()=>{stats.hp=Math.min(stats.maxHp,stats.hp+50);stats.hunger=Math.min(stats.maxHunger,stats.hunger+30);syncUI();
       showDialog('🪑 Descansaste en la banca.\n+50 HP | +30 🍽️');}}},
  {id:'bodega',name:'Bodega',emoji:'🗄️',
   ing:[{id:'MaderaEuc',qty:4}],
   desc:'4 tablas de eucalipto',
   result:{id:'bodega',name:'Bodega',emoji:'🗄️',type:'furniture',
     use:()=>{if(!progress.bodegaActive){progress.bodegaActive=true;
       showDialog('🗄️ ¡Bodega construida!\n\nGuarda hasta 10 ítems extras\nen el inventario expandido.\n\nCapacidad: +10 slots');}
       else showDialog('🗄️ Bodega ya activa.\n\nCapacidad expandida: +10 slots.');}}},
  {id:'mesa_trabajo',name:'Mesa de Trabajo',emoji:'🪚',
   ing:[{id:'MaderaEuc',qty:3},{id:'acero',qty:1}],
   desc:'Eucalipto + Acero',
   result:{id:'mesa_trabajo',name:'Mesa de Trabajo',emoji:'🪚',type:'furniture',
     use:()=>{showDialog('🪚 Mesa de Trabajo\n\nMejora las recetas del laboratorio.\n+15% XP en síntesis.');}}},
  {id:'madera_proc',name:'Tabla Procesada',emoji:'🪵',
   ing:[{id:'MaderaPino',qty:2}],
   desc:'Aserrado + cepillado',
   result:{id:'madera_proc',name:'Tabla Procesada',emoji:'🪵',type:'resource',
     desc:'Madera lista para construcción'}},
  {id:'refugio_madera',name:'Refugio de Madera',emoji:'🛖',
   ing:[{id:'MaderaPino',qty:4},{id:'MaderaEuc',qty:2}],
   desc:'Estructura triangulada',
   result:{id:'refugio_madera',name:'Refugio de Madera',emoji:'🛖',type:'furniture',
     use:()=>{stats.hp=stats.maxHp;stats.mp=stats.maxMp;stats.hunger=Math.min(stats.maxHunger,stats.hunger+100);syncUI();
       showDialog('🛖 ¡Refugio montado!\nHP/MP completamente restaurados.\n+100 🍽️\n\nTipología: A-frame\nCarga máx: 2.2 kN/m²');}}},
];

function openCarpentry(){
  if(STATE==='battle'||STATE==='shop') return;
  STATE='dialog'; renderCarpentry(); _('carp-panel').style.display='flex';
}
function closeCarpentry(){_('carp-panel').style.display='none';STATE='exploring';}

function renderCarpentry(){
  const el=_('carp-recipe-list'); if(!el) return;
  const hasPino=inventory.some(i=>i.id==='MaderaPino');
  const hasEuc=inventory.some(i=>i.id==='MaderaEuc');
  _('carp-wood').innerHTML=
    `${hasPino?'<span style="color:#86efac">🌲 Madera Pino: '+inventory.filter(i=>i.id==='MaderaPino').length+'</span>':'<span style="opacity:.35">🌲 Madera Pino: 0</span>'}  `+
    `${hasEuc?'<span style="color:#86efac">🪵 Madera Eucalipto: '+inventory.filter(i=>i.id==='MaderaEuc').length+'</span>':'<span style="opacity:.35">🪵 Madera Eucalipto: 0</span>'}`;
  if(!hasPino&&!hasEuc){
    el.innerHTML='<div style="opacity:.35;text-align:center;padding:20px;font-size:.38rem">Sin madera.\nTala árboles industriales 🌲 en la Reserva.</div>'; return;
  }
  el.innerHTML=CARP_RECIPES.map(r=>{
    const canMake=r.ing.every(i=>inventory.filter(x=>x.id===i.id).length>=(i.qty||1));
    const ingHtml=r.ing.map(i=>{
      const cnt=inventory.filter(x=>x.id===i.id).length;
      const ok=cnt>=(i.qty||1);
      const m={MaderaPino:'🌲 Pino',MaderaEuc:'🪵 Euc.',fibra_vegetal:'🌾',acero:'⚙️'}[i.id]||i.id;
      return `<span style="${ok?'color:#86efac':'opacity:.3'}">${m}×${i.qty||1}</span>`;
    }).join('<span style="opacity:.4"> + </span>');
    return `<div style="border:1px solid ${canMake?'#92400e':'#1e293b'};border-radius:6px;padding:7px;margin-bottom:5px;cursor:${canMake?'pointer':'default'};background:${canMake?'rgba(146,64,14,.08)':'transparent'}"
        onclick="${canMake?'buildFurniture(\''+r.id+'\')':''}" >
      <div style="display:flex;justify-content:space-between">
        <span style="font-size:.45rem;color:${canMake?'#fef9c3':'#64748b'}">${r.emoji} ${r.name}</span>
      </div>
      <div style="font-size:.33rem;color:#64748b;margin:2px 0">${r.desc}</div>
      <div style="font-size:.35rem;margin:3px 0">${ingHtml} <span style="opacity:.4">→</span> ${r.emoji}</div>
      ${canMake?'<div style="text-align:center;font-size:.36rem;color:#d97706;margin-top:4px">🪚 FABRICAR</div>':''}
    </div>`;
  }).join('');
}

function buildFurniture(rid){
  const r=CARP_RECIPES.find(x=>x.id===rid); if(!r) return;
  if(!r.ing.every(i=>inventory.filter(x=>x.id===i.id).length>=(i.qty||1))){
    showDialog('🪚 Falta madera.'); return;
  }
  r.ing.forEach(i=>{let n=i.qty||1;while(n-->0){const idx=inventory.findIndex(x=>x.id===i.id);if(idx>=0)inventory.splice(idx,1);}});
  inventory.push({...r.result});
  stats.xp+=20;
  if(stats.xp>=stats.xpNext){stats.xp-=stats.xpNext;stats.level++;stats.xpNext=Math.floor(stats.xpNext*1.45);stats.maxHp+=12;stats.hp=stats.maxHp;}
  syncUI(); closeCarpentry();
  showDialog(`🪚 ¡${r.emoji} ${r.name} fabricado!\n\n${r.result.desc||'Listo para usar.'}\n\n+20 XP`);
}

// ═══════════════════════════════════════════════════════
// SISTEMA DE METALURGIA — Fundición · Aleación · Forjado
// ═══════════════════════════════════════════════════════
// Recursos metálicos: mineral_cobre, estano_mineral, zinc_mineral

// ── Recetas de FUNDICIÓN (mena → lingote) ──────────────
const SMELT_RECIPES=[
  {id:'ling_hierro', name:'Lingote de Hierro', emoji:'🔩', phase:'fundicion',
   eq:'Fe₂O₃ + 3C → 2Fe + 3CO₂', T:'1535°C · coke', xp:20,
   ing:[{id:'Fe2O3',n:2},{id:'C',n:2}],
   result:{id:'ling_hierro',name:'Lingote Fe',emoji:'🔩',type:'metal',desc:'Hierro puro 99.5%'}},

  {id:'ling_cobre', name:'Lingote de Cobre', emoji:'🟤', phase:'fundicion',
   eq:'2CuFeS₂ + 5O₂ → 2Cu + 2FeO + 4SO₂', T:'1085°C · oxidación',xp:22,
   ing:[{id:'mineral_cobre',n:2},{id:'C',n:1}],
   result:{id:'ling_cobre',name:'Lingote Cu',emoji:'🟤',type:'metal',desc:'Cobre electrolítico 99.9%'}},

  {id:'ling_estano', name:'Lingote de Estaño', emoji:'⬜', phase:'fundicion',
   eq:'SnO₂ + 2C → Sn + 2CO₂', T:'232°C · reducción', xp:18,
   ing:[{id:'estano_mineral',n:2},{id:'C',n:1}],
   result:{id:'ling_estano',name:'Lingote Sn',emoji:'⬜',type:'metal',desc:'Estaño 98% pureza'}},

  {id:'ling_aluminio', name:'Lingote de Aluminio', emoji:'🪨', phase:'fundicion',
   eq:'2Al₂O₃ → 4Al + 3O₂ (electrolisis Hall-Héroult)', T:'960°C · electrolisis',xp:35,
   ing:[{id:'CaCO3',n:1},{id:'SiO2',n:2},{id:'C',n:2}],
   result:{id:'ling_aluminio',name:'Lingote Al',emoji:'🪙',type:'metal',desc:'Aluminio 99.7% Hall-Héroult'}},
];

// ── Recetas de ALEACIÓN (metales → aleación) ──────────
const ALLOY_RECIPES=[
  {id:'bronce', name:'Bronce (Cu₉Sn₁)', emoji:'🟡', phase:'aleacion',
   eq:'9Cu + 1Sn → Cu₉Sn₁ (bronce)', T:'950°C fusión', xp:28,
   ing:[{id:'ling_cobre',n:2},{id:'ling_estano',n:1}],
   result:{id:'ling_bronce',name:'Lingote Bronce',emoji:'🟡',type:'metal',desc:'Cu₉Sn₁ · σy=120MPa'}},

  {id:'laton', name:'Latón (CuZn)', emoji:'🔆', phase:'aleacion',
   eq:'Cu + Zn → CuZn₃₀ (latón amarillo)', T:'930°C fusión',xp:26,
   ing:[{id:'ling_cobre',n:2},{id:'zinc_mineral',n:1}],
   result:{id:'ling_laton',name:'Lingote Latón',emoji:'🔆',type:'metal',desc:'CuZn₃₀ · anticorrosivo'}},

  {id:'acero_forja', name:'Acero de Forja (Fe+C)', emoji:'⚙️', phase:'aleacion',
   eq:'Fe + 0.6%C → Acero eutectoide', T:'1400°C forja',xp:32,
   ing:[{id:'ling_hierro',n:2},{id:'C',n:1}],
   result:{id:'ling_acero',name:'Lingote Acero',emoji:'⚙️',type:'metal',desc:'Fe-0.6C · E=200GPa'}},

  {id:'acero_inox', name:'Acero Inoxidable', emoji:'✨', phase:'aleacion',
   eq:'Fe + 18%Cr + 8%Ni → 316L', T:'1450°C vacío', xp:40,
   ing:[{id:'ling_acero',n:2},{id:'ling_aluminio',n:1}],
   result:{id:'ling_inox',name:'Lingote 316L',emoji:'✨',type:'metal',desc:'18Cr-8Ni · corrosion free'}},
];

// ── Recetas de FORJADO (lingote → artefacto) ──────────
const FORGE_RECIPES=[
  {id:'espada_hierro', name:'Espada de Hierro', emoji:'⚔️', phase:'forjado',
   eq:'Forja a 900°C + martillado + temple 60°C', T:'Dureza HRC 45',xp:30,
   ing:[{id:'ling_hierro',n:2}],
   stats:'+8 ATK',
   result:{id:'espada_hierro',name:'Espada Hierro',emoji:'⚔️',type:'weapon',atk:8,
     use:()=>{equipment.weapon={id:'espada_hierro',name:'Espada Hierro',emoji:'⚔️',atk:8,desc:'+8 ATK'};syncUI();showDialog('⚔️ ¡Espada de Hierro equipada!\n+8 ATK\nHardness HRC 45 / σ_flex=650MPa');}}},

  {id:'espada_acero', name:'Espada de Acero', emoji:'🗡️', phase:'forjado',
   eq:'Acero 0.6%C · temple 800°C→aceite→revenido 200°C', T:'HRC 58',xp:42,
   ing:[{id:'ling_acero',n:2}],
   stats:'+15 ATK',
   result:{id:'espada_acero',name:'Espada Acero',emoji:'🗡️',type:'weapon',atk:15,
     use:()=>{equipment.weapon={id:'espada_acero',name:'Espada Acero',emoji:'🗡️',atk:15,desc:'+15 ATK'};syncUI();showDialog('🗡️ ¡Espada de Acero equipada!\n+15 ATK\nHRC 58 · σy=1200MPa');}}},

  {id:'espada_bronce', name:'Espada de Bronce', emoji:'🔱', phase:'forjado',
   eq:'Cu₉Sn₁ colado + bruñido', T:'HB 120',xp:35,
   ing:[{id:'ling_bronce',n:2}],
   stats:'+10 ATK +3 DEF',
   result:{id:'espada_bronce',name:'Espada Bronce',emoji:'🔱',type:'weapon',atk:10,
     use:()=>{equipment.weapon={id:'espada_bronce',name:'Espada Bronce',emoji:'🔱',atk:10,desc:'+10 ATK'};syncUI();showDialog('🔱 ¡Espada de Bronce equipada!\n+10 ATK\nHB 120 · Cu₉Sn₁');}}},

  {id:'escudo_bronce', name:'Escudo de Bronce', emoji:'🛡️', phase:'forjado',
   eq:'Cu₉Sn₁ laminado 3mm + nervaduras', T:'σ_imp=45J/cm²',xp:38,
   ing:[{id:'ling_bronce',n:3}],
   stats:'+12 DEF',
   result:{id:'escudo_bronce',name:'Escudo Bronce',emoji:'🛡️',type:'armor',def:12,
     use:()=>{equipment.armor={id:'escudo_bronce',name:'Escudo Bronce',emoji:'🛡️',def:12,desc:'+12 DEF'};syncUI();showDialog('🛡️ ¡Escudo de Bronce equipado!\n+12 DEF\nCu₉Sn₁ · 3mm espesor');}}},

  {id:'armadura_acero', name:'Armadura de Acero', emoji:'🦾', phase:'forjado',
   eq:'316L laminado+soldado · capas 6mm', T:'σy=550MPa',xp:55,
   ing:[{id:'ling_acero',n:4}],
   stats:'+20 DEF',
   result:{id:'armadura_acero',name:'Armadura Acero',emoji:'🦾',type:'armor',def:20,
     use:()=>{equipment.armor={id:'armadura_acero',name:'Armadura Acero',emoji:'🦾',def:20,desc:'+20 DEF'};syncUI();showDialog('🦾 ¡Armadura de Acero equipada!\n+20 DEF — Mejor armadura del juego!\nFe-0.6C 316L · σy=550MPa');}}},

  {id:'armadura_inox', name:'Armadura 316L', emoji:'🥇', phase:'forjado',
   eq:'18Cr-8Ni laminado · pasivación ácido nítrico', T:'Rc 25',xp:65,
   ing:[{id:'ling_inox',n:3}],
   stats:'+25 DEF',
   result:{id:'armadura_inox',name:'Armadura 316L',emoji:'🥇',type:'armor',def:25,
     use:()=>{equipment.armor={id:'armadura_inox',name:'Armadura 316L',emoji:'🥇',def:25,desc:'+25 DEF MAX'};syncUI();showDialog('🥇 ¡ARMADURA 316L EQUIPADA!\n+25 DEF — LA MEJOR ARMADURA!\n18Cr-8Ni · Rc25 · pasivada');}}},

  {id:'hacha_hierro', name:'Hacha Taladera', emoji:'🪓', phase:'forjado',
   eq:'Fe forjado 900°C · filo 25° · mango eucalipto', T:'HRC 40',xp:25,
   ing:[{id:'ling_hierro',n:2},{id:'MaderaEuc',n:1}],
   stats:'Tala: 4 maderas por árbol',
   result:{id:'hacha_hierro',name:'Hacha Hierro',emoji:'🪓',type:'tool',
     use:()=>{progress.hasAxe=true;showDialog('🪓 ¡Hacha de Hierro equipada!\nAhora talará 4 maderas por árbol.\nFilo 25° · HRC 40');}}},

  {id:'caldero_cobre', name:'Caldero de Cobre', emoji:'🫙', phase:'forjado',
   eq:'Cu batido+moldeado · estañado interior', T:'Cu 99.9%',xp:28,
   ing:[{id:'ling_cobre',n:2}],
   stats:'Pociones curan +20% más HP',
   result:{id:'caldero_cobre',name:'Caldero Cu',emoji:'🫙',type:'tool',
     use:()=>{progress.hasCaldero=true;showDialog('🫙 ¡Caldero de Cobre activo!\nPociones y soluciones curan +20% HP.\nCu batido · estañado alimentario');}}},

  {id:'anillo_bronce', name:'Anillo de Bronce', emoji:'💍', phase:'forjado',
   eq:'Cu₉Sn₁ laminado fino 1mm · pulido espejo', T:'RA=95%',xp:30,
   ing:[{id:'ling_bronce',n:1}],
   stats:'+5% XP en todo',
   result:{id:'anillo_bronce',name:'Anillo Bronce',emoji:'💍',type:'accessory',xpBonus:1.05,
     use:()=>{equipment.accessory={id:'anillo_bronce',name:'Anillo Bronce',emoji:'💍',xpBonus:1.05,desc:'+5% XP'};syncUI();showDialog('💍 ¡Anillo de Bronce equipado!\n+5% XP en combate y laboratorio.\nCu₉Sn₁ pulido espejo');}}},

  {id:'pico_hierro', name:'Pico de Minería', emoji:'⛏️', phase:'forjado',
   eq:'Fe forjado en caliente · doble filo 30°', T:'HRC 42',xp:25,
   ing:[{id:'ling_hierro',n:2},{id:'MaderaPino',n:1}],
   stats:'Extrae 2 minerales por roca',
   result:{id:'pico_hierro',name:'Pico Hierro',emoji:'⛏️',type:'tool',
     use:()=>{progress.hasPico=true;showDialog('⛏️ ¡Pico de Hierro listo!\nExtrae 2 minerales de cada roca.\nDoble filo 30° · HRC 42');}}},

  {id:'herramientas_lab', name:'Kit Lab de Acero', emoji:'🔧', phase:'forjado',
   eq:'Acero inox 316L · precisión ±0.01mm', T:'Ra 0.8μm',xp:40,
   ing:[{id:'ling_acero',n:1},{id:'ling_cobre',n:1}],
   stats:'+10 XP extra por síntesis',
   result:{id:'herramientas_lab',name:'Kit Lab 316L',emoji:'🔧',type:'tool',
     use:()=>{progress.hasLabKit=true;showDialog('🔧 ¡Kit de Laboratorio equipado!\n+10 XP extra en síntesis.\nAcero 316L Ra=0.8μm');}}},
];

const ALL_FORGE=[...SMELT_RECIPES,...ALLOY_RECIPES,...FORGE_RECIPES];

let forgeTab='fundicion';

function openForge(){
  if(STATE==='battle'||STATE==='shop') return;
  STATE='dialog'; forgeTab='fundicion'; renderForge(); _('forge-panel').style.display='flex';
}
function closeForge(){_('forge-panel').style.display='none';STATE='exploring';}

function setForgeTab(tab){forgeTab=tab;renderForge();}

function renderForge(){
  const tabs={fundicion:'🔥 Fundición',aleacion:'⚗️ Aleación',forjado:'🔨 Forjado'};
  const colors={fundicion:'#ef4444',aleacion:'#f59e0b',forjado:'#60a5fa'};
  const col=colors[forgeTab];
  // Tab buttons
  _('forge-tabs').innerHTML=Object.entries(tabs).map(([k,v])=>
    `<button onclick="setForgeTab('${k}')" style="flex:1;padding:5px 2px;font-family:'Press Start 2P',monospace;font-size:.32rem;border:1px solid ${k===forgeTab?col:'#334155'};background:${k===forgeTab?col+'22':'transparent'};color:${k===forgeTab?col:'#64748b'};cursor:pointer;border-radius:4px">${v}</button>`
  ).join('');
  // Inventory metal summary
  const metals=['Fe2O3','C','mineral_cobre','estano_mineral','zinc_mineral','ling_hierro','ling_cobre','ling_estano','ling_bronce','ling_acero','ling_aluminio','ling_laton','ling_inox'];
  const metalEmoji={Fe2O3:'🔩',C:'⚫',mineral_cobre:'🟠',estano_mineral:'⬜',zinc_mineral:'🔵',ling_hierro:'🔩',ling_cobre:'🟤',ling_estano:'⬜',ling_bronce:'🟡',ling_acero:'⚙️',ling_aluminio:'🪙',ling_laton:'🔆',ling_inox:'✨'};
  const avail=metals.filter(id=>inventory.some(i=>i.id===id));
  _('forge-inv').innerHTML=avail.length
    ?avail.map(id=>`<span style="font-size:.3rem;padding:1px 4px;background:rgba(255,255,255,.07);border-radius:3px;margin:1px">${metalEmoji[id]||'📦'} ×${inventory.filter(i=>i.id===id).length}</span>`).join('')
    :'<span style="opacity:.3;font-size:.3rem">Sin materiales</span>';
  // Recipes for current tab
  const recipes=ALL_FORGE.filter(r=>r.phase===forgeTab);
  _('forge-list').innerHTML=recipes.map(r=>{
    const canMake=r.ing.every(i=>inventory.filter(x=>x.id===i.id).length>=(i.n||1));
    const ingHtml=r.ing.map(i=>{
      const em={Fe2O3:'🔩',C:'⚫',mineral_cobre:'🟠',estano_mineral:'⬜',zinc_mineral:'🔵',ling_hierro:'🔩',ling_cobre:'🟤',ling_estano:'⬜',ling_bronce:'🟡',ling_acero:'⚙️',ling_aluminio:'🪙',ling_laton:'🔆',ling_inox:'✨',SiO2:'🏖️',CaCO3:'🪨',MaderaEuc:'🪵',MaderaPino:'🌲'}[i.id]||'📦';
      const ok=inventory.filter(x=>x.id===i.id).length>=(i.n||1);
      return `<span style="${ok?'color:#86efac':'opacity:.25'}">${em}×${i.n||1}</span>`;
    }).join('<span style="opacity:.35"> + </span>');
    return `<div style="border:1px solid ${canMake?col:'#1e293b'};border-radius:6px;padding:7px;margin-bottom:5px;cursor:${canMake?'pointer':'default'};background:${canMake?col+'11':'transparent'}"
        onclick="${canMake?`forgeItem('${r.id}')`:''}" >
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <span style="font-size:.42rem;color:${canMake?'#f1f5f9':'#475569'}">${r.emoji} ${r.name}</span>
        <span style="font-size:.3rem;color:#fbbf24">+${r.xp}XP</span>
      </div>
      <div style="font-size:.28rem;color:#334155;font-family:monospace;margin:2px 0">${r.eq}</div>
      <div style="display:flex;align-items:center;gap:3px;margin:3px 0;font-size:.35rem">${ingHtml} <span style="opacity:.35">→</span> ${r.emoji}</div>
      ${r.stats?`<div style="font-size:.3rem;color:${canMake?col:'#374151'}">${r.stats}</div>`:''}
      ${canMake?`<div style="text-align:center;font-size:.35rem;color:${col};border-top:1px solid ${col}44;margin-top:4px;padding-top:3px">🔥 FORJAR</div>`:''}
    </div>`;
  }).join('');
}

function forgeItem(rid){
  const r=ALL_FORGE.find(x=>x.id===rid); if(!r) return;
  if(!r.ing.every(i=>inventory.filter(x=>x.id===i.id).length>=(i.n||1))){showDialog('🔥 Faltan materiales.');return;}
  r.ing.forEach(i=>{let n=i.n||1;while(n-->0){const idx2=inventory.findIndex(x=>x.id===i.id);if(idx2>=0)inventory.splice(idx2,1);}});
  const bonus=progress.hasLabKit?10:0;
  const finalXp=r.xp+bonus;
  inventory.push({...r.result});
  stats.xp+=finalXp*(equipment.accessory?.xpBonus||1);
  if(stats.xp>=stats.xpNext){stats.xp-=stats.xpNext;stats.level++;stats.xpNext=Math.floor(stats.xpNext*1.45);stats.maxHp+=12;stats.hp=stats.maxHp;setTimeout(()=>showLvlUp(stats.level),300);}
  syncUI(); closeForge();
  showDialog(`🔥 ¡FORJADO COMPLETADO!\n${r.emoji} ${r.name}\n\n${r.eq.split('·')[0]}\n\n+${Math.round(finalXp*(equipment.accessory?.xpBonus||1))} XP`);
}

// ═══════════════════════════════════════════════════════
// SISTEMA DE MINAS — Extracción Mineral con Probabilidades
// ═══════════════════════════════════════════════════════
const MINES=[
  {map:'reserva', cx:46, cy:8,  type:'hierro',
   name:'Mina de Hierro',  emoji:'🔩', color:'#ef4444',
   desc:'Yacimiento de magnetita (Fe₃O₄)\nΔG°=-1015 kJ/mol · Ley: 45% Fe',
   drops:[
     {id:'Fe2O3',  name:'Mineral Hierro', emoji:'🔩', pct:55},
     {id:'C',      name:'Carbón',         emoji:'⚫', pct:25},
     {id:'SiO2',   name:'Sílice',         emoji:'🏖️', pct:12},
     {id:'CaCO3',  name:'Calcita',        emoji:'🪨', pct:8 },
   ]},

  {map:'reserva', cx:98, cy:8, type:'carbon',
   name:'Mina de Carbón',  emoji:'⚫', color:'#374151',
   desc:'Veta de antracita grado A\n%C=92, poder calorífico: 7500 kcal/kg',
   drops:[
     {id:'C',     name:'Carbón (Antracita)',emoji:'⚫', pct:65},
     {id:'SiO2',  name:'Sílice',           emoji:'🏖️', pct:20},
     {id:'Fe2O3', name:'Mineral Hierro',    emoji:'🔩', pct:10},
     {id:'CaCO3', name:'Calcita',          emoji:'🪨', pct:5 },
   ]},

  {map:'reserva', cx:148, cy:8, type:'silice',
   name:'Cantera de Cuarzo', emoji:'🏖️', color:'#93c5fd',
   desc:'Cuarzo + feldespato + biotita\nSiO₂: 78% · Al₂O₃: 12% · K₂O: 6%',
   drops:[
     {id:'SiO2',   name:'Cuarzo SiO₂',  emoji:'🏖️', pct:60},
     {id:'CaCO3',  name:'Calcita',       emoji:'🪨', pct:25},
     {id:'Arcilla',name:'Arcilla',       emoji:'🟫', pct:12},
     {id:'Fe2O3',  name:'Hierro traza',  emoji:'🔩', pct:3 },
   ]},

  {map:'reserva', cx:258, cy:8, type:'raro',
   name:'Mina de Metales Raros', emoji:'✨', color:'#a78bfa',
   desc:'Casiterita (SnO₂) + Esfalerita (ZnS)\n+ Calcopirita (CuFeS₂) — yacimiento polimetálico',
   drops:[
     {id:'estano_mineral', name:'Casiterita Sn',  emoji:'⬜', pct:35},
     {id:'zinc_mineral',   name:'Esfalerita Zn',  emoji:'🔵', pct:30},
     {id:'mineral_cobre',  name:'Calcopirita Cu', emoji:'🟠', pct:25},
     {id:'Fe2O3',          name:'Pirita Fe',      emoji:'🔩', pct:10},
   ]},

  {map:'plaza', cx:4, cy:3, type:'cobre',
   name:'Mina de Cobre', emoji:'🟠', color:'#f97316',
   desc:'Calcopirita CuFeS₂ en roca ígnea\nLey: 2.3% Cu · Reservas: 180 t',
   drops:[
     {id:'mineral_cobre',  name:'Cobre CuFeS₂', emoji:'🟠', pct:58},
     {id:'Fe2O3',          name:'Hierro Fe₂O₃', emoji:'🔩', pct:22},
     {id:'SiO2',           name:'Sílice ganga',  emoji:'🏖️', pct:12},
     {id:'estano_mineral', name:'Estaño traza',  emoji:'⬜', pct:8 },
   ]},

  {map:'plaza', cx:36, cy:3, type:'calcita',
   name:'Cantera de Calcita', emoji:'🪨', color:'#9ca3af',
   desc:'Caliza (CaCO₃) con vetas de mármol\nPureza: 95% · Mohs: 3',
   drops:[
     {id:'CaCO3', name:'Calcita CaCO₃',emoji:'🪨', pct:65},
     {id:'SiO2',  name:'Sílice',        emoji:'🏖️', pct:20},
     {id:'Arcilla',name:'Arcilla',      emoji:'🟫', pct:15},
   ]},

  {map:'pasillo', cx:10, cy:2, type:'sal',
   name:'Mina de Sal', emoji:'🧂', color:'#e2e8f0',
   desc:'Halita (NaCl) — evaporita marina\nPureza: 97% · Humedad: 0.1%',
   drops:[
     {id:'NaCl',  name:'Sal Halita',emoji:'🧂', pct:70},
     {id:'CaCO3', name:'Calcita',   emoji:'🪨', pct:20},
     {id:'SiO2',  name:'Sílice',    emoji:'🏖️', pct:10},
   ]},
];

function getMine(){
  const dx=player.dir==='right'?1:player.dir==='left'?-1:0;
  const dy=player.dir==='down'?1:player.dir==='up'?-1:0;
  const fx=player.x+dx, fy=player.y+dy;
  return MINES.find(m=>m.map===currentMap&&m.cx===fx&&m.cy===fy)
      || MINES.find(m=>m.map===currentMap&&m.cx===player.x&&m.cy===player.y);
}

function doMine(mine){
  const key=`${mine.map}:${mine.cx},${mine.cy}`;
  if(!progress.minedAt) progress.minedAt={};
  const last=progress.minedAt[key]||0;
  const cooldown=progress.hasPico?20000:40000; // ms (Date.now)
  if(Date.now()-last<cooldown){
    const wait=Math.ceil((cooldown-(tick-last))/60);
    showDialog(`⛏️ Veta en recuperación...\n\nEspera ~${wait}s\n\nLas rocas necesitan tiempo\npara exponerse de nuevo.`);
    return;
  }
  if((stats.hunger||100)<8){showDialog('😰 Muy débil para minar.\n¡Come algo primero!');return;}
  stats.hunger=Math.max(0,(stats.hunger||100)-8);
  const qty=progress.hasPico?3:1+(Math.random()<.35?1:0);
  const got=[];
  for(let i=0;i<qty;i++){
    let roll=Math.random()*100;
    for(const d of mine.drops){
      roll-=d.pct;
      if(roll<=0){
        got.push(d);
        inventory.push({id:d.id,name:d.name,emoji:d.emoji,type:'resource',desc:mine.name});
        break;
      }
    }
  }
  progress.minedAt[key]=Date.now(); syncUI();
  const summary=got.map(g=>`${g.emoji} ${g.name}`).join('\n');
  const picoTxt=progress.hasPico?'\n⛏️ Pico equipado: ×3 mineral':'';
  showDialog(`⛏️ ¡EXTRACCIÓN EXITOSA!\n\n${mine.emoji} ${mine.name}\n\n${summary}${picoTxt}\n\n-8 🍽️ energía`);
  // Quest XP bonus
  stats.xp+=8*(equipment.accessory?.xpBonus||1);
  if(stats.xp>=stats.xpNext){stats.xp-=stats.xpNext;stats.level++;stats.xpNext=Math.floor(stats.xpNext*1.45);stats.maxHp+=12;stats.hp=stats.maxHp;}
}

function openMine(){
  const mine=getMine();
  if(!mine){showDialog('⛏️ No hay mina aquí.\nExplora para encontrar\nyacimientos minerales.');return;}
  const key=`${mine.map}:${mine.cx},${mine.cy}`;
  const last=progress.minedAt?.[key]||0;
  const ready=tick-last>=(progress.hasPico?1200:2400);
  const topDrop=mine.drops[0];
  showDialog(
    `${mine.emoji} ${mine.name}\n\n${mine.desc}\n\n`+
    `PROBABILIDADES:\n`+mine.drops.map(d=>`${d.emoji} ${d.name}: ${d.pct}%`).join('\n')+
    `\n\n${ready?'✅ Listo para minar':'⏳ Veta recuperándose'}`+
    `\n${progress.hasPico?'⛏️ Pico equipado':'⚠️ Sin pico (1 mineral/vez)'}`,
    [{text:'⛏️ Minar',action:()=>doMine(mine)},
     {text:'Retirarse',action:()=>{}}]
  );
}

