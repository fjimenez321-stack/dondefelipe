// ═══════════════════════════════════════════════════════════════
// SPRITES PROCEDURALES (dibujados con código, sin imágenes)
//   dibujarProfe   → el Profe Felipe (portado tal cual desde el v4)
//   dibujarPersona → alumnos, profes, apoderados (paleta configurable)
//   dibujarGato    → mascotas
// Todos reciben (g = contexto 2D, px, py = esquina en píxeles, S = tamaño casilla)
// ═══════════════════════════════════════════════════════════════

// ── Profe Felipe (bata blanca, chaleco granate, corbata azul) — del v4 ──
export function dibujarProfe(g, px, py, S, bob, facing, tick){
  facing={arriba:'up',abajo:'down',izquierda:'left',derecha:'right'}[facing]||facing;
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

// ── Persona genérica ─────────────────────────────────────────────
// apariencia: { piel, pelo, peinado:'corto'|'largo'|'cola'|'moño'|'calvo',
//               ropa, pantalon, falda:bool, lentes:bool, mochila:color, gorro:color }
const PIELES = ['#f1c9a5', '#e0b48a', '#c99668', '#a8754c', '#8a5a36'];
export function aparienciaAzar(semilla = Math.random()) {
  const r = (n) => Math.floor(((Math.sin(semilla * 9301 + n * 49297) + 1) / 2) * 1e6);
  const pick = (arr, n) => arr[r(n) % arr.length];
  return {
    piel: pick(PIELES, 1),
    pelo: pick(['#1c1310', '#3b2416', '#6b3f1f', '#a0642c', '#d6b36a', '#2b2b2b'], 2),
    peinado: pick(['corto', 'largo', 'cola', 'corto', 'moño'], 3),
    ropa: pick(['#1e3a8a', '#1e3a8a', '#7b3245', '#166534', '#334155'], 4),
    pantalon: pick(['#1f2937', '#334155', '#1e293b'], 5),
    falda: r(6) % 3 === 0,
    lentes: r(7) % 5 === 0,
    mochila: r(8) % 2 ? pick(['#dc2626', '#f59e0b', '#16a34a', '#7c3aed', '#0ea5e9'], 9) : null,
  };
}

export function dibujarPersona(g, px, py, S, ap = {}, dir = 'abajo', fase = 0, mov = false) {
  const piel = ap.piel || '#e0b48a', pelo = ap.pelo || '#3b2416';
  const ropa = ap.ropa || '#1e3a8a', pant = ap.pantalon || '#1f2937';
  const pierna = mov ? Math.sin(fase) * S * 0.05 : 0;
  const bob = mov ? Math.abs(Math.sin(fase)) * S * 0.03 : 0;
  const cx = px + S / 2;
  const y0 = py - bob;
  const deEspaldas = dir === 'arriba';
  const lado = dir === 'izquierda' ? -1 : dir === 'derecha' ? 1 : 0;

  // sombra
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.beginPath(); g.ellipse(cx, py + S * 0.94, S * 0.28, S * 0.08, 0, 0, Math.PI * 2); g.fill();

  // piernas / falda
  g.fillStyle = pant;
  if (ap.falda) {
    g.beginPath(); g.moveTo(cx - S * 0.2, y0 + S * 0.66); g.lineTo(cx + S * 0.2, y0 + S * 0.66);
    g.lineTo(cx + S * 0.24, y0 + S * 0.8); g.lineTo(cx - S * 0.24, y0 + S * 0.8); g.fill();
    g.fillStyle = piel;
    g.fillRect(cx - S * 0.13, y0 + S * 0.8 + pierna, S * 0.09, S * 0.1);
    g.fillRect(cx + S * 0.04, y0 + S * 0.8 - pierna, S * 0.09, S * 0.1);
  } else {
    g.fillRect(cx - S * 0.15, y0 + S * 0.66 + pierna, S * 0.12, S * 0.24);
    g.fillRect(cx + S * 0.03, y0 + S * 0.66 - pierna, S * 0.12, S * 0.24);
  }
  g.fillStyle = '#111';
  g.fillRect(cx - S * 0.16, y0 + S * 0.88 + pierna, S * 0.14, S * 0.05);
  g.fillRect(cx + S * 0.02, y0 + S * 0.88 - pierna, S * 0.14, S * 0.05);

  // mochila (se ve de espaldas o de lado)
  if (ap.mochila && (deEspaldas || lado)) {
    g.fillStyle = ap.mochila;
    const mx = deEspaldas ? cx - S * 0.17 : cx - lado * S * 0.26 - S * 0.07;
    g.fillRect(mx, y0 + S * 0.44, deEspaldas ? S * 0.34 : S * 0.14, S * 0.24);
  }

  // torso
  g.fillStyle = ropa;
  g.beginPath();
  g.roundRect ? g.roundRect(cx - S * 0.2, y0 + S * 0.42, S * 0.4, S * 0.27, S * 0.06) : g.rect(cx - S * 0.2, y0 + S * 0.42, S * 0.4, S * 0.27);
  g.fill();
  if (!deEspaldas && !lado) { // cuello de camisa
    g.fillStyle = '#f8fafc';
    g.beginPath(); g.moveTo(cx - S * 0.07, y0 + S * 0.42); g.lineTo(cx, y0 + S * 0.5); g.lineTo(cx + S * 0.07, y0 + S * 0.42); g.fill();
  }
  // brazos
  g.fillStyle = ropa;
  const brazo = mov ? Math.sin(fase) * S * 0.04 : 0;
  if (lado) g.fillRect(cx - S * 0.05, y0 + S * 0.45 + brazo, S * 0.1, S * 0.2);
  else {
    g.fillRect(cx - S * 0.27, y0 + S * 0.44 - brazo, S * 0.08, S * 0.2);
    g.fillRect(cx + S * 0.19, y0 + S * 0.44 + brazo, S * 0.08, S * 0.2);
    g.fillStyle = piel;
    g.fillRect(cx - S * 0.27, y0 + S * 0.62 - brazo, S * 0.08, S * 0.05);
    g.fillRect(cx + S * 0.19, y0 + S * 0.62 + brazo, S * 0.08, S * 0.05);
  }

  // cabeza
  const hy = y0 + S * 0.26, r = S * 0.19;
  // pelo largo por detrás
  if (ap.peinado === 'largo' || ap.peinado === 'cola') {
    g.fillStyle = pelo;
    if (ap.peinado === 'largo') g.fillRect(cx - r, hy, r * 2, S * 0.24);
    else if (deEspaldas || lado) g.fillRect(cx - lado * r * 0.9 - S * 0.04, hy + S * 0.02, S * 0.08, S * 0.2);
  }
  g.fillStyle = piel;
  g.beginPath(); g.arc(cx + lado * S * 0.02, hy, r, 0, Math.PI * 2); g.fill();
  // pelo arriba
  if (ap.peinado !== 'calvo') {
    g.fillStyle = pelo;
    g.beginPath();
    if (deEspaldas) g.arc(cx, hy, r * 1.02, 0, Math.PI * 2);
    else g.arc(cx + lado * S * 0.02, hy - S * 0.02, r * 1.02, Math.PI * 1.02, Math.PI * 1.98);
    g.fill();
    if (!deEspaldas && lado) g.fillRect(cx - lado * r, hy - S * 0.04, S * 0.1 * 1, S * 0.12);
    if (ap.peinado === 'moño') { g.beginPath(); g.arc(cx, hy - r, S * 0.07, 0, Math.PI * 2); g.fill(); }
  }
  if (ap.gorro) { g.fillStyle = ap.gorro; g.beginPath(); g.arc(cx, hy - S * 0.03, r * 1.05, Math.PI, 0); g.fill(); g.fillRect(cx - r * 1.1, hy - S * 0.05, r * 2.2, S * 0.04); }
  // cara
  if (!deEspaldas) {
    const ex = cx + lado * S * 0.06;
    g.fillStyle = '#1a1a1a';
    if (lado) g.fillRect(ex + lado * S * 0.05, hy, S * 0.04, S * 0.05);
    else { g.fillRect(ex - S * 0.08, hy, S * 0.04, S * 0.05); g.fillRect(ex + S * 0.04, hy, S * 0.04, S * 0.05); }
    if (ap.lentes) {
      g.strokeStyle = '#111'; g.lineWidth = Math.max(1, S * 0.025);
      if (lado) g.strokeRect(ex + lado * S * 0.03 - S * 0.02, hy - S * 0.02, S * 0.1, S * 0.08);
      else { g.strokeRect(ex - S * 0.11, hy - S * 0.02, S * 0.09, S * 0.08); g.strokeRect(ex + S * 0.02, hy - S * 0.02, S * 0.09, S * 0.08); }
    }
    g.fillStyle = 'rgba(200,80,80,.35)';
    if (!lado) { g.fillRect(ex - S * 0.13, hy + S * 0.07, S * 0.05, S * 0.03); g.fillRect(ex + S * 0.08, hy + S * 0.07, S * 0.05, S * 0.03); }
  }
}

// ── Gato ─────────────────────────────────────────────────────────
export function dibujarGato(g, px, py, S, ap = {}, dir = 'abajo', fase = 0, mov = false) {
  const c = ap.pelo || '#f59e0b', c2 = ap.manchas || '#fde68a';
  const cx = px + S / 2, base = py + S * 0.9;
  const lado = dir === 'izquierda' ? -1 : dir === 'derecha' ? 1 : 0;
  const pata = mov ? Math.sin(fase * 1.5) * S * 0.04 : 0;
  g.fillStyle = 'rgba(0,0,0,.22)';
  g.beginPath(); g.ellipse(cx, base, S * 0.24, S * 0.06, 0, 0, Math.PI * 2); g.fill();
  // cola
  g.strokeStyle = c; g.lineWidth = S * 0.06; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - (lado || 1) * S * 0.16, base - S * 0.14);
  g.quadraticCurveTo(cx - (lado || 1) * S * 0.34, base - S * 0.3, cx - (lado || 1) * S * 0.24, base - S * 0.42 + Math.sin(fase) * S * 0.03);
  g.stroke(); g.lineCap = 'butt';
  // cuerpo
  g.fillStyle = c;
  g.beginPath(); g.ellipse(cx, base - S * 0.17, lado ? S * 0.22 : S * 0.16, S * 0.13, 0, 0, Math.PI * 2); g.fill();
  g.fillRect(cx - S * 0.12, base - S * 0.08 + pata, S * 0.06, S * 0.08);
  g.fillRect(cx + S * 0.06, base - S * 0.08 - pata, S * 0.06, S * 0.08);
  // cabeza
  const hx = cx + lado * S * 0.16, hy = base - S * 0.36;
  g.beginPath(); g.arc(hx, hy, S * 0.13, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(hx - S * 0.12, hy - S * 0.05); g.lineTo(hx - S * 0.09, hy - S * 0.19); g.lineTo(hx - S * 0.02, hy - S * 0.1); g.fill();
  g.beginPath(); g.moveTo(hx + S * 0.12, hy - S * 0.05); g.lineTo(hx + S * 0.09, hy - S * 0.19); g.lineTo(hx + S * 0.02, hy - S * 0.1); g.fill();
  g.fillStyle = c2; g.beginPath(); g.ellipse(hx, hy + S * 0.05, S * 0.07, S * 0.05, 0, 0, Math.PI * 2); g.fill();
  if (dir !== 'arriba') {
    g.fillStyle = '#14532d';
    if (lado) g.fillRect(hx + lado * S * 0.04, hy - S * 0.03, S * 0.035, S * 0.05);
    else { g.fillRect(hx - S * 0.06, hy - S * 0.03, S * 0.035, S * 0.05); g.fillRect(hx + S * 0.025, hy - S * 0.03, S * 0.035, S * 0.05); }
    g.fillStyle = '#f472b6'; g.fillRect(hx - S * 0.015, hy + S * 0.03, S * 0.03, S * 0.02);
  }
}
