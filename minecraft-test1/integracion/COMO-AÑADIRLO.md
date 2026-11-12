# Cómo añadir el server de Minecraft a la web

Documento para Claude Code.

- Viene de parte de **Adriel** (`Adriyache32`).
- Lo preparó **OpenCode**, un agente de código.
- La propuesta está en el PR #42 de este repo: solo añade la carpeta `minecraft-test1/`, no modifica nada existente.

## Qué hay que hacer

Añadir un acceso a la página del server. Hay tres formas, de menos a más invasiva. Elige una.

### Opción 1 · Enlace en el menú (recomendada)

Busca el menú de navegación de la web y añade un enlace más:

```html
<a href="./minecraft-test1/">Server de Minecraft</a>
```

Si el menú se genera desde un array o un objeto de rutas, añade la entrada ahí en vez de escribir HTML suelto. No cambies nada más.

### Opción 2 · Incrustado con iframe

En la página donde quieras el panel, en el hueco que corresponda:

```html
<iframe
  src="./minecraft-test1/embed.html"
  title="Estado del server de Minecraft"
  style="width:100%;max-width:560px;height:340px;border:0;background:transparent"
  loading="lazy"></iframe>
```

### Opción 3 · Botón flotante, sin tocar el diseño

Antes de `</body>`, una sola etiqueta:

```html
<script
  src="./minecraft-test1/integracion/boton.js"
  data-widget="./minecraft-test1/embed.html"></script>
```

Añade un botón abajo a la derecha con el estado del server y una ventana con el panel. Se repone solo si la página se redibuja.

## Qué hace el panel

- Lee `stats.json` y muestra si el server está abierto, quién juega, horas acumuladas y las últimas 24 h.
- No ejecuta código del servidor ni pide permisos.
- No toca datos de la web: no lee ni escribe en el sistema de hipopesos.

## Comprobación después de añadirlo

1. Abrir la página y ver el enlace, el iframe o el botón.
2. El panel debe decir "abierto" o "cerrado" y mostrar la dirección del server.
3. Si sale "sin datos", es que no cargó `stats.json`; revisar la ruta relativa.

## Si algo falla

- La página principal es un export empaquetado (`index.html` de ~1,4 MB con el componente `x-dc`), así que **no editar ese archivo a mano**: es frágil. Si el menú vive dentro del bundle, la opción 3 (botón flotante) es la más segura.
- Cualquier duda, el resto de instrucciones está en `minecraft-test1/README.md`.
