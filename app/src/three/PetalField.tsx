import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DoubleSide, InstancedMesh, Object3D } from 'three';
import { petalGeometry } from './geometry';
import { seeded } from '../lib/math';

type PetalFieldProps = { count: number; still?: boolean };

const PALETTE = ['#e8bfb0', '#cf9a89', '#f6dccf', '#b8806f', '#ffd9b8'];

/** Pétalas minúsculas caindo devagar por todo o mundo: dão profundidade e vida ao trajeto. */
export const PetalField = ({ count, still = false }: PetalFieldProps) => {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const geo = useMemo(() => petalGeometry(1, 0.72, 10, 6), []);

  const data = useMemo(() => {
    const rnd = seeded(11);
    return Array.from({ length: count }, () => ({
      x: (rnd() - 0.5) * 22,
      y: (rnd() - 0.5) * 12,
      z: 10 - rnd() * 165,
      s: 0.05 + rnd() * 0.12,
      fall: 0.12 + rnd() * 0.35,
      sway: rnd() * Math.PI * 2,
      spin: [rnd() * 3, rnd() * 3, rnd() * 3] as const,
      color: PALETTE[Math.floor(rnd() * PALETTE.length)] ?? '#e8bfb0',
    }));
  }, [count]);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const c = new Color();
    data.forEach((d, i) => m.setColorAt(i, c.set(d.color)));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = still ? 0 : clock.elapsedTime;
    data.forEach((d, i) => {
      const y = ((((d.y - t * d.fall + 6) % 12) + 12) % 12) - 6;
      dummy.position.set(d.x + Math.sin(t * 0.4 + d.sway) * 0.6, y, d.z);
      dummy.rotation.set(t * d.spin[0], t * d.spin[1] + d.sway, t * d.spin[2]);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial side={DoubleSide} roughness={0.5} emissive="#6a3a30" emissiveIntensity={0.4} />
    </instancedMesh>
  );
};
