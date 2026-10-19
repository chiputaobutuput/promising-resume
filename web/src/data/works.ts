export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup { heading: string; items: string[] }

export interface WorkSection {
  id: string
  no: string
  title: string
  metric: string
  metricLabel: string
  eyebrow: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

const zh: WorksLang = {
  title: '简历详情',
  closeLabel: '返回简历',
  openLabel: '查看详情',
  hint: '继续滚动 · 查看完整简历',
  awardsLabel: '荣誉',
  visitLabel: '访问项目',
  detailPlaceholder: '',
  phImageLabel: '',
  phButtonLabel: '',
  countLabel: (n) => `${n} 项内容`,
  sections: [
    {
      id: 'education', no: '01', title: '教育背景', tagline: '北京工业大学 · 南京工业大学',
      metric: '1 / 97', metricLabel: '本科综合排名', eyebrow: 'EDUCATION',
      items: [
        { name: '北京工业大学', meta: '硕士 · 保研', slug: 'bjut' },
        { name: '南京工业大学', meta: '本科 · 排名 1 / 97', slug: 'njtech' },
        { name: '荣誉、竞赛与英语', meta: '完整清单', slug: 'honors' },
      ],
      footer: '管理科学与工程 / 信息管理与信息系统',
    },
    {
      id: 'practice', no: '02', title: '实践经历', tagline: '产品运营实习 · 策略运营实习',
      metric: '100%', metricLabel: 'Prompt 回归评测分类准确率', eyebrow: 'WORK EXPERIENCE',
      items: [
        { name: '特斯联科技集团', meta: '2026.03 — 2026.07', slug: 'teslink' },
        { name: '北京猿力科技', meta: '2025.03 — 2025.06', slug: 'yuanli' },
      ],
      footer: '产品活动 / 功能迭代 / Prompt 评测 / 增长实验',
    },
    {
      id: 'project', no: '03', title: '项目经历', tagline: '健康错误信息三分类混合迁移学习',
      metric: '86.93%', metricLabel: '中文数据集 Macro-F1', eyebrow: 'RESEARCH PROJECT',
      items: [
        { name: '研究背景与方法', meta: '迁移学习框架', slug: 'misinformation-method' },
        { name: '实验设计与成果', meta: '8 种模型对比', slug: 'misinformation-result' },
      ],
      footer: 'SCI Q1 已录用 / 发明专利已受理',
    },
    {
      id: 'campus', no: '04', title: '校园经历', tagline: '内容运营 · 学生事务',
      metric: '2 万+', metricLabel: '任负责人期间公众号新增关注', eyebrow: 'CAMPUS EXPERIENCE',
      items: [
        { name: '就业办新媒体助理负责人', meta: '2021.01 — 2024.06', slug: 'career-media' },
        { name: '经管学院辅导员助理', meta: '2020.10 — 2024.06', slug: 'counselor-assistant' },
      ],
      footer: '内容制作 / 团队管理 / 就业信息与档案管理',
    },
    {
      id: 'skills', no: '05', title: '个人技能', tagline: '产品设计 · 策略分析 · AI 工具',
      metric: '3', metricLabel: '项交叉能力方向', eyebrow: 'SKILLS',
      items: [
        { name: '数据分析', meta: 'SQL · Python · R', slug: 'data-skills' },
        { name: '产品设计', meta: 'PRD · 原型 · 流程图', slug: 'product-skills' },
        { name: 'AI 工具', meta: '工作流 · Prompt 评测 · 原型', slug: 'ai-skills' },
      ],
      footer: '将产品判断、策略分析与 AI 工具结合',
    },
  ],
}

export const WORKS = { zh, en: zh }

export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((total, group) => total + group.items.length, 0)
  return 0
}
