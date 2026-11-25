# San Agustín RPG — Motor v5 + contenido del v4

El juego completo del v4 (28 mapas, NPC, combate, tiendas, misiones, laboratorio, carpintería,
metalurgia, minas, COVID, BuinZoo, música, guardado, ranking…) corriendo sobre el **motor nuevo**:
pantalla completa, movimiento suave, tocar-para-caminar, cruceta, gamepad, NPC de la comunidad con IA
y modo diseño. `profe-rpg-v4.html` sigue intacto como respaldo.

**Jugar** (una vez fusionado a `main`): `https://dondefelipe.vercel.app/san-agustin-rpg/` o `https://fjimenez321-stack.github.io/dondefelipe/san-agustin-rpg/`.
**En el computador:** desde la raíz del repo, `python3 -m http.server` y abrir `http://localhost:8000/san-agustin-rpg/`.
(Usa módulos ES: **no funciona con doble clic** en el archivo, necesita un servidor).

---

## Estructura

```
san-agustin-rpg/
├── index.html            canvas a pantalla completa, diálogo, cruceta, ayuda, inicio + carga de v4/ y del motor
├── css/juego.css         estilos del motor + ajustes para que los paneles del v4 funcionen a pantalla completa
├── herramientas/
│   └── extraer_v4.py     genera v4/01..18 desde profe-rpg-v4.html (repetible)
├── v4/                   ← CONTENIDO del v4, separado por sistema (scripts clásicos)
│   ├── 00-paneles.js        paneles HTML: batalla, tienda, mochila, misiones, lab, forja, farmacia…
│   ├── 01-estado.js         stats, progreso, inventario
│   ├── 02-mapas.js          los 28 mapas y transitionTo()
│   ├── 03-datos.js          frases, enemigos, equipo, kiosco
│   ├── 04-dibujo-mapas.js   cómo se ve cada mapa
│   ├── 05-interfaz.js       HUD, teclado de Jeanette, pantalla del 7
│   ├── 06-batalla.js        combate por turnos
│   ├── 07-tiendas-zoo.js    tiendas, quiz de biología, BuinZoo, artesanos
│   ├── 08-npc.js            NPC_ACT: lo que dice y hace cada personaje
│   ├── 09-salidas.js        salidas entre mapas, monedas azules
│   ├── 10-inventario.js     mochila
│   ├── 11-extras.js         nivel, reloj, memorice, cuaderno de misiones, stats
│   ├── 12-oficios.js        laboratorio, carpintería, metalurgia, minas
│   ├── 13-musica.js         música medieval procedural
│   ├── 14-covid.js          modelo SIR, farmacia, letreros
│   ├── 15-anticonceptivos.js actividad de los 10 métodos
│   ├── 16-sprites.js        héroe y terreno
│   ├── 17-sistema.js        admin, ajustes, ranking, metro, guardado
│   ├── 18-dibujar-mapa.js   drawMap() partido en capa de fondo y de frente
│   ├── estilos.css          estilos de los paneles
│   └── puente.js            ★ escrito a mano: une el v4 con el motor (ver abajo)
└── js/
    ├── main.js           arranque: motor + V4 + interfaz
    ├── motor/            ← NO sabe nada del colegio. Reutilizable
    │   ├── juego.js      núcleo: bucle, colisiones, control del jugador, interacción, portales
    │   ├── mapa.js · entidades.js · ia.js · ruta.js · zonas.js · dialogo.js
    │   ├── entrada.js · render.js · sprites.js · reloj.js · guardado.js · eventos.js
    ├── historia/         «El Plan Asfalto»: datos-historia.js (textos), historia.js (fases), debate.js
    └── datos/
        ├── npc-v4.js           NPC del v4 que ahora caminan (Inspector, José, profes, guardabosques…)
        ├── comunidad.js        personajes que aparecen y caminan solos
        ├── zonas-v4.js         dónde aparecen en los mapas del v4
        └── tileset-colegio.js  tileset propio, base para mapas nuevos con el formato del motor
```

### Cómo se reparte el trabajo

| Lo hace el **motor** | Lo hace el **v4** (sin cambios) |
|---|---|
| Bucle, cámara suave, pantalla completa | Cómo se ve cada mapa y sus capas |
| Movimiento casilla a casilla, correr, girar | Qué es sólido (`WALKABLE` + reglas por mapa) |
| Teclado, táctil, tocar-para-caminar, gamepad | Salidas entre mapas (`checkMapExit`) |
| Caja de diálogo (también para `showDialog` del v4) | Diálogos y misiones de cada NPC (`NPC_ACT`) |
| Fundido entre mapas | Combate, tiendas, mochila, oficios, COVID, música |
| Reloj único (día/noche) | Guardado (`saveGame` / `loadGame`), ranking |
| Personajes de la comunidad con IA | Monedas azules, caramelos, encuentros |
| Movimiento e IA de los NPC levantados (`npc-v4.js`) | Lo que dicen y hacen esos NPC (`NPC_ACT`) |

`v4/puente.js` es lo único que conecta ambos: redirige `transitionTo`, `showDialog` y `getGameTime`
al motor, y le entrega al motor las colisiones, la interacción, lo que pasa al dar un paso y el dibujo
del mapa en dos capas (los personajes van entre ellas, así la noche también los oscurece).

### Si se cambia algo del v4

Lo más cómodo es seguir editando `profe-rpg-v4.html` y regenerar:
```
python3 san-agustin-rpg/herramientas/extraer_v4.py
```
También se puede editar directo en `v4/`, pero entonces **no** hay que volver a correr el script
(lo sobrescribiría). Cuando un sistema se migre al motor nuevo, se saca de `v4/` y del script.

## Colisiones (4 capas)

`juego.obstaculo(x, y, quien)` responde qué impide pisar una casilla (o `null` si está libre):

| Capa | Fuente | Sólido cuando… |
|---|---|---|
| 1. Tile | `tileset.tiles[...].solido` | muro, mesa, árbol, mostrador… |
| 2. Puerta | `mapa.puertas` | mientras no esté abierta del todo |
| 3. Objeto | `mapa.objetos` | letreros, cofres (`solido:false` para pisables) |
| 4. Entidad | NPC y jugador | ocupan su casilla **y** la de origen mientras caminan |

Los NPC además **no pisan** portales ni umbrales de puertas (así no tapan las salidas).
`F3` (o `º`) muestra todo esto en pantalla: rojo = sólido, azul = entidad, celeste = portal, líneas punteadas = zonas.

## Tiles dinámicos

**Puertas** (`puertas: [...]` en el mapa):
```js
{ x: 30, y: 13, etiqueta: 'BODEGA', llave: 'llave_bodega', bloqueada: '🔒 Está cerrada.' }
{ x: 16, y: 0, requiere: (j) => j.reloj.hora >= 13, bloqueada: 'Se abre después de las 13:00.' }
{ x: 10, y: 0, autoCerrar: 3, color: '#166534' }   // se cierra sola a los 3 s
```
Al caminar contra una puerta normal se abre sola. Una puerta con `llave` queda desbloqueada para siempre la primera vez; la llave se conserva (con `gastaLlave: true` se consume).

**Portales** (salidas a otro mapa; pueden medir más de una casilla):
```js
{ x: 18, y: 0, w: 2, a: 'jardin', ax: 10, ay: 10, dir: 'arriba', etiqueta: 'JARDÍN' }
```
Una puerta y un portal pueden estar en la misma casilla: se abre la puerta y al pisar el umbral se cambia de mapa.

## Zonas activas

```js
zonas: [
  { id: 'kiosco', x: 31, y: 1, w: 3, h: 4, mensaje: '🥟 Huele a sopaipillas...' },
  { id: 'jardineras', x: 12, y: 7, w: 9, h: 2,
    encuentros: { prob: 0.15, pool: 'pasillo', minPasos: 2 } },          // emite 'encuentro'
  { id: 'recreo', x: 2, y: 9, w: 30, h: 4,
    aparicion: { roles: ['alumno', 'funcionario'], max: 3, cadaSeg: 7,
                 prob: 0.6, horas: [8, 18], vida: [30, 70] } },           // personajes de la comunidad
]
```
También aceptan `alEntrar(juego, zona)`, `alSalir(...)` y `alPisar(...)`.
Los personajes aparecidos se desvanecen solos al cumplir su `vida` (nunca en mitad de una conversación).

## NPC: diálogos e inteligencia

```js
inspector: {
  nombre: 'Inspector', emoji: '👮',
  apariencia: { piel: '#c99668', pelo: '#2b2b2b', peinado: 'corto', ropa: '#0f172a', lentes: true },
  ia: { tipo: 'patrulla', ruta: [[4,4],[30,4],[30,11],[4,11]] },
  saludo: { radio: 2, cada: 14, frases: ['¡Sin correr por el pasillo!'] },  // burbuja al pasar
  mirar: 3,                                                                 // te mira si estás cerca
  frases: ['...', '...'],                                                   // rotan al hablar
  dialogo: (j) => j.flag('llave_bodega') ? null : { inicio: 'a', nodos: { ... } },
}
```

| IA | Parámetros |
|---|---|
| `quieto` | — |
| `deambular` | `radio`, `pausa:[min,max]` |
| `patrulla` | `ruta:[[x,y],…]`, `pausa`, `idaYVuelta` |
| `seguir` | `distancia` (lo usa `juego.unirse(npc)`) |
| `ir` | `x`, `y`, `alLlegar(npc, juego)` |
| `horario` | `tramos:[{desde, hasta, ia}]`, `porDefecto` |

Si alguien le bloquea el paso, la patrulla espera y recalcula la ruta. Durante una conversación el NPC se detiene y te mira.
Para un comportamiento nuevo: `registrarIA('huir', ClaseHuir)` desde `ia.js`.

Formatos de diálogo: texto, lista de líneas, o árbol `{inicio, nodos}` con `opciones`, `accion`, `si` (condición) e `ir`.

## Comandos

| Tecla | Acción |
|---|---|
| Flechas | caminar (cada toque = un paso; mantener = seguir caminando) |
| Shift | correr |
| A / E / Espacio / Enter | hablar, abrir, leer, avanzar el diálogo (A, como en el v4) |
| 1–9 | elegir opción |
| Esc / Q | cerrar diálogo o panel; si no hay nada abierto, salir de la sala (como «← Salir» del v4) |
| I · N · P | mochila · cuaderno de misiones · estadísticas |
| 1–9 en batalla | elegir acción |
| Clic / tocar el mapa | caminar hasta ahí; si tocas a alguien, vas y le hablas (también a través de un mostrador) |
| G | guardar · M silenciar · H ayuda · F3 modo diseño |
| Celular / mouse | **joystick flotante** (como en Mapu): arrastrar sobre el mapa y aparece un círculo que guía al Profe · tocar sin arrastrar = ir hasta ahí · **A** acción · **B** correr/cancelar · 🎮 cruceta opcional |
| Gamepad | cruceta o stick, A, B, Start |

## Eventos disponibles

`mapa:entrar` · `mapa:salir` · `jugador:paso` · `zona:entrar` · `zona:salir` · `encuentro` ·
`npc:hablar` · `npc:fin` · `npc:aparece` · `puerta:abrir` · `puerta:cerrar` · `objeto:usar` ·
`flag` · `inventario` · `monedas` · `ui:ayuda` · `ui:silencio` · `*` (todos, para depurar)

```js
juego.eventos.on('encuentro', ({ pool }) => combate.iniciar(pool));
```

## Historia: «El Plan Asfalto»

Noviembre, 38 °C. Termocorp (Dr. Cálido Vapor) quiere talar el Jardín Edén y pavimentar la cancha
para vender aires acondicionados. La Directora firmará el viernes… salvo que la comunidad presente un
plan mejor. Un **niño o una niña** (se elige al empezar) decide salvar el colegio con la guía del
**Profe Felipe** (sala de 6°).

| Fase | Qué pasa |
|---|---|
| Intro | Anuncio de la Directora en el Jardín Edén → ir donde el Profe Felipe |
| Mentor | El Profe explica efecto invernadero, isla de calor y por qué el aire acondicionado no es solución; enseña los debates |
| Aliados | Convencer en **debates** a 8 personas (José, Inspector, Tío Antonio, Jorge, Profe Gonzalo, Yael, Francisco, Tía Claudita). Cada una se compromete con una acción (reciclaje, apaga-luces, huerta, goteras, día sin auto, vivero, paneles solares, proyecto curricular) |
| Brea | Con 3 aliados aparece la Ingeniera Brea marcando árboles en el jardín. Al convencerla entrega el plano del proyecto |
| Asamblea | Con 6 aliados + Brea vencida aparece el Dr. Vapor: debate de 3 fases, con un argumento especial por cada aliado |
| Fin | La Directora rechaza a Termocorp y el colegio adopta el Plan Verde. Todo lo demás del juego sigue disponible |

**Debates** (`js/historia/debate.js`): argumentos en vez de golpes. La barra del rival es su *resistencia
al cambio*; la tuya, tu *ánimo*. Hay 4 tipos de argumento — 🔬 datos científicos, 💚 cercanía,
💰 ahorro, 🛠️ acción concreta — y a cada personaje le llega uno distinto (×2) y otro casi no le hace
efecto (×½). **👂 Escuchar** recupera ánimo y revela qué le preocupa al rival (su tipo débil pega ×2,5).
Repetir el mismo argumento seguido rinde menos. Si te quedas sin ánimo, no pasa nada: vuelves a intentarlo.

**Evidencias** (brillan en el mapa) dan argumentos más fuertes: 🌡️ termómetro (Jardín Edén),
📰 recorte del IPCC (Biblioteca), 🧾 boleta de la luz (Secretaría) y 🗺️ plano (al convencer a Brea).

El HUD muestra `🌡️ temperatura del patio · 🌱 compromisos · 🎯 objetivo` (clic para detalles) y la misión
aparece en el cuaderno 📓. El avance se guarda en `progress.historia`, junto con la partida del v4.

Todos los textos, rivales, excusas y números están en **`js/historia/datos-historia.js`**; la lógica en
`historia.js`. Una partida antigua del v4 sin historia, al continuar, empieza la historia con el
personaje elegido.

## NPC del v4 que caminan

En el v4 cada personaje era una letra fija en la grilla. `js/datos/npc-v4.js` los "levanta": al cargar,
la casilla pasa a ser piso y aparece una entidad del motor con sprite propio, IA y saludos en burbuja.
Lo que dicen y hacen **no cambia**: al hablarles se llama a `NPC_ACT[letra]` del v4, y el NPC se queda
quieto mirándote hasta que se cierra todo lo que abrió (diálogo, tienda, misión…).

Hoy caminan 18: en el pasillo el Inspector (patrulla), José, Tía Claudita, Valeria, Tío Antonio y Jorge;
los profes de 5° a 8°; Gonzalo (trota por la cancha) y Juan; Constanza y Paula; Francisco; Yael; y los
guardabosques Martínez y Rojas. Por defecto pisan solo `.`; con `pisa: 'v'` (cancha) o `pisa: '.g'`
(reserva) se les permite otro suelo. Nunca pisan salidas ni otros NPC del v4.

```js
{ mapa: 'pasillo', x: 8, y: 1, letra: 'I', nombre: 'Inspector', emoji: '👮',
  apariencia: { piel: '#c99668', pelo: '#2b2b2b', peinado: 'corto', ropa: '#0f172a', lentes: true },
  ia: { tipo: 'patrulla', ruta: [[8, 2], [30, 2], [30, 12], [8, 12]] },
  saludo: { radio: 2, cada: 14, frases: ['¡Sin correr por el pasillo!'] } }
```
Si la letra ya no está en esa posición (porque cambió el mapa del v4), se avisa en la consola y el NPC
queda como en el v4. Para devolver un NPC a su casilla fija, basta con borrar su entrada.

## Para agregar…

- **Un personaje de la comunidad:** una entrada en `js/datos/comunidad.js`. Aparece solo en las zonas de `zonas-v4.js` (o de cualquier mapa con `aparicion`).
- **Vida en otro mapa del v4:** agregar una zona en `js/datos/zonas-v4.js`. Caminan solo por el piso `.` y nunca tapan salidas ni NPC del v4.
- **Un mapa nuevo con el formato del motor** (puertas, portales, zonas, NPC con IA): ver las secciones de arriba y usar `tileset-colegio.js`.
- **Un mapa o NPC con el formato del v4:** en `profe-rpg-v4.html` y regenerar.

## Conectar un cerebro conversacional (LLM) — preparado, no activado

`dialogo` puede ser una función **async**, así que un NPC puede responder con un LLM sin cambiar el motor.
La clave de la API **nunca** debe ir en el navegador: se llama a una Cloud Function de Firebase que la guarda,
modera la respuesta y limita el gasto. Esquema:

```js
// personajes.js
valeria: {
  personalidad: 'Psicóloga del colegio. Cálida, breve, nunca da diagnósticos.',
  dialogo: async (j, npc) => {
    const r = await fetch('/api/npc', { method: 'POST',
      body: JSON.stringify({ npc: npc.def.id, personalidad: npc.def.personalidad, contexto: j.estado.flags }) });
    const { texto } = await r.json();
    return texto;               // o un árbol con opciones generadas
  },
}
```
Antes de activarlo con estudiantes hay que decidir: moderación, tope de gasto, qué datos se envían (ninguno personal) y una respuesta de respaldo si falla la red.

## Pendiente

- [x] Inspector, José, profes y otros 15 NPC del v4 caminan con IA (`npc-v4.js`)
- [ ] Levantar el resto (Dahian y sus gatos, Carol, Jeanette, Profe Alex, carabineros del centro, BuinZoo…)
- [ ] Pasar las salidas del v4 (`checkMapExit`) a `portales` en datos
- [ ] Guardado en Firestore + login del sitio (hoy: localStorage/IndexedDB del v4)
- [ ] Ranking en línea: falta configurar `FB_CONFIG` en `v4/17-sistema.js`
- [ ] Cerebro conversacional (LLM) para algunos NPC, vía Cloud Function
