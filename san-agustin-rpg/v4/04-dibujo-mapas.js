// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Dibujo de cada mapa (tiles y capas)
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ DIBUJO ═══
const hpColor=p=>p>.6?'linear-gradient(90deg,#4ade80,#22c55e)':p>.3?'linear-gradient(90deg,#facc15,#eab308)':'linear-gradient(90deg,#f87171,#ef4444)';
const hasItem=id=>inventory.some(i=>i.id===id);

function drawNPC(sx,sy,emoji,color,label){
  const p=.5+.38*Math.sin(tick*.07);
  const bobY=Math.sin(tick*.065)*2;
  const ey=sy+bobY;
  ctx.save();
  // ── Sombra proyectada en el suelo ──
  ctx.shadowColor='rgba(0,0,0,0)';
  ctx.fillStyle='rgba(0,0,0,.32)';
  ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS-3,14,4.5,0,0,Math.PI*2); ctx.fill();
  // ── Anillo de glow exterior (capa 1: blur suave) ──
  ctx.save();
  ctx.shadowColor=color; ctx.shadowBlur=14+8*p;
  ctx.strokeStyle=color+'00'; ctx.lineWidth=0;
  // truco: rect transparente fuerza el shadow
  ctx.strokeRect(sx+2,ey+2,TS-4,TS-4);
  ctx.restore();
  // ── Borde brillante animado ──
  const bAlpha=Math.round((0.55+0.4*p)*255).toString(16).padStart(2,'0');
  ctx.save();
  ctx.shadowColor=color; ctx.shadowBlur=10+6*p;
  ctx.strokeStyle=color+bAlpha; ctx.lineWidth=2.2;
  ctx.strokeRect(sx+2,ey+2,TS-4,TS-4);
  ctx.restore();
  // ── Fondo degradado radial ──
  const bgGrd=ctx.createRadialGradient(sx+TS/2,ey+TS*.65,1,sx+TS/2,ey+TS*.55,TS*.72);
  bgGrd.addColorStop(0,color+'40'); bgGrd.addColorStop(0.6,'rgba(0,0,0,.45)'); bgGrd.addColorStop(1,'rgba(0,0,0,.7)');
  ctx.fillStyle=bgGrd; ctx.fillRect(sx+2,ey+12,TS-4,TS-14);
  // ── Borde interior sutil ──
  ctx.strokeStyle=color+'28'; ctx.lineWidth=1;
  ctx.strokeRect(sx+5,ey+15,TS-10,TS-18);
  // ── Emoji con sombra propia ──
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.9)'; ctx.shadowBlur=7; ctx.shadowOffsetX=1; ctx.shadowOffsetY=2;
  ctx.font='23px serif'; ctx.textBaseline='alphabetic'; ctx.textAlign='center';
  ctx.fillText(emoji,sx+TS/2,ey+TS-3);
  ctx.restore();
  // ── Banner de nombre con gradiente ──
  const bannerGrd=ctx.createLinearGradient(sx,ey,sx+TS,ey+12);
  bannerGrd.addColorStop(0,color+'ee'); bannerGrd.addColorStop(1,color+'88');
  ctx.fillStyle=bannerGrd; ctx.fillRect(sx+2,ey+2,TS-4,11);
  ctx.fillStyle='rgba(0,0,0,.22)'; ctx.fillRect(sx+2,ey+10,TS-4,3);
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.95)'; ctx.shadowBlur=4;
  ctx.fillStyle='#fff'; ctx.font='bold 5.5px sans-serif';
  ctx.textBaseline='middle'; ctx.textAlign='center';
  ctx.fillText(label,sx+TS/2,ey+7.5);
  ctx.restore();
  // ── Bocadillo de diálogo pulsante ──
  ctx.save();
  ctx.shadowColor=color; ctx.shadowBlur=8*p;
  ctx.globalAlpha=.5+.5*p;
  ctx.font='9px serif'; ctx.textBaseline='top'; ctx.textAlign='right';
  ctx.fillText('💬',sx+TS-1,ey+1);
  ctx.restore();
  ctx.restore();
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
}
function drawVerde(sx,sy,mR,mC){
  const b=.85+.15*Math.sin(tick*.04+mR+mC*.6);
  ctx.fillStyle=`hsl(145,${Math.floor(58*b)}%,${Math.floor(26*b)}%)`; ctx.fillRect(sx,sy,TS,TS);
  ctx.lineWidth=1;
  for(let i=0;i<3;i++){ const gx=sx+6+i*12,sw=Math.sin(tick*.06+i*1.5+mC*.7)*2.2; ctx.strokeStyle=`rgba(74,222,128,${.28+.12*Math.sin(tick*.08+i)})`; ctx.beginPath(); ctx.moveTo(gx,sy+TS-4); ctx.lineTo(gx+sw,sy+TS-13); ctx.stroke(); }
}

// ─ Pasillo ─
const CUADRO_C=new Set([6,11,16]);
const CUADRO_PAL=[['#4a7c59','#2d5a3d'],['#1e3a8a','#2563eb'],['#7c2d12','#b45309']];
function drawPasilloTile(t,sx,sy,mR,mC){
  switch(t){
    case '#': ctx.fillStyle='#4a4438'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#5a5448'; ctx.fillRect(sx+1,sy+1,TS-3,TS*.45); ctx.fillStyle='#3a342a'; ctx.fillRect(sx+1,sy+TS*.5,TS-3,TS*.42); ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=1; ctx.strokeRect(sx+1,sy+1,TS-2,TS-2); if(mR===0&&CUADRO_C.has(mC)){const ci=[...CUADRO_C].indexOf(mC),pal=CUADRO_PAL[ci]; ctx.fillStyle='#78350f'; ctx.fillRect(sx+4,sy+8,TS-8,TS-13); ctx.fillStyle=pal[0]; ctx.fillRect(sx+6,sy+10,TS-12,TS-17); ctx.fillStyle=pal[1]; ctx.beginPath(); ctx.arc(sx+TS/2,sy+17,4,0,Math.PI*2); ctx.fill();} ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(sx,sy+TS*.6); ctx.lineTo(sx+TS,sy+TS*.6); ctx.stroke(); break;
    case 'E':{ const gep=.5+.5*Math.sin(tick*.1); ctx.fillStyle='#d97706'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='#fcd34d'; ctx.lineWidth=2; ctx.strokeRect(sx+4,sy+4,TS-8,TS-8); ctx.fillStyle=`rgba(253,230,138,${.7+.3*gep})`; ctx.beginPath(); ctx.arc(sx+TS-11,sy+TS/2,3,0,Math.PI*2); ctx.fill(); ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🚪',sx+TS*.38,sy+TS*.5); ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fffbeb'; ctx.textBaseline='bottom'; ctx.fillText('PLAZA',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'N': const lk=!hasItem('vela'); ctx.fillStyle=lk?'#110820':'#1a0c03'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle=lk?'rgba(139,92,246,.6)':'rgba(245,158,11,.8)'; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=.5+.5*Math.sin(tick*.07); ctx.font='14px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText(lk?'🔮':'🕯',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left'; break;
    case 'V':{ // Puerta Villa Alemana
      const unlV=progress.alexBossDefeated, gv=.5+.5*Math.sin(tick*.09);
      const grV=ctx.createLinearGradient(sx,sy,sx,sy+TS);
      grV.addColorStop(0,unlV?'#15803d':'#374151'); grV.addColorStop(1,unlV?'#14532d':'#1f2937');
      ctx.fillStyle=grV; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle=unlV?`rgba(74,222,128,${.7+.3*gv})`:'#4b5563'; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=unlV?gv:.6; ctx.font='14px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(unlV?'🚂':'🔒',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=unlV?'#4ade80':'#6b7280'; ctx.font='bold 5px sans-serif'; ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('VILLA',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case '8':{
      const g8=.5+.5*Math.sin(tick*.08);
      ctx.fillStyle='#134e4a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#0d9488'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle=`rgba(94,234,212,${.6+.3*g8})`; ctx.lineWidth=2;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.65+.35*g8; ctx.font='14px serif';
      ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🔬',sx+TS/2,sy+TS/2);
      ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle='rgba(94,234,212,.9)'; ctx.font='bold 4.5px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('BIOL.',sx+TS/2,sy+3);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'Z':{ const gz=.5+.5*Math.sin(tick*.08); const gr=ctx.createLinearGradient(sx,sy,sx,sy+TS); gr.addColorStop(0,'#6d28d9'); gr.addColorStop(.5,'#7c3aed'); gr.addColorStop(1,'#5b21b6'); ctx.fillStyle=gr; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle=`rgba(192,132,252,${.6+.3*gz})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=gz; ctx.font='14px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('💜',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left'; ctx.fillStyle='#c084fc'; ctx.font='bold 5px sans-serif'; ctx.textBaseline='top'; ctx.textAlign='center'; ctx.fillText('CONT.',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'f': ctx.fillStyle='#d1fae5'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(0,0,0,.06)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); ctx.font='20px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText(mC<10?'🌸':'🪴',sx+TS/2,sy+TS/2+2); ctx.textAlign='left'; break;
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=`${mc}`;  ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2-.5); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'z':{ // Mini Laboratorio
      const zp=.5+.5*Math.sin(tick*.09+mC*.2);
      const labColors={biologia:'#22c55e',secretaria:'#f59e0b',sala_cont:'#60a5fa',biblioteca:'#a78bfa'};
      const zc=labColors[currentMap]||'#818cf8';
      // Mesa de trabajo
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#334155'; ctx.fillRect(sx+1,sy+4,TS-2,TS-6);
      // Patas de mesa
      ctx.fillStyle='#475569'; ctx.fillRect(sx+2,sy+TS-5,3,5); ctx.fillRect(sx+TS-5,sy+TS-5,3,5);
      // Superficie brillante
      ctx.fillStyle=`rgba(${zc==='#22c55e'?'34,197,94':zc==='#f59e0b'?'245,158,11':zc==='#60a5fa'?'96,165,250':'167,139,250'},.15)`; 
      ctx.fillRect(sx+1,sy+4,TS-2,4);
      // Equipamiento lab (beaker + screen)
      ctx.shadowColor=zc; ctx.shadowBlur=6+4*zp;
      ctx.globalAlpha=.8+.2*zp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('⚗️',sx+TS*.35,sy+TS*.52); 
      ctx.font='7px serif'; ctx.fillText('🔬',sx+TS*.7,sy+TS*.52);
      ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.5+.3*zp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center'; ctx.fillText('LAB',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'F':{ // Forja Metalúrgica
      const fp=.5+.5*Math.sin(tick*.08);
      const fr=.4+.4*Math.sin(tick*.15+mC);
      // Cuerpo del horno
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#292524'; ctx.fillRect(sx+2,sy+3,TS-4,TS-5);
      // Boca del horno (naranja brillante)
      ctx.fillStyle=`rgba(249,115,22,${.7+.3*fr})`; ctx.fillRect(sx+4,sy+TS*.4,TS-8,TS*.35);
      // Llamas internas
      ctx.shadowColor=`rgba(251,146,60,.8)`; ctx.shadowBlur=8+6*fp;
      ctx.fillStyle=`rgba(254,215,170,${.6+.4*fr})`; ctx.fillRect(sx+6,sy+TS*.45,TS-12,TS*.25);
      ctx.shadowBlur=0;
      // Chimenea
      ctx.fillStyle='#44403c'; ctx.fillRect(sx+TS*.35,sy,5,TS*.3);
      // Humo
      ctx.fillStyle=`rgba(120,113,108,${.3+.2*Math.sin(tick*.06)})`;
      ctx.beginPath(); ctx.arc(sx+TS*.4,sy-4,4+2*fp,0,Math.PI*2); ctx.fill();
      // Yunque
      ctx.fillStyle='#57534e'; ctx.fillRect(sx+TS*.55,sy+TS*.55,TS*.35,TS*.12); ctx.fillRect(sx+TS*.6,sy+TS*.67,TS*.25,TS*.2);
      ctx.fillStyle=`rgba(251,191,36,.9)`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FORJA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '@':{ // Farmacia
      const pp=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#0f2027'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#065f46'; ctx.fillRect(sx+2,sy+4,TS-4,TS-6);
      // Cruz verde
      ctx.fillStyle=`rgba(16,185,129,${.8+.2*pp})`;
      ctx.fillRect(sx+TS/2-2,sy+6,4,TS-10);
      ctx.fillRect(sx+4,sy+TS/2-2,TS-8,4);
      ctx.shadowColor=`rgba(16,185,129,.6)`; ctx.shadowBlur=6+5*pp;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#6ee7b7';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FARM',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.shadowBlur=0;
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    
    case 'r':{ // Tío Antonio — inspector moreno, pelo corto futbolista
      const ap=.5+.5*Math.sin(tick*.08);
      // Piso
      ctx.fillStyle='#d4c5a0'; ctx.fillRect(sx,sy,TS,TS);
      // Cuerpo — uniforme oscuro (inspección)
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+TS*.25,sy+TS*.42,TS*.5,TS*.42);
      // Cuello/hombros
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+TS*.18,sy+TS*.38,TS*.64,TS*.12);
      // Camisa interior blanca
      ctx.fillStyle='#f0f0f0'; ctx.fillRect(sx+TS*.38,sy+TS*.38,TS*.24,TS*.14);
      // Piernas
      ctx.fillStyle='#162d4a'; ctx.fillRect(sx+TS*.27,sy+TS*.72,TS*.2,TS*.26);
      ctx.fillRect(sx+TS*.53,sy+TS*.72,TS*.2,TS*.26);
      // Zapatos
      ctx.fillStyle='#1a1a1a'; ctx.fillRect(sx+TS*.25,sy+TS*.9,TS*.22,TS*.1);
      ctx.fillRect(sx+TS*.53,sy+TS*.9,TS*.22,TS*.1);
      // Cabeza — piel morena
      ctx.fillStyle='#8B5E3C'; ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.25,TS*.18,0,Math.PI*2); ctx.fill();
      // Pelo corto — negro, estilo futbolista (muy pegado)
      ctx.fillStyle='#111'; 
      ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.2,TS*.18,Math.PI,0); ctx.fill();
      ctx.fillRect(sx+TS*.32,sy+TS*.12,TS*.36,TS*.1);
      // Ojos expresivos
      ctx.fillStyle='#fff'; ctx.fillRect(sx+TS*.4,sy+TS*.22,TS*.08,TS*.07);
      ctx.fillRect(sx+TS*.52,sy+TS*.22,TS*.08,TS*.07);
      ctx.fillStyle='#111'; ctx.fillRect(sx+TS*.43,sy+TS*.23,TS*.04,TS*.05);
      ctx.fillRect(sx+TS*.55,sy+TS*.23,TS*.04,TS*.05);
      // Cejas marcadas y serias
      ctx.fillStyle='#111'; ctx.fillRect(sx+TS*.38,sy+TS*.19,TS*.12,TS*.025);
      ctx.fillRect(sx+TS*.5,sy+TS*.19,TS*.12,TS*.025);
      // Bigote corto
      ctx.fillStyle='#222'; ctx.fillRect(sx+TS*.42,sy+TS*.3,TS*.16,TS*.03);
      // Insignia/placa en el pecho
      ctx.fillStyle='#fbbf24'; ctx.shadowColor='rgba(251,191,36,.6)'; ctx.shadowBlur=3+2*ap;
      ctx.fillRect(sx+TS*.55,sy+TS*.48,TS*.12,TS*.09);
      ctx.shadowBlur=0;
      // Silbato
      ctx.fillStyle='#d97706'; ctx.fillRect(sx+TS*.3,sy+TS*.52,TS*.08,TS*.04);
      // Nombre
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fef9c3';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('TÍO\nANT.',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case '$':{ // Jorge — señor mayor con overoles
      const jp=.5+.5*Math.sin(tick*.06+mC);
      // Piso
      ctx.fillStyle='#d4c5a0'; ctx.fillRect(sx,sy,TS,TS);
      // Overoles azul marino (cuerpo)
      ctx.fillStyle='#1e40af'; ctx.fillRect(sx+TS*.2,sy+TS*.4,TS*.6,TS*.45);
      // Peto del overol
      ctx.fillStyle='#1d4ed8'; ctx.fillRect(sx+TS*.3,sy+TS*.35,TS*.4,TS*.2);
      // Tirantes
      ctx.fillStyle='#1d4ed8'; ctx.fillRect(sx+TS*.28,sy+TS*.35,TS*.06,TS*.2);
      ctx.fillRect(sx+TS*.66,sy+TS*.35,TS*.06,TS*.2);
      // Piernas overol
      ctx.fillStyle='#1e40af'; ctx.fillRect(sx+TS*.25,sy+TS*.74,TS*.22,TS*.24);
      ctx.fillRect(sx+TS*.53,sy+TS*.74,TS*.22,TS*.24);
      // Zapatos café
      ctx.fillStyle='#7c3f00'; ctx.fillRect(sx+TS*.23,sy+TS*.9,TS*.24,TS*.1);
      ctx.fillRect(sx+TS*.53,sy+TS*.9,TS*.24,TS*.1);
      // Cabeza — piel más clara, edad
      ctx.fillStyle='#c4956a'; ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.25,TS*.17,0,Math.PI*2); ctx.fill();
      // Pelo canoso/blanco (poco, mayor)
      ctx.fillStyle='#e2e8f0';
      ctx.fillRect(sx+TS*.32,sy+TS*.12,TS*.1,TS*.08);
      ctx.fillRect(sx+TS*.58,sy+TS*.12,TS*.1,TS*.08);
      ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.17,TS*.15,Math.PI+.4,0-.4); ctx.fillStyle='#e2e8f0'; ctx.fill();
      // Arrugas / expresión
      ctx.strokeStyle='rgba(120,80,40,.4)'; ctx.lineWidth=.5;
      ctx.beginPath(); ctx.moveTo(sx+TS*.4,sy+TS*.26); ctx.lineTo(sx+TS*.45,sy+TS*.27); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+TS*.55,sy+TS*.26); ctx.lineTo(sx+TS*.6,sy+TS*.27); ctx.stroke();
      // Ojos pequeños, cansados
      ctx.fillStyle='#4b3a2a'; ctx.fillRect(sx+TS*.41,sy+TS*.22,TS*.07,TS*.06);
      ctx.fillRect(sx+TS*.52,sy+TS*.22,TS*.07,TS*.06);
      // Bolsillo overol con lápiz
      ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(sx+TS*.35,sy+TS*.5,TS*.12,TS*.08);
      ctx.fillStyle='#fde68a'; ctx.fillRect(sx+TS*.43,sy+TS*.47,TS*.03,TS*.08);
      // Escoba/mopa (herramienta de trabajo)
      ctx.fillStyle='#92400e'; ctx.fillRect(sx+TS*.7,sy+TS*.15,TS*.06,TS*.65);
      ctx.fillStyle='#d97706'; ctx.fillRect(sx+TS*.64,sy+TS*.72,TS*.18,TS*.06);
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+TS*.62,sy+TS*.78,TS*.22,TS*.12);
      // Nombre
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#bfdbfe';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JORGE',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '^':{
      const sp3=.5+.5*Math.sin(tick*.07+mC);
      ctx.fillStyle='#292524';ctx.fillRect(sx,sy,TS,TS);
      for(let i=0;i<3;i++){ctx.fillStyle=`rgba(${180+i*20},${160+i*20},${140+i*20},.9)`;ctx.fillRect(sx+2+i*5,sy+TS*.2+i*7,TS-4-i*10,TS*.15);}
      ctx.shadowColor='rgba(251,191,36,.6)';ctx.shadowBlur=4+3*sp3;
      ctx.font='8px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('⬆️',sx+TS/2,sy+TS*.65); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#fbbf24';
      ctx.textBaseline='top';ctx.fillText('SUBIR',sx+TS/2,sy+1);
      ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
        case '>':{
      const gp=.5+.5*Math.sin(tick*.08+mC);
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(74,222,128,${.3+.3*gp})`; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowColor='rgba(74,222,128,.7)'; ctx.shadowBlur=5+4*gp;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🌿',sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#86efac';
      ctx.textBaseline='top'; ctx.fillText('JARDÍN',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
        case 'E':{
      const ep=.45+.35*Math.sin(tick*.07+mC*.2);
      // Determine label by position
      const isCancha = mR===0;
      const isBiblio = mC===39;
      const isPlaza  = mC===0;
      const isBottom = mR===15;
      const label = isCancha?'CANCHA':isBiblio?'BIBLIO':isPlaza?'PLAZA':isBottom?'SALIDA':'SALIDA';
      const emoji  = isCancha?'🏀':isBiblio?'📚':isPlaza?'🌳':isBottom?'🚪':'🚪';
      const col    = isCancha?'#16a34a':isBiblio?'#7c3aed':isPlaza?'#1d4ed8':isBottom?'#d97706':'#6b7280';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=col+'33'; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.shadowColor=col; ctx.shadowBlur=5+4*ep;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(emoji,sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle=col;
      ctx.textBaseline='top'; ctx.fillText(label,sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'S':{
      const sp4=.5+.5*Math.sin(tick*.07+mC);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(245,158,11,${.3+.3*sp4})`; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.shadowColor='#f59e0b'; ctx.shadowBlur=5+4*sp4;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('📋',sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fbbf24';
      ctx.textBaseline='top'; ctx.fillText('SECRE',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case '8':{
      const bp=.5+.5*Math.sin(tick*.07+mC);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(16,185,129,${.3+.3*bp})`; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.shadowColor='#10b981'; ctx.shadowBlur=5+4*bp;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🔬',sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#6ee7b7';
      ctx.textBaseline='top'; ctx.fillText('BIOLOG',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'Z':{
      const zp2=.5+.5*Math.sin(tick*.07+mC);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(99,102,241,${.3+.3*zp2})`; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.shadowColor='#6366f1'; ctx.shadowBlur=5+4*zp2;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('📐',sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#a5b4fc';
      ctx.textBaseline='top'; ctx.fillText('CONT',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'V':{
      const vp=.5+.5*Math.sin(tick*.07+mC);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(239,68,68,${.3+.3*vp})`; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.shadowColor='#ef4444'; ctx.shadowBlur=5+4*vp;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🚂',sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fca5a5';
      ctx.textBaseline='top'; ctx.fillText('VILLA',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'N':{
      const np2=.5+.5*Math.sin(tick*.07+mC);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(168,85,247,${.3+.3*np2})`; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.shadowColor='#a855f7'; ctx.shadowBlur=5+4*np2;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🕯️',sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#d8b4fe';
      ctx.textBaseline='top'; ctx.fillText('S.VELA',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
        default: {
      // Piso de losas medievales
      ctx.fillStyle=(mR+mC)%2===0?'#9a9488':'#8a847a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(sx+2,sy+2,TS-4,2);
      ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(sx+2,sy+TS-3,TS-4,2);
      ctx.strokeStyle='rgba(0,0,0,.22)'; ctx.lineWidth=1; ctx.strokeRect(sx+1,sy+1,TS-2,TS-2);
      const _h=Math.sin(mC*12.9+mR*78.2)*43758.5; const _f=_h-Math.floor(_h);
      if(_f>.8){ctx.fillStyle='rgba(74,120,52,.25)';ctx.fillRect(sx+TS-6,sy+TS-6,4,4);}
    }
  }
  switch(t){
    case 'I': drawNPC(sx,sy,'👔','#4b5563','INSP'); break; case 'J': drawNPC(sx,sy,'🗣️','#3b82f6','JOSE'); break;
    case '5': drawNPC(sx,sy,'👱‍♀️','#8b5cf6','VALERIA'); break; case '6': drawNPC(sx,sy,'👩','#0d9488','SOFIA'); break;
    case '7': drawNPC(sx,sy,'👩‍💼',progress.claudita===1?'#f59e0b':'#10b981','TÍA CL'); if(progress.claudita===1){ctx.fillStyle=`rgba(253,212,66,${.5+.5*Math.sin(tick*.12)})`; ctx.font='bold 8px sans-serif'; ctx.textBaseline='middle'; ctx.fillText('!',sx+TS-9,sy+7);} break;
  }
}
// ─ Cancha ─
function drawCanchaTile(t,sx,sy,mR,mC){
  if(medTerrain(t,sx,sy,mC,mR)) return;
  switch(t){
    case '#': ctx.fillStyle='#172554'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#1e3a8a'; ctx.fillRect(sx,sy+4,TS,8); ctx.fillStyle='#172554'; ctx.fillRect(sx,sy+18,TS,8); break;
    case 'E':{ const gp=.5+.5*Math.sin(tick*.09); ctx.fillStyle=`rgba(34,197,94,${.25+.1*gp})`; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle=`rgba(74,222,128,${.6+.2*gp})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=.7+.3*gp; ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#bbf7d0'; ctx.textBaseline='bottom'; ctx.fillText('PASILLO',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'b': ctx.fillStyle=`hsl(${217+((mR+mC)%3)*3},85%,44%)`; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(255,255,255,.04)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); break;
    case 'K': drawVerde(sx,sy,mR,mC); ctx.fillStyle='#fde68a'; ctx.fillRect(sx+1,sy+1,TS-2,14); ctx.fillStyle='#f59e0b'; ctx.fillRect(sx+1,sy+13,TS-2,2); for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#dc2626':'#fde68a'; ctx.fillRect(sx+3+i*9,sy+1,8,14);} ctx.fillStyle='#fffbeb'; ctx.fillRect(sx+3,sy+15,TS-6,TS-16); ctx.fillStyle='#fde68a'; ctx.fillRect(sx+3,sy+25,TS-6,4); break;
    case 'C': {
      ctx.fillStyle=`hsl(${217+((mR+mC)%3)*3},85%,44%)`; ctx.fillRect(sx,sy,TS,TS);
      const op=progress.chestOpened;
      ctx.fillStyle=op?'#4b5563':'#78350f'; ctx.fillRect(sx+4,sy+16,TS-8,TS-20);
      ctx.fillStyle=op?'#6b7280':'#92400e'; ctx.fillRect(sx+3,sy+9,TS-6,9);
      if(op){ ctx.fillStyle='#374151'; ctx.fillRect(sx+3,sy+3,TS-6,7); ctx.fillStyle='#9ca3af'; ctx.font='12px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('✓',sx+TS/2,sy+TS/2+2); ctx.textAlign='left'; }
      else { ctx.fillStyle='#fcd34d'; ctx.fillRect(sx+TS/2-3,sy+17,6,5); ctx.strokeStyle='#fcd34d'; ctx.lineWidth=1; ctx.strokeRect(sx+3,sy+9,TS-6,TS-13); if(hasItem('llave')){const gw=.4+.4*Math.sin(tick*.15); ctx.save(); ctx.shadowColor='#fcd34d'; ctx.shadowBlur=10*gw; ctx.strokeStyle=`rgba(253,212,66,${gw})`; ctx.lineWidth=2; ctx.strokeRect(sx+1,sy+7,TS-2,TS-11); ctx.restore();} }
      ctx.fillStyle=op?'#9ca3af':'#fcd34d'; ctx.font='bold 5px sans-serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText(op?'ABIERTO':'COFRE',sx+TS/2,sy+6); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=`${mc}`;  ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2-.5); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: drawVerde(sx,sy,mR,mC);
  }
}

function drawDahian(sx,sy){
  const p=.5+.4*Math.sin(tick*.07);
  const bob=Math.abs(Math.sin(tick*.08))*2;
  // Background
  ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(sx+1,sy+12,TS-2,TS-13);
  ctx.fillStyle='rgba(21,128,61,.4)'; ctx.fillRect(sx+1,sy+12,TS-2,TS-13);
  ctx.strokeStyle='#4ade80'; ctx.lineWidth=2.2; ctx.strokeRect(sx+1,sy+1,TS-2,TS-2);
  // Name banner
  ctx.fillStyle='#16a34a'; ctx.fillRect(sx+1,sy+1,TS-2,11);
  ctx.fillStyle='#fff'; ctx.font='bold 5.8px sans-serif';
  ctx.textBaseline='middle'; ctx.textAlign='center';
  ctx.fillText('DAHIAN',sx+TS/2,sy+7); ctx.textAlign='left';
  // Floor shadow
  ctx.fillStyle='rgba(0,0,0,.28)'; ctx.beginPath();
  ctx.ellipse(sx+TS/2,sy+TS-4,12,3.5,0,0,Math.PI*2); ctx.fill();
  // ── Dibujo de Dahian: mujer con pelo liso ──
  const cx=sx+TS/2-2, cy=sy+16-bob;
  // Cuerpo (ropa gym - leggings morados + top)
  ctx.fillStyle='#7c3aed'; ctx.fillRect(cx-4,cy+8,8,10); // leggings
  ctx.fillStyle='#a78bfa'; ctx.fillRect(cx-3,cy+10,6,6); // top deportivo
  // Piernas
  ctx.fillStyle='#6d28d9'; ctx.fillRect(cx-4,cy+16,3,7); ctx.fillRect(cx+1,cy+16,3,7);
  // Zapatillas
  ctx.fillStyle='#e2e8f0'; ctx.fillRect(cx-5,cy+21,4,3); ctx.fillRect(cx+1,cy+21,4,3);
  // Brazos (corriendo)
  ctx.fillStyle='#a78bfa'; ctx.fillRect(cx-7,cy+9,3,5); ctx.fillRect(cx+4,cy+11,3,5);
  // Cabeza
  ctx.fillStyle='#fcd34d'; ctx.beginPath(); ctx.arc(cx,cy+5,5,0,Math.PI*2); ctx.fill();
  // Pelo liso (café oscuro)
  ctx.fillStyle='#3d1f0d'; ctx.fillRect(cx-5,cy,10,5); // parte superior
  ctx.fillRect(cx-5,cy,2,9); ctx.fillRect(cx+3,cy,2,9); // mechones costados
  // Cara: ojos
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(cx-2,cy+4,1,1); ctx.fillRect(cx+1,cy+4,1,1);
  // Sonrisa
  ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=.8; ctx.beginPath();
  ctx.arc(cx,cy+6,2,0.1,Math.PI-.1); ctx.stroke();
  // ── Gato 1 (izquierda) ──
  const c1x=sx+3,c1y=sy+TS-12+Math.sin(tick*.06)*1.5;
  ctx.fillStyle='#f97316'; // gato naranja
  ctx.fillRect(c1x,c1y+3,6,5); // cuerpo
  ctx.fillRect(c1x+1,c1y,4,4); // cabeza
  ctx.fillRect(c1x-1,c1y+6,1,3); ctx.fillRect(c1x+6,c1y+6,1,3); // patas
  ctx.fillRect(c1x+6,c1y+2,1,4); // colita
  // orejas gato 1
  ctx.fillStyle='#ea580c'; ctx.fillRect(c1x+1,c1y-1,1,2); ctx.fillRect(c1x+3,c1y-1,1,2);
  // ojos gato 1
  ctx.fillStyle='#16a34a'; ctx.fillRect(c1x+2,c1y+1,1,1); ctx.fillRect(c1x+4,c1y+1,1,1);
  // ── Gato 2 (derecha) ──
  const c2x=sx+TS-9,c2y=sy+TS-12+Math.sin(tick*.06+1.5)*1.5;
  ctx.fillStyle='#9ca3af'; // gato gris
  ctx.fillRect(c2x,c2y+3,6,5); // cuerpo
  ctx.fillRect(c2x+1,c2y,4,4); // cabeza
  ctx.fillRect(c2x-1,c2y+6,1,3); ctx.fillRect(c2x+6,c2y+6,1,3); // patas
  ctx.fillRect(c2x-1,c2y+2,1,4); // colita
  // orejas gato 2
  ctx.fillStyle='#6b7280'; ctx.fillRect(c2x+1,c2y-1,1,2); ctx.fillRect(c2x+3,c2y-1,1,2);
  // ojos gato 2
  ctx.fillStyle='#f59e0b'; ctx.fillRect(c2x+2,c2y+1,1,1); ctx.fillRect(c2x+4,c2y+1,1,1);
  // Chat bubble
  ctx.globalAlpha=.4+.5*p; ctx.font='9px serif';
  ctx.textBaseline='top'; ctx.textAlign='right';
  ctx.fillText('💬',sx+TS-1,sy+1); ctx.globalAlpha=1;
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
}

function drawCanchaOverlays(){
  const map=MAPS.cancha;
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const mR=r+camera.y,mC=c+camera.x,t=map[mR]?.[mC],sx=c*TS,sy=r*TS;
    if(t==='K'){ const kb=Math.abs(Math.sin(tick*.08))*2; ctx.font='17px serif'; ctx.textBaseline='alphabetic'; ctx.fillText('👩',sx+8,sy+TS-3-kb); ctx.fillStyle='#92400e'; ctx.font='bold 6px sans-serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('KELLA',sx+TS/2,sy+8); ctx.textAlign='left'; ctx.fillStyle=`rgba(253,212,66,${.5+.5*Math.sin(tick*.1)})`; ctx.font='9px serif'; ctx.textBaseline='top'; ctx.fillText('★',sx+TS-13,sy+2); ctx.textBaseline='alphabetic'; }
    if(t==='G') drawNPC(sx,sy,'👨‍🏫','#16a34a','GONZA');
    if(t==='U') drawNPC(sx,sy,'👨','#0284c7','JUAN');
    if(t==='D') drawDahian(sx,sy);
  }
}
function drawCourtMarkings(){
  const ws=(wx,wy)=>({x:(wx-camera.x)*TS,y:(wy-camera.y)*TS});
  const tl=ws(5,2),br=ws(15,8),cc=ws(10,5),cTop=ws(10,2),cBot=ws(10,8),lkTL=ws(5,3.5),lkBR=ws(8,6.5),rkTL=ws(12,3.5),rkBR=ws(15,6.5),lh=ws(6.5,5),rh=ws(13.5,5);
  ctx.strokeStyle='rgba(255,255,255,.65)'; ctx.lineWidth=2; ctx.beginPath();
  ctx.rect(tl.x,tl.y,br.x-tl.x,br.y-tl.y); ctx.moveTo(cTop.x,cTop.y); ctx.lineTo(cBot.x,cBot.y); ctx.arc(cc.x,cc.y,TS*1.5,0,Math.PI*2); ctx.rect(lkTL.x,lkTL.y,lkBR.x-lkTL.x,lkBR.y-lkTL.y); ctx.rect(rkTL.x,rkTL.y,rkBR.x-rkTL.x,rkBR.y-rkTL.y);
  ctx.moveTo(lh.x,lh.y+TS*2.8); ctx.arc(lh.x,lh.y,TS*2.8,-Math.PI*.65,Math.PI*.65); ctx.moveTo(rh.x,rh.y-TS*2.8); ctx.arc(rh.x,rh.y,TS*2.8,Math.PI*.35,Math.PI*1.65); ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(ws(7.5,5).x,ws(7.5,5).y,TS*1.4,0,Math.PI*2); ctx.arc(ws(12.5,5).x,ws(12.5,5).y,TS*1.4,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(cc.x,cc.y,4,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#ef4444'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(lh.x,lh.y,9,0,Math.PI*2); ctx.arc(rh.x,rh.y,9,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='rgba(220,235,255,.9)'; ctx.lineWidth=3; const lb=ws(5,5),rb=ws(15,5); ctx.beginPath(); ctx.moveTo(lb.x,lb.y-TS*.5); ctx.lineTo(lb.x,lb.y+TS*.5); ctx.moveTo(rb.x,rb.y-TS*.5); ctx.lineTo(rb.x,rb.y+TS*.5); ctx.stroke();
  const sb=ws(10,0); if(sb.x>-60&&sb.x<canvas.width+60){ ctx.fillStyle='rgba(0,0,0,.78)'; ctx.fillRect(sb.x-42,sb.y+4,84,26); ctx.strokeStyle='#fcd34d'; ctx.lineWidth=1.5; ctx.strokeRect(sb.x-42,sb.y+4,84,26); ctx.fillStyle='#fcd34d'; ctx.font='bold 7px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🏀 CANCHA',sb.x,sb.y+17); ctx.textAlign='left'; }
}
// ─ Sala Vela ─
function drawSVTile(t,sx,sy,mR,mC){
  switch(t){
    case '#': ctx.fillStyle='#0f0a05'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(139,90,43,.2)'; ctx.lineWidth=1; ctx.strokeRect(sx+1,sy+1,TS-2,TS-2); break;
    case 'E':{ const gp=.5+.5*Math.sin(tick*.1); ctx.fillStyle=`rgba(245,158,11,${.5+.2*gp})`; ctx.fillRect(sx,sy,TS,TS); ctx.globalAlpha=.7+.3*gp; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fef3c7'; ctx.textBaseline='bottom'; ctx.fillText('PASILLO',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 's': ctx.fillStyle='#2c1a0a'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#3d2510'; ctx.fillRect(sx+3,sy+3,TS-6,TS-6); ['#7c2d12','#1e3a5f','#14532d','#4a1942'].forEach((c,i)=>{ ctx.fillStyle=c; ctx.fillRect(sx+5+i*8,sy+10,6,18); }); break;
    case 'W': ctx.fillStyle='#1c1408'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#3d2c18'; ctx.fillRect(sx+5,sy+18,TS-10,TS-18); const gw=Math.abs(Math.sin(tick*.06)); ctx.save(); ctx.shadowColor=`rgba(255,200,80,${gw*.8})`; ctx.shadowBlur=12; ctx.fillStyle='#8b5e14'; ctx.fillRect(sx+7,sy+5,TS-14,13); ctx.fillStyle='#c89030'; ctx.fillRect(sx+9,sy+6,TS-18,11); ctx.restore(); ctx.fillStyle=`rgba(255,230,130,${.5+.5*gw})`; ctx.font='7px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('✦',sx+TS/2,sy+11); ctx.textAlign='left'; break;
    case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle='#1a1208'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(255,180,50,.06)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS);
  }
}
function applyCandlelight(psx,psy){
  const cx=psx+TS/2,cy=psy+TS/2,r=138+14*Math.sin(tick*.13)+6*Math.sin(tick*.33);
  const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,r); grd.addColorStop(0,'rgba(0,0,0,0)'); grd.addColorStop(.32,'rgba(0,0,0,.12)'); grd.addColorStop(.68,'rgba(0,0,0,.72)'); grd.addColorStop(1,'rgba(0,0,0,.97)');
  ctx.fillStyle=grd; ctx.fillRect(0,0,canvas.width,canvas.height);
  const w=ctx.createRadialGradient(cx,cy,0,cx,cy,r*.5); w.addColorStop(0,'rgba(255,155,50,.07)'); w.addColorStop(1,'rgba(255,155,50,0)'); ctx.fillStyle=w; ctx.fillRect(0,0,canvas.width,canvas.height);
}
// ─ Biblioteca ─
function drawTV(sx,sy){ ctx.fillStyle='#1e293b'; ctx.fillRect(sx+2,sy+5,TS-4,TS-10); ctx.fillStyle='#0f172a'; ctx.fillRect(sx+4,sy+7,TS-8,TS-16); ctx.fillStyle=['#1d4ed8','#7c3aed','#059669'][Math.floor(tick/40)%3]; ctx.fillRect(sx+5,sy+8,TS-10,TS-18); ctx.fillStyle='rgba(255,255,255,.3)'; ctx.fillRect(sx+6,sy+10,TS-14,3); ctx.fillRect(sx+6,sy+15,TS-18,2); ctx.fillStyle='#334155'; ctx.fillRect(sx+TS/2-5,sy+TS-6,10,3); ctx.fillRect(sx+TS/2-8,sy+TS-4,16,3); }
function drawBibliotecaTile(t,sx,sy,mR,mC){
  switch(t){
    case '#': ctx.fillStyle='#f0f4f8'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(100,116,139,.15)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); if(mR===0&&mC===10) drawTV(sx,sy); break;
    case 'E':{ const ge=.5+.5*Math.sin(tick*.09); ctx.fillStyle=`rgba(245,158,11,${.3+.1*ge})`; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle=`rgba(253,212,66,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fef3c7'; ctx.textBaseline='bottom'; ctx.fillText('PASILLO',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 's': ctx.fillStyle='#92400e'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#78350f'; ctx.fillRect(sx+3,sy+3,TS-6,TS-6); const bc=['#dc2626','#2563eb','#16a34a','#9333ea','#ea580c','#0891b2']; for(let i=0;i<5;i++){ctx.fillStyle=bc[(i+mC)%bc.length]; ctx.fillRect(sx+3+i*7,sy+5,6,TS-12);} break;
    case 'w': ctx.fillStyle='#f8fafc'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4); ctx.strokeStyle='rgba(148,163,184,.5)'; ctx.lineWidth=1; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4); ctx.fillStyle='#94a3b8'; ctx.fillRect(sx+3,sy+TS-6,4,6); ctx.fillRect(sx+TS-7,sy+TS-6,4,6); break;
    case 'c': ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+3,TS-6,TS-6); ctx.fillStyle=`rgba(59,130,246,${.6+.4*Math.sin(tick*.12+mC*.7)})`; ctx.fillRect(sx+6,sy+6,TS-12,TS-18); ctx.fillStyle='rgba(255,255,255,.15)'; ctx.fillRect(sx+7,sy+8,TS-16,3); ctx.fillStyle='#334155'; ctx.fillRect(sx+TS/2-3,sy+TS-10,6,4); ctx.fillRect(sx+TS/2-6,sy+TS-7,12,4); break;
    case 'Q': ctx.fillStyle='#fef9c3'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(0,0,0,.05)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); break;
        case 'H':{ // Puerta Salón de Trofeos
      const gh=.5+.5*Math.sin(tick*.08);
      ctx.fillStyle='#78350f'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#92400e'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle=`rgba(253,212,66,${.6+.35*gh})`; ctx.lineWidth=2;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.65+.35*gh; ctx.font='14px serif';
      ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🏆',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle='rgba(253,212,66,.95)'; ctx.font='bold 5px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('TROFEOS',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=mc; ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'z':{ // Mini Laboratorio
      const zp=.5+.5*Math.sin(tick*.09+mC*.2);
      const labColors={biologia:'#22c55e',secretaria:'#f59e0b',sala_cont:'#60a5fa',biblioteca:'#a78bfa'};
      const zc=labColors[currentMap]||'#818cf8';
      // Mesa de trabajo
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#334155'; ctx.fillRect(sx+1,sy+4,TS-2,TS-6);
      // Patas de mesa
      ctx.fillStyle='#475569'; ctx.fillRect(sx+2,sy+TS-5,3,5); ctx.fillRect(sx+TS-5,sy+TS-5,3,5);
      // Superficie brillante
      ctx.fillStyle=`rgba(${zc==='#22c55e'?'34,197,94':zc==='#f59e0b'?'245,158,11':zc==='#60a5fa'?'96,165,250':'167,139,250'},.15)`; 
      ctx.fillRect(sx+1,sy+4,TS-2,4);
      // Equipamiento lab (beaker + screen)
      ctx.shadowColor=zc; ctx.shadowBlur=6+4*zp;
      ctx.globalAlpha=.8+.2*zp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('⚗️',sx+TS*.35,sy+TS*.52); 
      ctx.font='7px serif'; ctx.fillText('🔬',sx+TS*.7,sy+TS*.52);
      ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.5+.3*zp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center'; ctx.fillText('LAB',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle=(mR+mC)%2===0?'#fefce8':'#fef9c3'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(0,0,0,.05)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS);
  }
}
function drawBibliotecaOverlays(){ const map=MAPS.biblioteca; for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){ const mR=r+camera.y,mC=c+camera.x; if(map[mR]?.[mC]==='Q') drawNPC(c*TS,r*TS,'👩‍💼','#7c3aed','TÍA JN'); } }


// ═══ MÚSICA 8-BIT RELAJANTE (Sala de Contención) ═══
let audioCtx=null,musicLoop=null,musicActive=false;
function getAC(){
  try{ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume(); return audioCtx; }catch(e){return null;}
}
const SC_NOTES=[[392,1],[440,.5],[523.25,.5],[440,1],[392,2],[329.63,1],[261.63,.5],[329.63,.5],[392,1.5],[0,.5],[329.63,1],[392,.5],[440,.5],[523.25,1],[440,2],[0,1],[523.25,.5],[659.25,.5],[523.25,1],[440,1],[392,2],[0,1]];
const BASS_LOOP=[[130.81,4],[98,2],[130.81,2],[87.31,4]];
const BPS=66/60;
function scNote(freq,t0,dur,vol=.065){
  if(!freq||!audioCtx) return;
  try{
    const osc=audioCtx.createOscillator(),filt=audioCtx.createBiquadFilter(),gain=audioCtx.createGain();
    osc.connect(filt); filt.connect(gain); gain.connect(audioCtx.destination);
    osc.type='triangle'; filt.type='lowpass'; filt.frequency.value=1100;
    osc.frequency.setValueAtTime(freq,t0);
    gain.gain.setValueAtTime(0,t0); gain.gain.linearRampToValueAtTime(vol,t0+.06);
    gain.gain.setValueAtTime(vol,t0+dur-.1); gain.gain.linearRampToValueAtTime(0,t0+dur);
    osc.start(t0); osc.stop(t0+dur+.02);
  }catch(e){}
}
function scBass(freq,t0,dur){
  if(!freq||!audioCtx) return;
  try{
    const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type='square'; osc.frequency.setValueAtTime(freq*.5,t0);
    gain.gain.setValueAtTime(.022,t0); gain.gain.exponentialRampToValueAtTime(.001,t0+dur*.8);
    osc.start(t0); osc.stop(t0+dur);
  }catch(e){}
}
function scheduleSC(){
  if(!musicActive) return;
  if(!getAC()) return;
  let t=audioCtx.currentTime+.12, total=0;
  SC_NOTES.forEach(([f,b])=>{ const d=b/BPS; scNote(f,t,d*.88); t+=d; total+=d; });
  let tb=audioCtx.currentTime+.12;
  BASS_LOOP.forEach(([f,b])=>{ const d=b/BPS; scBass(f,tb,d); tb+=d; });
  musicLoop=setTimeout(scheduleSC,(total-.25)*1000);
}
function startSalaContMusic(){ if(musicActive) return; musicActive=true; try{scheduleSC();}catch(e){musicActive=false;} }
function stopSalaContMusic(){ musicActive=false; if(musicLoop){clearTimeout(musicLoop);musicLoop=null;} }

// ═══ SALA DE CONTENCIÓN — DIBUJO ═══
const SC_POSTERS={1:'💙 Aquí\nestás bien',4:'💜 No estás\nsolo',5:'🌸 Respira\nprofundo',8:'✨ Eres\nvalioso'};
const SC_BOT={2:'Todo va\nbien 💙',5:'💜',7:'¡Tú\npuedes!'};
function drawSalaContTile(t,sx,sy,mR,mC){
  const row=mR, col=mC;
  switch(t){
    case '#':{
      ctx.fillStyle='#120a28'; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle='rgba(192,132,252,.25)'; ctx.lineWidth=1; ctx.strokeRect(sx+1,sy+1,TS-2,TS-2);
      const pm=SC_POSTERS[col]; if(row===0&&pm){ctx.fillStyle='rgba(236,72,153,.55)'; ctx.fillRect(sx+4,sy+5,TS-8,TS-11); ctx.fillStyle='white'; ctx.font='bold 5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; pm.split('\n').forEach((l,i)=>ctx.fillText(l,sx+TS/2,sy+9+i*9)); ctx.textAlign='left';}
      const bm=SC_BOT[col]; if(row===9&&bm){ctx.fillStyle='rgba(167,139,250,.45)'; ctx.fillRect(sx+4,sy+5,TS-8,TS-11); ctx.fillStyle='white'; ctx.font='bold 5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; bm.split('\n').forEach((l,i)=>ctx.fillText(l,sx+TS/2,sy+9+i*9)); ctx.textAlign='left';}
      break;}
    case 'E':{const ge=.5+.5*Math.sin(tick*.09); ctx.fillStyle=`rgba(167,139,250,${.3+.1*ge})`; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle=`rgba(192,132,252,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('↩',sx+TS/2,sy+TS*.45); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#e9d5ff'; ctx.textBaseline='bottom'; ctx.fillText('PASILLO',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'a':{
      ctx.fillStyle='#4a1a6e'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(192,132,252,.18)';
      for(let i=0;i<3;i++) for(let j=0;j<3;j++) if((i+j)%2===0) ctx.fillRect(sx+2+i*13,sy+2+j*13,11,11);
      ctx.strokeStyle='rgba(192,132,252,.22)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); break;}
    case 'h':{
      ctx.fillStyle='#3b1754'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(192,132,252,.1)';
      for(let i=0;i<3;i++) for(let j=0;j<3;j++) if((i+j)%2===0) ctx.fillRect(sx+2+i*13,sy+2+j*13,11,11);
      const pb=.8+.2*Math.sin(tick*.06+col*.4);
      ctx.fillStyle=`rgba(236,72,153,${.7*pb})`; ctx.fillRect(sx+5,sy+8,TS-10,TS-16);
      ctx.fillStyle=`rgba(249,168,212,${.65*pb})`; ctx.fillRect(sx+8,sy+11,TS-16,TS-22);
      ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fillRect(sx+9,sy+13,TS-20,5); break;}
    case 'X': case 'P':{
      ctx.fillStyle='#3b1754'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(192,132,252,.11)';
      for(let i=0;i<3;i++) for(let j=0;j<3;j++) if((i+j)%2===0) ctx.fillRect(sx+2+i*13,sy+2+j*13,11,11);
      break;}
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=`${mc}`;  ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2-.5); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'z':{ // Mini Laboratorio
      const zp=.5+.5*Math.sin(tick*.09+mC*.2);
      const labColors={biologia:'#22c55e',secretaria:'#f59e0b',sala_cont:'#60a5fa',biblioteca:'#a78bfa'};
      const zc=labColors[currentMap]||'#818cf8';
      // Mesa de trabajo
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#334155'; ctx.fillRect(sx+1,sy+4,TS-2,TS-6);
      // Patas de mesa
      ctx.fillStyle='#475569'; ctx.fillRect(sx+2,sy+TS-5,3,5); ctx.fillRect(sx+TS-5,sy+TS-5,3,5);
      // Superficie brillante
      ctx.fillStyle=`rgba(${zc==='#22c55e'?'34,197,94':zc==='#f59e0b'?'245,158,11':zc==='#60a5fa'?'96,165,250':'167,139,250'},.15)`; 
      ctx.fillRect(sx+1,sy+4,TS-2,4);
      // Equipamiento lab (beaker + screen)
      ctx.shadowColor=zc; ctx.shadowBlur=6+4*zp;
      ctx.globalAlpha=.8+.2*zp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('⚗️',sx+TS*.35,sy+TS*.52); 
      ctx.font='7px serif'; ctx.fillText('🔬',sx+TS*.7,sy+TS*.52);
      ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.5+.3*zp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center'; ctx.fillText('LAB',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'F':{ // Forja Metalúrgica
      const fp=.5+.5*Math.sin(tick*.08);
      const fr=.4+.4*Math.sin(tick*.15+mC);
      // Cuerpo del horno
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#292524'; ctx.fillRect(sx+2,sy+3,TS-4,TS-5);
      // Boca del horno (naranja brillante)
      ctx.fillStyle=`rgba(249,115,22,${.7+.3*fr})`; ctx.fillRect(sx+4,sy+TS*.4,TS-8,TS*.35);
      // Llamas internas
      ctx.shadowColor=`rgba(251,146,60,.8)`; ctx.shadowBlur=8+6*fp;
      ctx.fillStyle=`rgba(254,215,170,${.6+.4*fr})`; ctx.fillRect(sx+6,sy+TS*.45,TS-12,TS*.25);
      ctx.shadowBlur=0;
      // Chimenea
      ctx.fillStyle='#44403c'; ctx.fillRect(sx+TS*.35,sy,5,TS*.3);
      // Humo
      ctx.fillStyle=`rgba(120,113,108,${.3+.2*Math.sin(tick*.06)})`;
      ctx.beginPath(); ctx.arc(sx+TS*.4,sy-4,4+2*fp,0,Math.PI*2); ctx.fill();
      // Yunque
      ctx.fillStyle='#57534e'; ctx.fillRect(sx+TS*.55,sy+TS*.55,TS*.35,TS*.12); ctx.fillRect(sx+TS*.6,sy+TS*.67,TS*.25,TS*.2);
      ctx.fillStyle=`rgba(251,191,36,.9)`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FORJA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle='#3b1754'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawSalaContOverlays(){
  const map=MAPS.sala_cont;
  if(!map) return;
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const t=map[r]?.[c]; if(!t) continue;
    const sx=c*TS,sy=r*TS;
    if(t==='X') drawNPC(sx,sy,'👩‍⚕️','#c084fc','CONST.');
    if(t==='P'){
      const ready=progress.paulaMission?.completed&&!progress.paulaMission?.rewarded;
      drawNPC(sx,sy,'🧘‍♀️','#f472b6','PAULA');
      if(ready){ctx.fillStyle=`rgba(74,222,128,${.5+.5*Math.sin(tick*.12)})`; ctx.font='bold 8px sans-serif'; ctx.textBaseline='middle'; ctx.fillText('!',sx+TS-9,sy+7);}
    }
  }
  if(Math.floor(tick/90)%40===0) addFloat('💜',(Math.floor(Math.random()*8)+1)*TS+TS/2,(Math.floor(Math.random()*8)+1)*TS+TS/2,'rgba(192,132,252,.9)');
}

// ═══ PLAZA BELÉN — DIBUJO (Pokémon Emerald style) ═══
function drawPlazaTile(t,sx,sy,mR,mC){
  if(medTerrain(t,sx,sy,mC,mR)) return;
    if(t==='n'){ drawStoneMed(sx,sy,mC,mR);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.15,sy+TS*.05,TS*.12,TS*.85);
      ctx.fillRect(sx+TS*.73,sy+TS*.05,TS*.12,TS*.85);
      ctx.fillStyle='#6b4423'; ctx.fillRect(sx+TS*.1,sy,TS*.8,TS*.18);
      ctx.font='8px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🏘️',sx+TS/2,sy+TS*.55);
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textBaseline='top';
      ctx.fillText('SECTOR N',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; return; }
  switch(t){
    case '#':{
      ctx.fillStyle='#1b5e20'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#2e7d32'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle='#4caf50'; ctx.lineWidth=.8; ctx.strokeRect(sx,sy,TS,TS);
      if(mR===0){ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(['🌸','🌺','🌼'][mC%3],sx+TS/2,sy+TS/2); ctx.textAlign='left';}
      break;}
    case 'E':{const ge=.5+.5*Math.sin(tick*.09); ctx.fillStyle=`rgba(100,221,23,${.3+.15*ge})`; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle=`rgba(174,234,0,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('🚪',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#d9f99d'; ctx.textBaseline='bottom'; ctx.fillText('PASILLO',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case '.':{ctx.fillStyle=(mR+mC)%2===0?'#c8e6c9':'#a5d6a7'; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(0,100,0,.07)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); break;}
    case 'T':{
      ctx.fillStyle='#388e3c'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS-4,12,4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#5d4037'; ctx.fillRect(sx+TS/2-5,sy+TS/2+2,10,TS/2-5);
      const bob=Math.sin(tick*.04+mC*.4)*1.5;
      ctx.fillStyle='#1b5e20'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2-2+bob,15,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#2e7d32'; ctx.beginPath(); ctx.arc(sx+TS/2-6,sy+TS/2-8+bob,11,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#43a047'; ctx.beginPath(); ctx.arc(sx+TS/2+6,sy+TS/2-6+bob,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#66bb6a'; ctx.beginPath(); ctx.arc(sx+TS/2-3,sy+TS/2-14+bob,6,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#1b5e20'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2-2+bob,15,0,Math.PI*2); ctx.stroke();
      break;}
    case 'g':{
      ctx.fillStyle='#558b2f'; ctx.fillRect(sx,sy,TS,TS);
      const wOff=Math.sin(tick*.05+mC*.6)*2.5;
      ctx.lineWidth=2;
      ctx.strokeStyle='#33691e';
      for(let i=0;i<3;i++){const gx=sx+4+i*6,gh=12+i*2; ctx.beginPath(); ctx.moveTo(gx,sy+TS); ctx.quadraticCurveTo(gx+wOff,sy+TS-gh*.6,gx+wOff*.7,sy+TS-gh); ctx.stroke();}
      ctx.strokeStyle='#7cb342';
      for(let i=0;i<3;i++){const gx=sx+22+i*5,gh=10+i*3; ctx.beginPath(); ctx.moveTo(gx,sy+TS); ctx.quadraticCurveTo(gx-wOff*.8,sy+TS-gh*.5,gx-wOff*.5,sy+TS-gh); ctx.stroke();}
      ctx.fillStyle='rgba(51,105,30,.28)'; ctx.fillRect(sx,sy,TS,TS/3);
      break;}
    case 'F':{
      const wp=Math.sin(tick*.1+mC*.5+mR*.7)*.15;
      ctx.fillStyle='#607d8b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(33,150,243,${.7+wp})`; ctx.fillRect(sx+3,sy+3,TS-6,TS-6);
      const rr=(tick*2.5)%20;
      ctx.strokeStyle=`rgba(255,255,255,${.35+wp*.5})`; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,(rr*.5)%15,0,Math.PI*2); ctx.stroke();
      if(tick%8<4){ctx.fillStyle='rgba(255,255,255,.65)'; ctx.beginPath(); ctx.arc(sx+8,sy+8,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(sx+TS-8,sy+TS-8,2,0,Math.PI*2); ctx.fill();}
      if(mC===15&&mR===4){ctx.fillStyle='rgba(173,216,230,.8)'; for(let fi=0;fi<3;fi++){ctx.fillStyle=`rgba(135,206,235,${.5+.3*Math.sin(tick*.15+fi)})`;ctx.fillRect(sx+TS/2-2+fi,sy+1+fi*3,3,8);}}
      ctx.strokeStyle='#546e7a'; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      break;}
    case 'B':{ // Puerta Centro Villa Alemana
      const gb=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#2563eb'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle=`rgba(147,197,253,${.6+.3*gb})`; ctx.lineWidth=2;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.7+.3*gb; ctx.font='13px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🏘️',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle='rgba(147,197,253,.9)'; ctx.font='bold 5px sans-serif'; ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('CENTRO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'Z':{ // Portón al BUINZOO
      const gz=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      // arco de entrada de madera
      ctx.fillStyle='#7c4a1e'; ctx.fillRect(sx+TS*.12,sy+TS*.18,TS*.12,TS*.74);
      ctx.fillRect(sx+TS*.76,sy+TS*.18,TS*.12,TS*.74);
      ctx.fillStyle='#8a5a2b'; ctx.fillRect(sx+TS*.08,sy+TS*.1,TS*.84,TS*.14);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.08,sy+TS*.1,TS*.84,TS*.04);
      // letrero
      ctx.globalAlpha=.85+.15*gz; ctx.font='12px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🦁',sx+TS/2,sy+TS*.56); ctx.globalAlpha=1;
      ctx.shadowColor=`rgba(251,191,36,${.4+.4*gz})`; ctx.shadowBlur=4;
      ctx.fillStyle='#fde68a'; ctx.font='bold 4px sans-serif'; ctx.textBaseline='top';
      ctx.fillText('BUINZOO',sx+TS/2,sy+TS*.12); ctx.shadowBlur=0;
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'R':{ // JEFE - Prof. Alex
      ctx.fillStyle='#0d0010'; ctx.fillRect(sx,sy,TS,TS);
      const rp=.45+.55*Math.sin(tick*.12);
      // Arena piso
      ctx.fillStyle=`rgba(80,0,120,${rp*.4})`; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      // Borde eléctrico morado
      ctx.strokeStyle=`rgba(168,85,247,${rp})`; ctx.lineWidth=2.5;
      ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle=`rgba(232,121,249,${rp*.6})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+4,sy+4,TS-8,TS-8);
      // Guitarra animada
      ctx.globalAlpha=rp; ctx.font='18px serif';
      ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎸',sx+TS/2,sy+TS/2);
      ctx.globalAlpha=1; ctx.textAlign='left';
      // Label JEFE pulsante
      ctx.fillStyle=`rgba(232,121,249,${rp})`; ctx.font='bold 5.5px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('★JEFE★',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 's':{ // arbusto
      ctx.fillStyle='#388e3c'; ctx.fillRect(sx,sy,TS,TS);
      const sb=.82+.15*Math.sin(tick*.07+mC*.5);
      ctx.fillStyle=`rgba(27,94,32,${.88*sb})`; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2+3,13,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=`rgba(46,125,50,${.75*sb})`; ctx.beginPath(); ctx.arc(sx+TS/2-5,sy+TS/2,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=`rgba(67,160,71,${.65*sb})`; ctx.beginPath(); ctx.arc(sx+TS/2+4,sy+TS/2-3,9,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(232,245,233,.3)'; ctx.beginPath(); ctx.arc(sx+TS/2-2,sy+TS/2-5,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#1b5e20'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2+3,13,0,Math.PI*2); ctx.stroke();
      break;}
    case 'k':{ // puesto feria artesanal
      ctx.fillStyle='#d7ccc8'; ctx.fillRect(sx,sy,TS,TS);
      const aw=[['#ef4444','#fcd34d'],['#3b82f6','#bfdbfe'],['#a855f7','#f3e8ff'],['#16a34a','#bbf7d0']];
      const [c1,c2]=aw[Math.floor(mC/3)%4];
      // Toldo con rayas
      ctx.fillStyle=c1; ctx.fillRect(sx,sy+2,TS,TS/2-4);
      ctx.fillStyle=c2;
      for(let i=0;i<4;i++) ctx.fillRect(sx+i*10,sy+2,5,TS/2-4);
      // Mostrador
      ctx.fillStyle='#8d6e63'; ctx.fillRect(sx+2,sy+TS/2,TS-4,TS/2-4);
      ctx.fillStyle='#a1887f'; ctx.fillRect(sx+2,sy+TS/2,TS-4,4);
      // Items en venta
      ctx.fillStyle='#fcd34d'; ctx.beginPath(); ctx.arc(sx+8,sy+TS-7,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f87171'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS-7,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#34d399'; ctx.beginPath(); ctx.arc(sx+TS-8,sy+TS-7,3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.75)'; ctx.font='bold 5.5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('FERIA',sx+TS/2,sy+TS/2-3); ctx.textAlign='left';
      break;}
    case 'A':{ // escenario artístico
      ctx.fillStyle='#795548'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#a1887f'; ctx.fillRect(sx+2,sy+6,TS-4,TS-10);
      ctx.fillStyle='#bcaaa4'; ctx.fillRect(sx+2,sy+6,TS-4,4); // borde frontal
      ctx.fillStyle='#6d4c41'; ctx.fillRect(sx+2,sy+TS-5,TS-4,5); // borde trasero
      // Luces del escenario animadas
      const lp=.55+.45*Math.sin(tick*.14);
      ctx.fillStyle=`rgba(253,224,68,${lp})`; ctx.beginPath(); ctx.arc(sx+8,sy+8,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=`rgba(252,165,165,${lp+.1})`; ctx.beginPath(); ctx.arc(sx+TS/2,sy+8,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=`rgba(147,197,253,${lp})`; ctx.beginPath(); ctx.arc(sx+TS-8,sy+8,3.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.7)'; ctx.font='bold 5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('STAGE',sx+TS/2,sy+TS/2+4); ctx.textAlign='left';
      break;}
    case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '@':{ // Farmacia
      const pp=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#0f2027'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#065f46'; ctx.fillRect(sx+2,sy+4,TS-4,TS-6);
      // Cruz verde
      ctx.fillStyle=`rgba(16,185,129,${.8+.2*pp})`;
      ctx.fillRect(sx+TS/2-2,sy+6,4,TS-10);
      ctx.fillRect(sx+4,sy+TS/2-2,TS-8,4);
      ctx.shadowColor=`rgba(16,185,129,.6)`; ctx.shadowBlur=6+5*pp;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#6ee7b7';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FARM',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.shadowBlur=0;
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle='#388e3c'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawPlazaOverlays(){
  // Occasional grass shimmer for tall grass tiles
  if(tick%4===0){
    const map=MAPS.plaza; if(!map) return;
    for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
      if(MAPS.plaza[r+camera.y]?.[c+camera.x]==='g'&&Math.random()<.02){
        ctx.fillStyle='rgba(255,255,255,.15)'; ctx.fillRect(c*TS,r*TS,TS,TS);
      }
    }
  }
}

// ═══ PLAZA BELÉN — ENCUENTROS Y RECLUTAMIENTO ═══
function triggerPlazaEvent(){
  if(STATE!=='exploring') return; STATE='transition';
  const unfound=PARTY_MEMBERS.filter(m=>!m.found);
  const doRecruit=unfound.length>0&&Math.random()<.10;
  EL.encFlash.classList.remove('flashing'); void EL.encFlash.offsetWidth; EL.encFlash.classList.add('flashing');
  EL.encFlash.addEventListener('animationend',()=>{
    EL.encFlash.classList.remove('flashing');
    if(doRecruit){
      const member=unfound[Math.floor(Math.random()*unfound.length)];
      STATE='dialog';
      showDialog(`${member.emoji} ¡${member.name} apareció!\n\nQuiere unirse a tu equipo.\n\n⚡ Habilidad: ${member.ability}\n→ ${member.abDesc}\n\n¿Aceptas?`,[
        {text:`¡Sí, súmate! 🎉`,action:()=>recruitMember(member)},
        {text:'Ahora no',action:()=>{}}
      ]);
    } else {
      const tmpl=PLAZA_ENEMIES[Math.floor(Math.random()*PLAZA_ENEMIES.length)];
      battle={enemy:normalizeEnemy(tmpl),busy:false,atkDebuff:0};
      openBattle();
    }
  },{once:true});
}

function recruitMember(member){
  if(party.length>=3){showDialog(`¡Equipo lleno! (3/3)\n${member.name} no pudo unirse.`);return;}
  member.found=true; member.inTeam=true; party.push(member);
  showDialog(`¡${member.name} se unió al equipo! 🎉\n\n${member.emoji} → ${member.ability}\n${member.abDesc}\n\nEn batalla usa 👥 LLAMAR EQUIPO\npara llamarlo a luchar contigo.`);
}

function openBParty(){
  if(!battle||battle.busy) return; battle.busy=true; hideBact();
  const list=_('b-party-list'); list.innerHTML='';
  PARTY_MEMBERS.filter(m=>m.inTeam).forEach(m=>{
    const used=m.usedThisBattle;
    const row=document.createElement('div'); row.className='bpr';
    row.innerHTML=`<div class="bpr-info"><div class="bpr-name">${m.emoji} ${m.name}${used?' 💤':''}</div><div class="bpr-ab">⚡ ${m.ability}: ${m.abDesc}</div></div><button class="bpr-btn" ${used?'disabled':''} onclick="usePartyMember('${m.id}')">Llamar</button>`;
    list.appendChild(row);
  });
  _('b-party-panel').style.display='block';
}
function hideBParty(){ _('b-party-panel').style.display='none'; battle.busy=false; showBact(); }

function usePartyMember(mid){
  const m=PARTY_MEMBERS.find(p=>p.id===mid); if(!m||m.usedThisBattle) return;
  m.usedThisBattle=true; _('b-party-panel').style.display='none';
  const e=battle.enemy; const rng2=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  let dmg=0,extra='';
  if(mid==='renata'){ dmg=25+rng2(0,8); const h=30; stats.hp=Math.min(stats.maxHp,stats.hp+h); extra=`\n💛 +${h} HP para el equipo!`; }
  else if(mid==='isi'){ dmg=30+rng2(0,10); battle.atkDebuff=(battle.atkDebuff||0)+5; extra=`\n💙 ¡ATK enemigo -5 por este turno!`; }
  else if(mid==='este'){ dmg=28+rng2(0,8); if(stats.status){const st=stats.status; stats.status=null; stats.statusTurns=0; extra=`\n💻 ¡${st} curado!`;}else extra=`\n💻 ¡Sistema optimizado!`; }
  e.hp=Math.max(0,e.hp-dmg); hitAnim('b-es'); dmgPop(dmg,true,'#a78bfa'); syncBE(); syncBP(); syncUI();
  const msg=`${m.emoji} ¡${m.name} usa ${m.ability}!\n¡${e.name} recibe ${dmg}!${extra}`;
  if(e.hp<=0){typeMsg(msg+`\n\n¡${e.name} fue vencido!`,()=>battleWin());return;}
  typeMsg(msg,()=>enemyTurn());
}


function drawDayNight(){
  const {hour,min}=getGameTime();
  const frac=hour+min/60;
  let dark=0, rr=0,gg=0,bb=20;
  // Noche profunda
  if(hour>=22||hour<4){dark=.82;}
  // Anochecer
  else if(hour>=21){dark=.82*(min/60); rr=20;gg=5;bb=15;}
  else if(hour>=19){dark=.18*(min/60); rr=35;gg=15;bb=5;}
  // Amanecer
  else if(hour<5){dark=.82*(1-(min/60)); rr=20;gg=5;bb=15;}
  else if(hour<7){dark=.18*(1-(min/60)); rr=35;gg=15;bb=5;}
  if(dark<=0) return;
  const hasL=inventory.some(i=>i.id==='linterna');
  const px=(player.x-camera.x)*TS+TS/2, py=(player.y-camera.y)*TS+TS/2;
  if(hasL){
    // Zona iluminada por linterna
    const radius=90+5*Math.sin(tick*.08);
    const lg=ctx.createRadialGradient(px,py,15,px,py,radius);
    lg.addColorStop(0,`rgba(${rr},${gg},${bb},0)`);
    lg.addColorStop(.35,`rgba(${rr},${gg},${bb},${dark*.12})`);
    lg.addColorStop(.65,`rgba(${rr},${gg},${bb},${dark*.55})`);
    lg.addColorStop(1,`rgba(${rr},${gg},${bb},${dark})`);
    ctx.fillStyle=lg;
  } else {
    ctx.fillStyle=`rgba(${rr},${gg},${bb},${dark})`;
  }
  ctx.fillRect(0,0,canvas.width,canvas.height);
  // Parpadeo de estrellas en noche
  if(dark>.5&&Math.random()<.06){
    const sx2=Math.random()*canvas.width, sy2=Math.random()*canvas.height;
    ctx.fillStyle=`rgba(255,255,255,${Math.random()*.6})`;
    ctx.beginPath(); ctx.arc(sx2,sy2,Math.random()*.8+.2,0,Math.PI*2); ctx.fill();
  }
  // Luz de linterna visible
  if(hasL){
    ctx.fillStyle=`rgba(255,220,100,${.06+.02*Math.sin(tick*.1)})`;
    ctx.beginPath(); ctx.arc(px,py,18,0,Math.PI*2); ctx.fill();
  }
}
function drawDoorLabels(){
  const map=MAPS[currentMap]; if(!map) return;
  ctx.save();
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const mR=r+camera.y,mC=c+camera.x,t=map[mR]?.[mC];
    if(t!=='E'&&t!=='Z'&&t!=='N'&&t!=='H'&&t!=='S'&&t!=='8'&&t!=='9') continue;
    const sx=c*TS,sy=r*TS;
    let dest='',color='#ffd700';
    if(t==='Z'){dest=currentMap==='plaza'?'ZOO':'CONT';color=currentMap==='plaza'?'#fbbf24':'#c084fc';}
    else if(t==='N'){dest='SECRETA';color='#f59e0b';}
    else if(currentMap==='pasillo'){
      if(mR===0){dest='CANCHA';color='#4ade80';}
      else if(mC===0){dest='PLAZA';color='#86efac';}
      else if(mC===19){dest='BIBLIO';color='#60a5fa';}
    } else {
      const ic={cancha:'PASILLO',biblioteca:'PASILLO',sala_vela:'PASILLO',sala_cont:'PASILLO',plaza:'PASILLO'};
      dest=ic[currentMap]||'SALIDA'; color='#fcd34d';
    }
    if(!dest) continue;
    // ── Grande, centrada y visible ──
    ctx.font='bold 8.5px Arial';
    const tw=ctx.measureText(dest).width;
    const bx=sx+(TS-tw-10)/2, by=sy+(TS-16)/2+1;
    ctx.fillStyle='rgba(0,0,0,.88)'; ctx.fillRect(bx-1,by,tw+12,14);
    ctx.strokeStyle=color; ctx.lineWidth=1.8; ctx.strokeRect(bx-1,by,tw+12,14);
    ctx.fillStyle=color; ctx.textBaseline='middle'; ctx.textAlign='center';
    ctx.fillText(dest,sx+TS/2,by+7);
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  }
  ctx.restore();
}


// ═══ ESTACIÓN VILLA ALEMANA — DIBUJO (Metro Valparaíso / Merval) ═══
// Paleta Merval: verde #15803d, naranja #ea580c, gris andén #e2e8f0
function drawVillaTile(t,sx,sy,mR,mC){
  if(medTerrain(t,sx,sy,mC,mR)) return;
  switch(t){
    case '#':{ // Muros estación — verde Merval oscuro
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#15803d'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle='rgba(74,222,128,.2)'; ctx.lineWidth=.8; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      break;}
    case 'V':{ // Ventana de la estación
      ctx.fillStyle='#15803d'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.fillStyle='rgba(147,197,253,.4)'; ctx.fillRect(sx+6,sy+6,TS-12,TS-12);
      // Reflejo ventana
      ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(sx+6,sy+6,5,5);
      ctx.strokeStyle='#6b7280'; ctx.lineWidth=1.5; ctx.strokeRect(sx+4,sy+4,TS-8,TS-8);
      break;}
    case 'W':{ // Letrero estación — nombre varía según mapa
      const _stCfg={
        estacion_villa: {bg:'#15803d',band:'#ea580c',lines:['VILLA','ALEMANA']},
        estacion_quilpue:{bg:'#1d4ed8',band:'#f59e0b',lines:['QUILPUÉ','']},
        estacion_vina:  {bg:'#0e7490',band:'#22d3ee',lines:['VIÑA DEL','MAR']},
        estacion_valpo: {bg:'#7c3aed',band:'#f97316',lines:['VALPA-','RAÍSO']},
      }[currentMap]||{bg:'#15803d',band:'#ea580c',lines:['ESTACIÓN','']};
      ctx.fillStyle=_stCfg.bg; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=_stCfg.band; ctx.fillRect(sx+2,sy+TS/2-8,TS-4,16);
      ctx.fillStyle='white'; ctx.font='bold 4.5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(_stCfg.lines[0],sx+TS/2,sy+TS/2-3);
      if(_stCfg.lines[1]) ctx.fillText(_stCfg.lines[1],sx+TS/2,sy+TS/2+5);
      ctx.textAlign='left'; break;}
    case 'p':{ // Andén / plataforma
      ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle='rgba(0,0,0,.07)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS);
      // Línea amarilla borde andén
      ctx.fillStyle='#fef08a'; ctx.fillRect(sx,sy+TS-5,TS,5);
      ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy+TS-5,TS,5);
      break;}
    case 'E':{ // Salida — destino depende del mapa
      const ge=.5+.5*Math.sin(tick*.09); ctx.fillStyle=`rgba(21,128,61,${.3+.1*ge})`; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle=`rgba(74,222,128,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#bbf7d0';
      const _eLabel={estacion_villa:'SECTOR N.',estacion_quilpue:'VILLA A.',estacion_vina:'VILLA A.',estacion_valpo:'VILLA A.'}[currentMap]||'SALIDA';
      ctx.textBaseline='bottom'; ctx.fillText(_eLabel,sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'r':{ // Rieles
      ctx.fillStyle='#374151'; ctx.fillRect(sx,sy,TS,TS);
      // Durmientes de madera
      ctx.fillStyle='#6b3a2a';
      for(let i=0;i<3;i++) ctx.fillRect(sx+i*14+2,sy+TS*.2,8,TS*.6);
      // Rieles metálicos
      ctx.fillStyle='#9ca3af'; ctx.fillRect(sx,sy+TS*.3,TS,3); ctx.fillRect(sx,sy+TS*.65,TS,3);
      // Tensión eléctrica (brillo)
      ctx.strokeStyle=`rgba(253,224,68,${.2+.1*Math.sin(tick*.15+mC)})`; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(sx,sy+2); ctx.lineTo(sx+TS,sy+2); ctx.stroke();
      break;}
    case 'L':{ // Locomotora MERVAL
      ctx.fillStyle='#374151'; ctx.fillRect(sx,sy,TS,TS); // base riel
      const trainBob=Math.abs(Math.sin(tick*.04))*1;
      // Cuerpo tren — verde Merval
      ctx.fillStyle='#15803d'; ctx.fillRect(sx+1,sy+6+trainBob,TS-2,TS-14);
      // Franja naranja superior (Merval)
      ctx.fillStyle='#ea580c'; ctx.fillRect(sx+1,sy+6+trainBob,TS-2,4);
      // Franja blanca inferior
      ctx.fillStyle='#f1f5f9'; ctx.fillRect(sx+1,sy+TS-10+trainBob,TS-2,4);
      // Ventanas (azul celeste)
      ctx.fillStyle='#bfdbfe'; ctx.fillRect(sx+3,sy+11+trainBob,6,5);
      ctx.fillRect(sx+TS-9,sy+11+trainBob,6,5);
      // Pantógrafo
      ctx.strokeStyle='#6b7280'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(sx+8,sy+6+trainBob); ctx.lineTo(sx+TS/2,sy+2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+TS-8,sy+6+trainBob); ctx.lineTo(sx+TS/2,sy+2); ctx.stroke();
      // Ruedas
      ctx.fillStyle='#1f2937'; ctx.beginPath(); ctx.arc(sx+8,sy+TS-5+trainBob,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx+TS-8,sy+TS-5+trainBob,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#9ca3af'; ctx.beginPath(); ctx.arc(sx+8,sy+TS-5+trainBob,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx+TS-8,sy+TS-5+trainBob,2,0,Math.PI*2); ctx.fill();
      break;}
    case 'M':{ // Molino histórico
      ctx.fillStyle='#d1fae5'; ctx.fillRect(sx,sy,TS,TS);
      // Torre del molino
      ctx.fillStyle='#d1d5db'; ctx.fillRect(sx+TS/2-6,sy+TS/3,12,TS*2/3);
      ctx.fillStyle='#9ca3af'; ctx.fillRect(sx+TS/2-8,sy+TS/3,16,5);
      // Aspas rotando
      const angM=tick*0.025;
      ctx.save(); ctx.translate(sx+TS/2,sy+TS/3+2);
      ctx.rotate(angM);
      ctx.fillStyle='#78716c';
      for(let i=0;i<4;i++){
        ctx.save(); ctx.rotate(i*Math.PI/2);
        ctx.fillRect(-2,-20,4,20); ctx.restore();
      }
      ctx.restore();
      // Centro aspa
      ctx.fillStyle='#44403c'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/3+2,4,0,Math.PI*2); ctx.fill();
      // Puerta molino
      ctx.fillStyle='#78350f'; ctx.fillRect(sx+TS/2-3,sy+TS-8,6,8);
      break;}
    default: ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawVillaOverlays(){
  // Efecto de neblina (tenue)
  if(tick%3===0){
    const grd=ctx.createLinearGradient(0,0,canvas.width,0);
    grd.addColorStop(0,'rgba(186,230,253,.04)');
    grd.addColorStop(.5,'rgba(186,230,253,.02)');
    grd.addColorStop(1,'rgba(186,230,253,.04)');
    ctx.fillStyle=grd; ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  // NPCs / hitos por estación
  const _stNPC={
    estacion_villa: {col:14,row:5,emoji:'🚉',label:'INSPECTOR',color:'#4ade80'},
    estacion_quilpue:{col:14,row:5,emoji:'🏫',label:'VECINO',   color:'#fbbf24'},
    estacion_vina:  {col:14,row:5,emoji:'🌊',label:'TURISTA',  color:'#38bdf8'},
    estacion_valpo: {col:14,row:5,emoji:'🎨',label:'ARTISTA',  color:'#c084fc'},
  }[currentMap];
  if(_stNPC){
    const sx=(_stNPC.col-camera.x)*TS, sy=(_stNPC.row-camera.y)*TS;
    if(sx>=0&&sy>=0&&sx<canvas.width&&sy<canvas.height){
      drawNPC(sx,sy,_stNPC.emoji,_stNPC.color,_stNPC.label);
    }
  }
  // Hint de abordaje al bajar al andén
  if(STATION_MAPS_SET.has(currentMap)&&player.y===6){
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(2,canvas.height-22,220,18);
    ctx.fillStyle='#6ee7b7'; ctx.font='bold 6px monospace';
    ctx.fillText('🚇 [A/OK] Abordar el tren MERVAL',6,canvas.height-10);
  }
}

// ═══ GFX — capas globales de post-proceso ═══

// Capa 1: ambient occlusion + light shafts — se llama justo DESPUÉS del loop de tiles
function drawGFX(){
  const map=MAPS[currentMap];
  if(!map) return;
  // ── Ambient occlusion: sombra en la base de cada muro ──
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const mR=r+camera.y, mC=c+camera.x, t=map[mR]?.[mC];
    if(t==='#'||t==='1'||t==='2'||t==='3'){
      const below=map[mR+1]?.[mC];
      if(below&&below!=='#'&&below!=='1'&&below!=='2'){
        const aoG=ctx.createLinearGradient(c*TS,(r+1)*TS,c*TS,(r+1)*TS+10);
        aoG.addColorStop(0,'rgba(0,0,0,.42)'); aoG.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=aoG; ctx.fillRect(c*TS,(r+1)*TS,TS,10);
      }
      const right=map[mR]?.[mC+1];
      if(right&&right!=='#'){
        const aoG=ctx.createLinearGradient((c+1)*TS,r*TS,(c+1)*TS+8,r*TS);
        aoG.addColorStop(0,'rgba(0,0,0,.28)'); aoG.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=aoG; ctx.fillRect((c+1)*TS,r*TS,8,TS);
      }
    }
  }
  // ── Light shafts en puertas (halo cálido) ──
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const mR=r+camera.y, mC=c+camera.x, t=map[mR]?.[mC];
    let lCol=null;
    if(t==='E') lCol='rgba(253,190,40,';
    else if(t==='N') lCol='rgba(139,92,246,';
    else if(t==='V') lCol='rgba(74,222,128,';
    if(lCol){
      const ex=c*TS+TS/2, ey=r*TS+TS/2;
      const glow=ctx.createRadialGradient(ex,ey,3,ex,ey,TS*.95);
      const pulse=.06+.03*Math.sin(tick*.08+c+r);
      glow.addColorStop(0,lCol+(pulse+.04)+')');
      glow.addColorStop(.55,lCol+pulse+')');
      glow.addColorStop(1,lCol+'0)');
      ctx.fillStyle=glow; ctx.fillRect(c*TS-2,r*TS-2,TS+4,TS+4);
    }
  }
}

// Capa 2: vignette + scanlines + depth haze — se llama al FINAL, encima de todo
function drawPostFX(){
  const W=canvas.width, H=canvas.height;
  // Vignette
  const vig=ctx.createRadialGradient(W*.5,H*.52,H*.18,W*.5,H*.52,H*.82);
  vig.addColorStop(0,'rgba(0,0,0,0)');
  vig.addColorStop(.65,'rgba(0,0,0,.04)');
  vig.addColorStop(1,'rgba(0,0,0,.42)');
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
  // Profundidad superior (perspectiva top-down)
  const topFog=ctx.createLinearGradient(0,0,0,TS*1.2);
  topFog.addColorStop(0,'rgba(0,0,0,.2)'); topFog.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=topFog; ctx.fillRect(0,0,W,TS*1.2);
  // Scanlines muy sutiles (retro CRT feel)
  ctx.fillStyle='rgba(0,0,0,.035)';
  for(let y=0;y<H;y+=2) ctx.fillRect(0,y,W,1);
  // Borde interior biselado
  ctx.strokeStyle='rgba(255,255,255,.04)'; ctx.lineWidth=1.5;
  ctx.strokeRect(1,1,W-2,H-2);
  ctx.lineWidth=1;
}

// ═══ SALÓN DE TROFEOS — DIBUJO (mármol blanco + suelo dorado) ═══
function drawSalonTile(t,sx,sy,mR,mC){
  const gp=.5+.5*Math.sin(tick*.07+mC*.35+mR*.25);
  switch(t){
    case '#':{
      const mg=ctx.createLinearGradient(sx,sy,sx+TS,sy+TS);
      mg.addColorStop(0,'#f8fafc'); mg.addColorStop(.4,'#f1f5f9'); mg.addColorStop(1,'#e2e8f0');
      ctx.fillStyle=mg; ctx.fillRect(sx,sy,TS,TS);
      ctx.save();
      ctx.strokeStyle=`rgba(180,140,40,${.18+.07*Math.sin(tick*.03+mC+mR)})`; ctx.lineWidth=.7;
      ctx.beginPath(); ctx.moveTo(sx,sy+TS*.3); ctx.bezierCurveTo(sx+TS*.25,sy+TS*.1,sx+TS*.6,sy+TS*.6,sx+TS,sy+TS*.5); ctx.stroke();
      ctx.strokeStyle=`rgba(200,160,50,${.1+.05*gp})`; ctx.lineWidth=.4;
      ctx.beginPath(); ctx.moveTo(sx+TS*.1,sy); ctx.bezierCurveTo(sx+TS*.4,sy+TS*.3,sx+TS*.7,sy+TS*.2,sx+TS,sy+TS*.8); ctx.stroke();
      ctx.restore();
      if(mR===0){
        const fg=ctx.createLinearGradient(sx,sy+TS-6,sx,sy+TS);
        fg.addColorStop(0,'#fbbf24'); fg.addColorStop(1,'#d97706');
        ctx.fillStyle=fg; ctx.fillRect(sx,sy+TS-6,TS,6);
        ctx.fillStyle=`rgba(255,240,100,${.4+.3*gp})`; ctx.fillRect(sx,sy+TS-7,TS,1);
        if(mC%3===0){
          ctx.fillStyle=['#b91c1c','#1d4ed8','#15803d'][Math.floor(mC/3)%3];
          ctx.fillRect(sx+TS/2-3,sy,6,TS*.55);
          ctx.beginPath(); ctx.moveTo(sx+TS/2-3,sy+TS*.55); ctx.lineTo(sx+TS/2,sy+TS*.73); ctx.lineTo(sx+TS/2+3,sy+TS*.55); ctx.fill();
          ctx.fillStyle='rgba(255,255,255,.8)'; ctx.font='5px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText('★',sx+TS/2,sy+TS*.28); ctx.textAlign='left';
        }
      }
      ctx.strokeStyle='rgba(148,163,184,.3)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); break;}
    case '.':{
      const alt=(mR+mC)%2===0;
      const fg=ctx.createLinearGradient(sx,sy,sx+TS,sy+TS);
      if(alt){fg.addColorStop(0,'#fbbf24');fg.addColorStop(.5,'#fcd34d');fg.addColorStop(1,'#f59e0b');}
      else{fg.addColorStop(0,'#f59e0b');fg.addColorStop(.5,'#fbbf24');fg.addColorStop(1,'#d97706');}
      ctx.fillStyle=fg; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(255,255,220,${.06+.04*Math.sin(tick*.05+mC*.4+mR*.3)})`; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle='rgba(120,80,0,.12)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS); break;}
    case 'C':{
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx,sy,TS,TS);
      const cg2=ctx.createLinearGradient(sx+TS/2-5,sy,sx+TS/2+5,sy);
      cg2.addColorStop(0,'#d97706'); cg2.addColorStop(.3,'#fcd34d'); cg2.addColorStop(.7,'#fbbf24'); cg2.addColorStop(1,'#b45309');
      ctx.fillStyle=cg2; ctx.fillRect(sx+TS/2-5,sy+5,10,TS-10);
      ctx.strokeStyle='rgba(100,60,0,.25)'; ctx.lineWidth=.6;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(sx+TS/2-4+i*2.7,sy+8);ctx.lineTo(sx+TS/2-4+i*2.7,sy+TS-8);ctx.stroke();}
      const capG=ctx.createLinearGradient(sx+TS/2-8,sy,sx+TS/2+8,sy+6);
      capG.addColorStop(0,'#fbbf24'); capG.addColorStop(1,'#f59e0b');
      ctx.fillStyle=capG; ctx.fillRect(sx+TS/2-8,sy+2,16,6); ctx.fillRect(sx+TS/2-6,sy+1,12,3);
      ctx.fillStyle=capG; ctx.fillRect(sx+TS/2-8,sy+TS-8,16,6); ctx.fillRect(sx+TS/2-6,sy+TS-4,12,3);
      ctx.shadowColor=`rgba(251,191,36,${.4+.3*gp})`; ctx.shadowBlur=10+6*gp;
      ctx.strokeStyle=`rgba(253,212,66,${.3+.2*gp})`; ctx.lineWidth=1; ctx.strokeRect(sx+TS/2-5,sy+5,10,TS-10);
      ctx.shadowBlur=0; ctx.shadowColor='transparent'; break;}
    case '1': case '2':{
      const alt2=(mR+mC)%2===0; ctx.fillStyle=alt2?'#fbbf24':'#fcd34d'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#f1f5f9'; ctx.fillRect(sx+3,sy+TS-11,TS-6,11);
      ctx.strokeStyle='rgba(180,140,40,.4)'; ctx.lineWidth=.8; ctx.strokeRect(sx+3,sy+TS-11,TS-6,11);
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+3,sy+TS-12,TS-6,2);
      ctx.save(); ctx.shadowColor=`rgba(251,191,36,${.6+.35*gp})`; ctx.shadowBlur=12+8*gp;
      const Y0=sy+3,Yb=sy+TS-12;
      const cupG=ctx.createLinearGradient(sx+4,Y0,sx+TS-4,Yb);
      cupG.addColorStop(0,'#d97706'); cupG.addColorStop(.2,'#fef08a'); cupG.addColorStop(.5,'#fcd34d'); cupG.addColorStop(.8,'#f59e0b'); cupG.addColorStop(1,'#b45309');
      ctx.fillStyle=cupG;
      ctx.beginPath(); ctx.moveTo(sx+7,Yb); ctx.bezierCurveTo(sx+5,Yb-8,sx+5,Y0+8,sx+TS/2-8,Y0+5); ctx.lineTo(sx+TS/2+8,Y0+5); ctx.bezierCurveTo(sx+TS-5,Y0+8,sx+TS-5,Yb-8,sx+TS-7,Yb); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,230,.3)';
      ctx.beginPath(); ctx.moveTo(sx+9,Yb-2); ctx.bezierCurveTo(sx+8,Yb-10,sx+8,Y0+10,sx+TS/2-5,Y0+7); ctx.lineTo(sx+TS/2-1,Y0+7); ctx.bezierCurveTo(sx+TS/2,Y0+10,sx+TS/2,Yb-10,sx+11,Yb-2); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#fcd34d'; ctx.fillRect(sx+TS/2-3,Y0+5,6,8);
      ctx.strokeStyle='#f59e0b'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(sx+6,sy+TS*.4,5.5,Math.PI*.45,Math.PI*1.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(sx+TS-6,sy+TS*.4,5.5,-Math.PI*.55,Math.PI*.55); ctx.stroke();
      ctx.restore();
      const sp=.7+.3*Math.sin(tick*.13+(t==='1'?0:2.2));
      ctx.save(); ctx.shadowColor=`rgba(255,240,100,${sp})`; ctx.shadowBlur=10;
      ctx.globalAlpha=sp; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillStyle='#fef08a'; ctx.fillText('★',sx+TS/2,Y0+1); ctx.globalAlpha=1; ctx.restore();
      ctx.fillStyle='#78350f'; ctx.font='bold 4.5px sans-serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(t==='1'?'CAMPEÓN':'VIKINGOS',sx+TS/2,sy+TS-7);
      ctx.fillStyle='#b45309'; ctx.font='bold 4px sans-serif'; ctx.fillText(t==='1'?'2025':'2026',sx+TS/2,sy+TS-3);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.shadowBlur=0; ctx.shadowColor='transparent'; break;}
    case 'E':{
      const ge=.5+.5*Math.sin(tick*.09);
      const eg=ctx.createLinearGradient(sx,sy,sx,sy+TS); eg.addColorStop(0,'#fbbf24'); eg.addColorStop(1,'#d97706');
      ctx.fillStyle=eg; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle=`rgba(255,240,100,${.8+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.8+.2*ge; ctx.font='13px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle='rgba(80,40,0,.85)'; ctx.font='bold 3px sans-serif'; ctx.textBaseline='bottom'; ctx.textAlign='center';
      ctx.fillText('PLAZA',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=`${mc}`;  ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2-.5); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'F':{ // Forja Metalúrgica
      const fp=.5+.5*Math.sin(tick*.08);
      const fr=.4+.4*Math.sin(tick*.15+mC);
      // Cuerpo del horno
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#292524'; ctx.fillRect(sx+2,sy+3,TS-4,TS-5);
      // Boca del horno (naranja brillante)
      ctx.fillStyle=`rgba(249,115,22,${.7+.3*fr})`; ctx.fillRect(sx+4,sy+TS*.4,TS-8,TS*.35);
      // Llamas internas
      ctx.shadowColor=`rgba(251,146,60,.8)`; ctx.shadowBlur=8+6*fp;
      ctx.fillStyle=`rgba(254,215,170,${.6+.4*fr})`; ctx.fillRect(sx+6,sy+TS*.45,TS-12,TS*.25);
      ctx.shadowBlur=0;
      // Chimenea
      ctx.fillStyle='#44403c'; ctx.fillRect(sx+TS*.35,sy,5,TS*.3);
      // Humo
      ctx.fillStyle=`rgba(120,113,108,${.3+.2*Math.sin(tick*.06)})`;
      ctx.beginPath(); ctx.arc(sx+TS*.4,sy-4,4+2*fp,0,Math.PI*2); ctx.fill();
      // Yunque
      ctx.fillStyle='#57534e'; ctx.fillRect(sx+TS*.55,sy+TS*.55,TS*.35,TS*.12); ctx.fillRect(sx+TS*.6,sy+TS*.67,TS*.25,TS*.2);
      ctx.fillStyle=`rgba(251,191,36,.9)`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FORJA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle='#fbbf24'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawSalonOverlays(){
  if(tick%2===0){for(let i=0;i<4;i++){if(Math.random()<.12){const px=(Math.random()*canvas.width)|0,py=(Math.random()*canvas.height)|0; ctx.fillStyle=`rgba(253,212,66,${.2+Math.random()*.5})`; ctx.beginPath(); ctx.arc(px,py,Math.random()*2+.4,0,Math.PI*2); ctx.fill();}}}
  [[3,4],[12,4]].forEach(([tc,tr])=>{const tx=(tc-camera.x)*TS+TS/2,ty=(tr-camera.y)*TS+TS/2; if(tx<0||tx>canvas.width||ty<0||ty>canvas.height)return; const h=ctx.createRadialGradient(tx,ty,3,tx,ty,TS*1.1); const hp=.1+.07*Math.sin(tick*.06+(tc===3?0:1.8)); h.addColorStop(0,`rgba(253,212,66,${hp})`); h.addColorStop(1,'rgba(253,212,66,0)'); ctx.fillStyle=h; ctx.fillRect(tx-TS*1.2,ty-TS*1.2,TS*2.4,TS*2.4);});
  [[2,2],[13,2],[2,9],[13,9]].forEach(([cc,cr])=>{const cx2=(cc-camera.x)*TS+TS/2,cy2=(cr-camera.y)*TS+TS/2; if(cx2<0||cx2>canvas.width)return; const ch=ctx.createRadialGradient(cx2,cy2,1,cx2,cy2,TS*.6); const cp=.06+.04*Math.sin(tick*.09+(cc+cr)*.3); ch.addColorStop(0,`rgba(251,191,36,${cp})`); ch.addColorStop(1,'rgba(251,191,36,0)'); ctx.fillStyle=ch; ctx.fillRect(cx2-TS,cy2-TS,TS*2,TS*2);});}
// ═══ SECRETARÍA — DIBUJO RENOVADA ═══
function drawSecretariaTile(t,sx,sy,mR,mC){
  // Oscuridad si luces apagadas
  const lit=secretariaLights;
  switch(t){
    case '#':{
      ctx.fillStyle=lit?'#fce7f3':'#9f1239'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=lit?'#fbcfe8':'#881337'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle=`rgba(236,72,153,${lit?.2:.08})`; ctx.lineWidth=1; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      break;}
    case '.':{
      const a=(mR+mC)%2===0;
      ctx.fillStyle=lit?(a?'#fef9c3':'#fef3c7'):(a?'#1c1c2e':'#16213e');
      ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle='rgba(180,130,30,.06)'; ctx.lineWidth=.4; ctx.strokeRect(sx,sy,TS,TS);
      break;}
    case 'd':{ // Escritorio
      ctx.fillStyle=lit?'#92400e':'#451a03'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=lit?'#b45309':'#78350f'; ctx.fillRect(sx+1,sy+1,TS-2,TS-5);
      ctx.fillStyle=lit?'#d97706':'#92400e'; ctx.fillRect(sx+2,sy+2,TS-4,6);
      ctx.fillStyle=lit?'#fefce8':'#fef3c7'; ctx.fillRect(sx+4,sy+4,TS-10,7);
      ctx.strokeStyle='rgba(80,40,0,.3)'; ctx.lineWidth=.4; ctx.strokeRect(sx+4,sy+4,TS-10,7);
      break;}
    case 'O':{ // Computador
      ctx.fillStyle=lit?'#1e293b':'#0f172a'; ctx.fillRect(sx,sy,TS,TS);
      // Monitor
      ctx.fillStyle='#334155'; ctx.fillRect(sx+3,sy+2,TS-6,TS-10);
      ctx.fillStyle=lit?'#0ea5e9':'#0369a1'; ctx.fillRect(sx+4,sy+3,TS-8,TS-13);
      // Pantalla glow
      const cg=lit?(.4+.2*Math.sin(tick*.08)):.1;
      ctx.fillStyle=`rgba(56,189,248,${cg})`; ctx.fillRect(sx+4,sy+3,TS-8,TS-13);
      // Código en pantalla
      ctx.fillStyle='rgba(125,211,252,.7)'; ctx.font='3px monospace';
      ['SIGE','MINEDUC','CORREO'].forEach((l2,i)=>{ctx.fillText(l2,sx+5,sy+7+i*4);});
      // Base monitor
      ctx.fillStyle='#475569'; ctx.fillRect(sx+TS/2-3,sy+TS-8,6,6);
      ctx.fillRect(sx+TS/2-5,sy+TS-3,10,3);
      break;}
    case 't':{ // Mesa de reuniones
      ctx.fillStyle=lit?'#fef9c3':'#1c1c2e'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=lit?'#92400e':'#451a03'; ctx.fillRect(sx+3,sy+3,TS-6,TS-6);
      ctx.fillStyle=lit?'#b45309':'#78350f'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.strokeStyle=lit?'rgba(217,119,6,.5)':'rgba(120,53,15,.3)'; ctx.lineWidth=1;
      ctx.strokeRect(sx+4,sy+4,TS-8,TS-8);
      break;}
    case 'q':{ // Interruptor de luz
      ctx.fillStyle=lit?'#fef9c3':'#1c1c2e'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del interruptor
      ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx+5,sy+5,TS-10,TS-10);
      ctx.fillStyle='#94a3b8'; ctx.fillRect(sx+6,sy+6,TS-12,TS-12);
      // Switch button
      ctx.fillStyle=lit?'#22c55e':'#ef4444';
      const sw_y = lit ? sy+9 : sy+TS-16;
      ctx.fillRect(sx+9,sw_y,TS-18,8);
      ctx.fillStyle='rgba(255,255,255,.4)'; ctx.fillRect(sx+9,sw_y,TS-18,3);
      // Icono
      ctx.fillStyle=lit?'#166534':'#991b1b'; ctx.font='bold 7px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(lit?'I':'O',sx+TS/2,sw_y+4); ctx.textAlign='left';
      // Glow cuando encendido
      if(lit){ctx.shadowColor='rgba(34,197,94,.5)';ctx.shadowBlur=8;ctx.strokeStyle='rgba(34,197,94,.4)';ctx.lineWidth=1.5;ctx.strokeRect(sx+5,sy+5,TS-10,TS-10);ctx.shadowBlur=0;ctx.shadowColor='transparent';}
      break;}
    case 'p':{ // Cuadro 8-bit San Agustín de Hipona
      // Marco dorado
      ctx.fillStyle='#92400e'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#d97706'; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.fillStyle='#fcd34d'; ctx.fillRect(sx+1,sy+1,TS-2,2);
      // Fondo oscuro del cuadro
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      // Pixel art San Agustín 8-bit
      const P=(x,y,c)=>{if(!c||c==='.')return;ctx.fillStyle=c;ctx.fillRect(sx+2+x*2,sy+2+y*2,2,2);};
      const [W2,F2,R2,G2,B2,H2,Y2]=['#fef9c3','#fcd9b6','#7c3aed','#9ca3af','#fef3c7','#ef4444','#fbbf24'];
      // Mitra (sombrero obispal)
      P(3,0,W2);P(4,0,W2);P(5,0,W2);P(6,0,W2);
      P(2,1,W2);P(3,1,W2);P(4,1,Y2);P(5,1,W2);P(6,1,W2);P(7,1,W2);
      P(2,2,W2);P(3,2,W2);P(4,2,W2);P(5,2,W2);P(6,2,W2);P(7,2,W2);
      // Cruz dorada en mitra
      P(4,0,Y2);P(5,0,Y2);P(4,1,Y2);
      // Cara y barba
      P(3,3,F2);P(4,3,F2);P(5,3,F2);P(6,3,F2);
      P(2,4,F2);P(3,4,'#1e293b');P(4,4,F2);P(5,4,'#1e293b');P(6,4,F2);P(7,4,F2);
      P(2,5,F2);P(3,5,F2);P(4,5,F2);P(5,5,F2);P(6,5,F2);P(7,5,F2);
      P(2,6,G2);P(3,6,G2);P(4,6,F2);P(5,6,G2);P(6,6,G2);P(7,6,G2);
      P(3,7,G2);P(4,7,G2);P(5,7,G2);P(6,7,G2);
      // Cuerpo (ropa obispal morada)
      P(2,8,R2);P(3,8,R2);P(4,8,R2);P(5,8,R2);P(6,8,R2);P(7,8,R2);
      // Libro (crema) en mano izquierda
      P(1,9,R2);P(2,9,R2);P(3,9,B2);P(4,9,B2);P(5,9,R2);P(6,9,R2);P(7,9,R2);P(8,9,R2);
      // Corazón ardiente (símbolo de San Agustín)
      P(1,10,R2);P(2,10,H2);P(3,10,B2);P(4,10,B2);P(5,10,R2);P(6,10,R2);P(7,10,R2);P(8,10,R2);
      P(1,11,R2);P(2,11,R2);P(3,11,R2);P(4,11,R2);P(5,11,R2);P(6,11,R2);P(7,11,R2);P(8,11,R2);
      // Título
      ctx.fillStyle='rgba(252,211,77,.85)'; ctx.font='3.5px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText('S.AGUSTÍN',sx+TS/2,sy+TS);
      ctx.textAlign='left';
      break;}
    case 'f':{ // Francisco
      ctx.fillStyle=lit?'#fef9c3':'#1c1c2e'; ctx.fillRect(sx,sy,TS,TS);
      const fb=Math.abs(Math.sin(tick*.055))*2;
      ctx.fillStyle='#7c3aed'; ctx.fillRect(sx+4,sy+16+fb,TS-8,TS-18);
      ctx.fillStyle='#6d28d9'; ctx.fillRect(sx+4,sy+11+fb,TS-8,6);
      ctx.fillStyle='#fcd9b6'; ctx.fillRect(sx+TS-9,sy+13+fb,5,10);
      ctx.fillStyle='#f0fdf4'; ctx.fillRect(sx+7,sy+10+fb,TS-14,12);
      ctx.fillStyle='#6d28d9'; ctx.fillRect(sx+7,sy+10+fb,4,12); ctx.fillRect(sx+TS-11,sy+10+fb,4,12);
      ctx.fillStyle='#fcd9b6'; ctx.fillRect(sx+TS/2-3,sy+6+fb,6,7);
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+4+fb,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f472b6'; ctx.fillRect(sx+TS/2-7,sy-1+fb,14,7);
      ctx.fillRect(sx+TS/2-8,sy+1+fb,3,5); ctx.fillRect(sx+TS/2+5,sy+1+fb,3,5);
      ctx.fillStyle='#ec4899'; ctx.fillRect(sx+TS/2-6,sy+4+fb,12,2);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx+TS/2-3,sy+3+fb,2,2); ctx.fillRect(sx+TS/2+1,sy+3+fb,2,2);
      ctx.strokeStyle='#be185d'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+6+fb,2.5,.2,Math.PI-.2); ctx.stroke();
      ctx.fillStyle='rgba(249,168,212,.6)';
      ctx.beginPath(); ctx.ellipse(sx+TS/2-5,sy+6+fb,3,1.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx+TS/2+5,sy+6+fb,3,1.5,0,0,Math.PI*2); ctx.fill();
      break;}
    case 'E':{ const ge=.5+.5*Math.sin(tick*.09);
      ctx.fillStyle=`rgba(236,72,153,${.2+.1*ge})`; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle=`rgba(249,168,212,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fce7f3'; ctx.textBaseline='bottom'; ctx.fillText('PASILLO',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=`${mc}`;  ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2-.5); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'z':{ // Mini Laboratorio
      const zp=.5+.5*Math.sin(tick*.09+mC*.2);
      const labColors={biologia:'#22c55e',secretaria:'#f59e0b',sala_cont:'#60a5fa',biblioteca:'#a78bfa'};
      const zc=labColors[currentMap]||'#818cf8';
      // Mesa de trabajo
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#334155'; ctx.fillRect(sx+1,sy+4,TS-2,TS-6);
      // Patas de mesa
      ctx.fillStyle='#475569'; ctx.fillRect(sx+2,sy+TS-5,3,5); ctx.fillRect(sx+TS-5,sy+TS-5,3,5);
      // Superficie brillante
      ctx.fillStyle=`rgba(${zc==='#22c55e'?'34,197,94':zc==='#f59e0b'?'245,158,11':zc==='#60a5fa'?'96,165,250':'167,139,250'},.15)`; 
      ctx.fillRect(sx+1,sy+4,TS-2,4);
      // Equipamiento lab (beaker + screen)
      ctx.shadowColor=zc; ctx.shadowBlur=6+4*zp;
      ctx.globalAlpha=.8+.2*zp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('⚗️',sx+TS*.35,sy+TS*.52); 
      ctx.font='7px serif'; ctx.fillText('🔬',sx+TS*.7,sy+TS*.52);
      ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.5+.3*zp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center'; ctx.fillText('LAB',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle=lit?'#fef9c3':'#1c1c2e'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawSecretariaOverlays(){
  if(!secretariaLights){
    ctx.fillStyle='rgba(0,0,0,.72)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // Luz tenue desde el interruptor
    const qx=(1-camera.x)*TS+TS/2, qy=(6-camera.y)*TS+TS/2;
    const gl=ctx.createRadialGradient(qx,qy,4,qx,qy,TS*2.2);
    gl.addColorStop(0,'rgba(255,200,80,.18)'); gl.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gl; ctx.fillRect(0,0,canvas.width,canvas.height);
    // Brillo pantalla computador
    const ox=(4-camera.x)*TS+TS/2, oy=(2-camera.y)*TS+TS/2;
    const cl=ctx.createRadialGradient(ox,oy,2,ox,oy,TS*1.2);
    cl.addColorStop(0,'rgba(14,165,233,.15)'); cl.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=cl; ctx.fillRect(0,0,canvas.width,canvas.height);
  }
  // Halo rosado de Francisco
  const fx=(3-camera.x)*TS+TS/2, fy=(6-camera.y)*TS+TS/2;
  if(fx>=0&&fx<canvas.width){
    const h=ctx.createRadialGradient(fx,fy,3,fx,fy,TS*.8);
    const hp=.06+.04*Math.sin(tick*.07);
    h.addColorStop(0,`rgba(244,114,182,${hp})`); h.addColorStop(1,'rgba(244,114,182,0)');
    ctx.fillStyle=h; ctx.fillRect(fx-TS,fy-TS,TS*2,TS*2);
  }
}



// ═══ CENTRO VILLA ALEMANA ═══
function drawCentroTile(t,sx,sy,mR,mC){
  if(medTerrain(t,sx,sy,mC,mR)) return;
  const gp=.5+.5*Math.sin(tick*.06+mC*.3+mR*.2);
  switch(t){
    case '#':{ // Edificio genérico
      ctx.fillStyle='#64748b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#94a3b8'; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      ctx.strokeStyle='rgba(0,0,0,.12)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS);
      break;}
    case 'B':{ // Edificio con ventanas
      ctx.fillStyle='#475569'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#64748b'; ctx.fillRect(sx+1,sy+1,TS-2,TS*2/3);
      ctx.fillStyle='#bfdbfe'; ctx.fillRect(sx+3,sy+3,7,6); ctx.fillRect(sx+TS-10,sy+3,7,6);
      ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(sx+3,sy+3,3,2); ctx.fillRect(sx+TS-10,sy+3,3,2);
      ctx.fillStyle='#bfdbfe'; ctx.fillRect(sx+3,sy+12,7,5); ctx.fillRect(sx+TS-10,sy+12,7,5);
      ctx.strokeStyle='#334155'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TS,TS);
      break;}
    case '3':{ // KFC
      // Fondo rojo KFC
      ctx.fillStyle='#b91c1c'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#dc2626'; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
      // Franja blanca
      ctx.fillStyle='#fef2f2'; ctx.fillRect(sx+1,sy+TS/2-3,TS-2,6);
      // Balde de pollo en 8-bit
      const bx=sx+TS/2-5, by=sy+4;
      ctx.fillStyle='#dc2626'; ctx.fillRect(bx,by+2,10,10);
      ctx.fillStyle='#b91c1c'; ctx.fillRect(bx+1,by+11,8,3);
      ctx.fillStyle='#fef2f2'; ctx.fillRect(bx+2,by+4,6,2); ctx.fillRect(bx+3,by+7,4,2);
      // Letras KFC
      ctx.fillStyle='#fef9c3'; ctx.font='bold 7px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText('KFC',sx+TS/2,sy+TS-1); ctx.textAlign='left';
      // Glow rojo
      const kg=.3+.2*Math.sin(tick*.1);
      ctx.shadowColor=`rgba(239,68,68,${kg})`; ctx.shadowBlur=8;
      ctx.strokeStyle=`rgba(253,186,116,${kg})`; ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0; ctx.shadowColor='transparent';
      break;}
    case '4':{ // Puesto de completos
      // Carpa amarilla / mostaza
      ctx.fillStyle='#d97706'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+1,sy+2,TS-2,TS-8);
      // Rayas rojas (estilo carpa feria)
      ctx.fillStyle='#dc2626';
      for(let i=0;i<3;i++) ctx.fillRect(sx+3+i*8,sy+2,4,TS-8);
      // Completo pixel art
      ctx.fillStyle='#fef9c3'; ctx.fillRect(sx+5,sy+10,TS-10,6); // pan
      ctx.fillStyle='#dc2626'; ctx.fillRect(sx+5,sy+11,TS-10,2); // salchicha
      ctx.fillStyle='#16a34a'; ctx.fillRect(sx+5,sy+12,TS-10,1); // palta
      ctx.fillStyle='#f1f5f9'; ctx.fillRect(sx+5,sy+13,TS-10,1); // mayo
      // Texto
      ctx.fillStyle='#1e293b'; ctx.font='bold 5px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText('COMP.',sx+TS/2,sy+TS-1); ctx.textAlign='left';
      break;}
    case 'g':{ // Césped (encuentros posibles)
      const a=(mR+mC)%2===0;
      ctx.fillStyle=a?'#4ade80':'#22c55e'; ctx.fillRect(sx,sy,TS,TS);
      // Hierba animada
      if(tick%30===((mR*7+mC*3)%30)){
        ctx.fillStyle='rgba(134,239,172,.4)';
        ctx.fillRect(sx+3,sy+TS/2,2,TS/2); ctx.fillRect(sx+TS-5,sy+TS/3,2,TS*2/3);
      }
      ctx.strokeStyle='rgba(0,100,0,.08)'; ctx.lineWidth=.4; ctx.strokeRect(sx,sy,TS,TS);
      break;}
    case 'T':{ // Árbol
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      const cr=ctx.createRadialGradient(sx+TS/2,sy+TS/2,2,sx+TS/2,sy+TS/2,TS/2-1);
      cr.addColorStop(0,`rgba(21,128,61,${.8+.1*gp})`); cr.addColorStop(1,`rgba(20,83,45,${.7+.1*gp})`);
      ctx.fillStyle=cr; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS/2-2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=`rgba(134,239,172,${.3+.2*gp})`; ctx.beginPath();
      ctx.arc(sx+TS/2-2,sy+TS/2-3,4,0,Math.PI*2); ctx.fill();
      break;}
    case 'M':{ // Molino
      ctx.fillStyle='#dcfce7'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx+TS/2-5,sy+TS/3,10,TS*2/3);
      ctx.fillStyle='#9ca3af'; ctx.fillRect(sx+TS/2-7,sy+TS/3,14,5);
      ctx.save(); ctx.translate(sx+TS/2,sy+TS/3+2); ctx.rotate(tick*.03);
      ctx.fillStyle='#78716c';
      for(let i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);ctx.fillRect(-2,-20,4,20);ctx.restore();}
      ctx.restore();
      ctx.fillStyle='#44403c'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/3+2,3,0,Math.PI*2); ctx.fill();
      break;}
    case '.':{ // Pavimento / boulevard
      const a2=(mR+mC)%2===0;
      ctx.fillStyle=a2?'#e2e8f0':'#f1f5f9'; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle='rgba(0,0,0,.04)'; ctx.lineWidth=.4; ctx.strokeRect(sx,sy,TS,TS);
      break;}
    case 'n':{ // Inspector municipal
      ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx,sy,TS,TS);
      const nb=Math.abs(Math.sin(tick*.055))*2;
      // Sombra/base
      ctx.fillStyle='rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS-4+nb,7,3,0,0,Math.PI*2); ctx.fill();
      // Cuerpo uniforme azul marino
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+6,sy+12+nb,TS-12,TS-18);
      // Galones dorados
      ctx.fillStyle='#fbbf24';
      ctx.fillRect(sx+6,sy+12+nb,TS-12,2);
      ctx.fillRect(sx+6,sy+20+nb,TS-12,1);
      // Brazos
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+3,sy+13+nb,4,10); ctx.fillRect(sx+TS-7,sy+13+nb,4,10);
      // Cuello y cabeza
      ctx.fillStyle='#fcd9b6'; ctx.fillRect(sx+TS/2-3,sy+7+nb,6,7);
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+5+nb,6,0,Math.PI*2); ctx.fill();
      // Gorra azul marino
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+TS/2-7,sy+1+nb,14,5);
      ctx.fillRect(sx+TS/2-8,sy+3+nb,16,3);
      ctx.fillStyle='#0f2744'; ctx.fillRect(sx+TS/2-9,sy+4+nb,18,2); // visera
      // Placa dorada
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+TS/2-4,sy+13+nb,8,5);
      ctx.shadowColor='rgba(251,191,36,.4)'; ctx.shadowBlur=4;
      ctx.fillStyle='#78350f'; ctx.font='bold 3.5px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('MUN',sx+TS/2,sy+15+nb);
      ctx.shadowBlur=0; ctx.shadowColor='transparent'; ctx.textAlign='left';
      // Bigote autoridad
      ctx.fillStyle='#374151'; ctx.fillRect(sx+TS/2-3,sy+7+nb,6,2);
      // Ojos serios
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx+TS/2-3,sy+4+nb,2,2); ctx.fillRect(sx+TS/2+1,sy+4+nb,2,2);
      break;}
    case 'n':{ // Inspector municipal
      ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx,sy,TS,TS);
      const nb=Math.abs(Math.sin(tick*.055))*2;
      ctx.fillStyle='rgba(0,0,0,.08)'; ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS-4+nb,7,3,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+6,sy+12+nb,TS-12,TS-18);
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+6,sy+12+nb,TS-12,2); ctx.fillRect(sx+6,sy+20+nb,TS-12,1);
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+3,sy+13+nb,4,10); ctx.fillRect(sx+TS-7,sy+13+nb,4,10);
      ctx.fillStyle='#fcd9b6'; ctx.fillRect(sx+TS/2-3,sy+7+nb,6,7);
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+5+nb,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+TS/2-7,sy+1+nb,14,5); ctx.fillRect(sx+TS/2-8,sy+3+nb,16,3);
      ctx.fillStyle='#0f2744'; ctx.fillRect(sx+TS/2-9,sy+4+nb,18,2);
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+TS/2-4,sy+13+nb,8,5);
      ctx.fillStyle='#78350f'; ctx.font='bold 3.5px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('MUN',sx+TS/2,sy+15+nb); ctx.textAlign='left';
      ctx.fillStyle='#374151'; ctx.fillRect(sx+TS/2-3,sy+7+nb,6,2);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx+TS/2-3,sy+4+nb,2,2); ctx.fillRect(sx+TS/2+1,sy+4+nb,2,2);
      break;}
    case 'E':{ const ge=.5+.5*Math.sin(tick*.09);
      ctx.fillStyle=`rgba(59,130,246,${.25+.1*ge})`; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle=`rgba(147,197,253,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#dbeafe'; ctx.textBaseline='bottom'; ctx.fillText('PLAZA',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case '@':{ // Farmacia
      const pp=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#0f2027'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#065f46'; ctx.fillRect(sx+2,sy+4,TS-4,TS-6);
      // Cruz verde
      ctx.fillStyle=`rgba(16,185,129,${.8+.2*pp})`;
      ctx.fillRect(sx+TS/2-2,sy+6,4,TS-10);
      ctx.fillRect(sx+4,sy+TS/2-2,TS-8,4);
      ctx.shadowColor=`rgba(16,185,129,.6)`; ctx.shadowBlur=6+5*pp;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#6ee7b7';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FARM',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.shadowBlur=0;
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawCentroOverlays(){
  // KFC glow
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const t2=MAPS.centro_villa?.[r+camera.y]?.[c+camera.x];
    if(t2==='3'){
      const kx=c*TS+TS/2,ky=r*TS+TS/2;
      const kg=ctx.createRadialGradient(kx,ky,2,kx,ky,TS*.7);
      const kp=.07+.05*Math.sin(tick*.12);
      kg.addColorStop(0,`rgba(239,68,68,${kp})`); kg.addColorStop(1,'rgba(239,68,68,0)');
      ctx.fillStyle=kg; ctx.fillRect(kx-TS,ky-TS,TS*2,TS*2);
    }
    // Inspector authority glow
    if(t2==='n'){
      const ix=c*TS+TS/2,iy=r*TS+TS/2;
      const ig=ctx.createRadialGradient(ix,iy,2,ix,iy,TS*.5);
      const ip=.08+.04*Math.sin(tick*.08+(c+r)*.4);
      ig.addColorStop(0,`rgba(251,191,36,${ip})`); ig.addColorStop(1,'rgba(251,191,36,0)');
      ctx.fillStyle=ig; ctx.fillRect(ix-TS,iy-TS,TS*2,TS*2);
    }
    // Completos glow (appetizing yellow)
    if(t2==='4'){
      const fx=c*TS+TS/2,fy=r*TS+TS/2;
      const fg2=ctx.createRadialGradient(fx,fy,2,fx,fy,TS*.6);
      const fp=.06+.04*Math.sin(tick*.1+c);
      fg2.addColorStop(0,`rgba(251,191,36,${fp})`); fg2.addColorStop(1,'rgba(251,191,36,0)');
      ctx.fillStyle=fg2; ctx.fillRect(fx-TS,fy-TS,TS*2,TS*2);
    }
  }
}


// ═══ BIOLOGÍA DE ECOSISTEMAS ═══
function drawBiologiaTile(t,sx,sy,mR,mC){
  const gp=.5+.5*Math.sin(tick*.07+mC*.35+mR*.25);
  switch(t){
    case '#':{ // Paredes laboratorio — verde-gris ciencia
      const wg=ctx.createLinearGradient(sx,sy,sx+TS,sy+TS);
      wg.addColorStop(0,'#134e4a'); wg.addColorStop(1,'#115e59');
      ctx.fillStyle=wg; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#0d9488'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle=`rgba(94,234,212,${.2+.1*gp})`; ctx.lineWidth=.8; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      break;}
    case '.':{  // Piso laboratorio — baldosa clara
      const a=(mR+mC)%2===0;
      ctx.fillStyle=a?'#f0fdf4':'#ecfdf5'; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle='rgba(0,128,80,.06)'; ctx.lineWidth=.4; ctx.strokeRect(sx,sy,TS,TS);
      break;}
    case 'z':{ // Póster biología / planta en pared
      ctx.fillStyle='#134e4a'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del poster
      ctx.fillStyle='#fef9c3'; ctx.fillRect(sx+3,sy+3,TS-6,TS-6);
      ctx.fillStyle='#166534'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      // Dibujo hoja/célula 8-bit
      ctx.fillStyle='#4ade80';
      ctx.fillRect(sx+7,sy+8,4,8); ctx.fillRect(sx+6,sy+9,6,6);
      ctx.fillStyle='#86efac'; ctx.fillRect(sx+8,sy+9,2,4);
      // Texto "BIO"
      ctx.fillStyle='#fbbf24'; ctx.font='bold 5px sans-serif';
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      ctx.fillText('BIO',sx+TS/2,sy+TS-1); ctx.textAlign='left';
      // Glow verde
      ctx.shadowColor=`rgba(74,222,128,${.2+.15*gp})`; ctx.shadowBlur=6;
      ctx.strokeStyle=`rgba(74,222,128,${.3+.2*gp})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.shadowBlur=0; ctx.shadowColor='transparent';
      break;}
    case 'y':{ // Mesa de laboratorio con microscopio
      ctx.fillStyle='#134e4a'; ctx.fillRect(sx,sy,TS,TS);
      // Mesa
      ctx.fillStyle='#78350f'; ctx.fillRect(sx+1,sy+TS/2,TS-2,TS/2-1);
      ctx.fillStyle='#a16207'; ctx.fillRect(sx+1,sy+TS/2,TS-2,4);
      // Microscopio pixel-art
      const mx=sx+TS/2, my=sy+TS/2;
      ctx.fillStyle='#374151'; // base
      ctx.fillRect(mx-5,my-2,10,4);
      ctx.fillStyle='#6b7280'; // columna
      ctx.fillRect(mx-2,my-12,4,12);
      ctx.fillStyle='#9ca3af'; // brazo
      ctx.fillRect(mx-1,my-12,6,3);
      ctx.fillStyle='#374151'; // ocular
      ctx.fillRect(mx+2,my-16,3,6);
      ctx.fillStyle='rgba(147,197,253,.6)'; // lente
      ctx.beginPath(); ctx.arc(mx+3,my-17,2,0,Math.PI*2); ctx.fill();
      // Brillo ocular
      ctx.shadowColor='rgba(147,197,253,.5)'; ctx.shadowBlur=6;
      ctx.strokeStyle='rgba(147,197,253,.6)'; ctx.lineWidth=.8;
      ctx.beginPath(); ctx.arc(mx+3,my-17,2,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0; ctx.shadowColor='transparent';
      break;}
    case 'Y':{ // Yael — rubia con lentes
      ctx.fillStyle='#f0fdf4'; ctx.fillRect(sx,sy,TS,TS);
      const yb=Math.abs(Math.sin(tick*.055))*2;
      // Sombra suave
      ctx.fillStyle='rgba(0,100,0,.07)'; ctx.beginPath();
      ctx.ellipse(sx+TS/2,sy+TS-3+yb,8,3,0,0,Math.PI*2); ctx.fill();
      // Bata de laboratorio
      ctx.fillStyle='#f8fafc'; ctx.fillRect(sx+6,sy+12+yb,TS-12,TS-18);
      ctx.fillStyle='#e2e8f0'; ctx.fillRect(sx+6,sy+12+yb,2,TS-18); ctx.fillRect(sx+TS-8,sy+12+yb,2,TS-18);
      ctx.fillStyle='#0d9488'; ctx.fillRect(sx+8,sy+13+yb,TS-16,1); // solapa teal
      // Portapapeles
      ctx.fillStyle='#fef3c7'; ctx.fillRect(sx+TS-10,sy+14+yb,7,9);
      ctx.fillStyle='#92400e'; ctx.fillRect(sx+TS-10,sy+14+yb,7,2);
      ctx.strokeStyle='#d97706'; ctx.lineWidth=.7; ctx.strokeRect(sx+TS-10,sy+14+yb,7,9);
      ctx.fillStyle='#374151'; ctx.fillRect(sx+TS-9,sy+17+yb,5,1); ctx.fillRect(sx+TS-9,sy+19+yb,5,1);
      // Cuello
      ctx.fillStyle='#fcd9b6'; ctx.fillRect(sx+TS/2-3,sy+7+yb,6,7);
      // Cabeza
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+5+yb,7,0,Math.PI*2); ctx.fill();
      // CABELLO RUBIO
      ctx.fillStyle='#fbbf24';
      ctx.fillRect(sx+TS/2-8,sy-1+yb,16,8);
      ctx.fillRect(sx+TS/2-9,sy+2+yb,3,9);
      ctx.fillRect(sx+TS/2+6,sy+2+yb,3,9);
      // Mechones
      ctx.fillStyle='#fcd34d';
      ctx.fillRect(sx+TS/2-7,sy-1+yb,12,4);
      ctx.fillStyle='#fef08a'; ctx.fillRect(sx+TS/2-4,sy-1+yb,6,2);
      // LENTES
      ctx.strokeStyle='#1e293b'; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+TS/2-7,sy+3+yb,6,5);
      ctx.strokeRect(sx+TS/2+1,sy+3+yb,6,5);
      ctx.beginPath(); ctx.moveTo(sx+TS/2-1,sy+5+yb); ctx.lineTo(sx+TS/2+1,sy+5+yb); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+TS/2-7,sy+5+yb); ctx.lineTo(sx+TS/2-9,sy+4+yb); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+TS/2+7,sy+5+yb); ctx.lineTo(sx+TS/2+9,sy+4+yb); ctx.stroke();
      // Ojos y boca
      ctx.fillStyle='#1e293b';
      ctx.fillRect(sx+TS/2-5,sy+4+yb,2,2); ctx.fillRect(sx+TS/2+3,sy+4+yb,2,2);
      ctx.strokeStyle='#be185d'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+7+yb,2.5,.15,Math.PI-.15); ctx.stroke();
      // Mejillas
      ctx.fillStyle='rgba(251,191,36,.3)';
      ctx.beginPath(); ctx.ellipse(sx+TS/2-5,sy+6+yb,3,1.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(sx+TS/2+5,sy+6+yb,3,1.5,0,0,Math.PI*2); ctx.fill();
      break;}
    case '9':{ // Acceso Reserva Ecológica
      const g9=.5+.5*Math.sin(tick*.08);
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#166534'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.strokeStyle=`rgba(134,239,172,${.6+.3*g9})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.65+.35*g9; ctx.font='14px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🌳',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle='rgba(134,239,172,.9)'; ctx.font='bold 4px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('RESERVA',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'E':{ const ge=.5+.5*Math.sin(tick*.09);
      ctx.fillStyle=`rgba(13,148,136,${.2+.1*ge})`; ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle=`rgba(94,234,212,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#ccfbf1'; ctx.textBaseline='bottom'; ctx.fillText('PLAZA',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=`${mc}`;  ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1;
      ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2-.5); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'F':{ // Forja Metalúrgica
      const fp=.5+.5*Math.sin(tick*.08);
      const fr=.4+.4*Math.sin(tick*.15+mC);
      // Cuerpo del horno
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#292524'; ctx.fillRect(sx+2,sy+3,TS-4,TS-5);
      // Boca del horno (naranja brillante)
      ctx.fillStyle=`rgba(249,115,22,${.7+.3*fr})`; ctx.fillRect(sx+4,sy+TS*.4,TS-8,TS*.35);
      // Llamas internas
      ctx.shadowColor=`rgba(251,146,60,.8)`; ctx.shadowBlur=8+6*fp;
      ctx.fillStyle=`rgba(254,215,170,${.6+.4*fr})`; ctx.fillRect(sx+6,sy+TS*.45,TS-12,TS*.25);
      ctx.shadowBlur=0;
      // Chimenea
      ctx.fillStyle='#44403c'; ctx.fillRect(sx+TS*.35,sy,5,TS*.3);
      // Humo
      ctx.fillStyle=`rgba(120,113,108,${.3+.2*Math.sin(tick*.06)})`;
      ctx.beginPath(); ctx.arc(sx+TS*.4,sy-4,4+2*fp,0,Math.PI*2); ctx.fill();
      // Yunque
      ctx.fillStyle='#57534e'; ctx.fillRect(sx+TS*.55,sy+TS*.55,TS*.35,TS*.12); ctx.fillRect(sx+TS*.6,sy+TS*.67,TS*.25,TS*.2);
      ctx.fillStyle=`rgba(251,191,36,.9)`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FORJA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '@':{ // Farmacia
      const pp=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#0f2027'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#065f46'; ctx.fillRect(sx+2,sy+4,TS-4,TS-6);
      // Cruz verde
      ctx.fillStyle=`rgba(16,185,129,${.8+.2*pp})`;
      ctx.fillRect(sx+TS/2-2,sy+6,4,TS-10);
      ctx.fillRect(sx+4,sy+TS/2-2,TS-8,4);
      ctx.shadowColor=`rgba(16,185,129,.6)`; ctx.shadowBlur=6+5*pp;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#6ee7b7';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FARM',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.shadowBlur=0;
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle='#ecfdf5'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawBiologiaOverlays(){
  // Halo suave sobre Yael
  const yx=(6-camera.x)*TS+TS/2, yy=(7-camera.y)*TS+TS/2;
  if(yx>=0&&yx<canvas.width){
    const yh=ctx.createRadialGradient(yx,yy,3,yx,yy,TS*.9);
    const yhp=.08+.05*Math.sin(tick*.07);
    yh.addColorStop(0,`rgba(251,191,36,${yhp})`); yh.addColorStop(1,'rgba(251,191,36,0)');
    ctx.fillStyle=yh; ctx.fillRect(yx-TS,yy-TS,TS*2,TS*2);
  }
  // Microscopios — brillo azul pulsante
  if(tick%4===0){
    for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
      if(MAPS.biologia?.[r+camera.y]?.[c+camera.x]==='y'){
        const mx2=c*TS+TS/2, my2=r*TS+TS*.35;
        if(Math.random()<.3){
          ctx.fillStyle='rgba(147,197,253,.25)';
          ctx.beginPath(); ctx.arc(mx2+4,my2-6,3,0,Math.PI*2); ctx.fill();
        }
      }
    }
  }

}
// ═══ RESERVA ECOLÓGICA DE VILLA ALEMANA ═══
function drawReservaTile(t,sx,sy,mR,mC){
  if(medTerrain(t,sx,sy,mC,mR)) return;
  const gp=.5+.5*Math.sin(tick*.06+mC*.28+mR*.19);
  switch(t){
    case 'T':{ ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS); const tg=ctx.createRadialGradient(sx+TS/2,sy+TS*.4,2,sx+TS/2,sy+TS*.35,TS/2); const shade=Math.floor(Math.abs(Math.sin(mR*7+mC*13))*4); const greens=['#166534','#15803d','#14532d','#065f46']; tg.addColorStop(0,greens[(shade+1)%4]); tg.addColorStop(.6,greens[shade]); tg.addColorStop(1,'rgba(5,46,22,.8)'); ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS*.4,TS/2-1,0,Math.PI*2); ctx.fill(); ctx.fillStyle=`rgba(134,239,172,${.12+.08*gp})`; ctx.beginPath(); ctx.ellipse(sx+TS*.35,sy+TS*.3,3,2,-.5,0,Math.PI*2); ctx.fill(); break;}
    case '#':{ const dk=ctx.createLinearGradient(sx,sy,sx+TS,sy+TS); dk.addColorStop(0,'#1c1917'); dk.addColorStop(1,'#292524'); ctx.fillStyle=dk; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='rgba(68,64,60,.5)'; ctx.fillRect(sx+3,sy+4,5,3); ctx.fillRect(sx+TS-7,sy+TS-7,5,3); break;}
    case '.':{  const a=(mR+mC)%2===0; ctx.fillStyle=a?'#a16207':'#92400e'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle=`rgba(180,140,60,${.15+.05*gp})`; ctx.fillRect(sx,sy,TS,TS); if((mR*11+mC*7)%9===0){ctx.fillStyle='rgba(100,70,30,.4)'; ctx.fillRect(sx+5,sy+6,3,2);} break;}
    case 'g':{ const a2=(mR+mC)%2===0; ctx.fillStyle=a2?'#15803d':'#166534'; ctx.fillRect(sx,sy,TS,TS); const sw=Math.sin(tick*.04+mC*.6)*2; ctx.strokeStyle=`rgba(134,239,172,${.45+.2*gp})`; ctx.lineWidth=1; for(let i=0;i<4;i++){const bx=sx+4+i*7, bh=5+Math.sin(tick*.05+i+mC)*.5; ctx.beginPath(); ctx.moveTo(bx,sy+TS); ctx.quadraticCurveTo(bx+sw,sy+TS-bh*2,bx,sy+TS-bh*4); ctx.stroke();} break;}
    case 'w':{ const wf=.5+.5*Math.sin(tick*.08+mC*.4); ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx,sy,TS,TS); const wg=ctx.createLinearGradient(sx,sy,sx+TS,sy); wg.addColorStop(0,`rgba(56,189,248,${.6+.2*wf})`); wg.addColorStop(.5,`rgba(14,165,233,${.8+.1*wf})`); wg.addColorStop(1,`rgba(56,189,248,${.5+.2*wf})`); ctx.fillStyle=wg; ctx.fillRect(sx,sy+2,TS,TS-4); ctx.strokeStyle=`rgba(186,230,253,${.4+.3*wf})`; ctx.lineWidth=1; const phase=(tick*.03+mC*.5)%(TS/6); for(let i=0;i<3;i++){ctx.beginPath(); ctx.moveTo(sx+(phase+i*TS/3)%TS,sy+TS*.35); ctx.quadraticCurveTo(sx+TS/6+(phase+i*TS/3)%TS,sy+TS*.28,sx+TS/3+(phase+i*TS/3)%TS,sy+TS*.35); ctx.stroke();} ctx.fillStyle=`rgba(186,230,253,${.15+.1*wf})`; ctx.fillRect(sx+2,sy+4,TS-4,2); break;}
    case 'j':{ ctx.fillStyle='#15803d'; ctx.fillRect(sx,sy,TS,TS); const jb=Math.abs(Math.sin(tick*.07))*2; const jw=Math.sin(tick*.15); ctx.fillStyle='#92400e'; ctx.fillRect(sx+TS/2-4,sy+TS/2-2+jb,8,6); ctx.fillStyle='#78350f'; ctx.fillRect(sx+TS/2-10,sy+TS/2-1+jb-Math.abs(jw)*3,7,4); ctx.fillRect(sx+TS/2+3,sy+TS/2-1+jb-Math.abs(jw)*3,7,4); ctx.fillStyle='#fcd9b6'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2-4+jb,4,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#f59e0b'; ctx.fillRect(sx+TS/2+2,sy+TS/2-5+jb,4,2); ctx.fillStyle='#1e293b'; ctx.fillRect(sx+TS/2+1,sy+TS/2-6+jb,2,2); if(tick%60<30){ctx.globalAlpha=.7;ctx.font='7px serif';ctx.fillStyle='#fef08a';ctx.textAlign='center';ctx.fillText('♪',sx+TS/2+8,sy+TS/2-8+jb);ctx.textAlign='left';ctx.globalAlpha=1;} break;}
    case 'i':{ ctx.fillStyle='#166534'; ctx.fillRect(sx,sy,TS,TS); const iw=Math.sin(tick*.12); const ia=Math.abs(iw)*.8; ctx.fillStyle=`rgba(251,191,36,${.7+.2*ia})`; ctx.beginPath(); ctx.ellipse(sx+TS/2-4,sy+TS/2-3,6,4,-.4-ia*.3,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(sx+TS/2+4,sy+TS/2-3,6,4,.4+ia*.3,0,Math.PI*2); ctx.fill(); ctx.fillStyle=`rgba(180,130,0,${.6+.2*ia})`; ctx.beginPath(); ctx.ellipse(sx+TS/2-3,sy+TS/2+3,4,3,-.2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(sx+TS/2+3,sy+TS/2+3,4,3,.2,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#1e293b'; ctx.fillRect(sx+TS/2-1,sy+TS/2-5,2,10); ctx.strokeStyle='#374151'; ctx.lineWidth=.8; ctx.beginPath(); ctx.moveTo(sx+TS/2,sy+TS/2-5); ctx.lineTo(sx+TS/2-4,sy+TS/2-10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(sx+TS/2,sy+TS/2-5); ctx.lineTo(sx+TS/2+4,sy+TS/2-10); ctx.stroke(); ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(sx+TS/2-4,sy+TS/2-10,1.5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(sx+TS/2+4,sy+TS/2-10,1.5,0,Math.PI*2); ctx.fill(); break;}
    case 'x':{ ctx.fillStyle='#166534'; ctx.fillRect(sx,sy,TS,TS); const xb=Math.abs(Math.sin(tick*.04))*1.5; ctx.fillStyle='#d97706'; ctx.fillRect(sx+3,sy+12+xb,TS-6,TS-16); ctx.fillStyle='#f59e0b'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+9+xb,7,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#d97706'; ctx.beginPath(); ctx.moveTo(sx+TS/2-6,sy+5+xb); ctx.lineTo(sx+TS/2-3,sy-1+xb); ctx.lineTo(sx+TS/2,sy+5+xb); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx+TS/2,sy+5+xb); ctx.lineTo(sx+TS/2+3,sy-1+xb); ctx.lineTo(sx+TS/2+6,sy+5+xb); ctx.fill(); ctx.fillStyle='#fef3c7'; ctx.beginPath(); ctx.ellipse(sx+TS/2+1,sy+11+xb,4,3,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.arc(sx+TS/2+2,sy+10+xb,2,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.arc(sx+TS/2-3,sy+7+xb,1.5,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(sx+TS/2+2,sy+7+xb,1.5,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#f59e0b'; ctx.fillRect(sx+TS-4,sy+14+xb,4,4); break;}
    case 'o':{ ctx.fillStyle='#292524'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#44403c'; ctx.fillRect(sx+2,sy+4,TS-4,TS-6); ctx.fillStyle='#57534e'; ctx.fillRect(sx+3,sy+5,TS-6,TS*.4); ctx.fillStyle='rgba(255,255,255,.06)'; ctx.fillRect(sx+3,sy+5,TS*.4,2); break;}
    case '9':{ const g9=.5+.5*Math.sin(tick*.08); ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS); ctx.fillStyle='#166534'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4); ctx.strokeStyle=`rgba(134,239,172,${.6+.3*g9})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=.65+.35*g9; ctx.font='14px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('🌳',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left'; ctx.fillStyle='rgba(134,239,172,.9)'; ctx.font='bold 4px sans-serif'; ctx.textBaseline='top'; ctx.textAlign='center'; ctx.fillText('RESERVA',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'f':{ // Árbol industrial (pino/eucalipto)
      const fp=.5+.5*Math.sin(tick*.05+mC*.15);
      const fcut=progress.cutTrees?.[`${mC},${mR}`];
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      if(fcut){
        // Tronco cortado
        ctx.fillStyle='#78350f'; ctx.fillRect(sx+TS/2-4,sy+TS*.6,8,TS*.35);
        ctx.fillStyle='#92400e'; ctx.fillRect(sx+TS/2-6,sy+TS*.75,12,4);
        ctx.strokeStyle='rgba(180,140,60,.6)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS*.77,5,0,Math.PI*2); ctx.stroke();
      } else {
        // Árbol industrial en pie
        ctx.fillStyle='#78350f'; ctx.fillRect(sx+TS/2-2,sy+TS*.55,4,TS*.4);
        const tg=ctx.createConicalGradient?null:null;
        ctx.fillStyle='#166534'; // pino: forma cónica
        ctx.beginPath(); ctx.moveTo(sx+TS/2,sy+2); ctx.lineTo(sx+TS/2+8,sy+TS*.55); ctx.lineTo(sx+TS/2-8,sy+TS*.55); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#15803d';
        ctx.beginPath(); ctx.moveTo(sx+TS/2,sy+6); ctx.lineTo(sx+TS/2+7,sy+TS*.45); ctx.lineTo(sx+TS/2-7,sy+TS*.45); ctx.closePath(); ctx.fill();
        ctx.fillStyle=`rgba(74,222,128,${.15+.1*fp})`;
        ctx.beginPath(); ctx.moveTo(sx+TS/2,sy+10); ctx.lineTo(sx+TS/2+5,sy+TS*.38); ctx.lineTo(sx+TS/2-5,sy+TS*.38); ctx.closePath(); ctx.fill();
        ctx.shadowColor='rgba(22,101,52,.4)'; ctx.shadowBlur=4;
        ctx.fillStyle='rgba(253,224,71,.8)'; ctx.font='bold 3px sans-serif';
        ctx.textBaseline='alphabetic'; ctx.textAlign='center';
        ctx.fillText('🪓',sx+TS/2,sy+TS-1); ctx.textAlign='left'; ctx.shadowBlur=0;
      }
      break;}
    case 'W':{ // Carpintería / Taller
      const wp=.5+.5*Math.sin(tick*.07);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#78350f'; ctx.fillRect(sx+2,sy+5,TS-4,TS-8);
      ctx.fillStyle='#92400e'; ctx.fillRect(sx+2,sy+5,TS-4,4);
      ctx.fillStyle='rgba(146,64,14,.3)'; ctx.fillRect(sx+2,sy+9,TS-4,2);
      ctx.shadowColor='rgba(251,191,36,.5)'; ctx.shadowBlur=5+4*wp;
      ctx.globalAlpha=.85+.15*wp; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🪚',sx+TS*.35,sy+TS*.55);
      ctx.font='8px serif'; ctx.fillText('🪑',sx+TS*.7,sy+TS*.55);
      ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.textAlign='left';
      ctx.fillStyle='rgba(253,224,71,.9)'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center'; ctx.fillText('CARP',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case 'D':{ // Muelle / Dock
      // Suelo de sendero
      ctx.fillStyle='#a16207'; ctx.fillRect(sx,sy,TS,TS);
      // Tablones de madera
      ctx.fillStyle='#92400e'; ctx.fillRect(sx,sy,TS,5); ctx.fillRect(sx,sy+TS-5,TS,5);
      for(let pi=0;pi<3;pi++){ctx.fillStyle=pi%2?'#78350f':'#92400e'; ctx.fillRect(sx,sy+5+pi*((TS-10)/3),(TS),(TS-10)/3);}
      ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=.5;
      for(let pi=1;pi<3;pi++) ctx.strokeRect(sx,sy+5+pi*((TS-10)/3),TS,0);
      // Boat icon pulsante
      const dp=.65+.35*Math.sin(tick*.1);
      ctx.globalAlpha=dp; ctx.font='15px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('⛵',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle='rgba(253,224,71,.9)'; ctx.font='bold 4px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MUELLE',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
    case '0':{ // Cofre del Lago (isla)
      ctx.fillStyle=progress.lakeChestreward?'#15803d':'#166534'; ctx.fillRect(sx,sy,TS,TS);
      const co=progress.lakeChestreward, cp=.7+.3*Math.sin(tick*.1);
      // Cofre base
      ctx.fillStyle=co?'#d97706':'#92400e'; ctx.fillRect(sx+3,sy+TS/2-2,TS-6,TS/2);
      // Cofre tapa
      ctx.fillRect(sx+3,sy+TS/2-9,TS-6,9);
      // Bisagras
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+5,sy+TS/2-2,3,4); ctx.fillRect(sx+TS-8,sy+TS/2-2,3,4);
      if(!co){
        // Candado
        ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+TS/2-3,sy+TS/2-5,6,7);
        ctx.fillStyle='#1e293b'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2-3,2,0,Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle='#fef08a'; ctx.fillRect(sx+TS/2-4,sy+TS/2-2,8,5);
      }
      // Glow dorado
      ctx.shadowColor=`rgba(251,191,36,${cp})`; ctx.shadowBlur=co?6:10+4*Math.sin(tick*.12);
      ctx.strokeStyle=`rgba(251,191,36,${cp})`; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+3,sy+TS/2-9,TS-6,TS/2+7); ctx.shadowBlur=0; ctx.shadowColor='transparent';
      break;}
    case 'h':{ // Huerto plot
      const hkey=`${mC},${mR}`;
      const hplot=progress.garden[hkey];
      const hstage=hplot?Math.min(3,Math.floor((tick-hplot.planted)/1500)):0;
      // Suelo huerto
      ctx.fillStyle='#78350f'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#92400e'; ctx.fillRect(sx+1,sy+1,TS-2,TS-3);
      // Surcos de tierra
      ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=.7;
      for(let ri=0;ri<4;ri++) ctx.strokeRect(sx+1,sy+1+ri*(TS/4),TS-2,TS/4);
      if(!hstage){
        // Parcela vacía - signo +
        ctx.strokeStyle='rgba(200,180,100,.4)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(sx+TS/2,sy+4); ctx.lineTo(sx+TS/2,sy+TS-4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx+4,sy+TS/2); ctx.lineTo(sx+TS-4,sy+TS/2); ctx.stroke();
      } else {
        const emap={semilla_tomate:'🍅',semilla_lechuga:'🥬',semilla_papa:'🥔',semilla_zanahoria:'🥕',semilla_cebolla:'🧅'};
        const em=emap[hplot.seedId]||'🌱';
        if(hstage===1){
          ctx.fillStyle='#22c55e'; ctx.fillRect(sx+TS/2-1,sy+TS*.6,2,TS*.3);
          ctx.fillStyle='#86efac'; ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS*.55,4,3,.3,0,Math.PI*2); ctx.fill();
        } else if(hstage===2){
          ctx.fillStyle='#16a34a'; ctx.fillRect(sx+TS/2-1,sy+TS*.4,2,TS*.5);
          for(let li=0;li<3;li++){ctx.fillStyle='#4ade80'; ctx.beginPath(); ctx.ellipse(sx+TS/2+Math.cos(li*2)*6,sy+TS*.4+li*4,5,3,li*.5,0,Math.PI*2); ctx.fill();}
        } else {
          // Listo para cosechar
          ctx.fillStyle='#15803d'; ctx.fillRect(sx+TS/2-1,sy+TS*.3,2,TS*.6);
          const glow=.6+.4*Math.sin(tick*.15);
          ctx.globalAlpha=glow; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
          ctx.fillText(em,sx+TS/2,sy+TS*.35); ctx.globalAlpha=1; ctx.textAlign='left';
          ctx.shadowColor='rgba(134,239,172,.6)'; ctx.shadowBlur=8;
          ctx.strokeStyle=`rgba(134,239,172,${glow})`; ctx.lineWidth=1;
          ctx.strokeRect(sx+1,sy+1,TS-2,TS-2); ctx.shadowBlur=0;
        }
      }
      break;}
    case 'C':{ if(currentMap!=='reserva'){ctx.fillStyle='#14532d';ctx.fillRect(sx,sy,TS,TS);break;}
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      const cp=.5+.5*Math.sin(tick*.07);
      const cg2=ctx.createRadialGradient(sx+TS/2,sy+TS/2,2,sx+TS/2,sy+TS/2,TS/2);
      cg2.addColorStop(0,'rgba(34,197,94,.5)'); cg2.addColorStop(1,'rgba(5,46,22,.1)');
      ctx.fillStyle=cg2; ctx.fillRect(sx,sy,TS,TS);
      ctx.shadowColor=`rgba(34,197,94,${.5+.4*cp})`; ctx.shadowBlur=10;
      ctx.globalAlpha=.85+.15*cp; ctx.font='13px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(progress.catherineDefeated?'\u{1F33F}':'\u{1F9D9}\u200D\u2640\uFE0F',sx+TS/2,sy+TS/2);
      ctx.globalAlpha=1; ctx.textAlign='left'; ctx.shadowBlur=0;
      if(!progress.catherineDefeated){ctx.fillStyle='rgba(253,224,71,.9)';ctx.font='bold 3.5px sans-serif';
        ctx.textBaseline='top';ctx.textAlign='center';ctx.fillText('JEFE',sx+TS/2,sy+2);
        ctx.textAlign='left';ctx.textBaseline='alphabetic';
        ctx.strokeStyle=`rgba(34,197,94,${.6+.3*cp})`;ctx.lineWidth=1.5;ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);}
      break;}
    case 'G': case 'l': case 'u':{ // Guardabosques
      ctx.fillStyle='#166534'; ctx.fillRect(sx,sy,TS,TS);
      const rb=Math.abs(Math.sin(tick*.05))*2;
      ctx.fillStyle='#15803d'; ctx.fillRect(sx+5,sy+11+rb,TS-10,TS-17);
      ctx.fillStyle='#14532d'; ctx.fillRect(sx+5,sy+11+rb,TS-10,3);
      ctx.fillStyle='#166534'; ctx.fillRect(sx+6,sy+13+rb,TS-12,10);
      ctx.fillStyle='#fcd9b6'; ctx.fillRect(sx+TS/2-4,sy+6+rb,8,7);
      ctx.beginPath(); ctx.arc(sx+TS/2,sy+5+rb,5,0,Math.PI*2); ctx.fill();
      const hatC=t==='G'?'#4d7c0f':t==='l'?'#166534':'#14532d';
      ctx.fillStyle=hatC; ctx.fillRect(sx+TS/2-7,sy+1+rb,14,5); ctx.fillRect(sx+TS/2-9,sy+3+rb,18,2);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx+TS/2-3,sy+4+rb,2,2); ctx.fillRect(sx+TS/2+1,sy+4+rb,2,2);
      ctx.fillStyle='#fbbf24'; ctx.fillRect(sx+TS/2-3,sy+14+rb,6,4);
      ctx.fillStyle='#166534'; ctx.font='bold 3px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(t==='G'?'GB1':t==='l'?'GB2':'GB3',sx+TS/2,sy+16+rb); ctx.textAlign='left';
      ctx.fillStyle='#374151'; ctx.fillRect(sx+TS-9,sy+12+rb,5,5);
      ctx.shadowColor='rgba(74,222,128,.2)'; ctx.shadowBlur=5;
      ctx.strokeStyle='rgba(74,222,128,.3)'; ctx.lineWidth=1; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0; ctx.shadowColor='transparent'; break;}
        case 'E':{ const ge=.5+.5*Math.sin(tick*.09); ctx.fillStyle=`rgba(20,83,45,${.3+.1*ge})`; ctx.fillRect(sx,sy,TS,TS); ctx.strokeStyle=`rgba(134,239,172,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6); ctx.globalAlpha=.7+.3*ge; ctx.font='10px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('↩',sx+TS/2,sy+TS*.44); ctx.globalAlpha=1; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#d1fae5'; ctx.textBaseline='bottom'; ctx.fillText('PASILLO',sx+TS/2,sy+TS-2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'm':{ // Memorice panel
      const mp=.5+.5*Math.sin(tick*.1+mC*.3);
      const modeColors={cancha:'#7c3aed',biblioteca:'#1d4ed8',sala_cont:'#0f766e',secretaria:'#b45309',biologia:'#15803d',salon_trofeos:'#b91c1c'};
      const mc=modeColors[currentMap]||'#7c3aed';
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=mc; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.fillStyle='rgba(0,0,0,.3)'; ctx.fillRect(sx+4,sy+4,TS-8,TS-8);
      ctx.shadowColor=mc; ctx.shadowBlur=6+4*mp;
      ctx.strokeStyle=`rgba(255,255,255,${.25+.15*mp})`; ctx.lineWidth=1; ctx.strokeRect(sx+3,sy+3,TS-6,TS-6);
      ctx.shadowBlur=0;
      ctx.globalAlpha=.85+.15*mp; ctx.font='11px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🎮',sx+TS/2,sy+TS/2); ctx.globalAlpha=1; ctx.textAlign='left';
      ctx.fillStyle=`rgba(255,255,255,${.6+.3*mp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('JUEGO',sx+TS/2,sy+3); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'F':{ // Forja Metalúrgica
      const fp=.5+.5*Math.sin(tick*.08);
      const fr=.4+.4*Math.sin(tick*.15+mC);
      // Cuerpo del horno
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#292524'; ctx.fillRect(sx+2,sy+3,TS-4,TS-5);
      // Boca del horno (naranja brillante)
      ctx.fillStyle=`rgba(249,115,22,${.7+.3*fr})`; ctx.fillRect(sx+4,sy+TS*.4,TS-8,TS*.35);
      // Llamas internas
      ctx.shadowColor=`rgba(251,146,60,.8)`; ctx.shadowBlur=8+6*fp;
      ctx.fillStyle=`rgba(254,215,170,${.6+.4*fr})`; ctx.fillRect(sx+6,sy+TS*.45,TS-12,TS*.25);
      ctx.shadowBlur=0;
      // Chimenea
      ctx.fillStyle='#44403c'; ctx.fillRect(sx+TS*.35,sy,5,TS*.3);
      // Humo
      ctx.fillStyle=`rgba(120,113,108,${.3+.2*Math.sin(tick*.06)})`;
      ctx.beginPath(); ctx.arc(sx+TS*.4,sy-4,4+2*fp,0,Math.PI*2); ctx.fill();
      // Yunque
      ctx.fillStyle='#57534e'; ctx.fillRect(sx+TS*.55,sy+TS*.55,TS*.35,TS*.12); ctx.fillRect(sx+TS*.6,sy+TS*.67,TS*.25,TS*.2);
      ctx.fillStyle=`rgba(251,191,36,.9)`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FORJA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case 'M':{ // Mina de extracción
      const dx2=player.dir==='right'?1:player.dir==='left'?-1:0;
      const dy2=player.dir==='down'?1:player.dir==='up'?-1:0;
      const mine2=MINES.find(m=>m.map===currentMap&&m.cx===mC&&m.cy===mR);
      const mtype=mine2?.type||'hierro';
      const mcol={hierro:'#ef4444',carbon:'#374151',silice:'#93c5fd',raro:'#a78bfa',cobre:'#f97316',calcita:'#9ca3af',sal:'#e2e8f0'}[mtype]||'#ef4444';
      const memoji={hierro:'🔩',carbon:'⚫',silice:'🏖️',raro:'✨',cobre:'🟠',calcita:'🪨',sal:'🧂'}[mtype]||'⛏️';
      const mp=.5+.5*Math.sin(tick*.07+mC*.2);
      // Cave walls
      ctx.fillStyle='#0c0a09'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1c1917'; ctx.fillRect(sx+1,sy+3,TS-2,TS-4);
      // Ore veins (type-colored)
      ctx.fillStyle=mcol+'66'; ctx.fillRect(sx+3,sy+5,4,3); ctx.fillRect(sx+TS-7,sy+9,4,3);
      ctx.fillRect(sx+5,sy+TS-7,6,3); ctx.fillRect(sx+2,sy+TS-4,3,2);
      // Entrance arch shadow
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(sx+TS*.2,sy+TS*.3,TS*.6,TS*.5);
      // Glow from ore
      ctx.shadowColor=mcol; ctx.shadowBlur=6+5*mp;
      ctx.strokeStyle=`${mcol}${Math.round((0.5+0.4*mp)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth=1.5; ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowBlur=0;
      // Ore emoji
      ctx.globalAlpha=.8+.2*mp; ctx.font='9px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText(memoji,sx+TS/2,sy+TS*.55); ctx.globalAlpha=1; ctx.textAlign='left';
      // Label
      const mineReady=!progress.minedAt?.[`${currentMap}:${mC},${mR}`]||(Date.now()-(progress.minedAt[`${currentMap}:${mC},${mR}`]||0))>=(progress.hasPico?20000:40000);
      ctx.fillStyle=mineReady?mcol:'#4b5563'; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('MINA',sx+TS/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        case '@':{ // Farmacia
      const pp=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#0f2027'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#065f46'; ctx.fillRect(sx+2,sy+4,TS-4,TS-6);
      // Cruz verde
      ctx.fillStyle=`rgba(16,185,129,${.8+.2*pp})`;
      ctx.fillRect(sx+TS/2-2,sy+6,4,TS-10);
      ctx.fillRect(sx+4,sy+TS/2-2,TS-8,4);
      ctx.shadowColor=`rgba(16,185,129,.6)`; ctx.shadowBlur=6+5*pp;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#6ee7b7';
      ctx.textBaseline='top'; ctx.textAlign='center';
      ctx.fillText('FARM',sx+TS/2,sy+2);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; ctx.shadowBlur=0;
      break;}
        case '%':{ // Letrero educativo COVID
      const sp=.5+.5*Math.sin(tick*.09+mC);
      // Fondo del letrero (pared)
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx,sy,TS,TS);
      // Marco del cartel
      const alertColor=COVID.outbreaks.some(o=>o.map===currentMap)?'#ef4444':'#f59e0b';
      ctx.strokeStyle=alertColor; ctx.lineWidth=1.5;
      ctx.strokeRect(sx+2,sy+3,TS-4,TS-5);
      ctx.fillStyle='#0f172a'; ctx.fillRect(sx+3,sy+4,TS-6,TS-7);
      // Símbolo biohazard o info
      ctx.shadowColor=alertColor; ctx.shadowBlur=4+3*sp;
      ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const hasOutbreak=COVID.outbreaks.some(o=>o.map===currentMap);
      ctx.fillText(hasOutbreak?'⚠️':'🪧',sx+TS/2,sy+TS*.52);
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      // Texto inferior
      ctx.fillStyle=`rgba(251,191,36,${.7+.3*sp})`; ctx.font='bold 3px sans-serif';
      ctx.textBaseline='bottom'; ctx.fillText('INFO',sx+TS/2,sy+TS-1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic';
      break;}
        default: ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
  }
}
function drawReservaOverlays(){
  if(tick%4===0&&Math.random()<.08){const fx=(Math.random()*canvas.width)|0,fy=(Math.random()*canvas.height)|0; ctx.fillStyle='rgba(134,239,172,.04)'; ctx.fillRect(fx,fy,TS*2,TS);}
  if(tick%3===0&&Math.random()<.08){const px=(Math.random()*canvas.width)|0,py=(Math.random()*canvas.height)|0; ctx.fillStyle=`rgba(253,224,71,${.08+Math.random()*.1})`; ctx.beginPath(); ctx.arc(px,py,Math.random()+.4,0,Math.PI*2); ctx.fill();}
  const maps_r=MAPS.reserva; if(!maps_r) return;
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const t2=maps_r[r+camera.y]?.[c+camera.x];
    if(t2==='j'||t2==='i'||t2==='x'){
      const ex=c*TS+TS/2,ey=r*TS+TS/2;
      const col=t2==='j'?'251,191,36':t2==='i'?'167,243,208':'251,146,60';
      const eg2=ctx.createRadialGradient(ex,ey,2,ex,ey,TS*.6);
      eg2.addColorStop(0,`rgba(${col},.1)`); eg2.addColorStop(1,`rgba(${col},0)`);
      ctx.fillStyle=eg2; ctx.fillRect(ex-TS,ey-TS,TS*2,TS*2);
    }
  }
}
// ─ Draw Map ─
const ARROW_OFF={up:[TS/2-4,-2,'▲'],down:[TS/2-4,TS+9,'▼'],left:[-10,TS/2+4,'◀'],right:[TS+2,TS/2+4,'▶']};
const ML={pasillo:'PASILLO',cancha:'🏀 CANCHA',sala_vela:'🕯 SALA SECRETA',biblioteca:'📚 BIBLIOTECA',sala_cont:'💜 SALA DE CONTENCIÓN',plaza:'🌳 PLAZA BELÉN',estacion_villa:'🚂 EST. VILLA ALEMANA',salon_trofeos:'🏆 SALÓN DE TROFEOS',secretaria:'🏢 SECRETARÍA',centro_villa:'🏘️ CENTRO VILLA ALEMANA',biologia:'🔬 BIOLOGÍA DE ECOSISTEMAS',reserva:'🌿 RESERVA ECOLÓGICA DE VILLA ALEMANA',estacion_quilpue:'🚂 EST. QUILPUÉ',estacion_vina:'🚂 EST. VIÑA DEL MAR',estacion_valpo:'🚂 EST. VALPARAÍSO'};
function drawBuinZooTile(t,sx,sy,mR,mC){
  const TSk=TS;
  // helper: animal en su recinto (fondo arena + reja + emoji + cartel)
  function pen(emoji,label,bg1,bg2,glow){
    // suelo del recinto (tierra)
    const grad=ctx.createLinearGradient(sx,sy,sx,sy+TSk);
    grad.addColorStop(0,bg1); grad.addColorStop(1,bg2);
    ctx.fillStyle=grad; ctx.fillRect(sx,sy,TSk,TSk);
    // matas
    ctx.fillStyle='rgba(60,110,40,.5)';
    ctx.beginPath(); ctx.arc(sx+5,sy+TSk-5,3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx+TSk-6,sy+6,2.5,0,Math.PI*2); ctx.fill();
    // animal (bob)
    const bob=Math.sin(tick*.06+mC*.5+mR)*1.5;
    const gl=.4+.3*Math.sin(tick*.1+mC);
    ctx.save();
    ctx.shadowColor=glow||'rgba(0,0,0,.4)'; ctx.shadowBlur=4+3*gl;
    ctx.font='15px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(emoji,sx+TSk/2,sy+TSk*.5+bob);
    ctx.restore();
    // reja del recinto (barrotes verticales)
    ctx.strokeStyle='rgba(70,70,80,.55)'; ctx.lineWidth=1;
    for(let i=1;i<5;i++){ ctx.beginPath(); ctx.moveTo(sx+i*(TSk/5),sy+2); ctx.lineTo(sx+i*(TSk/5),sy+TSk-2); ctx.stroke(); }
    ctx.strokeStyle='rgba(90,90,100,.7)'; ctx.lineWidth=1.5;
    ctx.strokeRect(sx+1,sy+1,TSk-2,TSk-2);
    // cartel
    if(label){ ctx.fillStyle='rgba(20,40,20,.75)'; ctx.fillRect(sx+TSk*.1,sy+TSk-7,TSk*.8,6);
      ctx.fillStyle='#bbf7d0'; ctx.font='bold 3.4px sans-serif'; ctx.textBaseline='middle';
      ctx.fillText(label,sx+TSk/2,sy+TSk-4); }
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  }
  switch(t){
    case '#':{ // muro/seto perimetral del zoo
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TSk,TSk);
      ctx.fillStyle='#166534'; ctx.fillRect(sx+1,sy+1,TSk-2,TSk-2);
      ctx.fillStyle='rgba(74,160,70,.5)';
      const h=Math.sin(mC*7+mR*13);
      ctx.beginPath(); ctx.arc(sx+TSk*.3,sy+TSk*.35,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx+TSk*.68,sy+TSk*.6,4.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(20,60,30,.6)'; ctx.fillRect(sx,sy+TSk-3,TSk,3);
      break; }
    case '.':{ // sendero lateral (adoquín claro)
      ctx.fillStyle=(mR+mC)%2?'#d9c7a3':'#cdb88f'; ctx.fillRect(sx,sy,TSk,TSk);
      ctx.strokeStyle='rgba(120,90,50,.18)'; ctx.lineWidth=.5; ctx.strokeRect(sx,sy,TSk,TSk);
      break; }
    case 'c':{ // PASILLO CENTRAL grande (empedrado ancho)
      ctx.fillStyle=(mR+mC)%2?'#e8d9b5':'#dcc99c';
      ctx.fillRect(sx,sy,TSk,TSk);
      // banda central decorativa
      ctx.fillStyle='rgba(180,140,70,.18)'; ctx.fillRect(sx,sy+TSk*.4,TSk,TSk*.2);
      ctx.strokeStyle='rgba(150,110,50,.15)'; ctx.lineWidth=.5; ctx.strokeRect(sx+1,sy+1,TSk-2,TSk-2);
      break; }
    case 'E':{ const ge=.5+.5*Math.sin(tick*.09); ctx.fillStyle=`rgba(100,221,23,${.3+.15*ge})`; ctx.fillRect(sx,sy,TSk,TSk); ctx.strokeStyle=`rgba(174,234,0,${.7+.2*ge})`; ctx.lineWidth=2; ctx.strokeRect(sx+3,sy+3,TSk-6,TSk-6); ctx.globalAlpha=.7+.3*ge; ctx.font='13px serif'; ctx.textBaseline='middle'; ctx.textAlign='center'; ctx.fillText('🚪',sx+TSk/2,sy+TSk/2); ctx.globalAlpha=1; ctx.fillStyle='#bbf7d0'; ctx.font='bold 3.4px sans-serif'; ctx.textBaseline='top'; ctx.fillText('SALIDA',sx+TSk/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'W':{ // estanque
      const wf=.5+.5*Math.sin(tick*.08+mC*.4);
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx,sy,TSk,TSk);
      ctx.fillStyle=`rgba(34,150,210,${.8})`; ctx.fillRect(sx+2,sy+2,TSk-4,TSk-4);
      ctx.strokeStyle=`rgba(186,230,253,${.4+.3*wf})`; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(sx+TSk/2,sy+TSk/2,TSk*.22,0,Math.PI*2); ctx.stroke();
      break; }
    case 'b':{ // banca
      ctx.fillStyle=(mR+mC)%2?'#e8d9b5':'#dcc99c'; ctx.fillRect(sx,sy,TSk,TSk);
      ctx.fillStyle='#8a5a2b'; ctx.fillRect(sx+TSk*.18,sy+TSk*.5,TSk*.64,TSk*.18);
      ctx.fillStyle='#6b4423'; ctx.fillRect(sx+TSk*.18,sy+TSk*.36,TSk*.64,TSk*.08);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TSk*.22,sy+TSk*.68,TSk*.06,TSk*.18);
      ctx.fillRect(sx+TSk*.72,sy+TSk*.68,TSk*.06,TSk*.18);
      break; }
    case 'T':{ ctx.fillStyle='#cdb88f'; ctx.fillRect(sx,sy,TSk,TSk); if(typeof drawPineMed==='function') drawPineMed(sx,sy); break; }
    case 'I':{ // cartel informativo / GUÍA del zoo
      const ip=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle=(mR+mC)%2?'#e8d9b5':'#dcc99c'; ctx.fillRect(sx,sy,TSk,TSk);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TSk*.46,sy+TSk*.5,TSk*.08,TSk*.4);
      ctx.fillStyle='#15803d'; ctx.fillRect(sx+TSk*.2,sy+TSk*.12,TSk*.6,TSk*.4);
      ctx.fillStyle='#166534'; ctx.fillRect(sx+TSk*.22,sy+TSk*.14,TSk*.56,TSk*.36);
      ctx.shadowColor=`rgba(134,239,172,${.4+.4*ip})`; ctx.shadowBlur=4;
      ctx.font='8px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🗺️',sx+TSk/2,sy+TSk*.3); ctx.shadowBlur=0;
      ctx.fillStyle='#fde68a'; ctx.font='bold 3px sans-serif'; ctx.textBaseline='top';
      ctx.fillText('GUÍA',sx+TSk/2,sy+TSk*.55); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'S':{ // TIENDA SAFARI
      const sp=.5+.5*Math.sin(tick*.1);
      ctx.fillStyle='#7c2d12'; ctx.fillRect(sx,sy,TSk,TSk);
      // toldo a rayas safari
      ctx.fillStyle='#d97706'; ctx.fillRect(sx,sy+2,TSk,TSk*.35);
      ctx.fillStyle='#92400e'; for(let i=0;i<4;i++) ctx.fillRect(sx+i*(TSk/4),sy+2,TSk/8,TSk*.35);
      ctx.fillStyle='#a16207'; ctx.fillRect(sx+2,sy+TSk*.4,TSk-4,TSk*.55);
      ctx.shadowColor=`rgba(251,191,36,${.4+.4*sp})`; ctx.shadowBlur=5;
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🛖',sx+TSk/2,sy+TSk*.62); ctx.shadowBlur=0;
      ctx.fillStyle='#fde68a'; ctx.font='bold 3px sans-serif'; ctx.textBaseline='top';
      ctx.fillText('SAFARI',sx+TSk/2,sy+TSk-5); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'B':{ // ARENA DE JEFE animal
      ctx.fillStyle='#1a1208'; ctx.fillRect(sx,sy,TSk,TSk);
      const rp=.45+.55*Math.sin(tick*.12);
      ctx.fillStyle=`rgba(180,90,20,${rp*.4})`; ctx.fillRect(sx+2,sy+2,TSk-4,TSk-4);
      ctx.strokeStyle=`rgba(251,146,60,${rp})`; ctx.lineWidth=2.2; ctx.strokeRect(sx+2,sy+2,TSk-4,TSk-4);
      ctx.globalAlpha=rp; ctx.font='15px serif'; ctx.textBaseline='middle'; ctx.textAlign='center';
      ctx.fillText('🦏',sx+TSk/2,sy+TSk/2); ctx.globalAlpha=1;
      ctx.fillStyle=`rgba(254,215,170,${rp})`; ctx.font='bold 4px sans-serif'; ctx.textBaseline='top';
      ctx.fillText('★JEFE★',sx+TSk/2,sy+2); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    // ── ANIMALES (recintos) ──
    case 't': pen('🐗','TAPIR','#8a7050','#6b5436','rgba(120,90,60,.6)'); break;
    case 'p': pen('🦫','CAPIBARA','#9a8050','#7a6438','rgba(180,130,70,.6)'); break;
    case 'r': pen('🦏','RINOCERONTE','#9a9aa2','#76767e','rgba(150,150,160,.6)'); break;
    case 'e': pen('🐘','ELEFANTE','#9a9aa2','#76767e','rgba(160,160,170,.6)'); break;
    case 'l': pen('🦭','LEÓN MARINO','#6a7a8a','#4a5a6a','rgba(120,140,160,.6)'); break;
    case 'm': pen('🐒','MONOS','#7a6038','#5a4424','rgba(120,90,60,.6)'); break;
    case 'f': pen('🦩','FLAMENCOS','#d98aa8','#b56880','rgba(244,114,182,.6)'); break;
    case 'o': pen('🐻','OSO','#6a4a30','#4a3020','rgba(90,60,40,.6)'); break;
    case 'j': pen('🦒','JIRAFA','#caa050','#a88038','rgba(220,180,90,.6)'); break;
    case 'k': pen('🐊','COCODRILO','#4a7a40','#356030','rgba(70,120,60,.6)'); break;
    case 's': pen('🐍','SERPIENTES','#7a9a40','#5a7a30','rgba(120,150,60,.6)'); break;
    default:{ ctx.fillStyle='#cdb88f'; ctx.fillRect(sx,sy,TSk,TSk); }
  }
}
function drawJardinEdenTile(t,sx,sy,mR,mC){
  const p=.5+.5*Math.sin(tick*.05+mC*.3);
  switch(t){
    case '#':{ drawStoneMed(sx,sy,mC,mR); ctx.fillStyle='rgba(74,140,52,.4)'; ctx.fillRect(sx,sy,TS,3); break; }
    case '.':{ drawGrassMed(sx,sy,mC,mR); break; }
    case 'g':{ drawGrassMed(sx,sy,mC,mR); break; }
    case 'p':{ drawStoneMed(sx,sy,mC,mR); break; }
    case 'T':{ drawGrassMed(sx,sy,mC,mR); drawPineMed(sx,sy); break; }
    case 'f':{ drawGrassMed(sx,sy,mC,mR); drawPineMed(sx,sy); break; }
    case 'o':{ drawGrassMed(sx,sy,mC,mR); drawRockMed(sx,sy); break; }
    case 'w':{ drawWaterMed(sx,sy,mC,mR); break; }
    case 'r':{ drawFlowerMed(sx,sy,'red',mC,mR); break; }
    case 'b':{ drawFlowerMed(sx,sy,'blue',mC,mR); break; }
    case 'd':{ drawFlowerMed(sx,sy,'white',mC,mR); break; }
    case 'A':{ drawGrassMed(sx,sy,mC,mR); drawVerde(sx,sy,mR,mC); ctx.font='10px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🧙',sx+TS/2,sy+TS*.5); ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textBaseline='top'; ctx.fillText('GUÍA',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'K':{ drawGrassMed(sx,sy,mC,mR); const kp=.5+.5*Math.sin(tick*.1); ctx.shadowColor='rgba(251,191,36,'+(.4+.4*kp)+')'; ctx.shadowBlur=6+4*kp; ctx.font='11px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('📖',sx+TS/2,sy+TS*.5); ctx.shadowBlur=0; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textBaseline='top'; ctx.fillText('SABER',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'E':{ const ep=.5+.5*Math.sin(tick*.08); drawStoneMed(sx,sy,mC,mR); ctx.fillStyle='#3a2410'; ctx.fillRect(sx+TS*.18,sy+TS*.1,TS*.64,TS*.8); ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.22,sy+TS*.14,TS*.56,TS*.72); ctx.strokeStyle='#3a2410'; ctx.lineWidth=1; ctx.strokeRect(sx+TS*.22,sy+TS*.14,TS*.28,TS*.72); ctx.strokeRect(sx+TS*.5,sy+TS*.14,TS*.28,TS*.72); ctx.fillStyle='#2a1a0a'; ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.14,TS*.28,Math.PI,0); ctx.fill(); ctx.shadowColor='rgba(251,191,36,'+(.3+.3*ep)+')'; ctx.shadowBlur=4+3*ep; ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(sx+TS*.46,sy+TS*.5,1.5,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0; ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('SALIDA',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'H':{ const hp=.5+.5*Math.sin(tick*.07); drawStoneMed(sx,sy,mC,mR); ctx.fillStyle='#7f1d1d'; ctx.fillRect(sx+TS*.18,sy+TS*.12,TS*.64,TS*.76); ctx.fillStyle='#991b1b'; ctx.fillRect(sx+TS*.22,sy+TS*.16,TS*.56,TS*.68); ctx.fillStyle='#fbbf24'; ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🏆',sx+TS/2,sy+TS*.5); ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textBaseline='top'; ctx.fillText('TROFEOS',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case 'C':{ // Profesora Carol — jardín
      const cp=.5+.5*Math.sin(tick*.06+mC);
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#db2777'; ctx.fillRect(sx+TS*.22,sy+TS*.42,TS*.56,TS*.42);
      ctx.fillStyle='#ec4899'; ctx.fillRect(sx+TS*.18,sy+TS*.6,TS*.64,TS*.32);
      ctx.fillStyle='#f9a8d4'; ctx.beginPath();
      ctx.arc(sx+TS*.5,sy+TS*.24,TS*.17,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#92400e';
      ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.18,TS*.19,Math.PI,0); ctx.fill();
      ctx.fillRect(sx+TS*.31,sy+TS*.17,TS*.1,TS*.44);
      ctx.fillRect(sx+TS*.59,sy+TS*.17,TS*.1,TS*.44);
      ctx.fillStyle='#fff';
      ctx.fillRect(sx+TS*.39,sy+TS*.21,TS*.09,TS*.08);
      ctx.fillRect(sx+TS*.52,sy+TS*.21,TS*.09,TS*.08);
      ctx.fillStyle='#7c3aed';
      ctx.fillRect(sx+TS*.42,sy+TS*.22,TS*.05,TS*.06);
      ctx.fillRect(sx+TS*.55,sy+TS*.22,TS*.05,TS*.06);
      ctx.shadowColor=`rgba(236,72,153,${.5+.4*cp})`; ctx.shadowBlur=5+4*cp;
      ctx.font='5px serif'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText('💕',sx+TS*.78,sy+2); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fce7f3';
      ctx.textBaseline='top'; ctx.fillText('CAROL',sx+TS/2,sy+1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case '%':{ drawGrassMed(sx,sy,mC,mR); ctx.fillStyle='#6b4423'; ctx.fillRect(sx+TS*.2,sy+TS*.25,TS*.6,TS*.4); ctx.fillStyle='#8a5a2b'; ctx.fillRect(sx+TS*.22,sy+TS*.27,TS*.56,TS*.1); ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.45,sy+TS*.6,TS*.1,TS*.3); ctx.font='7px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('📜',sx+TS/2,sy+TS*.45); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break; }
    case '*':{ drawGrassMed(sx,sy,mC,mR); break; }
    case 'Q':{ drawFountainMed(sx,sy,mC,mR); break; }
    case 'Y':{ drawHedgeMed(sx,sy,mC,mR); break; }
    case 'G':{ drawGrassMed(sx,sy,mC,mR); drawHedgeMed(sx,sy,mC,mR); break; }
    default: drawGrassMed(sx,sy,mC,mR);
  }
}
function drawCasaIntTile(t,sx,sy,mR,mC){
  switch(t){
    case '#':{ // pared interior de madera/piedra
      ctx.fillStyle='#4a3520'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#5a4530'; ctx.fillRect(sx+1,sy+1,TS-2,TS*.45);
      ctx.fillStyle='#3a2810'; ctx.fillRect(sx,sy+TS-3,TS,3); break;}
    case '.':{ // piso de madera
      ctx.fillStyle=(mC%2)?'#8a6a3a':'#7a5a30'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(sx,sy+TS-2,TS,2); break;}
    case 't':{ // mesa de madera
      ctx.fillStyle='#7a5a30'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.1,sy+TS*.2,TS*.8,TS*.5);
      ctx.fillStyle='#6b4423'; ctx.fillRect(sx+TS*.1,sy+TS*.2,TS*.8,TS*.1);
      ctx.fillStyle='#3a2410'; ctx.fillRect(sx+TS*.15,sy+TS*.7,TS*.1,TS*.25);
      ctx.fillRect(sx+TS*.75,sy+TS*.7,TS*.1,TS*.25); break;}
    case 'b':{ // estantería de libros (interactiva)
      ctx.fillStyle='#7a5a30'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      const cols=['#b91c1c','#1d4ed8','#16a34a','#a16207','#7c3aed'];
      for(let i=0;i<5;i++){ ctx.fillStyle=cols[i]; ctx.fillRect(sx+4+i*5,sy+5,4,TS*.4); }
      for(let i=0;i<5;i++){ ctx.fillStyle=cols[(i+2)%5]; ctx.fillRect(sx+4+i*5,sy+TS*.55,4,TS*.35); }
      break;}
    case 'c':{ // cofre/baúl (interactivo)
      ctx.fillStyle='#7a5a30'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#6b4423'; ctx.fillRect(sx+TS*.2,sy+TS*.35,TS*.6,TS*.5);
      ctx.fillStyle='#8a5a2b'; ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.35,TS*.3,Math.PI,0); ctx.fill();
      ctx.fillStyle='#c9a227'; ctx.fillRect(sx+TS*.45,sy+TS*.4,TS*.1,TS*.15);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.2,sy+TS*.55,TS*.6,3); break;}
    case 'm':{ // chimenea/fogón
      ctx.fillStyle='#7a5a30'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#5a5048'; ctx.fillRect(sx+TS*.15,sy+TS*.2,TS*.7,TS*.7);
      ctx.fillStyle='#2a2018'; ctx.fillRect(sx+TS*.28,sy+TS*.4,TS*.44,TS*.5);
      const fl=.5+.5*Math.sin(tick*.2);
      ctx.fillStyle=`rgba(251,146,60,${.7+.3*fl})`; ctx.beginPath();
      ctx.moveTo(sx+TS*.5,sy+TS*.5); ctx.lineTo(sx+TS*.6,sy+TS*.8); ctx.lineTo(sx+TS*.4,sy+TS*.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle=`rgba(254,240,138,${.6+.4*fl})`; ctx.fillRect(sx+TS*.46,sy+TS*.62,TS*.08,TS*.18); break;}
    case 'l':{ // cama
      ctx.fillStyle='#7a5a30'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.1,sy+TS*.15,TS*.8,TS*.75);
      ctx.fillStyle='#e0e7ff'; ctx.fillRect(sx+TS*.15,sy+TS*.2,TS*.7,TS*.3); // almohada
      ctx.fillStyle='#7c3aed'; ctx.fillRect(sx+TS*.15,sy+TS*.45,TS*.7,TS*.4); break;}
    case 'E':{ drawHouseDoor(sx,sy);
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textAlign='center';
      ctx.textBaseline='top'; ctx.fillText('SALIR',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    default: ctx.fillStyle='#7a5a30'; ctx.fillRect(sx,sy,TS,TS);
  }
}

function drawLabTile(t,sx,sy,mR,mC){
  const lab=currentMap==='laboratorio';
  switch(t){
    case '#': ctx.fillStyle=lab?'#1e293b':'#3a2a1a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=lab?'#283548':'#4a3520'; ctx.fillRect(sx+1,sy+1,TS-2,TS*.4); break;
    case '.': ctx.fillStyle=lab?(mC%2?'#cbd5e1':'#bcc7d6'):'#8a6a3a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(0,0,0,.06)'; ctx.fillRect(sx,sy+TS-2,TS,2); break;
    case 'i': // ventana
      ctx.fillStyle=lab?'#283548':'#4a3520'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#bae6fd'; ctx.fillRect(sx+TS*.2,sy+TS*.2,TS*.6,TS*.6);
      ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(sx+TS*.5,sy+TS*.2); ctx.lineTo(sx+TS*.5,sy+TS*.8);
      ctx.moveTo(sx+TS*.2,sy+TS*.5); ctx.lineTo(sx+TS*.8,sy+TS*.5); ctx.stroke(); break;
    case 'b': // estante de reactivos
      ctx.fillStyle='#283548'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ['#22d3ee','#a3e635','#f472b6','#fbbf24'].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(sx+4+i*5,sy+5,3,6);});
      ['#60a5fa','#34d399'].forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(sx+5+i*8,sy+TS*.55,4,8);}); break;
    case 't': // mesa de laboratorio con material
      ctx.fillStyle='#cbd5e1'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#475569'; ctx.fillRect(sx+TS*.1,sy+TS*.45,TS*.8,TS*.4);
      ctx.fillStyle='#64748b'; ctx.fillRect(sx+TS*.1,sy+TS*.45,TS*.8,TS*.08);
      // matraz
      ctx.fillStyle='#22d3ee'; ctx.beginPath(); ctx.moveTo(sx+TS*.3,sy+TS*.25); ctx.lineTo(sx+TS*.38,sy+TS*.45); ctx.lineTo(sx+TS*.22,sy+TS*.45); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#94a3b8'; ctx.fillRect(sx+TS*.28,sy+TS*.2,TS*.04,TS*.08);
      ctx.fillStyle='#3a2a1a'; ctx.fillRect(sx+TS*.15,sy+TS*.85,TS*.08,TS*.13); ctx.fillRect(sx+TS*.77,sy+TS*.85,TS*.08,TS*.13); break;
    case 'k': // banco de carpintería
      ctx.fillStyle='#8a6a3a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#6b4423'; ctx.fillRect(sx+TS*.1,sy+TS*.4,TS*.8,TS*.42);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.1,sy+TS*.4,TS*.8,TS*.08);
      ctx.fillStyle='#3a2410'; ctx.fillRect(sx+TS*.15,sy+TS*.82,TS*.08,TS*.16); ctx.fillRect(sx+TS*.77,sy+TS*.82,TS*.08,TS*.16);
      // martillo
      ctx.strokeStyle='#3a2410'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sx+TS*.3,sy+TS*.3); ctx.lineTo(sx+TS*.5,sy+TS*.42); ctx.stroke();
      ctx.fillStyle='#64748b'; ctx.fillRect(sx+TS*.25,sy+TS*.22,TS*.12,TS*.1); break;
    case 'W': // madera apilada
      ctx.fillStyle='#3a2a1a'; ctx.fillRect(sx,sy,TS,TS);
      for(let i=0;i<3;i++){ ctx.fillStyle=i%2?'#8a6a3a':'#6b4423'; ctx.fillRect(sx+3,sy+5+i*8,TS-6,6);
        ctx.fillStyle='#5a3a1a'; ctx.beginPath(); ctx.arc(sx+6,sy+8+i*8,2,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx+TS-6,sy+8+i*8,2,0,Math.PI*2); ctx.fill(); } break;
    case 'm': // campana extractora
      ctx.fillStyle='#cbd5e1'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#475569'; ctx.fillRect(sx+TS*.15,sy+TS*.1,TS*.7,TS*.5);
      ctx.fillStyle='#1e293b'; ctx.fillRect(sx+TS*.2,sy+TS*.2,TS*.6,TS*.35);
      ctx.fillStyle='#64748b'; ctx.fillRect(sx+TS*.15,sy+TS*.6,TS*.7,TS*.3); break;
    case 's': // sierra
      ctx.fillStyle='#8a6a3a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#94a3b8'; ctx.beginPath(); ctx.moveTo(sx+TS*.2,sy+TS*.3); ctx.lineTo(sx+TS*.8,sy+TS*.3); ctx.lineTo(sx+TS*.8,sy+TS*.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#3a2410'; ctx.fillRect(sx+TS*.15,sy+TS*.28,TS*.1,TS*.3); break;
    case 'Q':{ // estación de síntesis (lab crafting)
      ctx.fillStyle='#cbd5e1'; ctx.fillRect(sx,sy,TS,TS);
      const gl=.5+.5*Math.sin(tick*.1);
      ctx.shadowColor='rgba(34,211,238,'+(.4+.4*gl)+')'; ctx.shadowBlur=6+4*gl;
      ctx.fillStyle='#1e3a4a'; ctx.fillRect(sx+TS*.2,sy+TS*.2,TS*.6,TS*.6);
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⚗️',sx+TS/2,sy+TS*.5);
      ctx.shadowBlur=0; ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'R':{ // estación de tallado (carpentry crafting)
      ctx.fillStyle='#8a6a3a'; ctx.fillRect(sx,sy,TS,TS);
      const gl=.5+.5*Math.sin(tick*.1);
      ctx.shadowColor='rgba(251,191,36,'+(.4+.4*gl)+')'; ctx.shadowBlur=6+4*gl;
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.2,sy+TS*.2,TS*.6,TS*.6);
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🪚',sx+TS/2,sy+TS*.5);
      ctx.shadowBlur=0; ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'E':{ ctx.fillStyle=lab?'#283548':'#4a3520'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#3a2410'; ctx.fillRect(sx+TS*.2,sy+TS*.1,TS*.6,TS*.85);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.24,sy+TS*.14,TS*.52,TS*.78);
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText('SALIR',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    default: ctx.fillStyle=lab?'#cbd5e1':'#8a6a3a'; ctx.fillRect(sx,sy,TS,TS);
  }
}

function drawEstacionTile(t,sx,sy,mR,mC){
  switch(t){
    case '#':{ drawStoneMed(sx,sy,mC,mR); break;}
    case '.':{ drawStoneMed(sx,sy,mC,mR); break;}
    case 'p':{ // andén de piedra clara
      ctx.fillStyle=(mC%2)?'#b0a890':'#a59d85'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(255,255,255,.1)'; ctx.fillRect(sx+1,sy+1,TS-2,2);
      ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(sx+1,sy+TS-2,TS-2,2);
      ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1; ctx.strokeRect(sx,sy,TS,TS);
      if(mR===6){ ctx.fillStyle='#fbbf24'; ctx.fillRect(sx,sy+TS-4,TS,2); } break;} // línea de seguridad
    case 'V':{ // banca de hierro
      drawStoneMed(sx,sy,mC,mR);
      ctx.fillStyle='#3a2a1a'; ctx.fillRect(sx+TS*.15,sy+TS*.45,TS*.7,TS*.12);
      ctx.fillRect(sx+TS*.2,sy+TS*.55,TS*.08,TS*.3); ctx.fillRect(sx+TS*.72,sy+TS*.55,TS*.08,TS*.3);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.15,sy+TS*.3,TS*.7,TS*.06); break;}
    case 'W':{ // torre del reloj
      drawStoneMed(sx,sy,mC,mR);
      ctx.fillStyle='#6b6b6b'; ctx.fillRect(sx+TS*.2,sy,TS*.6,TS);
      ctx.fillStyle='#fde9a8'; ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.35,TS*.18,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#3a2410'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.35,TS*.18,0,Math.PI*2); ctx.stroke();
      // manecillas
      const a=tick*.02;
      ctx.beginPath(); ctx.moveTo(sx+TS*.5,sy+TS*.35); ctx.lineTo(sx+TS*.5+Math.cos(a)*5,sy+TS*.35+Math.sin(a)*5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+TS*.5,sy+TS*.35); ctx.lineTo(sx+TS*.5+Math.cos(a*.5)*7,sy+TS*.35+Math.sin(a*.5)*7); ctx.stroke();
      break;}
    case '=':{ // rieles
      ctx.fillStyle='#5a4a3a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#3a2a1a'; for(let i=0;i<TS;i+=7) ctx.fillRect(sx+i,sy,3,TS); // durmientes
      ctx.fillStyle='#8a8a8a'; ctx.fillRect(sx,sy+TS*.3,TS,2); ctx.fillRect(sx,sy+TS*.6,TS,2); // rieles
      break;}
    case 'L':{ // tren antiguo
      ctx.fillStyle='#5a4a3a'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='#7f1d1d'; ctx.fillRect(sx,sy+TS*.1,TS,TS*.6);
      ctx.fillStyle='#991b1b'; ctx.fillRect(sx,sy+TS*.1,TS,TS*.15);
      ctx.fillStyle='#1a1a1a'; ctx.fillRect(sx,sy+TS*.68,TS,TS*.2);
      ctx.fillStyle='#fde9a8'; ctx.fillRect(sx+TS*.2,sy+TS*.25,TS*.25,TS*.25); // ventana
      ctx.fillStyle='#3a3a3a'; ctx.beginPath(); ctx.arc(sx+TS*.3,sy+TS*.85,TS*.1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx+TS*.7,sy+TS*.85,TS*.1,0,Math.PI*2); ctx.fill(); break;}
    case 'E':{ drawStoneMed(sx,sy,mC,mR);
      ctx.fillStyle='#3a2410'; ctx.fillRect(sx+TS*.15,sy+TS*.1,TS*.7,TS*.85);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.2,sy+TS*.14,TS*.6,TS*.78);
      ctx.font='8px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🏘️',sx+TS/2,sy+TS*.5);
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textBaseline='top'; ctx.fillText('VOLVER',sx+TS/2,sy+1);
      ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    default: drawStoneMed(sx,sy,mC,mR);
  }
}

// ─── Sector Norte: funciones auxiliares de casas medievales ───
function drawHouseWall(sx,sy,mC,mR){
  ctx.fillStyle='#78716c'; ctx.fillRect(sx,sy,TS,TS);
  const bW=Math.ceil(TS/2.5),bH=Math.ceil(TS/3);
  ctx.strokeStyle='#44403c'; ctx.lineWidth=.8;
  for(let r=0;r<3;r++) for(let c=-1;c<=2;c++){
    const ox=(r%2)*(bW/2);
    ctx.strokeRect(sx+c*bW+ox,sy+r*bH,bW-1,bH-1);
  }
}
function drawHouseWindow(sx,sy,mC,mR){
  drawHouseWall(sx,sy,mC,mR);
  ctx.fillStyle='#0c1931'; ctx.fillRect(sx+TS*.2,sy+TS*.2,TS*.6,TS*.6);
  const wp=.4+.3*Math.sin(tick*.04+mC*.3);
  ctx.fillStyle=`rgba(186,230,253,${.4+.2*wp})`; ctx.fillRect(sx+TS*.23,sy+TS*.23,TS*.54,TS*.54);
  ctx.fillStyle='#78716c';
  ctx.fillRect(sx+TS*.2,sy+TS*.47,TS*.6,TS*.06);
  ctx.fillRect(sx+TS*.47,sy+TS*.2,TS*.06,TS*.6);
}
function drawHouseRoof(sx,sy,mC,mR){
  ctx.fillStyle='#7f1d1d'; ctx.fillRect(sx,sy,TS,TS);
  for(let i=0;i<3;i++){
    ctx.fillStyle=i%2===0?'#991b1b':'#b91c1c';
    ctx.fillRect(sx,sy+i*(TS/3),TS,TS/3-1);
  }
  ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(sx,sy+TS-4,TS,4);
  ctx.fillStyle='rgba(255,255,255,.07)'; ctx.fillRect(sx,sy,TS,3);
}
function drawRoofPeak(sx,sy){
  ctx.fillStyle='#7f1d1d'; ctx.fillRect(sx,sy,TS,TS);
  ctx.fillStyle='#b91c1c';
  ctx.beginPath(); ctx.moveTo(sx+TS*.5,sy+2); ctx.lineTo(sx+2,sy+TS-2); ctx.lineTo(sx+TS-2,sy+TS-2); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(sx,sy+TS-4,TS,4);
}
function drawWell(sx,sy){
  ctx.fillStyle='#44403c'; ctx.fillRect(sx,sy,TS,TS);
  ctx.fillStyle='#78716c'; ctx.fillRect(sx+TS*.25,sy+TS*.38,TS*.5,TS*.32);
  ctx.fillStyle='#0c4a6e';
  ctx.beginPath(); ctx.ellipse(sx+TS*.5,sy+TS*.52,TS*.2,TS*.1,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#92400e';
  ctx.fillRect(sx+TS*.18,sy+TS*.12,TS*.07,TS*.28);
  ctx.fillRect(sx+TS*.75,sy+TS*.12,TS*.07,TS*.28);
  ctx.fillRect(sx+TS*.12,sy+TS*.08,TS*.76,TS*.07);
  ctx.font='8px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('💧',sx+TS*.5,sy+TS*.55); ctx.textAlign='left'; ctx.textBaseline='alphabetic';
}
function drawHouseDoor(sx,sy){
  drawHouseWall(sx,sy,0,0);
  ctx.fillStyle='#3a1a00'; ctx.fillRect(sx+TS*.2,sy+TS*.15,TS*.6,TS*.85);
  ctx.fillStyle='#5c2a00'; ctx.fillRect(sx+TS*.23,sy+TS*.18,TS*.54,TS*.79);
  ctx.fillStyle='#3a1a00';
  ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.36,TS*.27,Math.PI,0); ctx.fill();
  ctx.fillStyle='#fbbf24';
  ctx.beginPath(); ctx.arc(sx+TS*.62,sy+TS*.58,TS*.04,0,Math.PI*2); ctx.fill();
}

function drawSectorNorteTile(t,sx,sy,mR,mC){
  if(medTerrain(t,sx,sy,mC,mR)) return;
  switch(t){
    case '#': drawStoneMed(sx,sy,mC,mR); break;
    case 'H': drawHouseWall(sx,sy,mC,mR); break;
    case 'i': drawHouseWindow(sx,sy,mC,mR); break;
    case 'Y': drawHouseRoof(sx,sy,mC,mR); break;
    case 'y': drawRoofPeak(sx,sy); break;
    case 'O': drawWell(sx,sy); break;
    case 'D':{ // puerta de casa con número
      drawHouseDoor(sx,sy);
      ctx.shadowColor='rgba(251,191,36,.5)'; ctx.shadowBlur=4+2*Math.sin(tick*.08);
      ctx.fillStyle='#fde68a'; ctx.font='bold 4px sans-serif'; ctx.textAlign='center';
      ctx.fillText('🚪',sx+TS/2,sy+TS*.5); ctx.shadowBlur=0; ctx.textAlign='left'; break;}
    case 'B':{ // salida a Plaza
      drawStoneMed(sx,sy,mC,mR);
      ctx.fillStyle='#3a2410'; ctx.fillRect(sx+TS*.15,sy+TS*.1,TS*.7,TS*.85);
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.2,sy+TS*.14,TS*.6,TS*.78);
      ctx.font='8px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🏛️',sx+TS/2,sy+TS*.5);
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fde68a'; ctx.textBaseline='top';
      ctx.fillText('PLAZA',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    case 'N':{ // salida a Estación de trenes
      drawStoneMed(sx,sy,mC,mR);
      ctx.fillStyle='#4a4438'; ctx.fillRect(sx+TS*.15,sy+TS*.15,TS*.7,TS*.8);
      ctx.font='9px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🚉',sx+TS/2,sy+TS*.5);
      ctx.font='bold 3px sans-serif'; ctx.fillStyle='#93c5fd'; ctx.textBaseline='top';
      ctx.fillText('ESTACIÓN',sx+TS/2,sy+1); ctx.textAlign='left'; ctx.textBaseline='alphabetic'; break;}
    default: drawGrassMed(sx,sy,mC,mR);
  }
}

function drawSegundoPisoTile(t,sx,sy,mR,mC){
  const p=.5+.5*Math.sin(tick*.05+mC*.2);
  switch(t){
    case '#':{ ctx.fillStyle='#334155';ctx.fillRect(sx,sy,TS,TS);ctx.fillStyle='#475569';ctx.fillRect(sx,sy,TS,2);ctx.fillStyle='#1e293b';ctx.fillRect(sx,sy+TS-2,TS,2);break;}
    case '.':{
      ctx.fillStyle='#f0ebe0';ctx.fillRect(sx,sy,TS,TS);
      ctx.strokeStyle='#d6cfc0';ctx.lineWidth=.5;
      ctx.strokeRect(sx+.5,sy+.5,TS/2,TS/2);ctx.strokeRect(sx+TS/2,sy+TS/2,TS/2,TS/2);break;}
    case 'E':{
      const ep=.4+.4*Math.sin(tick*.08+mC);
      ctx.fillStyle='#7c3aed';ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle=`rgba(167,139,250,${ep})`; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
      ctx.shadowColor='rgba(167,139,250,.7)';ctx.shadowBlur=5+4*ep;
      ctx.font='8px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('🚪',sx+TS/2,sy+TS/2); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#c4b5fd';
      ctx.textBaseline='top';ctx.fillText('AULA',sx+TS/2,sy+2);
      ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case '^':{
      const sp2=.5+.5*Math.sin(tick*.07);
      ctx.fillStyle='#292524';ctx.fillRect(sx,sy,TS,TS);
      // Steps
      for(let i=0;i<3;i++){ctx.fillStyle=`rgba(${180+i*20},${160+i*20},${140+i*20},.9)`;ctx.fillRect(sx+2+i*4,sy+TS*.3+i*6,TS-4-i*8,TS*.15);}
      ctx.shadowColor='rgba(251,191,36,.5)';ctx.shadowBlur=4+3*sp2;
      ctx.font='8px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('⬇️',sx+TS/2,sy+TS*.65); ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#fbbf24';
      ctx.textBaseline='top';ctx.fillText('BAJAR',sx+TS/2,sy+1);
      ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    default:ctx.fillStyle='#e2e8f0';ctx.fillRect(sx,sy,TS,TS);
  }
}

// ─── drawSala5toTile (Atacama) ────────────────────────────────
function drawSala5toTile(t,sx,sy,mR,mC){
  // 5° Básico — Región Atacama (desierto, cactus, arena)
  const p=.5+.5*Math.sin(tick*.04+mC*.3+mR*.2);
  const isDeskRow=[3,5,7].includes(mR), isDeskCol=[3,6,9,12,15,18].includes(mC);
  switch(t){
    case '#':{
      ctx.fillStyle='#7c2d12'; ctx.fillRect(sx,sy,TS,TS);
      // PIZARRÓN (row 0, cols 3..18)
      if(mR===0&&mC>=3&&mC<=18){
        ctx.fillStyle='#14532d'; ctx.fillRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='#c2410c'; ctx.lineWidth=1;
        ctx.strokeRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=.8;
        if(mC===8){ctx.beginPath();ctx.moveTo(sx+3,sy+TS*.55);ctx.lineTo(sx+TS-3,sy+TS*.55);ctx.stroke();}
        if(mC===14){ctx.font='5px serif';ctx.fillStyle='rgba(255,255,255,.6)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🌵',sx+TS/2,sy+TS/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';}
        break;
      }
      // VENTANAS (rows 2,4,6 en cols 0 y 21)
      if((mC===0||mC===21)&&[2,4,6].includes(mR)){
        ctx.fillStyle='#bae6fd'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
        ctx.strokeStyle='#fff'; ctx.lineWidth=1;
        ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
        ctx.beginPath();
        ctx.moveTo(sx+TS/2,sy+2);ctx.lineTo(sx+TS/2,sy+TS-2);
        ctx.moveTo(sx+2,sy+TS*.5);ctx.lineTo(sx+TS-2,sy+TS*.5);
        ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(sx+3,sy+3,TS*.35,TS*.35);
        break;
      }
      ctx.fillStyle='#c2410c'; ctx.fillRect(sx,sy,TS,2); break;}
    case '.':{
      // Piso tipo arena (damero)
      ctx.fillStyle='#fef3c7'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(234,179,8,.12)'; ctx.fillRect(sx+(mC%2?TS*.5:0),sy+(mR%2?TS*.5:0),TS*.5,TS*.5);
      // MESAS DE ALUMNOS
      if(isDeskRow&&isDeskCol){
        ctx.fillStyle='#b45309'; ctx.fillRect(sx+2,sy+TS*.38,TS-4,TS*.07);
        ctx.fillStyle='#92400e'; ctx.fillRect(sx+2,sy+TS*.45,TS-4,TS*.3);
        ctx.fillStyle='#78350f';
        ctx.fillRect(sx+3,sy+TS*.76,3,TS*.22);
        ctx.fillRect(sx+TS-6,sy+TS*.76,3,TS*.22);
        if((mC+mR)%3===0){ctx.fillStyle='#f97316';ctx.fillRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.5;ctx.strokeRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);}
      }
      // MESA DEL PROFESOR
      if(mR===4&&[5,6,7].includes(mC)){
        ctx.fillStyle='rgba(249,115,22,.15)'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.44);
        ctx.fillStyle='#f97316'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.06);
      }
      break;}
    case 'g':{ctx.fillStyle='#d97706';ctx.fillRect(sx,sy,TS,TS);ctx.font='8px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🌵',sx+TS/2,sy+TS/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case 'E':{drawExit(sx,sy,'#f97316','SALIR');break;}
    case '!':{
      ctx.fillStyle='#fef3c7';ctx.fillRect(sx,sy,TS,TS);
      drawProfesorBase(sx,sy,'#c4956a','#2d1b00','#1e40af');
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#78350f';ctx.textBaseline='top';ctx.textAlign='center';ctx.fillText('JORGE',sx+TS/2,sy+1);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case '*':{
      ctx.fillStyle='#fef3c7';ctx.fillRect(sx,sy,TS,TS);
      ctx.shadowColor='rgba(251,191,36,.9)';ctx.shadowBlur=8+6*p;
      ctx.font='10px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⭕',sx+TS/2,sy+TS*.52);ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#f97316';ctx.textBaseline='top';ctx.fillText('(6/10)',sx+TS/2,sy+2);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    default:ctx.fillStyle='#fef3c7';ctx.fillRect(sx,sy,TS,TS);
  }
}

// ─── drawSala6toTile (Región Metropolitana) ───────────────────
function drawSala6toTile(t,sx,sy,mR,mC){
  // 6° Básico — Región Metropolitana (urbano, metro, Santiago)
  const p=.5+.5*Math.sin(tick*.04+mC*.3+mR*.2);
  const isDeskRow=[3,5,7].includes(mR), isDeskCol=[3,6,9,12,15,18].includes(mC);
  switch(t){
    case '#':{
      ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx,sy,TS,TS);
      if(mR===0&&mC>=3&&mC<=18){
        ctx.fillStyle='#166534'; ctx.fillRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='#3b82f6'; ctx.lineWidth=1;
        ctx.strokeRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=.8;
        if(mC===8){ctx.beginPath();ctx.moveTo(sx+3,sy+TS*.45);ctx.lineTo(sx+TS-3,sy+TS*.45);ctx.moveTo(sx+3,sy+TS*.65);ctx.lineTo(sx+TS-3,sy+TS*.65);ctx.stroke();}
        if(mC===14){ctx.font='5px serif';ctx.fillStyle='rgba(255,255,255,.6)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('⭐',sx+TS/2,sy+TS/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';}
        break;
      }
      if((mC===0||mC===21)&&[2,4,6].includes(mR)){
        ctx.fillStyle='#bae6fd'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
        ctx.strokeStyle='#fff'; ctx.lineWidth=1;
        ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
        ctx.beginPath();
        ctx.moveTo(sx+TS/2,sy+2);ctx.lineTo(sx+TS/2,sy+TS-2);
        ctx.moveTo(sx+2,sy+TS*.5);ctx.lineTo(sx+TS-2,sy+TS*.5);
        ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(sx+3,sy+3,TS*.35,TS*.35);
        break;
      }
      ctx.fillStyle='#3b82f6'; ctx.fillRect(sx,sy,TS,2); break;}
    case '.':{
      ctx.fillStyle='#e0e7ff'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(99,102,241,.1)'; ctx.fillRect(sx+(mC%2?TS*.5:0),sy+(mR%2?TS*.5:0),TS*.5,TS*.5);
      if(isDeskRow&&isDeskCol){
        ctx.fillStyle='#2563eb'; ctx.fillRect(sx+2,sy+TS*.38,TS-4,TS*.07);
        ctx.fillStyle='#1e3a5f'; ctx.fillRect(sx+2,sy+TS*.45,TS-4,TS*.3);
        ctx.fillStyle='#1e3a5f';
        ctx.fillRect(sx+3,sy+TS*.76,3,TS*.22);
        ctx.fillRect(sx+TS-6,sy+TS*.76,3,TS*.22);
        if((mC+mR)%3===0){ctx.fillStyle='#6366f1';ctx.fillRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.5;ctx.strokeRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);}
      }
      if(mR===4&&[5,6,7].includes(mC)){
        ctx.fillStyle='rgba(37,99,235,.15)'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.44);
        ctx.fillStyle='#2563eb'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.06);
      }
      break;}
    case 'g':{ctx.fillStyle='#1e40af';ctx.fillRect(sx,sy,TS,TS);ctx.font='7px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🚇',sx+TS/2,sy+TS/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case 'E':{drawExit(sx,sy,'#2563eb','SALIR');break;}
    case '~':{
      ctx.fillStyle='#e0e7ff';ctx.fillRect(sx,sy,TS,TS);
      drawProfesorBase(sx,sy,'#c4956a','#3b1f00','#1e3a5f');
      const ep=.5+.5*Math.sin(tick*.1);
      ctx.shadowColor='rgba(251,191,36,.7)';ctx.shadowBlur=5+3*ep;
      ctx.font='6px serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText('⭐',sx+TS*.8,sy+2);ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#fde68a';ctx.textBaseline='top';ctx.fillText('FELIPE',sx+TS/2,sy+1);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case '*':{
      ctx.fillStyle='#e0e7ff';ctx.fillRect(sx,sy,TS,TS);
      ctx.shadowColor='rgba(251,191,36,.9)';ctx.shadowBlur=8+6*p;
      ctx.font='10px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💊',sx+TS/2,sy+TS*.52);ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#2563eb';ctx.textBaseline='top';ctx.fillText('(1/10)',sx+TS/2,sy+2);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    default:ctx.fillStyle='#e0e7ff';ctx.fillRect(sx,sy,TS,TS);
  }
}

// ─── drawSala7moTile (Región del Maule) ──────────────────────
function drawSala7moTile(t,sx,sy,mR,mC){
  // 7° Básico — Región del Maule (viñedos, campo)
  const p=.5+.5*Math.sin(tick*.04+mC*.3+mR*.2);
  const isDeskRow=[3,5,7].includes(mR), isDeskCol=[3,6,9,12,15,18].includes(mC);
  switch(t){
    case '#':{
      ctx.fillStyle='#14532d'; ctx.fillRect(sx,sy,TS,TS);
      if(mR===0&&mC>=3&&mC<=18){
        ctx.fillStyle='#166534'; ctx.fillRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='#16a34a'; ctx.lineWidth=1;
        ctx.strokeRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=.8;
        if(mC===8){ctx.beginPath();ctx.moveTo(sx+3,sy+TS*.5);ctx.lineTo(sx+TS-3,sy+TS*.5);ctx.stroke();}
        if(mC===14){ctx.font='5px serif';ctx.fillStyle='rgba(255,255,255,.6)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🍇',sx+TS/2,sy+TS/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';}
        break;
      }
      if((mC===0||mC===21)&&[2,4,6].includes(mR)){
        ctx.fillStyle='#bae6fd'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
        ctx.strokeStyle='#fff'; ctx.lineWidth=1;
        ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
        ctx.beginPath();
        ctx.moveTo(sx+TS/2,sy+2);ctx.lineTo(sx+TS/2,sy+TS-2);
        ctx.moveTo(sx+2,sy+TS*.5);ctx.lineTo(sx+TS-2,sy+TS*.5);
        ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.2)'; ctx.fillRect(sx+3,sy+3,TS*.35,TS*.35);
        break;
      }
      ctx.fillStyle='#16a34a'; ctx.fillRect(sx,sy,TS,2); break;}
    case '.':{
      ctx.fillStyle='#f0fdf4'; ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(21,128,61,.08)'; ctx.fillRect(sx+(mC%2?TS*.5:0),sy+(mR%2?TS*.5:0),TS*.5,TS*.5);
      if(isDeskRow&&isDeskCol){
        ctx.fillStyle='#92400e'; ctx.fillRect(sx+2,sy+TS*.38,TS-4,TS*.07);
        ctx.fillStyle='#78350f'; ctx.fillRect(sx+2,sy+TS*.45,TS-4,TS*.3);
        ctx.fillStyle='#713f12';
        ctx.fillRect(sx+3,sy+TS*.76,3,TS*.22);
        ctx.fillRect(sx+TS-6,sy+TS*.76,3,TS*.22);
        if((mC+mR)%3===0){ctx.fillStyle='#16a34a';ctx.fillRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.5;ctx.strokeRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);}
      }
      if(mR===4&&[5,6,7].includes(mC)){
        ctx.fillStyle='rgba(22,163,74,.12)'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.44);
        ctx.fillStyle='#16a34a'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.06);
      }
      break;}
    case 'g':{ctx.fillStyle='#166534';ctx.fillRect(sx,sy,TS,TS);ctx.font='8px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🍇',sx+TS/2,sy+TS/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case 'E':{drawExit(sx,sy,'#16a34a','SALIR');break;}
    case '?':{
      ctx.fillStyle='#f0fdf4';ctx.fillRect(sx,sy,TS,TS);
      drawProfesorBase(sx,sy,'#7c4a1e','#1a0a00','#065f46');
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#bbf7d0';ctx.textBaseline='top';ctx.textAlign='center';ctx.fillText('JOSÉ',sx+TS/2,sy+1);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case '*':{
      ctx.fillStyle='#f0fdf4';ctx.fillRect(sx,sy,TS,TS);
      ctx.shadowColor='rgba(251,191,36,.9)';ctx.shadowBlur=8+6*p;
      ctx.font='10px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔴',sx+TS/2,sy+TS*.52);ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#16a34a';ctx.textBaseline='top';ctx.fillText('(4/10)',sx+TS/2,sy+2);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    default:ctx.fillStyle='#f0fdf4';ctx.fillRect(sx,sy,TS,TS);
  }
}

// ─── drawSala8voTile (Región Araucanía) ──────────────────────
function drawSala8voTile(t,sx,sy,mR,mC){
  // 8° Básico — Región de La Araucanía (mapuche, bosque)
  const p=.5+.5*Math.sin(tick*.04+mC*.3+mR*.2);
  const isDeskRow=[3,5,7].includes(mR), isDeskCol=[3,6,9,12,15,18].includes(mC);
  switch(t){
    case '#':{
      ctx.fillStyle='#312e81'; ctx.fillRect(sx,sy,TS,TS);
      if(mR===0&&mC>=3&&mC<=18){
        ctx.fillStyle='#1c5b2d'; ctx.fillRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='#6366f1'; ctx.lineWidth=1;
        ctx.strokeRect(sx+1,sy+3,TS-2,TS-5);
        ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=.8;
        if(mC===8){ctx.beginPath();ctx.moveTo(sx+3,sy+TS*.5);ctx.lineTo(sx+TS-3,sy+TS*.5);ctx.stroke();}
        if(mC===14){ctx.font='5px serif';ctx.fillStyle='rgba(255,255,255,.6)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🌲',sx+TS/2,sy+TS/2);ctx.textAlign='left';ctx.textBaseline='alphabetic';}
        break;
      }
      if((mC===0||mC===21)&&[2,4,6].includes(mR)){
        ctx.fillStyle='#bae6fd'; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
        ctx.strokeStyle='#fff'; ctx.lineWidth=1;
        ctx.strokeRect(sx+2,sy+2,TS-4,TS-4);
        ctx.beginPath();
        ctx.moveTo(sx+TS/2,sy+2);ctx.lineTo(sx+TS/2,sy+TS-2);
        ctx.moveTo(sx+2,sy+TS*.5);ctx.lineTo(sx+TS-2,sy+TS*.5);
        ctx.stroke();
        ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(sx+3,sy+3,TS*.35,TS*.35);
        break;
      }
      ctx.fillStyle='#4338ca'; ctx.fillRect(sx,sy,TS,2); break;}
    case '.':{
      ctx.fillStyle='#eef2ff'; ctx.fillRect(sx,sy,TS,TS);
      if((mC+mR)%3===0){ctx.fillStyle='rgba(99,102,241,.1)';ctx.fillRect(sx+TS*.3,sy,2,TS);}
      if(isDeskRow&&isDeskCol){
        ctx.fillStyle='#4338ca'; ctx.fillRect(sx+2,sy+TS*.38,TS-4,TS*.07);
        ctx.fillStyle='#312e81'; ctx.fillRect(sx+2,sy+TS*.45,TS-4,TS*.3);
        ctx.fillStyle='#1e1b4b';
        ctx.fillRect(sx+3,sy+TS*.76,3,TS*.22);
        ctx.fillRect(sx+TS-6,sy+TS*.76,3,TS*.22);
        if((mC+mR)%3===0){ctx.fillStyle='#7c3aed';ctx.fillRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=.5;ctx.strokeRect(sx+TS*.25,sy+TS*.3,TS*.42,TS*.1);}
      }
      if(mR===4&&[5,6,7].includes(mC)){
        ctx.fillStyle='rgba(124,58,237,.12)'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.44);
        ctx.fillStyle='#7c3aed'; ctx.fillRect(sx,sy+TS*.28,TS,TS*.06);
      }
      break;}
    case 'g':{ctx.fillStyle='#1e1b4b';ctx.fillRect(sx,sy,TS,TS);ctx.fillStyle='#166534';ctx.beginPath();ctx.moveTo(sx+TS*.5,sy+2);ctx.lineTo(sx+TS*.8,sy+TS*.6);ctx.lineTo(sx+TS*.2,sy+TS*.6);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(sx+TS*.5,sy+6);ctx.lineTo(sx+TS*.85,sy+TS*.8);ctx.lineTo(sx+TS*.15,sy+TS*.8);ctx.closePath();ctx.fill();ctx.fillStyle='#92400e';ctx.fillRect(sx+TS*.45,sy+TS*.8,TS*.1,TS*.2);break;}
    case 'E':{drawExit(sx,sy,'#7c3aed','SALIR');break;}
    case 'L':{
      ctx.fillStyle='#eef2ff';ctx.fillRect(sx,sy,TS,TS);
      drawProfesoraBase(sx,sy,'#c4956a','#2d1400','#312e81');
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#c7d2fe';ctx.textBaseline='top';ctx.textAlign='center';ctx.fillText('CAMILA',sx+TS/2,sy+1);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    case '*':{
      ctx.fillStyle='#eef2ff';ctx.fillRect(sx,sy,TS,TS);
      ctx.shadowColor='rgba(251,191,36,.9)';ctx.shadowBlur=8+6*p;
      ctx.font='10px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('📏',sx+TS/2,sy+TS*.52);ctx.shadowBlur=0;
      ctx.font='bold 3px sans-serif';ctx.fillStyle='#7c3aed';ctx.textBaseline='top';ctx.fillText('(8/10)',sx+TS/2,sy+2);ctx.textAlign='left';ctx.textBaseline='alphabetic';break;}
    default:ctx.fillStyle='#eef2ff';ctx.fillRect(sx,sy,TS,TS);
  }
}

// ─── Helpers para dibujar profesores ─────────────────────────
function drawExit(sx,sy,color,label){
  const ep=.4+.4*Math.sin(tick*.08);
  ctx.fillStyle='#1e293b';ctx.fillRect(sx,sy,TS,TS);
  ctx.fillStyle=`rgba(${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)},${ep*.7})`;
  ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
  ctx.font='9px serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('🚪',sx+TS/2,sy+TS/2);
  ctx.font='bold 3px sans-serif';ctx.fillStyle=color;
  ctx.textBaseline='top';ctx.fillText(label||'',sx+TS/2,sy+1);
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
}
function drawProfesorBase(sx,sy,skinColor,hairColor,shirtColor){
  // Floor
  ctx.fillStyle='#e2e8f0';ctx.fillRect(sx,sy,TS,TS);
  // Body/shirt
  ctx.fillStyle=shirtColor;ctx.fillRect(sx+TS*.25,sy+TS*.42,TS*.5,TS*.4);
  // Shoulders
  ctx.fillRect(sx+TS*.18,sy+TS*.38,TS*.64,TS*.1);
  // Legs
  ctx.fillStyle='#374151';ctx.fillRect(sx+TS*.27,sy+TS*.72,TS*.2,TS*.26);ctx.fillRect(sx+TS*.53,sy+TS*.72,TS*.2,TS*.26);
  // Shoes
  ctx.fillStyle='#111';ctx.fillRect(sx+TS*.25,sy+TS*.9,TS*.22,TS*.1);ctx.fillRect(sx+TS*.53,sy+TS*.9,TS*.22,TS*.1);
  // Head
  ctx.fillStyle=skinColor;ctx.beginPath();ctx.arc(sx+TS*.5,sy+TS*.26,TS*.17,0,Math.PI*2);ctx.fill();
  // Hair
  ctx.fillStyle=hairColor;ctx.beginPath();ctx.arc(sx+TS*.5,sy+TS*.2,TS*.17,Math.PI,0);ctx.fill();
  ctx.fillRect(sx+TS*.33,sy+TS*.1,TS*.34,TS*.1);
  // Eyes
  ctx.fillStyle='#fff';ctx.fillRect(sx+TS*.41,sy+TS*.23,TS*.07,TS*.06);ctx.fillRect(sx+TS*.52,sy+TS*.23,TS*.07,TS*.06);
  ctx.fillStyle='#111';ctx.fillRect(sx+TS*.44,sy+TS*.24,TS*.04,TS*.04);ctx.fillRect(sx+TS*.55,sy+TS*.24,TS*.04,TS*.04);
}
function drawProfesoraBase(sx,sy,skinColor,hairColor,shirtColor){
  drawProfesorBase(sx,sy,skinColor,hairColor,shirtColor);
  // Override: long hair
  ctx.fillStyle=hairColor||'#3b1f00';
  ctx.fillRect(sx+TS*.33,sy+TS*.12,TS*.34,TS*.45);  // long hair sides
  // Skirt/dress
  ctx.fillStyle=shirtColor;ctx.fillRect(sx+TS*.22,sy+TS*.6,TS*.56,TS*.35);
  // Hair style
  ctx.beginPath();ctx.arc(sx+TS*.5,sy+TS*.18,TS*.18,Math.PI,0);ctx.fill();
}

