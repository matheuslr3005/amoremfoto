import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { CHAPTERS, PHOTOS, type Chapter } from '../config/site';
import { clamp } from '../lib/math';

/** Janelas de scroll (0..1) em que cada capítulo aparece. */
const WINDOWS: readonly (readonly [number, number])[] = [
  [0.03, 0.31],
  [0.36, 0.64],
  [0.69, 0.97],
];

type ChapterViewProps = { chapter: Chapter; window: readonly [number, number]; progress: MotionValue<number>; side: 'left' | 'right' };

const ChapterView = ({ chapter, window: w, progress, side }: ChapterViewProps) => {
  const [a, b] = w;
  const span = b - a;
  const fade = [a, a + span * 0.22, b - span * 0.22, b];
  const opacity = useTransform(progress, fade, [0, 1, 1, 0]);
  const y = useTransform(progress, fade, [60, 0, 0, -60]);
  const blur = useTransform(progress, fade, [14, 0, 0, 14]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  const letterSpacing = useTransform(progress, fade, ['0.18em', '0em', '0em', '-0.04em']);

  return (
    <motion.article className={`chapter chapter--${side}`} style={{ opacity, y, filter }} aria-label={chapter.title}>
      <span className="chapter__num">{chapter.num}</span>
      <motion.h2 className="chapter__title" style={{ letterSpacing }}>
        {chapter.title}
      </motion.h2>
      <p className="chapter__text">{chapter.text}</p>
    </motion.article>
  );
};

/** Mira de câmera: cantos, ponto de gravação e contador de fotos, pelo scroll. */
const Viewfinder = ({ progress }: { progress: MotionValue<number> }) => {
  const [frame, setFrame] = useState(1);
  useMotionValueEvent(progress, 'change', (p) => setFrame(clamp(Math.ceil(p * PHOTOS.length), 1, PHOTOS.length)));
  const bar = useTransform(progress, [0, 1], ['0%', '100%']);

  return (
    <div className="finder" aria-hidden>
      <i className="finder__corner finder__corner--tl" />
      <i className="finder__corner finder__corner--tr" />
      <i className="finder__corner finder__corner--bl" />
      <i className="finder__corner finder__corner--br" />
      <p className="finder__rec">
        <i /> luz natural · f/1.8
      </p>
      <p className="finder__count">
        <b>{String(frame).padStart(2, '0')}</b> / {PHOTOS.length}
      </p>
      <p className="finder__caption">
        {PHOTOS[frame - 1]?.title} <span>· {PHOTOS[frame - 1]?.tag}</span>
      </p>
      <div className="finder__bar">
        <motion.span style={{ width: bar }} />
      </div>
    </div>
  );
};

export const Journey = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section className="journey" id="luz" ref={ref} data-stage="journey" aria-label="A luz, a revelação e a memória">
      <div className="journey__sticky">
        <Viewfinder progress={scrollYProgress} />
        {CHAPTERS.map((c, i) => {
          const w = WINDOWS[i];
          if (!w) return null;
          return <ChapterView key={c.num} chapter={c} window={w} progress={scrollYProgress} side={i % 2 === 0 ? 'left' : 'right'} />;
        })}
      </div>
    </section>
  );
};
