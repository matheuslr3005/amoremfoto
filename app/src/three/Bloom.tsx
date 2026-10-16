import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DoubleSide, Float32BufferAttribute, Group, Mesh, PointLight } from 'three';
import { heartGeometry, petalGeometry } from './geometry';
import { clamp, lerp } from '../lib/math';

type RingSpec = {
  count: number;
  scale: number;
  tilt: readonly [closed: number, open: number];
  radius: number;
  offset: number;
  base: string;
  tip: string;
};

// De fora para dentro: marrom-rosado → rosé → blush (as cores do logo).
const RINGS: readonly RingSpec[] = [
  { count: 7, scale: 1.0, tilt: [0.08, 1.2], radius: 0.28, offset: 0, base: '#8a5648', tip: '#d3a090' },
  { count: 7, scale: 0.86, tilt: [0.02, 0.86], radius: 0.2, offset: Math.PI / 7, base: '#cf9a89', tip: '#efcfc3' },
  { count: 6, scale: 0.66, tilt: [-0.08, 0.5], radius: 0.12, offset: 0.2, base: '#ecc3b5', tip: '#fbe9e0' },
];

const petalColors = (geo: ReturnType<typeof petalGeometry>, base: string, tip: string) => {
  const a = new Color(base);
  const b = new Color(tip);
  const uv = geo.getAttribute('uv');
  const colors: number[] = [];
  const c = new Color();
  for (let i = 0; i < uv.count; i++) {
    c.lerpColors(a, b, Math.pow(uv.getY(i), 1.3));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  return geo;
};

type BloomProps = {
  /** 0 = botão fechado · 1 = flor aberta. Lido a cada frame (não causa re-render). */
  getOpen: () => number;
  /** escala do coração central (some quando a câmera sobrevoa) */
  getHeart?: () => number;
  position?: [number, number, number];
  scale?: number;
  still?: boolean;
};

export const Bloom = ({ getOpen, getHeart, position = [0, 0, 0], scale = 1, still = false }: BloomProps) => {
  const root = useRef<Group>(null);
  const heart = useRef<Mesh>(null);
  const glow = useRef<PointLight>(null);
  const petals = useRef<Group[]>([]);

  const heartGeo = useMemo(() => heartGeometry(), []);
  const geos = useMemo(() => RINGS.map((r) => petalColors(petalGeometry(1.9 * r.scale, 0.72 * r.scale), r.base, r.tip)), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const open = clamp(getOpen());
    const breathe = still ? 0 : Math.sin(t * 0.9) * 0.025;

    let k = 0;
    RINGS.forEach((ring, ri) => {
      for (let i = 0; i < ring.count; i++) {
        const g = petals.current[k++];
        if (!g) continue;
        const wobble = still ? 0 : Math.sin(t * 0.8 + i * 1.7 + ri) * 0.025;
        g.rotation.x = lerp(ring.tilt[0], ring.tilt[1], open) + breathe + wobble;
      }
    });

    if (root.current && !still) root.current.rotation.y += dt * (0.05 + 0.12 * open);

    const hs = getHeart ? getHeart() : 1;
    if (heart.current) {
      const beat = still ? 1 : 1 + 0.035 * Math.sin(t * 2.4) + 0.02 * Math.sin(t * 4.8);
      const s = 0.62 * hs * beat;
      heart.current.scale.setScalar(Math.max(s, 0.0001));
      heart.current.position.y = 1.05 + open * 0.55;
      heart.current.visible = hs > 0.01;
      heart.current.rotation.y = still ? 0 : Math.sin(t * 0.6) * 0.28;
    }
    if (glow.current) glow.current.intensity = (4 + open * 6) * Math.max(hs, 0.2);
  });

  petals.current.length = 0;
  let key = 0;

  return (
    <group position={position} scale={scale}>
      <group ref={root}>
        {RINGS.map((ring, ri) =>
          Array.from({ length: ring.count }, (_, i) => {
            const a = ring.offset + (i / ring.count) * Math.PI * 2;
            const myKey = key++;
            return (
              <group key={myKey} rotation={[0, a, 0]}>
                <group
                  position={[0, 0, ring.radius]}
                  ref={(g) => {
                    if (g) petals.current[myKey] = g;
                  }}
                >
                  <mesh geometry={geos[ri]} castShadow>
                    <meshPhysicalMaterial
                      vertexColors
                      side={DoubleSide}
                      roughness={0.42}
                      sheen={1}
                      sheenColor="#ffd9cc"
                      sheenRoughness={0.4}
                      clearcoat={0.35}
                      clearcoatRoughness={0.4}
                      emissive="#4a2420"
                      emissiveIntensity={0.12}
                    />
                  </mesh>
                </group>
              </group>
            );
          }),
        )}
        <pointLight ref={glow} position={[0, 1.3, 0.6]} color="#ffb59c" intensity={5} distance={9} decay={2} />
      </group>
      <mesh ref={heart} geometry={heartGeo} position={[0, 1.05, 0]}>
        <meshPhysicalMaterial
          color="#f1c4b6"
          roughness={0.28}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.15}
          sheen={1}
          sheenColor="#ffe3d8"
          emissive="#ff9c84"
          emissiveIntensity={0.34}
        />
      </mesh>
    </group>
  );
};
