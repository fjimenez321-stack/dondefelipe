# El Mundo de Felipe · GitHub + Vercel + Firebase

| Pieza | Para qué |
|---|---|
| **GitHub** (`fjimenez321-stack/dondefelipe`) | El laboratorio: aquí están todos los archivos y su historial. |
| **Vercel** | La publicación: cada vez que subes un cambio a GitHub, Vercel actualiza el sitio solo. |
| **Firebase Authentication** | El login con Google. |
| **Firestore** (la base de datos de Firebase) | Perfiles, progreso, puntajes, resultados, banco y visitas. |

## Archivos
- `firebase/config.js`: la configuración del proyecto y las opciones (edad mínima, cierre de sesión, etc.). **Es el único archivo que editas.**
- `firebase/df.js`: la conexión común. Cualquier página la usa con `<script src="../firebase/df.js"></script>`.
- `firebase/firestore.rules`: las reglas de seguridad. Se pegan en la consola de Firebase.
- `cuenta.html`: la página **Mi cuenta**. Ahí se entra y se sale, se corrige la edad y se ve el progreso; también se descargan o se borran los datos. Al final está el texto de privacidad.
- `panel-profe.html`: el banco, los juegos, los simuladores, los estudiantes y las visitas.
- `rankings.html`: el ranking público, que muestra solo el nombre y la inicial del apellido.
- `vercel.json`: indica a Vercel que no guarde en caché el service worker de la app instalable.

## 1. Firebase (una sola vez, ~10 min)
1. Entra a https://console.firebase.google.com, elige **Agregar proyecto** y escribe `dondefelipe`. No necesitas Analytics.
2. Elige **Agregar app → Web (</>)**. Copia el bloque `firebaseConfig` y pégalo en `firebase/config.js`.
3. Ve a **Authentication → Comenzar → Sign-in method → Google → Habilitar**.
4. Ve a **Firestore Database → Crear base de datos**. Elige la ubicación `southamerica-east1` (São Paulo) y el **modo producción**.
5. Ve a **Firestore → Reglas**. Pega `firestore.rules` después de editar `dominio()` y `profes()`, y presiona **Publicar**.

## 2. Vercel (una sola vez, ~5 min)
1. Entra a https://vercel.com con tu cuenta de GitHub y elige **Add New → Project**. Importa `dondefelipe`.
2. En **Framework Preset** elige **Other**. Deja vacíos Build Command y Output Directory, porque el sitio no necesita compilarse. Presiona **Deploy**.
3. Vercel te da una dirección del tipo `dondefelipe.vercel.app`. Puedes cambiarla en **Settings → Domains**.
4. De vuelta en Firebase, ve a **Authentication → Configuración → Dominios autorizados**. Agrega esa dirección (y `fjimenez321-stack.github.io` si mantienes GitHub Pages).

Desde ahí, todo lo que subas a la rama `main` aparece publicado en Vercel en menos de un minuto. Las vistas previas de otras ramas tienen direcciones distintas, y el login no funciona en ellas salvo que agregues esa dirección en Firebase.

## Datos que se guardan
Nombre y correo (de Google), edad (la escribe el estudiante) y su progreso. Las visitas se cuentan sin identificar a nadie. A quienes tienen menos de `edadMinimaSinApoderado` años (14 por defecto) se les pide confirmar que su apoderado está de acuerdo.

## Agregar un juego al ranking
```js
if (window.DF) DF.ofrecer({ tipo: 'puntaje', juego: 'snake', titulo: 'Snake', puntaje: score });
```
Después agrega `'snake'` a `JUEGOS` en `rankings.html` y en `panel-profe.html`.

## Guardar progreso de cualquier página
```js
DF.guardarProgreso('mi-clave', { nivel: 3, logros: 5 });   // necesita sesión iniciada
DF.leerProgreso('mi-clave').then(datos => { … });
```

## Casa de Subastas (`subastas.html`)
- Solo el profe publica: objeto, descripción, emoji o imagen, **monto mínimo**, **alza mínima** y **hora de cierre**. El panel aparece en la misma página al entrar con la cuenta de profe.
- Cada oferta se paga al instante con Hipopesos y queda **retenida**. Si alguien ofrece más, la oferta anterior vuelve completa a su dueño en la misma escritura (movimiento `subasta-devuelta`).
- Al cierre ya no se aceptan ofertas (lo impide `firestore.rules`). El profe presiona **Adjudicar** y entrega el objeto; el dinero de quien ganó ya está cobrado. **Anular** devuelve la oferta vigente.
- La portada muestra las subastas abiertas con su oferta actual y cuenta regresiva.
- Requiere publicar el `firestore.rules` actualizado (colección `subastas`).

## Apuestas de los partidos (`apuestas.html`)
- Sentido lúdico y educativo: antes de participar, cada estudiante lee una advertencia y la acepta.
- El profe crea cada partido (opciones, cierre, mínimo y tope por apuesta). Una apuesta por estudiante y partido; el monto sale del saldo al apostar.
- Apuesta mutua: al marcar el ganador, el pozo completo se reparte entre quienes acertaron, en proporción a lo apostado (`floor(apuesta × pozo ÷ total de la opción ganadora)`). Sin comisión. Si nadie acertó o se anula, se devuelve todo.
- Requiere publicar el `firestore.rules` actualizado (colecciones `apuestas_partidos` y `apuestas`).

## Gift cards de Hipopesos (`tarjetas.html` y `canjear.html`)
- El profe las crea e imprime en `tarjetas.html` (enlazada en el Panel del profe): monto, cantidad, vencimiento opcional y motivo.
  - **Al portador**: sirve para quien la canjee primero (como un billete).
  - **Nominativa**: solo la cuenta elegida puede canjearla.
- El QR lleva a `canjear.html#c=<código>` (26 caracteres aleatorios, ~130 bits). El código va en el fragmento (#), que el navegador no envía al servidor, y se borra de la barra al abrir.
- La base guarda la tarjeta con el **sha256 del código** como nombre; los estudiantes no pueden listar tarjetas ni leer los códigos (`giftcards_codigos` es solo del profe, para reimprimir).
- Canje en una sola escritura: la tarjeta pasa a «canjeada» (las reglas comprueban que el sha256 del código coincide) y el monto entra con un movimiento `giftcard`. Una sola vez; las vencidas y anuladas no se pueden canjear.
- Requiere publicar el `firestore.rules` actualizado.

## Entradas a eventos con QR (`entradas.html`, `entrada.html` y `verificar.html`)
- **`entradas.html`** (solo profe, enlazada en el Panel del profe): crea el evento (nombre, fecha, lugar, nota, estado abierto/cerrado y **porteros**: los correos de quienes controlan la puerta).
  Sube el Excel (.xlsx) o pega la lista. Si la primera fila tiene encabezados (Nombre, Apellido, Curso, Tipo…) se usan en cualquier orden y Nombre + Apellido se juntan; si no, se toma Nombre · Curso · Tipo. También puedes generar entradas sin nombre. Cada entrada recibe un N° correlativo.
  Cada QR sale con el nombre del titular: impreso en la entrada y como nombre del archivo (`Ana Pérez.png`; si dos se llaman igual, `Ana Pérez (#12).png`).
  Desde la lista: imprimir (10 por hoja A4), descargar imágenes PNG en un ZIP para enviarlas por WhatsApp, exportar la asistencia en CSV, anular, reactivar, marcar a mano o deshacer un ingreso.
- **Solo QR + nombre** (para entradas ya diseñadas): en la lista, elige si el nombre va **arriba o abajo** del QR (y si lleva el curso) y descarga las imágenes PNG en ZIP (cada una con el nombre del estudiante) o imprímelas en 3–6 cm para recortar y pegar. Deja el borde blanco alrededor del QR: los lectores lo necesitan.
- **Columnas del Excel:** Nombre/Estudiante, Apellido(s), Curso, Tipo, **Apoderado** y **Observaciones** (en cualquier orden, por encabezado).
- **Observaciones:** las del Excel (o las que escribe el profe con 📝) aparecen en grande al escanear y la pantalla no se cierra sola. En la puerta, el portero puede agregar una observación («llegó con 2 acompañantes»). Se guardan en `entradas_privado`: las ven el profe y los porteros, **no** el apoderado que abre el QR. Salen en el CSV de asistencia.
- **Cupos por entrada:** cada evento tiene «Cupos por entrada» (4 por defecto) y una columna **Cupos** en el Excel lo cambia por persona. Cada lectura del QR deja pasar a 1 persona («Persona 2 de 4 · quedan 2»); al usarse el último cupo la entrada queda **completa** y la siguiente lectura sale en rojo «Sin cupos». En la pantalla verde está el botón «Entra 1 más con esta entrada» para no volver a escanear. El mismo QR no se cuenta dos veces mientras siga frente a la cámara: debe salir de cuadro al menos 4 s. En la lista el profe puede cambiar los cupos de una entrada (👥), sumar un ingreso a mano (+1) o restar el último (−1). Los contadores y el CSV cuentan personas.
- **El QR** lleva a `entrada.html#c=<código>` (16 caracteres aleatorios, 80 bits). Quien la recibe ve su entrada con el QR para mostrarla en la puerta. Si la abre un portero con su cuenta, aparece el botón «Dejar pasar».
- **`verificar.html`** (profe y porteros): escáner con la cámara del celular, pantalla verde «PASA» o roja («YA INGRESÓ a las…», «Anulada», «Otro evento», «No existe»), sonido y vibración, contador en vivo, búsqueda por nombre y código escrito a mano. Modo «Solo consultar» para revisar sin marcar.
- La base guarda cada entrada con el **sha256 del código** como nombre (`entradas`); el código queda en `entradas_codigos`, solo para el profe. Los porteros solo pueden sumar 1 ingreso por lectura (nunca más que los cupos), con su correo y la hora del servidor, y con el evento abierto; con el último cupo la entrada pasa a «usada».
- Necesita internet en la puerta (la marca se hace en el servidor para que dos porteros no dejen pasar la misma entrada).
- Requiere publicar el `firestore.rules` actualizado (colecciones `eventos`, `entradas` y `entradas_codigos`).

## Tienda de artículos físicos (Mercado → 🛍️ Tienda)
- El profe publica artículos reales (cartas, juegos, útiles…) desde la pestaña Tienda del Mercado: nombre, descripción, emoji, hasta 2 fotos, precio y unidades (o sin límite). Puede cambiar precio, unidades y fotos, ocultar o borrar.
- Las fotos se achican y comprimen en el navegador (máx. 640 px, WebP, ~50 KB) y se guardan dentro del artículo: no se usa Firebase Storage.
- Al comprar se crea un pedido `articulo` en `mercado_pedidos` con el pago retenido y el artículo descuenta una unidad en la misma escritura (`tienda_articulos`).
- El profe lo entrega en persona y presiona «📦 Entregado» en Panel del profe → Solicitudes. Si rechaza, o el estudiante cancela antes, el pago vuelve y la unidad se repone.

## Muro de mensajes (portada)
- Desde nov. 2026 usa Firestore (`muro`) en vez de Apps Script: se actualiza en vivo (antes cada visitante consultaba el script cada 8 s).
- Leer es público; para escribir hay que entrar con la cuenta. Un mensaje cada 10 s por persona (`muro_ritmo`), máx. 140 caracteres, sin enlaces, correos ni números largos, y la firma debe empezar con el nombre de pila de la cuenta. El profe ve una ✕ para borrar mensajes.

## Entrar con un enlace al correo (sin Google)

Además de «Continuar con Google», el botón **Entrar** ofrece «Enviarme un enlace para entrar»: la persona escribe su correo, le llega un enlace de Firebase y, al abrirlo, queda dentro (sin contraseña). El código está en `firebase/df.js` (`elegirMetodo`, `enviarEnlace`, `completarEnlace`).

Para activarlo (una sola vez), en la consola de Firebase:
1. **Authentication → Sign-in method → Agregar proveedor nuevo → Correo electrónico/contraseña**.
2. Activa **«Vínculo de correo electrónico (acceso sin contraseña)»** y guarda.
3. En **Authentication → Configuración → Dominios autorizados** debe estar `dondefelipe.vercel.app` (ya está si Google funciona).

Mientras no se active, quien elija el correo verá: «La entrada por correo todavía no está activada en Firebase».
Las reglas no cambian: el enlace deja el correo verificado (`email_verified`), igual que Google.
