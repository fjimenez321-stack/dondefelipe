# Ajedrez Agustino

Ajedrez para 2 jugadores en pixel art medieval, ambientado en el claustro de San Agustín.
Las blancas son de marfil con oro; las negras, azul agustino con plata. El alfil es un obispo
con mitra (San Agustín fue obispo de Hipona) y el emblema es el corazón en llamas con la flecha.

Página: `juegos/ajedrez/ajedrez.html` (en el sitio: Juegos → Ajedrez Agustino, y una tarjeta en el Panel de juegos).

## Modos de juego
- **Dos jugadores en este dispositivo**: se juega en la misma pantalla. No necesita cuenta.
  La partida se guarda sola en el navegador y aparece «Continuar la partida guardada» en el menú.
  Opciones: deshacer, girar el tablero, «Girar solo» (gira en cada turno), tablas y rendirse.
- **En línea**: quien crea la partida elige el reloj y su color (blancas, negras o al azar) y recibe
  un **código de 5 caracteres** y un enlace (`ajedrez.html#sala=CODIGO`) para compartir por WhatsApp.
  El rival entra con «Unirme con un código» o abre el enlace. Hay que entrar con la cuenta del sitio.
  - Ofrecer, aceptar o rechazar tablas; rendirse; anular (solo antes de la segunda jugada).
  - **Revancha** con los colores cambiados al terminar.
  - Quien abre el enlace de una partida llena la **mira** (sirve para proyectarla en la sala).
  - «Mis partidas en línea» lista las partidas abiertas para volver a entrar.

## Reloj
Sin reloj, 1 min, 3+2, 5, 10, 15+10, 30 o uno a gusto (minutos + segundos por jugada).
El reloj parte con la primera jugada de las blancas. En línea, el tiempo se descuenta con la
**hora del servidor**: nadie puede regalarse tiempo y, si a alguien se le acaba, el rival cobra la
partida (si el rival no tiene piezas para dar mate, son tablas).

## Archivos
- `motor.js`: las reglas completas (enroque, al paso, coronación, jaque mate, ahogado, 50 jugadas,
  triple repetición, material insuficiente), notación en español (R, D, T, A, C) y PGN. Funciona en el
  navegador y en Node.
- `pixel.js`: piezas, emblema y letras en pixel art (16×16, dibujadas con letras; ver el comentario
  del archivo para cambiar colores o formas).
- `ajedrez.html`: tablero en canvas, menús, reloj y salas en línea.
- `prueba-motor.js`: `node juegos/ajedrez/prueba-motor.js` (perft con posiciones conocidas y finales).
- `prueba-reglas.mjs`: pruebas de las reglas de Firestore con el emulador (instrucciones dentro).

## Firebase
Las salas se guardan en la colección `ajedrez_salas` de Firestore. **Antes de usar el modo en línea
hay que publicar `firebase/firestore.rules` actualizado** (Firebase → Firestore → Reglas → Publicar).
Las reglas comprueban que juegue solo quien tiene el turno, que no se cambien jugadas anteriores, que
el reloj no se adultere y que solo los dos jugadores ofrezcan tablas, se rindan o cobren el tiempo.
La legalidad de cada jugada la revisa `motor.js` en los equipos de ambos jugadores.

Datos que se guardan por sala: el nombre corto de los dos jugadores (por ejemplo «Ana P.»), su uid,
las jugadas y el reloj. Nada más.

## Ideas pendientes
- Ranking de ajedrez (puntos por victoria) en `rankings.html`.
- Jugar contra el computador (el motor ya genera las jugadas legales; faltaría la búsqueda).
- Borrar automáticamente las salas antiguas (hoy las borra el profe desde la consola).
