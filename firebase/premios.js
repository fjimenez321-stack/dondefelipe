/* ═══════════════════════════════════════════════════════════════
   Premios y castigos de la ruleta y los cofres (para los historiales).
   Lo usan ruleta.html (historial completo), cuenta.html (Mi cuenta) y
   panel-profe.html. Solo lee movimientos ya guardados: no escribe nada.
   window.PREMIOS.clasificar(mov) → { clase: 'premio'|'castigo'|'neutro', ico, txt, origen } o null
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var DISERTACION = 'Ruleta: disertación';

  function texto(m) {
    return String(m.motivo || '')
      .replace(/^Ruleta \(tiro \d+\): /, '')
      .replace(/ · neto .*$/, '')
      .replace(/^(Cofre especial|Cofre): /, '')
      .replace(/ \(vuelve lo retenido\)$/, '')
      .replace(/^castigo: /i, '')
      .trim();
  }

  function clasificar(m) {
    if (!m || (m.tipo !== 'ruleta' && m.tipo !== 'cofre')) return null;
    var mot = String(m.motivo || ''), t = texto(m), clase, ico;
    var origen = m.tipo === 'ruleta' ? 'ruleta' : (/^Cofre especial/.test(mot) ? 'cofre especial' : 'cofre');
    if (m.llaveRota || /se rompió la/.test(t)) { clase = 'neutro'; ico = '💥'; }
    else if (m.item === DISERTACION || /disertación/i.test(t)) {
      clase = 'castigo'; ico = '🎤';
      if (m.tema && t.indexOf(m.tema) < 0) t = 'disertación sobre «' + m.tema + '»';
    }
    else if (m.escapa || /se escapa/i.test(t)) { clase = 'castigo'; ico = '🏃'; }
    else if (m.pierde || /pierde un beneficio|pierde «/.test(t)) { clase = 'castigo'; ico = '🗑️'; }
    else if ((typeof m.acciones === 'number' && m.acciones < 0) || /pierde acciones|pierde \d+ ×/.test(t)) { clase = 'castigo'; ico = '📉'; }
    else if (/^pierde |castigo|saldo queda en 0|^−/i.test(t)) { clase = 'castigo'; ico = '💸'; }
    else if (/casilla vacía|^vacío|cofre vacío/i.test(t)) { clase = 'neutro'; ico = '😐'; }
    else {
      clase = 'premio';
      ico = m.gatito || /gatito/i.test(t) ? '🐱'
        : (typeof m.acciones === 'number' && m.acciones > 0) || /acciones/.test(t) ? '📈'
        : /cofre/i.test(t) ? '🧰'
        : m.item ? (/décima/.test(m.item) ? '📝' : /descuento/.test(m.item) ? '🛍️' : /minutos/.test(m.item) ? '⏱️' : '🎟️')
        : '💰';
    }
    return { clase: clase, ico: ico, txt: t || mot, origen: origen };
  }

  // Estado de un beneficio o disertación ganado (si el movimiento dejó algo por usar).
  function estadoItem(m) {
    if (!m || !m.item) return '';
    var c = m.canje || '';
    if (m.item === DISERTACION) return c === 'pendiente' ? 'por hacer' : c === 'usada' ? 'hecha' : c;
    return { pendiente: 'por usar', usada: 'usado', perdida: 'perdido en la ruleta', 'en-venta': 'a la venta', traspasada: 'vendido',
      regalada: 'regalado', 'en-regalo': 'en regalo', 'en-compra': 'usándose', anulada: 'anulado', embargada: 'embargado' }[c] || c;
  }

  window.PREMIOS = { clasificar: clasificar, estadoItem: estadoItem, DISERTACION: DISERTACION };
})();
