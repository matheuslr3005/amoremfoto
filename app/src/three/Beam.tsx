import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CanvasTexture, DoubleSide, MeshBasicMaterial } from 'three';

type BeamProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];
  opacity?: number;
  color?: string;
  phase?: number;
  still?: boolean;
};

const gradientTexture = () => {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const g = c.getContext('2d');
  if (g) {
    const v = g.createLinearGradient(0, 0, 0, 256);
    v.addColorStop(0, 'rgba(255,255,255,1)');
    v.addColorStop(0.6, 'rgba(255,255,255,0.35)');
    v.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = v;
    g.fillRect(0, 0, 64, 256);
    // bordas macias na horizontal
    g.globalCompositeOperation = 'destination-in';
    const h = g.createLinearGradient(0, 0, 64, 0);
    h.addColorStop(0, 'rgba(0,0,0,0)');
    h.addColorStop(0.5, 'rgba(0,0,0,1)');
    h.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = h;
    g.fillRect(0, 0, 64, 256);
  }
  return new CanvasTexture(c);
};

/** Feixe de luz de janela: plano aditivo com gradiente, pulsando de leve. */
export const Beam = ({ position, rotation = [0, 0, 0], size = [4, 16], opacity = 0.22, color = '#ffd9b8', phase = 0, still = false }: BeamProps) => {
  const mat = useRef<MeshBasicMaterial>(null);
  const map = useMemo(gradientTexture, []);

  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = opacity * (still ? 1 : 0.8 + 0.2 * Math.sin(clock.elapsedTime * 0.5 + phase));
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        ref={mat}
        map={map}
        color={color}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
        fog={false}
      />
    </mesh>
  );
};

const radialTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  if (g) {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    r.addColorStop(0, 'rgba(255,255,255,0.9)');
    r.addColorStop(0.35, 'rgba(255,255,255,0.28)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
  }
  return new CanvasTexture(c);
};

type HaloProps = { position: [number, number, number]; size?: number; opacity?: number; color?: string };

/** Brilho suave atrás da flor, como se a luz da janela a atravessasse. */
export const Halo = ({ position, size = 10, opacity = 0.4, color = '#ff9c84' }: HaloProps) => {
  const map = useMemo(radialTexture, []);
  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={map} color={color} transparent opacity={opacity} blending={AdditiveBlending} depthWrite={false} fog={false} />
    </mesh>
  );
};
