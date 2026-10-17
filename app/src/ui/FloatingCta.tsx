import { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { waLink } from '../config/site';
import { stageSpan } from '../lib/timeline';

type FloatingCtaProps = { enabled: boolean };

/** Botão de WhatsApp sempre à mão depois do hero. */
export const FloatingCta = ({ enabled }: FloatingCtaProps) => {
  const [show, setShow] = useState(false);
  const [inServices, setInServices] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    const vh = window.innerHeight;
    const services = stageSpan('services');
    const contact = stageSpan('contact');
    setShow(y > vh * 0.9 && (!contact || y < contact[1] - vh * 0.35));
    setInServices(Boolean(services && y > services[0] - vh * 0.4 && y < services[1] + vh * 0.4));
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
