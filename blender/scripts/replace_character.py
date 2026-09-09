"""Run with Blender --background blender/new.blend --python blender/scripts/replace_character.py."""
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[2]
if Path(bpy.data.filepath) != ROOT / 'blender/new.blend':
    bpy.ops.wm.open_mainfile(filepath=str(ROOT / 'blender/new.blend'))
scene = bpy.context.scene
# Keep the authored geometry, eye, stickers and focus anchors in world space.
objects = [o for o in scene.objects if o.type != 'CAMERA']
world = {o: o.matrix_world.copy() for o in objects}
for o in objects:
    o.parent = None
    o.matrix_world = world[o]
for o in list(scene.objects):
    if o.type == 'CAMERA':
        bpy.data.objects.remove(o, do_unlink=True)
# Load the original animated objects so Blender retains action-slot assignments.
with bpy.data.libraries.load(str(ROOT / 'blender/sen.blend'), link=False) as (src, dst):
    dst.objects = ['Camera', 'man']
camera, original = dst.objects
scene.collection.objects.link(camera)
scene.camera = camera
rig = bpy.data.objects.new('character-motion', None)
scene.collection.objects.link(rig)
rig.rotation_mode = original.rotation_mode
rig.animation_data_create()
rig.animation_data.action = original.animation_data.action
rig.animation_data.action_slot = original.animation_data.action_slot
for o in objects:
    o.parent = rig
    o.matrix_parent_inverse.identity()
    o.matrix_basis = world[o]
bpy.data.objects.remove(original, do_unlink=True)
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 350
scene.frame_set(1)
# Only linked scene objects are exported; unused original data is not included.
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'blender/new-animated.blend'))
# Resize only the web export; the saved Blender source keeps full-resolution images.
for image in bpy.data.images:
    width, height = image.size
    if max(width, height) > 2048:
        factor = 2048 / max(width, height)
        image.scale(round(width * factor), round(height * factor))
bpy.ops.export_scene.gltf(
    filepath=str(ROOT / 'web/public/models/me.glb'),
    export_format='GLB', export_cameras=True, export_extras=True,
    export_animations=True, export_animation_mode='ACTIONS',
    export_frame_range=True, export_force_sampling=True,
    export_apply=True, use_visible=True,
)
print('Exported character with restored camera and character animation.')
