# Glosario técnico · Odisea Cósmica

Conceptos usados en el diseño del juego, agrupados por área. Pensado para ir aprendiendo: cada término trae una definición en lenguaje llano y **dónde aparece** en el proyecto.

> Nota de contexto: el juego está pensado para **GitHub Pages** (servido por HTTP). Algunas decisiones del código fueron muletas para funcionar también como archivo local (`file://`); las marco con 🏠 y explico la alternativa "de servidor" que ahora podríamos usar.

---

## 1. Arquitectura del software

**Motor de juego (game engine).** El corazón que hace correr todo: mantiene el estado, actualiza la física y coordina gráficos, sonido y datos. En el proyecto es `engine.js`.

**Módulo / modularización.** Dividir un programa grande en archivos con una responsabilidad clara, para que sea mantenible y escalable. Pasamos de un `.html` monolítico a cinco archivos (`config`, `worlds`, `audio`, `graphics`, `engine`).

**Separación de responsabilidades (separation of concerns).** Principio de que cada pieza haga *una cosa*. Aquí: gráficos solo dibuja, audio solo suena, worlds solo son datos, config solo son números, engine solo orquesta.

**Diseño dirigido por datos (data-driven design).** Poner el contenido (planetas, preguntas) como *datos* separados de la *lógica*. Agregar un mundo = añadir un objeto a una lista, sin tocar el motor. Es `worlds.js`.

**Parámetros / configuración / "tuning".** Los números que ajustan la experiencia (velocidad, vidas, ritmo de calor) reunidos en un solo lugar (`config.js`) para balancear sin arriesgar la lógica.

**Espacio de nombres (namespace).** Una "carpeta" dentro del código para no chocar con otros nombres. Usamos el objeto global `OC` (`OC.Config`, `OC.Audio`, etc.). 🏠 Era la forma de compartir código entre scripts planos; con módulos ES ya no haría falta.

**IIFE (función autoejecutada).** Una función que se define y se llama de inmediato: `(function(){ ... })()`. Sirve para crear un espacio privado y exponer solo lo necesario. Cada módulo la usa.

**Closure (clausura).** Cuando una función "recuerda" variables de donde fue creada aunque ya haya terminado ese contexto. Gracias a esto, `graphics.js` guarda `cx`, `W`, `H` de forma privada y no las expone.

**Estado (state).** El conjunto de datos que describe el juego *ahora* (posición de la nave, vidas, temperatura, enemigos…). Es el objeto `state` en `engine.js`.

**Máquina de estados (state machine).** El juego siempre está en *una* escena: `welcome`, `nombre`, `briefing`, `playing`, `question`, `levelup`, `gameover`, `victoria`. La función `show()` cambia entre ellas. Evita que dos pantallas se pisen.

---

## 2. Web y navegador

**HTML / CSS / JavaScript.** Los tres lenguajes de la web: HTML es la *estructura* (qué elementos hay), CSS el *estilo* (cómo se ven), JavaScript el *comportamiento* (qué hacen). En el juego: `index.html`, los `<style>`, y los `.js`.

**DOM (Document Object Model).** La representación en memoria de la página como un árbol de elementos que JavaScript puede leer y modificar. `getElementById('hud')` busca un nodo del DOM.

**Canvas.** Un elemento HTML que es un "lienzo" de píxeles donde se dibuja por código. Todo el juego (nave, planetas, enemigos) se pinta en un `<canvas>`, no con elementos HTML.

**Contexto 2D (ctx).** El objeto con el que se dibuja en el canvas: `ctx.fillRect`, `ctx.arc`, etc. En `graphics.js` se llama `cx`.

**Bucle de juego (game loop).** El ciclo que se repite ~60 veces por segundo: *actualizar estado → dibujar → repetir*. Es la función `loop()`.

**requestAnimationFrame.** La forma correcta de pedir al navegador "llámame en el próximo cuadro". Sincroniza con la pantalla (fluidez) y pausa si la pestaña no está visible (ahorra batería).

**Delta time (dt).** El tiempo transcurrido entre dos cuadros. Multiplicar los movimientos por `dt` hace que el juego vaya a la misma velocidad en un equipo rápido o lento. Por eso la temperatura sube por `rate * dt`.

**Event listener (escucha de eventos).** Código que reacciona a algo: una tecla, un toque, cambiar de tamaño. `addEventListener('keydown', ...)`.

**Pointer Events.** Un estándar moderno que unifica mouse, dedo y lápiz en un solo tipo de evento. Reemplazó al control táctil anterior (que se "pegaba") y funciona parejo entre navegadores.

**Viewport / responsive.** Adaptar la interfaz al tamaño de pantalla. La etiqueta `<meta viewport>` y el CSS con proporciones hacen que el juego se vea bien en teléfono, tablet o proyector.

**localStorage.** Una pequeña "memoria" que el navegador guarda por sitio, incluso al cerrar. Se usa para el **podio local** cuando no hay conexión al Sheet.

**Módulos ES (`import` / `export`).** La forma moderna y ordenada de que un archivo JS use funciones de otro sin variables globales. 🏠 No los usamos porque se bloquean en `file://`; **en GitHub Pages sí funcionan** y serían más limpios que el espacio de nombres `OC`.

**`file://` vs HTTP/HTTPS.** Abrir un `.html` con doble clic usa el protocolo `file://`, muy restringido por seguridad. Un sitio como GitHub Pages lo sirve por HTTPS, lo que habilita módulos, `fetch` y CORS normales. **Al fijar el diseño en GitHub, dejamos atrás esas restricciones.**

**Servidor / hosting / GitHub Pages.** Un servidor entrega los archivos a quien los pide por internet. GitHub Pages es un hosting gratuito que publica el contenido de un repositorio como sitio web.

---

## 3. CORS y comunicación con el Sheet

**HTTP: GET y POST.** Los dos "verbos" más comunes para hablar con un servidor: **GET** pide datos (leer el podio), **POST** envía datos (registrar un puntaje).

**Endpoint.** La URL específica que atiende las peticiones. En Apps Script es la que termina en `/exec`.

**JSON.** Un formato de texto para intercambiar datos estructurados: `{"nombre":"Ana","puntaje":3200}`. Es el idioma común entre el juego y el Sheet.

**API (interfaz de programación).** Un conjunto de funciones que un sistema ofrece para que otros lo usen. La *Web Audio API* para sonido; la *API* del Apps Script para el podio.

**CORS (Cross-Origin Resource Sharing).** La regla de seguridad que impide que una página de un origen lea datos de otro origen sin permiso. Es la causa de casi todos los problemas al conectar el juego con Google.

**Preflight.** Una petición previa (tipo `OPTIONS`) que el navegador manda automáticamente cuando una llamada es "compleja". Apps Script no la maneja bien, así que la evitamos usando `text/plain` (una petición "simple" que no dispara preflight).

**JSONP.** Un truco antiguo para leer datos de otro dominio *sin* CORS: se inserta un `<script>` que trae la respuesta ya "envuelta" en una llamada a función. 🏠 Lo usamos para leer el podio desde `file://`. **En GitHub Pages podríamos usar `fetch` normal** si el Apps Script devuelve las cabeceras CORS adecuadas.

**fetch.** La función moderna de JavaScript para hacer peticiones HTTP. La usamos para el POST del puntaje.

**`mode: 'no-cors'` / respuesta opaca.** Una forma de *enviar* sin leer la respuesta (queda "opaca"). Sirve para "disparar y olvidar" el registro del puntaje sin chocar con CORS.

**Fire-and-forget ("disparar y olvidar").** Enviar algo sin esperar ni revisar la respuesta. Así registramos el puntaje: si falla, el podio local sigue funcionando.

**LockService / concurrencia.** Cuando muchos alumnos terminan a la vez, dos escrituras podrían pisarse (*race condition*, condición de carrera). El "candado" (`LockService`) obliga a que se escriban de a una.

**Google Apps Script / doGet / doPost.** El "backend" que vive junto a la planilla. `doGet` responde a las lecturas (podio) y `doPost` a las escrituras (registrar). Es `Code.gs`.

---

## 4. Gráficos y render

**Sprite.** La representación visual de un objeto del juego (la nave, un meteorito). Aquí no son imágenes: se dibujan con polígonos por código.

**Polígono / path / vector.** Formas hechas con líneas y curvas (`moveTo`, `lineTo`, `arc`) en vez de mapas de píxeles. Dan el aspecto "vectorial" tipo Atari y escalan sin pixelarse.

**Gradiente.** Transición suave entre colores. Radial para los planetas (centro claro → borde oscuro), lineal para el cielo de Venus (naranja → rojo → negro).

**DPR (device pixel ratio).** Cuántos píxeles físicos hay por píxel "lógico" en pantallas de alta densidad (retina). Ajustar el canvas por el DPR evita que se vea borroso.

**Sistema de coordenadas.** En canvas, el origen `(0,0)` está arriba a la izquierda y la Y crece hacia abajo. Por eso las balas suben con velocidad *negativa*.

**globalAlpha / transparencia.** Controla qué tan opaco se dibuja. Se usa para el parpadeo de los potenciadores y el tinte rojo de calor.

**Colisión AABB (caja alineada a los ejes).** La forma más simple de detectar choques: dos rectángulos se tocan si se solapan en X y en Y. Es la función `hit(a,b)`.

**Sistema de partículas.** Muchos puntitos con vida corta que simulan una explosión o chispas. Es la función `boom()` y el arreglo `particles`.

**Interpolación con seno.** Usar `Math.sin()` para movimientos suaves y cíclicos: el flotar del jefe, el zigzag de las notas musicales, el pulso de los potenciadores.

**Efecto CRT / scanlines.** Líneas horizontales y viñeta que imitan un monitor de tubo antiguo, para el aire retro. Están hechas con CSS sobre el canvas.

---

## 5. Audio

**Web Audio API.** El sistema del navegador para generar y procesar sonido por código, sin archivos de audio. Todo el sonido del juego es *sintetizado* en vivo.

**Oscilador.** La fuente básica de sonido: genera una onda a una frecuencia. Es a la Web Audio lo que una cuerda es a una guitarra.

**Forma de onda.** El "timbre" del oscilador: `sine` (suave), `square` (retro, 8-bit), `sawtooth` (áspera), `triangle` (intermedia). Cada efecto elige la suya.

**Frecuencia (Hz).** Cuántas veces por segundo vibra la onda; determina el tono (agudo/grave). 440 Hz es el "la" central. Las notas del Profesor Carlos son una escala de frecuencias.

**Envolvente ADSR.** Cómo evoluciona el volumen de un sonido en el tiempo: *Attack* (ataque), *Decay* (caída), *Sustain* (sostén), *Release* (liberación). Da forma a un disparo corto o a una explosión que decae.

**Ganancia (gain).** El control de volumen de un nodo de audio. La "ganancia maestra" regula todo el juego de una vez y permite silenciar (tecla **M**).

**Ruido + filtro.** El *ruido* (valores aleatorios) suena a "shhh"; pasarlo por un *filtro pasa-bajos* (biquad lowpass) le quita agudos y lo vuelve un "boom" de explosión más creíble.

**Desbloqueo por interacción.** Los navegadores no dejan sonar audio hasta que el usuario toca algo (para no molestar). Por eso el sonido "se enciende" al presionar el primer botón (`unlock`).

---

## 6. Diseño de juego (jugabilidad)

**Nivel / misión.** Cada planeta es una misión con su meta, su escenario y su jefe. La lista está en `worlds.js`.

**HUD (heads-up display).** La información sobre la pantalla sin interrumpir el juego: misión, puntaje, vidas, potenciadores, termómetro.

**Spawn / spawner.** "Generar" objetos en el juego (enemigos, potenciadores) según un ritmo o probabilidad. `spawnEnemy`, `spawnPowerup`.

**Cooldown (enfriamiento).** Tiempo de espera entre acciones repetibles, como entre disparos. Evita disparar infinito por cuadro.

**Buff / potenciador temporal.** Una mejora que dura un rato: velocidad (⚡) o poder triple (✦). Se controla con un temporizador que baja con `dt`.

**Jefe (boss) / patrón de ataque.** Enemigo final con más vida, barra propia y un comportamiento definido (moverse y disparar). Profesor Alex (birrete) y Profesor Carlos (calvo, notas musicales).

**Evento.** Un suceso que rompe la rutina: *tormenta de meteoritos* (lluvia intensa) u *oleada enemiga* (formación). Añade tensión y variedad.

**Escalado de dificultad (scaling).** Que el juego se ponga más difícil con el avance: la nave más rápida, enemigos más veloces, jefes con más vida. Sale de fórmulas con `state.level` en `config.js`.

**Balance / jugabilidad justa (winnable).** Ajustar los números para que el reto sea exigente pero superable. La temperatura de Venus se calibró simulando: recogiendo refrigerante, es ganable; ignorándolo, te fundes en ~36 s.

**Podio / leaderboard.** El ranking de mejores puntajes, local o del curso (vía Sheet).

---

## 7. Flujo de trabajo y validación

**Sintaxis vs. lógica.** Un error de *sintaxis* es una regla del lenguaje rota (una llave sin cerrar); uno de *lógica* es que "compila" pero hace algo distinto de lo esperado.

**`node --check`.** Un comando que revisa que un archivo JavaScript no tenga errores de sintaxis, sin ejecutarlo. Lo corrí en cada archivo antes de entregar.

**Prueba de humo (smoke test).** Una prueba mínima que verifica que "enciende sin explotar": cargar los módulos y correr el bucle en un entorno simulado para detectar fallos al arrancar.

**Stub / mock.** Objetos falsos que imitan lo real (un DOM y un canvas de mentira) para poder probar el código fuera del navegador.

**Balanceo por simulación.** Correr el modelo numérico de una mecánica (la temperatura) miles de veces para comprobar que es justa antes de probarla a mano.

---

## Apéndice · Qué cambia al ser solo para GitHub Pages

Al descartar el uso local (`file://`), tres muletas dejan de ser necesarias y se pueden simplificar:

| Muleta actual (🏠) | Por qué existía | Alternativa "de servidor" (GitHub) |
|---|---|---|
| Espacio de nombres global `OC` + scripts planos | Los módulos ES se bloquean en `file://` | **Módulos ES** con `import`/`export`, más limpios y sin globales |
| **JSONP** para leer el podio | `fetch` cross-origin falla desde `file://` | **`fetch` normal** con cabeceras CORS en el Apps Script |
| `no-cors` "a ciegas" para escribir | Evitar el preflight desde `file://` | POST con respuesta legible (confirmar si el puntaje se guardó) |

Ninguna es urgente —el juego funciona— pero adoptarlas haría el código más idiomático y permitiría, por ejemplo, avisar al alumno "puntaje guardado ✓".

---

## 8. Motor de sagas (multi-disciplina) — *nuevo*

**Saga / campaña.** Un "viaje" completo con su propia disciplina, narrador, vehículo, mundos y preguntas. Cada objeto de `OC.Sagas` es una saga (Sistema Solar, Centro de la Tierra, Galáctico, Cuerpo Humano, Ecosistemas).

**Franquicia / motor reutilizable (engine reuse).** La idea de que *un mismo motor* sirva para muchos contenidos. No reprogramamos el juego por disciplina: solo cambiamos **datos** (`sagas.js`) y algunos **sprites** (`graphics.js`). Es el pago de haber modularizado.

**Re-skin (recubrimiento).** Mantener las *mismas mecánicas* y cambiar solo lo visual/temático. El nanobot y el jeep juegan igual que la nave; cambia el dibujo y el contexto, no las reglas.

**Reutilización de mecánicas.** Una mecánica bien hecha se aplica en varios lugares. La barra de **temperatura** de Venus ahora también aparece en el Manto, el Núcleo y el Desierto de Atacama, sin código nuevo: basta poner `cooling:true` en el mundo.

**Selector / menú de selección.** La pantalla inicial que lista las sagas como tarjetas y fija cuál se juega. Se construye *desde los datos* (`buildMenu` recorre `OC.Sagas`): agregar una saga hace aparecer su tarjeta sola.

**Abstracción del vehículo.** En vez de un solo dibujo de nave, `ship()` recibe el tipo de vehículo y delega al sprite correcto (`vNave`, `vTaladro`, `vNanobot`, `vJeep`). Es un *dispatcher*: una función que reparte el trabajo según un dato. Facilita sumar vehículos sin tocar el resto.

**Escena temática.** El fondo cambia según el `scene` del mundo: `corteza`/`manto`/`nucleo` (estratos y magma), `galaxia` (nebulosa), `organismo` (interior orgánico), `ecosistema` (naturaleza). Mismo motor, distinta ambientación.

**Diseño extensible (open for extension).** Un buen diseño permite *agregar* sin *modificar* lo existente. Aquí: nueva saga = nuevo objeto en `sagas.js`; nuevo mundo = nuevo elemento en su lista; nuevo vehículo = un caso más en el dispatcher. El motor queda intacto.

---

## 9. Ciencia de la saga "Centro de la Tierra" — *nuevo*

**Litosfera.** Capa externa rígida y frágil (corteza + parte superior del manto). Es sólida y se fractura en **placas tectónicas**. Espesor ~0–100 km.

**Astenosfera.** Zona del manto superior que se comporta como **sólido plástico**: no es líquida, pero fluye lentísimamente (como plastilina caliente). Sobre ella se deslizan las placas. ~1300 °C.

**Manto.** Capa más gruesa: roca sólida y caliente que fluye por **convección** y arrastra los continentes. El **magma** (roca fundida) se forma solo en zonas puntuales, no en todo el manto.

**Núcleo externo / interno.** El externo es metal **líquido** (hierro y níquel fundidos); el interno es hierro **sólido** pese a ~5000–6000 °C, porque la presión gigantesca lo impide fundir.

**Estado plástico / dúctil.** Material sólido que puede deformarse y fluir sin romperse. Clave para entender por qué el manto "sólido" igual se mueve.

**Convección.** Transporte de calor por movimiento del propio material: lo caliente sube, lo frío baja, formando ciclos. Mueve el manto y, con él, las placas.

**Magma.** Roca fundida bajo la superficie. Cuando sale, es lava. Es la excepción líquida, no la regla, dentro de la Tierra.

**Silicatos.** Compuestos de silicio y oxígeno (con Al, Fe, Mg…) que forman casi todas las rocas. La corteza continental es granítica (Si, Al); la oceánica, basáltica (Fe, Mg).

**Peridotita.** Roca del manto rica en silicatos de magnesio y hierro (olivino, piroxeno). Es la composición típica de la astenosfera.

**Geodinamo.** El mecanismo que genera el campo magnético terrestre: el movimiento del hierro líquido del núcleo externo actúa como un dínamo gigante.

**Gradiente geotérmico.** El aumento de temperatura (y de presión) a medida que se desciende hacia el centro de la Tierra.

> Nota de diseño: la barra de temperatura (mecánica de Venus) se **reutiliza** en la Astenosfera y el Manto por su calor extremo; los jefes **Tío Francisco** (rocas), **Tío Jorge** (rocas más poderosas) y **Tía Sandra** (magma) usan proyectiles temáticos de su capa.

---

## 10. Jefe final de saga — *nuevo*

**Jefe final (final boss) / clímax.** El enemigo culminante que aparece **tras el último nivel de cada saga**: *El gran Profesor Felipe*. Es común a todas las sagas y cierra la campaña. Vencerlo lleva a la victoria.

**Pico de dificultad (difficulty spike).** Un aumento brusco y deliberado del desafío en un momento clave. El jefe final tiene mucha más vida y dispara más rápido para sentirse "temible".

**Patrón en abanico / ráfaga (bullet spread).** Disparos que salen en varias direcciones a la vez (con velocidad horizontal `vx`), obligando a esquivar con más cuidado. El profesor Felipe abre abanicos de 3 y, cada tantas ráfagas, de 5.

**Forma temática del jefe.** El mismo jefe se representa distinto según la saga: en "Centro de la Tierra" es un **gran átomo de hierro (Fe)** —núcleo de protones/neutrones con electrones orbitando— y en el resto, un **profesor imponente** con aura y birrete. Es otro caso de *re-skin*: misma función, distinta apariencia.

**Arena de jefe.** Un nivel especial sin enemigos normales, dedicado solo al combate contra el jefe final. Reutiliza el escenario del último mundo de la saga.

---

## 11. Economía y taller de mejoras — *nuevo*

**Moneda (currency).** Recurso que se recolecta jugando (por cada enemigo destruido, al vencer jefes y con monedas 🪙 que caen) y se gasta en el taller. Se reinicia al empezar cada saga.

**Taller / tienda (shop).** Pantalla que aparece **entre cada nivel** para invertir las monedas en mejorar el vehículo. Se construye desde el catálogo `OC.Config.shop` (data-driven): agregar una mejora es añadir un objeto.

**Mejora (upgrade) y niveles.** Cada mejora sube por niveles (p. ej. Cadencia 0→3). El estado guarda el nivel comprado de cada una en `state.upgrades`.

**Coste escalonado.** El precio sube con el nivel: `coste = baseCost + nivelActual × costStep`. Evita que todo se compre de golpe y da sensación de progreso.

**Escudo / armadura (shield).** Puntos que **absorben impactos** antes de perder una vida; se rellenan al inicio de cada nivel. Es la mejora "armadura".

**Cadencia (fire rate).** Reduce el enfriamiento entre disparos: disparas más seguido.

**Disparo múltiple (multishot).** Pasar de un rayo a dos o tres simultáneos (mejora "Armamento"). El potenciador temporal ✦ hace lo mismo por unos segundos; la mejora lo vuelve permanente.

**Rayo perforante (piercing).** Balas que **atraviesan** varios enemigos sin desaparecer, y con más daño a los jefes. En código, la bala lleva `pierce:true` y no se elimina al impactar.

**Meta-progresión (dentro de la partida).** La idea de que el jugador se fortalece a lo largo de la campaña, no solo dentro de un nivel. Aquí es *por saga*: las mejoras acompañan todo el viaje y se reinician en la siguiente saga.

**Bucle de recompensa (reward loop).** El ciclo motivador *jugar → ganar monedas → mejorar → jugar mejor*. Es lo que engancha y, en clase, premia seguir respondiendo bien.

---

## 12. Dificultad y ritmo — *nuevo*

**Curva de dificultad (difficulty curve).** Cómo crece el desafío a lo largo del juego. Buscamos que suba **de forma gradual**, sin saltos bruscos, para que el jugador aprenda mientras avanza.

**Escalado por nivel (per-level scaling).** Varias variables aumentan con el número de nivel (`state.level`): velocidad de caída de los enemigos, frecuencia de aparición, densidad (probabilidad de enemigos dobles) y vida de los jefes. Están en fórmulas de `config.js`.

**Meta del nivel.** Cantidad de amenazas que hay que destruir **antes** de que aparezca el jefe. Sube de nivel en nivel (p. ej. 12 → 15 → 18 → 22 → 26), alargando y endureciendo cada misión.

**Densidad de enemigos.** Cuántos aparecen a la vez. Crece con el nivel mediante la probabilidad de "spawn doble" (`doubleChance + nivel × doubleChancePerLevel`).

**Ritmo (pacing).** El equilibrio entre momentos intensos y respiros. El taller entre niveles y las preguntas para ganar vidas son pausas que regulan el ritmo.

**Progresión gradual vs. pico.** Un buen diseño evita **picos** (un nivel de golpe imposible) y prefiere una **progresión** suave. Extender las sagas a más niveles reparte el aumento de dificultad y lo hace más justo.

> En esta versión: la saga Sistema Solar tiene 10 niveles; las otras cuatro se extendieron a **5 niveles** cada una, con `meta`, ritmo de aparición y vida de jefes en aumento progresivo.
