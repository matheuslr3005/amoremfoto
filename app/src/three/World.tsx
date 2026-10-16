import { Component, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
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
  return (
    <WorldBoundary onFail={onFail}>
      <Canvas
        className="world"
        dpr={lite ? [1, 1.5] : [1, 1.75]}
        gl={{ antialias: lite, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        camera={{ fov: 50, near: 0.1, far: 260, position: [0, 0.9, 8] }}
        style={{ background: BG }}
        onCreated={() => onReady()}
        aria-hidden
      >
        <Scene still={still} lite={lite} />
      </Canvas>
    </WorldBoundary>
  );
}
