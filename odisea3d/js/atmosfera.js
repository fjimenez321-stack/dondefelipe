/* ============================================================
   ODISEA 3D · atmosfera.js
   INSTRUCCIONES DE ATMÓSFERA (regla del juego).
   La atmósfera no se dibuja aquí: solo frena. Frena más cuanto más
   densa es y cuanto más abajo se vuela (la densidad cae con la altura):

        ρ(h) = ρ0 · e^(−h / H)         h = altitud (km), H = altura de escala
        a_frenado = k · (ρ / ρref) · |v| · v      (se opone al movimiento)

   Con los parámetros de Mercurio (ρ0 ≈ 10⁻¹⁴ kg/m³, una exosfera) la
   razón ρ/ρref es ~10⁻¹⁴ → el frenado es nulo y el vuelo es muy ligero.
   ============================================================ */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};
  const C = () => OC3.Config;

  function altitudKm(y) { return Math.max(0, y) * C().escala.mPorUnidad / 1000; }

  /* densidad (kg/m³) a una altura y (unidades de mundo) sobre el suelo */
  function densidad(planeta, y) {
    const a = planeta.atm;
    return a.rho0 * Math.exp(-altitudKm(y) / a.H);
  }
  /* razón respecto de la Tierra a nivel del mar (1 = como el aire de la Tierra) */
  function razon(planeta, y) { return densidad(planeta, y) / C().atm.rhoRef; }

  /* coeficiente de frenado cuadrático k·(ρ/ρref); la nave lo usa en cada eje */
  function coefArrastre(planeta, y) { return C().atm.arrastre * razon(planeta, y); }

  /* integración estable (implícita): v' = v / (1 + c·|v|·dt)  — nunca invierte el signo */
  function frenar(v, coef, dt) { return v / (1 + coef * Math.abs(v) * dt); }

  OC3.Atmosfera = { altitudKm, densidad, razon, coefArrastre, frenar };
})(typeof window !== 'undefined' ? window : globalThis);
