#!/usr/bin/env python3
"""Incrusta assets en js/assets_embed.js (base64): el GLB del meteoroide y las imágenes de Alex (img/).
Sirve para abrir el juego con doble clic (sin servidor). Ejecutar tras cambiar un asset:
    python3 tools/embed_assets.py"""
import base64, os, json
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GLB = {"meteoroide": "assets/meteoroide_rocoso.glb", "combustible": "assets/barril_combustible.glb",
       "nave": "assets/nave/nave_base.glb", "propulsor": "assets/nave/propulsor.glb", "tanque": "assets/nave/tanque.glb"}            # mismo nombre que en el manifiesto de assets.js
IMG = {n: "img/" + n + (".jpg" if n.startswith("alex_p_") else ".png") for n in
       ["alex_idle", "alex_idle2", "alex_habla", "alex_onda", "alex_p_calma", "alex_p_enojo", "alex_p_grita", "alex_p_sonrie"]}
def b64(r): return base64.b64encode(open(os.path.join(RAIZ, r), "rb").read()).decode()
glb = {k: b64(v) for k, v in GLB.items()}
img = {k: "data:" + ("image/jpeg" if v.endswith(".jpg") else "image/png") + ";base64," + b64(v) for k, v in IMG.items()}
open(os.path.join(RAIZ, "js", "assets_embed.js"), "w").write("window.OC3 = window.OC3 || {};\nOC3.GLB64 = " + json.dumps(glb) + ";\nOC3.IMG64 = " + json.dumps(img) + ";\n")
print("ok:", {k: len(v) for k, v in glb.items()}, {k: len(v) for k, v in img.items()})
