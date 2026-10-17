import { Component, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { clamp, lerp } from '../lib/math';
import { BG, Scene } from './Scene';

type WorldProps = {
  still: boolean;
  lite: boolean;
  onReady: () => void;
  onFail: () => void;
};

type BoundaryProps = { onFail: () => void; children: ReactNode };

/** Se o WebGL falhar em qualquer ponto, o site continua funcionando só com o HTML. */
class WorldBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function World({ still, lite, onReady, onFail }: WorldProps) {
  const maxDpr = lite ? 1.25 : 1.5;
  const minDpr = lite ? 0.7 : 0.8;
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, maxDpr));
  const [fx, setFx] = useState(true);

  return (
    <WorldBoundary onFail={onFail}>
      <Canvas
        className="world"
        dpr={dpr}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: 50, near: 0.1, far: 260, position: [0, 0.9, 8] }}
        style={{ background: BG }}
        aria-hidden
      >
        {/* Mede os frames: se a máquina não aguenta, baixa a resolução aos poucos (e, em último caso, o pós-processamento). */}
        <PerformanceMonitor
          ms={250}
          iterations={8}
          flipflops={3}
          onChange={({ factor }) => setDpr(clamp(lerp(minDpr, maxDpr, factor), minDpr, maxDpr))}
          onFallback={() => {
            setDpr(minDpr);
            setFx(false);
          }}
        />
        <Scene still={still} lite={lite} fx={fx} onReady={onReady} />
      </Canvas>
    </WorldBoundary>
  );
}
