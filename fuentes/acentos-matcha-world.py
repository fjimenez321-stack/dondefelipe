# Agrega a Matcha World los acentos del español (á é í ó ú ñ ü ¿ ¡ °), que no trae: copia las marcas de Matcha Style (mismo autor)
# y arma las letras acentuadas. Uso: python3 acentos-matcha-world.py "Matcha World.ttf" "Matcha Style.ttf" matcha-world.woff2
import sys, copy
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent, GlyphCoordinates
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.pointPen import PointToSegmentPen
W = TTFont(sys.argv[1]); St = TTFont(sys.argv[2]); out = sys.argv[3]
gw, gs = W['glyf'], St['glyf']
hw, hs = W['hmtx'], St['hmtx']
order = W.getGlyphOrder()
def bbox(font, name):
    g = font['glyf'][name]; g.recalcBounds(font['glyf']); return g.xMin, g.yMin, g.xMax, g.yMax
def add(name, glyph, adv, lsb=0):
    if name not in order: order.append(name)
    gw.glyphs[name] = glyph; hw.metrics[name] = (adv, lsb)
# 1. copiar marcas de Matcha Style (mismo autor y 1000 UPM), un poco más gruesas
for n in ['acute', 'tilde', 'dieresis', 'degree', 'exclamdown', 'questiondown']:
    pen = TTGlyphPen(None)
    gs[n].draw(TransformPen(pen, (1.0, 0, 0, 1.0, 0, 0)), gs)
    add(n, pen.glyph(), hs[n][0], hs[n][1])
# 2. i sin punto: quitar el contorno más alto de la «i»
g = copy.deepcopy(gw['i']); g.expand(gw)
ends = list(g.endPtsOfContours); coords = list(g.coordinates); flags = list(g.flags)
cs = []; s0 = 0
for e in ends: cs.append((s0, e)); s0 = e + 1
alto = max(cs, key=lambda c: min(y for x, y in coords[c[0]:c[1] + 1]))
# los on-curve de contornos TrueType se marcan como 'qcurve' cuando les preceden off-curve
pen2 = TTGlyphPen(None); ppen2 = PointToSegmentPen(pen2)
for (a, b) in cs:
    if (a, b) == alto: continue
    pts = list(zip(coords[a:b + 1], flags[a:b + 1]))
    ppen2.beginPath()
    n = len(pts)
    for k, ((x, y), f) in enumerate(pts):
        if f & 1:
            prev_off = not (pts[k - 1][1] & 1)
            ppen2.addPoint((x, y), 'qcurve' if prev_off else 'line')
        else:
            ppen2.addPoint((x, y), None)
    ppen2.endPath()
add('dotlessi', pen2.glyph(), hw['i'][0], hw['i'][1])
# 3. compuestos: base + marca, centrada y sobre la letra
def comp(nombre, base, marca, uni, gap=50):
    bx0, by0, bx1, by1 = bbox(W, base); mx0, my0, mx1, my1 = bbox(W, marca)
    dx = round((bx0 + bx1) / 2 - (mx0 + mx1) / 2); dy = round(by1 + gap - my0)
    g = Glyph(); g.numberOfContours = -1; g.components = []
    for n, x, y in [(base, 0, 0), (marca, dx, dy)]:
        c = GlyphComponent(); c.glyphName = n; c.x = x; c.y = y; c.flags = 0; g.components.append(c)
    add(nombre, g, hw[base][0], hw[base][1]); return uni, nombre
mapa = {}
for b, u in [('a', 0xe1), ('e', 0xe9), ('o', 0xf3), ('u', 0xfa), ('A', 0xc1), ('E', 0xc9), ('I', 0xcd), ('O', 0xd3), ('U', 0xda)]:
    k, v = comp(b + 'acute', b, 'acute', u); mapa[k] = v
k, v = comp('iacute', 'dotlessi', 'acute', 0xed); mapa[k] = v
for b, u in [('n', 0xf1), ('N', 0xd1)]: k, v = comp(b + 'tilde', b, 'tilde', u); mapa[k] = v
for b, u in [('u', 0xfc), ('U', 0xdc)]: k, v = comp(b + 'dieresis', b, 'dieresis', u); mapa[k] = v
mapa.update({0xa1: 'exclamdown', 0xbf: 'questiondown', 0xb0: 'degree', 0xb4: 'acute', 0xa8: 'dieresis', 0x2dc: 'tilde', 0x131: 'dotlessi'})
W.setGlyphOrder(order)
for t in W['cmap'].tables:
    if t.isUnicode():
        for u, n in mapa.items():
            if t.format == 4 and u > 0xffff: continue
            t.cmap[u] = n
W['maxp'].numGlyphs = len(order)
if 'post' in W and W['post'].formatType == 2: W['post'].extraNames = []; W['post'].mapping = {}
W.flavor = 'woff2'; W.save(out)
print('ok', len(order))
