/* ============================================================
   ODISEA 3D · nave.js
   SISTEMA DE NAVE MODULAR (datos + cálculo; sin dibujo ni three.js).
   El jugador equipa módulos (config.js → modulos). Cada uno trae una ventaja y,
   casi siempre, un inconveniente. Con N unidades equipadas el factor se
   aplica N veces (1,2 ³ = 1,728). Estadísticas que se multiplican:
      potencia · velocidad · consumo · capacidad
   Derivados que usa sim.js:
      vCrucero  = base · potencia · velocidad
      accLateral/accVertical = base · potencia
      combustibleMax = base · capacidad      consumoMult = consumo
   ============================================================ */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};
  const C = () => OC3.Config;
  const CLAVE = 'odisea2_equipo';

  /* qué estadísticas existen y hacia dónde es "mejor" */
  const ESTAT = {
    potencia:  { nombre: 'Potencia del motor',        mejor: 'sube' },
    velocidad: { nombre: 'Velocidad',                 mejor: 'sube' },
    capacidad: { nombre: 'Capacidad de combustible',  mejor: 'sube' },
    consumo:   { nombre: 'Consumo de combustible',    mejor: 'baja' }
  };

  function normalizar(eq) {
    const out = {}, M = C().modulos;
    for (const id in M) { const n = Math.round(Number(eq && eq[id]) || 0); out[id] = Math.max(0, Math.min(M[id].max, n)); }
    return out;
  }
  function factores(eq) {
    const f = { potencia: 1, velocidad: 1, consumo: 1, capacidad: 1 }, e = normalizar(eq), M = C().modulos;
    for (const id in M) for (const st in M[id].efectos) f[st] = (f[st] == null ? 1 : f[st]) * Math.pow(M[id].efectos[st], e[id]);
    return f;
  }
  function derivados(eq) {
    const f = factores(eq), N = C().nave;
    return { vCrucero: N.vCrucero * f.potencia * f.velocidad, accLateral: N.accLateral * f.potencia, accVertical: N.accVertical * f.potencia,
             combustibleMax: N.combustibleMax * f.capacidad, consumoMult: f.consumo, factores: f };
  }
  /* líneas «ventaja / inconveniente» de UN módulo, generadas desde sus efectos */
  function describir(id) {
    const m = C().modulos[id], pos = [], neg = [];
    for (const st in m.efectos) {
      const v = m.efectos[st], meta = ESTAT[st] || { nombre: st, mejor: 'sube' };
      const bueno = (v > 1 && meta.mejor === 'sube') || (v < 1 && meta.mejor === 'baja');
      (bueno ? pos : neg).push(meta.nombre + ' ×' + String(v).replace('.', ','));
    }
    return { ventajas: pos, inconvenientes: neg };
  }
  /* resumen del equipo para el hangar */
  function resumen(eq) {
    const d = derivados(eq), N = C().nave, base = N.consumo.base * d.consumoMult;
    return { vCrucero: d.vCrucero, accel: d.factores.potencia, consumo: d.consumoMult, capacidad: d.combustibleMax, autonomia: d.combustibleMax / base,
             km_s: d.vCrucero * C().escala.mPorUnidad / 1000 };
  }
  function cargar() { try { return normalizar(JSON.parse(root.localStorage.getItem(CLAVE) || '{}')); } catch (e) { return normalizar({}); } }
  function guardar(eq) { try { root.localStorage.setItem(CLAVE, JSON.stringify(normalizar(eq))); } catch (e) {} }

  OC3.Nave = { ESTAT, normalizar, factores, derivados, describir, resumen, cargar, guardar };
})(typeof window !== 'undefined' ? window : globalThis);
