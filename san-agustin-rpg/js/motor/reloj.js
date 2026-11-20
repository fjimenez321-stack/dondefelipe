// ═══════════════════════════════════════════════════════════════
// RELOJ DEL JUEGO (día y noche, horarios de NPC y de zonas)
// Por defecto: 1 hora de juego = 30 segundos reales. Parte a las 08:00.
// ═══════════════════════════════════════════════════════════════
export class Reloj {
  constructor({ inicio = 8 * 60, segPorHora = 30 } = {}) {
    this.minutos = inicio;          // minutos desde las 00:00 del día 1
    this.segPorHora = segPorHora;
    this.pausado = false;
  }
  actualizar(dt) { if (!this.pausado) this.minutos += (dt / this.segPorHora) * 60; }
  get hora() { return Math.floor(this.minutos / 60) % 24; }
  get minuto() { return Math.floor(this.minutos) % 60; }
  get dia() { return Math.floor(this.minutos / 1440) + 1; }
  get texto() { return `${String(this.hora).padStart(2, '0')}:${String(this.minuto).padStart(2, '0')}`; }
  enRango([desde, hasta]) {
    const h = this.hora;
    return desde <= hasta ? h >= desde && h < hasta : h >= desde || h < hasta;
  }
  /** 0 = pleno día, 1 = noche cerrada (para oscurecer la pantalla). */
  get oscuridad() {
    const h = this.minutos / 60 % 24;
    if (h >= 7 && h < 18.5) return 0;
    if (h >= 18.5 && h < 21) return (h - 18.5) / 2.5;
    if (h >= 5.5 && h < 7) return 1 - (h - 5.5) / 1.5;
    return 1;
  }
}
