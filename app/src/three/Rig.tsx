import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import { clamp, damp, lerp } from '../lib/math';
import { pointer } from '../lib/pointer';
import { cameraPose, getProgress, makePose, RING, ringYaw, serviceFloat } from '../lib/timeline';
import { world } from '../lib/worldState';
import { intro } from '../lib/intro';

type RigProps = { still: boolean };

/** Câmera: segue o scroll pela viagem, com um pouco de parallax do cursor e inclinação pela velocidade. */
export const Rig = ({ still }: RigProps) => {
  const size = useThree((s) => s.size);
  const pose = useMemo(makePose, []);
  const smooth = useRef<number | null>(null);
  const prev = useRef(0);
  const offset = useRef({ x: 0, y: 0, roll: 0 });
  const look = useMemo(() => new Vector3(), []);

  useFrame(({ camera }, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const portrait = size.width / size.height < 0.9;
    world.portrait = portrait;
    world.yaw = ringYaw(size.width / size.height);
    intro.value = damp(intro.value, intro.target, 1.1, dt);

    const target = window.scrollY;
    smooth.current = smooth.current === null ? target : damp(smooth.current, target, 16, dt);
    getProgress(smooth.current, world.tl);
    world.service = serviceFloat(world.tl.services, RING.count);

    cameraPose(world.tl, portrait, world.yaw, pose);

    const o = offset.current;
    const px = still ? 0 : pointer.x;
    const py = still ? 0 : pointer.y;
    o.x = damp(o.x, px, 3, dt);
    o.y = damp(o.y, py, 3, dt);

    const velocity = (smooth.current - prev.current) / Math.max(dt, 0.001);
    prev.current = smooth.current;
    o.roll = damp(o.roll, still ? 0 : clamp(velocity * -0.00005, -0.05, 0.05), 4, dt);

    camera.position.copy(pose.position);
    camera.position.x += o.x * 0.45;
    camera.position.y += o.y * 0.25;
    look.copy(pose.target);
    look.x += o.x * 0.9;
    look.y += o.y * 0.45;
    camera.lookAt(look);
    camera.rotateZ(o.roll);

    const cam = camera as PerspectiveCamera;
    const fov = portrait ? 64 : 50;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = lerp(cam.fov, fov, 0.2);
      cam.updateProjectionMatrix();
    }
  });

  return null;
};
