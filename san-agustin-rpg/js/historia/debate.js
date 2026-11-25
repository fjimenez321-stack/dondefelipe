// ═══════════════════════════════════════════════════════════════
// DEBATES: la forma de "vencer" en la historia.
// En vez de golpes, argumentos. La barra del rival es su RESISTENCIA
// AL CAMBIO; la tuya es tu ÁNIMO. Cada rival tiene categorías que lo
// convencen más (×2) y otras que casi no le hacen efecto (×½).
//   👂 Escuchar: recuperas ánimo, el rival no te ataca y descubres qué
//      le preocupa → su categoría débil pega todavía más fuerte (×2,5).
//   Repetir el mismo argumento seguido rinde menos.
//   En el final, cada aliado convencido te da un argumento especial.
//
// debate.iniciar(opciones) → Promise<'convencido' | 'retirada' | 'agotado'>
// ═══════════════════════════════════════════════════════════════
import { CATEGORIAS } from './datos-historia.js';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const aleatorio = (arr) => arr[Math.floor(Math.random() * arr.length)];

export class Debate {
  constructor() {
    document.body.insertAdjacentHTML('beforeend', `
      <section id="debate" aria-live="polite">
        <div class="db-caja">
          <div class="db-titulo">⚖️ DEBATE</div>
          <div class="db-rival">
            <div class="db-emoji" id="db-r-emoji">😤</div>
            <div class="db-info">
              <div class="db-nombre" id="db-r-nombre">—</div>
              <div class="db-barra"><div class="db-relleno rival" id="db-r-barra"></div></div>
              <div class="db-etq">Resistencia al cambio <span id="db-r-fase"></span></div>
            </div>
          </div>
          <div class="db-cita" id="db-cita"></div>
          <div class="db-yo">
            <div class="db-info">
              <div class="db-nombre" id="db-y-nombre">—</div>
              <div class="db-barra"><div class="db-relleno animo" id="db-y-barra"></div></div>
              <div class="db-etq">Ánimo <span id="db-y-num"></span></div>
            </div>
            <div class="db-emoji yo" id="db-y-emoji">🧒</div>
          </div>
          <div class="db-msg" id="db-msg"></div>
          <div class="db-acciones" id="db-acciones"></div>
          <div class="db-ayuda">Elige con clic o con 1–9 · A / Espacio avanza el texto</div>
        </div>
      </section>`);
    this.el = document.getElementById('debate');
    this.$ = (id) => document.getElementById(id);
    this.activo = false;
    this._saltar = null;
    addEventListener('keydown', (e) => {
      if (!this.activo) return;
      if (/^Digit[1-9]$|^Numpad[1-9]$/.test(e.code)) {
        const b = [...this.$('db-acciones').querySelectorAll('button:not([disabled])')][+e.code.slice(-1) - 1];
        if (b) { e.preventDefault(); b.click(); }
      } else if (['Space', 'Enter', 'KeyA', 'KeyE', 'NumpadEnter'].includes(e.code)) {
        if (this._saltar) { e.preventDefault(); this._saltar(); }
      }
    }, true);
    this.$('db-msg').addEventListener('click', () => this._saltar?.());
  }

  /**
   * @param o.rival        { nombre, emoji, fases:[{resistencia, debil, fuerte, postura, excusas}], preocupacion, convencido }
   * @param o.argumentos   lista de argumentos disponibles
   * @param o.especiales   [{ nombre, emoji, texto }] argumentos de una sola vez (aliados)
   * @param o.jugador      { nombre, emoji, animo }
   * @param o.datosFase    textos educativos entre fases (opcional)
   */
  async iniciar(o) {
    this.o = o;
    const tpl = (t) => String(t ?? '').replaceAll('{nombre}', o.jugador.nombre);
    this.tpl = tpl;
    this.animoMax = o.jugador.animo; this.animo = this.animoMax;
    this.especiales = (o.especiales || []).map((e) => ({ ...e, usado: false }));
    this.$('db-r-emoji').textContent = o.rival.emoji;
    this.$('db-r-nombre').textContent = o.rival.nombre.toUpperCase();
    this.$('db-y-emoji').textContent = o.jugador.emoji;
    this.$('db-y-nombre').textContent = o.jugador.nombre.toUpperCase();
    this.$('db-acciones').innerHTML = '';
    this.activo = true;
    this.el.classList.add('abierto');
    window.V4.ponerEstado('debate'); // detiene el mapa (el puente lo trata como panel abierto)
    window.V4.musica('entrar');

    let resultado = 'convencido';
    const fases = o.rival.fases;
    for (let i = 0; i < fases.length; i++) {
      const f = fases[i];
      this.fase = { ...f, max: f.resistencia, res: f.resistencia, escuchado: false, ultimo: null };
      this.$('db-r-fase').textContent = fases.length > 1 ? `· fase ${i + 1}/${fases.length}` : '';
      this.$('db-cita').textContent = '«' + tpl(f.postura) + '»';
      this._barras();
      if (i === 0) await this._decir(`${o.rival.emoji} ${o.rival.nombre}: «${tpl(f.postura)}»`);
      else await this._decir(`${o.rival.emoji} «${tpl(f.postura)}»`);
      resultado = await this._turnos();
      if (resultado !== 'convencido') break;
      if (i < fases.length - 1) {
        await this._decir(`💥 ¡${o.rival.nombre} retrocede! Pero todavía no se rinde…`);
        if (o.datosFase?.[i]) await this._decir(o.datosFase[i]);
        this.animo = Math.min(this.animoMax, this.animo + 15);
        this._barras();
      }
    }
    if (resultado === 'convencido') {
      if (o.rival.convencido) await this._decir(`${o.rival.emoji} «${tpl(o.rival.convencido)}»`);
    } else if (resultado === 'agotado') {
      await this._decir('😮‍💨 Te quedaste sin ánimo. Tómate un respiro, busca más evidencias y vuelve a intentarlo.');
    }
    window.V4.musica('salir');
    this.activo = false;
    this.el.classList.remove('abierto');
    if (window.V4.STATE === 'debate') window.V4.ponerEstado('exploring');
    return resultado;
  }

  _barras() {
    const f = this.fase;
    this.$('db-r-barra').style.width = (100 * f.res / f.max).toFixed(1) + '%';
    this.$('db-y-barra').style.width = (100 * this.animo / this.animoMax).toFixed(1) + '%';
    this.$('db-y-num').textContent = `${this.animo}/${this.animoMax}`;
  }

  /** Escribe un texto con efecto máquina; A/Espacio/clic lo completa y luego avanza. */
  _decir(texto) {
    const el = this.$('db-msg');
    return new Promise((listo) => {
      let i = 0, terminado = false;
      el.textContent = '';
      el.classList.remove('espera');
      const tick = setInterval(() => {
        i += 2;
        el.textContent = texto.slice(0, i);
        if (i >= texto.length) fin();
      }, 18);
      const fin = () => {
        if (terminado) return;
        terminado = true;
        clearInterval(tick);
        el.textContent = texto;
        el.classList.add('espera');
        this._saltar = () => { this._saltar = null; el.classList.remove('espera'); listo(); };
      };
      this._saltar = fin;
    });
  }

  /** Un turno del jugador: muestra botones y espera la elección. */
  _elegir() {
    const caja = this.$('db-acciones');
    caja.innerHTML = '';
    return new Promise((listo) => {
      const boton = (html, clase, valor, deshabilitado = false) => {
        const b = document.createElement('button');
        b.className = 'db-btn ' + clase; b.innerHTML = html; b.disabled = deshabilitado;
        b.onclick = () => { caja.innerHTML = ''; listo(valor); };
        caja.appendChild(b);
      };
      for (const a of this.o.argumentos) {
        const c = CATEGORIAS[a.cat];
        boton(`<span>${c.emoji}</span> ${a.nombre}`, 'cat-' + a.cat, { tipo: 'arg', a });
      }
      for (const e of this.especiales) {
        boton(`<span>${e.emoji}</span> ${e.nombre}`, 'especial', { tipo: 'esp', e }, e.usado);
      }
      boton('<span>👂</span> Escuchar', 'escuchar', { tipo: 'escuchar' }, this.fase.escuchado);
      boton('<span>🏃</span> Retirarse', 'retirar', { tipo: 'retirar' });
    });
  }

  async _turnos() {
    const f = this.fase, o = this.o, tpl = this.tpl;
    for (;;) {
      const op = await this._elegir();
      if (op.tipo === 'retirar') { await this._decir('🏃 Te retiras para preparar mejor tus argumentos.'); return 'retirada'; }

      if (op.tipo === 'escuchar') {
        f.escuchado = true;
        this.animo = Math.min(this.animoMax, this.animo + 12);
        this._barras();
        await this._decir(`👂 Escuchas con atención…\n${o.rival.emoji} «${tpl(o.rival.preocupacion || '…')}»`);
        const pista = f.debil.map((c) => `${CATEGORIAS[c].emoji} ${CATEGORIAS[c].nombre}`).join(' o ');
        await this._decir(`💡 Ahora sabes qué le importa. Los argumentos de ${pista} lo convencerán todavía más. (+12 ánimo)`);
        continue; // escuchar no provoca respuesta agresiva
      }

      let poder, texto, cat = null;
      if (op.tipo === 'esp') {
        op.e.usado = true;
        poder = op.e.poder || 24; texto = op.e.texto;
        await this._decir(`🤝 ${tpl(texto)}`);
      } else {
        const a = op.a;
        cat = a.cat; poder = a.poder; texto = a.texto;
        await this._decir(`${CATEGORIAS[a.cat].emoji} «${tpl(texto)}»`);
      }

      // Efecto
      let mult = 1, nota = '';
      if (cat && f.debil.includes(cat)) { mult = f.escuchado ? 2.5 : 2; nota = f.escuchado ? '🎯 ¡Justo lo que le preocupaba!' : '✨ ¡Eso le llegó!'; }
      else if (cat && f.fuerte.includes(cat)) { mult = 0.5; nota = '😐 No le hace mucho efecto…'; }
      if (op.tipo === 'esp') { mult = 1.5; nota = '🤝 ¡El apoyo de un aliado pesa mucho!'; }
      if (op.tipo === 'arg' && f.ultimo === op.a.id) { mult *= 0.6; nota += (nota ? ' ' : '') + '🔁 Ya había escuchado ese argumento.'; }
      f.ultimo = op.tipo === 'arg' ? op.a.id : null;
      const dano = Math.max(3, Math.round(poder * mult * (0.9 + Math.random() * 0.2)));
      f.res = Math.max(0, f.res - dano);
      this._barras();
      this.el.querySelector('.db-rival').classList.remove('golpe'); void this.el.offsetWidth;
      this.el.querySelector('.db-rival').classList.add('golpe');
      await this._decir(`${nota ? nota + '\n' : ''}Resistencia −${dano}`);
      if (f.res <= 0) return 'convencido';

      // Respuesta del rival
      await esperar(150);
      const ex = aleatorio(f.excusas);
      const d = Math.round(ex.dano * (0.85 + Math.random() * 0.3));
      this.animo = Math.max(0, this.animo - d);
      this._barras();
      this.el.querySelector('.db-yo').classList.remove('golpe'); void this.el.offsetWidth;
      this.el.querySelector('.db-yo').classList.add('golpe');
      await this._decir(`${o.rival.emoji} «${tpl(ex.texto)}»\nÁnimo −${d}`);
      if (this.animo <= 0) return 'agotado';
    }
  }
}
