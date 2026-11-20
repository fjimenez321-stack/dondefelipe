// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — HUD, teclado de Jeanette, pantalla del 7
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ═══ UI ═══
function syncUI(){
  const hp=stats.hp/stats.maxHp,mp=stats.mp/stats.maxMp;
  EL.hpV.textContent=`${stats.hp}/${stats.maxHp}`; EL.mpV.textContent=`${stats.mp}/${stats.maxMp}`; EL.xpV.textContent=`${stats.xp}/${stats.xpNext}`;
  if(EL.hpBar)EL.hpBar.style.cssText=`width:${(hp*100).toFixed(1)}%;background:${hpColor(hp)}`; if(EL.mpBar)EL.mpBar.style.width=(mp*100).toFixed(1)+'%'; if(EL.xpBar)EL.xpBar.style.width=(stats.xp/stats.xpNext*100).toFixed(1)+'%';
  if(EL.lvBadge) if(EL.lvBadge) EL.lvBadge.textContent='LV '+stats.level; EL.coinN.textContent=coins;
  if(EL.blueDisp) if(EL.blueDisp)EL.blueDisp.style.display=progress.claudita===1?'flex':'none';
  if(progress.claudita===1) EL.blueN.textContent=progress.blueCoins;
}

// ═══ TECLADO NUMÉRICO ═══
let kpInput='';

function openKeypad(){
  if(progress.codeOk){ showDialog("El código ya fue aceptado. ✅\n¡Ya tienes la 🔑 Llave Dorada!\nBusca el cofre en el centro de la Cancha."); return; }
  if(progress.jeanette.locked){
    showDialog(`El código está bloqueado. 🔒\n\nFallaste 2 veces seguidas.\n\nSe desbloquea automáticamente al\nllegar al Nivel 2.\n\n(Nivel actual: ${stats.level} / Necesitas: 2)\n\n¡Gana batallas para subir de nivel!`); return;
  }
  kpInput='';
  updateKpDisp(); updateKpAtt();
  const msgs=['Ingresa el código de 4 dígitos...','Conoces el código, ¿verdad?\nIngresa los 4 dígitos...'];
  EL.kpMsg.textContent=progress.jeanette.attempts===1?'⚠️ ¡Solo queda 1 intento!\nPiénsalo bien antes de confirmar...':msgs[0];
  EL.kpDisp.className='kp-disp';
  EL.kpPanel.classList.add('on');
  STATE='keypad';
}

function closeKeypad(){ EL.kpPanel.classList.remove('on'); if(STATE==='keypad') STATE='exploring'; }

function kpPress(d){ if(kpInput.length>=4) return; kpInput+=d; updateKpDisp(); }
function kpDel(){ kpInput=kpInput.slice(0,-1); updateKpDisp(); }

function updateKpDisp(){
  EL.kpDisp.textContent=kpInput.padEnd(4,'_').split('').join(' ');
}

function updateKpAtt(){
  const rem=2-progress.jeanette.attempts;
  const dots='●'.repeat(Math.max(0,rem))+'○'.repeat(Math.max(0,2-rem));
  EL.kpAtt.textContent=dots;
  EL.kpAtt.style.color=rem>1?'#4ade80':rem===1?'#facc15':'#f87171';
}

function kpOk(){
  if(kpInput.length<4){ EL.kpMsg.textContent='⚠️ El código tiene 4 dígitos.\nComplétalo antes de confirmar.'; return; }
  if(kpInput==='1986'){
    // Correcto
    EL.kpDisp.classList.add('ok');
    EL.kpMsg.textContent='✅ ¡CÓDIGO CORRECTO!\n¡Excelente, profe!';
    setTimeout(()=>{
      closeKeypad(); progress.codeOk=true;
      inventory.push({id:'llave',name:'🔑 Llave Dorada',type:'item',desc:'Abre el cofre de la Cancha.'});
      syncUI();
      showDialog("🎉 ¡CÓDIGO CORRECTO!\n\n1986 es el año del primer\nsuperconductor de alta temperatura.\n¡Un dato real de física!\n\nToma esta 🔑 Llave Dorada.\nBusca el cofre en el centro\nde la Cancha del colegio.");
    },900);
  } else {
    // Incorrecto
    progress.jeanette.attempts++;
    EL.kpDisp.classList.add('err');
    if(progress.jeanette.attempts>=2){
      // Bloquear
      progress.jeanette.locked=true;
      EL.kpMsg.textContent='❌ Incorrecto. ¡2 intentos fallidos!\n🔒 Bloqueado hasta Nivel 2.';
      setTimeout(()=>{
        closeKeypad();
        showDialog("❌ ¡Código incorrecto!\n\n2 intentos fallidos seguidos.\nEl teclado está BLOQUEADO. 🔒\n\nPara desbloquearlo necesitas\nllegar al Nivel 2.\n\n🗡️ Gana batallas y sube de nivel\npara volver a intentarlo.");
      },1100);
    } else {
      // Un intento más
      EL.kpMsg.textContent='❌ Código incorrecto.\n⚠️ ¡Solo queda 1 intento!\nPiénsalo bien...';
      kpInput='';
      setTimeout(()=>{ EL.kpDisp.classList.remove('err'); updateKpDisp(); updateKpAtt(); },1000);
    }
  }
}

// ═══ PANTALLA DEL 7 ═══
function showSevenPanel(){ STATE='seven'; EL.sevenPanel.classList.add('on'); }
function closeSevenPanel(){ EL.sevenPanel.classList.remove('on'); STATE='exploring'; }

