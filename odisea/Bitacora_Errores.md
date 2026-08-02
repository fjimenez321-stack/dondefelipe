# Bitácora de errores corregidos · Odisea del Conocimiento

Registro de defectos encontrados y reparados en el proyecto. Cada entrada indica **síntoma → causa → reparación** y el archivo tocado.

> Método de auditoría: (1) chequeo de sintaxis con `node --check` en los cinco módulos; (2) verificación cruzada de ids del DOM, y de métodos de `Graphics`/`Audio` y claves de `Config` usados vs. definidos; (3) prueba de humo que arranca el juego y ejecuta ~90 cuadros del bucle real en estado de juego para cazar errores en tiempo de ejecución.

---

## Auditoría actual

### BUG-01 · Mensaje de muerte "pegado" entre partidas · *Media*
- **Síntoma:** al perder en una partida podía aparecer la causa de muerte de una partida anterior (p. ej. "sobrecalentamiento" cuando en realidad te chocó un meteorito).
- **Causa:** `state.msgKilledBy` no se reiniciaba al empezar un nivel/saga, y `loseLife` usaba `state.msgKilledBy || causa`, conservando el valor viejo.
- **Reparación:** se reinicia `msgKilledBy = ''` en `resetRun()`, `startLevel()` y `startFinalBoss()`.
- **Archivo:** `js/engine.js`.

### BUG-02 · Sin invulnerabilidad tras recibir daño (i-frames) · *Alta (jugabilidad)*
- **Síntoma:** rozar al jefe (o quedar solapado con un enemigo/disparo) restaba varias vidas o todo el escudo en una fracción de segundo, provocando muertes "injustas".
- **Causa:** la comprobación de contacto con el jefe se evalúa en **cada cuadro**; sin una ventana de gracia, un mismo contacto contaba como muchos impactos.
- **Reparación:** ventana de **invulnerabilidad de 900 ms** (`C.ship.iframesMs`). `hitShip()` ignora el daño mientras `state.invuln > 0` y, tras un impacto, activa el temporizador. La nave **parpadea** mientras es invulnerable. El temporizador se decrementa con `dt` y se reinicia al empezar cada nivel.
- **Archivos:** `js/config.js` (nuevo parámetro), `js/engine.js` (lógica y parpadeo).

### BUG-03 · La bala perforante dañaba al jefe cada cuadro · *Media (balance)*
- **Síntoma:** con la mejora "Rayo perforante", mantener una bala solapada con un jefe le restaba vida en cada cuadro, derritiéndolo casi al instante.
- **Causa:** las balas perforantes no se eliminaban al impactar; pensadas para atravesar **enemigos**, también "atravesaban" al jefe repetidamente.
- **Reparación:** al impactar contra un jefe, la bala **se consume** siempre (la perforación solo aplica a enemigos comunes).
- **Archivo:** `js/engine.js`.

**Revisado y correcto (sin cambios necesarios):** doble filtrado de `bossShots` (ya existía uno solo), índices de los bucles de colisión con `splice` (recorridos de mayor a menor, correctos), reinicio de `final`/`temp`/`shield` entre niveles, referencias del DOM y de `Graphics`/`Audio` (todas resuelven), y flujo de pantallas `menu → nombre → intro → briefing → tienda → …`.

---

## Apéndice · Errores corregidos en iteraciones previas

Defectos detectados y reparados a lo largo del desarrollo (se dejan registrados para trazabilidad):

| # | Síntoma | Causa | Reparación | Dónde |
|---|---------|-------|------------|-------|
| P-01 | Carácter roto (�) en la respuesta incorrecta de las preguntas | Símbolo mal codificado en el texto de feedback | Reemplazo por `✘` | juego |
| P-02 | El juego se congelaba/erroreaba en el bucle | Uso de la variable `now` dentro de `update()`, donde no existe | Refrescar el HUD sin depender de `now` | engine |
| P-03 | Control táctil que se "pegaba" y no respondía igual en todos los navegadores | Manejo por zonas con `touchstart/touchend` por elemento | Reescritura con **Pointer Events** y rastreo global de dedos | engine + index |
| P-04 | Celda del podio con `#VALUE!` en el Excel | Puntaje de ejemplo escrito como texto, no como número | Valores numéricos en la fila de ejemplo | planilla |
| P-05 | La refrigeración comprada no tenía efecto | Una línea duplicada volvía a fijar `tempRate` al valor base tras aplicar la mejora | Eliminar la línea duplicada | engine |
| P-06 | Función de termómetro sin cerrar / rama de disparo sin cuerpo | Llaves faltantes al insertar código nuevo | Cierre de la función y restauración del cuerpo | graphics |

*(P-02, P-05 y P-06 fueron detectados y corregidos antes de cada entrega; se listan por completitud.)*

---

## Nota de alcance

Las pruebas se realizaron con validación de sintaxis y una **prueba de humo en un DOM/canvas simulado** (Node), que confirma que el juego arranca, cambia de pantalla y ejecuta el bucle sin excepciones, y que todas las referencias existen. **No reemplaza la prueba visual en un navegador real**: el comportamiento gráfico fino (parpadeo de i-frames, sprites, taller) conviene revisarlo jugando. Si aparece cualquier anomalía en clase, se añade aquí con su reparación.
