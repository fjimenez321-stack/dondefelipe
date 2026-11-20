// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Modelo SIR COVID, farmacia, letreros
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ════════════════════════════════════════════════════════════
// SISTEMA SARS-CoV-2 — Dinámica de Infecciones Educativa
// Modelo epidemiológico simplificado SIR + vacunación
// ════════════════════════════════════════════════════════════
const COVID = {
  // ─── Estado del jugador ───
  status:'healthy',     // healthy|exposed|mild|severe|critical|recovered
  exposedAt:0,          // tick de exposición
  infectedAt:0,
  recoveredAt:0,
  vaccinated:false,
  booster:false,
  hasMask:false,
  hasAntiviral:false,
  variant:'original',   // original|delta|omicron

  // ─── Estado del mapa ───
  outbreaks:[],          // [{map,x,y,char,startTick,variant}]
  fomiteTiles:[],        // [{map,x,y,startTick}]
  lastOutbreakTick:0,
  globalR:0,

  // ─── Parámetros epidemiológicos (educativos) ───
  VARIANTS:{
    original:{ name:'Cepa Original (Wuhan)',R0:2.8, severe:0.15, mortality:0.30, immune:7200  },
    delta:   { name:'Variante Delta (B.1.617.2)',R0:5.1,severe:0.22,mortality:0.28,immune:6000},
    omicron: { name:'Variante Ómicron (B.1.1.529)',R0:8.2,severe:0.05,mortality:0.08,immune:4800},
  },

  // ─── NPC tiles que PUEDEN ser foco de infección ───
  NPC_POOL:{
    pasillo:   [{x:4,y:1,c:'I'},{x:9,y:1,c:'J'},{x:4,y:4,c:'5'},{x:15,y:4,c:'6'}],
    cancha:    [{x:2,y:8,c:'G'},{x:14,y:8,c:'U'},{x:3,y:6,c:'D'}],
    biblioteca:[{x:5,y:3,c:'Q'},{x:14,y:5,c:'c'}],
    secretaria:[{x:3,y:4,c:'t'},{x:10,y:4,c:'O'}],
    plaza:     [{x:8,y:6,c:'R'},{x:32,y:4,c:'k'}],
    centro_villa:[{x:13,y:3,c:'3'},{x:4,y:7,c:'4'},{x:13,y:7,c:'n'}],
    biologia:  [{x:5,y:5,c:'Y'}],
  },

  // ─── Generar brote aleatorio ───────────────────────────────
  triggerOutbreak(){
    if(STATE!=='exploring') return; // don't interrupt battle/dialog
    const mapNPCs = this.NPC_POOL[currentMap];
    if(!mapNPCs||mapNPCs.length===0) return;
    // Elige variante aleatoria (con más probabilidad de original)
    const roll=Math.random();
    this.variant = roll<0.6?'original':roll<0.85?'delta':'omicron';
    const vDef=this.VARIANTS[this.variant];
    // Infecta 1-3 NPCs en este mapa
    const n=1+Math.floor(Math.random()*Math.min(3,mapNPCs.length));
    const shuffled=[...mapNPCs].sort(()=>Math.random()-.5).slice(0,n);
    shuffled.forEach(npc=>{
      if(!this.outbreaks.find(o=>o.map===currentMap&&o.x===npc.x&&o.y===npc.y)){
        this.outbreaks.push({map:currentMap,x:npc.x,y:npc.y,char:npc.c,startTick:tick,variant:this.variant});
        // Genera fómites alrededor del NPC infectado
        for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){
          if(Math.random()<0.4) this.fomiteTiles.push({map:currentMap,x:npc.x+dx,y:npc.y+dy,startTick:tick});
        }
      }
    });
    this.lastOutbreakTick=tick;
    this.globalR=vDef.R0;
    showDialog(`⚠️ ALERTA EPIDEMIOLÓGICA\n\n🦠 ${vDef.name} detectada\n\nR₀ = ${vDef.R0} — ${n} foco${n>1?'s':''} activo${n>1?'s':''}\nen el ${currentMap.replace('_',' ')}.\n\n😷 Protégete:\n• Máscara N95 -50% contagio\n• Vacuna -80% infección\n\nFarmacia disponible en Centro\ny en el Pasillo.`);
  },

  // ─── Limpiar brotes viejos (se recuperan tras ~5min) ──────
  cleanOld(){
    const DURATION=18000; // ticks (~5 min)
    this.outbreaks=this.outbreaks.filter(o=>tick-o.startTick<DURATION);
    this.fomiteTiles=this.fomiteTiles.filter(f=>tick-f.startTick<DURATION);
  },

  // ─── Calcular riesgo de exposición del jugador ────────────
  checkExposure(){
    if(this.status!=='healthy') return;
    // Radio de contagio: 2 tiles del foco
    const nearFocus=this.outbreaks.find(o=>
      o.map===currentMap&&Math.abs(o.x-player.x)<=2&&Math.abs(o.y-player.y)<=2);
    // Fómite: tile exacto
    const onFomite=this.fomiteTiles.find(f=>
      f.map===currentMap&&f.x===player.x&&f.y===player.y);

    let risk=0;
    if(nearFocus) risk+=0.0018; // ~25% tras ~140 ticks cercano (aerosol+gotícula)
    if(onFomite)  risk+=0.0008; // ~10% tras ~120 ticks en el fómite

    if(this.hasMask)     risk*=0.5;   // N95: -50%
    if(this.vaccinated)  risk*=0.2;   // Vacuna: -80%
    if(this.booster)     risk*=0.6;   // Booster: -40% adicional

    if(risk>0&&Math.random()<risk) this.expose();
  },

  expose(){
    if(this.status!=='healthy') return;
    this.status='exposed'; this.exposedAt=tick;
    addFloat('🦠 Expuesto!',(player.x-camera.x)*TS+4,(player.y-camera.y)*TS);
    // Incubación tick-based (ver tickUpdate)
  },

  progressDisease(){
    if(this.status!=='exposed') return;
    const vDef=this.VARIANTS[this.variant]||this.VARIANTS.original;
    const severeChance = this.vaccinated ? vDef.severe*0.1 : vDef.severe;
    const isSevere = Math.random()<severeChance;
    this.status = isSevere?'severe':'mild';
    this.infectedAt=tick;
    if(isSevere){
      showDialog(`🦠 COVID-19 SEVERO\n\n${vDef.name}\n\n⚠️ Síntomas graves:\n• HP -5 cada 5s\n• ATK y DEF reducidos\n\n${this.vaccinated?'Vacuna: reduciendo severidad ✅':'⚠️ Sin vacuna: riesgo mortalidad 30%'}\n\n🏥 Busca Antiviral en la Farmacia.`);
    } else {
      showDialog(`🤧 COVID-19 LEVE\n\n${vDef.name}\n\nSíntomas leves. HP drena lentamente.\n\n${this.vaccinated?'✅ Vacuna activa: protección funcionando':'💉 Consigue vacuna para protegerte'}\n\nDescansa y come bien.`);
    }
    syncUI();
    // Recuperación gestionada por tickUpdate (tick-based)
  },

  tickUpdate(){
    const INCUBATION=600;   // ~10s de juego (a 60fps ~10s)
    const MILD_DUR=3600;    // ~1min juego → recuperación
    const SEVERE_DUR=5400;  // ~1.5min juego

    // ─ Incubación: exposed → mild/severe ─
    if(this.status==='exposed'&&tick-this.exposedAt>INCUBATION){
      this.progressDisease();
    }
    // ─ Recuperación automática ─
    if(this.status==='mild'&&tick-this.infectedAt>MILD_DUR) this.recover();
    if(this.status==='severe'&&tick-this.infectedAt>SEVERE_DUR) this.recover();
    if(this.status==='critical'&&tick-this.infectedAt>SEVERE_DUR*1.5) this.recover();

    // ─ Daño por infección (cada 2s de juego) ─
    if(this.status==='severe'&&tick%120===0){
      stats.hp=Math.max(1,stats.hp-4); syncUI();
      if(!this.vaccinated&&stats.hp<=5) this.critical();
    }
    if(this.status==='mild'&&tick%240===0){
      stats.hp=Math.max(2,stats.hp-1); syncUI();
    }
    // ─ Genera brotes ~cada 3600 ticks (1 min) ─
    if(tick-this.lastOutbreakTick>3600&&Math.random()<0.0025&&STATE==='exploring'){
      this.triggerOutbreak();
    }
    // ─ Limpieza y exposición ─
    if(tick%600===0) this.cleanOld();
    if(tick%60===0) this.checkExposure(); // cada ~1s
  },

  critical(){
    this.status='critical';
    stats.hp=1; stats.atk=Math.max(1,Math.floor(stats.atk*0.3));
    stats.def=Math.max(0,Math.floor(stats.def*0.3));
    syncUI();
    showDialog(`🚨 ESTADO CRÍTICO — COVID-19\n\n⚠️ Sin vacunación, el virus SARS-CoV-2\nalcanzó carga viral máxima.\n\nMortalidad real sin vacuna: ~30%\n\nHP crítico. Busca Antiviral urgente.\n\n💉 VACÚNATE antes del próximo brote.\nFarmacia en Centro y Pasillo.`);
  },

  recover(){
    if(!['mild','severe','critical','exposed','recovering'].includes(this.status)) return;
    this.status='recovered'; this.recoveredAt=tick;
    syncUI();
    showDialog(`✅ RECUPERADO — COVID-19\n\nAnticuerpos neutralizantes generados.\nInmunidad temporal activa.\n\nDuración inmunidad natural:\n~${Math.round(this.VARIANTS[this.variant].immune/60)} min de juego\n\n💉 La vacuna extiende esta protección\ny reduce la severidad en futuros\ncontagios.`);
    // Inmunidad temporal
    setTimeout(()=>{
      if(this.status==='recovered') this.status='healthy';
      syncUI();
    }, this.VARIANTS[this.variant].immune*1000/60);
  },

  getStatusIcon(){
    return {healthy:'',exposed:'🦠',mild:'🤧',severe:'😷',critical:'🚨',recovered:'✅'}[this.status]||'';
  },
  getStatusColor(){
    return {healthy:'transparent',exposed:'rgba(251,146,60,.3)',mild:'rgba(250,204,21,.25)',
            severe:'rgba(239,68,68,.4)',critical:'rgba(239,68,68,.7)',recovered:'rgba(34,197,94,.2)'}[this.status]||'transparent';
  },
};

// ─── Farmacia ────────────────────────────────────────────────
const PHARMACY_ITEMS=[
  {id:'vacuna_covid',name:'Vacuna COVID-19',emoji:'💉',cost:45,
   desc:'mRNA — -80% infección\nReduce mortalidad al 2%',
   action:()=>{
     if(COVID.vaccinated){showDialog('💉 Ya estás vacunado.\nLa vacuna está activa ✅');return;}
     COVID.vaccinated=true;
     showDialog('💉 ¡VACUNADO!\n\nVacuna mRNA anti-SARS-CoV-2.\n\nMecanismo:\nLa mRNA instruye a tus células\na producir la proteína Spike.\nEl sistema inmune genera\nanticuerpos específicos.\n\n✅ Protección: -80% infección\n✅ Mortalidad: 30% → 2%\n✅ Severidad: -90%');
   }},
  {id:'booster_covid',name:'Dosis Refuerzo',emoji:'💊',cost:30,
   desc:'Booster bivalente\n-40% adicional vs variantes',
   action:()=>{
     if(!COVID.vaccinated){showDialog('💊 Primero vacúnate.\nEl booster es la 2ª dosis.');return;}
     if(COVID.booster){showDialog('💊 Ya tienes el booster ✅');return;}
     COVID.booster=true;
     showDialog('💊 ¡BOOSTER APLICADO!\n\nDosis bivalente actualizada.\n\nCubre:\n• Cepa original\n• Variante Delta\n• Variante Ómicron\n\n+40% protección adicional\nInmunidad de alta respuesta.');
   }},
  {id:'mascarilla_n95',name:'Mascarilla N95',emoji:'😷',cost:15,
   desc:'Filtra 95% partículas\n-50% riesgo contagio',
   action:()=>{
     if(COVID.hasMask){showDialog('😷 Ya tienes mascarilla N95.');return;}
     COVID.hasMask=true;
     showDialog('😷 ¡N95 ACTIVADA!\n\nFiltración de partículas:\n• Droplets: -99%\n• Aerosoles: -95%\n\n✅ Riesgo de contagio -50%\nEfectividad con vacuna: -90%');
   }},
  {id:'antiviral_paxlovid',name:'Antiviral (Paxlovid)',emoji:'🧴',cost:60,
   desc:'Nirmatrelvir+Ritonavir\nTratamiento si infectado',
   action:()=>{
     if(!['mild','severe','critical','exposed'].includes(COVID.status)){
       showDialog('🧴 Paxlovid\n\nAnti-proteasa SARS-CoV-2.\n\nSolo es efectivo si estás\ninfectado. Úsalo cuando\ntengas síntomas.');return;
     }
     COVID.hasAntiviral=true;
     stats.hp=Math.min(stats.maxHp,stats.hp+30); syncUI();
     showDialog('🧴 ¡ANTIVIRAL ADMINISTRADO!\n\nNirmatrelvir inhibe la\nproteasa 3CL del SARS-CoV-2.\n\nMecanismo:\nBloquea la replicación viral\nreduciendo carga viral >99%.\n\n+30 HP | Recuperación acelerada');
     setTimeout(()=>{ COVID.infectedAt=tick-5400; },100); // acelera recuperación
   }},
];

function openPharmacy(){
  if(STATE==='battle') return;
  STATE='dialog';
  const vDef=COVID.VARIANTS[COVID.variant]||COVID.VARIANTS.original;
  _('pharm-panel').style.display='flex';
  _('pharm-status').innerHTML=
    `<div style="font-size:.32rem;color:#9ca3af;margin-bottom:6px">🦠 SITUACIÓN EPIDEMIOLÓGICA</div>`+
    `<div style="font-size:.3rem;color:#6b7280">Variante activa: ${vDef.name}</div>`+
    `<div style="font-size:.3rem;color:#6b7280">R₀ = ${vDef.R0} | Focos activos: ${COVID.outbreaks.filter(o=>o.map===currentMap).length}</div>`+
    `<div style="font-size:.32rem;margin-top:4px;color:${COVID.vaccinated?'#22c55e':'#f87171'}">`+
    `${COVID.vaccinated?'✅ Vacunado':'⚠️ Sin vacunar — Mortalidad: 30%'}`+
    `${COVID.booster?' + Booster ✅':''}`+
    `${COVID.hasMask?' + N95 😷':''}</div>`;
  _('pharm-items').innerHTML=PHARMACY_ITEMS.map(item=>{
    const can=coins>=item.cost;
    return `<div style="border:1px solid ${can?'#10b981':'#1e293b'};border-radius:6px;padding:7px;margin-bottom:5px;cursor:${can?'pointer':'default'};background:${can?'rgba(16,185,129,.05)':'transparent'}"
      onclick="${can?`doPharmBuy('${item.id}')`:''}" >
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:.42rem;color:${can?'#f1f5f9':'#4b5563'}">${item.emoji} ${item.name}</span>
        <span style="font-size:.35rem;color:#fbbf24">${item.cost}🪙</span>
      </div>
      <div style="font-size:.28rem;color:#4b5563;margin-top:3px;white-space:pre-line">${item.desc}</div>
      ${can?'<div style="text-align:center;font-size:.32rem;color:#10b981;margin-top:3px">💊 COMPRAR</div>':''}
    </div>`;
  }).join('');
}
function doPharmBuy(id){
  const item=PHARMACY_ITEMS.find(i=>i.id===id);
  if(!item||coins<item.cost) return;
  coins-=item.cost; syncUI(); item.action();
  // Refrescar panel
  setTimeout(()=>{ if(_('pharm-panel').style.display==='flex') openPharmacy(); },300);
}
function closePharmacy(){ _('pharm-panel').style.display='none'; STATE='exploring'; }

// ─── Draw COVID overlay (focos e indicadores) ─────────────────
function drawCOVIDOverlay(){
  const mapOutbreaks=COVID.outbreaks.filter(o=>o.map===currentMap);
  const mapFomites=COVID.fomiteTiles.filter(f=>f.map===currentMap);
  // Dibujar aura de contagio en focos
  mapOutbreaks.forEach(o=>{
    const sx=(o.x-camera.x)*TS, sy=(o.y-camera.y)*TS;
    if(sx<-TS||sy<-TS||sx>canvas.width||sy>canvas.height) return;
    const pulse=.4+.3*Math.sin(tick*.12);
    ctx.fillStyle=`rgba(239,68,68,${pulse*0.45})`;
    ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS*.7,0,Math.PI*2); ctx.fill();
    ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🦠',sx+TS/2,sy+TS/2-4);
    ctx.font='bold 4px sans-serif'; ctx.fillStyle='#fca5a5'; ctx.textBaseline='top';
    ctx.fillText('FOCO',sx+TS/2,sy+1); ctx.textAlign='left';
  });
  // Fómites (superficie contaminada)
  mapFomites.forEach(f=>{
    const sx=(f.x-camera.x)*TS, sy=(f.y-camera.y)*TS;
    if(sx<-TS||sy<-TS||sx>canvas.width||sy>canvas.height) return;
    const fade=Math.max(0,.2-.05*Math.sin(tick*.08));
    ctx.fillStyle=`rgba(251,146,60,${fade})`;
    ctx.fillRect(sx,sy,TS,TS);
  });
  // HUD estado del jugador
  const icon=COVID.getStatusIcon();
  if(icon){
    ctx.fillStyle=COVID.getStatusColor();
    ctx.fillRect(0,canvas.height-18,canvas.width,18);
    ctx.font='bold 6px monospace'; ctx.fillStyle='rgba(255,255,255,.9)'; ctx.textAlign='left'; ctx.textBaseline='middle';
    const statusNames={exposed:'EXPUESTO - Incubando',mild:'INFECTADO (leve)',
      severe:'INFECTADO (severo) - HP↓',critical:'⚠️ CRÍTICO',recovered:'RECUPERADO - Inmune'};
    ctx.fillText(icon+' COVID: '+(statusNames[COVID.status]||''),4,canvas.height-10);
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  }
}

// ════════════════════════════════════════════════════════════
// LETREROS EDUCATIVOS COVID-19
// ════════════════════════════════════════════════════════════
const COVID_SIGNS = {
  pasillo: [
    // Letrero izquierda: Alerta general
    { title:'⚠️ ZONA DE CIRCULACIÓN',
      body:`🦠 SARS-CoV-2 — PRECAUCIÓN

Modo de transmisión principal:
💨 Aerosoles y gotículas respiratorias

El virus flota en el aire hasta 3 horas
en espacios cerrados poco ventilados.

MEDIDAS:
• 😷 Mascarilla N95 — filtra 95%
• 📏 Distancia mínima: 1.5 metros
• 💨 Ventila los espacios

Farmacia disponible:
📍 Pasillo (col 16-17) y Centro Villa.`
    },
    // Letrero derecha: Vacuna
    { title:'💉 VACUNACIÓN DISPONIBLE',
      body:`💉 VACUNA mRNA — ¿Cómo funciona?

1. La vacuna entrega instrucciones mRNA
2. Tus células leen el mRNA y producen
   la proteína Spike del SARS-CoV-2
3. Tu sistema inmune genera anticuerpos
4. Si el virus real llega: ¡neutralizado!

EFICACIA:
• Infección: -80% de probabilidad
• Mortalidad: 30% → 2%
• Severidad: -90%

💉 Cómprala en la Farmacia (45🪙)` }
  ],

  cancha: [
    { title:'⚠️ ESPACIO SEMI-CERRADO',
      body:`🏟️ RIESGO DE CONTAGIO: MEDIO

Espacios semi-cerrados con personas
en movimiento activan la transmisión
por AEROSOLES.

Partículas virales < 5 μm permanecen
suspendidas hasta 3 horas.

El ejercicio físico intenso aumenta
la emisión de aerosoles hasta 10×.

Factores de riesgo aquí:
• Respiración acelerada → más aerosoles
• Contacto cercano en juegos
• Ventilación variable

😷 Usa mascarilla. 💨 Ventila.` },
    { title:'🧬 BIOLOGÍA DEL VIRUS',
      body:`🧬 SARS-CoV-2 — Estructura

El coronavirus tiene:
• Proteína Spike (S): se une al ACE2
• Proteína E: envoltura viral
• RNA de cadena simple (~30.000 bases)
• Diámetro: 80-120 nanómetros

CICLO DE INFECCIÓN:
Spike → receptor ACE2 (células pulmon.)
→ fusión de membrana
→ liberación del RNA viral
→ replicación dentro de la célula
→ nuevos viriones (miles por célula)

La vacuna bloquea el paso Spike-ACE2.` }
  ],

  biblioteca: [
    { title:'📚 SOBRE EL COVID-19',
      body:`📖 COVID-19 — Datos Científicos

SARS-CoV-2: Severe Acute Respiratory
Syndrome Coronavirus 2

R₀ (Número reproductivo básico):
• Cepa original: R₀ = 2.8
  → cada infectado contagia ~3 personas
• Variante Delta: R₀ = 5.1
• Variante Ómicron: R₀ = 8.2

INMUNIDAD DE REBAÑO:
Umbral = 1 - (1/R₀)
• Original: 64% de la población
• Delta: 80%
• Ómicron: 88%

Cuando un % suficiente está inmune,
la cadena de contagio se rompe.` },
    { title:'🔬 VARIANTES DEL VIRUS',
      body:`🧬 VARIANTES SARS-CoV-2

¿Por qué mutan los virus?
Al replicarse millones de veces,
ocurren errores (mutaciones) en el RNA.
Las que dan ventaja evolutiva persisten.

VARIANTES PRINCIPALES:
🔸 Original (Wuhan, 2019)
   R₀=2.8 | Mortalidad: 1-3%

🔸 Delta (B.1.617.2, 2021)
   R₀=5.1 | Más severa

🔸 Ómicron (B.1.1.529, 2021)
   R₀=8.2 | Más contagiosa
   Menor severidad por mutaciones en Spike

Booster bivalente cubre ambas.` }
  ],

  secretaria: [
    { title:'🖐️ HIGIENE DE MANOS',
      body:`🧼 LAVADO DE MANOS — Por qué funciona

El SARS-CoV-2 tiene envoltura lipídica
(membrana de grasa).

El jabón desintegra esta membrana:
• Moléculas anfipáticas del jabón
• Se insertan en la bicapa lipídica
• Rompen la envoltura viral
• El virus queda inactivado

PROTOCOLO OMS (20 segundos):
1. Moja las manos con agua
2. Aplica jabón
3. Frota palmas, dorso, dedos, uñas
4. Enjuaga completamente

Fómites (superficies): el virus
sobrevive hasta 72h en acero y 4h
en cobre (propiedades antimicrobianas).` },
    { title:'😷 USO CORRECTO DE MASCARILLA',
      body:`😷 MASCARILLA N95 — Eficacia

Filtración de partículas:
• N95: ≥95% partículas ≥0.3μm
• Aerosoles SARS-CoV-2: 0.1-1μm
• Con ajuste correcto: -95% riesgo

Diferencias:
• KN95: estándar chino, similar
• Quirúrgica: -50% (no sella)
• Tela: -30% (variable)

CÓMO USARLA CORRECTAMENTE:
✅ Presionar la banda metálica en nariz
✅ Cubrir nariz y boca completamente
✅ Sin espacio en los bordes (sella)
❌ No bajar la mascarilla al hablar
❌ No tocar la parte frontal

Máscara + Vacuna = protección óptima` }
  ],

  plaza: [
    { title:'🌤️ AIRE LIBRE — MENOR RIESGO',
      body:`🌿 AL AIRE LIBRE: Riesgo reducido

La dispersión al aire libre diluye
la concentración viral rápidamente.

Estudios muestran que al aire libre
el riesgo es 18.7× menor que
en espacios cerrados equivalentes.

Por qué:
• Viento dispersa las partículas
• Luz UV-B inactiva el virus
  (T½ viral bajo sol directo: ~6 min)
• Dilución en gran volumen de aire

AUN ASÍ: distancia física importa.
Las gotículas grandes (>5μm)
caen en 1-2 metros igual.

Riesgo = 0 no existe.
Riesgo reducido = Sí.` },
    { title:'⚡ RESPUESTA INMUNE',
      body:`🛡️ TU SISTEMA INMUNE vs COVID-19

RESPUESTA INNATA (primeras horas):
• Interferones: señal de alarma
• Macrófagos: engullen el virus
• Células NK: destruyen infectadas
• Fiebre: inhibe replicación viral

RESPUESTA ADAPTATIVA (días 5-14):
• Linfocitos B → producen anticuerpos
• Linfocitos T citotóxicos → matan
  células infectadas
• Anticuerpos neutralizantes: bloquean
  la proteína Spike

Con VACUNA: el sistema ya tiene
"memoria" de la Spike. La respuesta
es 10-100× más rápida.

Memoria inmunológica: años.` }
  ],

  centro_villa: [
    { title:'🏥 CENTRO DE SALUD',
      body:`🏥 FARMACIA DISPONIBLE AQUÍ

Productos anti-COVID:
💉 Vacuna COVID (45🪙)
   mRNA — Pfizer/BioNTech style
   Protección: -80% infección

💊 Booster Bivalente (30🪙)
   Cubre Delta + Ómicron
   +40% protección adicional

😷 Mascarilla N95 (15🪙)
   Filtración: 95% aerosoles

🧴 Paxlovid Antiviral (60🪙)
   Si ya estás infectado
   Inhibe proteasa 3CL viral

⚠️ SIN VACUNA: mortalidad 30%
✅ CON VACUNA: mortalidad ~2%

Busca el letrero 🟢+ en el mapa.` },
    { title:'📊 EPIDEMIOLOGÍA LOCAL',
      body:`📊 SITUACIÓN EPIDEMIOLÓGICA

El modelo SIR describe la dinámica:

S (Susceptibles) → I (Infectados) → R (Recuperados)

dS/dt = -β·S·I/N
dI/dt = β·S·I/N - γ·I
dR/dt = γ·I

Donde:
β = tasa de transmisión
γ = tasa de recuperación
R₀ = β/γ

Cuando R₀ > 1: epidemia crece
Cuando R₀ < 1: epidemia decrece

La vacunación reduce S efectivo,
bajando el R₀ efectivo (Rₑ).
Meta: Rₑ < 1.` }
  ],

  biologia: [
    { title:'🔬 LAB DE VIROLOGÍA',
      body:`🧫 ESTRUCTURA MOLECULAR
del SARS-CoV-2

Genoma: RNA+ monocatenario
Tamaño: 29.903 nucleótidos
(el virus RNA más grande conocido)

Proteínas estructurales:
• Spike (S): entrada a la célula
• Nucleocápside (N): empaqueta RNA
• Membrana (M): forma la envoltura
• Envoltura (E): maduración viral

Receptor celular: ACE2
(Angiotensin-Converting Enzyme 2)

Presente en: pulmones, corazón,
intestino, riñones, cerebro.

Por eso COVID-19 puede afectar
múltiples sistemas simultáneamente.` },
    { title:'🧬 PCR y DIAGNÓSTICO',
      body:`🔬 RT-PCR — Diagnóstico COVID-19

RT-PCR = Reverse Transcriptase
Polymerase Chain Reaction

PASOS:
1. Muestra: hisopo nasofaríngeo
2. Extracción del RNA viral
3. Retrotranscriptasa: RNA → DNA
4. PCR amplifica secuencias del virus
5. Fluorescencia detecta el DNA

Genes diana en SARS-CoV-2:
• Gen N (nucleocápside)
• Gen E (envoltura)
• Gen ORF1ab (replicasa)

Sensibilidad: 97-98%
Especificidad: 99%

Antígeno rápido: detecta proteína N
Sensibilidad menor (~85%) pero
resultado en 15 minutos.` }
  ],

  reserva: [
    { title:'🌿 RESERVA ECOLÓGICA',
      body:`🌳 ESPACIOS NATURALES Y COVID-19

La Reserva Ecológica representa
el ambiente más SEGURO del juego.

Beneficios del entorno natural:
🌬️ Dilución viral por viento y brisa
☀️ Radiación UV-B: t½ viral = 6 min
🌱 Menor densidad de personas
💧 Mayor humedad relativa óptima

El SARS-CoV-2 sobrevive:
• Superficies secas: 1-72 horas
• Aerosoles (interior): hasta 3 horas
• Aerosoles (exterior con sol): <1 hora

Los brotes en exteriores son ~19×
menos probables que en interiores.

Cuida también la naturaleza:
El comercio de fauna silvestre es
vector de zoonosis como el COVID-19.
El SARS-CoV-2 puede tener origen
en murciélagos (Rhinolophus spp.)` },
  ],
};

// ─── Lógica del letrero '%' ─────────────────────────────────
let _signIdx = {}; // rotación de letreros por mapa

function openCOVIDSign(){
  if(STATE==='battle'||STATE==='shop') return;
  STATE='dialog';
  const signs = COVID_SIGNS[currentMap];
  if(!signs||!signs.length){
    showDialog('🪧 INFORMACIÓN COVID-19\n\nConsulta la Farmacia más cercana\npara obtener tu vacuna.\n\n📍 Pasillo (col 16-17)\n📍 Centro de Villa Alemana');
    return;
  }
  _signIdx[currentMap] = (_signIdx[currentMap]||0) % signs.length;
  const sign = signs[_signIdx[currentMap]];
  _signIdx[currentMap]++;

  // Panel con estilo especial (naranja/amarillo de advertencia)
  STATE='dialog';
  _('sign-panel').style.display='flex';
  _('sign-title').textContent = sign.title;
  _('sign-body').textContent = sign.body;
  // Indicador de estado COVID actual
  const active = COVID.outbreaks.filter(o=>o.map===currentMap).length;
  _('sign-alert').textContent = active>0
    ? `⚠️ BROTE ACTIVO: ${active} foco(s) en este sector. ¡Precaución!`
    : '✅ Sin focos activos en este sector ahora mismo.';
  _('sign-alert').style.color = active>0?'#fca5a5':'#86efac';
  _('sign-vaccine').textContent = COVID.vaccinated
    ? '💉 Vacunado ✅' + (COVID.booster?' + Booster ✅':'')
    : '⚠️ Sin vacunar — Farmacia disponible';
  _('sign-vaccine').style.color = COVID.vaccinated?'#22c55e':'#f87171';
  STATE='dialog';
}
function closeCOVIDSign(){ _('sign-panel').style.display='none'; STATE='exploring'; }

// ─── Mensajes automáticos al entrar a un mapa ───────────────
const COVID_ENTRY_MSGS = {
  cancha:    ()=> !progress._covidMsgCancha  && (progress._covidMsgCancha=true,  '🏃 CANCHA\n\n⚠️ Espacio con actividad física.\nLa respiración intensa aumenta\nla emisión de aerosoles.\n\n😷 Recomendado: Mascarilla N95\n💉 Vacúnate en la Farmacia.'),
  secretaria:()=> !progress._covidMsgSec     && (progress._covidMsgSec=true,     '🏢 SECRETARÍA\n\nEspacio cerrado de oficina.\nVentilación reducida.\n\n⏱️ El virus puede persistir\nhasta 3 horas en el aire interior.\n\n🪟 Abre ventanas. 😷 Usa mascarilla.'),
  plaza:     ()=> !progress._covidMsgPlaza   && (progress._covidMsgPlaza=true,   '🌤️ PLAZA AL AIRE LIBRE\n\nEntorno exterior — riesgo reducido.\n\n☀️ La luz solar UV-B inactiva\nel virus en ~6 minutos.\n\n🌿 Disfruta el aire libre.\nAun así, mantén distancia.'),
  reserva:   ()=> !progress._covidMsgReserva && (progress._covidMsgReserva=true, '🌿 RESERVA ECOLÓGICA\n\nZona de menor riesgo COVID-19.\n\nEl aire libre, el sol y la brisa\nreducen drásticamente la\nconcentración viral.\n\nCuida el ecosistema:\nLa deforestación y el tráfico\nde fauna aumentan el riesgo\nde nuevas zoonosis (origen COVID).'),
  centro_villa:()=>!progress._covidMsgCentro &&(progress._covidMsgCentro=true,  '🏙️ CENTRO DE VILLA ALEMANA\n\n🏥 FARMACIA disponible aquí.\n\n¡Vacúnate antes de un brote!\n\nSin vacuna: mortalidad 30%\nCon vacuna: mortalidad ~2%\n\nBusca el letrero 🟢+ en el mapa.'),
  buinzoo:()=>!progress._covidMsgZoo &&(progress._covidMsgZoo=true,  '🦠 ZOONOSIS Y CONSERVACIÓN\n\nMuchas pandemias (incluido el COVID-19)\nse originan en el contacto humano con\nfauna silvestre: son ZOONOSIS.\n\n🌍 Conservar los hábitats y respetar a\nlos animales reduce el riesgo de nuevas\nenfermedades.\n\n¡Cuidar la biodiversidad nos protege!'),
};

// ─── Alerta al acercarse a un foco (una vez por brote) ──────
let _lastAlertedOutbreak = null;
function checkCOVIDProximityAlert(){
  if(STATE!=='exploring') return;
  const near = COVID.outbreaks.find(o=>o.map===currentMap&&
    Math.abs(o.x-player.x)<=3&&Math.abs(o.y-player.y)<=3);
  if(near&&near.startTick!==_lastAlertedOutbreak){
    _lastAlertedOutbreak = near.startTick;
    const v = COVID.VARIANTS[near.variant]||COVID.VARIANTS.original;
    showDialog(
      '🚨 FOCO DE CONTAGIO CERCANO\n\n🦠 '+v.name+'\nR₀ = '+v.R0+'\n\n'+
      '⚠️ NPC infectado a '+Math.round(Math.hypot(near.x-player.x,near.y-player.y))+' tile(s) de distancia.\n\n'+
      (COVID.vaccinated?'✅ Vacunado: riesgo reducido al 20%':'❌ Sin vacuna: riesgo de infección elevado')+'\n'+
      (COVID.hasMask?'😷 Máscara activa: -50% adicional':'')+'\n\n'+
      'Farmacia: Pasillo fila 4 / Centro.'
    );
  }
}

