// ═══════════════════════════════════════════════════════════════
// HISTORIA PRINCIPAL — lógica.  (Textos y números: datos-historia.js)
//
// Fases:  intro → aliados → (3 aliados) Ingeniera Brea → (6 aliados) asamblea
//         con el Dr. Vapor → fin
// El estado se guarda dentro del progreso del v4 (progress.historia), así
// viaja con 💾, el autoguardado y la exportación de partidas.
//
// Toma el control de la conversación con: el Profe Felipe (mentor), los
// aliados (cuando hay algo que proponerles), la Directora, Brea, Vapor y las
// evidencias. Con todos los demás, el juego sigue igual que el v4.
// ═══════════════════════════════════════════════════════════════
import * as D from './datos-historia.js';
import { Debate } from './debate.js';

const V4 = () => window.V4;
const MENTOR = 'sala_6to:~';
const IDS_ALIADOS = Object.keys(D.ALIADOS);

// Aspecto del protagonista (uniforme del colegio)
export const PROTAGONISTAS = {
  nino: { emoji: '👦', apariencia: { piel: '#e0b48a', pelo: '#3b2416', peinado: 'corto', ropa: '#1e3a8a', pantalon: '#1f2937', mochila: '#16a34a' } },
  nina: { emoji: '👧', apariencia: { piel: '#e0b48a', pelo: '#3b2416', peinado: 'cola', ropa: '#1e3a8a', falda: true, pantalon: '#1f2937', mochila: '#ec4899' } },
};

/** Estado de la historia (vive en el progreso del v4). */
export function estadoHistoria() {
  const p = V4().progreso();
  return (p.historia ||= { fase: 'intro', aliados: {}, evidencias: {}, brea: false, vapor: false, prota: null });
}
const nAliados = (e) => IDS_ALIADOS.filter((id) => e.aliados[id]).length;

/** NPC y objetos nuevos que la historia agrega a los mapas (se evalúan al entrar al mapa). */
export function npcsHistoria() {
  const porMapa = {};
  const agregar = (def) => (porMapa[def.mapa] ||= []).push(def);
  const [dir, brea, vapor] = D.PERSONAJES_HISTORIA;
  agregar({ ...dir, alHablar: () => {}, si: () => true });
  agregar({ ...brea, alHablar: () => {}, si: () => { const e = estadoHistoria(); return !e.brea && nAliados(e) >= D.ALIADOS_PARA_BREA; } });
  agregar({ ...vapor, alHablar: () => {}, si: () => { const e = estadoHistoria(); return e.brea && !e.vapor && nAliados(e) >= D.ALIADOS_PARA_FINAL; } });
  for (const [clave, ev] of Object.entries(D.EVIDENCIAS)) {
    agregar({ id: 'ev:' + clave, mapa: ev.mapa, x: ev.x, y: ev.y, nombre: ev.nombre, emoji: ev.emoji, sprite: 'emoji',
      ia: { tipo: 'quieto' }, alHablar: () => {},
      si: () => { const e = estadoHistoria(); return e.fase !== 'intro' && !e.evidencias[clave]; } });
  }
  return porMapa;
}

export class Historia {
  constructor(juego) {
    this.juego = juego;
    this.debate = new Debate();
    juego.interceptores.push((npc) => this.alHablar(npc));
    juego.eventos.on('mapa:entrar', () => { this.aplicarProtagonista(); this.actualizarHUD(); });
    this._crearHUD();
    this._registrarMision();
    setInterval(() => this.actualizarHUD(), 1000);
  }

  get e() { return estadoHistoria(); }
  get prota() { return this.e.prota || { nombre: 'Profe', genero: 'nino' }; }
  get emoji() { return PROTAGONISTAS[this.prota.genero]?.emoji || '🧒'; }

  // ── Protagonista ──────────────────────────────────────────────
  elegirProtagonista(nombre, genero) {
    this.e.prota = { nombre: (nombre || '').trim().slice(0, 16) || (genero === 'nina' ? 'Sofi' : 'Tomi'), genero };
    this.aplicarProtagonista();
  }
  aplicarProtagonista() {
    const p = this.e.prota;
    if (!p) return;
    const j = this.juego.jugador;
    j.sprite = 'persona';
    j.apariencia = PROTAGONISTAS[p.genero]?.apariencia || PROTAGONISTAS.nino.apariencia;
    V4().batallaJugador(p.nombre, this.emoji);
  }

  // ── Conversaciones ────────────────────────────────────────────
  alHablar(npc) {
    const id = npc.def?.id;
    if (!id || !this.e.prota) return false;
    if (id === MENTOR) return this._mentor();
    if (id === 'directora') return this._directora();
    if (id === 'brea') return this._brea(npc);
    if (id === 'vapor') return this._vapor(npc);
    if (id.startsWith('ev:')) return this._evidencia(id.slice(3), npc);
    if (D.ALIADOS[id] && this.e.fase !== 'intro' && this.e.fase !== 'fin' && !this.e.aliados[id]) return this._proponer(id, npc);
    return false; // todo lo demás: como en el v4
  }

  decir(lineas, quien, retrato) { return this.juego.decir(lineas.map((t) => (typeof t === 'string' ? { texto: t, quien, retrato } : t))); }
  t(s) { return String(s).replaceAll('{nombre}', this.prota.nombre); }

  /** Escena inicial (al empezar partida nueva). */
  async intro() {
    const n = this.prota.nombre;
    await this.decir([
      'Noviembre. 38 °C a la sombra. El Jardín Edén está lleno de alumnos buscando un poco de fresco…',
    ], '🌡️ Ola de calor', '☀️');
    await this.decir([
      '¡Atención, comunidad! Con este calor no podemos seguir así.',
      'La empresa Termocorp nos ofrece una solución: aires acondicionados gigantes… y a cambio, talar el Jardín Edén y pavimentar la cancha para hacer un estacionamiento.',
      'Su gerente, el Dr. Cálido Vapor, vendrá el viernes a firmar el contrato. A menos que la comunidad presente un plan mejor, firmaré.',
    ], 'Directora Marta', '👩‍💼');
    await this.decir([
      `¿Talar el jardín? ¡Eso va a hacer que todo sea todavía más caliente!`,
      'Tengo que hacer algo… El Profe Felipe sabe un montón de ciencias. Está en la sala de 6° Básico.',
      '🧭 Sal del jardín hacia el pasillo, sube por la escalera ( ^ ) al segundo piso y entra a la sala de 6°.',
    ], n, this.emoji);
    this.e.fase = 'mentor';
    this.actualizarHUD();
  }

  async _mentor() {
    const e = this.e, n = this.prota.nombre;
    const P = (texto) => ({ texto, quien: 'Profe Felipe', retrato: '👨‍🏫' });
    if (e.fase === 'mentor' || e.fase === 'intro') {
      await this.juego.decir([
        P(`¡${n}! ¿Qué haces corriendo con este calor?`),
        { texto: '¡Profe! ¡Termocorp quiere talar el Jardín Edén y pavimentar la cancha!', quien: n, retrato: this.emoji },
        P('Mmm… eso empeoraría todo. Te explico por qué, que es pura ciencia.'),
        P('🌍 Al quemar petróleo, gas y carbón liberamos CO₂. Ese gas atrapa el calor en la atmósfera, como una frazada: es el efecto invernadero. Por eso el planeta se está calentando.'),
        P('🏙️ Y hay algo más cercano: el asfalto y el cemento al sol se calientan muchísimo y guardan calor hasta la noche. Es la «isla de calor». Los árboles, en cambio, dan sombra y refrescan el aire.'),
        P('🥵 Los aires acondicionados no eliminan el calor: lo tiran hacia afuera y gastan mucha electricidad. Termocorp gana… y el colegio se calienta más.'),
        { texto: '¡Entonces hay que detenerlos! ¿Pero cómo? Soy de 6° no más…', quien: n, retrato: this.emoji },
        P('Una idea cambia el mundo cuando muchas personas la hacen suya. Tienes que CONVENCER a la comunidad, en debates: tus argumentos contra sus excusas.'),
        P('Hay cuatro tipos de argumento: 🔬 datos científicos, 💚 cercanía, 💰 ahorro y 🛠️ acciones concretas. A cada persona le llega uno distinto.'),
        P('👂 Y lo más importante: ESCUCHA. Cuando entiendes qué le preocupa a alguien, sabes cómo convencerle.'),
        P(`📋 Tu misión: consigue al menos ${D.ALIADOS_PARA_FINAL} compromisos antes de la asamblea. Prueba con José, el Inspector, el Tío Antonio y Jorge en el pasillo; el Profe Gonzalo en la cancha; Yael en Biología; Francisco en Secretaría y la Tía Claudita.`),
        P('🔎 Busca también EVIDENCIAS: un termómetro en el jardín, un recorte en la biblioteca y la boleta de la luz en secretaría. Te darán argumentos más fuertes.'),
        P(`¡Confío en ti, ${n}! 🌱`),
      ]);
      e.fase = 'aliados';
      V4().sumar({ xp: 10 });
      this.juego.aviso('📓 Nueva misión: Salvar el colegio');
      V4().guardarSilencioso();
      this.actualizarHUD();
      return;
    }
    if (e.fase === 'fin') {
      return this.juego.decir([P(`¡${n}! Lo lograste: el jardín sigue en pie y el colegio tiene un Plan Verde de verdad. 🌳`), P('El calentamiento global no se resuelve en un día… pero hoy aprendiste algo clave: la ciencia convence cuando se comparte.')]);
    }
    const c = nAliados(e);
    return this.juego.decir([P(`Vas bien: ${c} de ${IDS_ALIADOS.length} compromisos. ${this._objetivo()}.`), P('Recuerda: si alguien no se convence, 👂 escúchale primero.')]);
  }

  async _directora() {
    const e = this.e;
    const Dm = (texto) => ({ texto, quien: 'Directora Marta', retrato: '👩‍💼' });
    if (e.fase === 'fin') return this.juego.decir([Dm('Gracias a ti, el Plan Verde es oficial. ¡Y el jardín se queda! 🌳')]);
    if (e.fase === 'intro' || e.fase === 'mentor') return this.juego.decir([Dm('El viernes viene Termocorp. Si tienes una idea mejor, consíguete apoyo… y rápido.')]);
    return this.juego.decir([Dm(`Llevas ${nAliados(e)} compromisos. Necesito ver al menos ${D.ALIADOS_PARA_FINAL} para decirle que no a Termocorp.`)]);
  }

  async _evidencia(clave, npc) {
    const ev = D.EVIDENCIAS[clave];
    this.e.evidencias[clave] = true;
    this.juego.quitarEntidad(npc);
    V4().sumar({ xp: 8 });
    this.juego.aviso(`${ev.emoji} Evidencia: ${ev.nombre}`);
    await this.juego.decir(ev.texto);
    this.actualizarHUD();
  }

  // ── Debates ───────────────────────────────────────────────────
  argumentosDisponibles() {
    return D.ARGUMENTOS.filter((a) => !a.requiere || this.e.evidencias[a.requiere]);
  }
  animo() { return 70 + V4().nivel() * 6 + nAliados(this.e) * 4; }
  jugadorDebate() { return { nombre: this.prota.nombre, emoji: this.emoji, animo: this.animo() }; }

  async _proponer(id, npc) {
    const a = D.ALIADOS[id];
    let eleccion = null;
    await this.juego.decir({
      inicio: 'a',
      nodos: { a: {
        texto: `${a.emoji} ${a.nombre}: «${this.t(a.postura)}»`,
        opciones: [
          { texto: '🌱 Proponerle el Plan Verde (debate)', accion: () => { eleccion = 'debate'; } },
          { texto: '💬 Solo conversar', accion: () => { eleccion = 'charlar'; } },
          { texto: 'Ahora no' },
        ],
      } },
    });
    if (eleccion === 'charlar') return npc.def.alHablar?.(this.juego, npc);
    if (eleccion !== 'debate') return;
    const r = await this.debate.iniciar({
      rival: { nombre: a.nombre, emoji: a.emoji, preocupacion: a.preocupacion, convencido: a.convencido,
        fases: [{ resistencia: a.resistencia, debil: a.debil, fuerte: a.fuerte, postura: a.postura, excusas: a.excusas }] },
      argumentos: this.argumentosDisponibles(),
      jugador: this.jugadorDebate(),
    });
    if (r !== 'convencido') return;
    this.e.aliados[id] = true;
    V4().sumar({ xp: 25, monedas: 5 });
    this.juego.aviso(`${a.compromiso.emoji} Compromiso: ${a.compromiso.titulo}`);
    await this._hitos();
    V4().guardarSilencioso();
    this.actualizarHUD();
  }

  async _hitos() {
    const e = this.e, c = nAliados(e), n = this.prota.nombre;
    await this.juego.decir(`🌱 ¡${c} de ${IDS_ALIADOS.length} compromisos para el Plan Verde!`);
    if (c === D.ALIADOS_PARA_BREA && !e.brea) {
      await this.decir(['📱 ¡Alerta! Te escribe José: «¡Hay una ingeniera de Termocorp en el Jardín Edén marcando árboles con una ✗ roja! ¡Ven rápido!»'], n, '📱');
    }
    if (c >= D.ALIADOS_PARA_FINAL && e.brea && !e.vapor) {
      await this.decir(['📢 La Directora convoca a ASAMBLEA en el Jardín Edén. El Dr. Cálido Vapor llegó a firmar el contrato… ¡Es ahora o nunca!'], 'Directora Marta', '👩‍💼');
    }
  }

  async _brea(npc) {
    const B = D.BREA;
    await this.juego.decir([{ texto: this.t('¿Y tú quién eres? Muévete, que tengo que marcar estos árboles para la tala.'), quien: B.nombre, retrato: B.emoji }]);
    const r = await this.debate.iniciar({
      rival: { nombre: B.nombre, emoji: B.emoji, preocupacion: B.preocupacion, convencido: B.convencido,
        fases: [{ resistencia: B.resistencia, debil: B.debil, fuerte: B.fuerte, postura: B.postura, excusas: B.excusas }] },
      argumentos: this.argumentosDisponibles(),
      jugador: this.jugadorDebate(),
    });
    if (r !== 'convencido') return;
    this.e.brea = true;
    this.e.evidencias.plano = true;
    this.juego.quitarEntidad(npc);
    V4().sumar({ xp: 60, monedas: 15 });
    this.juego.aviso('🗺️ Evidencia: Plano del Proyecto Asfalto');
    await this.juego.decir('🗺️ Conseguiste el PLANO DEL PROYECTO ASFALTO.\n\n🛠️ Nuevo argumento: «El plano de Termocorp»\n\nLos árboles marcados se salvaron… por ahora.');
    if (nAliados(this.e) >= D.ALIADOS_PARA_FINAL) await this._hitos();
    V4().guardarSilencioso();
    this.actualizarHUD();
  }

  async _vapor(npc) {
    const Vp = D.VAPOR, e = this.e, n = this.prota.nombre;
    await this.juego.decir([
      { texto: '¡Directora! Traigo el contrato listo. Aires acondicionados para todos… y un estacionamiento precioso donde ahora hay árboles. Ja, ja.', quien: Vp.nombre, retrato: Vp.emoji },
      { texto: `Antes de firmar, ${n} quiere presentar el Plan Verde de la comunidad.`, quien: 'Directora Marta', retrato: '👩‍💼' },
      { texto: `¿Un${this.prota.genero === 'nina' ? 'a niña' : ' niño'}? ¿Contra Termocorp? Esto será rápido.`, quien: Vp.nombre, retrato: Vp.emoji },
    ]);
    const especiales = IDS_ALIADOS.filter((id) => e.aliados[id]).map((id) => {
      const a = D.ALIADOS[id];
      return { nombre: `${a.nombre}`, emoji: a.compromiso.emoji, poder: 22, texto: `${a.emoji} ${a.nombre}: «¡Yo me comprometo! ${a.compromiso.emoji} ${a.compromiso.titulo}.»` };
    });
    const r = await this.debate.iniciar({
      rival: { nombre: Vp.nombre, emoji: Vp.emoji, preocupacion: '…Si el colegio no me compra, nadie más lo hará. Mi negocio depende del calor.',
        convencido: 'Imposible… ¡toda la comunidad está contigo! Termocorp se retira. Pero el calor no se irá solo, ¿eh?',
        fases: Vp.fases },
      argumentos: this.argumentosDisponibles(),
      especiales,
      datosFase: Vp.datosFase,
      jugador: { ...this.jugadorDebate(), animo: this.animo() + 30 },
    });
    if (r !== 'convencido') {
      if (r === 'agotado') await this.juego.decir([{ texto: '¡Ja! Vuelve cuando tengas mejores argumentos.', quien: Vp.nombre, retrato: Vp.emoji }]);
      return;
    }
    e.vapor = true;
    e.fase = 'fin';
    this.juego.quitarEntidad(npc);
    V4().sumar({ xp: 120, monedas: 40 });
    await this._final();
    V4().guardarSilencioso();
    this.actualizarHUD();
  }

  async _final() {
    const e = this.e, n = this.prota.nombre;
    const lista = IDS_ALIADOS.filter((id) => e.aliados[id]).map((id) => `${D.ALIADOS[id].compromiso.emoji} ${D.ALIADOS[id].compromiso.titulo}`).join('\n');
    await this.juego.decir([
      { texto: 'Comunidad: NO firmaremos con Termocorp. El Jardín Edén se queda, y desde hoy el Colegio San Agustín tiene un PLAN VERDE.', quien: 'Directora Marta', retrato: '👩‍💼' },
      { texto: `🌱 PLAN VERDE SAN AGUSTÍN\n\n${lista}` },
      { texto: `Todo esto empezó porque ${n} decidió no quedarse callad${this.prota.genero === 'nina' ? 'a' : 'o'}. ¡Un aplauso!`, quien: 'Directora Marta', retrato: '👩‍💼' },
      { texto: '🌍 Para recordar: el planeta se calienta por los gases de efecto invernadero que emitimos. Cada comunidad que ahorra energía, cuida sus árboles y se mueve sin auto ayuda a frenar el calentamiento.' },
      { texto: '🏆 FIN DE «EL PLAN ASFALTO»\n\nPuedes seguir explorando: todos los personajes, misiones y lugares siguen ahí.\n\nGracias por jugar. — Profe Felipe' },
    ]);
  }

  // ── HUD y cuaderno de misiones ───────────────────────────────
  _objetivo() {
    const e = this.e, c = nAliados(e);
    if (!e.prota) return '';
    if (e.fase === 'intro' || e.fase === 'mentor') return 'Habla con el Profe Felipe (sala 6°, segundo piso)';
    if (e.fase === 'fin') return '¡Colegio salvado! 🌳';
    if (c < D.ALIADOS_PARA_BREA) return `Convence a la comunidad (${c}/${D.ALIADOS_PARA_BREA})`;
    if (!e.brea) return 'Detén a la Ingeniera Brea en el Jardín Edén';
    if (c < D.ALIADOS_PARA_FINAL) return `Consigue más compromisos (${c}/${D.ALIADOS_PARA_FINAL})`;
    return '¡Asamblea! Enfrenta al Dr. Vapor en el Jardín Edén';
  }
  temperatura() {
    const e = this.e;
    return D.TEMP_INICIAL - nAliados(e) - (e.brea ? 1 : 0) - (e.vapor ? 2 : 0);
  }
  _crearHUD() {
    const izq = document.querySelector('#ui-bar')?.firstElementChild;
    if (!izq) return;
    izq.insertAdjacentHTML('beforeend', '<span id="hud-historia" title="Misión principal (clic para ver)"></span>');
    document.getElementById('hud-historia').onclick = () => {
      if (this.juego.modo === 'explorar') this.juego.decir(`🎯 ${this._objetivo()}\n\n🌱 Compromisos: ${nAliados(this.e)}/${IDS_ALIADOS.length}\n🔎 Evidencias: ${Object.keys(this.e.evidencias).length}/4`);
    };
  }
  actualizarHUD() {
    const el = document.getElementById('hud-historia');
    if (!el) return;
    if (!this.e.prota) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.textContent = `🌡️ ${this.temperatura()}°C · 🌱 ${nAliados(this.e)}/${IDS_ALIADOS.length} · 🎯 ${this._objetivo()}`;
    this._actualizarMision();
  }
  _registrarMision() {
    const { defs } = V4().misiones();
    defs.plan_verde = {
      icon: '🌍', title: 'El Plan Asfalto: salvar el colegio',
      steps: ['Hablar con el Profe Felipe (sala 6°)', `Convencer a ${D.ALIADOS_PARA_BREA} personas`, 'Detener a la Ingeniera Brea',
        `Conseguir ${D.ALIADOS_PARA_FINAL} compromisos`, 'Vencer al Dr. Vapor en la asamblea'],
    };
  }
  _actualizarMision() {
    const e = this.e, c = nAliados(e);
    if (!e.prota || e.fase === 'intro') return;
    const { log } = V4().misiones();
    const pasos = [e.fase !== 'mentor', c >= D.ALIADOS_PARA_BREA, e.brea, c >= D.ALIADOS_PARA_FINAL, e.vapor].map((x) => (x ? 1 : 0));
    log.plan_verde = { active: !e.vapor, steps: pasos };
  }
}
