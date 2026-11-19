# Generador procedural del meteoroide
# Requiere: pip install numpy trimesh
# Ejecutar: python crear_meteoroide.py
import numpy as np, trimesh, json, os
from trimesh.visual.material import PBRMaterial

out='/mnt/data'
rng=np.random.default_rng(27)
base=trimesh.creation.icosphere(subdivisions=4, radius=1.0)
v=base.vertices.copy()
dirs=v/np.linalg.norm(v,axis=1)[:,None]
# Deterministic multi-scale rocky displacement
x,y,z=dirs.T
field=(0.055*np.sin(7*x+2*y)*np.cos(6*z-1.5*y)+
       0.035*np.sin(13*y+4*z)*np.cos(11*x)+
       0.018*np.sin(25*z+8*x)*np.cos(19*y))
# Crater basins with slightly raised rims
craters=[]
for i in range(18):
    c=rng.normal(size=3); c/=np.linalg.norm(c)
    ang=rng.uniform(0.10,0.30)
    depth=rng.uniform(0.025,0.085)
    craters.append((c,ang,depth))
for c,ang,depth in craters:
    dot=np.clip(dirs@c,-1,1)
    d=np.arccos(dot)
    basin=-depth*np.exp(-0.5*(d/(ang*0.58))**2)
    rim=depth*0.22*np.exp(-0.5*((d-ang)/(ang*0.16))**2)
    field += basin+rim
# A few broad angular protrusions
field += 0.035*np.maximum(0,np.sin(4*x+3*z)*np.cos(5*y))
radius=1.0+field
v=dirs*radius[:,None]
mesh=trimesh.Trimesh(vertices=v, faces=base.faces, process=True)
mesh.remove_unreferenced_vertices()
mesh.fix_normals()
# earthy charcoal/basalt vertex color variation
r=radius
rough=(r-r.min())/(r.max()-r.min()+1e-9)
noise=(np.sin(17*x+3*y)*np.cos(14*z)+1)/2
shade=np.clip(0.48+0.22*noise+0.18*rough,0,1)
colors=np.stack([62+48*shade, 58+42*shade, 52+35*shade],axis=1).astype(np.uint8)
# Add subtle warm mineral flecks based on high-frequency pattern
fleck=(np.sin(39*x+21*y+13*z)*np.cos(31*z-17*y)>0.78)
colors[fleck]=np.clip(colors[fleck].astype(int)+np.array([20,10,0]),0,255).astype(np.uint8)
mesh.visual.vertex_colors=np.column_stack([colors,np.full(len(colors),255,dtype=np.uint8)])
mesh.metadata['name']='Asteroide_Rocoso_Base'
mesh.metadata['description']='Procedural irregular rocky asteroid, centered pivot, PBR-ready vertex colors.'
# PBR material for engines that read material properties
mat=PBRMaterial(name='Basalto_Rocoso', baseColorFactor=[180,165,145,255], metallicFactor=0.05, roughnessFactor=0.92)
# export GLB preserving vertex colors
scene=trimesh.Scene()
scene.add_geometry(mesh, node_name='Asteroide_Rocoso', geom_name='Asteroide_Rocoso')
glb=scene.export(file_type='glb')
open(out+'/meteoroide_rocoso.glb','wb').write(glb)
# OBJ with vertex colors as alternate fallback
mesh.export(out+'/meteoroide_rocoso.obj')
# source script
src='''# Generador procedural del meteoroide\n# Requiere: pip install numpy trimesh\n# Ejecutar: python crear_meteoroide.py\n'''+open('/tmp/create_asteroid.py').read()
open(out+'/crear_meteoroide.py','w').write(src)
readme='''METEOROIDE ROCOSO — PAQUETE PARA DESARROLLO\n\nArchivos:\n- meteoroide_roca.glb: formato recomendado para importar en Godot, Unity o Unreal.\n- meteoroide_rocoso.obj: alternativa de compatibilidad; puede requerir reasignar material.\n- crear_meteoroide.py: generador procedural editable (requiere Python, numpy y trimesh).\n\nEspecificación:\n- Malla triangular irregular, aprox. 5.120 caras.\n- Pivot/origen centrado en el objeto.\n- Escala normalizada: diámetro aproximado de 2 unidades.\n- Colores de vértice en tonos basalto y minerales cálidos.\n- Sin animación ni luces horneadas: rotación, escala e iluminación quedan a cargo del motor del juego.\n\nUso recomendado:\n1. Importar el GLB al motor.\n2. Crear múltiples instancias del mismo recurso.\n3. Asignar rotaciones aleatorias en X/Y/Z y escalas distintas por instancia.\n4. Usar LOD del motor o versiones simplificadas si habrá muchos asteroides simultáneos.\n5. Configurar material con roughness alto (0,85–1,0) y metallic bajo (0–0,1).\n\nNota: el modelo es una reconstrucción procedural inspirada en la referencia visual, no una conversión pixel a pixel de la imagen.\n'''
open(out+'/LEEME_meteoroide.txt','w').write(readme)
# validation
loaded=trimesh.load(out+'/meteoroide_roca.glb',force='scene')
print('GLB bytes',os.path.getsize(out+'/meteoroide_roca.glb'))
print('vertices',len(mesh.vertices),'faces',len(mesh.faces),'bounds',mesh.bounds.tolist())
print('loaded geometry',list(loaded.geometry.keys()))
