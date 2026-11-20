// ═══════════════════════════════════════════════════════════════
// ARRANQUE: une el motor nuevo con el contenido del v4 (window.V4,
// definido en v4/puente.js) y con la interfaz.
// ═══════════════════════════════════════════════════════════════
import { Juego } from './motor/juego.js';
import { tilesetColegio } from './datos/tileset-colegio.js';
import { comunidad } from './datos/comunidad.js';
import { zonasV4 } from './datos/zonas-v4.js';
import { npcV4 } from './datos/npc-v4.js';

const $ = (s) => document.querySelector(s);
const V4 = window.V4;

const juego = new Juego({
  canvas: $('#lienzo'),
  dialogo: $('#dialogo'),
  aviso: $('#aviso'),
  tilesets: { v4: V4.tileset, colegio: tilesetColegio },
  mapas: V4.mapas(zonasV4, V4.levantarNPCs(npcV4)),
  comunidad,
  externo: {
    frame: () => V4.frame(),
    bloquea: () => V4.bloqueaMotor(),
    teclas: (entrada) => V4.teclas(entrada),
    guardar: (silencioso) => (silencioso ? V4.guardarSilencioso() : V4.guardar()),
  },
});
V4.conectar(juego);
window.juego = juego; // para probar cosas desde la consola del navegador

// ── Atajos de interfaz ──────────────────────────────────────────
const ev = juego.eventos;
ev.on('ui:mochila', () => V4.abrir.mochila());
ev.on('ui:misiones', () => V4.abrir.misiones());
ev.on('ui:perfil', () => V4.abrir.stats());
ev.on('ui:volver', () => { if (!V4.cerrarPanel()) V4.volver(); });
ev.on('ui:silencio', () => $('#btn-music')?.click());

// ── HUD: la barra del v4 + datos y botones del motor ────────────
const barra = $('#ui-bar');
const grupoIzq = barra.firstElementChild;
grupoIzq.insertAdjacentHTML('beforeend', '<span id="hud-stats"></span><span id="hud-pista" style="display:none"></span>');
const grupoDer = barra.lastElementChild;
grupoDer.insertAdjacentHTML('beforeend', `
  <button class="btn-ui hud-extra" id="btn-diseno" title="Modo diseño (F3)">🧩</button>
  <button class="btn-ui hud-extra" id="btn-tactil" title="Mostrar/ocultar cruceta">🎮</button>
  <button class="btn-ui hud-extra" id="btn-ayuda" title="Comandos (H)">❔</button>`);
const ajustarAlto = () => {
  $('#pantalla').style.top = barra.getBoundingClientRect().height + 'px';
  juego.render.redimensionar();
};
addEventListener('resize', ajustarAlto);

// ── Ayuda ───────────────────────────────────────────────────────
const ayuda = $('#ayuda');
const alternarAyuda = () => ayuda.classList.toggle('abierto');
ev.on('ui:ayuda', alternarAyuda);
$('#btn-ayuda').onclick = alternarAyuda;
$('#ayuda-cerrar').onclick = alternarAyuda;
$('#btn-diseno').onclick = () => { juego.render.depurar = !juego.render.depurar; };

// ── Controles táctiles ──────────────────────────────────────────
document.querySelectorAll('[data-accion]').forEach((b) => juego.entrada.vincularBoton(b, b.dataset.accion));
// En pantallas táctiles se camina con el joystick flotante (arrastrar sobre el mapa)
// y siempre están los botones A/B. La cruceta es opcional (botón 🎮).
const tactil = $('#tactil');
const ponerCruceta = (on) => {
  tactil.classList.toggle('con-cruceta', on);
  tactil.classList.toggle('visible', on || juego.tactil);
  document.body.classList.toggle('con-tactil', on || juego.tactil);
  try { localStorage.setItem('rpg_cruceta', on ? '1' : '0'); } catch {}
};
window.__ponerTactil = ponerCruceta;
let prefCruceta = null;
try { prefCruceta = localStorage.getItem('rpg_cruceta'); } catch {}
ponerCruceta(prefCruceta === '1');
$('#btn-tactil').onclick = () => ponerCruceta(!tactil.classList.contains('con-cruceta'));

// Ocultar la cruceta mientras hay un panel del v4 abierto (batalla, tienda...)
setInterval(() => document.body.classList.toggle('panel-v4', V4.bloqueaMotor()), 150);

// ── Pantalla de inicio ──────────────────────────────────────────
const inicio = $('#inicio');
const inputNombre = $('#inicio-nombre');
inputNombre.value = V4.nombreGuardado();
const guardada = V4.partidaGuardada();
if (guardada) {
  const b = $('#btn-continuar');
  b.hidden = false;
  b.textContent = `Continuar · LV ${guardada.stats?.level ?? 1}`;
}
function empezar(continuar) {
  V4.registrar(inputNombre.value);
  inicio.classList.add('oculto');
  juego.modo = 'explorar';
  if (!(continuar && V4.continuar())) {
    V4.nuevaPartida();
    setTimeout(() => juego.decir([
      { quien: 'San Agustín RPG', retrato: '🏫', texto: `¡Bienvenido, ${inputNombre.value.trim() || 'Profe'}!\n\nEstás en el Jardín Edén del Colegio San Agustín.` },
      { quien: 'Controles', retrato: '🎮', texto: 'Flechas para caminar (Shift corre).\nA, Espacio o Enter para hablar.\nEsc para salir de una sala o cerrar un panel.\nH para ver todos los comandos.' },
    ]), 500);
  }
  setTimeout(ajustarAlto, 50);
  $('#lienzo').focus();
}
$('#btn-nueva').onclick = () => empezar(false);
$('#btn-continuar').onclick = () => empezar(true);
inputNombre.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') empezar(!!guardada); });

ajustarAlto();
juego.cargarMapa('jardin_eden', 11, 6, 'arriba'); // fondo detrás del menú
juego.modo = 'pausa';
juego.iniciar();
