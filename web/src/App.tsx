import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform, useInView, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import { useStore } from './store'
// @ts-ignore - JS 组件（React Bits Ribbons），无类型声明
import Ribbons from './ui/Ribbons'

function Backdrop() {
  // 点击空白处收起详情
  const setActive = useStore((s) => s.setActive)
  return (
    <mesh position={[0, 0, -40]} onClick={() => setActive(null)}>
      <planeGeometry args={[600, 300]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

type Lang = 'en' | 'zh'

const COPY = {
  zh: { title: '冯小叶', role: '产品 · 策略 · AI', paragraphs: ['北京工业大学管理科学与工程硕士研究生（保研）。', '具备智能硬件产品与策略运营实践经验，能够独立推进需求分析、PRD、原型、跨团队交付与效果验证，并将 A/B 实验和大模型评测用于产品决策。'] },
  en: { title: '冯小叶', role: '产品 · 策略 · AI', paragraphs: ['北京工业大学管理科学与工程硕士研究生（保研）。', '具备智能硬件产品与策略运营实践经验，能够独立推进需求分析、PRD、原型、跨团队交付与效果验证，并将 A/B 实验和大模型评测用于产品决策。'] },
}

// 终端风打字机：进入视口后逐字打出，末尾绿色光标块持续闪烁
function Typewriter({ text, start, speed = 34, delay = 500 }: { text: string; start: boolean; speed?: number; delay?: number }) {
  const [n, setN] = useState(0)
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!start) return
    const id = setTimeout(() => setArmed(true), delay)
    return () => clearTimeout(id)
  }, [start, delay])
  useEffect(() => {
    if (!armed) return
    if (n >= text.length) return
    const id = setTimeout(() => setN((v) => v + 1), speed)
    return () => clearTimeout(id)
  }, [armed, n, text, speed])
  if (!armed) return null
  return (
    <>
      <span className="tw-prefix" aria-hidden="true">&gt; </span>
      {text.slice(0, n)}
      <span className="tw-cursor" aria-hidden="true" />
    </>
  )
}

function Hero({ lang, cueOpacity }: { lang: Lang; cueOpacity: MotionValue<number> }) {
  const { title, role, paragraphs } = COPY[lang]
  const aboutRef = useRef(null)
  const inView = useInView(aboutRef, { once: true, margin: '0px 0px -10% 0px' })
  // 以整屏为滚动基准，避免首页文案高度变化导致首屏提前模糊。
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start start', 'end start'],
  })
  // 前半屏内逐渐淡出，继续沿用模糊与视差效果。
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // 视差：标题上升更快、字距随滚动拉开；正文上升慢一点
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -72])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -40])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['-0.055em', '0.04em'])
  return (
    <section className="hero" id="about" ref={aboutRef}>
      <motion.div
        className="about"
        lang={lang}
        style={{ filter: blur, opacity }}
      >
        {/* 入场动画放内层，避免其 fill 锁住 opacity 覆盖外层滚动 opacity */}
        <div className="about-intro">
          <motion.h1 className="about-title tv-title" style={{ y: titleY, letterSpacing: titleSpacing }} aria-label={title}>
            {title.split('').map((ch, i) => (
              <span className="tv-char" key={i} style={{ animationDelay: `${0.15 + i * 0.14}s` }} aria-hidden="true">
                {ch}
              </span>
            ))}
          </motion.h1>
          <motion.p className="about-role tv-role" style={{ y: bodyY }}>{role}</motion.p>
          {paragraphs.map((p, i) => (
            <motion.p key={i} className="about-body tv-body" style={{ y: bodyY }}>
              <Typewriter text={p} start={inView} speed={i === 0 ? 30 : 22} delay={i === 0 ? 500 : 1500} />
            </motion.p>
          ))}
          <motion.div className="hero-actions" style={{ y: bodyY }}>
            <a href="#journey">认识我的经历 <span aria-hidden="true">↓</span></a>
            <a href="mailto:957753596@qq.com">联系我 <span aria-hidden="true">↗</span></a>
          </motion.div>
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">{lang === 'en' ? 'SCROLL' : '向下滚动'}</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}

export default function App() {
  const lang: Lang = 'zh'
  const { scrollY } = useScroll()
  // 作品区蒙层：以作品区顶部从视口底进入到视口中部的进度，驱动 3D 渐暗 + 模糊
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(5, 8, 16, 0)', 'rgba(5, 8, 16, 0.46)']
  )
  // 滚动渐暗：离开首屏后压暗 3D 场景，保证履历文字可读
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  // 首屏滚动提示随之淡出
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // 首屏底部渐变底色：开始滑动后淡出
  // 磨砂右轨：进入履历区后淡入（首屏不磨砂）
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  // 首屏装饰画框/角标：滚动后淡出
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      {/* 加载遮罩：模型全部加载完成前覆盖全屏，完成后淡出 */}
      <LoadingScreen />

      {/* 鼠标彩带拖尾（全局固定层，不阻挡交互） */}
      <Ribbons colors={['#00ff88', '#4cc9f0']} baseThickness={13} maxAge={900} />

      {/* 固定的 3D 背景 */}
      <div className="scene-bg">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: false, alpha: true, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.toneMappingExposure = 1.05
          }}
        >
          <Suspense fallback={null}>
            <Backdrop />
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* 滚动渐暗蒙层 */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* 作品区固定蒙层：仅压暗（减半），模糊先注释掉 */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg }}
        aria-hidden="true"
      />

      {/* 固定磨砂右轨（进入履历区淡入） */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {/* 首屏装饰：发丝内框 + 四角定位标 + 角标元数据（随滚动淡出） */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl"><span className="hm-name">FENG XIAOYE</span></div>
        <div className="hero-meta hm-tr">Portfolio — 2026</div>
        <div className="hero-meta hm-bl">PRODUCT · STRATEGY · AI</div>
      </motion.div>

      {/* 全屏胶片噪点蒙层（multiply 混合） */}
      <NoiseOverlay />

      {/* 可滚动内容 */}
      <main className="content">
        <Hero lang={lang} cueOpacity={cueOpacity} />
        <Resume lang={lang} />
        <Works lang={lang} innerRef={worksRef} />
        <footer className="contact" id="contact">
          <p className="contact-eyebrow">LET’S CONNECT</p>
          <h2>寻找产品、策略与 AI 的更多可能。</h2>
          <p>如果您希望进一步了解我的经历与思考，欢迎与我联系。</p>
          <div className="contact-links"><a href="mailto:957753596@qq.com">957753596@qq.com ↗</a><a href="tel:15712902167">157 1290 2167 ↗</a></div>
          <div className="skill-list"><span>SQL · Python · R</span><span>Figma · Axure · 墨刀</span><span>Codex · Claude Code · Trae · Dify · Coze · FastGPT</span></div>
          <div className="contact-bottom"><span>© 2026 冯小叶</span><a href="#about">回到顶部 ↑</a></div>
        </footer>
      </main>
    </>
  )
}
