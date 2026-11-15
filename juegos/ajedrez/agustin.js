/* ═══════════════════════════════════════════════════════════════
   Ajedrez Agustino · agustin.js — San Agustín de Hipona comenta la partida
   ───────────────────────────────────────────────────────────────
   Comentarios breves, con su voz, sobre lo que pasa en el tablero, y las
   explicaciones del análisis de la partida. Todo se genera aquí con el motor:
   no se usa ninguna inteligencia artificial externa ni se envían datos.

   Las frases entre comillas «» con su fuente son citas reales de sus obras
   (en traducción libre); las demás están escritas «al estilo de» Agustín,
   para la partida.

   Uso:
     Agustin.comentar(antes, despues, { modo, yo })  → { texto, cita } o null
     Agustin.amenazas(estado, color)                  → piezas en peligro
     Agustin.explicar(itemDelAnalisis, estadoAntes)   → texto para aprender
     Agustin.frase('inicio' | 'tiempo' | 'analisis' | …)
   ═══════════════════════════════════════════════════════════════ */
(function (raiz) {
  'use strict';
  var A = raiz.Ajedrez;
  var NOMBRE = { p: 'peón', n: 'caballo', b: 'alfil', r: 'torre', q: 'dama', k: 'rey' };
  var CON_ART = { p: 'el peón', n: 'el caballo', b: 'el alfil', r: 'la torre', q: 'la dama', k: 'el rey' };
  var VALOR = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

  // Citas reales (traducción libre) y su fuente.
  var CITAS = {
    inquieto: ['Nos hiciste, Señor, para ti, y nuestro corazón está inquieto hasta que descanse en ti.', 'Confesiones I, 1'],
    tarde: ['¡Tarde te amé, hermosura tan antigua y tan nueva, tarde te amé!', 'Confesiones X, 27'],
    tiempo: ['¿Qué es el tiempo? Si nadie me lo pregunta, lo sé; si quiero explicárselo a quien me lo pregunta, no lo sé.', 'Confesiones XI, 14'],
    tolle: ['Toma y lee, toma y lee.', 'Confesiones VIII, 12'],
    fallor: ['Si me engaño, existo.', 'La ciudad de Dios XI, 26'],
    errar: ['Errar es humano; permanecer en el error por soberbia es diabólico.', 'Sermón 164, 14'],
    ama: ['Ama y haz lo que quieras.', 'Comentario a la Primera Carta de Juan 7, 8'],
    ciudades: ['Dos amores fundaron dos ciudades.', 'La ciudad de Dios XIV, 28'],
    peras: ['Robé lo que tenía en abundancia y mucho mejor; no quería gozar de lo robado, sino del robo mismo.', 'Confesiones II, 4'],
    entender: ['Entiende para creer; cree para entender.', 'Sermón 43, 9'],
    humildad: ['El primer camino es la humildad; el segundo, la humildad; el tercero, la humildad.', 'Carta 118, 22'],
    noTodavia: ['Dame castidad y continencia, pero no todavía.', 'Confesiones VIII, 7'],
    memoria: ['Grande es esta fuerza de la memoria, grande sobremanera.', 'Confesiones X, 8']
  };

  var FRASES = {
    inicio: [
      ['Dos ejércitos frente a frente, como dos ciudades. Que gane el amor al buen juego.', 'ciudades'],
      ['Comencemos. En Tagaste aprendí que toda obra grande empieza por un paso pequeño.'],
      ['Que esta partida sea una conversación, no una guerra. Aunque… también es una guerra.'],
      ['Silencio en el claustro: la partida comienza.']
    ],
    centro: [
      'Buen comienzo: quien ocupa el centro, ordena su casa.',
      'El centro del tablero es como el corazón: desde ahí se gobierna todo.',
      'Un peón al centro. Así se construye una ciudad: desde la plaza.'
    ],
    desarrollo: [
      'Las piezas que salen a tiempo son como los discípulos que no se quedan en casa.',
      'Buen desarrollo. Una pieza ociosa es como un talento enterrado.',
      'Así, poco a poco: primero los caballos y los alfiles, después los grandes planes.'
    ],
    damaTemprana: [
      'Tan pronto la dama… Cuidado: la impaciencia la expondrá a todos los peones del barrio.',
      'La dama sale muy temprano. Hasta Mónica, mi madre, esperaba el momento oportuno.',
      'Prisa con la dama. Recuerda: la paciencia acompaña a la sabiduría.'
    ],
    repetirPieza: [
      'Otra vez la misma pieza. Mientras tanto, las demás siguen dormidas.',
      'Mover dos veces la misma pieza en la apertura es como leer dos veces la misma página y no avanzar el libro.'
    ],
    enroque: [
      'Enroque: el rey se pone a resguardo, como yo en mi retiro de Casiciaco.',
      'Buen enroque. Un rey seguro deja pensar en paz.',
      'El rey descansa tras sus muros. Ahora sí, a trabajar.'
    ],
    enroqueTarde: [
      ['Por fin el enroque… Tarde te enrocaste, como tarde amé yo.', 'tarde'],
      ['¿Enroque, pero no todavía? Ya era hora.', 'noTodavia']
    ],
    capturaGrande: [
      'Gran captura. Pero no te ensoberbezcas: la soberbia es el comienzo de todos los errores.',
      'Una pieza mayor cae. Así se derrumban también los imperios: de a poco y luego de golpe.',
      '¡Qué botín! Agradece, pero mira tu propia casa: ¿quedó algo descubierto?'
    ],
    capturaPeon: [
      ['Un peón robado… De joven yo robé peras que ni siquiera quería. Cuida que no sea solo por el gusto de robar.', 'peras'],
      'Un peón menos para el rival. Las cosas pequeñas también suman.',
      'Comer peones está bien, mientras no se olvide lo importante.'
    ],
    capturaSufrida: [
      'Perdiste {pieza}. No te lamentes demasiado: mira qué puedes rescatar de lo que queda.',
      'Se fue {pieza}. Las pérdidas también enseñan a cuidar lo que uno tiene.',
      'Cayó {pieza}. Ánimo: muchas partidas se ganan después de una caída, como muchas vidas.'
    ],
    cambio: [
      'Un cambio de piezas: se simplifica la vida, como quien deja lo superfluo.',
      'Pieza por pieza. La justicia del tablero.'
    ],
    jaque: [
      ['¡Jaque! Inquieto está el rey…', 'inquieto'],
      'Jaque. El rey aprende lo que todos aprendemos: nadie está tan seguro como cree.',
      '¡Jaque! Que el rey mire a su alrededor antes de huir.'
    ],
    coronacion: [
      'Un humilde peón llega al final del camino y se transforma. Así es la conversión.',
      'El último será el primero: el peón se corona.',
      '¡Coronación! La perseverancia del pequeño tiene su recompensa.'
    ],
    alPaso: [
      'Captura al paso: la regla más curiosa del tablero. Hay leyes que solo entiende quien estudia.',
      'Al paso. Quien pasa de largo junto al enemigo puede ser sorprendido.'
    ],
    colgada: [
      'Cuidado: {pieza} en {casilla} quedó sin defensa. Quien no se cuida, se pierde.',
      '{Pieza} en {casilla} está a merced del rival. Vela, como el pastor por su rebaño.',
      'Mira {pieza} de {casilla}: está desprotegida. Conocerse a uno mismo empieza por conocer las propias debilidades.'
    ],
    oportunidad: [
      'Atento: {pieza} rival en {casilla} está sin defensa. ¿La ves?',
      'Hay una pieza rival descuidada en {casilla}. Toma y mira, toma y mira…'
    ],
    mateGano: [
      '¡Jaque mate! Victoria. Recuerda que la humildad hace grande la victoria.',
      'Jaque mate. Bien jugado. Ahora tiende la mano a tu rival: ganar es fácil, ser buen ganador cuesta más.'
    ],
    matePierdo: [
      ['Jaque mate. Si te engañaste, existes; y si existes, puedes aprender.', 'fallor'],
      'La derrota también enseña: yo tardé años en entender lo que hoy aprendiste en una partida.'
    ],
    tablas: [
      'Tablas. La paz también es un buen resultado.',
      'Nadie gana, nadie pierde. Como en las buenas conversaciones.'
    ],
    tiempo: [
      ['¡Poco tiempo! «¿Qué es el tiempo?» Si nadie me lo pregunta, lo sé… pero ahora juega rápido.', 'tiempo']
    ],
    analisis: [
      ['Toma y lee: revisemos la partida jugada por jugada.', 'tolle'],
      ['Entiende para creer, cree para entender: veamos qué pasó en cada jugada.', 'entender'],
      ['Grande es la fuerza de la memoria. Recordemos la partida para aprender de ella.', 'memoria']
    ],
    reflexion: [
      'La paciencia es la compañera de la sabiduría, también en el ajedrez.',
      'Piensa antes de mover. Lo que se hace sin pensar suele deshacerse con dolor.',
      'Cada jugada es una pequeña decisión. Como la vida.',
      'Mira el tablero entero, no solo la pieza que quieres mover.',
      'En Hipona, el mar me enseñó que hay calma antes de la tormenta. Atento.'
    ],
    errorGrave: [
      ['Errar es humano; lo diabólico es insistir en el error.', 'errar'],
      ['Si me engaño, existo: todo error es la prueba de que estamos aprendiendo.', 'fallor']
    ],
    sacrificio: [
      ['Entregas material por la iniciativa… Ama y haz lo que quieras, pero ama con cálculo.', 'ama']
    ]
  };

  var recientes = [];
  function elegir(lista) {
    var opciones = lista.filter(function (f) { return recientes.indexOf(f) < 0; });
    if (!opciones.length) opciones = lista;
    var f = opciones[Math.floor(Math.random() * opciones.length)];
    recientes.push(f); if (recientes.length > 12) recientes.shift();
    return f;
  }
  function rellenar(txt, d) {
    return txt.replace(/\{(\w+)\}/g, function (_, k) {
      if (k === 'Pieza') { var p = d.pieza || ''; return p.charAt(0).toUpperCase() + p.slice(1); }
      return d[k] != null ? d[k] : '';
    });
  }
  // Devuelve { texto, cita } (cita = [texto, fuente] cuando la frase es una cita real).
  function frase(tipo, datos) {
    var f = elegir(FRASES[tipo] || FRASES.reflexion);
    var texto = Array.isArray(f) ? f[0] : f, c = Array.isArray(f) && f[1] ? CITAS[f[1]] : null;
    return { texto: rellenar(texto, datos || {}), cita: c, tipo: tipo };
  }

  /* ---------- piezas en peligro ---------- */
  // Piezas de «color» atacadas por el rival que no tienen defensa, o que las ataca una pieza de menor valor.
  function amenazas(e, color) {
    var rival = A.otro(color);
    var vista = { t: e.t, turno: rival, enroque: '', ap: -1, medio: 0, num: 1, historial: [], claves: [] };
    var atacantes = {};
    A.legales(vista).forEach(function (m) {
      if (!m.captura || A.colorDe(m.captura) !== color) return;
      var v = VALOR[m.pieza.toLowerCase()];
      if (atacantes[m.a] == null || v < atacantes[m.a]) atacantes[m.a] = v;
    });
    var out = [];
    Object.keys(atacantes).forEach(function (k) {
      var sq = +k, p = e.t[sq], tipo = p.toLowerCase();
      if (tipo === 'k') return;
      var defendida = A.atacada(e.t, sq, color);
      if (!defendida || atacantes[k] < VALOR[tipo]) out.push({ casilla: sq, pieza: p, tipo: tipo, valor: VALOR[tipo], defendida: defendida });
    });
    return out.sort(function (a, b) { return b.valor - a.valor; });
  }

  /* ---------- comentario de una jugada ---------- */
  // ctx: { modo: 'local'|'maquina'|'linea', yo: 'w'|'b'|'' } — en línea no se dan pistas sobre la posición.
  function comentar(antes, despues, ctx) {
    ctx = ctx || {};
    var h = despues.historial[despues.historial.length - 1];
    if (!h) return null;
    var r = A.resultado(despues), mio = !ctx.yo || h.color === ctx.yo, n = despues.historial.length;
    var pistas = ctx.modo !== 'linea';
    if (r.fin) {
      if (r.motivo === 'jaque-mate') return frase(!ctx.yo || r.ganador === ctx.yo ? 'mateGano' : 'matePierdo');
      return frase('tablas');
    }
    if (h.promo) return frase('coronacion');
    if (h.tipo === 'ap') return frase('alPaso');
    if (h.tipo === 'enroque') return frase(h.num >= 12 ? 'enroqueTarde' : 'enroque');
    if (h.jaque) return frase('jaque');
    // ¿quien movió dejó algo colgando? (solo pistas fuera del juego en línea)
    if (pistas) {
      var mias = amenazas(despues, h.color).filter(function (x) { return x.valor >= 3; });
      if (mias.length) {
        var x = mias[0], d = { pieza: CON_ART[x.tipo], casilla: A.nombre(x.casilla) };
        // contra la máquina: si la que dejó algo colgando es la máquina, es una oportunidad para ti
        if (ctx.modo === 'maquina' && !mio) return frase('oportunidad', d);
        if (mio || ctx.modo === 'local') return frase('colgada', d);
      }
    }
    if (h.captura) {
      var vc = VALOR[h.captura.toLowerCase()], vm = VALOR[h.pieza.toLowerCase()];
      if (vc >= 3 && ctx.yo && !mio) return frase('capturaSufrida', { pieza: CON_ART[h.captura.toLowerCase()] });
      if (vc >= 5) return frase('capturaGrande');
      if (vc === 1) return Math.random() < 0.6 ? frase('capturaPeon') : null;
      if (antes.anterior && antes.historial.length && antes.historial[antes.historial.length - 1].captura) return frase('cambio');
      return vm > vc + 1 ? null : Math.random() < 0.5 ? frase('cambio') : null;
    }
    // principios de apertura
    if (n <= 16) {
      var tipo = h.pieza.toLowerCase();
      if (tipo === 'q' && n <= 6) return frase('damaTemprana');
      var antesMismo = despues.historial.slice(0, -1).filter(function (x) { return x.color === h.color; });
      if (n <= 12 && antesMismo.some(function (x) { return x.a === h.de; }) && tipo !== 'p' && tipo !== 'k' && Math.random() < 0.6) return frase('repetirPieza');
      if (tipo === 'p' && [27, 28, 35, 36].indexOf(h.a) >= 0 && Math.random() < 0.5) return frase('centro');
      if ((tipo === 'n' || tipo === 'b') && Math.random() < 0.35) return frase('desarrollo');
    }
    return Math.random() < 0.08 ? frase('reflexion') : null;
  }

  /* ---------- explicaciones del análisis ---------- */
  var SIMBOLO = { mejor: '★', excelente: '!', buena: '✓', imprecision: '?!', error: '?', grave: '??' };
  var NOMBRE_CAT = { mejor: 'La mejor jugada', excelente: 'Excelente', buena: 'Buena', imprecision: 'Imprecisión', error: 'Error', grave: 'Error grave' };
  function explicar(it, antes) {
    var partes = [];
    if (it.categoria === 'mejor') partes.push('Encontraste la mejor jugada.');
    else if (it.categoria === 'excelente') partes.push('Casi tan buena como la mejor.');
    else if (it.categoria === 'buena') partes.push('Una jugada correcta' + (it.mejor ? '; ' + it.mejor.san + ' era algo más precisa.' : '.'));
    else {
      if (it.mateCerca === 'rival') partes.push('Esta jugada permite que el rival dé jaque mate en pocas jugadas.');
      else if (it.respuesta && it.respuesta.captura && VALOR[it.respuesta.captura.toLowerCase()] >= 3)
        partes.push('Después de ' + it.san + ', el rival puede responder ' + it.respuesta.san + ' y ganar ' + CON_ART[it.respuesta.captura.toLowerCase()] + '.');
      if (it.mejor && it.mejor.captura && VALOR[it.mejor.captura.toLowerCase()] >= 3)
        partes.push('Dejaste pasar ' + it.mejor.san + ', que capturaba ' + CON_ART[it.mejor.captura.toLowerCase()] + '.');
      else if (it.mejor) partes.push('Era mejor ' + it.mejor.san + '.');
      if (!partes.length) partes.push('Se perdió parte de la ventaja.');
    }
    return partes.join(' ');
  }
  // Frase de San Agustín para cerrar el análisis según cómo jugó cada uno.
  function resumen(precision, errores) {
    if (errores.grave >= 2) return frase('errorGrave');
    if (precision >= 85) return { texto: 'Jugaste con orden y cabeza fría. Así se juega cuando el corazón está en calma.', cita: CITAS.inquieto };
    if (precision >= 65) return { texto: 'Buena partida. Revisa los momentos marcados: ahí está la lección de hoy.', cita: null };
    return { texto: 'Hubo tropiezos, y está bien: el camino de la sabiduría pasa por la humildad de reconocerlos.', cita: CITAS.humildad };
  }
  // Precisión aproximada (0–100) a partir de la pérdida promedio en centipeones.
  function precision(items) {
    if (!items.length) return 100;
    var s = 0;
    items.forEach(function (it) { s += 103 * Math.exp(-0.0045 * Math.min(it.perdida, 1000)) - 3; });
    return Math.max(0, Math.min(100, Math.round(s / items.length)));
  }

  raiz.Agustin = { comentar: comentar, frase: frase, amenazas: amenazas, explicar: explicar, resumen: resumen,
    precision: precision, SIMBOLO: SIMBOLO, NOMBRE_CAT: NOMBRE_CAT, CITAS: CITAS, NOMBRE: NOMBRE, CON_ART: CON_ART };
})(typeof window !== 'undefined' ? window : globalThis);
