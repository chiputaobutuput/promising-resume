import { useId, useState, type Ref } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { WORKS, type WorkListItem, type WorkSection, type WorksLang } from '../data/works'
import { getWorkDoc } from '../data/workDocs'
import SpotlightPanel from './SpotlightPanel'

const EASE = [0.22, 1, 0.36, 1]

// 简历详情行：在当前卡片内展开，便于面试官连续浏览和收起比较。
function WorkLine({ item }: { item: WorkListItem }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const doc = getWorkDoc(item.slug)
  const hasMeta = item.meta || (item.tags && item.tags.length)
  return (
    <li className="wk-line">
      <button className="wk-line-btn" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={panelId}>
        <span className="wk-line-name">{item.name}</span>
        {hasMeta && (
          <span className="wk-line-meta">
            {item.meta && <span className="wk-line-num">{item.meta}</span>}
            {item.tags &&
              item.tags.map((t, i) => (
                <span key={i} className="wk-line-tag">
                  {t}
                </span>
              ))}
            <span className="wk-line-toggle" aria-hidden="true">{open ? '−' : '+'}</span>
          </span>
        )}
        {!hasMeta && <span className="wk-line-toggle" aria-hidden="true">{open ? '−' : '+'}</span>}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className="wk-inline-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: EASE }}
          >
            <div className="wk-inline-detail-inner">
              {doc?.role && <p className="wk-inline-role">{doc.role}</p>}
              {doc?.tags && <div className="wk-detail-tags">{doc.tags.map((tag) => <span className="wk-badge" key={tag}>{tag}</span>)}</div>}
              {doc?.body ? (
                <div className="wk-md"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{doc.body}</ReactMarkdown></div>
              ) : <p className="wk-detail-desc">相关内容将持续补充。</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

// 一张全高板块卡：左侧整高配图，右侧文字（编号 + 标题 + 清单）
function SectionCard({
  section,
  data,
  index,
}: {
  section: WorkSection
  data: WorksLang
  index: number
}) {
  return (
    <SpotlightPanel className="wk-card" size={560} intensity={0.48} delay={Math.min(index * 0.06, 0.24)}>
      <div className="wk-card-head">
        <span className="wk-card-no">{section.no}</span>
        <h3 className="wk-card-title">{section.title}</h3>
        <span className="wk-card-tagline">{section.tagline}</span>
      </div>
      <div className={`case-metric case-metric-${section.id}`}>
        <span className="case-eyebrow">{section.eyebrow}</span>
        <strong>{section.metric}</strong>
        <span>{section.metricLabel}</span>
        <div className="case-line" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </div>
      <SectionWorks section={section} data={data} />
    </SpotlightPanel>
  )
}

// 板块内的作品清单（items 扁平 / groups 分组 / awards · footer 底部小字）
function SectionWorks({
  section,
  data,
}: {
  section: WorkSection
  data: WorksLang
}) {
  return (
    <div className="wk-card-body">
      {section.items && (
        <ul className="wk-list">
          {section.items.map((it, i) => (
            <WorkLine key={i} item={it} />
          ))}
        </ul>
      )}

      {section.groups &&
        section.groups.map((g, gi) => (
          <div key={gi} className="wk-sub">
            <div className="wk-sub-head">{g.heading}</div>
            <ul className="wk-list">
              {g.items.map((it, i) => (
                <WorkLine key={i} item={{ name: it }} />
              ))}
            </ul>
          </div>
        ))}

      {(section.awards || section.footer) && (
        <div className="wk-foot">
          {section.awards && (
            <p className="wk-foot-line">
              <span className="wk-foot-label">{data.awardsLabel}</span>
              <span className="wk-foot-val accent">{section.awards.join('  ·  ')}</span>
            </p>
          )}
          {section.footer && <p className="wk-foot-line">{section.footer}</p>}
        </div>
      )}
    </div>
  )
}

export default function Works({ lang, innerRef }: { lang: 'en' | 'zh'; innerRef: Ref<HTMLElement> }) {
  const data = WORKS[lang]
  const sections = data.sections

  return (
    <section className="works" id="projects" lang={lang} ref={innerRef}>
      <div className="wk-gallery">
        <div className="wk-gallery-sticky">
          <span className="wk-gallery-title">{data.title}</span>

          <div className="wk-track">
            {sections.map((s, index) => (
              <SectionCard key={s.id} section={s} data={data} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
