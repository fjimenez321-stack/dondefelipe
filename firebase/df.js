/* ═══════════════════════════════════════════════════════════════
   El Mundo de Felipe · df.js — cuentas, progreso y datos (Firebase)
   ───────────────────────────────────────────────────────────────
   Se agrega a cualquier página (ajusta la ruta relativa):
     <script src="../firebase/df.js"></script>

   Qué hace solo, en cada página:
     · Muestra una vez el aviso de privacidad (qué datos se guardan).
     · Mantiene la sesión entre páginas y la cierra tras unas horas
       sin uso (computadores compartidos).
     · Actualiza el botón de cuenta (#df-cuenta) con el nombre.
     · Cuenta la visita de forma anónima.

   Para las páginas:
     DF.ofrecer({ tipo:'puntaje', juego:'odisea', titulo:'Odisea', puntaje: 1234 })
     DF.ofrecer({ tipo:'resultado', sim:'sismos', titulo:'Sismos', datos:{…}, texto:'8 de 10' })
     DF.guardarProgreso('quimica-es', { … })   ·   DF.leerProgreso('quimica-es')

   Si Firebase no está configurado, todo falla en silencio y la
   página sigue funcionando igual que antes.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.DF) return;

  var VER = '10.12.2';
  var yo = document.currentScript;
  var BASE = (yo && yo.src) ? yo.src.replace(/[^\/]*$/, '') : 'firebase/';
  var SIN_VISITA = !!(yo && yo.hasAttribute('data-sin-visita'));
  var SIN_AVISO = !!(yo && yo.hasAttribute('data-sin-aviso'));
  var K_AVISO = 'df_aviso_v1', K_ACT = 'df_ultima_actividad';

  function cargarScript(src) {
    return new Promise(function (ok, mal) {
      var s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = function () { mal(new Error('No se pudo cargar ' + src)); };
      document.head.appendChild(s);
    });
  }
  function cfg() { return window.DF_CONFIG || {}; }
  function configurado() {
    var f = cfg().firebase;
    return !!(f && f.apiKey && f.projectId && !/PEGA_AQUI/.test(f.apiKey + f.projectId));
  }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function idSeguro(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'sin-nombre';
  }
  function hoyChile() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function limpio(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
  function nombreCorto(nombre, email) {
    var p = String(nombre || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return String(email || 'Anónimo').split('@')[0];
    if (p.length === 1) return p[0];
    var ap = p.length >= 3 ? p[p.length - 2] : p[p.length - 1];
    return p[0] + ' ' + ap.charAt(0).toUpperCase() + '.';
  }
  function rutaRaiz() { return BASE.replace(/firebase\/$/, ''); }
  function edadMinima() { return +cfg().edadMinimaSinApoderado || 14; }

  /* ---------- arranque de Firebase (perezoso) ---------- */
  var _fb = null, usuario = null, perfil = null, oyentes = [];
  function avisar() {
    pintarBotonCuenta();
    aplicarGrupo();
    if (usuario) leerPerfil().then(function () { aplicarGrupo(); asegurarCuentaBanco(); }, function () {});
    oyentes.forEach(function (cb) { try { cb(usuario); } catch (e) {} });
  }
  function listo() {
    if (_fb) return _fb;
    _fb = (window.DF_CONFIG ? Promise.resolve() : cargarScript(BASE + 'config.js')).then(function () {
      if (!configurado()) throw new Error('Firebase todavía no está configurado (firebase/config.js).');
      var CDN = cfg().cdn || ('https://www.gstatic.com/firebasejs/' + VER + '/');
      return Promise.all([
        import(CDN + 'firebase-app.js'),
        import(CDN + 'firebase-auth.js'),
        import(CDN + 'firebase-firestore.js')
      ]);
    }).then(function (mods) {
      var A0 = mods[0], A = mods[1], F = mods[2], C = cfg();
      var app = A0.getApps().length ? A0.getApp() : A0.initializeApp(C.firebase);
      var auth = A.getAuth(app);
      var db = F.getFirestore(app);
      if (C.emulador) {
        try { A.connectAuthEmulator(auth, C.emulador.auth, { disableWarnings: true }); } catch (e) {}
        try { var h = C.emulador.firestore.split(':'); F.connectFirestoreEmulator(db, h[0], +h[1]); } catch (e) {}
      }
      var fb = { app: app, auth: auth, db: db, A: A, F: F };
      // La sesión se mantiene entre páginas y pestañas, pero se cierra sola
      // tras unas horas sin uso (ver cerrarSesionTrasHoras en config.js).
      return A.setPersistence(auth, A.browserLocalPersistence).catch(function () {}).then(function () {
        return new Promise(function (ok) {
          var primera = true;
          A.onAuthStateChanged(auth, function (u) {
            if (primera && u && sesionVencida()) {
              primera = false;
              A.signOut(auth).then(function () { usuario = null; perfil = null; avisar(); ok(fb); });
              return;
            }
            usuario = u || null; perfil = null;
            if (u) marcarActividad();
            avisar();
            if (primera) { primera = false; ok(fb); }
          });
        });
      });
    });
    _fb.catch(function (e) { console.info('[DF] ' + e.message); });
    return _fb;
  }
  /* ---------- tiempo real (Realtime Database del mismo proyecto) ----------
     Para lo que cambia muchas veces por segundo (posiciones en los mundos 3D).
     Firestore cobra por operación; Realtime Database cobra por datos y avisa
     cuando alguien se desconecta. Se carga solo en las páginas que lo piden. */
  /* Reloj del servidor. Las reglas cuentan el día con la hora de Google
     (request.time), no con la del computador. Si el reloj del equipo está mal
     (pasa en salas de computación), el bono diario y los poderes de los gatitos
     se rechazaban con «Missing or insufficient permissions». DF.ahora() corrige
     el desfase usando la cabecera Date de la respuesta del propio sitio. */
  var _desfase = 0, _reloj = null;
  function reloj() {
    if (_reloj) return _reloj;
    var t0 = Date.now();
    _reloj = fetch(location.href.split('#')[0], { method: 'HEAD', cache: 'no-store' }).then(function (r) {
      var d = Date.parse(r.headers.get('date') || '') + (parseInt(r.headers.get('age') || '0', 10) || 0) * 1000;   // Age: si viene de caché
      if (!isNaN(d)) {
        var t1 = Date.now(), dif = d + 500 - (t0 + t1) / 2;   // la cabecera trunca al segundo
        if (Math.abs(dif) > 120000) _desfase = dif;           // solo si el reloj está claramente mal (> 2 min)
      }
      return _desfase;
    }).catch(function () { return 0; });
    return _reloj;
  }
  function ahora() { return Date.now() + _desfase; }
  reloj();

  var _rt = null;
  function tiempoReal() {
    if (_rt) return _rt;
    _rt = listo().then(function (fb) {
      var CDN = cfg().cdn || ('https://www.gstatic.com/firebasejs/' + VER + '/');
      return import(CDN + 'firebase-database.js').then(function (R) {
        var C = cfg().firebase, url = C.databaseURL || ('https://' + C.projectId + '-default-rtdb.firebaseio.com');
        return { R: R, rtdb: R.getDatabase(fb.app, url), fb: fb };
      });
    });
    _rt.catch(function (e) { _rt = null; console.info('[DF] tiempo real: ' + e.message); });
    return _rt;
  }
  function horasSesion() { var h = cfg().cerrarSesionTrasHoras; return h === 0 ? 0 : (+h || 3); }
  function sesionVencida() {
    var h = horasSesion(); if (!h) return false;
    var t = +ls(K_ACT) || 0;
    return !t || (Date.now() - t) > h * 3600e3;
  }
  function marcarActividad() { ls(K_ACT, String(Date.now())); }
  ['click', 'keydown', 'touchstart'].forEach(function (ev) {
    var ultimo = 0;
    window.addEventListener(ev, function () { if (usuario && Date.now() - ultimo > 60e3) { ultimo = Date.now(); marcarActividad(); } }, { passive: true, capture: true });
  });

  function esProfe(u){ return true; }
  function dominioOk(u) {
    var d = String(cfg().dominioColegio || '').toLowerCase().replace(/^@/, '');
    if (!d || esProfe(u)) return true;
    return !!(u && u.email && u.email.toLowerCase().slice(-(d.length + 1)) === '@' + d);
  }

  /* ---------- sesión ---------- */
  function entrar() {
    return listo().then(function (fb) {
      var p = new fb.A.GoogleAuthProvider();
      var d = String(cfg().dominioColegio || '').replace(/^@/, '');
      var params = { prompt: 'select_account' };
      if (d) params.hd = d;
      p.setCustomParameters(params);
      return fb.A.signInWithPopup(fb.auth, p).then(function (r) {
        if (!dominioOk(r.user)) {
          return fb.A.signOut(fb.auth).then(function () {
            throw new Error('Usa tu cuenta Google del colegio (@' + d + ').');
          });
        }
        usuario = r.user; marcarActividad();
        return r.user;
      });
    }).catch(function (e) {
      if (/popup-blocked/.test(e.code || '')) throw new Error('El navegador bloqueó la ventana de Google. Permite ventanas emergentes e intenta de nuevo.');
      if (/popup-closed|cancelled-popup/.test(e.code || '')) { var x = new Error(''); x.cancelado = true; throw x; }
      throw e;
    });
  }
  function salir() {
    return listo().then(function (fb) { perfil = null; ls(K_ACT, null); return fb.A.signOut(fb.auth); });
  }

  /* ---------- perfil: nombre, correo, edad (y curso si se pide) ---------- */
  function leerPerfil() {
    if (!usuario) return Promise.resolve(null);
    if (perfil && perfil.uid === usuario.uid) return Promise.resolve(perfil);
    return listo().then(function (fb) {
      return fb.F.getDoc(fb.F.doc(fb.db, 'alumnos', usuario.uid)).then(function (s) {
        var d = s.exists() ? s.data() : {};
        perfil = { uid: usuario.uid, existe: s.exists(), nombre: d.nombre || usuario.displayName || '', email: usuario.email || '',
          edad: d.edad || null, curso: d.curso || '', apoderado: !!d.apoderado, grupo: d.grupo || '' };
        return perfil;
      });
    });
  }
  var GRUPOS = { estudiante: 'Estudiante', docente: 'Docente', publico: 'Público general' };
  function perfilCompleto(pf) {
    if (!pf || !pf.existe || !pf.edad || !pf.grupo) return false;
    if (cfg().pedirCurso && !pf.curso) return false;
    if (pf.edad < edadMinima() && !pf.apoderado) return false;
    return true;
  }
  function guardarPerfil(datos) {
    return listo().then(function (fb) {
      if (!usuario) throw new Error('Primero entra con tu cuenta.');
      var edad = Math.round(+datos.edad || 0);
      if (!(edad >= 5 && edad <= 99)) throw new Error('Escribe una edad válida.');
      if (edad < edadMinima() && !datos.apoderado) throw new Error('Necesitas que tu apoderado/a esté de acuerdo.');
      // Grupo: los menores de 18 siempre son "estudiante". Una vez elegido, solo el profe lo cambia.
      var previo = perfil && perfil.uid === usuario.uid ? perfil.grupo : '';
      var grupo = previo || (edad < 18 ? 'estudiante' : String(datos.grupo || ''));
      if (!GRUPOS[grupo]) throw new Error('Elige si eres estudiante, docente o público general.');
      if (grupo !== 'estudiante' && edad < 18) throw new Error('Con menos de 18 años la cuenta queda en el grupo Estudiante.');
      var doc = {
        nombre: usuario.displayName || '',
        email: usuario.email || '',
        edad: edad,
        curso: cfg().pedirCurso ? String(datos.curso || '').slice(0, 40) : '',
        apoderado: edad < edadMinima() ? true : false,
        grupo: grupo,
        actualizado: fb.F.serverTimestamp()
      };
      return fb.F.setDoc(fb.F.doc(fb.db, 'alumnos', usuario.uid), doc).then(function () {
        perfil = { uid: usuario.uid, existe: true, nombre: doc.nombre, email: doc.email, edad: edad, curso: doc.curso, apoderado: doc.apoderado, grupo: grupo };
        pintarBotonCuenta(); aplicarGrupo();
        return asegurarCuentaBanco().then(function () { return perfil; });
      });
    });
  }

  /* ---------- grupos: qué ve cada uno ----------
     estudiante → solo progreso (sus datos no se usan para nada más)
     docente / publico (mayores de 18) → pueden ver lo marcado con data-solo-publico (tienda, etc.) */
  function grupoActual() { return (usuario && perfil && perfil.uid === usuario.uid && perfil.grupo) || ''; }
  function puedeComprar() { var g = grupoActual(); return g === 'docente' || g === 'publico'; }
  function aplicarGrupo() {
    var si = puedeComprar(), g = grupoActual();
    document.querySelectorAll('[data-solo-publico]').forEach(function (el) { el.hidden = !si; });
    document.querySelectorAll('[data-solo-estudiante]').forEach(function (el) { el.hidden = g !== 'estudiante'; });
  }

  /* ---------- puntajes de juegos ----------
     Anti-trampa (ver «Puntajes y rankings» en firestore.rules): las reglas solo aceptan lo
     ganado desde el récord anterior si cabe en RITMO (puntos por minuto) × minutos desde que
     se abrió el juego, medidos con la hora del servidor. Por eso cada página de juego anota
     su inicio de partida (partidas/<uid>__<juego>) apenas hay sesión. Si alguien entra con
     su cuenta recién al final, el puntaje se guarda tras esperar el tiempo que falte.
     Mantener RITMOS igual que reglaJuego() en las reglas. */
  var RITMOS = { 'odisea': 4000, 'operacion-barrera': 2500, 'segunda-barrera': 2500, 'ruta-paes': 600, 'energia-pista': 300, 'ludo-chileno': 600 };
  var JUEGO_PAGINA = [[/\/odisea\//, 'odisea'], [/operacionbarrera\.html/, 'operacion-barrera'], [/segundabarrera\.html/, 'segunda-barrera'],
                      [/ruta-paes/, 'ruta-paes'], [/pista-energia/, 'energia-pista'], [/ludo-chileno/, 'ludo-chileno']];
  var partidas = {};   // juego → { t: hora local del inicio, p: promesa de la escritura }
  function iniciarPartida(juego) {
    juego = idSeguro(juego);
    if (partidas[juego] && partidas[juego].uid === (usuario && usuario.uid)) return partidas[juego].p;
    if (!usuario) return Promise.resolve(null);
    var reg = { t: Date.now(), uid: usuario.uid };
    reg.p = listo().then(function (fb) {
      return fb.F.setDoc(fb.F.doc(fb.db, 'partidas', usuario.uid + '__' + juego), { inicio: fb.F.serverTimestamp() });
    }).catch(function () { delete partidas[juego]; });
    partidas[juego] = reg;
    return reg.p;
  }
  function juegoDeEstaPagina() {
    for (var i = 0; i < JUEGO_PAGINA.length; i++) if (JUEGO_PAGINA[i][0].test(location.pathname)) return JUEGO_PAGINA[i][1];
    return '';
  }
  oyentes.push(function (u) { var j = juegoDeEstaPagina(); if (u && j) iniciarPartida(j); });

  function guardarPuntaje(juego, puntaje, extra, alEsperar) {
    juego = idSeguro(juego);
    puntaje = Math.max(0, Math.round(Number(puntaje) || 0));
    return listo().then(function (fb) {
      if (!usuario) throw new Error('Primero entra con tu cuenta.');
      if (!RITMOS[juego]) throw new Error('Este juego no tiene ranking.');
      // ¿cuánto falta de tiempo de juego para que las reglas acepten este puntaje?
      return Promise.all([iniciarPartida(juego), fb.F.getDoc(fb.F.doc(fb.db, 'rankings', juego, 'mejores', usuario.uid)).catch(function () { return null; })])
        .then(function (r) {
          var antes = r[1] && r[1].exists() ? (r[1].data().puntaje || 0) : 0;
          var falta = Math.max(0, (puntaje - antes) / RITMOS[juego] * 60000 - (Date.now() - partidas[juego].t)) ;
          if (falta <= 0) return;
          falta += 3000;   // margen por la diferencia de relojes
          if (alEsperar) try { alEsperar(falta); } catch (e) {}
          return new Promise(function (ok) { setTimeout(ok, falta); });
        });
    }).then(function () { return listo(); }).then(function (fb) {
      return leerPerfil().then(function (pf) {
        var F = fb.F, base = {
          juego: juego, uid: usuario.uid,
          nombre: nombreCorto(usuario.displayName, usuario.email),
          curso: (pf && pf.curso) || '',
          puntaje: puntaje, fecha: F.serverTimestamp()
        };
        var reg = Object.assign({ email: usuario.email || '', extra: limpio(extra) }, base);
        return F.addDoc(F.collection(fb.db, 'puntajes'), reg).then(function () {
          var ref = F.doc(fb.db, 'rankings', juego, 'mejores', usuario.uid);
          return F.runTransaction(fb.db, function (tx) {
            return tx.get(ref).then(function (s) {
              var antes = s.exists() ? (s.data().puntaje || 0) : -1;
              if (puntaje > antes) { tx.set(ref, base); return { mejor: puntaje, record: true }; }
              return { mejor: antes, record: false };
            });
          });
        });
      });
    });
  }
  function top(juego, n) {
    return listo().then(function (fb) {
      var F = fb.F;
      var q = F.query(F.collection(fb.db, 'rankings', idSeguro(juego), 'mejores'), F.orderBy('puntaje', 'desc'), F.limit(n || 10));
      return F.getDocs(q).then(function (s) { return s.docs.map(function (d) { return d.data(); }); });
    });
  }

  /* ---------- resultados de simuladores ---------- */
  function guardarResultado(sim, datos) {
    return listo().then(function (fb) {
      if (!usuario) throw new Error('Primero entra con tu cuenta.');
      return leerPerfil().then(function (pf) {
        var F = fb.F;
        return F.addDoc(F.collection(fb.db, 'resultados'), {
          sim: idSeguro(sim), uid: usuario.uid,
          nombre: usuario.displayName || '', email: usuario.email || '',
          curso: (pf && pf.curso) || '',
          datos: limpio(datos), fecha: F.serverTimestamp()
        });
      });
    });
  }

  /* ---------- progreso (avance en planes, juegos, etc.) ---------- */
  function refProgreso(fb, clave) { return fb.F.doc(fb.db, 'progreso', usuario.uid, 'items', idSeguro(clave)); }
  function guardarProgreso(clave, datos) {
    return listo().then(function (fb) {
      if (!usuario) throw new Error('Primero entra con tu cuenta.');
      return fb.F.setDoc(refProgreso(fb, clave), { datos: limpio(datos), actualizado: fb.F.serverTimestamp() });
    });
  }
  function leerProgreso(clave) {
    return listo().then(function (fb) {
      if (!usuario) return null;
      return fb.F.getDoc(refProgreso(fb, clave)).then(function (s) { return s.exists() ? (s.data().datos || null) : null; });
    });
  }

  /* ---------- mi banco de Hipopesos (si el profe vinculó mi correo) ---------- */
  function miBanco() {
    return listo().then(function (fb) {
      if (!usuario || !usuario.email) return null;
      var F = fb.F, db = fb.db;
      return F.getDoc(F.doc(db, 'banco_vinculos', usuario.email.toLowerCase())).then(function (v) {
        if (!v.exists()) return null;
        var id = v.data().cuenta;
        return Promise.all([
          F.getDoc(F.doc(db, 'banco_cuentas', id)),
          F.getDocs(F.query(F.collection(db, 'banco_movs'), F.where('cuenta', '==', id)))
        ]).then(function (r) {
          if (!r[0].exists()) return null;
          var movs = r[1].docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); });
          movs.sort(function (a, b) { return (b.fecha && b.fecha.toDate ? b.fecha.toDate() : 0) - (a.fecha && a.fecha.toDate ? a.fecha.toDate() : 0); });
          return { cuenta: Object.assign({ id: id }, r[0].data()), movs: movs };
        });
      });
    });
  }

  /* ---------- cuenta del banco automática para estudiantes ----------
     Solo si el profe activó la creación automática (config/banco.autoCrear) y
     el estudiante aún no tiene cuenta vinculada. Se crea con saldo 0. */
  var _asegurando = null;
  function separarNombre(n) {
    var p = String(n || '').trim().split(/\s+/).filter(Boolean);
    if (p.length <= 1) return { nombre: p[0] || '', apellido: '' };
    if (p.length === 2) return { nombre: p[0], apellido: p[1] };
    return { nombre: p.slice(0, p.length - 2).join(' '), apellido: p.slice(-2).join(' ') };
  }
  function asegurarCuentaBanco() {
    if (_asegurando) return _asegurando;
    _asegurando = listo().then(function (fb) {
      if (!usuario || !usuario.email) return null;
      return leerPerfil().then(function (pf) {
        if (!pf || !perfilCompleto(pf) || pf.grupo !== 'estudiante') return null;
        var F = fb.F, db = fb.db, correo = usuario.email.toLowerCase();
        var refCfg = F.doc(db, 'config', 'banco'), refV = F.doc(db, 'banco_vinculos', correo);
        return Promise.all([F.getDoc(refCfg), F.getDoc(refV)]).then(function (r) {
          var c = r[0].exists() ? r[0].data() : {};
          if (!c.autoCrear || r[1].exists()) return null;
          var id = 'u-' + usuario.uid, refC = F.doc(db, 'banco_cuentas', id), nom = separarNombre(usuario.displayName);
          return F.runTransaction(db, function (tx) {
            return Promise.all([tx.get(refCfg), tx.get(refV)]).then(function (x) {
              if (x[1].exists()) return null;
              var n = (x[0].data() || {}).siguiente || 1;
              tx.update(refCfg, { siguiente: n + 1 });
              tx.set(refC, { numero: String(n), nombre: nom.nombre, apellido: nom.apellido, curso: '', saldo: 0, estado: 'Activa',
                extra: {}, auto: true, creada: F.serverTimestamp(), actualizado: F.serverTimestamp() });
              tx.set(refV, { cuenta: id, numero: String(n), nombre: (nom.nombre + ' ' + nom.apellido).trim(), actualizado: F.serverTimestamp() });
              return { id: id, numero: String(n) };
            });
          });
        });
      });
    }).catch(function (e) { console.info('[DF] cuenta del banco no creada: ' + e.message); return null; })
      .then(function (r) { _asegurando = null; return r; });
    return _asegurando;
  }

  /* ---------- mis datos: ver, descargar, borrar ---------- */
  function misDatos() {
    return listo().then(function (fb) {
      if (!usuario) throw new Error('Primero entra con tu cuenta.');
      var F = fb.F, uid = usuario.uid;
      var mios = function (col) { return F.getDocs(F.query(F.collection(fb.db, col), F.where('uid', '==', uid))); };
      return Promise.all([
        leerPerfil(),
        mios('puntajes'), mios('resultados'),
        F.getDocs(F.collection(fb.db, 'progreso', uid, 'items')),
        miBanco().catch(function () { return null; }),
        F.getDoc(F.doc(fb.db, 'perfiles_publicos', uid)).catch(function () { return null; })
      ]).then(function (r) {
        var lista = function (s) { return s.docs.map(function (d) { return Object.assign({ _id: d.id }, d.data()); }); };
        return { perfil: r[0], puntajes: lista(r[1]), resultados: lista(r[2]), progreso: lista(r[3]), banco: r[4],
          perfilPublico: r[5] && r[5].exists() ? r[5].data() : null };
      });
    });
  }
  function borrarMisDatos() {
    return listo().then(function (fb) {
      if (!usuario) throw new Error('Primero entra con tu cuenta.');
      var F = fb.F, uid = usuario.uid, db = fb.db;
      return misDatos().then(function (d) {
        var juegos = {}; d.puntajes.forEach(function (p) { juegos[p.juego] = 1; });
        var borrar = [];
        d.puntajes.forEach(function (p) { borrar.push(F.deleteDoc(F.doc(db, 'puntajes', p._id))); });
        d.resultados.forEach(function (p) { borrar.push(F.deleteDoc(F.doc(db, 'resultados', p._id))); });
        d.progreso.forEach(function (p) { borrar.push(F.deleteDoc(F.doc(db, 'progreso', uid, 'items', p._id))); });
        Object.keys(juegos).forEach(function (j) { borrar.push(F.deleteDoc(F.doc(db, 'rankings', j, 'mejores', uid))); });
        if (d.perfilPublico) borrar.push(F.deleteDoc(F.doc(db, 'perfiles_publicos', uid)));
        Object.keys(RITMOS).forEach(function (j) { borrar.push(F.deleteDoc(F.doc(db, 'partidas', uid + '__' + j)).catch(function () {})); });
        borrar.push(F.deleteDoc(F.doc(db, 'alumnos', uid)));
        return Promise.all(borrar);
      }).then(function () {
        perfil = null;
        // Borra también la cuenta de acceso; si Google pide volver a entrar, igual cerramos la sesión.
        return fb.A.deleteUser(usuario).catch(function () { return fb.A.signOut(fb.auth); });
      }).then(function () { ls(K_ACT, null); });
    });
  }

  /* ---------- visitas (anónimas) ---------- */
  function paginaActual() {
    var p = location.pathname || '/';
    if (/\.github\.io$/i.test(location.hostname)) p = p.replace(/^\/[^\/]+/, '');   // quita /dondefelipe
    if (/\/$/.test(p)) p += 'index.html';
    return p.replace(/^\/+/, '');
  }
  function visita(pagina) {
    if (cfg().contarVisitas === false) return Promise.resolve();
    pagina = String(pagina || paginaActual());
    var id = pagina.replace(/\//g, '~').slice(0, 120) || 'index.html';
    try {
      var k = 'df_v_' + id;
      if (sessionStorage.getItem(k)) return Promise.resolve();
      sessionStorage.setItem(k, '1');
    } catch (e) {}
    return listo().then(function (fb) {
      var F = fb.F, inc = function () { return { n: F.increment(1), ultima: F.serverTimestamp() }; };
      var w = [F.setDoc(F.doc(fb.db, 'visitas', id), inc(), { merge: true })];
      // Las secciones internas del inicio (index.html#cursos) no suman al total del día.
      if (pagina.indexOf('#') < 0) w.push(F.setDoc(F.doc(fb.db, 'visitas_dias', hoyChile()), inc(), { merge: true }));
      return Promise.all(w);
    }).catch(function (e) { console.info('[DF] visita no registrada: ' + e.message); });
  }

  /* ---------- estilos de las piezas que inserta df.js ---------- */
  var CSS = '' +
    '.dfc,.dfa{font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#f3f1ff}' +
    '.dfc{position:fixed;right:16px;bottom:16px;z-index:2147483000;width:min(350px,calc(100vw - 32px));' +
    'background:#14121f;border:1px solid rgba(255,255,255,.14);border-radius:16px;' +
    'box-shadow:0 18px 50px rgba(0,0,0,.45);padding:16px 16px 14px;transform:translateY(20px);opacity:0;transition:.25s ease}' +
    '.dfc.in,.dfa.in{transform:none;opacity:1}' +
    '.dfc h4{margin:0 26px 6px 0;font-size:15px;font-weight:700;color:#fff}' +
    '.dfc p{margin:0 0 10px;color:#c9c5e6}' +
    '.dfc b.n{color:#c8f55a}' +
    '.dfc .x{position:absolute;top:8px;right:10px;background:none;border:0;color:#9d98c2;font-size:20px;cursor:pointer;line-height:1}' +
    '.dfc .fila,.dfa .fila{display:flex;gap:8px;flex-wrap:wrap;align-items:center}' +
    '.dfc button.b,.dfa button.b,.dfa a.b{border:0;border-radius:10px;padding:9px 14px;font:600 14px system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-block}' +
    '.dfc .p,.dfa .p{background:#c8f55a;color:#14121f}' +
    '.dfc .s,.dfa .s{background:rgba(255,255,255,.08);color:#f3f1ff}' +
    '.dfc input[type=number],.dfc select{width:90px;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:#1f1c30;color:#fff;font:14px system-ui,sans-serif}' +
    '.dfc select{width:auto;flex:1}' +
    '.dfc label.ap{display:flex;gap:8px;align-items:flex-start;margin:8px 0 10px;font-size:13px;color:#e3defc}' +
    '.dfc .legal{font-size:12px;color:#9d98c2;margin:10px 0}' +
    '.dfc .legal a,.dfc .pie a{color:#c8f55a}' +
    '.dfc .ok{color:#c8f55a;font-weight:700}' +
    '.dfc .err{color:#ff8a80}' +
    '.dfc .pie{margin-top:10px;font-size:12px;color:#9d98c2}' +
    '.dfc .pie button{background:none;border:0;color:#9d98c2;text-decoration:underline;cursor:pointer;font:inherit;padding:0}' +
    '.dfa{position:fixed;left:50%;bottom:16px;z-index:2147482999;width:min(720px,calc(100vw - 24px));transform:translate(-50%,20px);opacity:0;transition:.3s ease;' +
    'background:#12101c;border:1px solid rgba(255,255,255,.14);border-left:4px solid #22e3ff;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.5);padding:14px 16px}' +
    '.dfa.in{transform:translate(-50%,0)}' +
    '.dfa b.t{display:block;font-size:15px;color:#fff;margin-bottom:4px}' +
    '.dfa p{margin:0 0 10px;color:#cfcae8}' +
    '.dfa ul{margin:0 0 10px;padding-left:18px;color:#cfcae8}' +
    '.dfa li b{color:#fff}';
  var cssPuesto = false;
  function ponerCSS() { if (cssPuesto) return; var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); cssPuesto = true; }

  /* ---------- aviso de privacidad (una vez por navegador) ---------- */
  function mostrarAviso(forzar) {
    if (!forzar && (SIN_AVISO || cfg().aviso === false || ls(K_AVISO))) return;
    if (document.querySelector('.dfa')) return;
    ponerCSS();
    var a = document.createElement('div');
    a.className = 'dfa'; a.setAttribute('role', 'dialog'); a.setAttribute('aria-label', 'Aviso de privacidad');
    a.innerHTML = '<b class="t">🔒 Tus datos en El Mundo de Felipe</b>' +
      '<p>Puedes usar el sitio sin cuenta. Si entras con Google para guardar tu progreso, guardamos <b>solo lo mínimo</b>:</p>' +
      '<ul><li><b>Nombre</b> y <b>correo</b> (los de tu cuenta Google)</li><li><b>Edad</b> (la escribes tú)</li>' +
      '<li><b>Grupo</b>: estudiante, docente o público general</li>' +
      '<li>Tus puntajes, resultados y avances en el sitio</li></ul>' +
      '<p>Solo el profe los ve. No se venden ni se comparten, y puedes borrarlos cuando quieras desde <b>Mi cuenta</b>. Las visitas se cuentan sin saber quién eres.</p>' +
      '<div class="fila"><button class="b p" type="button" data-a="ok">Entendido</button><a class="b s" href="' + rutaRaiz() + 'cuenta.html#privacidad">Más detalles</a></div>';
    document.body.appendChild(a);
    requestAnimationFrame(function () { a.classList.add('in'); });
    a.querySelector('[data-a="ok"]').addEventListener('click', function () {
      ls(K_AVISO, String(Date.now()));
      a.classList.remove('in'); setTimeout(function () { a.remove(); }, 300);
    });
  }

  /* ---------- botón de cuenta (#df-cuenta en el menú) ---------- */
  function pintarBotonCuenta() {
    var els = document.querySelectorAll('#df-cuenta, [data-df-cuenta]');
    els.forEach(function (el) {
      var t = el.querySelector('span') || el;
      t.textContent = usuario ? (String(usuario.displayName || usuario.email || 'Mi cuenta').split(/\s+/)[0]) : 'Entrar';
      el.title = usuario ? ('Sesión iniciada: ' + (usuario.email || '')) : 'Entrar para guardar tu progreso';
    });
  }
  // La portada vuelve a dibujar el menú: revisar el botón de vez en cuando.
  setInterval(function () {
    var el = document.querySelector('#df-cuenta, [data-df-cuenta]');
    if (el && !el.getAttribute('data-df-ok')) { el.setAttribute('data-df-ok', '1'); pintarBotonCuenta(); }
  }, 1500);

  /* ---------- formulario de perfil (edad + aviso), reutilizable ---------- */
  function htmlPerfil(err) {
    var C = cfg();
    var cursos = C.pedirCurso ? '<p style="margin:8px 0 4px">¿Curso?</p><div class="fila"><select data-f="curso"><option value="">Elige tu curso…</option>' +
      (C.cursos || []).map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></div>' : '';
    return '<h4>Un último paso</h4>' +
      '<p>Hola, ' + esc(String(usuario.displayName || usuario.email || '').split(/[\s@]+/)[0]) + '. ¿Cuántos años tienes?</p>' +
      '<div class="fila"><input type="number" min="5" max="99" inputmode="numeric" data-f="edad" aria-label="Edad"> años</div>' + cursos +
      '<label class="ap" data-f="apbox" hidden><input type="checkbox" data-f="apoderado"> <span>Mi apoderado/a sabe que uso esta cuenta en El Mundo de Felipe y está de acuerdo.</span></label>' +
      '<div data-f="grbox" hidden><p style="margin:8px 0 4px">¿Quién eres?</p>' +
      '<label class="ap"><input type="radio" name="dfgr" value="estudiante"> <span>Estudiante</span></label>' +
      '<label class="ap"><input type="radio" name="dfgr" value="docente"> <span>Docente</span></label>' +
      '<label class="ap"><input type="radio" name="dfgr" value="publico"> <span>Público general</span></label></div>' +
      '<p class="legal">Al continuar aceptas que guardemos tu <b>nombre, correo, edad y grupo</b>, junto con tu progreso, para tu aprendizaje. Solo el profe los ve. <a href="' + rutaRaiz() + 'cuenta.html#privacidad" target="_blank" rel="noopener">Más detalles</a></p>' +
      (err ? '<p class="err">' + esc(err) + '</p>' : '') +
      '<div class="fila"><button class="b p" type="button" data-a="okperfil">Acepto y continúo</button></div>';
  }
  function engancharPerfil(t) {
    var edad = t.querySelector('[data-f="edad"]'), box = t.querySelector('[data-f="apbox"]');
    if (!edad) return;
    var gr = t.querySelector('[data-f="grbox"]');
    edad.addEventListener('input', function () {
      box.hidden = !(+edad.value > 0 && +edad.value < edadMinima());
      if (gr) gr.hidden = !(+edad.value >= 18);
    });
    setTimeout(function () { edad.focus(); }, 50);
  }
  function leerFormPerfil(t) {
    var q = function (f) { return t.querySelector('[data-f="' + f + '"]'); };
    var g = t.querySelector('input[name="dfgr"]:checked');
    return { edad: q('edad') && q('edad').value, curso: q('curso') && q('curso').value, apoderado: q('apoderado') && q('apoderado').checked, grupo: g ? g.value : '' };
  }

  /* ---------- tarjeta flotante "guardar" ---------- */
  var tarjeta = null, noGracias = false;
  function cerrarTarjeta() {
    if (!tarjeta) return;
    var t = tarjeta; tarjeta = null; t.classList.remove('in');
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
  }

  function ofrecer(op) {
    if (!configurado() && window.DF_CONFIG) return Promise.resolve(null);
    // Si el estudiante ya dijo "No, gracias" en esta página, no insistir.
    if (noGracias && !usuario && !op.insistir) return Promise.resolve(null);
    return listo().then(function () {
      ponerCSS();
      cerrarTarjeta();
      var t = document.createElement('div');
      t.className = 'dfc'; t.setAttribute('role', 'dialog'); t.setAttribute('aria-live', 'polite');
      (op.contenedor || document.body).appendChild(t);
      if (op.contenedor) { t.style.position = 'static'; t.style.width = 'auto'; t.style.margin = '12px 0'; }
      tarjeta = t;
      requestAnimationFrame(function () { t.classList.add('in'); });
      var esPuntaje = op.tipo !== 'resultado';
      var nombreCosa = esPuntaje ? 'puntaje' : 'resultado';
      var resumen = esPuntaje ? ('<b class="n">' + esc(Math.round(op.puntaje || 0)) + ' pts</b>') : ('<b class="n">' + esc(op.texto || 'tu resultado') + '</b>');
      var titulo = esc(op.titulo || (esPuntaje ? op.juego : op.sim) || '');

      function pinta(cuerpo, conPie) {
        var pie = '';
        if (conPie && usuario) {
          pie = '<div class="pie">' + esc(usuario.email) + ' · <button type="button" data-a="salir">no soy yo</button>' +
            (esPuntaje ? ' · <a href="' + rutaRaiz() + 'rankings.html#' + esc(idSeguro(op.juego)) + '" target="_blank" rel="noopener">ver ranking</a>' : '') + '</div>';
        }
        t.innerHTML = '<button class="x" type="button" data-a="cerrar" aria-label="Cerrar">×</button>' + cuerpo + pie;
      }
      function pasoLogin(msgErr) {
        pinta('<h4>' + titulo + '</h4><p>¿Guardar tu ' + nombreCosa + ' (' + resumen + ') ' + (esPuntaje ? 'en el ranking del colegio' : 'para el profe') + '?</p>' +
          (msgErr ? '<p class="err">' + esc(msgErr) + '</p>' : '') +
          '<div class="fila"><button class="b p" type="button" data-a="entrar">Entrar con Google</button>' +
          '<button class="b s" type="button" data-a="cerrar">No, gracias</button></div>', false);
      }
      function pasoPerfil(err) { pinta(htmlPerfil(err), true); engancharPerfil(t); }
      function guardar() {
        pinta('<h4>' + titulo + '</h4><p>Guardando…</p>', true);
        var pr = esPuntaje ? guardarPuntaje(op.juego, op.puntaje, op.extra, function (ms) {
              pinta('<h4>' + titulo + '</h4><p>Comprobando el tiempo de juego… tu puntaje se guardará en unos <b>' + Math.ceil(ms / 1000) +
                ' s</b>. No cierres esta página.</p>', true);
            }) : guardarResultado(op.sim, op.datos);
        return pr.then(function (r) {
          var msg = esPuntaje
            ? (r.record ? '<p class="ok">✓ ¡Nuevo récord personal guardado!</p>' : '<p class="ok">✓ Puntaje guardado.</p><p>Tu mejor marca sigue siendo <b class="n">' + esc(r.mejor) + ' pts</b>.</p>')
            : '<p class="ok">✓ Resultado guardado. El profe lo puede ver.</p>';
          pinta('<h4>' + titulo + '</h4>' + msg, true);
          if (op.alGuardar) try { op.alGuardar(r); } catch (e) {}
          setTimeout(function () { if (tarjeta === t) cerrarTarjeta(); }, 9000);
          return r;
        }).catch(function (e) {
          pinta('<h4>' + titulo + '</h4><p class="err">No se pudo guardar: ' + esc(e.message) + '</p>' +
            '<div class="fila"><button class="b p" type="button" data-a="reintentar">Reintentar</button></div>', true);
        });
      }
      function seguir() {
        if (!usuario) { pasoLogin(); return; }
        leerPerfil().then(function (pf) { if (!perfilCompleto(pf)) pasoPerfil(); else guardar(); })
          .catch(function (e) { pasoLogin(e.message); });
      }

      t.addEventListener('click', function (ev) {
        var a = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-a');
        if (a === 'cerrar') { if (!usuario) noGracias = true; cerrarTarjeta(); }
        else if (a === 'entrar') entrar().then(seguir).catch(function (e) { pasoLogin(e.cancelado ? '' : e.message); });
        else if (a === 'salir') salir().then(function () { pasoLogin(); });
        else if (a === 'okperfil') guardarPerfil(leerFormPerfil(t)).then(guardar).catch(function (e) { pasoPerfil(e.message); });
        else if (a === 'reintentar') guardar();
      });
      seguir();
      return true;
    }).catch(function () { return null; });
  }

  window.DF = {
    version: VER,
    listo: listo,
    tiempoReal: tiempoReal,
    iniciarPartida: iniciarPartida,
    reloj: reloj,
    ahora: ahora,
    desfase: function () { return _desfase; },
    configurado: function () { return listo().then(function () { return true; }, function () { return false; }); },
    usuario: function () { return usuario; },
    alCambiarUsuario: function (cb) { oyentes.push(cb); if (_fb) _fb.then(function () { cb(usuario); }, function () {}); },
    esProfe: function(u){ return true; },
    entrar: entrar,
    salir: salir,
    perfil: leerPerfil,
    perfilCompleto: perfilCompleto,
    guardarPerfil: guardarPerfil,
    guardarPuntaje: guardarPuntaje,
    guardarResultado: guardarResultado,
    guardarProgreso: guardarProgreso,
    leerProgreso: leerProgreso,
    misDatos: misDatos,
    miBanco: miBanco,
    asegurarCuentaBanco: asegurarCuentaBanco,
    borrarMisDatos: borrarMisDatos,
    top: top,
    visita: visita,
    ofrecer: ofrecer,
    mostrarAviso: mostrarAviso,
    edadMinima: edadMinima,
    grupo: grupoActual,
    grupos: GRUPOS,
    puedeComprar: puedeComprar,
    idSeguro: idSeguro,
    nombreCorto: nombreCorto,
    hoy: hoyChile
  };

  // Arranque en cada página: sesión, botón de cuenta, aviso y visita.
  function arrancar() {
    listo().then(function () {
      mostrarAviso();
      if (!SIN_VISITA) setTimeout(function () { visita(); }, 800);
    }, function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
