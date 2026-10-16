import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { scrollToSection } from '../lib/scroll';
import { Magnetic } from './Magnetic';

const LINKS = [
  { href: '#luz', label: 'A luz' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#estudio', label: 'Para fotógrafos' },
  { href: '#contato', label: 'Contato' },
] as const;

const EASE = [0.76, 0, 0.24, 1] as const;

type HeaderProps = { visible: boolean };

export const Header = ({ visible }: HeaderProps) => {
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240 && !menu);
  });

  const go = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu(false);
    window.setTimeout(() => scrollToSection(hash), menu ? 450 : 0);
  };

  return (
    <>
      <motion.header
        className="header"
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: visible && !hidden ? 0 : -90, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <a className="brand" href="#top" onClick={go('#top')} aria-label="Amor em Foto Estúdio — início">
          <img src="logo.png" alt="" width={48} height={48} />
          <span>
            Amor em Foto
            <small>Estúdio · Canoas</small>
          </span>
        </a>
        <nav className="nav" aria-label="Seções">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={go(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="header__right">
          <Magnetic strength={0.25}>
            <a className="btn btn--small" href="#contato" onClick={go('#contato')}>
              <span>Agendar</span>
            </a>
          </Magnetic>
          <button className="menu-btn" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <motion.i animate={{ rotate: menu ? 45 : 0, y: menu ? 3 : -3 }} />
            <motion.i animate={{ rotate: menu ? -45 : 0, y: menu ? -3 : 3 }} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.nav
            className="menu"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {[{ href: '#top', label: 'Início' }, ...LINKS].map((l, i) => (
              <div className="menu__row" key={l.href}>
                <motion.a
                  href={l.href}
                  onClick={go(l.href)}
                  initial={{ y: '110%' }}
                  animate={{ y: 0, transition: { delay: 0.25 + i * 0.07, duration: 0.9, ease: [0.22, 1, 0.36, 1] } }}
                  exit={{ y: '110%', transition: { duration: 0.3 } }}
                >
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  {l.label}
                </motion.a>
              </div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};
