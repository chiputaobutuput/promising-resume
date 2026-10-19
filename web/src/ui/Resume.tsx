import { useState, type KeyboardEventHandler } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { FOCUS_POINTS } from '../data/focusPoints'
import SpotlightPanel from './SpotlightPanel'
// @ts-ignore - JS 组件（React Bits 改编），无类型声明
import BounceCards from './BounceCards'

interface Showcase {
  serial: string
  label: string
  images: string[]
}

interface ResumeEntry {
  period: string
  category: string
  place: string
  role: string
  points: ReactNode[]
  showcase?: Showcase
}

const BASE = import.meta.env.BASE_URL
const range = (n: number, make: (i: number) => string) => Array.from({ length: n }, (_, i) => make(i))

// 五段经历按开始时间排列，并依次对应模型中的五个滚动聚焦点。
const entries: ResumeEntry[] = [
  {
    period: '2020.09 — 2024.06',
    category: '教育背景',
    place: '南京工业大学',
    role: '信息管理与信息系统 · 本科',
    // 第 1 页是目录，只展示 cert-2 … cert-8 共 7 张
    showcase: {
      serial: 'FILE 02',
      label: '获奖证书',
      images: range(7, (i) => `${BASE}showcase/njtech-cert-${i + 2}.png`),
    },
    points: [
      <>GPA <strong>3.85 / 4.0</strong>，综合排名 <strong>1 / 97</strong>；主修商务数据管理、管理决策、数据可视化、Python、Java、SQL Server。</>,
      <>获<strong>校长奖学金</strong>、特等奖学金 <strong>3 次</strong>、一等奖学金 <strong>2 次</strong>、单项奖学金 <strong>1 次</strong>；并获美国大学生数学建模竞赛<strong>国家级特等奖</strong>、认证杯数学建模国际赛<strong>国家级一等奖</strong>、全国大学生市场营销与商业策划大赛<strong>国家级三等奖</strong>。</>,
      <>CET-4 <strong>564</strong>、CET-6 <strong>532</strong>，全国计算机等级考试二级通过。</>,
    ],
  },
  {
    period: '2024.09 — 2027.06',
    category: '教育背景',
    place: '北京工业大学',
    role: '管理科学与工程 · 硕士研究生（保研）',
    showcase: {
      serial: 'FILE 01',
      label: '学术成果',
      images: [
        `${BASE}showcase/bjtech-paper1.png`,
        `${BASE}showcase/bjtech-paper2.png`,
        `${BASE}showcase/bjtech-patent.png`,
      ],
    },
    points: [
      <>GPA <strong>3.93 / 4.0</strong>，研究方向连接管理决策、数据分析与人工智能。</>,
      <>专业课程包括<strong>深度学习及其应用、统计机器学习、大数据与人工智能、高级多元统计</strong>。</>,
      <>学术成果：<strong>SCI Q1 论文已见刊</strong>、<strong>SSCI Q2 论文已见刊</strong>、<strong>发明专利已受理</strong>。</>,
    ],
  },
  {
    period: '2025.03 — 2025.06',
    category: '实践经历',
    place: '北京猿力科技有限公司',
    role: '策略运营实习生',
    showcase: {
      serial: 'FILE 04',
      label: '斑马百科',
      // 显式排序：logo → 价格 → 赠品 → 抽奖（最后）
      images: [
        `${BASE}showcase/zebra-1.png`,
        `${BASE}showcase/zebra-2.png`,
        `${BASE}showcase/zebra-3.png`,
        `${BASE}showcase/zebra-4.png`,
      ],
    },
    points: [
      <>使用 Excel 搭建会员增长看板，拆解完整转化漏斗，建立周度监测与分环节归因机制。</>,
      <>主导两项 A/B 实验，推动首页资源位 CTR 提升 <strong>23%</strong>、试看结束引导页 CTR 提升 <strong>16%</strong>。</>,
      <>参与竞品调研、会员日策划与三周年大促，活动整体实现 <strong>1,000 万+ GMV</strong>。</>,
    ],
  },
  {
    period: '2026.03 — 2026.07',
    category: '实践经历',
    place: '特斯联科技集团有限公司',
    role: '产品运营实习生',
    showcase: {
      serial: 'FILE 03',
      label: 'BUTTONS',
      // 显式排序：QQ音乐 → 群组 → 翻译 → 官宣耳机
      images: [
        `${BASE}showcase/buttons-1.jpg`,
        `${BASE}showcase/buttons-2.jpg`,
        `${BASE}showcase/buttons-3.jpg`,
        `${BASE}showcase/buttons-4.jpg`,
      ],
    },
    points: [
      <>独立负责会员权益活动，推动大模型自动审核；两周内 <strong>300+ 台设备</strong>完成连续任务，新增关注 <strong>1,000+</strong>、收集有效建议 <strong>600+</strong>。</>,
      <>独立负责<strong>日程管理 3.0</strong>，完成需求拆解、PRD、交互原型、评审推进及联合验收。</>,
      <>搭建“离线评测—失败归因—Prompt 迭代—回归验证”流程，以 <strong>64 条金标评论</strong>和 <strong>12 类同传场景</strong>完成 <strong>408 次</strong>生成评测；修复后分类准确率由 <strong>96.88% 提升至 100%</strong>。</>,
    ],
  },
  {
    period: '2025.02 — 2026.05',
    category: '项目经历',
    place: '健康错误信息三分类研究',
    role: '核心开发者 · 独立完成模型设计、训练与评估',
    points: [
      <>构建“通用错误信息二分类预训练—健康错误信息三分类微调”的<strong>迁移学习框架</strong>。</>,
      <>融合 BERT、双尺度 TextCNN、TF-IDF 领域关键词及多种池化特征，并与 <strong>8 种模型</strong>进行对比。</>,
      <>中英文 Macro-F1 达 <strong>86.93% / 78.85%</strong>；SCI Q1 论文<strong>已录用</strong>，发明专利<strong>已受理</strong>。</>,
    ],
  },
]

// 按简历模块和倒序时间展示：教育 → 实践 → 项目。
const displayEntries = [entries[1], entries[0], entries[3], entries[2], entries[4]]

const EASE = [0.22, 1, 0.36, 1] as const
const containerV = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } } }
const itemV = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } }

// 档案展示卡：左侧悬浮，主图 + 下方扇形弹跳卡组（React Bits BounceCards 改编）。
// 点击卡组中任意卡片切换主图；不做自动轮播，所有切换由用户主导。
const fanTransforms = (n: number): string[] => {
  const cx = (n - 1) / 2
  const maxR = Math.max(cx, 1)
  const step = n <= 3 ? 74 : n <= 5 ? 58 : 46
  const rot = n <= 3 ? 14 : 11
  return Array.from({ length: n }, (_, i) => {
    const dx = i - cx
    return `rotate(${((-dx * rot) / maxR).toFixed(2)}deg) translate(${(dx * step).toFixed(1)}px)`
  })
}

function ShowcaseDeck({ serial, label, images }: Showcase) {
  const [active, setActive] = useState(0)
  const n = images.length

  const prev = () => setActive((a) => (a - 1 + n) % n)
  const next = () => setActive((a) => (a + 1) % n)
  const onKey: KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
  }

  return (
    <div className="tl-showcase" tabIndex={0} onKeyDown={onKey}>
      <div className="tl-showcase-frame tl-showcase-stage">
        <img src={images[active]} alt="" loading="lazy" className="tl-showcase-main" />
        <i className="tl-showcase-scan" aria-hidden="true" />
        <i className="tl-showcase-corner tl-showcase-corner--tl" aria-hidden="true" />
        <i className="tl-showcase-corner tl-showcase-corner--br" aria-hidden="true" />
        {n > 1 && (
          <>
            <button type="button" className="tl-showcase-nav tl-showcase-nav--prev" aria-label="上一张" onClick={prev}>‹</button>
            <button type="button" className="tl-showcase-nav tl-showcase-nav--next" aria-label="下一张" onClick={next}>›</button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="tl-showcase-fan" style={{ ['--bc-card-w' as string]: '56px' }}>
          <BounceCards
            className="tl-bounce-deck"
            images={images}
            containerWidth={280}
            containerHeight={104}
            transformStyles={fanTransforms(n)}
            enableHover
            selectedIdx={active}
            onSelect={setActive}
          />
        </div>
      )}
      <div className="tl-showcase-meta">
        <span className="tl-showcase-serial">{serial}</span>
        <span className="tl-showcase-label">{label}</span>
        <span className="tl-showcase-count">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>
    </div>
  )
}

export default function Resume({ lang }: { lang: 'en' | 'zh' }) {
  return (
    <section className="resume" id="journey" lang={lang}>
      <motion.h2 className="resume-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        个人简历
      </motion.h2>
      <div className="timeline">
        {displayEntries.map((entry, index) => (
          <motion.div className="tl-entry" data-point={FOCUS_POINTS[index]} key={`${entry.period}-${entry.place}`} variants={containerV} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-12% 0px -12% 0px' }}>
            <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
            {entry.showcase && <ShowcaseDeck {...entry.showcase} />}
            <SpotlightPanel className="tl-body" size={420} intensity={0.58} animate={false}>
              <motion.div className="tl-period" variants={itemV}>{entry.period}</motion.div>
              <motion.div className="tl-category" variants={itemV}>{entry.category}</motion.div>
              <motion.h3 className="tl-place" variants={itemV}>{entry.place}</motion.h3>
              <motion.div className="tl-role" variants={itemV}>{entry.role}</motion.div>
              <motion.ul className="tl-points" variants={itemV}>
                {entry.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
              </motion.ul>
            </SpotlightPanel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
