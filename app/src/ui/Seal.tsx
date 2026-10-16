import { useId } from 'react';
import { motion } from 'motion/react';

type SealProps = { size?: number; text?: string; spin?: number; className?: string };

/** Marca em SVG (flor-coração do logo) com texto girando em volta. Recriada em vetor: nítida em qualquer tamanho. */
export const Seal = ({ size = 120, text = 'Amor em Foto · Estúdio · Luz natural · ', spin = 22, className }: SealProps) => {
  const id = useId();
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }} aria-hidden>
      <motion.svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        style={{ position: 'absolute', inset: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: spin, ease: 'linear', repeat: Infinity }}
      >
        <defs>
          <path id={id} d="M60 60 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" />
        </defs>
        <text fill="currentColor" fontSize="8.6" fontFamily="var(--font-body)" fontWeight="600" style={{ textTransform: 'uppercase' }}>
          <textPath href={`#${id}`} textLength={2 * Math.PI * 47 - 3} lengthAdjust="spacing">{text}</textPath>
        </text>
      </motion.svg>
      <svg viewBox="0 0 120 120" width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <path d="M60 80 C49 80 40 72 38 58 C46 58 56 66 60 80Z" fill="#b8806f" />
        <path d="M60 80 C71 80 80 72 82 58 C74 58 64 66 60 80Z" fill="#b8806f" />
        <path d="M60 74 C47 65 45 53 52 50 C56 49 59 51 60 54 C61 51 64 49 68 50 C75 53 73 65 60 74Z" fill="#ecc3b5" />
      </svg>
    </div>
  );
};
