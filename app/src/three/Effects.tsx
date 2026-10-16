import { EffectComposer, Bloom as GlowEffect, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

/** Pós-processamento leve: brilho nas luzes, vinheta quente e um grão fino de filme. */
export const Effects = () => (
  <EffectComposer multisampling={0}>
    <GlowEffect intensity={0.7} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur />
    <Vignette offset={0.28} darkness={0.7} />
    <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.6} />
  </EffectComposer>
);
