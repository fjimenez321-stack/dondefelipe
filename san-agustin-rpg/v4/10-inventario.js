// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Mochila
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ INVENTARIO ═══
function openInv(){
  if(STATE==='battle'||STATE==='shop'||STATE==='seven'||STATE==='keypad') return;
  STATE='inventory';
  const ul=EL.invList; ul.innerHTML='';
  const sec=(title,icon)=>{const h=document.createElement('li'); h.style.cssText="color:#6b7280;font-family:'Press Start 2P',monospace;font-size:.4rem;padding:6px 0 3px;border-bottom:1px solid #374151;margin-bottom:4px;list-style:none"; h.textContent=icon+' '+title; ul.appendChild(h);};
  // Café
  sec('CONSUMIBLES','🧪');
  const cafeR=document.createElement('li'); cafeR.className='inv-row';
  cafeR.innerHTML='<span>☕ Café</span><span style="color:var(--gold);font-size:.9rem">'+stats.coffees+' usos</span>';
  ul.appendChild(cafeR);
  // Alimentos
  const foods=inventory.filter(i=>i.type==='food');
  if(foods.length){
    sec('ALIMENTOS','🍽️');
    foods.forEach((item,idx2)=>{
      const li=document.createElement('li'); li.className='inv-row';
      li.innerHTML='<span>'+(item.emoji||'🍽️')+' '+item.name+'</span>';
      const btn=document.createElement('button'); btn.className='btn-read'; btn.textContent='Usar';
      btn.onclick=()=>{
        if(typeof item.use==='function'){item.use();}
        else{stats.hunger=Math.min(stats.maxHunger,(stats.hunger||100)+30);syncUI();showDialog((item.emoji||'🍽️')+' +30 🍽️');}
        const ri=inventory.findIndex((x,xi)=>xi===inventory.indexOf(item));
        const fi=inventory.findIndex(x=>x===item); if(fi>=0) inventory.splice(fi,1);
        closeInv(); openInv();
      };
      li.appendChild(btn); ul.appendChild(li);
    });
  }
  // Semillas
  const seeds=inventory.filter(i=>i.type==='seed');
  if(seeds.length){
    sec('SEMILLAS','🌱');
    seeds.forEach(item=>{
      const li=document.createElement('li'); li.className='inv-row';
      li.innerHTML='<span>'+(item.emoji||'🌱')+' '+item.name+'</span><span style="color:#86efac;font-size:.65rem">'+(item.desc||'Huerto')+'</span>';
      ul.appendChild(li);
    });
  }
  // Ítems de misión/clave
  const quest=inventory.filter(i=>i.type==='item'||i.type==='quest'||i.type==='power');
  if(quest.length){
    sec('ÍTEMS CLAVE','🗝️');
    quest.forEach(item=>{
      const li=document.createElement('li'); li.className='inv-row';
      li.innerHTML='<span>'+(item.emoji||'📦')+' '+item.name+'</span><span style="font-size:.65rem;color:#9ca3af">'+(item.desc||'')+'</span>';
      if(item.type==='power'&&typeof item.use==='function'){
        const btn=document.createElement('button'); btn.className='btn-read'; btn.textContent='Info';
        btn.onclick=()=>{closeInv();item.use();}; li.appendChild(btn);
      }
      ul.appendChild(li);
    });
  }
  // Equip items in inventory (linterna, herramientas, etc.)
  const equips=inventory.filter(i=>i.type==='equip');
  if(equips.length){
    sec('EQUIPAMIENTO','⚙️');
    equips.forEach(item=>{
      const li=document.createElement('li'); li.className='inv-row';
      li.innerHTML='<span>'+(item.emoji||'⚙️')+' '+item.name+'</span><span style="font-size:.65rem;color:#9ca3af">'+(item.desc||'')+'</span>';
      if(typeof item.use==='function'){const btn=document.createElement('button');btn.className='btn-read';btn.textContent='Usar';btn.onclick=()=>{closeInv();item.use();};li.appendChild(btn);}
      ul.appendChild(li);
    });
  }
  // Armadura
  if(equipment?.armor){
    sec('ARMADURA EQUIPADA','🛡️');
    const li=document.createElement('li'); li.className='inv-row';
    li.innerHTML='<span>'+equipment.armor.emoji+' '+equipment.armor.name+'</span><span style="color:#4ade80;font-size:.75rem">'+equipment.armor.desc+'</span>';
    ul.appendChild(li);
  }
  const antiItems=inventory.filter(i=>i.type==='anti');
  if(antiItems.length){
    sec('ANTICONCEPTIVOS ('+antiItems.length+'/10)','🎓');
    antiItems.forEach(item=>{
      const li=document.createElement('li'); li.className='inv-row';
      li.style.cssText='flex-direction:column;align-items:flex-start;gap:3px;padding:4px 0';
      const row=document.createElement('div');
      row.style.cssText='display:flex;justify-content:space-between;width:100%;align-items:center';
      row.innerHTML='<span style="font-size:.65rem">'+(item.emoji||'💊')+' '+item.name+'</span>'
        +'<span style="font-size:.38rem;color:#6b7280">'+item.num+'/10</span>';
      const btn=document.createElement('button'); btn.className='btn-read';
      btn.textContent='Ver info'; btn.style.cssText='font-size:.38rem;padding:2px 6px';
      btn.onclick=()=>{closeInv();if(typeof item.use==='function')item.use();};
      li.appendChild(row); li.appendChild(btn); ul.appendChild(li);
    });
  }
  if(!foods.length&&!seeds.length&&!quest.length&&!equipment?.armor&&!antiItems.length)
    ul.innerHTML+='<li style="color:#6b7280;width:100%;text-align:center;list-style:none;padding:12px">Mochila vacía...</li>';
  EL.invPanel.style.display='block';
}

function closeInv(){ EL.invPanel.style.display='none'; if(STATE==='inventory') STATE='exploring'; }

