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

- **Contra la máquina** (práctica): tres niveles (Fácil, Medio, Difícil), eliges color, puedes deshacer y pedir una
  **pista**. No se apuesta ni suma al ranking. La máquina piensa en segundo plano (`ia.js`, un Web Worker).

## Apuestas (solo en línea, entre dos personas)
Al crear la sala se elige: sin apuesta, **Hipopesos** (los dos ponen lo mismo; quien gana se lleva el doble) o **un gatito**
cada uno (quien gana se lleva los dos). Quien se une ve la apuesta y decide si paga y juega, o solo mira.
- Lo apostado **sale al crear o al unirse** y queda retenido en la sala (como en las subastas).
- Al terminar, **cada uno cobra solo** lo que le toca: premio si ganó, devolución si hubo tablas o se anuló.
  Quien cierra una sala en espera recupera su apuesta.
- Un final en el tablero (mate, ahogado…) lo **confirma el equipo del rival**: revisa todas las jugadas con el motor.
  Si encuentra una jugada no válida, la partida queda **en revisión** y nadie cobra hasta que el profe resuelva.
  Si el rival no está conectado, se puede cobrar 30 minutos después.
- Si en una apuesta de gatitos el del rival no te parece justo, puedes **anular** antes de la segunda jugada.
- Tu mascota no se puede apostar. La colección puede llegar a 45 gatitos al cobrar (el tope normal es 40).
- **El profe** ve, en la sala, una «Revisión del profe» que dice si hay jugadas no válidas, con botones para dar la
  victoria a un color o declarar tablas.

## Ranking
Cuenta **victorias en línea contra personas** (con o sin apuesta) que tengan al menos 10 jugadas de cada uno, una vez por
partida. Aparece en `rankings.html#ajedrez` y en el **Podio de los juegos** de la portada (pestaña Ajedrez).
El profe puede borrar marcas o bloquear a alguien desde `rankings.html`, como en los demás juegos.

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
- `ia.js`: la máquina (alfa-beta con profundización iterativa y búsqueda de capturas).
- `prueba-ia.js`: `node juegos/ajedrez/prueba-ia.js` (mates en 1, piezas colgadas, tiempos).
- `prueba-reglas.mjs` y `prueba-apuestas.mjs`: pruebas de las reglas de Firestore con el emulador (instrucciones dentro).

## Firebase
Las salas se guardan en la colección `ajedrez_salas` de Firestore. **Antes de usar el modo en línea
hay que publicar `firebase/firestore.rules` actualizado** (Firebase → Firestore → Reglas → Publicar).
Las reglas comprueban que juegue solo quien tiene el turno, que no se cambien jugadas anteriores, que
el reloj no se adultere y que solo los dos jugadores ofrezcan tablas, se rindan o cobren el tiempo.
La legalidad de cada jugada la revisa `motor.js` en los equipos de ambos jugadores.

Datos que se guardan por sala: el nombre corto de los dos jugadores (por ejemplo «Ana P.»), su uid,
las jugadas, el reloj y lo apostado. Los movimientos del banco son `ajedrez-apuesta`, `ajedrez-premio` y
`ajedrez-devolucion` (con el campo `ajedrez` = código de la sala). En la colección de gatitos, `ajedrez` y
`ajedrezCobro` guardan el código de la última sala donde se apostó o cobró.

## Ideas pendientes
- Apostar también beneficios del catálogo (hoy: Hipopesos y gatitos).
- Borrar automáticamente las salas antiguas (hoy las borra el profe desde la consola).
- El ranking no impide que alguien con dos cuentas se regale victorias: el profe puede borrar o bloquear.
