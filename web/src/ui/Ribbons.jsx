import { useEffect, useRef } from 'react';
import { Renderer, Transform, Vec3, Color, Polyline } from 'ogl';

import './Ribbons.css';

// 鼠标拖尾彩带：全屏 fixed 覆盖层，pointer-events:none 不阻挡任何交互；
// 鼠标坐标改从 window 监听（容器本身不收事件）。
const Ribbons = ({
  colors = ['#00ff88'],
  baseSpring = 0.03,
  baseFriction = 0.9,
  baseThickness = 14,
  offsetFactor = 0.05,
  maxAge = 420,
  pointCount = 50,
  speedMultiplier = 0.6,
  enableFade = false,
  enableShaderEffect = true,
  effectAmplitude = 1.6,
  backgroundColor = [0, 0, 0, 0]
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 2, 2), alpha: true });
    const gl = renderer.gl;
    gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);

    gl.canvas.style.position = 'absolute';
    gl.canvas.style.top = '0';
    gl.canvas.style.left = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    const scene = new Transform();
    const lines = [];

    const vertex = `
      precision highp float;
      attribute vec3 position;
      attribute vec3 next;
      attribute vec3 prev;
      attribute vec2 uv;
      attribute float side;
      uniform vec2 uResolution;
      uniform float uDPR;
      uniform float uThickness;
      uniform float uTime;
      uniform float uEnableShaderEffect;
      uniform float uEffectAmplitude;
      varying vec2 vUV;
      vec4 getPosition() {
          vec4 current = vec4(position, 1.0);
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 nextScreen = next.xy * aspect;
          vec2 prevScreen = prev.xy * aspect;
          vec2 tangent = normalize(nextScreen - prevScreen);
          vec2 normal = vec2(-tangent.y, tangent.x);
          normal /= aspect;
          normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
          float dist = length(nextScreen - prevScreen);
          normal *= smoothstep(0.0, 0.02, dist);
          float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
          float pixelWidth = current.w * pixelWidthRatio;
          normal *= pixelWidth * uThickness;
          current.xy -= normal * side;
          if(uEnableShaderEffect > 0.5) {
            current.xy += normal * sin(uTime + current.x * 10.0) * uEffectAmplitude;
          }
          return current;
      }
      void main() {
          vUV = uv;
          gl_Position = getPosition();
      }
    `;

    const fragment = `
      precision highp float;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uEnableFade;
      varying vec2 vUV;
      void main() {
        float fadeFactor = 1.0;
        if(uEnableFade > 0.5) {
          fadeFactor = 1.0 - smoothstep(0.0, 1.0, vUV.y);
        }
        gl_FragColor = vec4(uColor, uOpacity * fadeFactor);
      }
    `;

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      lines.forEach(line => line.polyline.resize());
    }
    window.addEventListener('resize', resize);

    const center = (colors.length - 1) / 2;
    colors.forEach((color, index) => {
      const spring = baseSpring + (Math.random() - 0.5) * 0.05;
      const friction = baseFriction + (Math.random() - 0.5) * 0.05;
      const thickness = baseThickness + (Math.random() - 0.5) * 3;
      const mouseOffset = new Vec3(
        (index - center) * offsetFactor + (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.1,
        0
      );

      const line = { spring, friction, mouseVelocity: new Vec3(), mouseOffset };
      const count = pointCount;
      const points = [];
      for (let i = 0; i < count; i++) points.push(new Vec3());
      line.points = points;

      line.polyline = new Polyline(gl, {
        points,
        vertex,
        fragment,
        uniforms: {
          uColor: { value: new Color(color) },
          uThickness: { value: thickness },
          uOpacity: { value: 0.85 },
          uTime: { value: 0.0 },
          uEnableShaderEffect: { value: enableShaderEffect ? 1.0 : 0.0 },
          uEffectAmplitude: { value: effectAmplitude },
          uEnableFade: { value: enableFade ? 1.0 : 0.0 }
        }
      });
      line.polyline.mesh.setParent(scene);
      lines.push(line);
    });

    resize();

    const mouse = new Vec3(0, 0, 0);
    let lastX = -1;
    let lastY = -1;
    function updateMouse(clientX, clientY) {
      // 容器是全屏 fixed(0,0)，窗口坐标即容器内坐标
      const x = clientX;
      const y = clientY;
      if (lastX < 0) {
        // 首次：把整条彩带的头放到鼠标处，避免从 (0,0) 扫一条长线
        lines.forEach(line => line.points.forEach(pt => pt.set((x / window.innerWidth) * 2 - 1, (y / window.innerHeight) * -2 + 1, 0)));
      }
      lastX = x; lastY = y;
      mouse.set((x / window.innerWidth) * 2 - 1, (y / window.innerHeight) * -2 + 1, 0);
    }
    const onMouseMove = (e) => updateMouse(e.clientX, e.clientY);
    const onTouch = (e) => {
      if (e.touches && e.touches.length) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    const tmp = new Vec3();
    let frameId;
    let lastTime = performance.now();
    function update() {
      frameId = requestAnimationFrame(update);
      const currentTime = performance.now();
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      lines.forEach(line => {
        tmp.copy(mouse).add(line.mouseOffset).sub(line.points[0]).multiply(line.spring);
        line.mouseVelocity.add(tmp).multiply(line.friction);
        line.points[0].add(line.mouseVelocity);

        for (let i = 1; i < line.points.length; i++) {
          if (isFinite(maxAge) && maxAge > 0) {
            const segmentDelay = maxAge / (line.points.length - 1);
            const alpha = Math.min(1, (dt * speedMultiplier) / segmentDelay);
            line.points[i].lerp(line.points[i - 1], alpha);
          } else {
            line.points[i].lerp(line.points[i - 1], 0.9);
          }
        }
        if (line.polyline.mesh.program.uniforms.uTime) {
          line.polyline.mesh.program.uniforms.uTime.value = currentTime * 0.001;
        }
        line.polyline.updateGeometry();
      });

      renderer.render({ scene });
    }
    update();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      cancelAnimationFrame(frameId);
      if (gl.canvas && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    colors, baseSpring, baseFriction, baseThickness, offsetFactor,
    maxAge, pointCount, speedMultiplier, enableFade,
    enableShaderEffect, effectAmplitude, backgroundColor
  ]);

  return <div ref={containerRef} className="ribbons-container" aria-hidden="true" />;
};

export default Ribbons;
