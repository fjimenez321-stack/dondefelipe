// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Actividad de los 10 métodos
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ════════════════════════════════════════════════════════
// ACTIVIDAD: 10 MÉTODOS ANTICONCEPTIVOS
// ════════════════════════════════════════════════════════
const ANTI_ITEMS=[
  {id:'pildora',   name:'Píldora Anticonceptiva',     emoji:'💊',num:1, map:'sala_6to',   x:8,y:2,
   desc:'Hormona sintética que inhibe la ovulación.\nEficacia: 99.7% uso correcto | 91% típico\nNo protege contra ITS.'},
  {id:'condon_m',  name:'Condón Masculino',            emoji:'🟡',num:2, map:'biblioteca', x:8,y:3,
   desc:'Barrera física de látex o poliuretano.\nEficacia: 98% correcto | 85% típico\nÚNICO que protege de ITS (VIH, etc.)'},
  {id:'condon_f',  name:'Condón Femenino',             emoji:'🔵',num:3, map:'secretaria', x:1,y:2,
   desc:'Funda interna — la mujer controla su uso.\nEficacia: 95% correcto | 79% típico\nTambién protege contra ITS.'},
  {id:'diu',       name:'DIU (Dispositivo Intrauterino)',emoji:'🔴',num:4,map:'sala_7mo',   x:8,y:2,
   desc:'Dispositivo en T en el útero.\nCobre: altera movilidad espermática.\nEficacia: >99% | Duración: 5-10 años.'},
  {id:'parche',    name:'Parche Anticonceptivo',        emoji:'🩹',num:5, map:'pasillo',    x:15,y:11,
   desc:'Parche adhesivo que libera estrógeno.\nEficacia: 99% uso correcto.\nSe cambia 1 vez por semana.'},
  {id:'anillo',    name:'Anillo Vaginal (NuvaRing)',    emoji:'⭕',num:6, map:'sala_5to',   x:8,y:2,
   desc:'Aro flexible que libera hormonas localmente.\nEficacia: 99% uso correcto.\nDosis hormonal muy baja.'},
  {id:'inyeccion', name:'Inyección Anticonceptiva',     emoji:'💉',num:7, map:'biologia',   x:8,y:3,
   desc:'Progestina de depósito cada 1-3 meses.\nEficacia: 99% uso correcto.\nVentaja: no requiere acción diaria.'},
  {id:'implante',  name:'Implante Subdérmico',          emoji:'📏',num:8, map:'sala_8vo',   x:8,y:2,
   desc:'Varilla 4cm bajo la piel del brazo.\nEficacia: >99% | Duración: 3 años.\nMétodo de larga duración reversible.'},
  {id:'diafragma', name:'Diafragma',                    emoji:'🫙',num:9, map:'plaza',      x:10,y:5,
   desc:'Cúpula de silicona que cubre el cuello uterino.\nSe usa con espermicida. Sin hormonas.\nEficacia: 94% uso correcto.'},
  {id:'espermicida',name:'Espermicida',                 emoji:'🧪',num:10,map:'jardin_eden',x:8,y:4,
   desc:'Sustancia química (nonoxinol-9) que inmoviliza\nespermatozoides. Eficacia: 82% solo.\nSe combina con diafragma o condón.'},
];

function checkAntiPickup(){
  const item=ANTI_ITEMS.find(it=>
    it.map===currentMap&&it.x===player.x&&it.y===player.y&&
    !((progress.antiItems||{})[it.id]));
  if(!item) return;
  if(!progress.antiItems) progress.antiItems={};
  progress.antiItems[item.id]=true;
  if(MAPS[currentMap]?.[item.y]) MAPS[currentMap][item.y][item.x]='.';
  inventory.push({id:'anti_'+item.id,name:item.name,emoji:item.emoji,type:'anti',
    desc:item.desc,use:()=>showDialog(item.emoji+' '+item.name+'\n\n'+item.desc+'\n\nMétodo '+item.num+'/10')});
  syncUI();
  const total=Object.keys(progress.antiItems).length;
  showDialog(item.emoji+' ENCONTRADO! ('+total+'/10)\n\n'+item.name+'\n\n'+item.desc+
    (total===10?'\n\n¡MISIÓN COMPLETADA! Vuelve\ncon el Profe Felipe en 6° Básico.':''));
  if(total===10&&!progress.antiQuestDone){
    progress.antiQuestDone=true; coins+=50; syncUI();
  }
}

function drawAntiItem(sx,sy,item){
  const p=.5+.5*Math.sin(tick*.12+(item.x+item.y)*.4);
  const bounce=Math.sin(tick*.1+(item.x+item.y)*.5)*3;
  // Glow base
  ctx.shadowColor='rgba(251,191,36,1)'; ctx.shadowBlur=14+8*p;
  ctx.fillStyle=`rgba(254,243,199,${.2+.1*p})`; ctx.fillRect(sx+2,sy+2,TS-4,TS-4);
  // Emoji del ítem (rebotando)
  ctx.font='13px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(item.emoji,sx+TS/2,sy+TS*.5+bounce);
  ctx.shadowBlur=0;
  // Número N/10 (pulsante)
  ctx.font=`bold ${3+Math.round(p)}px sans-serif`;
  ctx.fillStyle=`rgba(251,191,36,${.7+.3*p})`;
  ctx.textBaseline='top'; ctx.fillText('('+item.num+'/10)',sx+TS/2,sy+2);
  // Destellos en las esquinas
  if(Math.floor(tick/8)%4===0){
    ctx.fillStyle='rgba(255,255,255,.9)';
    ctx.fillRect(sx+1,sy+1,2,2); ctx.fillRect(sx+TS-3,sy+TS-3,2,2);
  }
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
}
function _drawAntiItem_old(sx,sy,item){
  const p=.5+.5*Math.sin(tick*.1+(item.x+item.y)*.3);
  ctx.fillStyle='#0f172a'; ctx.fillRect(sx,sy,TS,TS);
  ctx.shadowColor='rgba(251,191,36,.8)'; ctx.shadowBlur=8+6*p;
  ctx.fillStyle='rgba(254,243,199,.12)'; ctx.fillRect(sx+1,sy+1,TS-2,TS-2);
  ctx.font='11px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(item.emoji,sx+TS/2,sy+TS*.52); ctx.shadowBlur=0;
  ctx.font='bold 3px sans-serif'; ctx.fillStyle='#fbbf24';
  ctx.textBaseline='top'; ctx.fillText('('+item.num+'/10)',sx+TS/2,sy+2);
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
}

function drawAntiHUD(){
  const found=Object.keys(progress.antiItems||{}).length;
  if(!progress.antiQuestStarted&&found===0) return;
  ctx.fillStyle='rgba(15,23,42,.8)';
  ctx.fillRect(canvas.width-44,2,42,14);
  ctx.font='bold 5px sans-serif'; ctx.fillStyle=found===10?'#22c55e':'#fbbf24';
  ctx.textAlign='right'; ctx.textBaseline='top';
  ctx.fillText('🎒 '+found+'/10',canvas.width-3,4);
  ctx.textAlign='left';
}

function showAntiQuest(){
  const found=progress.antiItems||{};
  const list=ANTI_ITEMS.map(it=>(found[it.id]?'✅':'⭕')+' '+it.emoji+' '+it.name).join('\n');
  showDialog('🎓 ACTIVIDAD ANTICONCEPTIVOS\n\n'+list+'\n\n'+Object.keys(found).length+'/10 encontrados');
}

