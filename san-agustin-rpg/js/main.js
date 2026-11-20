// ═══════════════════════════════════════════════════════════════
// ARRANQUE: une el motor con los datos y la interfaz (HUD, ayuda).
// Los sistemas de juego (combate, misiones, laboratorios del v4) se
// conectarán aquí escuchando eventos, sin tocar /motor.
// ═══════════════════════════════════════════════════════════════
import { Juego } from './motor/juego.js';
import { leerPartida, borrarPartida } from './motor/guardado.js';
import { tilesetColegio } from './datos/tileset-colegio.js';
import { mapas } from './datos/mapas.js';
import { personajes } from './datos/personajes.js';
import { comunidad } from './datos/comunidad.js';

const $ = (s) => document.querySelector(s);

const juego = new Juego({
  canvas: $('#lienzo'),
  dialogo: $('#dialogo'),
  aviso: $('#aviso'),
  tilesets: { colegio: tilesetColegio },
  mapas,
  personajes,
  comunidad,
});
window.juego = juego; // para probar cosas desde la consola del navegador

// ── Sonidos mínimos (Web Audio, sin archivos) ──────────────────
let ac = null, silencio = false;
function blip(f = 660, d = 0.06, tipo = 'square', vol = 0.04) {
  if (silencio) return;
  try {
    ac ||= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo; o.frequency.value = f;
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
  } catch {}
}
const ev = juego.eventos;
ev.on('npc:hablar', () => blip(880, 0.05));
ev.on('puerta:abrir', () => { blip(220, 0.08, 'triangle', 0.06); setTimeout(() => blip(330, 0.08, 'triangle', 0.05), 70); });
ev.on('mapa:entrar', () => blip(520, 0.1, 'sine', 0.05));
ev.on('inventario', ({ n }) => n > 0 && [660, 880, 1100].forEach((f, i) => setTimeout(() => blip(f, 0.07), i * 70)));
ev.on('ui:silencio', () => { silencio = !silencio; juego.aviso(silencio ? '🔇 Sonido apagado' : '🔊 Sonido encendido'); });

// ── Encuentros: punto de conexión del combate ───────────────────
const ENEMIGOS = {
  pasillo: ['😴 Alumno Cansado', '😤 Desmotivación', '📝 Prueba Sorpresa', '🤒 Resfriado', '📱 Celular en Clase'],
};
ev.on('encuentro', ({ pool }) => {
  const lista = ENEMIGOS[pool] || ['👾 Algo'];
  const e = lista[Math.floor(Math.random() * lista.length)];
  blip(150, 0.2, 'sawtooth', 0.05);
  juego.decir({
    inicio: 'a',
    nodos: {
      a: { texto: `⚔️ ¡Apareció ${e}!\n\n(El combate del v4 se conectará aquí,\nescuchando el evento "encuentro".)`,
        opciones: [{ texto: 'Motivar 💬', ir: 'b' }, { texto: 'Huir 🏃' }] },
      b: { texto: '¡Funcionó! Se fue más animado. ✨', accion: (j) => j.monedas(2) },
    },
  });
});

// ── HUD ─────────────────────────────────────────────────────────
const NOMBRES_ITEMS = { llave_bodega: '🔑', caramelo: '🍬', cafe: '☕', microscopio: '🔬' };
setInterval(() => {
  if (!juego.mapa) return;
  $('#hud-mapa').textContent = juego.mapa.nombre;
  const h = juego.reloj.hora;
  $('#hud-reloj').textContent = `${h >= 20 || h < 6 ? '🌙' : h >= 18 || h < 7 ? '🌅' : '☀️'} ${juego.reloj.texto}`;
  $('#hud-monedas').textContent = `🪙 ${juego.estado.monedas}`;
  $('#hud-items').textContent = Object.entries(juego.estado.inventario)
    .map(([k, n]) => (NOMBRES_ITEMS[k] || '📦') + (n > 1 ? '×' + n : '')).join(' ');
}, 250);

// ── Ayuda ───────────────────────────────────────────────────────
const ayuda = $('#ayuda');
const alternarAyuda = () => ayuda.classList.toggle('abierto');
ev.on('ui:ayuda', alternarAyuda);
$('#btn-ayuda').onclick = alternarAyuda;
$('#ayuda-cerrar').onclick = alternarAyuda;
$('#btn-guardar').onclick = () => juego.guardar();
$('#btn-diseno').onclick = () => { juego.render.depurar = !juego.render.depurar; };

// ── Controles táctiles ──────────────────────────────────────────
document.querySelectorAll('[data-accion]').forEach((b) => juego.entrada.vincularBoton(b, b.dataset.accion));
const tactil = $('#tactil');
const ponerTactil = (on) => { tactil.classList.toggle('visible', on); document.body.classList.toggle('con-tactil', on); };
ponerTactil(juego.tactil);
$('#btn-tactil').onclick = () => ponerTactil(!tactil.classList.contains('visible'));

// ── Pantalla de inicio ──────────────────────────────────────────
const guardada = leerPartida();
const inicio = $('#inicio');
if (guardada) {
  $('#btn-continuar').hidden = false;
  $('#btn-continuar').textContent = `Continuar (${mapas[guardada.mapa]?.nombre || guardada.mapa})`;
}
function empezar(cargar) {
  inicio.classList.add('oculto');
  juego.modo = 'explorar';
  if (cargar && guardada && mapas[guardada.mapa]) juego.cargarPartida(guardada);
  else {
    borrarPartida();
    juego.estado.monedas = 10;
    juego.cargarMapa('jardin', 10, 9, 'arriba');
    setTimeout(() => juego.decir([
      { quien: 'San Agustín RPG', retrato: '🏫', texto: '¡Bienvenido, Profe Felipe!\n\nEste es el motor nuevo del juego.' },
      { quien: 'Controles', retrato: '🎮', texto: 'Flechas o WASD para caminar (Shift corre).\nE o Espacio para hablar.\nToca el mapa para ir caminando.\nH para ver todos los comandos.' },
    ]), 400);
  }
  $('#lienzo').focus();
}
$('#btn-nueva').onclick = () => empezar(false);
$('#btn-continuar').onclick = () => empezar(true);

juego.render.redimensionar();
juego.cargarMapa('jardin', 10, 9, 'arriba'); // fondo detrás del menú
juego.modo = 'pausa';
juego.iniciar();
