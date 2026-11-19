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
- `nave`, `combustible` (lata naranja), `herramientas` (caja roja con cruz) → **esquemas básicos** hechos con formas simples.
- Para reemplazar un esquema: copia tu `.glb` a `assets/` y escribe su ruta en `MANIFIESTO`. Convención: origen centrado, ~2 u de diámetro, el frente de la nave mira a −Z.
- Para abrir sin servidor, `tools/embed_assets.py` guarda una copia base64 en `js/assets_embed.js`. Vuelve a ejecutarlo si cambias el GLB del meteoroide.

## Archivos

| Archivo | Qué hace |
|---|---|
| `js/config.js` | Todos los números ajustables (velocidad, daños, frecuencia, bonus…) |
| `js/planets.js` | g y atmósfera de los 8 planetas |
| `js/atmosfera.js` | Instrucciones de atmósfera |
| `js/sim.js` | Física, reglas, aparición de objetos |
| `js/assets.js` | Registro de assets y esquemas |
| `js/view.js` | Dibujo (three.js r147 local en `vendor/`), cámara, partículas |
| `js/juego.js` | Bucle, teclado/táctil, HUD, pantallas |

## Controles
Flechas / WASD mover · Espacio disparar · P pausa · M sonido · Táctil: arrastrar a la izquierda + botón FUEGO.

## 
