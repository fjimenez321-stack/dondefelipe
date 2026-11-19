"""Generador procedural de barril de combustible para videojuego.
Requiere: pip install trimesh numpy
Ejecutar: python crear_barril_combustible.py
"""
import numpy as np
import trimesh
from pathlib import Path

OUT = Path(__file__).resolve().parent
N = 64

# Paleta: barril industrial azul petróleo, acero y detalles de seguridad.
BLUE = np.array([34, 78, 105, 255], dtype=np.uint8)
BLUE_DARK = np.array([19, 49, 69, 255], dtype=np.uint8)
STEEL = np.array([115, 128, 137, 255], dtype=np.uint8)
DARK = np.array([25, 31, 35, 255], dtype=np.uint8)
YELLOW = np.array([235, 173, 35, 255], dtype=np.uint8)

parts = []

def lathe(name, profile, color, segments=N, noise=0.0, caps=False):
    """Revolve (radius,z) profile around Z axis; profile can be closed for bands."""
    verts=[]; faces=[]
    rng=np.random.default_rng(12)
    for j,(r,z) in enumerate(profile):
        for i in range(segments):
            a=2*np.pi*i/segments
            rr=r*(1.0 + (rng.normal(0,noise) if noise else 0.0))
            verts.append([rr*np.cos(a), rr*np.sin(a), z])
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*segments+i; b=j*segments+(i+1)%segments
            c=(j+1)*segments+(i+1)%segments; d=(j+1)*segments+i
            faces.extend([[a,b,c],[a,c,d]])
    mesh=trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces), process=True)
    rgba=np.tile(np.array(color,dtype=np.uint8),(len(mesh.vertices),1))
    if name=='barrel_body':
        # Subtle painted-metal tonal variation and faint vertical wear.
        for k,v in enumerate(mesh.vertices):
            ang=np.arctan2(v[1],v[0]); z=v[2]
            variation=int(7*np.sin(ang*13)+4*np.sin(z*19+ang*3))
            rgba[k,:3]=np.clip(rgba[k,:3].astype(int)+variation,0,255)
    mesh.visual.vertex_colors=rgba
    mesh.metadata['name']=name
    parts.append(mesh)
    return mesh

# Main shell: softly bulged steel drum, closed profile.
body_profile=[(0.48,0.10),(0.50,0.14),(0.525,0.28),(0.545,0.55),(0.55,0.92),(0.545,1.28),(0.525,1.55),(0.50,1.69),(0.48,1.72)]
lathe('barrel_body',body_profile,BLUE,noise=0.0015)

# Rolled top and bottom lips, plus two raised reinforcing hoops.
for name,z,r in [('bottom_rim',0.12,0.505),('top_rim',1.68,0.505),('lower_hoop',0.43,0.542),('upper_hoop',1.35,0.542)]:
    p=[(r-0.018,z-0.035),(r+0.006,z-0.025),(r+0.012,z),(r+0.006,z+0.025),(r-0.018,z+0.035)]
    lathe(name,p,STEEL)

# Top disk and inset circular lid.
lathe('top_lid',[(0.475,1.715),(0.475,1.735),(0.03,1.735),(0.03,1.715)],BLUE_DARK)
lathe('lid_center',[(0.34,1.739),(0.34,1.748),(0.03,1.748),(0.03,1.739)],BLUE)

# Two raised bung caps on top, each with a small grip bar.
for x,y,r in [(-0.20,0.12,0.075),(0.19,-0.12,0.055)]:
    # Cylinders are centered by default; position them on top of lid.
    cap=trimesh.creation.cylinder(radius=r,height=0.035,sections=32)
    cap.apply_translation([x,y,1.765])
    cap.visual.vertex_colors=np.tile(STEEL,(len(cap.vertices),1))
    cap.metadata['name']='filler_cap'; parts.append(cap)
    bar=trimesh.creation.box(extents=[r*1.5,0.018,0.012])
    bar.apply_translation([x,y,1.788])
    bar.visual.vertex_colors=np.tile(DARK,(len(bar.vertices),1))
    bar.metadata['name']='cap_grip'; parts.append(bar)

# Small safety stripe bands near the upper and lower sections.
for z in [0.62,0.68]:
    lathe('safety_stripe',[(0.548,z),(0.552,z+0.012)],YELLOW)

# Front label plate: a slim raised panel facing +Y.
plate=trimesh.creation.box(extents=[0.48,0.018,0.34])
plate.apply_translation([0,0.548,0.91])
plate.visual.vertex_colors=np.tile(BLUE_DARK,(len(plate.vertices),1))
plate.metadata['name']='front_label_plate'; parts.append(plate)
# Hazard symbol as a simple raised yellow diamond and dark center mark.
diamond=trimesh.creation.box(extents=[0.13,0.012,0.13])
diamond.apply_transform(trimesh.transformations.rotation_matrix(np.pi/4,[0,1,0]))
diamond.apply_translation([0,0.562,0.91])
diamond.visual.vertex_colors=np.tile(YELLOW,(len(diamond.vertices),1))
diamond.metadata['name']='hazard_diamond'; parts.append(diamond)

# Scene centered horizontally; ground pivot at bottom. Apply consistent PBR-ish metallic material per vertex colors.
scene=trimesh.Scene()
for i,m in enumerate(parts):
    scene.add_geometry(m, node_name=f"{m.metadata.get('name','part')}_{i}", geom_name=m.metadata.get('name','part'))

# Export GLB scene and a combined OBJ for broad compatibility.
glb=OUT/'barril_combustible.glb'
scene.export(glb)
combined=trimesh.util.concatenate(parts)
combined.export(OUT/'barril_combustible.obj')

# A compact developer note.
(OUT/'LEEME_barril.txt').write_text('''BARRIL DE COMBUSTIBLE — ASSET 3D v1.0\n\nArchivos:\n- barril_combustible.glb: escena 3D con piezas separadas por nombre. Recomendado para Unity, Godot y Unreal.\n- barril_combustible.obj: malla combinada de compatibilidad.\n- crear_barril_combustible.py: generador procedural editable (requiere trimesh y numpy).\n\nDiseño: tambor industrial de acero pintado azul petróleo, aros metálicos, tapas superiores, tapones de llenado y franja de seguridad amarilla. El pivote está en el centro del eje, a nivel del suelo.\n\nUso recomendado en juego:\n- Reutilizar una sola malla como instancias.\n- Rotar libremente en X/Y/Z y variar escala (por ejemplo 0.7–1.4).\n- Cambiar iluminación desde el motor del juego; el asset no contiene luces ni sombras horneadas.\n- Para distancia, usar LOD del motor o reducir detalle según la cámara.\n\nNota: el GLB contiene geometría y colores de vértice; el desarrollador puede sustituirlos por materiales PBR y añadir mapas de roughness/metallic/normal.\n''',encoding='utf-8')

print('GLB',glb.stat().st_size,'bytes')
print('OBJ',(OUT/'barril_combustible.obj').stat().st_size,'bytes')
print('parts',len(parts),'vertices',len(combined.vertices),'faces',len(combined.faces))
