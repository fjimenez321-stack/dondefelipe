# Ruta Estelar · Misión Voyager (3D)

Juego 3D hecho con three.js (copiado en `lib/`, sin depender de internet). Está programado sobre un **motor de reglas**: un objeto principal (el astronauta) y un entorno con 4 variables.

| Variable | Qué decide | Fórmula |
|---|---|---|
| **G** Gravedad | velocidad al caminar y correr, altura y largo del salto, daño al caer | marcha: v = √(Fr·g·L) · salto: h = v₀²/2g · impacto: v = √2gh |
| **T** Tiempo | tu reloj (tiempo propio) frente al de la misión; el cuerpo vive en tiempo propio | juego: dτ/dt = √(1 − g/60) · real: √(1 − 2GM/Rc²) |
| **E** Espacio | hasta dónde ves y llega el rayo de foco, y cuánto relieve puede tener el terreno | horizonte: √(2Rh) · relieve ∝ 1/g |
| **V** Vitalidad | 5 sistemas: cardiovascular, nervioso, respiratorio, digestivo y musculoesquelético | ver `js/vitalidad.js` |

## Archivos

- `js/reglas.js`: datos físicos de cada lugar y la función `entorno(id)`. **Para agregar un planeta**, súmalo a `CUERPOS` y crea su generador en `niveles.js`.
- `js/vitalidad.js`: los sistemas del cuerpo (pulso, oxígeno, energía, golpes, radiación).
- `js/voxel.js`: mundo de bloques de 1 m, choques y el **rayo DDA**, que avanza bloque a bloque y mide la distancia al primer objeto que toca.
- `js/jugador.js`: controles (teclado y mouse, o joystick táctil) y movimiento tipo Minecraft.
- `js/niveles.js`: la ciudad (Tierra), los cráteres (Luna) y las mesetas (Marte).
- `js/vuelo.js`: el viaje en la Voyager entre planetas.
- `js/modelos.js`: astronauta, Tierra, Luna, Marte, Voyager, rocas.
- `js/main.js`: escena, peligros, HUD, pantallas y tienda.
- `tex/tierra.jpg` y `tex/nubes.jpg`: la Tierra con los continentes reales (Natural Earth, dominio público) y nubes generadas.

## Probar en local

Los módulos de JavaScript no cargan con `file://`. Desde la carpeta del repositorio:

```
python3 -m http.server 8000
```

y abre `http://localhost:8000/juegos/ruta-estelar/`.

## Texturas de bloques (PNG de 16 × 16)

Cada bloque puede tener un PNG de 16 × 16 en `tex/bloques/`. El motor los junta en una **textura por capas de WebGL 2**: cada PNG es una capa, así que no hace falta dejar margen. De cerca se ven los píxeles nítidos y de lejos se suavizan (mipmaps) para que no parpadeen. El sombreado de esquinas del motor se aplica encima.

Para agregar una:

1. Guarda el PNG en `tex/bloques/`, por ejemplo `regolito.png`.
2. En `js/niveles.js`, agrega `{ tex: 'regolito' }` a la definición del bloque: `def(31, '#8f8f8b', 0.16, { tex: 'regolito' });`

Si falta el PNG, el bloque usa su color de la paleta.

**Imágenes hechas con IA.** Suelen venir grandes (1024 px o más) y con "píxeles" que no calzan con la grilla. `herramientas/a16.py` las deja en 16 × 16 nítido: muestrea el centro de cada celda, promedia a 16 × 16 y reduce a 8 colores.

```
python3 herramientas/a16.py imagen_grande.png tex/bloques/asfalto.png 32
```

El último número es cuántas celdas tiene la imagen por lado; si no lo pones, intenta detectarlo. El script informa la costura (diferencia entre bordes opuestos): si es parecida o menor que la variación interior, la textura repite sin que se note.

Un bloque puede tener una textura distinta arriba y a los lados:

```
def(4, '#5c9a3a', 0.18, { tex: { arriba: 'pasto', lado: 'pasto_lado' } });   // abajo usa la del lado si no se indica
```
