import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { Environment, Lightformer, Preload, Sparkles } from '@react-three/drei';
import { Bloom } from './Bloom';
import { Beam, Halo } from './Beam';
import { Effects } from './Effects';
import { PetalField } from './PetalField';
import { Rig } from './Rig';
import { ServiceRing } from './ServiceRing';
import { Tunnel } from './Tunnel';
import { smoothstep } from '../lib/math';
import { CONTACT_BLOOM } from '../lib/timeline';
import { world } from '../lib/worldState';
import { intro } from '../lib/intro';

export const BG = '#160e0d';

/** Mostra os filhos só quando `when()` é verdadeiro (checado a cada frame). */
const Reveal = ({ when, children }: { when: () => boolean; children: ReactNode }) => {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = when();
  });
  return <group ref={ref}>{children}</group>;
};

type SceneProps = { still: boolean; lite: boolean; fx: boolean; onReady: () => void };

/** Avisa que o 3D está pronto: só depois do Preload (shaders compilados e texturas já na GPU). */
const Ready = ({ onReady }: { onReady: () => void }) => {
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(onReady));
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
};

const heroOpen = () => 0.5 + 0.14 * intro.value + 0.36 * smoothstep(0.02, 0.92, world.tl.hero);
const heroHeart = () => 1 - smoothstep(0.22, 0.7, world.tl.hero);
const contactVisible = () => world.tl.services > 0.9;
const contactOpen = () => 0.18 + 0.82 * smoothstep(0.05, 0.85, world.tl.contact);

export const Scene = ({ still, lite, fx, onReady }: SceneProps) => {
  const portrait = useThree((s) => s.size.width / s.size.height < 0.9);
  const contactPos = useMemo<[number, number, number]>(
    () => (portrait ? [0, CONTACT_BLOOM.y + 2.1, CONTACT_BLOOM.z] : [2.6, CONTACT_BLOOM.y, CONTACT_BLOOM.z]),
    [portrait],
  );

  return (
    <>
      <color attach="background" args={[BG]} />
      <fogExp2 attach="fog" args={[BG, 0.03]} />

      <Rig still={still} />

      <ambientLight intensity={0.45} color="#ffd9c8" />
      <directionalLight position={[-4, 6, 6]} intensity={2.4} color="#ffe2cc" />
      <directionalLight position={[5, -2, -4]} intensity={0.9} color="#e8a995" />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={5} color="#ffe3d2" position={[-5, 5, 4]} scale={[7, 7, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#f0a995" position={[6, 1, -3]} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={2} color="#fff1e6" position={[0, 6, -4]} scale={4} />
      </Environment>

      {/* hero */}
      <Halo position={[0, 0.2, -3]} size={13} opacity={0.5} />
      <Bloom getOpen={heroOpen} getHeart={heroHeart} position={[0, -1.7, 0]} scale={1.85} still={still} />
      <Beam position={[-3.4, 3.2, -3]} rotation={[0, 0.2, -0.55]} size={[3.2, 15]} opacity={0.2} />
      <Beam position={[2.4, 3, -5]} rotation={[0, -0.2, -0.48]} size={[2.2, 14]} opacity={0.13} phase={2} />

      {/* viagem */}
      <PetalField count={lite ? 70 : 150} still={still} />
      <Sparkles count={lite ? 50 : 110} scale={[20, 11, 165]} position={[0, 0, -72]} size={2.6} speed={still ? 0 : 0.12} color="#ffdcb8" opacity={0.5} noise={0.3} />
      <Tunnel still={still} />
      <Beam position={[2, 3, -44]} rotation={[0, 0.5, -0.5]} size={[3, 18]} opacity={0.1} phase={1} />
      <ServiceRing />
      <Beam position={[-2.5, 3.5, -116]} rotation={[0, 0.2, -0.5]} size={[4, 18]} opacity={0.16} phase={3} />
      <Beam position={[3.5, 3, -126]} rotation={[0, -0.3, -0.45]} size={[3, 16]} opacity={0.12} phase={4} />

      {/* contato */}
      <Reveal when={contactVisible}>
        <Halo position={[contactPos[0], contactPos[1] + 1, contactPos[2] - 3]} size={12} opacity={0.4} />
        <Bloom getOpen={contactOpen} position={contactPos} scale={1.7} still={still} />
        <pointLight position={[contactPos[0], 1.6, contactPos[2] + 4]} color="#ffbfa6" intensity={10} distance={14} decay={2} />
      </Reveal>

      {!lite && fx && <Effects />}

      {/* compila todos os shaders e envia todas as texturas à GPU agora (na tela de abertura), não no meio do scroll */}
      <Preload all />
      <Ready onReady={onReady} />
    </>
  );
};
