# Odisea 2 — vuelo 3D con cámara trasera (estilo Star Fox 64)

Abre `index.html` (funciona con doble clic y también desde un servidor). Pruebas: `node tests/sim.test.js`.
Probar otro planeta: `index.html?planeta=venus` (o desde el menú). Solo **Mercurio** es el mundo jugable; los demás sirven para sentir la física.

## Reglas (todas en `js/sim.js`, sin three.js)

1. **Colisiones.** Todo objeto que choca con otro se destruye (o pierde vida, si tiene más de 1), salvo los **bonus** (`combustible`, `herramientas`): no destruyen nada y solo la nave los recoge.
   - La tabla `REGLAS` define cada par (`laser|meteoro`, `meteoro|nave`, …). Un tipo nuevo con `colision:'destruye'` ya sigue la regla general sin tocar nada; con `colision:'bonus'` se comporta como bonus.
   - Se usa colisión *barrida* (recorrido del cuadro), así un rayo veloz no atraviesa un meteoroide.
2. **Gravedad.** Cada planeta tiene su g real (`js/planets.js`). Tira de los meteoroides y de la nave; el motor compensa el 60 % (`asistenciaGrav`). Soltar los mandos: en Mercurio caes lento, en Júpiter te estrellas.
3. **Atmósfera** (`js/atmosfera.js`). Solo **frena**; no se dibuja. `ρ(h) = ρ0·e^(−h/H)` y frenado `k·(ρ/ρTierra)·|v|·v`. Depende del tipo de atmósfera de cada planeta y de la altitud (arriba hay menos aire).
   - **Mercurio:** exosfera, ρ0 ≈ 10⁻¹⁴ kg/m³ → razón ≈ 10⁻¹⁴ → frenado nulo y vuelo ligero. No hay niebla ni cielo: se ve el espacio.

## Assets 3D (`js/assets.js`)

- `meteoroide` → **asset real** `assets/meteoroide_rocoso.glb` (el del paquete; se le calculan normales al cargarlo porque el GLB trae solo posición y color).
- `combustible` → **asset real** `assets/barril_combustible.glb` (barril azul con franja amarilla; se endereza de Z a Y, se centra y se escala ×2,6 desde el manifiesto).
- `nave`, `propulsor` y `tanque` → **assets reales** en `assets/nave/` (casco con empties de anclaje `slot_*` y `punto_*`, y cada módulo con su `anclaje_montaje`). El juego monta cada módulo haciendo coincidir su anclaje con el slot del casco; propulsores simétricos con 1 (centro), 2 (interior), 3 (exterior+centro) o 4. `tanque_grande.glb` está en la carpeta pero aún no se usa. `anclajes.json` documenta todas las coordenadas.
- `herramientas` (caja roja con cruz) → **esquema básico** hecho con formas simples.
- Para reemplazar un esquema: copia tu `.glb` a `assets/` y escribe su ruta en `MANIFIESTO`. Convención: origen centrado, ~2 u de diámetro, el frente de la nave mira a −Z.
- Para abrir sin servidor, `tools/embed_assets.py` guarda una copia base64 en `js/assets_embed.js`. Vuelve a ejecutarlo si cambias el GLB del meteoroide.

## Archivos

| Archivo | Qué hace |
|---|---|
| `js/config.js` | Todos los números ajustables (velocidad, daños, frecuencia, bonus…) |
| `js/planets.js` | g y atmósfera de los 8 planetas |
| `js/atmosfera.js` | Instrucciones de atmósfera |
| `js/nave.js` | Módulos de la nave y sus estadísticas |
| `js/sim.js` | Física, reglas, aparición de objetos |
| `js/assets.js` | Registro de assets y esquemas |
| `js/view.js` | Dibujo (three.js r147 local en `vendor/`), cámara, partículas |
| `js/juego.js` | Bucle, teclado/táctil, HUD, pantallas |

## Controles
Flechas / WASD mover · Espacio disparar · P pausa · M sonido · Táctil: arrastrar a la izquierda + botón FUEGO.

## Nave modular (`js/nave.js`, datos en `C.modulos` de `config.js`)
En el **Hangar** (botón en el menú de inicio) se equipan módulos; se guardan en el navegador. Cada módulo multiplica estadísticas y, con N unidades, el factor se aplica N veces (compuesto).
- **Propulsor** (hasta 4): potencia del motor ×1,2 (velocidad de crucero y empuje de los mandos) · consumo de combustible ×1,1.
- **Tanque auxiliar** (hasta 4): capacidad de combustible ×1,25 · velocidad ×0,93 (valores propuestos: ajústalos en `config.js`).
- Los meteoroides aparecen por **distancia**, no por tiempo, así que ir más rápido no facilita el tramo.
- Agregar un módulo: una entrada en `C.modulos` (+ su forma en `assets.js` y su ranura en `RANURAS`). Las estadísticas disponibles son `potencia`, `velocidad`, `consumo` y `capacidad`; una nueva (p. ej. escudo) se declara en `ESTAT` y se lee en `sim.js`.

## Economía y menú previo a la misión (`C.economia` en `config.js`)
Antes de **cada** misión aparece «Preparar misión»: ahí se instalan módulos, y **cada instalación cuesta $10.000**. El dinero (billetera, guardada en el navegador) se gana recogiendo **monedas** ($200 c/u, en grupos de 4 cada ~560 u de tramo) y derrotando a Alex (+$3.000). Si destruyen la nave te quedas con el 50 % de lo recogido. Quitar un módulo que instalaste en ese menú devuelve el dinero; quitar uno de antes no.
- **Equilibrio:** lo máximo posible por misión (monedas + Alex) ≈ 1,5 × el costo de instalar un módulo; un jugador bueno instala ~1 módulo por misión y equipar los 8 toma varias. Una prueba (`tests/sim.test.js`) falla si cambias un número y se rompe ese rango (`topeMaxMision`).
- Para probar: `?dinero=50000` fija la billetera.

## Jefe: Profesor Alex (`js/sim.js`, config en `C.jefe`)
Al terminar el tramo aparece Alex. **Respira** → vulnerable (aura verde). **Toma aire** → aviso. **Habla** → invulnerable (los rayos rebotan) y lanza rayos de notas; con la mitad de vida lanza tres a la vez y con poca vida acelera. Las frases están en `C.jefe.frases` (las 3 primeras salen en orden, el resto al azar). Sus sprites van incrustados en `js/assets_embed.js` (`tools/embed_assets.py`).

## Ranking
Al terminar, envía el puntaje con `DF.ofrecer({juego:'odisea2'})` (solo en Mercurio). Requiere que `reglaJuego` de `firebase/firestore.rules` incluya `odisea2`.

## Pendiente
Rayo especial y minas del juego 2D, naves enemigas, preguntas, resto de planetas jugables, assets definitivos (nave, herramientas, módulos).
