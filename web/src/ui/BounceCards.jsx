import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BounceCards.css';

// React Bits BounceCards 改编版：
// - onSelect(idx) / selectedIdx：点击卡片成为主图，选中卡霓虹高亮
// - 卡片尺寸由 CSS 变量 --bc-card-w 控制（默认 200px）
export default function BounceCards({
  className = '',
  images = [],
  containerWidth = 400,
  containerHeight = 220,
  animationDelay = 0.35,
  animationStagger = 0.07,
  easeType = 'elastic.out(1, 0.55)',
  transformStyles = [],
  enableHover = true,
  selectedIdx = -1,
  onSelect = null
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bc-card',
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, el);
    return () => ctx.revert();
  }, [animationStagger, easeType, animationDelay, images.length]);

  const getNoRotationTransform = (transformStr) => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    if (transformStr === 'none') return 'rotate(0deg)';
    return `${transformStr} rotate(0deg)`;
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      return baseTransform.replace(translateRegex, `translate(${currentX + offsetX}px)`);
    }
    return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
  };

  const pushSiblings = (hoveredIdx) => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);
    images.forEach((_, i) => {
      const target = q(`.bc-card-${i}`);
      gsap.killTweensOf(target);
      const baseTransform = transformStyles[i] || 'none';
      if (i === hoveredIdx) {
        gsap.to(target, {
          transform: getNoRotationTransform(baseTransform) + ' scale(1.12)',
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
      } else {
        const offsetX = i < hoveredIdx ? -46 : 46;
        const distance = Math.abs(hoveredIdx - i);
        gsap.to(target, {
          transform: getPushedTransform(baseTransform, offsetX),
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay: distance * 0.04,
          overwrite: 'auto'
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);
    images.forEach((_, i) => {
      const target = q(`.bc-card-${i}`);
      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: (transformStyles[i] || 'none'),
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });
    });
  };

  return (
    <div
      className={`bounceCardsContainer ${className}`}
      ref={containerRef}
      style={{ position: 'relative', width: containerWidth, height: containerHeight }}
    >
      {images.map((src, idx) => (
        <button
          type="button"
          key={`${src}-${idx}`}
          className={`bc-card bc-card-${idx}${idx === selectedIdx ? ' is-selected' : ''}`}
          style={{ transform: transformStyles[idx] ?? 'none' }}
          onMouseEnter={() => pushSiblings(idx)}
          onMouseLeave={resetSiblings}
          onClick={() => onSelect?.(idx)}
          aria-label={`查看第 ${idx + 1} 张`}
        >
          <img className="bc-image" src={src} alt="" loading="lazy" />
        </button>
      ))}
    </div>
  );
}
