/* ═══ CAMPEONATITO · datos del triangular (5°, 6° y 7° Básico) ═══
   Este archivo lo usan la página campeonatito.html y las imágenes para redes (redes.html).
   Para cargar un resultado: poner los goles en ga / gb (null = por jugar). */
window.CAMPEONATITO = (function () {
  const EQUIPOS = {
    '5B': { nombre: '5° Básico', chip: '5°B', color: '#2EC4FF' },
    '6B': { nombre: '6° Básico', chip: '6°B', color: '#FF5A7A' },
    '7B': { nombre: '7° Básico', chip: '7°B', color: '#FFC83D' },
  };
  const PARTIDOS = [
    { n: 1, a: '6B', b: '7B', ga: 0,    gb: 5    },
    { n: 2, a: '5B', b: '6B', ga: null, gb: null },
    { n: 3, a: '5B', b: '7B', ga: null, gb: null },
  ];

  /* ── lógica compartida (no hace falta tocarla) ── */
  const jugado = p => p.ga !== null && p.gb !== null;

  function tabla() {
    const t = {};
    for (const id in EQUIPOS) t[id] = { id, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, pts: 0 };
    PARTIDOS.filter(jugado).forEach(({ a, b, ga, gb }) => {
      const A = t[a], B = t[b];
      A.pj++; B.pj++; A.gf += ga; A.gc += gb; B.gf += gb; B.gc += ga;
      if (ga > gb) { A.g++; B.p++; A.pts += 3; }
      else if (ga < gb) { B.g++; A.p++; B.pts += 3; }
      else { A.e++; B.e++; A.pts++; B.pts++; }
    });
    const directo = (x, y) => {
      const m = PARTIDOS.find(p => jugado(p) && ((p.a === x && p.b === y) || (p.a === y && p.b === x)));
      if (!m) return 0;
      const gx = m.a === x ? m.ga : m.gb, gy = m.a === x ? m.gb : m.ga;
      return gy - gx;
    };
    return Object.values(t).sort((x, y) =>
      y.pts - x.pts || (y.gf - y.gc) - (x.gf - x.gc) || y.gf - x.gf || directo(x.id, y.id) || x.id.localeCompare(y.id));
  }

  function estado() {
    const jugados = PARTIDOS.filter(jugado), pend = PARTIDOS.filter(p => !jugado(p)), N = id => EQUIPOS[id].nombre;
    if (!jugados.length) return { corto: 'Por comenzar', txt: `Primer partido: ${N(PARTIDOS[0].a)} vs ${N(PARTIDOS[0].b)}.` };
    if (!pend.length) { const c = tabla()[0]; return { corto: '¡Triangular terminado!', txt: `Campeón: ${N(c.id)} con ${c.pts} puntos.`, campeon: c.id }; }
    const u = jugados[jugados.length - 1];
    const gan = u.ga === u.gb ? null : (u.ga > u.gb ? u.a : u.b);
    const res = gan ? `${N(gan)} ganó ${Math.max(u.ga, u.gb)}-${Math.min(u.ga, u.gb)} a ${N(gan === u.a ? u.b : u.a)}.`
                    : `${N(u.a)} y ${N(u.b)} empataron ${u.ga}-${u.gb}.`;
    return { corto: `Partido ${u.n}`, txt: `${res} Próximo: ${N(pend[0].a)} vs ${N(pend[0].b)}.` };
  }

  return { EQUIPOS, PARTIDOS, jugado, tabla, estado };
})();
