import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useScroll, useTransform, type MotionValue } from 'motion/react';
import { FACTS, MANIFESTO } from '../config/site';
import { FadeUp } from '../ui/Reveal';

type WordProps = { word: string; index: number; total: number; progress: MotionValue<number> };

const Word = ({ word, index, total, progress }: WordProps) => {
  const start = (index / total) * 0.8;
  const opacity = useTransform(progress, [start, start + 0.12], [0.14, 1]);
  const y = useTransform(progress, [start, start + 0.12], [10, 0]);
  return (
    <motion.span style={{ opacity, y, display: 'inline-block' }}>
      {word}
      {' '}
    </motion.span>
  );
};

const Counter = ({ to }: { to: number }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20% 0px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return <b ref={ref}>{n}</b>;
};

export const Manifesto = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.6'] });
  const words = MANIFESTO.split(' ');

  return (
    <section className="manifesto" aria-label="A luz">
      <div className="manifesto__track" ref={ref}>
        <p className="eyebrow">A luz</p>
        <p className="manifesto__text">
          {words.map((w, i) => (
            <Word key={i} word={w} index={i} total={words.length} progress={scrollYProgress} />
          ))}
        </p>
      </div>

      <ul className="facts">
        {FACTS.map((f, i) => (
          <li key={f.label}>
            <FadeUp delay={i * 0.12}>
              <Counter to={f.value} />
              <span>{f.label}</span>
            </FadeUp>
          </li>
        ))}
      </ul>
    </section>
  );
};
