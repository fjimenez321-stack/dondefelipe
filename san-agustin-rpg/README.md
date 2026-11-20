# San Agustín RPG — Motor v5 (modular)

Reescritura del núcleo de `profe-rpg-v4.html` (9.000 líneas en un solo archivo) en módulos separados.
El v4 **sigue intacto**: este motor vive aparte y se irá llenando con los sistemas del v4 (combate, misiones, laboratorios…).

**Jugar** (una vez fusionado a `main`): `https://dondefelipe.vercel.app/san-agustin-rpg/` o `https://fjimenez321-stack.github.io/dondefelipe/san-agustin-rpg/`.
**En el computador:** desde la raíz del repo, `python3 -m http.server` y abrir `http://localhost:8000/san-agustin-rpg/`.
(Usa módulos ES: **no funciona con doble clic** en el archivo, necesita un servidor).

---

## Estructura

```
san-agustin-rpg/
├── index.html            interfaz: canvas, HUD, diálogo, cruceta, ayuda, inicio
├── css/juego.css
└── js/
    ├── main.js           une motor + datos + interfaz. Aquí se conectan los sistemas de juego
    ├── motor/            ← NO sabe nada del colegio. Reutilizable para cualquier mapa/juego
    │   ├── juego.js      núcleo: bucle, colisiones, control del jugador, interacción, portales, estado
    │   ├── mapa.js       lee un mapa de datos: grilla, portales, puertas, objetos, zonas
    │   ├── entidades.js  Entidad / Jugador / NPC: movimiento suave casilla a casilla
    │   ├── ia.js         comportamientos de NPC: quieto, deambular, patrulla, seguir, ir, horario
    │   ├── ruta.js       búsqueda de caminos (BFS) para tocar-para-caminar y la IA
    │   ├── zonas.js      zonas activas: mensajes, encuentros, aparición de personajes
    │   ├── dialogo.js    caja de diálogo con máquina de escribir, opciones y árboles
    │   ├── entrada.js    teclado + táctil + mouse + gamepad → acciones
    │   ├── render.js     cámara y dibujo (solo lo visible), modo diseño
    │   ├── sprites.js    Profe Felipe (portado del v4), personas y gatos procedurales
    │   ├── reloj.js      hora del juego, día/noche
    │   ├── guardado.js   guardar/cargar (localStorage; cambiable por Firestore)
    │   └── eventos.js    bus de eventos
    └── datos/            ← TODO el contenido. Se edita sin tocar el motor
        ├── tileset-colegio.js   qué es cada carácter de la grilla y cómo se dibuja
        ├── mapas.js             jardín, pasillo, 2° piso, sala 6°, bodega
        ├── personajes.js        NPC fijos (Inspector, Kella, Valeria, José, Mochi…)
        └── comunidad.js         personajes que aparecen solos en las zonas
```

**Regla de oro:** el motor no conoce el contenido; el contenido no toca el motor.
Los sistemas nuevos escuchan **eventos** en `main.js`.

---

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
| Flechas / WASD | caminar (mantener = seguir caminando; toque corto = girar) |
| Shift | correr |
| E / Espacio / Enter | hablar, abrir, leer, avanzar el diálogo |
| 1–9 | elegir opción |
| Esc / Q | cancelar o cerrar |
| Clic / tocar el mapa | caminar hasta ahí; si tocas a alguien, vas y le hablas (también a través de un mostrador) |
| G | guardar · M silenciar · H ayuda · F3 modo diseño |
| Celular | cruceta (mantener), **A** acción, **B** correr/cancelar |
| Gamepad | cruceta o stick, A, B, Start |

## Eventos disponibles

`mapa:entrar` · `mapa:salir` · `jugador:paso` · `zona:entrar` · `zona:salir` · `encuentro` ·
`npc:hablar` · `npc:fin` · `npc:aparece` · `puerta:abrir` · `puerta:cerrar` · `objeto:usar` ·
`flag` · `inventario` · `monedas` · `ui:ayuda` · `ui:silencio` · `*` (todos, para depurar)

```js
juego.eventos.on('encuentro', ({ pool }) => combate.iniciar(pool));
```

## Para agregar…

- **Un mapa:** copiar uno en `datos/mapas.js`, dibujar la grilla, agregarlo a `export const mapas` y poner un portal que lleve a él.
- **Un lugar con otro estilo** (plaza, reserva): crear `datos/tileset-plaza.js` como el del colegio y registrarlo en `main.js` (`tilesets: { colegio, plaza }`).
- **Un personaje de la comunidad:** una entrada en `datos/comunidad.js`. Sale solo en las zonas con `aparicion`.
- **Un NPC fijo:** definirlo en `personajes.js` y ubicarlo en el `npcs` del mapa.

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

## Pendiente (portar desde el v4)

- [ ] Combate por turnos → escuchar `encuentro`
- [ ] Cuaderno de misiones → `flag` + `npc:fin`
- [ ] Tiendas e inventario completo (hoy: monedas + objetos simples)
- [ ] Laboratorios, carpintería, metalurgia, minas
- [ ] Música medieval procedural
- [ ] Resto de los mapas (plaza, estaciones, reserva, BuinZoo…) con sus tilesets
- [ ] Guardado en Firestore + login del sitio
