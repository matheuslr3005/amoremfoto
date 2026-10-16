import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { waLink } from '../config/site';

type FloatingCtaProps = { enabled: boolean };

/** Botão de WhatsApp sempre à mão depois do hero. */
export const FloatingCta = ({ enabled }: FloatingCtaProps) => {
  const [show, setShow] = useState(false);
  const [inServices, setInServices] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    setShow(y > window.innerHeight * 0.9 && y < document.documentElement.scrollHeight - window.innerHeight * 1.35);
    const box = document.querySelector('[data-stage="services"]')?.getBoundingClientRect();
    setInServices(Boolean(box && box.top < window.innerHeight * 0.4 && box.bottom > window.innerHeight * 0.6));
  });

  return (
    <motion.a
      className="fab"
      data-in-services={inServices}
      href={waLink('Olá! Vim pelo site e gostaria de agendar uma sessão.')}
      target="_blank"
      rel="noopener noreferrer"
      initial={false}
      animate={{ opacity: enabled && show ? 1 : 0, y: enabled && show ? 0 : 30, pointerEvents: enabled && show ? 'auto' : 'none' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <i aria-hidden />
      <span>Agendar pelo WhatsApp</span>
    </motion.a>
  );
};
