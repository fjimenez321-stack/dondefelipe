"""Convierte una imagen 'tipo pixel art' (cualquier tamaño) en una textura de 16 × 16 nítida y repetible.
uso: python3 a16.py entrada.png salida.png [celdas_detectadas]"""
import sys, numpy as np
from PIL import Image
ent, sal = sys.argv[1], sys.argv[2]
im = np.array(Image.open(ent).convert('RGB')).astype(float); H, W, _ = im.shape
def celdas():
    d = np.abs(np.diff(im.mean(2), axis=1)).mean(0); mejor = (0, 16)
    for n in range(8, 129):
        cs = W / n; idx = [min(W - 2, max(0, int(round(i * cs)) - 1)) for i in range(1, n)]
        v = d[idx].mean() / (d.mean() + 1e-6) - 0.004 * n
        if v > mejor[0]: mejor = (v, n)
    return mejor[1]
n = int(sys.argv[3]) if len(sys.argv) > 3 else celdas()
# 1) muestrear el centro de cada celda (evita los bordes difusos de la IA)
cs = W / n
g = np.array([[im[int((j + .5) * cs - cs * .25):int((j + .5) * cs + cs * .25), int((i + .5) * cs - cs * .25):int((i + .5) * cs + cs * .25)].reshape(-1, 3).mean(0) for i in range(n)] for j in range(n)])
# 2) llevar a 16 × 16 promediando bloques
k = n // 16 if n >= 16 else 1
g16 = g[:k * 16, :k * 16].reshape(16, k, 16, k, 3).mean((1, 3)) if n >= 16 else np.array(Image.fromarray(g.astype(np.uint8)).resize((16, 16), Image.NEAREST)).astype(float)
# 3) reducir a ≤ 8 colores (k-medias simple) para que quede nítida
px = g16.reshape(-1, 3); rng = np.random.default_rng(0); c = px[rng.choice(len(px), 8, replace=False)]
for _ in range(30):
    a = ((px[:, None] - c[None]) ** 2).sum(2).argmin(1)
    c = np.array([px[a == i].mean(0) if (a == i).any() else c[i] for i in range(len(c))])
out = c[a].reshape(16, 16, 3).round().astype(np.uint8)
Image.fromarray(out).save(sal)
costura = (np.abs(out[0].astype(int) - out[-1]).mean() + np.abs(out[:, 0].astype(int) - out[:, -1]).mean()) / 2
interior = np.abs(np.diff(out.astype(int), axis=0)).mean()
print(f'celdas detectadas: {n} · bloques {k}×{k} · costura {costura:.1f} vs interior {interior:.1f}')
