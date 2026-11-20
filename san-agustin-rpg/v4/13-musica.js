// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — Música medieval procedural
// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.
// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.
// ════════════════════════════════════════════════════════════
// MOTOR DE MÚSICA MEDIEVAL — Gregoriano / San Agustín
// Web Audio API — generación procedural (sin archivos externos)
// ════════════════════════════════════════════════════════════
const Music = (() => {
  let ac = null, master = null, reverbNode = null, droneOsc = null;
  let seqTimer = null, currentTheme = null, _muted = false, _vol = 0.22;
  let melody_idx = 0, fadingOut = false;

  // ─── Escalas modales medievales ───────────────────────────
  const FREQ = n => 440 * Math.pow(2, (n-69)/12);   // MIDI → Hz
  const SCALES = {
    // Dorian en D (pasillo, biblioteca, secretaria)
    dorian:    [62,64,65,67,69,71,72,74].map(FREQ),
    // Frigio en E (batalla — oscuro, tenso)
    phrygian:  [64,65,67,69,71,72,74,76].map(FREQ),
    // Mixolidio en G (cancha, plaza — más vivo)
    mixolydian:[67,69,71,72,74,76,77,79].map(FREQ),
    // Eolio en A (reserva — bosque, naturaleza)
    aeolian:   [57,59,60,62,64,65,67,69].map(FREQ),
    // Lidio en F (sala_vela — místico)
    lydian:    [53,55,57,59,60,62,64,65].map(FREQ),
  };

  // ─── Melodías por mapa ─────────────────────────────────────
  // Índices en la escala + duración en beats (1=negra, 0.5=corchea, 2=blanca)
  const THEMES = {
    pasillo:   { scale:'dorian',    bpm:50, vol:0.22,
      mel:[[0,1],[2,0.5],[1,0.5],[3,1],[2,0.5],[4,1],[3,0.5],[5,2],[3,1],[1,0.5],[0,2]] },
    cancha:    { scale:'mixolydian',bpm:45, vol:0.20,
      mel:[[0,0.5],[1,0.5],[2,1],[3,0.5],[4,1],[3,0.5],[2,1],[1,0.5],[0,2],[2,1],[4,0.5],[3,2]] },
    biblioteca:{ scale:'dorian',   bpm:44, vol:0.18,
      mel:[[4,2],[3,1],[2,1],[1,0.5],[0,2],[2,1],[3,0.5],[4,2],[5,1],[4,1],[2,2],[0,3]] },
    sala_vela: { scale:'lydian',    bpm:42, vol:0.16,
      mel:[[0,2],[2,1],[4,1],[6,2],[5,1],[4,1],[3,2],[2,1],[0,3],[4,1],[2,2],[1,1],[0,4]] },
    sala_cont: { scale:'dorian',   bpm:47, vol:0.18,
      mel:[[2,1],[1,1],[0,2],[3,0.5],[2,0.5],[4,2],[3,1],[5,0.5],[4,2],[2,1],[0,2]] },
    secretaria:{ scale:'dorian',   bpm:36, vol:0.18,
      mel:[[0,1],[1,0.5],[2,0.5],[1,1],[3,1],[2,2],[4,1],[3,0.5],[2,1],[1,0.5],[0,2]] },
    plaza:     { scale:'mixolydian',bpm:50, vol:0.22,
      mel:[[0,0.5],[2,0.5],[3,0.5],[4,1],[3,0.5],[2,0.5],[1,1],[0,0.5],[4,0.5],[3,1],[2,0.5],[0,2]] },
    reserva:   { scale:'aeolian',   bpm:45, vol:0.20,
      mel:[[0,2],[2,1],[3,1],[4,2],[2,1],[0,1],[5,2],[4,1],[3,1],[2,2],[0,3]] },
    biologia:  { scale:'dorian',   bpm:52, vol:0.18,
      mel:[[1,1],[2,0.5],[3,1],[4,0.5],[3,1],[5,2],[4,1],[2,0.5],[1,1],[0,2]] },
    salon_trofeos:{scale:'mixolydian',bpm:54,vol:0.20,
      mel:[[4,1],[5,0.5],[6,0.5],[7,2],[6,1],[5,0.5],[4,1],[2,1],[0,2],[4,1],[3,2]] },
    estacion_villa:{scale:'mixolydian',bpm:57,vol:0.22,
      mel:[[0,1],[2,0.5],[4,1],[3,0.5],[2,1],[4,0.5],[6,2],[4,1],[2,1],[0,2]] },
    centro_villa:{scale:'mixolydian',bpm:63,vol:0.22,
      mel:[[0,0.5],[1,0.5],[2,0.5],[3,0.5],[4,1],[3,1],[2,0.5],[1,0.5],[0,2],[2,1],[4,0.5],[3,2]] },
    // Batalla — Frigio intenso
    battle_theme:{ scale:'phrygian',bpm:78,vol:0.28,
      mel:[[0,0.5],[0,0.5],[2,0.5],[1,0.5],[0,1],[3,0.5],[0,0.5],[0,1],[2,0.5],[4,1],[2,0.5],[0,2]] },
    // Noche — muy lento y sombrío
    segundo_piso:{ scale:'dorian', bpm:44, vol:0.16,
      mel:[[0,2],[2,1],[4,1],[3,1],[2,2],[1,1],[0,3]] },
    sala_5to:{ scale:'mixolydian', bpm:42, vol:0.15, mel:[[0,2],[2,1],[4,2],[3,1],[1,1],[0,3]] },
    sala_6to:{ scale:'dorian', bpm:40, vol:0.16, mel:[[0,2],[1,1],[2,1],[4,2],[2,1],[0,3]] },
    sala_7mo:{ scale:'mixolydian', bpm:43, vol:0.15, mel:[[2,2],[4,1],[6,2],[4,1],[2,1],[0,3]] },
    sala_8vo:{ scale:'aeolian', bpm:41, vol:0.15, mel:[[0,2],[2,1],[3,1],[5,2],[3,1],[0,3]] },
    jardin_eden:{ scale:'lydian', bpm:38, vol:0.17,
      mel:[[0,3],[2,2],[4,2],[6,3],[5,2],[4,2],[2,3],[0,2],[4,3],[3,2],[1,2],[0,4]] },
    night_theme: { scale:'aeolian', bpm:36, vol:0.14,
      mel:[[5,3],[4,2],[3,2],[1,2],[0,3],[2,2],[3,3],[1,2],[0,4]] },
  };

  // ─── Construcción de reverb de iglesia ────────────────────
  function buildReverb(duration=2.8){
    const sr=ac.sampleRate, len=Math.floor(sr*duration);
    const buf=ac.createBuffer(2,len,sr);
    for(let c=0;c<2;c++){
      const d=buf.getChannelData(c);
      for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len, 1.8)*0.6;
    }
    const conv=ac.createConvolver(); conv.buffer=buf;
    return conv;
  }

  // ─── Timbre de órgano / flauta medieval ───────────────────
  function playNote(freq, dur, osc_type='sawtooth', vol=0.18, detune=0){
    if(!ac||_muted||fadingOut) return;
    const now=ac.currentTime;
    // Oscilador principal
    const osc=ac.createOscillator();
    osc.type=osc_type;
    osc.frequency.value=freq;
    // Vibrato lento (organal medieval)
    const vib=ac.createOscillator(); vib.type='sine'; vib.frequency.value=4.5;
    const vibGain=ac.createGain(); vibGain.gain.value=freq*0.004;
    vib.connect(vibGain); vibGain.connect(osc.frequency);
    vib.start(now); vib.stop(now+dur+0.1);
    if(detune) osc.detune.value=detune;
    // Sub-oscilador (octava abajo, muy suave) — grosor de órgano
    const sub=ac.createOscillator();
    sub.type='sine'; sub.frequency.value=freq/2;
    // Filtro paso-bajo — cuerpo de órgano/flauta
    const filt=ac.createBiquadFilter();
    filt.type='lowpass';
    filt.frequency.value = osc_type==='sawtooth' ? 900 : 1800;
    filt.Q.value=0.8;
    // Envolvente ADSR
    const attack=0.18, release=Math.min(0.7,dur*0.45);
    const g=ac.createGain(); g.gain.setValueAtTime(0,now);
    g.gain.linearRampToValueAtTime(vol, now+attack);
    g.gain.setValueAtTime(vol, now+dur-release);
    g.gain.linearRampToValueAtTime(0, now+dur);
    const sg=ac.createGain(); sg.gain.value=0.12;
    // Quinta paralela (organum medieval — paralelas a la 5ª)
    const qosc=ac.createOscillator();
    qosc.type='sine'; qosc.frequency.value=freq*1.5;
    const qg=ac.createGain(); qg.gain.setValueAtTime(0,now);
    qg.gain.linearRampToValueAtTime(vol*0.25,now+attack);
    qg.gain.setValueAtTime(vol*0.25,now+dur-release);
    qg.gain.linearRampToValueAtTime(0,now+dur);
    osc.connect(filt); sub.connect(sg); sg.connect(filt);
    filt.connect(g); g.connect(master);
    qosc.connect(qg); qg.connect(master);
    if(reverbNode){ g.connect(reverbNode); qg.connect(reverbNode); }
    osc.start(now); osc.stop(now+dur+0.1);
    sub.start(now); sub.stop(now+dur+0.1);
    qosc.start(now); qosc.stop(now+dur+0.1);
  }

  // ─── Secuenciador ─────────────────────────────────────────
  function scheduleNext(theme, noteList, idx, beatLen){
    if(!ac||_muted||fadingOut) return;
    const [degree, beats]=noteList[idx % noteList.length];
    const freq = theme.scale[Math.min(degree, theme.scale.length-1)];
    const dur = beats * beatLen;
    const isBattle = currentTheme==='battle_theme';
    playNote(freq, dur, isBattle?'square':'sawtooth', theme.vol, isBattle?5:0);
    seqTimer=setTimeout(()=>{
      if(!_muted&&!fadingOut) scheduleNext(theme, noteList, idx+1, beatLen);
    }, dur*1000 - 30);
  }

  // ─── Drone (nota pedal — raíz sostenida) ──────────────────
  function startDrone(scale, vol=0.06){
    if(droneOsc){ droneOsc.stop(); droneOsc=null; }
    const osc=ac.createOscillator(); osc.type='sine';
    osc.frequency.value=scale[0]/2;   // Octava baja
    const g=ac.createGain(); g.gain.setValueAtTime(0,ac.currentTime);
    g.gain.linearRampToValueAtTime(vol, ac.currentTime+1.5);
    osc.connect(g); g.connect(master);
    if(reverbNode) g.connect(reverbNode);
    osc.start(); droneOsc=osc;
    droneOsc._gainNode=g;
  }

  // ─── API pública ──────────────────────────────────────────
  return {
    init(){
      if(ac) return;
      try{
        ac=new (window.AudioContext||window.webkitAudioContext)();
        master=ac.createGain(); master.gain.value=_vol;
        // Cadena: master → dry→dest  / master→reverb→wetGain→dest
        const dry=ac.createGain(); dry.gain.value=0.65;
        reverbNode=buildReverb();
        const wet=ac.createGain(); wet.gain.value=0.35;
        master.connect(dry); dry.connect(ac.destination);
        master.connect(reverbNode); reverbNode.connect(wet); wet.connect(ac.destination);
      } catch(e){ console.warn('AudioContext no disponible',e); ac=null; }
    },

    play(mapName){
      if(!ac) this.init();
      if(!ac) return;
      const tName = (typeof STATE!=='undefined'&&STATE==='battle')
        ? 'battle_theme'
        : (typeof isNight==='function'&&isNight()&&mapName==='reserva'
            ? 'night_theme' : mapName);
      if(tName===currentTheme&&!fadingOut) return;
      this.fadeOut(()=>this._startTheme(tName));
    },

    _startTheme(name){
      if(_muted) return;
      fadingOut=false; currentTheme=name;
      const def=THEMES[name]||THEMES.pasillo;
      const theme={...def, scale:SCALES[def.scale]};
      const beatLen=60/def.bpm;
      startDrone(theme.scale, def.vol*0.3);
      scheduleNext(theme, def.mel, 0, beatLen);
    },

    fadeOut(cb){
      if(!master) return cb&&cb();
      fadingOut=true;
      clearTimeout(seqTimer);
      if(droneOsc&&droneOsc._gainNode){
        droneOsc._gainNode.gain.linearRampToValueAtTime(0,ac.currentTime+0.8);
        setTimeout(()=>{ try{droneOsc.stop();}catch(e){} droneOsc=null; },900);
      }
      if(cb) setTimeout(()=>{ fadingOut=false; cb(); },900);
    },

    battleIn(){ this.play('battle_theme'); },
    battleOut(){ this.play(typeof currentMap!=='undefined'?currentMap:'pasillo'); },

    toggle(){
      _muted=!_muted;
      if(!ac) this.init();
      if(_muted){
        clearTimeout(seqTimer);
        if(master) master.gain.linearRampToValueAtTime(0,ac.currentTime+0.3);
        if(droneOsc&&droneOsc._gainNode)
          droneOsc._gainNode.gain.linearRampToValueAtTime(0,ac.currentTime+0.3);
      } else {
        if(master) master.gain.linearRampToValueAtTime(_vol,ac.currentTime+0.3);
        currentTheme=null;
        this.play(typeof currentMap!=='undefined'?currentMap:'pasillo');
      }
      return !_muted;
    },

    setVol(v){
      _vol=Math.max(0,Math.min(1,v));
      if(master) master.gain.value=_vol;
    },

    get muted(){ return _muted; },
    get active(){ return !!ac&&!_muted; },
    get _ac(){ return ac; }
  };
})();

