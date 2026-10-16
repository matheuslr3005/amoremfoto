import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent } from 'motion/react';

type LoaderProps = {
  /** o mundo 3D e as fontes já estão prontos */
  ready: boolean;
  onDone: () => void;
};

const MIN_MS = 2000;

/** Tela de abertura: o logo "revela" junto com o progresso real do carregamento, depois as cortinas sobem. */
export const Loader = ({ ready, onDone }: LoaderProps) => {
  const value = useMotionValue(0);
  const [shown, setShown] = useState(0);
  const [open, setOpen] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);

  useMotionValueEvent(value, 'change', (v) => setShown(Math.round(v)));

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // sobe até 90% sozinho; só chega a 100% quando tudo estiver pronto
  useEffect(() => {
    const controls = animate(value, 90, { duration: 2.2, ease: [0.3, 0.6, 0.3, 1] });
    return () => controls.stop();
  }, [value]);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    const controls = animate(value, 100, { duration: 0.5, ease: 'easeOut' });
    const timer = window.setTimeout(() => setOpen(false), 650);
    return () => {
      controls.stop();
      window.clearTimeout(timer);
    };
  }, [ready, minElapsed, value]);

  const circumference = 2 * Math.PI * 62;

  return (
    <AnimatePresence onExitComplete={onDone}>
      {open && (
        <motion.div className="loader" key="loader" role="status" aria-label="Carregando">
          <motion.div className="loader__half loader__half--top" exit={{ y: '-101%' }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="loader__half loader__half--bottom" exit={{ y: '101%' }} transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="loader__center" exit={{ opacity: 0, scale: 1.25 }} transition={{ duration: 0.6, ease: 'easeIn' }}>
            <div className="loader__logo">
              <svg viewBox="0 0 140 140" aria-hidden>
                <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(247,235,228,0.14)" strokeWidth="1.5" />
                <motion.circle
                  cx="70"
                  cy="70"
                  r="62"
                  fill="none"
                  stroke="#e8bfb0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset: circumference * (1 - shown / 100), rotate: -90, transformOrigin: '70px 70px' }}
                />
              </svg>
              <motion.img
                src="logo.png"
                alt=""
                width={97}
                height={97}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="loader__count" aria-hidden>
              <b>{String(shown).padStart(2, '0')}</b>
              <span>%</span>
            </p>
            <p className="loader__hint">Abrindo a janela…</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
