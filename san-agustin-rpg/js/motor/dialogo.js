// ═══════════════════════════════════════════════════════════════
// DIÁLOGOS
// Una caja de texto con efecto máquina de escribir, nombre de quien
// habla, retrato (emoji) y opciones.
//
// Formatos aceptados para un guion:
//   'Hola profe'                           → una línea
//   ['Línea 1', 'Línea 2']                 → varias líneas seguidas
//   [{quien:'José', texto:'...'}, ...]     → líneas con hablante
//   { inicio:'a', nodos:{                  → árbol con opciones
//       a:{ texto:'¿Me ayuda?', opciones:[
//            {texto:'Sí',  ir:'b', accion:(j)=>...},
//            {texto:'No',  ir:null},                // null = terminar
//            {texto:'Secreto', si:(j)=>j.flag('x'), ir:'c'} ]},
//       b:{ texto:'¡Gracias!', accion:(j)=>j.flag('ayudo',true) } } }
//
// Cualquier `texto` puede ser una función (juego) => string.
// mostrar() devuelve una Promesa que se resuelve al cerrar.
// ═══════════════════════════════════════════════════════════════

const VEL_LETRAS = 55; // caracteres por segundo

function normalizar(guion) {
  if (guion == null) return null;
  if (typeof guion === 'string' || typeof guion === 'function') guion = [guion];
  if (Array.isArray(guion)) {
    const nodos = {};
    guion.forEach((l, i) => {
      const linea = typeof l === 'object' && !Array.isArray(l) ? { ...l } : { texto: l };
      if (!('ir' in linea) && !linea.opciones) linea.ir = i + 1 < guion.length ? `n${i + 1}` : null;
      nodos[`n${i}`] = linea;
    });
    return { inicio: 'n0', nodos };
  }
  return guion;
}

export class Dialogo {
  constructor(raiz, juego) {
    this.juego = juego;
    this.caja = raiz;
    this.elQuien = raiz.querySelector('.dlg-quien');
    this.elRetrato = raiz.querySelector('.dlg-retrato');
    this.elTexto = raiz.querySelector('.dlg-texto');
    this.elOpciones = raiz.querySelector('.dlg-opciones');
    this.elSig = raiz.querySelector('.dlg-sig');
    this.activo = false;
    this._cola = [];
    raiz.addEventListener('click', (e) => { if (!e.target.closest('button')) this.avanzar(); });
  }

  /** true si hay un diálogo abierto o esperando turno. */
  get ocupado() { return this.activo || this._cola.length > 0; }

  /** Abre un guion. ctx: {quien, retrato} por defecto para las líneas. */
  mostrar(guion, ctx = {}) {
    const g = normalizar(guion);
    if (!g) return Promise.resolve();
    return new Promise((resolver) => {
      const abrir = () => {
        this.g = g; this.ctx = ctx; this.resolver = resolver;
        this.activo = true;
        this.caja.classList.add('abierto');
        this._ir(g.inicio);
      };
      // Si ya hay un diálogo abierto, se encola
      if (this.activo) this._cola.push(abrir); else abrir();
    });
  }

  _ir(id) {
    const nodo = id != null ? this.g.nodos[id] : null;
    if (!nodo) return this._cerrar();
    if (nodo.si && !nodo.si(this.juego)) return this._ir(nodo.sino ?? null);
    this.nodo = nodo;
    const val = (v) => (typeof v === 'function' ? v(this.juego) : v);
    this.textoCompleto = String(val(nodo.texto) ?? '');
    this.letras = 0;
    this.escribiendo = true;
    this.elQuien.textContent = val(nodo.quien ?? this.ctx.quien) || '';
    this.elQuien.style.display = this.elQuien.textContent ? '' : 'none';
    this.elRetrato.textContent = val(nodo.retrato ?? this.ctx.retrato) || '';
    this.elRetrato.style.display = this.elRetrato.textContent ? '' : 'none';
    this.elTexto.textContent = '';
    this.elOpciones.innerHTML = '';
    this.elSig.style.visibility = 'hidden';
    this.opciones = (nodo.opciones || []).filter((o) => !o.si || o.si(this.juego));
    this.sel = 0;
    nodo.alMostrar?.(this.juego);
  }

  actualizar(dt) {
    if (!this.activo || !this.escribiendo) return;
    this.letras += dt * VEL_LETRAS;
    const n = Math.min(this.textoCompleto.length, Math.floor(this.letras));
    this.elTexto.textContent = this.textoCompleto.slice(0, n);
    if (n >= this.textoCompleto.length) this._terminarEscritura();
  }

  _terminarEscritura() {
    this.escribiendo = false;
    this.elTexto.textContent = this.textoCompleto;
    if (this.opciones.length) this._pintarOpciones();
    else this.elSig.style.visibility = 'visible';
  }

  _pintarOpciones() {
    this.elOpciones.innerHTML = '';
    this.opciones.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'dlg-op' + (i === this.sel ? ' sel' : '');
      b.textContent = `${i + 1}. ${typeof o.texto === 'function' ? o.texto(this.juego) : o.texto}`;
      b.onclick = (e) => { e.stopPropagation(); this.sel = i; this.elegir(); };
      this.elOpciones.appendChild(b);
    });
  }

  /** Botón de acción: completa el texto, o pasa a la siguiente línea, o elige la opción marcada. */
  avanzar() {
    if (!this.activo) return;
    if (this.escribiendo) return this._terminarEscritura();
    if (this.opciones.length) return this.elegir();
    const n = this.nodo;
    n.accion?.(this.juego);
    this._ir(n.ir ?? null);
  }

  mover(delta) {
    if (!this.activo || this.escribiendo || !this.opciones.length) return;
    this.sel = (this.sel + delta + this.opciones.length) % this.opciones.length;
    this._pintarOpciones();
  }

  elegir(i = this.sel) {
    const o = this.opciones[i];
    if (!o) return;
    this.nodo.accion?.(this.juego);
    o.accion?.(this.juego);
    this._ir(o.ir ?? null);
  }

  /** Cancelar: si hay opciones, elige la última (suele ser "Nada/Salir"); si no, cierra. */
  cancelar() {
    if (!this.activo) return;
    if (this.escribiendo) return this._terminarEscritura();
    if (this.opciones.length) return this.elegir(this.opciones.length - 1);
    this._cerrar();
  }

  _cerrar() {
    this.activo = false;
    this.caja.classList.remove('abierto');
    const r = this.resolver; this.resolver = null;
    r?.();
    const sig = this._cola.shift();
    if (sig) setTimeout(sig, 60);
  }
}
