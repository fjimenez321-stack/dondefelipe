#!/usr/bin/env python3
"""
Extrae el código de profe-rpg-v4.html y lo reparte en archivos por sistema
dentro de san-agustin-rpg/v4/. El motor nuevo (js/motor) reemplaza al núcleo
del v4: bucle, cámara, movimiento, controles y dibujo del héroe.

Uso (desde la raíz del repo):
    python3 san-agustin-rpg/herramientas/extraer_v4.py

Es repetible: si se corrige algo en el v4, se vuelve a correr. Los parches
que se aplican están todos en PARCHES (abajo), cada uno con su motivo.
Los archivos generados empiezan con un aviso "GENERADO".
"""
import json, re, pathlib, sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
ORIGEN = RAIZ / 'profe-rpg-v4.html'
DESTINO = RAIZ / 'san-agustin-rpg' / 'v4'

lineas = ORIGEN.read_text(encoding='utf8').split('\n')
def L(a, b):
    """Líneas a..b (1-indexadas, inclusivas) del v4."""
    return '\n'.join(lineas[a - 1:b])

def buscar(texto, desde=1):
    for i in range(desde - 1, len(lineas)):
        if texto in lineas[i]:
            return i + 1
    sys.exit(f'No se encontró: {texto!r}')

# ── Marcas para no depender de números de línea fijos ──────────────────────
INI_CSS = buscar('<style>') + 1
FIN_CSS = buscar('</style>') - 1
INI_JS = buscar('// ═══ DOM CACHE ═══')
FIN_JS = buscar('</script>', INI_JS) - 1
n = lambda t, d=INI_JS: buscar(t, d)

S_MAPAS = n('// ═══ MAPAS ═══')
S_FRASES = n('// ═══ FRASES ═══')
S_DIBUJO = n('// ═══ DIBUJO ═══')
S_DRAWMAP = n('function drawMap(){')
S_UI = n('// ═══ UI ═══')
S_BATALLA = n('// ═══ BATALLA ═══')
S_SHOP = n('// ═══ SHOP ═══')
S_DIALOGO = n('// ═══ DIÁLOGO ═══')
S_INTERACT = n("const DIRS={up:[0,-1]")
S_INV = n('// ═══ INVENTARIO ═══')
S_CONTROLES = n('// ═══ CONTROLES ═══')
S_LOOP = n('// ═══ LOOP ═══')
S_FN_LOOP = n('function loop(){')
S_LVL = n('let _lvlConfRAF=null;')
S_LAB = n('const LAB_MODES={') - 3
S_MUSICA = n('// MOTOR DE MÚSICA MEDIEVAL') - 1
S_COVID = n('// SISTEMA SARS-CoV-2') - 1
S_ANTI = n('// ACTIVIDAD: 10 MÉTODOS ANTICONCEPTIVOS') - 1
S_HEROE = n('// HÉROE — Profe Felipe') - 1
S_TILECACHE = n('// TILECACHE') - 1
S_INICIO = n('// Clear initial static text from overlays')

# Archivo → rango de líneas. Lo que NO aparece aquí queda fuera a propósito:
#   drawMap (lo reemplaza v4/puente.js), CONTROLES + táctil (los reemplaza
#   js/motor/entrada.js), loop() (lo reemplaza el bucle del motor) y el
#   arranque/registro (lo reemplaza js/main.js).
PARTES = [
    ('01-estado.js',       'DOM, estado del jugador, progreso',            INI_JS, S_MAPAS - 1),
    ('02-mapas.js',        'Los 28 mapas, transitionTo',                   S_MAPAS, S_FRASES - 1),
    ('03-datos.js',        'Frases, monedas azules, enemigos, equipo, kiosco', S_FRASES, S_DIBUJO - 1),
    ('04-dibujo-mapas.js', 'Dibujo de cada mapa (tiles y capas)',          S_DIBUJO, S_DRAWMAP - 1),
    ('05-interfaz.js',     'HUD, teclado de Jeanette, pantalla del 7',     S_UI, S_BATALLA - 1),
    ('06-batalla.js',      'Combate por turnos',                           S_BATALLA, S_SHOP - 1),
    ('07-tiendas-zoo.js',  'Tiendas, quiz de biología, BuinZoo, artesanos', S_SHOP, S_DIALOGO - 1),
    ('08-npc.js',          'Diálogo base, volver, libros, NPC_ACT',        S_DIALOGO, S_INTERACT - 1),
    ('09-salidas.js',      'interact(), salidas entre mapas, pasos',       S_INTERACT, S_INV - 1),
    ('10-inventario.js',   'Mochila',                                      S_INV, S_CONTROLES - 1),
    ('11-extras.js',       'Alex (canvas), nivel, reloj, memorice, misiones, stats', S_LOOP, S_FN_LOOP - 1),
    ('11-extras.js',       None,                                           S_LVL, S_LAB - 1),
    ('12-oficios.js',      'Laboratorio, carpintería, metalurgia, minas',  S_LAB, S_MUSICA - 1),
    ('13-musica.js',       'Música medieval procedural',                   S_MUSICA, S_COVID - 1),
    ('14-covid.js',        'Modelo SIR COVID, farmacia, letreros',         S_COVID, S_ANTI - 1),
    ('15-anticonceptivos.js', 'Actividad de los 10 métodos',               S_ANTI, S_HEROE - 1),
    ('16-sprites.js',      'Héroe y terreno medieval',                     S_HEROE, S_TILECACHE - 1),
    ('17-sistema.js',      'Admin, ajustes, Firebase, ranking, metro, guardado', S_TILECACHE, S_INICIO - 1),
]

# Parches: (archivo, buscar, reemplazar, motivo)
PARCHES = [
    ('01-estado.js',
     "const canvas=_('gameCanvas'),ctx=canvas.getContext('2d'),TS=40;",
     "let canvas={width:400,height:400},ctx=null;const TS=40;let VW=10,VH=10; // el motor asigna ctx/canvas/VW/VH al dibujar",
     'El canvas y la vista los maneja el motor nuevo (pantalla completa, no 400×400).'),
    ('02-mapas.js',
     "  setTimeout(()=>{ const msg=COVID_ENTRY_MSGS[currentMap];",
     "  window.__v4Transicion?.(id,tx,ty); // avisa al motor nuevo\n  setTimeout(()=>{ const msg=COVID_ENTRY_MSGS[currentMap];",
     'Cada cambio de mapa del v4 pasa por el motor (fundido, NPC, cámara).'),
    ('17-sistema.js',
     "  if(!progress.questLog) progress.questLog={};\n  syncUI(); updateCamera();",
     "  if(!progress.questLog) progress.questLog={};\n  syncUI(); updateCamera();\n  window.__v4Cargado?.(); // el motor carga el mapa guardado",
     'Al cargar partida, el motor se ubica en el mapa y posición guardados.'),
]
# Reemplazos en TODO el archivo (no solo la primera vez): (archivo, buscar, reemplazar, motivo)
REEMPLAZOS = [
    ('06-batalla.js', "typeMsg('¿Qué hará Profe Felipe?',showBact)",
     "typeMsg('¿Qué hará '+(window.__nombreProta||'Profe Felipe')+'?',showBact)",
     'En la historia el protagonista es un niño o niña: la batalla usa su nombre.'),
]
# Vista de 10×10 casillas fija → tamaño de la pantalla actual
VISTA = (r'for\(let r=0;r<10;r\+\+\) for\(let c=0;c<10;c\+\+\)', 'for(let r=0;r<VH;r++) for(let c=0;c<VW;c++)')

def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    for f in DESTINO.glob('[0-9][0-9]-*.js'):
        f.unlink()
    contenido, titulos = {}, {}
    for archivo, titulo, a, b in PARTES:
        contenido.setdefault(archivo, []).append(L(a, b))
        if titulo: titulos[archivo] = titulo
    for archivo, buscar_, reemplazo, _ in PARCHES:
        txt = '\n'.join(contenido[archivo])
        if buscar_ not in txt:
            sys.exit(f'Parche no aplicable en {archivo}: {buscar_[:60]!r}')
        contenido[archivo] = [txt.replace(buscar_, reemplazo, 1)]
    for archivo, buscar_, reemplazo, _ in REEMPLAZOS:
        txt = '\n'.join(contenido[archivo])
        if buscar_ not in txt:
            sys.exit(f'Reemplazo no aplicable en {archivo}: {buscar_[:60]!r}')
        contenido[archivo] = [txt.replace(buscar_, reemplazo)]
    total = 0
    for archivo, partes in contenido.items():
        txt = '\n'.join(partes)
        txt, k = re.subn(VISTA[0], VISTA[1], txt)
        cab = (f'// GENERADO por herramientas/extraer_v4.py desde profe-rpg-v4.html — {titulos[archivo]}\n'
               f'// No editar a mano: corregir en el v4 o en los PARCHES del script y volver a generar.\n'
               f'// Script clásico (no módulo): comparte variables globales con los demás archivos de v4/.\n')
        (DESTINO / archivo).write_text(cab + txt + '\n', encoding='utf8')
        total += txt.count('\n') + 1
        print(f'  {archivo:24s} {txt.count(chr(10)) + 1:5d} líneas' + (f'  (vista ajustada ×{k})' if k else ''))

    # ── drawMap() partido en dos capas: FONDO (bajo los personajes) y FRENTE (encima) ──
    dm = L(S_DRAWMAP, S_UI - 1).split('\n')
    cuerpo = dm[1:]
    while cuerpo and cuerpo[-1].strip() in ('', '}'):
        cuerpo.pop()
    corte = next(i for i, l in enumerate(cuerpo) if l.strip().startswith('const psx=(player.x-camera.x)*TS'))
    fondo, frente = cuerpo[:corte], cuerpo[corte:]
    quitar = lambda ls, pats: [l for l in ls if not any(p in l for p in pats)]
    fondo = quitar(fondo, ['ctx.clearRect(0,0,canvas.width,canvas.height)', 'drawAntiHUD();', '// Mine proximity hint',
                           "if(['reserva','plaza','pasillo'].includes(currentMap)){const nm=MINES.find"])
    frente = quitar(frente, ['// Profe Felipe — héroe unificado', '{ const bob=Math.abs(Math.sin(tick*.12))*2.5;',
                             'drawHeroSprite(ctx, psx, psy, TS, bob, player.facing); }'])
    txt = ('// GENERADO por herramientas/extraer_v4.py — drawMap() del v4 partido en dos capas.\n'
           '// FONDO: tiles y capas del mapa.  FRENTE: noche, velas, letreros de salida, efectos.\n'
           '// El motor dibuja a los personajes ENTRE ambas capas (así la noche también los oscurece).\n'
           'function v4DibujarFondo(){\n' + '\n'.join(fondo) + '\n}\n'
           'function v4DibujarFrente(){\n' + '\n'.join(frente) + '\n}\n')
    txt = re.sub(r'for\(let r=0;r<10;r\+\+\) for\(let c=0;c<10;c\+\+\)', 'for(let r=0;r<VH;r++) for(let c=0;c<VW;c++)', txt)
    txt = txt.replace('camera.x+10', 'camera.x+VW').replace('camera.y+10', 'camera.y+VH')
    if '<10' in txt: sys.exit('Quedó una vista de 10 casillas en drawMap')
    (DESTINO / '18-dibujar-mapa.js').write_text(txt, encoding='utf8')
    print(f'  18-dibujar-mapa.js       fondo {len(fondo)} + frente {len(frente)} líneas')

    # ── CSS ──
    (DESTINO / 'estilos.css').write_text('/* GENERADO desde profe-rpg-v4.html — estilos de los paneles del v4 */\n'
                                         + L(INI_CSS, FIN_CSS) + '\n', encoding='utf8')

    # ── Paneles HTML (batalla, tienda, inventario, misiones, laboratorio...) ──
    cuerpo_ini = buscar('<body') + 1
    html = L(cuerpo_ini, INI_JS - 2) + '\n' + L(FIN_JS + 2, buscar('</body>') - 1)
    html = re.sub(r'<!-- PANTALLA DE REGISTRO -->.*?(?=<div id="ui-bar")', '', html, count=1, flags=re.S)  # el inicio lo hace js/main.js
    html = html.replace('<canvas id="gameCanvas" width="400" height="400"></canvas>', '')
    html = re.sub(r'<div id="ctrl">.*?</div>\s*</div>\s*<div id="ctrl-toggle-wrap">.*?</span></div>', '', html, count=1, flags=re.S)
    html = html.replace('<script>', '').replace('</script>', '')
    (DESTINO / '00-paneles.js').write_text(
        '// GENERADO por herramientas/extraer_v4.py — paneles HTML del v4 (se insertan antes que el resto)\n'
        f'document.body.insertAdjacentHTML("beforeend", {json.dumps(html, ensure_ascii=False)});\n',
        encoding='utf8')
    print(f'  00-paneles.js  ({len(html)} caracteres)   estilos.css')
    print(f'Total JS: {total} líneas')

if __name__ == '__main__':
    main()
