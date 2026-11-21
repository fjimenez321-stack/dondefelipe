# Test 1 · server de Minecraft

Página de estado y control del server de prueba (Fabric 1.21.11) montado en un PC. Muestra si está abierto, quién está dentro, horas jugadas y el histórico de 24 h, y permite encenderlo o apagarlo desde la propia página cuando el puente está conectado.

## Piezas

| Archivo | Para qué |
|---|---|
| `index.html` | Página completa con estado, jugadores, horas, histórico y control |
| `embed.html` | Versión compacta para incrustar en otra página |
| `mc-client.js` | Cliente común: lee `stats.json`, habla con el puente y con la página que la incrusta |
| `bridge/agent.py` | Puente HTTP local: enciende, apaga, reinicia y escribe en el chat |
| `checker/check.py` | Comprueba el server y genera `stats.json` |
| `sync.sh` | Ejecuta el comprobador y publica `stats.json` si cambió |
| `integracion/` | `bridge.js` y `ejemplo.html` para engancharlo desde otra web |
| `deploy/` | Servicios systemd de usuario |

## Flujo

```
server (25565) ──checker──> stats.json ──> esta página
      ^                                        │
      └──── bridge (8090): start/stop/say ◄─────┘
```

La página nunca habla con el juego directamente: lee el JSON y, si tiene la clave, manda órdenes al puente.

## Integrar en otra web sin tocar su código

Con un iframe basta:

```html
<iframe src="https://adriyache32.github.io/dondefelipe/minecraft-test1/embed.html"
        title="Estado del server de Minecraft"
        style="width:100%;height:380px;border:0;background:transparent"></iframe>
```

Para controlarla desde fuera (encender, apagar, reiniciar, escribir en el chat) usa `integracion/bridge.js`:

```html
<script src="integracion/bridge.js"></script>
<script>
  const mc = MCTest1.mount(document.querySelector("#hueco"), {
    src: "https://adriyache32.github.io/dondefelipe/minecraft-test1/embed.html",
    onState: (s) => console.log(s.online, s.count, s.hours)
  });
  mc.config("https://tu-tunel.playit.gg", "clave-del-puente");
  mc.start();
</script>
```

## Botón flotante (sin tocar el diseño de la página)

```html
<script src="integracion/boton.js"
        data-widget=".../minecraft-test1/embed.html"></script>
```

Añade un botón abajo a la derecha con el estado del server y una ventana con el widget. Admite `data-bridge` y `data-key` para control. Se repone solo si la página se redibuja.

## Protocolo entre páginas (postMessage)

Del widget hacia la página que lo incrusta:

```js
{ source: "mc-test1", type: "ready" }
{ source: "mc-test1", type: "state", payload: { online, players, count, max, hours, sessions, address, version, updated } }
{ source: "mc-test1", type: "height", height: 340 }
{ source: "mc-test1", type: "ack", action: "start", ok: true }
```

De la página hacia el widget:

```js
{ target: "mc-test1", type: "config", bridge: "https://...", key: "..." }
{ target: "mc-test1", type: "action", action: "start" | "stop" | "restart" | "say", value: "texto" }
```

## Local

```bash
python3 checker/check.py
python3 bridge/agent.py
python3 -m http.server 8099   # http://localhost:8099/minecraft-test1/
```

Claves: `~/.config/mc-test1-api.key` (puente) y `~/.config/mc-test1-rcon.key` (RCON). El puente escucha solo en `127.0.0.1:8090`.
