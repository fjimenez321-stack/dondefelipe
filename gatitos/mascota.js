/* Mascota (como Pou / Tamagotchi): debe coincidir con firebase/firestore.rules (sección «Mascotas»).
   Nada se descuenta en tiempo real: se guarda cada estado y la hora (t), y se calcula lo que bajó desde
   entonces. Nunca muere: si la descuidas se enferma y hay que llevarla al veterinario. */
(function () {
  'use strict';
  var M = window.MASCOTA = {
    // por hora (la energía sube sola: la mascota duerme cuando no juegas)
    ritmo: { comida: 2.0, higiene: 1.4, diversion: 1.4, energia: 5.0, salud: 1.5 },
    acciones: {
      comer1: { nombre: 'Alimentar', emoji: '🍗', costo: 8000, txt: '+40 comida' },
      comer2: { nombre: 'Comida premium', emoji: '🍣', costo: 20000, txt: 'comida al 100 y +5 salud' },
      banar: { nombre: 'Bañar', emoji: '🛁', costo: 10000, txt: 'higiene al 100' },
      jugar: { nombre: 'Jugar', emoji: '🧶', costo: 0, txt: '+25 diversión · −20 energía · −5 higiene', energiaMin: 20 },
      vet: { nombre: 'Veterinario', emoji: '🩺', costo: 40000, txt: 'salud al 100' },
      // tienda: comida, juguetes y cuidado
      galletas: { nombre: 'Galletas para gato', emoji: '🍪', costo: 4000, txt: '+15 comida · +10 diversión', tienda: true },
      atun: { nombre: 'Lata de atún', emoji: '🐟', costo: 14000, txt: '+70 comida', tienda: true },
      raton: { nombre: 'Ratón de juguete', emoji: '🐭', costo: 6000, txt: '+40 diversión · −10 energía', energiaMin: 10, tienda: true },
      laser: { nombre: 'Puntero láser', emoji: '🔴', costo: 12000, txt: 'diversión al 100 · −25 energía', energiaMin: 25, tienda: true },
      cepillo: { nombre: 'Cepillado', emoji: '🪮', costo: 5000, txt: '+40 higiene', tienda: true },
      cama: { nombre: 'Cama mullida', emoji: '🛏️', costo: 9000, txt: 'energía al 100', tienda: true }
    },
    estados: [['comida', '🍗', 'Comida'], ['higiene', '🧼', 'Higiene'], ['diversion', '🎾', 'Diversión'], ['energia', '😴', 'Energía'], ['salud', '❤️', 'Salud']],
    cambioDias: 7
  };
  var ms = function (t) { return t && t.toMillis ? t.toMillis() : (typeof t === 'number' ? t : 0); };
  function bajar(v, r, h) { return Math.max(0, v - r * h); }
  function enCero(v, r, h) { return Math.max(0, h - v / r); }
  // Horas que cuentan: ninguna si el profe pausó (vacaciones); y nada de lo que pasó durante la pausa.
  M.horas = function (m, ahora, cfg) {
    cfg = cfg || {};
    if (cfg.pausa) return 0;
    var ini = Math.max(ms(m.t), cfg.reanudada ? ms(cfg.reanudada) : 0);
    return Math.max(0, (ahora - ini) / 3600000);
  };
  M.estado = function (m, ahora, cfg) {
    var h = M.horas(m, ahora, cfg), r = M.ritmo;
    return {
      comida: bajar(m.comida, r.comida, h), higiene: bajar(m.higiene, r.higiene, h), diversion: bajar(m.diversion, r.diversion, h),
      energia: Math.min(100, m.energia + r.energia * h),
      salud: bajar(m.salud, r.salud, enCero(m.comida, r.comida, h) + enCero(m.higiene, r.higiene, h) + enCero(m.diversion, r.diversion, h))
    };
  };
  // Bien cuidada: comida, higiene, diversión y energía ≥ 70 y salud ≥ 80 (da ×2 en el poder mensual de ese gatito).
  M.feliz = function (e) { return e.comida >= 70 && e.higiene >= 70 && e.diversion >= 70 && e.energia >= 70 && e.salud >= 80; };
  // Estado después de una acción (redondeado hacia abajo, como se guarda).
  M.aplicar = function (e, a) {
    var n = { comida: e.comida, higiene: e.higiene, diversion: e.diversion, energia: e.energia, salud: e.salud };
    if (a === 'comer1') n.comida = Math.min(100, e.comida + 40);
    if (a === 'comer2') { n.comida = 100; n.salud = Math.min(100, e.salud + 5); }
    if (a === 'banar') n.higiene = 100;
    if (a === 'jugar') { n.diversion = Math.min(100, e.diversion + 25); n.energia = e.energia - 20; n.higiene = Math.max(0, e.higiene - 5); }
    if (a === 'vet') n.salud = 100;
    if (a === 'galletas') { n.comida = Math.min(100, e.comida + 15); n.diversion = Math.min(100, e.diversion + 10); }
    if (a === 'atun') n.comida = Math.min(100, e.comida + 70);
    if (a === 'raton') { n.diversion = Math.min(100, e.diversion + 40); n.energia = e.energia - 10; }
    if (a === 'laser') { n.diversion = 100; n.energia = e.energia - 25; }
    if (a === 'cepillo') n.higiene = Math.min(100, e.higiene + 40);
    if (a === 'cama') n.energia = 100;
    Object.keys(n).forEach(function (k) { n[k] = Math.max(0, Math.min(100, Math.floor(n[k]))); });
    return n;
  };
  // Cómo se siente (para el texto y la cara).
  M.animo = function (e) {
    if (e.salud < 40) return { cara: '🤒', txt: 'Está enferma. Llévala al veterinario.', clase: 'enferma' };
    if (e.comida < 20) return { cara: '😿', txt: '¡Tiene mucha hambre!', clase: 'triste' };
    if (e.higiene < 20) return { cara: '🙀', txt: 'Necesita un baño urgente.', clase: 'triste' };
    if (e.diversion < 20) return { cara: '😾', txt: 'Está aburrida. ¡Juega con ella!', clase: 'triste' };
    if (e.energia < 20) return { cara: '😪', txt: 'Está cansada: déjala dormir un rato.', clase: '' };
    if (M.feliz(e)) return { cara: '😻', txt: '¡Está feliz y bien cuidada!', clase: 'feliz' };
    return { cara: '😺', txt: 'Está bien, pero podría estar mejor.', clase: '' };
  };
})();
