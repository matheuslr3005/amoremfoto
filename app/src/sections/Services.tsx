import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { RING_SERVICES, waLink } from '../config/site';
import { serviceFloat } from '../lib/timeline';
import { scrollToY } from '../lib/scroll';
import { Magnetic } from '../ui/Magnetic';

const EASE = [0.22, 1, 0.36, 1] as const;
const COUNT = RING_SERVICES.length;
/** cada serviço "segura" o anel por este tanto de altura de tela */
export const SERVICES_VH_PER_ITEM = 115;

export const Services = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [option, setOption] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.round(serviceFloat(p, COUNT));
    setActive((cur) => {
      if (cur !== next) setOption(0);
      return next;
    });
  });

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollToY(top + (i / (COUNT - 1)) * travel);
  };

  const s = RING_SERVICES[active];
  if (!s) return null;
  const chosen = s.options?.[option];
  const message = chosen ? `${s.message} (${chosen})` : s.message;

  return (
    <section
      className="services"
      id="servicos"
      ref={ref}
      data-stage="services"
      style={{ height: `${COUNT * SERVICES_VH_PER_ITEM + 100}svh` }}
      aria-label="Serviços"
    >
      <div className="services__sticky">
        <header className="services__head">
          <p className="eyebrow">Serviços</p>
          <h2 className="services__title">
            Um estúdio, <em>muitas</em> histórias.
          </h2>
        </header>

        <div className="services__panel" aria-live="polite">
          <p className="services__index">
            <b>{String(active + 1).padStart(2, '0')}</b> / {String(COUNT).padStart(2, '0')}
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } }}
              exit={{ opacity: 0, y: -16, transition: { duration: 0.18, ease: 'easeIn' } }}
            >
              <p className="services__group">{s.group}</p>
              <h3 className="services__name">{s.name}</h3>
              <p className="services__text">{s.text}</p>
              {s.options && (
                <div className="chips" role="group" aria-label="Frequência">
                  {s.options.map((o, i) => (
                    <button key={o} type="button" className="chip" aria-pressed={i === option} onClick={() => setOption(i)}>
                      {o}
                    </button>
                  ))}
                </div>
              )}
              <Magnetic>
                <a className="btn" href={waLink(message)} target="_blank" rel="noopener noreferrer">
                  <span>{s.cta}</span>
                  <i aria-hidden>→</i>
                </a>
              </Magnetic>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="services__list" aria-label="Escolher serviço">
          {RING_SERVICES.map((item, i) => (
            <li key={item.id}>
              <button type="button" aria-current={i === active} onClick={() => jump(i)}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {item.name}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
