// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Héroe y terreno medieval
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ════════════════════════════════════════════════════════════
// HÉROE — Profe Felipe (científico medieval) — sprite unificado
// Se usa en overworld Y en batalla para consistencia total.
// ════════════════════════════════════════════════════════════
function drawHeroSprite(g, px, py, S, bob, facing){
  bob=bob||0; facing=facing||'down';
  const step=tick*.22;
  const walkL=Math.sin(step)*S*.042, walkR=-walkL;
  const armSwL=Math.sin(step)*.5, armSwR=-armSwL;
  // Offsets de mirada por dirección
  const faceOX=facing==='left'?-S*.02:facing==='right'?S*.02:0;
  const eyeOX =facing==='left'?-S*.015:facing==='right'?S*.015:0;

  // ── Sombra suelo multi-capa ──
  g.save();
  g.shadowColor='rgba(0,0,0,0)';
  g.fillStyle='rgba(0,0,0,.15)';
  g.beginPath(); g.ellipse(px+S*.5,py+S-S*.04,S*.38,S*.13,0,0,Math.PI*2); g.fill();
  g.fillStyle='rgba(0,0,0,.12)';
  g.beginPath(); g.ellipse(px+S*.5,py+S-S*.02,S*.44,S*.08,0,0,Math.PI*2); g.fill();
  g.restore();

  py -= bob;

  // ── Pantalón formal con gradiente ──
  const pantsGrd=g.createLinearGradient(px+S*.3,py+S*.74,px+S*.7,py+S*.95);
  pantsGrd.addColorStop(0,'#4f5564'); pantsGrd.addColorStop(.5,'#3a3f4a'); pantsGrd.addColorStop(1,'#272b34');
  g.fillStyle=pantsGrd;
  g.fillRect(px+S*.33,py+S*.74+walkL,S*.16,S*.21);
  g.fillRect(px+S*.51,py+S*.74+walkR,S*.16,S*.21);
  g.fillStyle='rgba(0,0,0,.2)'; g.fillRect(px+S*.49,py+S*.74,S*.03,S*.21);

  // ── Zapatos con brillo ──
  const shoeGrd=g.createLinearGradient(px,py+S*.92,px,py+S);
  shoeGrd.addColorStop(0,'#28282e'); shoeGrd.addColorStop(1,'#101012');
  g.fillStyle=shoeGrd;
  g.fillRect(px+S*.30,py+S*.93+walkL*.4,S*.2,S*.065);
  g.fillRect(px+S*.50,py+S*.93+walkR*.4,S*.2,S*.065);
  g.fillStyle='rgba(255,255,255,.12)';
  g.fillRect(px+S*.31,py+S*.93+walkL*.4,S*.09,S*.02);
  g.fillRect(px+S*.51,py+S*.93+walkR*.4,S*.09,S*.02);

  // ── Camisa celeste con gradiente ──
  const shirtGrd=g.createLinearGradient(px+S*.25,py+S*.42,px+S*.75,py+S*.78);
  shirtGrd.addColorStop(0,'#dcf0ff'); shirtGrd.addColorStop(.5,'#cfe3f2'); shirtGrd.addColorStop(1,'#b4cce0');
  g.fillStyle=shirtGrd; g.fillRect(px+S*.28,py+S*.42,S*.44,S*.36);

  // ── Chaleco granate con degradado y AO ──
  const chalGrd=g.createLinearGradient(px+S*.3,py+S*.46,px+S*.7,py+S*.76);
  chalGrd.addColorStop(0,'#96384e'); chalGrd.addColorStop(.4,'#7b3245'); chalGrd.addColorStop(1,'#531f2d');
  g.fillStyle=chalGrd; g.fillRect(px+S*.3,py+S*.46,S*.4,S*.3);
  const aoL=g.createLinearGradient(px+S*.3,0,px+S*.38,0);
  aoL.addColorStop(0,'rgba(0,0,0,.3)'); aoL.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=aoL; g.fillRect(px+S*.3,py+S*.46,S*.08,S*.3);
  const rimR=g.createLinearGradient(px+S*.62,0,px+S*.7,0);
  rimR.addColorStop(0,'rgba(255,255,255,0)'); rimR.addColorStop(1,'rgba(255,255,255,.1)');
  g.fillStyle=rimR; g.fillRect(px+S*.62,py+S*.46,S*.08,S*.3);

  // Escote V que muestra camisa
  g.fillStyle='#cfe3f2';
  g.beginPath(); g.moveTo(px+S*.42,py+S*.46); g.lineTo(px+S*.5,py+S*.61); g.lineTo(px+S*.58,py+S*.46); g.closePath(); g.fill();

  // ── Corbata con gradiente y raya ──
  const tieGrd=g.createLinearGradient(px+S*.475,py+S*.46,px+S*.525,py+S*.63);
  tieGrd.addColorStop(0,'#265a9f'); tieGrd.addColorStop(1,'#1a3560');
  g.fillStyle=tieGrd;
  g.fillRect(px+S*.475,py+S*.46,S*.05,S*.04);
  g.beginPath(); g.moveTo(px+S*.475,py+S*.5); g.lineTo(px+S*.5,py+S*.63); g.lineTo(px+S*.525,py+S*.5); g.closePath(); g.fill();
  g.fillStyle='rgba(255,255,255,.13)'; g.fillRect(px+S*.483,py+S*.5,S*.015,S*.07);
  g.fillStyle='#16a34a'; g.fillRect(px+S*.475,py+S*.55,S*.05,S*.012);

  // Cuello camisa
  g.fillStyle='#eef8ff';
  g.beginPath(); g.moveTo(px+S*.44,py+S*.44); g.lineTo(px+S*.5,py+S*.51); g.lineTo(px+S*.46,py+S*.44); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(px+S*.56,py+S*.44); g.lineTo(px+S*.5,py+S*.51); g.lineTo(px+S*.54,py+S*.44); g.closePath(); g.fill();

  // ── Bata blanca — solapa izq con AO ──
  const bataGrd=g.createLinearGradient(px+S*.17,py+S*.44,px+S*.82,py+S*.9);
  bataGrd.addColorStop(0,'#f9fbff'); bataGrd.addColorStop(.5,'#f0f3f9'); bataGrd.addColorStop(1,'#dde3ed');
  g.fillStyle=bataGrd;
  g.fillRect(px+S*.17,py+S*.44+armSwL*S*.03,S*.13,S*.47);
  const bataAOL=g.createLinearGradient(px+S*.17,0,px+S*.3,0);
  bataAOL.addColorStop(0,'rgba(0,0,0,.22)'); bataAOL.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=bataAOL; g.fillRect(px+S*.17,py+S*.44+armSwL*S*.03,S*.13,S*.47);

  // Solapa der con rim light
  g.fillStyle=bataGrd;
  g.fillRect(px+S*.70,py+S*.44+armSwR*S*.03,S*.13,S*.47);
  const bataRimR=g.createLinearGradient(px+S*.70,0,px+S*.83,0);
  bataRimR.addColorStop(0,'rgba(255,255,255,0)'); bataRimR.addColorStop(1,'rgba(255,255,255,.18)');
  g.fillStyle=bataRimR; g.fillRect(px+S*.70,py+S*.44+armSwR*S*.03,S*.13,S*.47);

  // Bolsillo con lápices
  g.fillStyle='#e2e8f2'; g.fillRect(px+S*.70,py+S*.61,S*.1,S*.09);
  g.fillStyle='rgba(0,0,0,.1)'; g.fillRect(px+S*.70,py+S*.70,S*.1,S*.01);
  g.fillStyle='#b91c1c'; g.fillRect(px+S*.72,py+S*.56,S*.02,S*.07);
  g.fillStyle='#fff'; g.fillRect(px+S*.72,py+S*.56,S*.02,S*.012);
  g.fillStyle='#1e3a5f'; g.fillRect(px+S*.755,py+S*.56,S*.02,S*.07);
  g.fillStyle='#fff'; g.fillRect(px+S*.755,py+S*.56,S*.02,S*.012);

  // ── Brazos (mangas bata) ──
  g.fillStyle=bataGrd;
  g.fillRect(px+S*.17,py+S*.47+armSwL*S*.05,S*.11,S*.24);
  g.fillStyle='rgba(0,0,0,.14)'; g.fillRect(px+S*.17,py+S*.47+armSwL*S*.05,S*.03,S*.24);
  g.fillStyle=bataGrd;
  g.fillRect(px+S*.72,py+S*.47+armSwR*S*.05,S*.11,S*.24);
  g.fillStyle='rgba(255,255,255,.1)'; g.fillRect(px+S*.79,py+S*.47+armSwR*S*.05,S*.03,S*.24);

  // Manos con gradiente radial (piel)
  const mkH=(cx,cy)=>{ const sg=g.createRadialGradient(cx,cy,0,cx,cy,S*.065); sg.addColorStop(0,'#dbb888'); sg.addColorStop(1,'#c2906a'); return sg; };
  g.fillStyle=mkH(px+S*.228,py+S*.715+armSwL*S*.05); g.fillRect(px+S*.19,py+S*.70+armSwL*S*.05,S*.08,S*.068);
  g.fillStyle=mkH(px+S*.762,py+S*.715+armSwR*S*.05); g.fillRect(px+S*.73,py+S*.70+armSwR*S*.05,S*.08,S*.068);

  // ── Cuello ──
  const neckGrd=g.createLinearGradient(px+S*.43,py+S*.36,px+S*.57,py+S*.44);
  neckGrd.addColorStop(0,'#cfa070'); neckGrd.addColorStop(1,'#b88050');
  g.fillStyle=neckGrd; g.fillRect(px+S*.43,py+S*.36,S*.14,S*.09);
  g.fillStyle='rgba(0,0,0,.12)'; g.fillRect(px+S*.43,py+S*.36,S*.03,S*.09);

  // ── Cara con degradado radial volumétrico ──
  const fcx=px+S*.5+faceOX;
  const faceGrd=g.createRadialGradient(fcx-S*.06,py+S*.20,S*.01,fcx,py+S*.25,S*.21);
  faceGrd.addColorStop(0,'#e0b888'); faceGrd.addColorStop(.4,'#d2a374'); faceGrd.addColorStop(1,'#a87040');
  g.fillStyle=faceGrd;
  g.beginPath(); g.arc(fcx,py+S*.25,S*.178,0,Math.PI*2); g.fill();
  // SSS mejillas
  g.fillStyle='rgba(210,100,70,.06)';
  g.beginPath(); g.arc(fcx-S*.13,py+S*.28,S*.065,0,Math.PI*2); g.fill();
  g.beginPath(); g.arc(fcx+S*.13,py+S*.28,S*.065,0,Math.PI*2); g.fill();

  // ── Orejas ──
  const mkEar=(cx,cy)=>{ const eg=g.createRadialGradient(cx,cy,0,cx,cy,S*.04); eg.addColorStop(0,'#d8a878'); eg.addColorStop(1,'#b88050'); return eg; };
  g.fillStyle=mkEar(fcx-S*.178,py+S*.255); g.beginPath(); g.arc(fcx-S*.178,py+S*.25,S*.034,0,Math.PI*2); g.fill();
  g.fillStyle=mkEar(fcx+S*.178,py+S*.255); g.beginPath(); g.arc(fcx+S*.178,py+S*.25,S*.034,0,Math.PI*2); g.fill();

  // ── Pelo rapado con gradiente y highlight ──
  const hairGrd=g.createRadialGradient(fcx-S*.04,py+S*.17,0,fcx,py+S*.19,S*.21);
  hairGrd.addColorStop(0,'#42300e'); hairGrd.addColorStop(.5,'#2e2008'); hairGrd.addColorStop(1,'#180e00');
  g.fillStyle=hairGrd;
  g.beginPath(); g.arc(fcx,py+S*.205,S*.178,Math.PI*1.04,Math.PI*1.96); g.fill();
  g.fillStyle='rgba(90,65,20,.45)';
  g.beginPath(); g.arc(fcx-S*.04,py+S*.185,S*.055,0,Math.PI*2); g.fill();
  g.fillStyle='rgba(46,32,8,.4)';
  for(let i=0;i<6;i++) g.fillRect(fcx-S*.16+i*S*.06,py+S*.135,S*.013,S*.013);
  g.fillStyle='#d2a374';
  g.beginPath(); g.arc(fcx-S*.11,py+S*.16,S*.03,0,Math.PI*2); g.fill();
  g.beginPath(); g.arc(fcx+S*.11,py+S*.16,S*.03,0,Math.PI*2); g.fill();

  // ── Barba y bigote ──
  const beardGrd=g.createRadialGradient(fcx,py+S*.3,0,fcx,py+S*.3,S*.2);
  beardGrd.addColorStop(0,'#3d2e10'); beardGrd.addColorStop(1,'#2a1e06');
  g.fillStyle=beardGrd;
  g.beginPath(); g.arc(fcx,py+S*.27,S*.174,.17,Math.PI-.17); g.fill();
  g.fillStyle='#d2a374';
  g.beginPath(); g.arc(fcx,py+S*.25,S*.137,.30,Math.PI-.30); g.fill();
  g.fillStyle='#2e2008';
  g.fillRect(fcx-S*.09,py+S*.3,S*.18,S*.028);
  g.fillRect(fcx-S*.03,py+S*.347,S*.06,S*.03);

  // ── Cejas ──
  g.fillStyle='#2e2008';
  g.fillRect(fcx-S*.12,py+S*.205,S*.09,S*.019); g.fillRect(fcx+S*.03,py+S*.205,S*.09,S*.019);
  g.fillStyle='rgba(46,32,8,.35)'; g.fillRect(fcx-S*.12,py+S*.2,S*.04,S*.01);

  // ── Ojos con iris radial y catchlight ──
  const eL=fcx-S*.075+eyeOX, eR=fcx+S*.075+eyeOX;
  const mkEye=(cx,cy)=>{ const eg=g.createRadialGradient(cx-.008*S,cy-.008*S,0,cx,cy,S*.042); eg.addColorStop(0,'#ffffff'); eg.addColorStop(1,'#ece9e5'); return eg; };
  g.fillStyle=mkEye(eL,py+S*.245); g.beginPath(); g.arc(eL,py+S*.245,S*.041,0,Math.PI*2); g.fill();
  g.fillStyle=mkEye(eR,py+S*.245); g.beginPath(); g.arc(eR,py+S*.245,S*.041,0,Math.PI*2); g.fill();
  // Iris con gradiente
  const mkIris=(cx,cy)=>{ const ig=g.createRadialGradient(cx,cy,0,cx,cy,S*.025); ig.addColorStop(0,'#5a3820'); ig.addColorStop(.6,'#3a2810'); ig.addColorStop(1,'#100a00'); return ig; };
  g.fillStyle=mkIris(eL+S*.007,py+S*.248); g.beginPath(); g.arc(eL+S*.007,py+S*.248,S*.024,0,Math.PI*2); g.fill();
  g.fillStyle=mkIris(eR+S*.007,py+S*.248); g.beginPath(); g.arc(eR+S*.007,py+S*.248,S*.024,0,Math.PI*2); g.fill();
  // Pupila
  g.fillStyle='#060404';
  g.beginPath(); g.arc(eL+S*.007,py+S*.249,S*.013,0,Math.PI*2); g.fill();
  g.beginPath(); g.arc(eR+S*.007,py+S*.249,S*.013,0,Math.PI*2); g.fill();
  // Catchlight
  g.fillStyle='rgba(255,255,255,.9)';
  g.beginPath(); g.arc(eL-S*.002,py+S*.241,S*.009,0,Math.PI*2); g.fill();
  g.beginPath(); g.arc(eR-S*.002,py+S*.241,S*.009,0,Math.PI*2); g.fill();

  // ── Nariz ──
  g.fillStyle='rgba(155,105,55,.42)'; g.fillRect(fcx-S*.013,py+S*.255,S*.026,S*.042);
  g.fillStyle='rgba(100,70,35,.28)'; g.fillRect(fcx-S*.013,py+S*.293,S*.026,S*.006);

  // ── Lentes redondos con arco de brillo ──
  g.save();
  g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=3; g.shadowOffsetX=1; g.shadowOffsetY=1;
  g.strokeStyle='#12121a'; g.lineWidth=Math.max(1.4,S*.034);
  g.beginPath(); g.arc(eL,py+S*.245,S*.063,0,Math.PI*2); g.stroke();
  g.beginPath(); g.arc(eR,py+S*.245,S*.063,0,Math.PI*2); g.stroke();
  g.beginPath(); g.moveTo(eL+S*.063,py+S*.243); g.lineTo(eR-S*.063,py+S*.243); g.stroke();
  g.beginPath(); g.moveTo(eL-S*.063,py+S*.245); g.lineTo(eL-S*.1,py+S*.253); g.stroke();
  g.beginPath(); g.moveTo(eR+S*.063,py+S*.245); g.lineTo(eR+S*.1,py+S*.253); g.stroke();
  g.restore();
  // Reflejo lentes (arco superior)
  g.save();
  g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=Math.max(.8,S*.018);
  g.beginPath(); g.arc(eL,py+S*.233,S*.026,Math.PI*1.22,Math.PI*1.78); g.stroke();
  g.beginPath(); g.arc(eR,py+S*.233,S*.026,Math.PI*1.22,Math.PI*1.78); g.stroke();
  g.restore();

  g.lineWidth=1;
}

// Render hero a un canvas pequeño para la UI de batalla
function renderHeroToBattle(){
  try{
    const el=document.getElementById('b-ps'); if(!el) return;
    let cv=document.getElementById('b-ps-canvas');
    if(!cv){
      cv=document.createElement('canvas'); cv.id='b-ps-canvas';
      cv.width=96; cv.height=96; cv.style.cssText='width:100%;height:100%;image-rendering:pixelated';
      el.textContent=''; el.appendChild(cv);
    }
    const g=cv.getContext('2d'); g.clearRect(0,0,96,96);
    const bob=Math.abs(Math.sin(tick*.08))*4;
    drawHeroSprite(g, 8, 4, 80, bob);
  }catch(e){}
}

// ════════════════════════════════════════════════════════════
// TILES MEDIEVALES — estilo pixel-art (Stardew/Zelda)
// Deterministas por (mC,mR) para que no parpadeen.
// ════════════════════════════════════════════════════════════
function _hash(c,r){ const n=Math.sin(c*12.9898+r*78.233)*43758.5453; return n-Math.floor(n); }

// CÉSPED texturizado — base verde + matas + parches
function drawGrassMed(sx,sy,mC,mR){
  ctx.fillStyle='#3f7a2e'; ctx.fillRect(sx,sy,TS,TS);
  // parches de tono
  ctx.fillStyle='#478a34';
  const h=_hash(mC,mR);
  ctx.fillRect(sx+(h*16|0),sy+(h*10|0),TS*.5,TS*.5);
  ctx.fillStyle='#356b27';
  ctx.fillRect(sx+TS-((h*14)|0)-8,sy+TS-((h*12)|0)-7,7,6);
  // matas de pasto (3 tufts deterministas)
  ctx.strokeStyle='#5aa53e'; ctx.lineWidth=1;
  for(let i=0;i<3;i++){
    const hx=_hash(mC*3+i,mR*7), hy=_hash(mC*5,mR*3+i);
    const bx=sx+4+hx*(TS-8), by=sy+6+hy*(TS-10);
    ctx.beginPath();
    ctx.moveTo(bx,by); ctx.lineTo(bx-1.5,by-3);
    ctx.moveTo(bx,by); ctx.lineTo(bx,by-4);
    ctx.moveTo(bx,by); ctx.lineTo(bx+1.5,by-3);
    ctx.stroke();
  }
  ctx.fillStyle='#2d5a20';
  ctx.fillRect(sx,sy+TS-2,TS,2);
}

// PIEDRA / EMPEDRADO medieval — bloques con mortero + musgo
function drawStoneMed(sx,sy,mC,mR){
  ctx.fillStyle='#6b6b6b'; ctx.fillRect(sx,sy,TS,TS); // mortero base
  // bloques (patrón ladrillo)
  const off=(mR%2)?TS*.25:0;
  ctx.fillStyle='#9a9a92';
  const blocks=[[2,2,13,12],[17,2,13,12],[2,17,13,13],[17,17,13,13]];
  for(const[bx,by,bw,bh] of blocks){
    ctx.fillStyle='#9a9a92'; ctx.fillRect(sx+bx,sy+by,bw,bh);
    ctx.fillStyle='#b0b0a8'; ctx.fillRect(sx+bx,sy+by,bw,2);          // luz arriba
    ctx.fillStyle='#7a7a72'; ctx.fillRect(sx+bx,sy+by+bh-2,bw,2);     // sombra abajo
  }
  // musgo en juntas (determinista)
  const h=_hash(mC,mR);
  if(h>.6){ ctx.fillStyle='rgba(74,140,52,.55)'; ctx.fillRect(sx+14,sy+(h*22|0),3,4); }
  if(h<.3){ ctx.fillStyle='rgba(90,160,60,.45)'; ctx.fillRect(sx+(h*24|0),sy+14,4,3); }
}

// PINO en capas con sombreado + tronco
function drawPineMed(sx,sy){
  // sombra al pie
  ctx.fillStyle='rgba(0,0,0,.2)';
  ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS-3,9,3,0,0,Math.PI*2); ctx.fill();
  // tronco
  ctx.fillStyle='#5a3a1a'; ctx.fillRect(sx+TS*.43,sy+TS*.72,TS*.14,TS*.22);
  ctx.fillStyle='#6b4423'; ctx.fillRect(sx+TS*.43,sy+TS*.72,TS*.06,TS*.22);
  // 3 capas de copa (oscuro abajo → claro arriba)
  const tiers=[[.92,.5,'#1f4a14'],[.66,.42,'#2d6320'],[.4,.32,'#3d8029']];
  for(const[yb,wf,col] of tiers){
    ctx.fillStyle=col;
    ctx.beginPath();
    ctx.moveTo(sx+TS/2,sy+TS*(yb-.42));
    ctx.lineTo(sx+TS*(.5+wf),sy+TS*yb);
    ctx.lineTo(sx+TS*(.5-wf),sy+TS*yb);
    ctx.closePath(); ctx.fill();
  }
  // highlight
  ctx.fillStyle='rgba(120,200,90,.4)';
  ctx.beginPath();
  ctx.moveTo(sx+TS/2,sy+TS*.04);
  ctx.lineTo(sx+TS*.62,sy+TS*.34);
  ctx.lineTo(sx+TS*.5,sy+TS*.34);
  ctx.closePath(); ctx.fill();
}

// ROCA / boulder gris con luz
function drawRockMed(sx,sy){
  ctx.fillStyle='rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS-4,9,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#7d7d77';
  ctx.beginPath(); ctx.ellipse(sx+TS/2,sy+TS*.55,TS*.32,TS*.26,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#9a9a92';
  ctx.beginPath(); ctx.ellipse(sx+TS*.44,sy+TS*.48,TS*.2,TS*.15,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#6a6a64';
  ctx.fillRect(sx+TS*.4,sy+TS*.62,TS*.3,2);
}

// FLORES en grupo (type: 'white'|'red'|'blue') — pétalos redondos + tallo
function drawFlowerMed(sx,sy,type,mC,mR){
  drawGrassMed(sx,sy,mC,mR);
  const cols={
    white:['#ffffff','#fde047','#e0e0e0'],
    red:['#f43f5e','#fde047','#be123c'],
    blue:['#60a5fa','#fde047','#2563eb']
  };
  const[pet,ctr,petD]=cols[type]||cols.white;
  const spots=[[.3,.42,1],[.62,.55,1.15],[.46,.72,.9]];
  const sway=Math.sin(tick*.05+mC*.7)*1.1;
  for(const[fx,fy,sc] of spots){
    const cx=sx+TS*fx+sway*.4, cy=sy+TS*fy;
    // tallo
    ctx.strokeStyle='#2f7d2f'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(cx,cy+5*sc); ctx.quadraticCurveTo(cx-sway,cy+2*sc,cx,cy); ctx.stroke();
    // hojita
    ctx.fillStyle='#3d9140'; ctx.beginPath();
    ctx.ellipse(cx+2*sc,cy+3*sc,2.2*sc,1.1*sc,.6,0,Math.PI*2); ctx.fill();
    // 5 pétalos redondos
    const R=2.5*sc;
    for(let k=0;k<5;k++){
      const a=k*(Math.PI*2/5)-Math.PI/2;
      ctx.fillStyle=k%2?pet:petD;
      ctx.beginPath();
      ctx.arc(cx+Math.cos(a)*R, cy+Math.sin(a)*R, 1.9*sc, 0, Math.PI*2);
      ctx.fill();
    }
    // centro
    ctx.fillStyle=ctr; ctx.beginPath(); ctx.arc(cx,cy,1.5*sc,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(cx-.6*sc,cy-.6*sc,.6*sc,0,Math.PI*2); ctx.fill();
  }
}
// SETO TOPIARIO ornamental (esfera podada sobre macetero)
function drawHedgeMed(sx,sy,mC,mR){
  drawGrassMed(sx,sy,mC,mR);
  const sw=.85+.12*Math.sin(tick*.06+mC*.5);
  // macetero de terracota
  ctx.fillStyle='#b06a3a'; ctx.fillRect(sx+TS*.32,sy+TS*.66,TS*.36,TS*.26);
  ctx.fillStyle='#c47d4a'; ctx.fillRect(sx+TS*.3,sy+TS*.62,TS*.4,TS*.08);
  ctx.fillStyle='#8a4d28'; ctx.fillRect(sx+TS*.32,sy+TS*.86,TS*.36,TS*.06);
  // esfera de seto
  ctx.fillStyle=`rgba(20,83,45,${sw})`; ctx.beginPath(); ctx.arc(sx+TS*.5,sy+TS*.4,TS*.26,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=`rgba(34,120,52,${sw})`; ctx.beginPath(); ctx.arc(sx+TS*.45,sy+TS*.35,TS*.2,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=`rgba(74,160,70,${sw*.9})`; ctx.beginPath(); ctx.arc(sx+TS*.42,sy+TS*.3,TS*.1,0,Math.PI*2); ctx.fill();
  // florcitas en el seto
  ctx.fillStyle='#fbbf24';
  ctx.beginPath(); ctx.arc(sx+TS*.58,sy+TS*.42,1.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#f9a8d4';
  ctx.beginPath(); ctx.arc(sx+TS*.4,sy+TS*.48,1.3,0,Math.PI*2); ctx.fill();
}
// FUENTE central animada (agua que brota)
function drawFountainMed(sx,sy,mC,mR){
  drawStoneMed(sx,sy,mC,mR);
  const t2=tick*.12;
  // base circular de piedra
  ctx.fillStyle='#8a8a82'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS*.42,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#6b6b63'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS*.42,0,Math.PI*2); ctx.lineWidth=2; ctx.stroke?.();
  ctx.strokeStyle='#5a5a52'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS*.42,0,Math.PI*2); ctx.stroke();
  // agua del estanque
  const wf=.5+.5*Math.sin(t2);
  ctx.fillStyle=`rgba(56,170,230,${.8})`; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS*.34,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=`rgba(186,230,253,${.4+.4*wf})`; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS*.22,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS/2,TS*.12,0,Math.PI*2); ctx.stroke();
  // pilar central
  ctx.fillStyle='#9a9a92'; ctx.fillRect(sx+TS*.46,sy+TS*.3,TS*.08,TS*.28);
  ctx.fillStyle='#b0b0a8'; ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS*.3,TS*.1,0,Math.PI*2); ctx.fill();
  // chorros de agua
  ctx.strokeStyle=`rgba(186,230,253,${.6+.3*wf})`; ctx.lineWidth=1.4;
  for(let k=-1;k<=1;k++){
    ctx.beginPath();
    ctx.moveTo(sx+TS/2,sy+TS*.28);
    ctx.quadraticCurveTo(sx+TS/2+k*8,sy+TS*.18,sx+TS/2+k*11,sy+TS*.4);
    ctx.stroke();
  }
  // gotas brillantes
  ctx.fillStyle=`rgba(224,242,254,${.5+.5*Math.sin(t2*1.7)})`;
  ctx.beginPath(); ctx.arc(sx+TS/2,sy+TS*.16,1.5,0,Math.PI*2); ctx.fill();
}

// AGUA animada — azul con olas + brillo
function drawWaterMed(sx,sy,mC,mR){
  // Agua profunda medieval — degradado azul-verdoso con reflejos
  const w=Math.sin(tick*.04+mC*.5+mR*.3), w2=Math.cos(tick*.06+mC*.3);
  ctx.fillStyle='#1a4d6b'; ctx.fillRect(sx,sy,TS,TS);          // fondo profundo
  ctx.fillStyle='#236485'; ctx.fillRect(sx,sy+TS*.15,TS,TS*.7); // medio
  ctx.fillStyle='#2d7a9e'; ctx.fillRect(sx,sy+TS*.35+w*1.2,TS,TS*.3); // banda con ola
  // Olas claras (líneas onduladas)
  ctx.fillStyle='rgba(130,190,225,.45)';
  ctx.fillRect(sx+3+w*2,sy+TS*.25,TS*.35,1.5);
  ctx.fillRect(sx+TS*.5+w2*2,sy+TS*.55-w,TS*.32,1.5);
  ctx.fillRect(sx+TS*.2,sy+TS*.75+w*1.5,TS*.4,1.2);
  // Destellos de luz
  ctx.fillStyle='rgba(210,235,255,.5)';
  ctx.fillRect(sx+TS*.3+w,sy+TS*.2,2,1);
  ctx.fillRect(sx+TS*.65,sy+TS*.45+w2,2,1);
  // Espuma en bordes (si el tile vecino fuera tierra — sutil borde claro)
  ctx.fillStyle='rgba(180,215,235,.25)';
  ctx.fillRect(sx,sy,TS,2);
}

// Borde de piedra para estanques (decorativo, tile 'q')
function drawWaterEdgeMed(sx,sy,mC,mR){
  drawStoneMed(sx,sy,mC,mR);
  // borde interior con agua asomando
  const w=Math.sin(tick*.04+mC*.5);
  ctx.fillStyle='#236485'; ctx.fillRect(sx+TS*.2,sy+TS*.2,TS*.6,TS*.6);
  ctx.fillStyle='rgba(130,190,225,.4)'; ctx.fillRect(sx+TS*.3+w,sy+TS*.35,TS*.3,1.5);
  ctx.fillStyle='rgba(74,140,52,.4)'; ctx.fillRect(sx+TS-5,sy+2,4,5); // musgo
}

// Interceptor de terreno medieval — devuelve true si dibujó el tile
function medTerrain(t,sx,sy,mC,mR){
  switch(t){
    case '.': drawGrassMed(sx,sy,mC,mR); return true;
    case 'g': drawGrassMed(sx,sy,mC,mR); return true;
    case 'p': drawStoneMed(sx,sy,mC,mR); return true;
    case 'T': drawGrassMed(sx,sy,mC,mR); drawPineMed(sx,sy); return true;
    case 'f': drawGrassMed(sx,sy,mC,mR); drawPineMed(sx,sy); return true;
    case 'o': drawGrassMed(sx,sy,mC,mR); drawRockMed(sx,sy); return true;
    case 'w': drawWaterMed(sx,sy,mC,mR); return true;
    case 'q': drawWaterEdgeMed(sx,sy,mC,mR); return true;
    case 'd': drawFlowerMed(sx,sy,'white',mC,mR); return true;
    case 'b': drawFlowerMed(sx,sy,'blue',mC,mR); return true;
    default: return false;
  }
}

