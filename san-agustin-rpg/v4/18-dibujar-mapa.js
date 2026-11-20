// GENERADO por herramientas/extraer_v4.py — drawMap() del v4 partido en dos capas.
// FONDO: tiles y capas del mapa.  FRENTE: noche, velas, letreros de salida, efectos.
// El motor dibuja a los personajes ENTRE ambas capas (así la noche también los oscurece).
function v4DibujarFondo(){
  const map=MAPS[currentMap];
  for(let r=0;r<VH;r++) for(let c=0;c<VW;c++){
    const mR=r+camera.y,mC=c+camera.x,t=map[mR]?.[mC]??'#',sx=c*TS,sy=r*TS;
    if(currentMap==='jardin_eden') drawJardinEdenTile(t,sx,sy,mR,mC);
    else if(currentMap==='segundo_piso') drawSegundoPisoTile(t,sx,sy,mR,mC);
    else if(currentMap==='sala_5to') drawSala5toTile(t,sx,sy,mR,mC);
    else if(currentMap==='sala_6to') drawSala6toTile(t,sx,sy,mR,mC);
    else if(currentMap==='sala_7mo') drawSala7moTile(t,sx,sy,mR,mC);
    else if(currentMap==='sala_8vo') drawSala8voTile(t,sx,sy,mR,mC);
    else if(currentMap==='cancha') drawCanchaTile(t,sx,sy,mR,mC);
    else if(currentMap==='sala_vela') drawSVTile(t,sx,sy,mR,mC);
    else if(currentMap==='biblioteca') drawBibliotecaTile(t,sx,sy,mR,mC);
    else if(currentMap==='sala_cont'){try{drawSalaContTile(t,sx,sy,mR,mC);}catch(e){ctx.fillStyle='#4a1a6e';ctx.fillRect(sx,sy,TS,TS);}}
    else if(currentMap==='plaza'){try{drawPlazaTile(t,sx,sy,mR,mC);}catch(e){ctx.fillStyle='#388e3c';ctx.fillRect(c*TS,r*TS,TS,TS);}}
    else if(['estacion_villa','estacion_quilpue','estacion_vina','estacion_valpo'].includes(currentMap)) drawVillaTile(t,sx,sy,mR,mC);
    else if(currentMap==='salon_trofeos') drawSalonTile(t,sx,sy,mR,mC);
    else if(currentMap==='secretaria') drawSecretariaTile(t,sx,sy,mR,mC);
    else if(currentMap==='centro_villa') drawCentroTile(t,sx,sy,mR,mC);
    else if(currentMap==='biologia') drawBiologiaTile(t,sx,sy,mR,mC);
    else if(currentMap==='biologia') drawBiologiaTile(t,sx,sy,mR,mC);
    else if(currentMap==='reserva') drawReservaTile(t,sx,sy,mR,mC);
    else if(currentMap==='buinzoo') drawBuinZooTile(t,sx,sy,mR,mC);
    else if(currentMap==='sector_norte'){try{drawSectorNorteTile(t,sx,sy,mR,mC);}catch(e){ctx.fillStyle='#3d2e1a';ctx.fillRect(sx,sy,TS,TS);}}
    else if(currentMap==='estacion_villa') drawEstacionTile(t,sx,sy,mR,mC);
    else if(currentMap==='casa_1'||currentMap==='casa_2'||currentMap==='casa_3') drawCasaIntTile(t,sx,sy,mR,mC);
    else if(currentMap==='laboratorio'||currentMap==='taller') drawLabTile(t,sx,sy,mR,mC);
    else drawPasilloTile(t,sx,sy,mR,mC);
  }
  drawGFX();
  if(currentMap==='cancha'){ drawCourtMarkings(); drawCanchaOverlays(); }
  if(currentMap==='biblioteca') drawBibliotecaOverlays();
  if(currentMap==='sala_cont') drawSalaContOverlays();
  if(['estacion_villa','estacion_quilpue','estacion_vina','estacion_valpo'].includes(currentMap)) drawVillaOverlays();
  if(currentMap==='salon_trofeos') drawSalonOverlays();
  if(currentMap==='secretaria') drawSecretariaOverlays();
  if(currentMap==='centro_villa') drawCentroOverlays();
  if(currentMap==='biologia') drawBiologiaOverlays();
  if(currentMap==='reserva') drawReservaOverlays();
  drawCOVIDOverlay();
  ANTI_ITEMS.forEach(it=>{ if(it.map!==currentMap||(progress.antiItems||{})[it.id]) return;
    const sx2=(it.x-camera.x)*TS,sy2=(it.y-camera.y)*TS;
    if(sx2>=-TS&&sy2>=-TS&&sx2<=canvas.width&&sy2<=canvas.height) drawAntiItem(sx2,sy2,it);
  });
  // Draw boat when navigating lake
  if(inBoat&&currentMap==='reserva'){
    const bx=(player.x-camera.x)*TS, by=(player.y-camera.y)*TS;
    // Boat hull
    ctx.fillStyle='#92400e';
    ctx.beginPath(); ctx.moveTo(bx-3,by+TS*.6); ctx.lineTo(bx+TS+3,by+TS*.6);
    ctx.lineTo(bx+TS,by+TS-1); ctx.lineTo(bx,by+TS-1); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#b45309'; ctx.fillRect(bx,by+TS*.6,TS,4);
    // Wave rings
    const wv=.4+.3*Math.sin(tick*.12);
    ctx.strokeStyle=`rgba(56,189,248,${wv})`; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(bx+TS/2,by+TS-1,TS*.7,4,0,0,Math.PI*2); ctx.stroke();
  }
  if(currentMap==='plaza') drawPlazaOverlays();
  if(currentMap==='pasillo'&&progress.claudita>=1){
    BCPOS.forEach((cp,i)=>{ if(bCC[i]||cp.x<camera.x||cp.x>=camera.x+VW||cp.y<camera.y||cp.y>=camera.y+VH) return; const sx=(cp.x-camera.x)*TS+TS/2,sy=(cp.y-camera.y)*TS+TS/2,p=.55+.45*Math.sin(tick*.1+i*.7); ctx.save(); ctx.shadowColor='#60a5fa'; ctx.shadowBlur=10*p; ctx.fillStyle=`rgba(96,165,250,${.7+.3*p})`; ctx.beginPath(); ctx.arc(sx,sy,3.5+.8*p,0,Math.PI*2); ctx.fill(); ctx.restore(); });
  }
}
function v4DibujarFrente(){
  const psx=(player.x-camera.x)*TS,psy=(player.y-camera.y)*TS;
  if(currentMap==='sala_vela'){ctx.font='11px serif'; ctx.fillText('🕯',psx+TS-8,psy+8);}
  ctx.fillStyle='rgba(253,212,66,.82)'; ctx.font='bold 9px sans-serif';
  const [ao1,ao2,ar]=ARROW_OFF[player.facing]; ctx.fillText(ar,psx+ao1,psy+ao2);
  if(currentMap==='sala_vela') applyCandlelight(psx,psy);
  const curT=MAPS[currentMap][player.y]?.[player.x];
  EL.zoneTag.style.display=(curT==='v'||curT==='g')?'block':'none';
  EL.mapLabel.textContent=ML[currentMap]||'';
  drawDayNight();
  {const {hour:_h,min:_m}=getGameTime(); const _clk=_('game-clock'); if(_clk){const _ic=_h>=21||_h<5?'🌙':_h<7||_h>=19?'🌅':'☀️'; _clk.textContent=`${_ic}${String(_h).padStart(2,'0')}:${String(_m).padStart(2,'0')}`; _clk.style.background=_h>=21||_h<5?'rgba(10,10,60,.75)':_h<7||_h>=19?'rgba(60,30,0,.6)':'rgba(0,0,0,.3)';}}
  drawDoorLabels();
  if(EL.btnBack) EL.btnBack.style.display=currentMap==='pasillo'?'none':'block';
  floats=floats.filter(f=>f.life>0);
  floats.forEach(f=>{ ctx.save(); ctx.globalAlpha=f.a; ctx.fillStyle=f.c; ctx.font='bold 11px Arial'; ctx.textBaseline='middle'; ctx.fillText(f.t,f.x,f.y); ctx.restore(); f.y+=f.vy; f.a-=1/75; f.life--; });
  drawPostFX();
}
