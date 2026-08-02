# Esquema básico · Odisea del Conocimiento

Un mismo **motor de sagas**: se cambian datos y vehículo, no el código del juego.

## 1. Módulos y carga

`index.html` carga cinco scripts **en orden**; todos comparten el espacio de nombres global `OC`.

```
index.html  (DOM + estilos)
   │  carga en orden:
   ├─ 1. js/config.js   →  OC.Config    · parámetros de jugabilidad
   ├─ 2. js/sagas.js    →  OC.Sagas     · campañas (datos: mundos + preguntas)
   ├─ 3. js/audio.js    →  OC.Audio     · sonido (Web Audio)
   ├─ 4. js/graphics.js →  OC.Graphics  · dibujo (escenas, vehículos, sprites)
   └─ 5. js/engine.js   →  OC.Engine    · lógica y orquestación → start()
```

El motor **usa** a los demás:

```
        ┌─────────────┐
        │  engine.js  │  estado · bucle · colisiones · input · podio
        └──────┬──────┘
   lee   ┌─────┼───────┬─────────┐  llama
         ▼     ▼       ▼         ▼
     Config  Sagas   Audio    Graphics
    (números)(datos)(sonido)  (dibujo)
```

## 2. Modelo de datos (una saga)

```
OC.Sagas = [ Saga, Saga, … ]

Saga
 ├─ id, titulo, subtitulo, icono, color
 ├─ vehiculo:  'nave' | 'taladro' | 'nanobot' | 'jeep'
 ├─ intro:     { narrador, sello, texto }        ← papiro inicial
 ├─ worlds: [ World, World, … ]                  ← misiones
 │    World
 │     ├─ nombre, num, color, scene              ← scene define el fondo
 │     ├─ cooling: true?                         ← activa la temperatura
 │     ├─ autor:{nombre,sello}, sub, contexto, dato
 │     ├─ meta, baseSpawn                         ← ritmo/dificultad
 │     └─ boss:{ nombre, hp, color,
 │               look:'birrete'|'calvo'|'guardian',
 │               shot:'bolt'|'nota' }
 └─ preguntas: [ {q, o:[…], c, e}, … ]           ← banco de la disciplina
```

## 3. Flujo de pantallas (máquina de estados)

```
  menu ──elige saga──▶ nombre ──▶ intro ──▶ briefing ──▶ playing
   ▲                                                      │  │  │
   │                                        (recoge ?)◀───┘  │  │
   │                                          question ──────┘  │
   │                                                            │
   │                              ┌── misión cumplida ──────────┤
   │                              ▼                             │
   │                          levelup ──▶ TALLER (compra mejoras) ──▶ briefing…  │
   │                              │                             │
   │        última misión ──▶ JEFE FINAL (Prof. Felipe) ──▶ victoria
   │                                                            │
   └──────────────── menú / reintentar ◀── gameover ◀───────────┘
                                            (perder vidas o
                                             sobrecalentarse)

*Tras el último nivel de CADA saga aparece el jefe final común, **El gran Profesor Felipe** (mucha vida, ataques en abanico). Derrotarlo → victoria.*
```

## 4. Dónde tocar para cada cambio

| Quiero… | Archivo | Qué hago |
|---|---|---|
| Agregar una saga (disciplina) | `js/sagas.js` | Añadir un objeto a `OC.Sagas` |
| Agregar un mundo/misión | `js/sagas.js` | Añadir un objeto a `saga.worlds` |
| Cambiar preguntas | `js/sagas.js` | Editar `saga.preguntas` |
| Balancear dificultad / calor / vidas | `js/config.js` | Cambiar números |
| Editar mejoras del taller o sus costos | `js/config.js` | Editar `OC.Config.shop` y `OC.Config.coins` |
| Nuevo vehículo | `js/graphics.js` | Un caso más en `ship()` + su `vXxx()` |
| Nuevo fondo temático | `js/graphics.js` | Un caso más en `scene()` |
| Enriquecer sonido | `js/audio.js` | Nuevos efectos en `OC.Audio` |
| Conectar el podio del curso | `js/config.js` | Pegar la URL en `sheetEndpoint` |

## 5. Bucle de juego (60 fps)

```
requestAnimationFrame → loop(now)
   dt = tiempo entre cuadros
   update(dt)   ← mueve nave/enemigos, colisiones, temperatura, jefe
   render()     ← engine ordena a Graphics: fondo → objetos → nave → HUD
   repetir
```

*Regla:* engine decide **qué y cuándo**; graphics.js solo sabe **cómo dibujar**; sagas.js solo **son datos**; config.js solo **son números**.
