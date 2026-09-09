# 人物替换说明

网站已使用 `web/public/models/me.glb` 中的新人物。前端源码未修改。

- `new.blend`：用户原始文件，保留不变。
- `sen.blend`：原始场景，保留不变。
- `new-animated.blend`：新人物 + 原相机 CameraAction + 原人物 manAction；保留完整贴图，可继续编辑。
- `original-me.glb`：替换前的网站模型备份。
- `scripts/replace_character.py`：从 new.blend 与 sen.blend 重建上述动画版场景及网页模型。

在仓库根目录执行：

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b blender/new.blend --python blender/scripts/replace_character.py
```

脚本将新模型、眼睛、贴纸和对焦点以世界坐标挂到独立动画父对象下，避免原人物动画覆盖新模型的朝向和缩放。保留新模型的闭眼造型，独立眼睛 eye2 沿用网页的鼠标跟随效果。相机和人物两段动画的导出位移、旋转、缩放采样数值与原 GLB 一致。

网页贴图最长边限制为 2048 像素，完整分辨率仍保留在 new-animated.blend。网页模型约 13.2 MB。之后在 web 目录执行 npm run build 可生成部署目录 dist。

已检查首页、履历滚动近景及作品区转场；构建与类型检查通过。网站文字与个人资料仍为原项目内容。本次只替换本地人物资产，未发布线上网站。

## 2026-09 后续维护记录

- 眼球修复：原 glb 中 eye1.001 / eye2.001 / eye2.002 游离在根级、不跟随 man 的转身动画，另有旧眼睛残件错位。已在 new-replaced.blend 中将两只白眼球挂到 man 下（更名 eye1/eye2）并删除残件，重导出网页模型。
- 贴纸替换：删除原有 15 张无关贴纸，换为 5 张个人特色贴纸（ISTJ 性格卡片、健身、摄影、骑行、徒步），源图在 `sticker-src/`，均为挂到 man 下的透明平面（带自发光 0.35 保证暗部可读），位置已避开相机运动路径。
- 转身动画修复（重要约定）：new-replaced.blend 里 `manAction`（转身，97 个旋转关键帧，帧 250-346）必须以**激活动作**挂在 man 上（NLA 仓库轨道是静音的、不会导出）；`CameraAction` 全长 350 帧，导出前场景帧范围必须是 **1-350**（场景默认 1-250，会把相机动作截断 100 帧）。两个条件缺一个，网页端人物就不会随滚动转身。
- 模型 URL 带 `?v=20260909`（Scene.tsx useGLTF）用于更新后强制浏览器拉新模型；以后再替换 me.glb 时递增该版本号。
- 当前网页模型以 new-replaced.blend 为唯一上游源（16 节点，约 16 MB）。
