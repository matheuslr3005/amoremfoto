import { useEffect } from 'react';
import { measureStages } from './timeline';

/** Mede onde cada estágio começa/termina e remede quando o layout muda. */
export const useStageMeasure = () => {
  useEffect(() => {
    measureStages();
    const again = () => measureStages();
    window.addEventListener('resize', again);
    window.addEventListener('load', again);
    void document.fonts?.ready.then(again);
    const observer = new ResizeObserver(again);
    observer.observe(document.body);
    return () => {
      window.removeEventListener('resize', again);
      window.removeEventListener('load', again);
      observer.disconnect();
    };
  }, []);
};
