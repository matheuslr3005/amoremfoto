import { useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'motion/react';
import { PRO_SERVICES, waLink, type Service } from '../config/site';
import { photoUrl } from '../lib/photos';
import { Magnetic } from '../ui/Magnetic';
import { FadeUp, RevealWords } from '../ui/Reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

const MARQUEE = ['Luz natural', 'Sem flash', 'Sem pressa', 'Sem pose forçada', 'Canoas · RS'];

/** Faixa de texto que anda sozinha e acelera com a velocidade do scroll. */
const Marquee = () => {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 80, damping: 30 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-6, 0, 6]);
  const last = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      const dt = Math.min(t - last.current, 64);
      last.current = t;
      const w = 25; // % do conteúdo duplicado
      let next = x.get() - (dt * 0.012 + boost.get() * dt * 0.01);
      if (next <= -w) next += w;
      if (next > 0) next -= w;
      x.set(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [x, boost]);

  const xPct = useTransform(x, (v) => `${v}%`);
  const items = [...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee" aria-hidden>
      <motion.div className="marquee__track" style={{ x: xPct }}>
        {items.map((t, i) => (
          <span key={i}>
            {t}
            <i>✺</i>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

type CardProps = { service: Service; index: number };

const Card = ({ service, index }: CardProps) => {
  const ref = useRef<HTMLElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 140, damping: 16 });
  const sy = useSpring(py, { stiffness: 140, damping: 16 });
  const rotateY = useTransform(sx, [0, 1], [-9, 9]);
  const rotateX = useTransform(sy, [0, 1], [8, -8]);
  const glare = useTransform([sx, sy], ([x, y]: number[]) => `radial-gradient(circle at ${(x ?? 0.5) * 100}% ${(y ?? 0.5) * 100}%, rgba(255,236,220,0.28), transparent 55%)`);
  const img = useMemo(() => photoUrl(service.kind, 300 + index, service.src), [service, index]);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      ref={ref}
      className="pro"
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      initial={{ opacity: 0, y: 90, rotateX: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 1.1, ease: EASE, delay: index * 0.14 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      <div className="pro__img" style={{ backgroundImage: `url(${img})` }}>
        <motion.span className="pro__glare" style={{ background: glare }} />
        <span className="pro__tag">{service.group}</span>
      </div>
      <div className="pro__body">
        <h3>{service.name}</h3>
        <p>{service.text}</p>
        {service.options && (
          <ul className="chips chips--static">
            {service.options.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        )}
        <Magnetic strength={0.2}>
          <a className="btn btn--ghost" href={waLink(service.message)} target="_blank" rel="noopener noreferrer">
            <span>{service.cta}</span>
            <i aria-hidden>→</i>
          </a>
        </Magnetic>
      </div>
    </motion.article>
  );
};

export const Studio = () => (
  <section className="studio" id="estudio" aria-label="Para fotógrafos e criativos">
    <Marquee />
    <div className="studio__inner">
      <FadeUp>
        <p className="eyebrow">Para fotógrafos e criativos</p>
      </FadeUp>
      <RevealWords className="studio__title" text="O estúdio também é seu." italic={['seu']} />
      <div className="studio__grid">
        {PRO_SERVICES.map((s, i) => (
          <Card key={s.id} service={s} index={i} />
        ))}
      </div>
    </div>
  </section>
);
