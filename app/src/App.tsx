import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Contact } from './sections/Contact';
import { Hero } from './sections/Hero';
import { Journey } from './sections/Journey';
import { Manifesto } from './sections/Manifesto';
import { Services } from './sections/Services';
import { Studio } from './sections/Studio';
import { Cursor } from './ui/Cursor';
import { FloatingCta } from './ui/FloatingCta';
import { Header } from './ui/Header';
import { Loader } from './ui/Loader';
import { hasWebGL, isCoarsePointer, isDebug, prefersReducedMotion } from './lib/env';
import { intro } from './lib/intro';
import { trackPointer } from './lib/pointer';
import { lockScroll, startSmoothScroll } from './lib/scroll';
import { useStageMeasure } from './lib/useStageMeasure';
import { world } from './lib/worldState';

const World = lazy(() => import('./three/World'));

const still = prefersReducedMotion();
const lite = isCoarsePointer() || (navigator.hardwareConcurrency ?? 8) <= 4;

export const App = () => {
  const [glOk, setGlOk] = useState(hasWebGL);
  const [worldReady, setWorldReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [entered, setEntered] = useState(false);

  useStageMeasure();

  useEffect(() => trackPointer(), []);
  useEffect(() => (still ? undefined : startSmoothScroll()), []);
  useEffect(() => {
    void document.fonts.ready.then(() => setFontsReady(true));
  }, []);
  useEffect(() => {
    lockScroll(!entered);
    return () => lockScroll(false);
  }, [entered]);

  useEffect(() => {
    document.documentElement.classList.toggle('no-gl', !glOk);
  }, [glOk]);

  useEffect(() => {
    if (isDebug()) (window as unknown as { __amor: unknown }).__amor = { world, intro };
  }, []);

  const onWorldReady = useCallback(() => setWorldReady(true), []);
  const onWorldFail = useCallback(() => setGlOk(false), []);

  const onDone = useCallback(() => {
    setEntered(true);
    intro.target = 1;
  }, []);

  const ready = fontsReady && (worldReady || !glOk);

  return (
    <MotionConfig reducedMotion="user">
      <Loader ready={ready} onDone={onDone} />
      {glOk && (
        <Suspense fallback={null}>
          <World still={still} lite={lite} onReady={onWorldReady} onFail={onWorldFail} />
        </Suspense>
      )}
      <Cursor />
      <Header visible={entered} />
      <main>
        <Hero go={entered} />
        <Journey />
        <Manifesto />
        <Services />
        <Studio />
        <Contact />
      </main>
      <FloatingCta enabled={entered} />
    </MotionConfig>
  );
};
