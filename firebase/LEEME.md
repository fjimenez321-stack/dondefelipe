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
