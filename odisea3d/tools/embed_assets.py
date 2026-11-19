#!/usr/bin/env python3
"""Incrusta los .glb de assets/ en js/assets_embed.js (base64).
Sirve para abrir el juego con doble clic (sin servidor): si la descarga del .glb falla,
assets.js usa esta copia. Ejecutar tras cambiar un asset:  python3 tools/embed_assets.py"""
import base64, os, json
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = {"meteoroide": "assets/meteoroide_rocoso.glb"}   # mismo nombre que en el manifiesto de assets.js
d = {k: base64.b64encode(open(os.path.join(RAIZ, v), "rb").read()).decode() for k, v in ASSETS.items()}
open(os.path.join(RAIZ, "js", "assets_embed.js"), "w").write("window.OC3 = window.OC3 || {};\nOC3.GLB64 = " + json.dumps(d) + ";\n")
print("ok:", {k: len(v) for k, v in d.items()})
