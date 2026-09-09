from pathlib import Path
import shutil
import bpy

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'blender/new-animated.blend'
BACKUP = ROOT / 'blender/new-animated-before-eye-redesign.blend'
WEB_GLB = ROOT / 'web/public/models/me.glb'

if Path(bpy.data.filepath) != SOURCE:
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE))

if not BACKUP.exists():
    shutil.copy2(SOURCE, BACKUP)

eye = bpy.data.objects.get('eye2')
if not eye:
    raise RuntimeError('Required animated eye object eye2 was not found')

# Seat the eyeball inside the socket and compress the laughing eye vertically.
# Absolute values make the script safe to run repeatedly.
eye.location = (0.1196, -0.2290, 0.4861)
eye.scale = (0.9700, 0.9000, 0.9400)

for name in ('FX_Iris_Rim', 'FX_Iris', 'FX_Iris_AmberDepth', 'FX_Iris_WarmLight', 'FX_Pupil', 'FX_Catchlight', 'FX_Catchlight_Small'):
    old = bpy.data.objects.get(name)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)

def material(name, color, roughness, specular=0.25, emission=None, emission_strength=0.0, coat=0.0):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next((node for node in mat.node_tree.nodes if node.type == 'BSDF_PRINCIPLED'), None)
    if bsdf is None:
        bsdf = mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        output = next((node for node in mat.node_tree.nodes if node.type == 'OUTPUT_MATERIAL'), None)
        if output:
            mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    spec = bsdf.inputs.get('Specular IOR Level')
    if spec:
        spec.default_value = specular
    ior = bsdf.inputs.get('IOR')
    if ior:
        ior.default_value = 1.18
    subsurface = bsdf.inputs.get('Subsurface Weight')
    if subsurface:
        subsurface.default_value = 0.0
    coat_socket = bsdf.inputs.get('Coat Weight')
    if coat_socket:
        coat_socket.default_value = coat
    if emission:
        emission_color = bsdf.inputs.get('Emission Color')
        emission_power = bsdf.inputs.get('Emission Strength')
        if emission_color:
            emission_color.default_value = (*emission, 1.0)
        if emission_power:
            emission_power.default_value = emission_strength
    return mat

rim_mat = material('FX Iris Rim', (0.014, 0.016, 0.020), 0.38, 0.24, coat=0.12)
iris_mat = material('FX Warm Brown Iris', (0.055, 0.065, 0.078), 0.34, 0.30, coat=0.18)
amber_mat = material('FX Amber Depth', (0.115, 0.132, 0.148), 0.36, 0.28, coat=0.16)
warm_light_mat = material('FX Honey Light', (0.20, 0.22, 0.235), 0.40, 0.24, coat=0.12)
pupil_mat = material('FX Soft Pupil', (0.004, 0.005, 0.007), 0.48, 0.16)
shine_mat = material('FX Catchlight', (0.88, 0.90, 0.92), 0.20, 0.38)

# Reduce the glass-marble look of the underlying sclera as well.
base_eye_mat = bpy.data.materials.get('Material.002')
if base_eye_mat and base_eye_mat.use_nodes:
    base_bsdf = next((node for node in base_eye_mat.node_tree.nodes if node.type == 'BSDF_PRINCIPLED'), None)
    if base_bsdf:
        if base_bsdf.inputs.get('IOR'):
            base_bsdf.inputs['IOR'].default_value = 1.18
        if base_bsdf.inputs.get('Roughness'):
            base_bsdf.inputs['Roughness'].default_value = 0.48
        if base_bsdf.inputs.get('Coat Weight'):
            base_bsdf.inputs['Coat Weight'].default_value = 0.06
        if base_bsdf.inputs.get('Subsurface Weight'):
            base_bsdf.inputs['Subsurface Weight'].default_value = 0.0

# Lift the gray sclera toward a warm off-white while preserving the black eyelash pixels.
eye_image = bpy.data.images.get('eye')
if eye_image:
    pixels = list(eye_image.pixels)
    for i in range(0, len(pixels), 4):
        r, g, b = pixels[i], pixels[i + 1], pixels[i + 2]
        luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if luminance > 0.22:
            lift = 0.92 + min(0.07, luminance * 0.07)
            pixels[i] = min(1.0, lift)
            pixels[i + 1] = min(1.0, lift * 0.985)
            pixels[i + 2] = min(1.0, lift * 0.955)
    eye_image.pixels[:] = pixels
    eye_image.pack()

def add_layer(name, location, scale, mat, segments=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.parent = eye
    obj.location = location
    obj.rotation_euler = (0, 0, 0)
    obj.scale = scale
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj

# eye2 is rotated about 90 degrees on X; its local +Z points toward the face camera.
# Four shallow spherical layers keep a soft cartoon profile and inherit every eye2 rotation.
add_layer('FX_Iris_Rim', (0.0, 0.0, 0.0430), (0.0345, 0.0275, 0.0062), rim_mat)
add_layer('FX_Iris', (0.0, 0.0, 0.0480), (0.0310, 0.0245, 0.0048), iris_mat)
add_layer('FX_Iris_AmberDepth', (0.0, 0.0, 0.0510), (0.0255, 0.0198, 0.0038), amber_mat)
# A restrained lower graphite lobe softens the flat color without creating a glowing effect.
add_layer('FX_Iris_WarmLight', (0.0, -0.0080, 0.0530), (0.0205, 0.0100, 0.0027), warm_light_mat, 48, 24)
add_layer('FX_Pupil', (0.0, 0.0, 0.0545), (0.0148, 0.0122, 0.0032), pupil_mat, 48, 24)
add_layer('FX_Catchlight', (-0.0075, 0.0085, 0.0570), (0.0047, 0.0042, 0.0019), shine_mat, 40, 20)
# Keep the secondary highlight extremely small, like a soft reflected pin light.
add_layer('FX_Catchlight_Small', (0.0085, 0.0025, 0.0572), (0.0018, 0.0014, 0.0011), shine_mat, 24, 12)

bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE))

# Keep the Blender source at full resolution; resize only images used in the web export.
for image in bpy.data.images:
    width, height = image.size
    if max(width, height) > 2048:
        factor = 2048 / max(width, height)
        image.scale(round(width * factor), round(height * factor))

bpy.ops.export_scene.gltf(
    filepath=str(WEB_GLB),
    export_format='GLB',
    export_cameras=True,
    export_extras=True,
    export_animations=True,
    export_animation_mode='ACTIONS',
    export_frame_range=True,
    export_force_sampling=True,
    export_apply=True,
    use_visible=True,
)
print('Redesigned eye saved and web GLB exported:', WEB_GLB)
