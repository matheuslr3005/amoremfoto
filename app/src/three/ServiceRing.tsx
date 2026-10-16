import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshBasicMaterial } from 'three';
import { RING_SERVICES } from '../config/site';
import { damp, smoothstep } from '../lib/math';
import { photoTexture } from '../lib/photos';
import { RING } from '../lib/timeline';
import { world } from '../lib/worldState';
import { ArchPhoto } from './ArchPhoto';

const STEP = (Math.PI * 2) / RING.count;
const angleOf = (k: number) => STEP / 2 + k * STEP;

type CardProps = { index: number };

const Card = ({ index }: CardProps) => {
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const service = RING_SERVICES[index];
  const texture = useMemo(() => (service ? photoTexture(service.kind, 100 + index, service.src) : null), [service, index]);
  const a = angleOf(index);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const weight = 1 - Math.min(1, Math.abs(index - world.service));
    // ao sair do anel, os cartões encolhem no lugar (não atravessam a câmera e não ficam atrás do texto seguinte)
    const leaving = 1 - smoothstep(0, 0.07, world.tl.studio);
    const s = damp(g.scale.x, (0.84 + 0.26 * weight) * (world.portrait ? 0.68 : 1) * leaving, 8, dt);
    g.scale.setScalar(s);
    material.current?.color.setScalar(0.28 + 0.72 * smoothstep(0, 1, weight));
  });

  if (!texture) return null;
  return (
    <group position={[Math.sin(a) * RING.radius, 0, -Math.cos(a) * RING.radius]} rotation={[0, -a, 0]}>
      <ArchPhoto
        ref={group}
        texture={texture}
        width={2.8}
        height={3.8}
        materialRef={material}
      />
    </group>
  );
};

/** Anel de serviços: cartões em arco girando em volta da câmera, que fica parada no centro. */
export const ServiceRing = () => {
  const ring = useRef<Group>(null);
  const lines = useRef<Group>(null);

  useFrame(() => {
    const r = ring.current;
    if (!r) return;
    r.rotation.y = angleOf(0) + world.service * STEP - world.yaw;
    // em pé (celular) as linhas do anel atravessariam o texto
    if (lines.current) lines.current.visible = !world.portrait && world.tl.studio < 0.07;
  });

  return (
    <group position={RING.center}>
      <group ref={ring}>
        {RING_SERVICES.map((s, i) => (
          <Card key={s.id} index={i} />
        ))}
      </group>
      <group ref={lines}>
        {[-3.6, 3.6].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[RING.radius + 0.35, 0.014, 8, 160]} />
            <meshBasicMaterial color="#f1cdbf" transparent opacity={0.55} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
