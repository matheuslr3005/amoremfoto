import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { SITE, mapsLink, waLink } from '../config/site';
import { Magnetic } from '../ui/Magnetic';
import { RevealWords } from '../ui/Reveal';
import { Seal } from '../ui/Seal';

export const Contact = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const opacity = useTransform(scrollYProgress, [0.28, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0.28, 0.5], [40, 0]);
  const a = SITE.address;

  return (
    <section className="contact" id="contato" ref={ref} data-stage="contact" aria-label="Contato">
      <div className="contact__sticky">
        <motion.div className="contact__main" style={{ opacity, y }}>
          <p className="eyebrow">Vamos conversar</p>
          <RevealWords as="h2" className="contact__title" text="Vamos contar a sua história?" italic={['história']} />
          <p className="contact__text">
            Conte para a gente o que você imagina: um ensaio, um evento, um espaço para fotografar. A gente cuida do resto, com a luz certa e todo o carinho.
          </p>
          <div className="contact__row">
            <Magnetic>
              <a className="btn btn--big" href={waLink('Olá! Vim pelo site e gostaria de agendar uma sessão.')} target="_blank" rel="noopener noreferrer">
                <span>Agendar pelo WhatsApp</span>
                <i aria-hidden>→</i>
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn--ghost" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
                <span>Ver no Instagram</span>
              </a>
            </Magnetic>
          </div>

          <address className="where">
            <Seal size={92} spin={30} />
            <div>
              <b>{SITE.name}</b>
              <span>{a.street}</span>
              <span>
                {a.hood} · {a.city}/{a.uf}
              </span>
              <a href={mapsLink()} target="_blank" rel="noopener noreferrer">
                Como chegar →
              </a>
            </div>
          </address>
        </motion.div>

        <footer className="foot">
          <span>© 2026 {SITE.name}</span>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <span>Fotografia em luz natural · Canoas, RS</span>
        </footer>
      </div>
    </section>
  );
};
