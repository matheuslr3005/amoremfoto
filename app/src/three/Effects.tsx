import { EffectComposer, Bloom as GlowEffect, Vignette } from '@react-three/postprocessing';

/** Pós-processamento: antialiasing (MSAA), brilho só nas luzes mais fortes e vinheta quente. */
export const Effects = () => (
  <EffectComposer multisampling={2}>
    <GlowEffect intensity={0.55} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />
    <Vignette offset={0.28} darkness={0.7} />
  </EffectComposer>
);
