# Duelo de Genios

Juego de pelea 1 contra 1 para celular (antes "Pelea Andina"). Los luchadores son científicos y sus poderes vienen de sus descubrimientos.

| Científico | Estilo | Poderes |
| --- | --- | --- |
| Newton | Control del espacio | Manzana que cae sobre el rival, Gravitación (atrae), Prisma, Acción y reacción, súper Principia |
| Tesla | Veloz y eléctrico | Bobina (rayo), Corriente alterna, Arco voltaico, Jaula de Faraday, súper Rayo de la muerte |
| Darwin | Resistente | Pinzones, Galápago, Árbol de la vida, Adaptación, súper Selección natural |
| Lamarck | Alcance largo | Uso y desuso (brazo estirado), Cuello de jirafa, Escala natural, súper Evolución jirafa |
| Curie | Daño en el tiempo | Radio y Polonio (radiación que sigue quitando vida), Desintegración, Rayos gamma, súper Doble Nobel |

En la pausa aparece un dato de cada científico y la ciencia detrás de cada poder.

## Archivos

- `index.html`: el juego armado (lo que se abre en el navegador). **No se edita a mano.**
- `src/`: los módulos. `characters.js` (personajes en datos + validador), `sim.js` (motor determinista), `render.js` (dibujo), `input.js` (controles y CPU), `app.js` (pantallas), `shell.html` (HTML y CSS).
- `build.py`: une `src/` en `index.html`. Correr después de cada cambio: `python3 build.py`.
- `pruebas/`: `node pruebas/test_validate.js` (balance), `node pruebas/test_combos.js` (que cada combo con nombre se pueda hacer), `node pruebas/test_mecanicas.js` (manzana, gravedad, radiación, electricidad, determinismo y rollback).

## Campos nuevos para personajes (JSON)

- `proyectil.cielo: true` cae sobre la posición del rival; `altura` (200–520), `grav`, `vy`, `forma` (`manzana`, `rayo`, `pinzon`, `radio`).
- `atrae` (0–1800): el golpe arrastra al rival hacia el atacante.
- `efecto: "electro"`: más aturdimiento.
- `radiacion` (0–240 cuadros): 3 de daño cada 12 cuadros; nunca deja KO.
- `estira` / `estiraCuello` (%): solo visual.
- `fx`: `chispas`, `gravedad`, `radiacion`, `prisma`, `hojas` (solo visual).
- `ciencia` (en cada golpe) y `meta.dato`: textos educativos.
- Piezas humanas: `peluca`, `pelo`, `calva`, `mono`, `barba`, `bigote`, `levita`, `falda`, `corbatin`, `lentes`. Paleta opcional: `manos`, `mangas`.
