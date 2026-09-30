// Linha do tempo do scroll da "história" (0..1).
// hold = orbe parado no hero · move = câmera desce de uma cena para a outra · act = a esfera faz sua ação na cena.

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

export const SEGS = [
  { kind: 'hold', scene: 0, a: 0, b: 0.07 },
  { kind: 'move', from: 0, to: 1, a: 0.07, b: 0.22 },
  { kind: 'act', scene: 1, a: 0.22, b: 0.38 },
  { kind: 'move', from: 1, to: 2, a: 0.38, b: 0.53 },
  { kind: 'act', scene: 2, a: 0.53, b: 0.69 },
  { kind: 'move', from: 2, to: 3, a: 0.69, b: 0.84 },
  { kind: 'act', scene: 3, a: 0.84, b: 1.0 },
];

// p (0..1) de onde cada cena está "assentada" – usado pelos pontos de navegação
export const SCENE_P = [0, 0.3, 0.61, 0.92];

const out = { kind: 'hold', scene: 0, from: 0, to: 0, u: 0, camT: 0 };

export function stageAt(p) {
  p = clamp(p);
  let seg = SEGS[SEGS.length - 1];
  for (const s of SEGS) {
    if (p <= s.b) {
      seg = s;
      break;
    }
  }
  const u = clamp((p - seg.a) / (seg.b - seg.a));
  out.kind = seg.kind;
  out.u = u;
  out.scene = seg.scene ?? 0;
  out.from = seg.from ?? seg.scene ?? 0;
  out.to = seg.to ?? seg.scene ?? 0;
  out.camT = seg.kind === 'move' ? lerp(seg.from, seg.to, easeInOutCubic(u)) : seg.scene;
  return out;
}

// posição da câmera (em "telas") para um u dentro de um segmento move
export const camAtMove = (from, to, u) => lerp(from, to, easeInOutCubic(u));
