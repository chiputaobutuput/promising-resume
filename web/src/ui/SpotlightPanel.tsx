import { motion } from 'framer-motion'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'

const EASE = [0.22, 1, 0.36, 1] as const

type SpotlightStyle = CSSProperties & {
  '--spot-x': string
  '--spot-y': string
  '--spot-size': string
  '--spot-intensity': number
}

interface SpotlightPanelProps {
  children: ReactNode
  className?: string
  delay?: number
  size?: number
  intensity?: number
  animate?: boolean
}

export default function SpotlightPanel({
  children,
  className = '',
  delay = 0,
  size = 460,
  intensity = 0.52,
  animate = true,
}: SpotlightPanelProps) {
  const style: SpotlightStyle = {
    '--spot-x': '-9999px',
    '--spot-y': '-9999px',
    '--spot-size': `${size}px`,
    '--spot-intensity': intensity,
  }

  const updateSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  const hideSpotlight = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--spot-x', '-9999px')
    event.currentTarget.style.setProperty('--spot-y', '-9999px')
  }

  return (
    <motion.div
      className={`spotlight-panel ${className}`}
      style={style}
      onPointerMove={updateSpotlight}
      onPointerLeave={hideSpotlight}
      initial={animate ? { opacity: 0, y: 24 } : false}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={animate ? { once: true, amount: 0.3 } : undefined}
      transition={animate ? { duration: 0.6, delay, ease: EASE } : undefined}
    >
      <span className="spotlight-ring" aria-hidden="true" />
      <div className="spotlight-content">{children}</div>
    </motion.div>
  )
}
