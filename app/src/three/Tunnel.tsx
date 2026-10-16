import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MeshBasicMaterial, Vector3 } from 'three';
import { PHOTOS } from '../config/site';
import { seeded, smoothstep } from '../lib/math';
import { photoTexture } from '../lib/photos';
import { TUNNEL, tunnelCenter } from '../lib/timeline';
import { world } from '../lib/worldState';
import { ArchPhoto } from './ArchPhoto';

type Slot = {
  position: Vector3;
  center: Vector3;
  roll: number;
  yaw: number;
  size: number;
  bob: number;
};

const buildSlots = (): Slot[] => {
  const rnd = seeded(5);
  const span = TUNNEL.start - TUNNEL.end;
  return Array.from({ length: TUNNEL.photos }, (_, i) => {
    const z = TUNNEL.start - 7 - (i / (TUNNEL.photos - 1)) * (span - 9);
    const center = tunnelCenter(z);
    const angle = i * 2.4 + 0.6;
    const radius = 3.1 + (i % 3) * 0.75 + rnd() * 0.4;
    const position = center.clone().add(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, 0));
    return { position, center, roll: (rnd() - 0.5) * 0.28, yaw: (rnd() - 0.5) * 0.5, size: 0.85 + rnd() * 0.5, bob: rnd() * 6 };
  });
};

type TunnelPhotoProps = { index: number; slot: Slot; still: boolean };

const TunnelPhoto = ({ index, slot, still }: TunnelPhotoProps) => {
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const photoIndex = index % PHOTOS.length;
  const photo = PHOTOS[photoIndex];
  const texture = useMemo(() => (photo ? photoTexture(photo.kind, photoIndex, photo.src) : null), [photo, photoIndex]);

  useFrame(({ camera, clock }) => {
    const g = group.current;
    if (!g) return;
    const dist = g.position.distanceTo(camera.position);
    // "Revelar": a foto vai se revelando conforme a câmera se aproxima.
    const reveal = smoothstep(16, 6, dist);
    material.current?.color.setScalar(0.3 + 0.7 * reveal);
    g.scale.setScalar(slot.size * (0.92 + 0.08 * reveal) * Math.max(0.0001, smoothstep(0.3, 0.95, world.tl.hero)));
    if (!still) g.position.y = slot.position.y + Math.sin(clock.elapsedTime * 0.5 + slot.bob) * 0.12;
  });

  if (!texture) return null;
  return (
    <group
      ref={group}
      position={slot.position}
      onUpdate={(g) => {
        // de frente para quem vem pelo túnel, com a moldura inclinada para o eixo
        const dx = slot.position.x - slot.center.x;
        const dy = slot.position.y - slot.center.y;
        g.lookAt(slot.position.x - dx, slot.position.y - dy, slot.position.z + 8);
        g.rotateY(slot.yaw);
        g.rotateZ(slot.roll);
      }}
    >
      <ArchPhoto
        texture={texture}
        width={2.1}
        height={2.9}
        materialRef={material}
      />
    </group>
  );
};

/** O túnel de fotos: janelas em arco flutuando em espiral em volta do caminho da câmera. */
export const Tunnel = ({ still = false }: { still?: boolean }) => {
  const slots = useMemo(buildSlots, []);
  return (
    <group>
      {slots.map((slot, i) => (
        <TunnelPhoto key={i} index={i} slot={slot} still={still} />
      ))}
    </group>
  );
};
