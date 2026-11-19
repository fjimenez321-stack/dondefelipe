/* ============================================================
   ODISEA 3D · planets.js
   Datos reales de cada planeta del Sistema Solar.
   · g        → gravedad en la superficie (m/s²)
   · atm      → atmósfera: densidad en el nivel de referencia (rho0, kg/m³),
                altura de escala (H, km) y tipo.
                Planetas gigantes: el "nivel 0" es el de 1 bar.
   · visual   → solo para el dibujo (color del suelo, luz del Sol)
   ============================================================ */
(function (root) {
  const OC3 = root.OC3 = root.OC3 || {};
  OC3.Planetas = {
    mercurio: { nombre: 'Mercurio', g: 3.70,
      atm: { tipo: 'exosfera', rho0: 1e-14, H: 50, presion: '≈ 0 (10⁻¹⁵ bar)', composicion: 'H, He, O, Na (traza)' },
      visual: { suelo: '#6e6a66', luz: 1.7 } },
    venus:    { nombre: 'Venus', g: 8.87,
      atm: { tipo: 'densa', rho0: 65, H: 15.9, presion: '92 bar', composicion: 'CO₂ 96 %' },
      visual: { suelo: '#9a6b3a', luz: 1.2 } },
    tierra:   { nombre: 'Tierra', g: 9.81,
      atm: { tipo: 'moderada', rho0: 1.225, H: 8.5, presion: '1,013 bar', composicion: 'N₂ 78 %, O₂ 21 %' },
      visual: { suelo: '#3d5a3a', luz: 1.0 } },
    marte:    { nombre: 'Marte', g: 3.71,
      atm: { tipo: 'tenue', rho0: 0.020, H: 11.1, presion: '0,006 bar', composicion: 'CO₂ 95 %' },
      visual: { suelo: '#8a4a2c', luz: 0.85 } },
    jupiter:  { nombre: 'Júpiter', g: 24.79,
      atm: { tipo: 'gigante', rho0: 0.16, H: 27, presion: '1 bar (nivel de referencia)', composicion: 'H₂ 90 %, He 10 %' },
      visual: { suelo: '#a8794d', luz: 0.6 } },
    saturno:  { nombre: 'Saturno', g: 10.44,
      atm: { tipo: 'gigante', rho0: 0.19, H: 59.5, presion: '1 bar (nivel de referencia)', composicion: 'H₂ 96 %, He 3 %' },
      visual: { suelo: '#b59d66', luz: 0.5 } },
    urano:    { nombre: 'Urano', g: 8.69,
      atm: { tipo: 'gigante', rho0: 0.42, H: 27.7, presion: '1 bar (nivel de referencia)', composicion: 'H₂ 83 %, He 15 %, CH₄ 2 %' },
      visual: { suelo: '#5f9ea3', luz: 0.45 } },
    neptuno:  { nombre: 'Neptuno', g: 11.15,
      atm: { tipo: 'gigante', rho0: 0.45, H: 19.7, presion: '1 bar (nivel de referencia)', composicion: 'H₂ 80 %, He 19 %, CH₄ 1 %' },
      visual: { suelo: '#34479a', luz: 0.4 } }
  };
  /* Planeta jugable ahora: solo Mercurio. Los demás existen para probar la física (?planeta=venus). */
  OC3.PlanetaInicial = 'mercurio';
})(typeof window !== 'undefined' ? window : globalThis);
