import Lenis from 'lenis';

let lenis: Lenis | null = null;

/** Rolagem suave (inércia). Desligada com "reduzir movimento". */
export const startSmoothScroll = () => {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: true });
  lenis.stop();
  return () => {
    lenis?.destroy();
    lenis = null;
  };
};

export const lockScroll = (locked: boolean) => {
  document.documentElement.style.overflow = locked ? 'hidden' : '';
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
};

export const scrollToY = (y: number, immediate = false) => {
  if (lenis) lenis.scrollTo(y, { duration: immediate ? 0 : 1.8, immediate, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
};

export const scrollToSection = (hash: string) => {
  if (hash === '#top') return scrollToY(0);
  const el = document.querySelector<HTMLElement>(hash);
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY);
};
