import { useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { waLink } from '../config/site';
import { pointer } from '../lib/pointer';
import { scrollToSection } from '../lib/scroll';
import { Magnetic } from '../ui/Magnetic';
import { Seal } from '../ui/Seal';
import { useEffect } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

type HeroProps = { go: boolean };

const Letters = ({ text, delay, go }: { text: string; delay: number; go: boolean }) => (
  <span className="hero__word" aria-label={text}>
    {text.split('').map((ch, i) => (
      <span className="mask" key={i} aria-hidden>
        <motion.span
          style={{ display: 'inline-block' }}
          initial={{ y: '118%', rotate: 8 }}
          animate={go ? { y: 0, rotate: 0 } : undefined}
          transition={{ duration: 1.25, ease: EASE, delay: delay + i * 0.055 }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      </span>
    ))}
  </span>
);

export const Hero = ({ go }: HeroProps) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const fade = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -90]);

  // parallax das palavras gigantes com o cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const x1 = useTransform(sx, (v) => v * -26);
  const y1 = useTransform(sy, (v) => v * -14);
  const x2 = useTransform(sx, (v) => v * 34);
  const y2 = useTransform(sy, (v) => v * 18);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      mx.set(pointer.x);
      my.set(pointer.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mx, my]);

  return (
    <section className="hero" id="top" ref={ref} data-stage="hero">
      <motion.div className="hero__sticky" style={{ opacity: fade, y: lift }}>
        <motion.p
          className="hero__kicker"
          initial={{ opacity: 0, y: 14 }}
          animate={go ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.2, duration: 1, ease: EASE }}
        >
          Estúdio de fotografia · Luz natural · Canoas, RS
        </motion.p>

        <h1 className="hero__title">
          <motion.span className="hero__line hero__line--a" style={{ x: x1, y: y1 }}>
            <Letters text="Amor" delay={0.35} go={go} />
          </motion.span>
          <motion.span className="hero__line hero__line--b" style={{ x: x2, y: y2 }}>
            <Letters text="em" delay={0.7} go={go} />
            <span className="hero__spacer" aria-hidden />
            <Letters text="Foto" delay={0.8} go={go} />
          </motion.span>
        </h1>

        <motion.div
          className="hero__copy"
          initial={{ opacity: 0, y: 24 }}
          animate={go ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 1.1, duration: 1.1, ease: EASE }}
        >
          <p>
            Cada fase da vida, na <em>luz</em> mais suave. Gestantes, newborn, crianças, ensaios corporativos e eventos — sem flash, sem pressa, sem pose forçada.
          </p>
          <div className="hero__cta">
            <Magnetic>
              <a className="btn" href={waLink('Olá! Vim pelo site e gostaria de agendar uma sessão.')} target="_blank" rel="noopener noreferrer">
                <span>Agendar uma sessão</span>
                <i aria-hidden>→</i>
              </a>
            </Magnetic>
            <a
              className="btn btn--ghost"
              href="#servicos"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#servicos');
              }}
            >
              <span>Ver serviços</span>
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero__cue"
          initial={{ opacity: 0 }}
          animate={go ? { opacity: 1 } : undefined}
          transition={{ delay: 1.6, duration: 1 }}
        >
          <Seal size={118} />
          <span className="hero__cue-label">
            role
            <i aria-hidden />
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};
