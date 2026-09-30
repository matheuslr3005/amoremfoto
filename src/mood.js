import * as THREE from 'three';

// "Hora do dia": a luz do site inteiro (CSS + WebGL) interpola entre esses presets.
export const MOODS = [
  {
    id: 'manha',
    label: 'Manhã',
    bg: ['#eef2f0', '#e0e8e7', '#cfdcdd'],
    ink: '#1f2a2d',
    accent: '#c26a4c',
    light: '#e9f1ff',
    key: 2.1,
    hemi: 0.75,
    env: 0.7,
    shadow: '#3c4c5a',
    shadowOp: 0.16,
    ball: '#ffd9a3',
    ballEmit: 0.18,
    glow: '#fff1cf',
    glowOp: 0.7,
    beam: 0.55,
    dir: [-0.2, 0.26],
  },
  {
    id: 'tarde',
    label: 'Tarde',
    bg: ['#f9f0e5', '#f1dfca', '#e6c9ad'],
    ink: '#2a1f19',
    accent: '#c4633f',
    light: '#fff0da',
    key: 2.3,
    hemi: 0.7,
    env: 0.62,
    shadow: '#5a3a28',
    shadowOp: 0.22,
    ball: '#ffc178',
    ballEmit: 0.28,
    glow: '#ffdcae',
    glowOp: 0.75,
    beam: 0.7,
    dir: [-0.22, 0.28],
  },
  {
    id: 'entardecer',
    label: 'Entardecer',
    bg: ['#f7dfcd', '#efc0a6', '#d99a84'],
    ink: '#33201a',
    accent: '#b4482f',
    light: '#ffc594',
    key: 2.5,
    hemi: 0.55,
    env: 0.5,
    shadow: '#6a2f22',
    shadowOp: 0.3,
    ball: '#ff9a52',
    ballEmit: 0.4,
    glow: '#ffb27a',
    glowOp: 0.85,
    beam: 0.9,
    dir: [-0.3, 0.2],
  },
];

const C = (h) => new THREE.Color(h);
const parsed = MOODS.map((m) => ({
  bg: m.bg.map(C),
  ink: C(m.ink),
  accent: C(m.accent),
  light: C(m.light),
  shadow: C(m.shadow),
  ball: C(m.ball),
  glow: C(m.glow),
}));

const cssColor = (c) => `#${c.getHexString()}`;

// amostra o "mood" contínuo m ∈ [0, 2]; escreve em `out` (reutilizável)
export function sampleMood(m, out) {
  m = Math.min(2, Math.max(0, m));
  const i = Math.min(1, Math.floor(m));
  const t = m - i;
  const A = MOODS[i];
  const B = MOODS[i + 1];
  const pa = parsed[i];
  const pb = parsed[i + 1];
  const n = (k) => A[k] + (B[k] - A[k]) * t;

  out.key = n('key');
  out.hemi = n('hemi');
  out.env = n('env');
  out.shadowOp = n('shadowOp');
  out.ballEmit = n('ballEmit');
  out.glowOp = n('glowOp');
  out.beam = n('beam');
  out.dirX = A.dir[0] + (B.dir[0] - A.dir[0]) * t;
  out.dirY = A.dir[1] + (B.dir[1] - A.dir[1]) * t;

  const lc = (k) => (out[k] ??= new THREE.Color()).copy(pa[k]).lerp(pb[k], t);
  out.light = lc('light');
  out.shadow = lc('shadow');
  out.ball = lc('ball');
  out.glow = lc('glow');

  const cc = (k) => (out['_' + k] ??= new THREE.Color()).copy(pa[k]).lerp(pb[k], t);
  out.css = {
    '--bg1': cssColor((out._b1 ??= new THREE.Color()).copy(pa.bg[0]).lerp(pb.bg[0], t)),
    '--bg2': cssColor((out._b2 ??= new THREE.Color()).copy(pa.bg[1]).lerp(pb.bg[1], t)),
    '--bg3': cssColor((out._b3 ??= new THREE.Color()).copy(pa.bg[2]).lerp(pb.bg[2], t)),
    '--ink': cssColor(cc('ink')),
    '--accent': cssColor(cc('accent')),
    '--beam': n('beam').toFixed(3),
  };
  return out;
}
