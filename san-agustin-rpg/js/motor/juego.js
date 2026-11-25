// ═══════════════════════════════════════════════════════════════
// JUEGO — el núcleo que une todo
//   · bucle de paso fijo (60 actualizaciones/seg, dibujo con rAF)
//   · colisiones (tiles + puertas + objetos + entidades)
//   · movimiento del jugador (teclado, táctil, tocar-para-caminar)
//   · interacción (NPC, puertas, objetos, tiles)
//   · portales entre mapas con fundido
//   · estado de la partida (flags, inventario, monedas)
//
// API para los datos y los sistemas de juego:
//   juego.decir(guion, {quien, retrato}) → Promise
//   juego.aviso('texto')            mensaje corto arriba
//   juego.flag('clave')             leer   | juego.flag('clave', valor) escribir
//   juego.dar('item', n) / quitar / tiene('item')
//   juego.monedas(+n)               sumar/restar, devuelve el total
//   juego.irA('mapa', x, y, dir)
//   juego.entidad('id') · agregarEntidad(npc) · quitarEntidad(npc)
//   juego.unirse(npc) / separar(npc)   acompañantes que cambian de mapa contigo
//   juego.eventos.on('evento', fn)
// ═══════════════════════════════════════════════════════════════
import { Eventos } from './eventos.js';
import { Mapa } from './mapa.js';
import { Jugador, NPC } from './entidades.js';
import { Entrada } from './entrada.js';
import { Render } from './render.js';
import { Dialogo } from './dialogo.js';
import { Reloj } from './reloj.js';
import { buscarRuta, DIRS, LISTA_DIRS } from './ruta.js';
import { zonasAlPisar, actualizarApariciones } from './zonas.js';
import { guardarPartida } from './guardado.js';

const PASO = 1 / 60;

export class Juego {
  constructor({ canvas, dialogo, aviso, tilesets, mapas, personajes = {}, comunidad = [], externo = null }) {
    this.eventos = new Eventos();
    this.entrada = new Entrada();
    this.render = new Render(canvas);
    this.dialogo = new Dialogo(dialogo, this);
    this.reloj = new Reloj();
    this.elAviso = aviso;

    this.tilesets = tilesets;
    this.defsMapas = mapas;           // { id: def }
    this.personajes = personajes;     // { id: def }
    this.comunidad = comunidad;       // [ def, ... ]
    this.mapas = new Map();           // instancias ya construidas

    this.jugador = new Jugador();
    this.entidades = [this.jugador];
    this.acompanantes = [];
    this.estado = { flags: {}, inventario: {}, monedas: 0 };
    this.modo = 'explorar';
    this.tiempo = 0;
    this.fps = 60;
    this.tactil = matchMedia('(pointer: coarse)').matches;
    this.rutaJugador = null;
    this.pendiente = null; // interacción al terminar la ruta tocada
    this._acum = 0;
    // Sistema externo (el v4): { frame(dt), bloquea() → bool, teclas(entrada), guardar() }
    this.externo = externo;
    // Interceptores de conversación: (npc) => Promise | false. El primero que devuelve
    // una promesa se queda con la conversación (así la historia toma el control).
    this.interceptores = [];

    this.entrada.vincularCanvas(canvas, document.getElementById('joy'), document.getElementById('knob'));
  }

  // ═══ ARRANQUE Y BUCLE ═══════════════════════════════════════
  iniciar() {
    let ultimo = performance.now();
    const frame = (ahora) => {
      const dt = Math.min(0.1, (ahora - ultimo) / 1000);
      ultimo = ahora;
      this.fps += (1 / Math.max(dt, 1e-3) - this.fps) * 0.05;
      this._acum += dt;
      while (this._acum >= PASO) { this.actualizar(PASO); this._acum -= PASO; }
      this.render.dibujar(this, dt);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  actualizar(dt) {
    this.tiempo += dt;
    this.entrada.leerGamepad();
    const bloqueado = !!this.externo?.bloquea?.();
    if (this.modo !== 'dialogo' && !bloqueado) this.reloj.actualizar(dt);
    this.externo?.frame?.(dt);

    this._globales();
    if (this.modo === 'dialogo') this._controlDialogo();
    else if (bloqueado) { this.externo?.teclas?.(this.entrada); this.entrada.tomarToque(); this.rutaJugador = null; }
    else if (this.modo === 'explorar') this._controlJugador(dt);
    this._transicion(dt);

    // Jugador
    if (this.jugador.actualizarMovimiento(dt)) this._llegoJugador();
    // NPC
    for (const e of this.entidades) if (e !== this.jugador) e.actualizar(dt, this);
    this._puertas(dt);
    actualizarApariciones(this, dt);
    this.dialogo.actualizar(dt);
    this.render.seguir(this.mapa, this.jugador, dt);
    this.objetivoInteraccion = this.modo === 'explorar' && !bloqueado && !this.jugador.moviendo ? this._objetivo() : null;

    this.entrada.finFrame();
  }

  // ═══ COLISIONES ═════════════════════════════════════════════
  /** ¿Qué impide pisar (x,y)? null si está libre. quien = la entidad que quiere pisar. */
  obstaculo(x, y, quien) {
    const m = this.mapa.obstaculo(x, y);
    if (m) return m;
    if (quien && quien !== this.jugador) {
      // Los NPC no se paran en salidas ni en umbrales de puertas (no estorban)
      if (this.mapa.portalEn(x, y) && !quien.def?.usaPortales) return 'portal';
      if (this.mapa.puertaEn(x, y)) return 'puerta';
      if (this.mapa.tile(x, y)?.soloJugador) return 'muro';
      if (this.mapa.tileset.npcPuedePisar && !this.mapa.tileset.npcPuedePisar(this.mapa, x, y, quien)) return 'muro';
    }
    for (const e of this.entidades) if (e !== quien && e.solido && e.ocupa(x, y)) return 'entidad';
    return null;
  }

  // ═══ CONTROL DEL JUGADOR ════════════════════════════════════
  _globales() {
    const en = this.entrada;
    if (en.pulso('depurar')) this.render.depurar = !this.render.depurar;
    if (en.pulso('ayuda')) this.eventos.emit('ui:ayuda');
    if (en.pulso('silencio')) this.eventos.emit('ui:silencio');
    if (en.pulso('guardar') && this.modo === 'explorar') this.guardar();
    for (const a of ['mochila', 'misiones', 'perfil']) if (en.pulso(a)) this.eventos.emit('ui:' + a);
  }

  _controlDialogo() {
    const en = this.entrada, d = this.dialogo;
    en.tomarToque();
    if (en.pulso('accion')) d.avanzar();
    else if (en.pulso('cancelar')) d.cancelar();
    else if (en.pulso('arriba') || en.pulso('izquierda')) d.mover(-1);
    else if (en.pulso('abajo') || en.pulso('derecha')) d.mover(1);
    const n = en.tomarNumero();
    if (n && !d.escribiendo && d.opciones?.length >= n) d.elegir(n - 1);
  }

  _controlJugador(dt) {
    const en = this.entrada, j = this.jugador;
    en.tomarNumero();

    // 1) Tocar/clic en el mapa → caminar hasta ahí
    const toque = en.tomarToque();
    if (toque) this._tocar(this.render.pantallaACasilla(toque.clientX, toque.clientY));

    // 2) Botón de acción
    if (en.pulso('accion')) { this.rutaJugador = null; this.interactuar(); return; }
    if (en.pulso('cancelar')) {
      if (!this.rutaJugador) this.eventos.emit('ui:volver');
      this.rutaJugador = null; this.pendiente = null;
    }

    if (j.moviendo) return;

    // 3) Dirección mantenida (cancela la ruta tocada)
    const d = en.direccion() || en.toqueDireccion();
    const vel = en.mantiene('correr') ? j.velCorrer : j.velocidad;
    if (d) {
      this.rutaJugador = null; this.pendiente = null;
      this._caminando = true;
      if (!j.intentarMover(d.dir, this, vel)) this._choque(j);
      return;
    }
    this._caminando = false;

    // 4) Seguir la ruta tocada
    if (this.rutaJugador) {
      const p = this.rutaJugador[0];
      if (!p) {
        this.rutaJugador = null;
        const pe = this.pendiente;
        if (pe) {
          // El NPC se movió mientras íbamos: perseguirlo (máx. 3 veces)
          if (pe.ent && Math.abs(pe.ent.x - j.x) + Math.abs(pe.ent.y - j.y) !== 1 && pe.intentos++ < 3 && this.entidades.includes(pe.ent)) {
            pe.x = pe.ent.x; pe.y = pe.ent.y;
            this.rutaJugador = buscarRuta(j.x, j.y, pe.x, pe.y, (x, y) => !!this.obstaculo(x, y, j), { adyacente: true });
            if (this.rutaJugador) return;
          }
          if (pe.ent && this.entidades.includes(pe.ent)) { pe.x = pe.ent.x; pe.y = pe.ent.y; }
          j.mirarA(pe.x, pe.y); this.pendiente = null; this.interactuar();
        }
        return;
      }
      const dir = LISTA_DIRS.find((k) => j.x + DIRS[k].dx === p.x && j.y + DIRS[k].dy === p.y);
      if (dir && j.intentarMover(dir, this, vel)) this.rutaJugador.shift();
      else {
        if (j.ultimoBloqueo === 'puerta') this._choque(j);
        this._esperaRuta = (this._esperaRuta || 0) + dt;
        if (this._esperaRuta > 0.5) { // recalcular si alguien se cruzó
          this._esperaRuta = 0;
          const fin = this.rutaJugador[this.rutaJugador.length - 1];
          this.rutaJugador = buscarRuta(j.x, j.y, fin.x, fin.y, (x, y) => !!this.obstaculo(x, y, j));
        }
      }
    }
  }

  /** El jugador chocó con algo: si es una puerta normal, se abre sola. */
  _choque(j) {
    if (j.ultimoBloqueo !== 'puerta') return;
    const f = j.delante(), p = this.mapa.puertaEn(f.x, f.y);
    if (!p || p.abierta) return;
    if ((p.llave && !p._desbloqueada) || (p.requiere && !p.requiere(this))) {
      if (this.tiempo - (this._ultimoAvisoPuerta || -9) > 2.5) { this._ultimoAvisoPuerta = this.tiempo; this._abrirPuerta(p); }
      return;
    }
    this._abrirPuerta(p);
  }

  _tocar(c) {
    const j = this.jugador;
    if (c.x === j.x && c.y === j.y) return this.interactuar();
    const hayAlgo = this.entidades.some((e) => e !== j && e.ocupa(c.x, c.y)) || this.mapa.puertaEn(c.x, c.y)
      || this.mapa.objetoEn(c.x, c.y) || this.mapa.interaccionEn(c.x, c.y);
    const libre = !this.obstaculo(c.x, c.y, j);
    if (hayAlgo && !(this.mapa.puertaEn(c.x, c.y)?.abierta)) {
      if (Math.abs(c.x - j.x) + Math.abs(c.y - j.y) === 1) { j.mirarA(c.x, c.y); return this.interactuar(); }
      const bloq = (x, y) => !!this.obstaculo(x, y, j);
      this.rutaJugador = buscarRuta(j.x, j.y, c.x, c.y, bloq, { adyacente: true });
      // ¿Detrás de un mostrador? Buscar la casilla al otro lado del mostrador
      if (!this.rutaJugador) for (const k of LISTA_DIRS) {
        const { dx, dy } = DIRS[k];
        if (!this.mapa.tile(c.x + dx, c.y + dy)?.mostrador) continue;
        const ruta = buscarRuta(j.x, j.y, c.x + 2 * dx, c.y + 2 * dy, bloq);
        if (ruta && (!this.rutaJugador || ruta.length < this.rutaJugador.length)) this.rutaJugador = ruta;
      }
      const ent = this.entidades.find((e) => e !== j && e.ocupa(c.x, c.y));
      this.pendiente = this.rutaJugador ? { x: c.x, y: c.y, ent, intentos: 0 } : null;
    } else if (libre || this.mapa.puertaEn(c.x, c.y)) {
      this.rutaJugador = buscarRuta(j.x, j.y, c.x, c.y, (x, y) => (x === c.x && y === c.y ? false : !!this.obstaculo(x, y, j)));
      this.pendiente = null;
    }
  }

  // ═══ INTERACCIÓN ════════════════════════════════════════════
  /** Lo que está frente al jugador y se puede usar. */
  _objetivo() {
    const j = this.jugador;
    let { x, y } = j.delante();
    const ver = (x, y) => {
      const ent = this.entidades.find((e) => e !== j && e.ocupa(x, y) && (e.def?.dialogo || e.def?.frases || e.def?.alHablar));
      if (ent) return { tipo: 'npc', ent, x: ent.x, y: ent.y, alto: 6 };
      const p = this.mapa.puertaEn(x, y);
      if (p && (!p.abierta || p.cerrable)) return { tipo: 'puerta', p, x, y };
      const o = this.mapa.objetoEn(x, y);
      if (o && (o.texto || o.dialogo || o.accion)) return { tipo: 'objeto', o, x, y };
      const fn = this.mapa.interaccionEn(x, y);
      if (fn) return { tipo: 'tile', fn, x, y };
      return null;
    };
    const r = ver(x, y);
    if (r) return r;
    // Mostradores (kiosco, secretaría): se habla por encima
    if (this.mapa.tile(x, y)?.mostrador) { const d = DIRS[j.dir]; return ver(x + d.dx, y + d.dy); }
    return null;
  }

  async interactuar() {
    if (this.modo !== 'explorar' || this.jugador.moviendo) return;
    const o = this._objetivo();
    if (!o) return;
    if (o.tipo === 'npc') return this.hablar(o.ent);
    if (o.tipo === 'puerta') return o.p.abierta ? this._cerrarPuerta(o.p) : this._abrirPuerta(o.p);
    if (o.tipo === 'objeto') {
      const ob = o.o;
      this.eventos.emit('objeto:usar', { objeto: ob });
      if (ob.accion) return ob.accion(this, ob);
      return this.decir(typeof ob.dialogo === 'function' ? ob.dialogo(this, ob) : ob.dialogo || ob.texto, { quien: ob.nombre, retrato: ob.emoji });
    }
    if (o.tipo === 'tile') return o.fn(this, o.x, o.y);
  }

  /** Conversación con un NPC. dialogo puede ser async (punto de conexión para un LLM). */
  async hablar(npc) {
    const j = this.jugador;
    npc.ocupado = true;
    npc.burbuja = null;
    npc.mirarA(j.x, j.y);
    this.eventos.emit('npc:hablar', { npc });
    try {
      const def = npc.def;
      for (const f of this.interceptores) {
        const r = f(npc);
        if (r) { await r; return; }
      }
      if (def.alHablar) await def.alHablar(this, npc);
      let guion = typeof def.dialogo === 'function' ? await def.dialogo(this, npc) : def.dialogo;
      if (guion == null) guion = npc.siguienteFrase();
      if (guion) await this.decir(guion, { quien: npc.nombre, retrato: npc.emoji });
    } finally {
      npc.ocupado = false;
      this.eventos.emit('npc:fin', { npc });
    }
  }

  decir(guion, ctx = {}) {
    if (this.modo === 'explorar') this.modo = 'dialogo';
    this.rutaJugador = null;
    return this.dialogo.mostrar(guion, ctx).then(() => {
      if (!this.dialogo.ocupado && this.modo === 'dialogo') this.modo = 'explorar';
    });
  }

  aviso(texto, ms = 2600) {
    const el = this.elAviso;
    if (!el) return;
    el.textContent = texto;
    el.classList.add('visible');
    clearTimeout(this._tAviso);
    this._tAviso = setTimeout(() => el.classList.remove('visible'), ms);
  }

  // ═══ PUERTAS ════════════════════════════════════════════════
  _abrirPuerta(p) {
    if (p.llave && !p._desbloqueada) {
      if (!this.tiene(p.llave)) return this.decir(p.bloqueada || '🔒 Está cerrada con llave.');
      p._desbloqueada = true;
      if (p.gastaLlave) this.quitar(p.llave);
      this.aviso(`🔑 Usaste: ${p.nombreLlave || p.llave}`);
    }
    if (p.requiere && !p.requiere(this)) return this.decir(p.bloqueada || '🚪 No se abre.');
    p.abierta = true; p.tiempoAbierta = 0;
    this.eventos.emit('puerta:abrir', { puerta: p });
  }

  _cerrarPuerta(p) {
    if (this.entidades.some((e) => e.ocupa(p.x, p.y))) return;
    p.abierta = false;
    this.eventos.emit('puerta:cerrar', { puerta: p });
  }

  _puertas(dt) {
    for (const p of this.mapa.puertas.values()) {
      const meta = p.abierta ? 1 : 0;
      if (p.apertura !== meta) {
        // Solo se puede cerrar si nadie está en el umbral
        if (!p.abierta && this.entidades.some((e) => e.ocupa(p.x, p.y))) { p.abierta = true; continue; }
        p.apertura = Math.max(0, Math.min(1, p.apertura + (p.abierta ? dt : -dt) * 5));
      }
      if (p.abierta && p.autoCerrar) {
        p.tiempoAbierta += dt;
        if (p.tiempoAbierta > p.autoCerrar && !this.entidades.some((e) => e.ocupa(p.x, p.y))) p.abierta = false;
      }
    }
  }

  // ═══ PASOS, PORTALES Y MAPAS ════════════════════════════════
  _llegoJugador() {
    const j = this.jugador, mapa = this.mapa;
    this.eventos.emit('jugador:paso', { x: j.x, y: j.y, mapa });
    const portal = mapa.portalEn(j.x, j.y);
    if (portal) { this.rutaJugador = null; return this.usarPortal(portal); }
    if (mapa.tileset.alPisar?.(this, j.x, j.y)) { this.rutaJugador = null; return; }
    mapa.tile(j.x, j.y)?.alPisar?.(this, j.x, j.y);
    if (zonasAlPisar(this)) this.rutaJugador = null;
  }

  usarPortal(p) {
    if (p.requiere && !p.requiere(this)) return this.decir(p.bloqueado || 'No puedes pasar por ahora.');
    this.irA(p.a, p.ax, p.ay, p.dir || this.jugador.dir, () => p.alUsar?.(this));
  }

  /** Cambio de mapa con fundido a negro. */
  irA(mapaId, x, y, dir, despues) {
    if (this.modo === 'transicion') return;
    this.modo = 'transicion';
    this._trans = { fase: 'sale', mapaId, x, y, dir, despues };
  }

  _transicion(dt) {
    const tr = this._trans;
    if (!tr) return;
    const r = this.render;
    if (tr.fase === 'sale') {
      r.fundido = Math.min(1, r.fundido + dt * 5);
      if (r.fundido >= 1) { this.cargarMapa(tr.mapaId, tr.x, tr.y, tr.dir); tr.fase = 'entra'; }
    } else {
      r.fundido = Math.max(0, r.fundido - dt * 4);
      if (r.fundido <= 0) { this._trans = null; this.modo = this.dialogo.ocupado ? 'dialogo' : 'explorar'; tr.despues?.(); }
    }
  }

  obtenerMapa(id) {
    if (!this.mapas.has(id)) {
      const def = this.defsMapas[id];
      if (!def) throw new Error(`No existe el mapa "${id}"`);
      this.mapas.set(id, new Mapa(def, this.tilesets[def.tileset]));
    }
    return this.mapas.get(id);
  }

  /** Carga un mapa al instante (sin fundido). */
  cargarMapa(id, x, y, dir) {
    const anterior = this.mapa;
    if (anterior) this.eventos.emit('mapa:salir', { mapa: anterior });
    const mapa = this.obtenerMapa(id);
    this.mapa = mapa;
    this.jugador.teletransportar(x, y, dir);
    this.rutaJugador = null; this.pendiente = null;

    // NPC del mapa (definidos en el mapa, con datos del catálogo de personajes)
    this.entidades = [this.jugador, ...this.acompanantes];
    for (const n of mapa.def.npcs || []) {
      if (n.si && !n.si(this)) continue;
      if (this.acompanantes.some((a) => a.def.id === n.id)) continue;
      const base = this.personajes[n.id] || {};
      this.entidades.push(new NPC({ ...base, ...n, id: n.id }, n.x, n.y));
    }
    // Acompañantes: aparecen detrás del jugador
    for (const a of this.acompanantes) {
      const libre = this._casillaLibreCerca(x, y);
      a.teletransportar(libre.x, libre.y, dir); a.casaX = libre.x; a.casaY = libre.y;
    }
    for (const z of mapa.zonas) z._cd = 0;
    this._zonasActivas = new Set(mapa.zonasEn(x, y));
    actualizarApariciones(this, 0, true);
    this.render.seguir(mapa, this.jugador, 0, true);
    this.render.mostrarCartel(mapa.nombre);
    this.eventos.emit('mapa:entrar', { mapa, anterior });
    mapa.def.alEntrar?.(this);
    if (anterior && anterior !== mapa) this.guardar(true);
  }

  _casillaLibreCerca(x, y) {
    for (let r = 1; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.abs(dx) + Math.abs(dy) !== r) continue;
      if (!this.obstaculo(x + dx, y + dy, null) && !this.mapa.portalEn(x + dx, y + dy)) return { x: x + dx, y: y + dy };
    }
    return { x, y };
  }

  // ═══ ENTIDADES ══════════════════════════════════════════════
  entidad(id) { return this.entidades.find((e) => e.id === id || e.def?.id === id) || null; }
  agregarEntidad(e) { this.entidades.push(e); return e; }
  quitarEntidad(e) { this.entidades = this.entidades.filter((x) => x !== e); }
  unirse(npc, distancia = 1) {
    if (!this.acompanantes.includes(npc)) this.acompanantes.push(npc);
    npc.cambiarIA({ tipo: 'seguir', distancia });
    npc.temporal = false; npc.vida = Infinity; npc.zonaOrigen = null;
  }
  separar(npc, ia = { tipo: 'deambular', radio: 2 }) {
    this.acompanantes = this.acompanantes.filter((a) => a !== npc);
    npc.casaX = npc.x; npc.casaY = npc.y;
    npc.cambiarIA(ia);
  }

  // ═══ ESTADO DE LA PARTIDA ═══════════════════════════════════
  flag(k, v) { if (v === undefined) return this.estado.flags[k]; this.estado.flags[k] = v; this.eventos.emit('flag', { k, v }); return v; }
  tiene(item, n = 1) { return (this.estado.inventario[item] || 0) >= n; }
  dar(item, n = 1) { this.estado.inventario[item] = (this.estado.inventario[item] || 0) + n; this.eventos.emit('inventario', { item, n }); }
  quitar(item, n = 1) {
    if (!this.tiene(item, n)) return false;
    this.estado.inventario[item] -= n;
    if (this.estado.inventario[item] <= 0) delete this.estado.inventario[item];
    this.eventos.emit('inventario', { item, n: -n });
    return true;
  }
  monedas(delta = 0) { this.estado.monedas = Math.max(0, this.estado.monedas + delta); if (delta) this.eventos.emit('monedas', { total: this.estado.monedas, delta }); return this.estado.monedas; }

  guardar(silencioso = false) {
    if (this.externo?.guardar) return this.externo.guardar(silencioso);
    const ok = guardarPartida(this);
    if (!silencioso) this.aviso(ok ? '💾 Partida guardada' : '⚠️ No se pudo guardar');
    return ok;
  }

  cargarPartida(d) {
    this.estado = { flags: {}, inventario: {}, monedas: 0, ...d.estado };
    this.reloj.minutos = d.minutos ?? this.reloj.minutos;
    for (const [id, info] of Object.entries(d.puertas || {})) {
      if (!this.defsMapas[id]) continue;
      const m = this.obtenerMapa(id);
      for (const [x, y] of info.ab || []) { const p = m.puertaEn(x, y); if (p) { p.abierta = true; p.apertura = 1; } }
      for (const [x, y] of info.desbloq || []) { const p = m.puertaEn(x, y); if (p) p._desbloqueada = true; }
    }
    this.cargarMapa(d.mapa, d.x, d.y, d.dir);
  }
}
