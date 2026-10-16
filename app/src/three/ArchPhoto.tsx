import { forwardRef, useMemo, type RefObject } from 'react';
import { DoubleSide, Group, type MeshBasicMaterial, type Texture } from 'three';
import { archGeometry } from './geometry';

type ArchPhotoProps = {
  texture: Texture;
  width: number;
  height: number;
  frame?: string;
  /** acesso ao material da foto, para escurecer/revelar a cada frame */
  materialRef?: RefObject<MeshBasicMaterial | null>;
};

/** Foto em forma de janela em arco, com moldura de luz atrás. */
export const ArchPhoto = forwardRef<Group, ArchPhotoProps>(({ texture, width, height, frame = '#f1cdbf', materialRef }, ref) => {
  const photo = useMemo(() => archGeometry(width, height), [width, height]);
  const border = useMemo(() => archGeometry(width + 0.2, height + 0.2), [width, height]);
  return (
    <group ref={ref}>
      <mesh geometry={border} position={[0, 0, -0.012]}>
        <meshBasicMaterial color={frame} side={DoubleSide} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <mesh geometry={photo}>
        <meshBasicMaterial ref={materialRef} map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
});
ArchPhoto.displayName = 'ArchPhoto';
