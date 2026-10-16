import { makeProgress, type Progress } from './timeline';

/** Estado compartilhado do mundo 3D, atualizado a cada frame pela câmera e lido pelas cenas. */
export const world: {
  tl: Progress;
  portrait: boolean;
  yaw: number;
  /** posição fracionária do serviço ativo no anel */
  service: number;
} = { tl: makeProgress(), portrait: false, yaw: 0.2, service: 0 };
