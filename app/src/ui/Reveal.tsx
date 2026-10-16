import { Fragment, type ReactNode } from 'react';
import { motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

type WordsProps = { text: string; className?: string; delay?: number; as?: 'h1' | 'h2' | 'h3' | 'p'; italic?: readonly string[] };

/** Texto que sobe palavra por palavra de dentro de uma máscara. Palavras em `italic` ganham destaque. */
export const RevealWords = ({ text, className, delay = 0, as = 'h2', italic = [] }: WordsProps) => {
  const Tag = motion[as];
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-12% 0px' }} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span className="mask" aria-hidden>
            <motion.span
              className={italic.includes(w.replace(/[.,?!]/g, '')) ? 'em' : undefined}
              style={{ display: 'inline-block' }}
              variants={{ hidden: { y: '115%', rotate: 4 }, show: { y: 0, rotate: 0 } }}
              transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.06 }}
            >
              {w}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
};

type FadeProps = { children: ReactNode; delay?: number; y?: number; className?: string };

export const FadeUp = ({ children, delay = 0, y = 28, className }: FadeProps) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-10% 0px' }}
    transition={{ duration: 1, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);
