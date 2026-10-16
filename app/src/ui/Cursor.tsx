import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { isCoarsePointer } from '../lib/env';

/** Anel que segue o cursor e cresce sobre links e botões. Só aparece com mouse. */
export const Cursor = () => {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.35 });
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const [enabled] = useState(() => !isCoarsePointer());

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHot(Boolean((e.target as Element | null)?.closest('a, button, [data-hot]')));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', dn);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', dn);
      window.removeEventListener('pointerup', up);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  return (
    <motion.div className="cursor" style={{ x: sx, y: sy }} aria-hidden>
      <motion.i animate={{ scale: down ? 0.7 : hot ? 2.1 : 1, opacity: hot ? 0.55 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} />
    </motion.div>
  );
};
