// ─────────────────────────────────────────────────────────────
//  FOTOS DA GALERIA
//  Enquanto não há fotos reais, cada item gera uma "foto" abstrata
//  em tons de luz natural. Para usar uma foto de verdade, basta
//  preencher `src` (ex.: '/fotos/ensaio-01.jpg').
// ─────────────────────────────────────────────────────────────

export const PHOTOS = [
  { title: 'Primeiro sono', tag: 'Newborn', tone: 0 },
  { title: 'A espera', tag: 'Gestante', tone: 2 },
  { title: 'Brincar', tag: 'Infantil', tone: 4 },
  { title: 'Retrato', tag: 'Corporativo', tone: 5 },
  { title: 'Mãozinhas', tag: 'Newborn', tone: 3 },
  { title: 'Celebrar', tag: 'Evento', tone: 1 },
  { title: 'Mês a mês', tag: 'Acompanhamento', tone: 2 },
  { title: 'Luz da janela', tag: 'Gestante', tone: 0 },
];

export const TONES = [
  ['#f8e9e3', '#e9c6bb', '#b07468'],
  ['#f0f1e6', '#d3dcc4', '#a4b28f'],
  ['#fbece8', '#f0cdc6', '#d49b92'],
  ['#f2ebe0', '#ddd0bf', '#b9a58c'],
  ['#f8ebd3', '#f1cd94', '#d99e5c'],
  ['#ecf0f2', '#cdd8e0', '#a2b3c1'],
];

function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function makePhotoCanvas(i, tone, W = 520, H = 650) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const r = rng(i + 3);
  const [lite, mid, deep] = TONES[tone % TONES.length];

  // fundo
  let gr = g.createLinearGradient(0, 0, W * 0.8, H);
  gr.addColorStop(0, lite);
  gr.addColorStop(0.55, mid);
  gr.addColorStop(1, deep);
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);

  // manta / tecido: elipses macias
  const blob = (cx, cy, rx, ry, rot, c1, c2, a = 1) => {
    g.save();
    g.translate(cx, cy);
    g.rotate(rot);
    g.scale(rx, ry);
    const rg = g.createRadialGradient(-0.3, -0.4, 0.05, 0, 0, 1);
    rg.addColorStop(0, c1);
    rg.addColorStop(1, c2);
    g.globalAlpha = a;
    g.fillStyle = rg;
    g.beginPath();
    g.arc(0, 0, 1, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  const jitter = () => (r() - 0.5) * 40;
  blob(W * 0.5 + jitter(), H * 0.72, W * 0.62, H * 0.2, -0.08 + (r() - 0.5) * 0.2, lite, deep, 0.9);
  blob(W * 0.44 + jitter(), H * 0.6, W * 0.4, H * 0.17, 0.12 + (r() - 0.5) * 0.2, '#ffffff', mid, 0.85);
  // "cabecinha"
  blob(W * 0.38 + jitter(), H * 0.5, W * 0.13, W * 0.13, 0, '#fff4e8', deep, 0.95);
  // dobras
  for (let k = 0; k < 3; k++) {
    blob(W * (0.35 + r() * 0.4), H * (0.55 + r() * 0.25), W * 0.35, H * 0.05, (r() - 0.5) * 0.5, '#ffffff', deep, 0.35);
  }

  // feixes de luz da janela
  g.globalCompositeOperation = 'soft-light';
  const beams = 3;
  for (let b = 0; b < beams; b++) {
    const x0 = W * (0.05 + b * 0.36 + r() * 0.06);
    const bw = W * 0.2;
    const bg = g.createLinearGradient(x0, 0, x0 + bw, 0);
    bg.addColorStop(0, 'rgba(255,255,255,0)');
    bg.addColorStop(0.5, 'rgba(255,255,255,0.75)');
    bg.addColorStop(1, 'rgba(255,255,255,0)');
    g.save();
    g.translate(W / 2, H / 2);
    g.rotate(0.35);
    g.translate(-W / 2, -H / 2);
    g.fillStyle = bg;
    g.fillRect(x0 - W * 0.4, -H * 0.5, bw, H * 2);
    g.restore();
  }
  g.globalCompositeOperation = 'source-over';

  // vinheta suave
  const vg = g.createRadialGradient(W / 2, H * 0.45, W * 0.25, W / 2, H / 2, H * 0.85);
  vg.addColorStop(0, 'rgba(60,30,15,0)');
  vg.addColorStop(1, 'rgba(60,30,15,0.28)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);

  // grão
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  for (let p = 0; p < d.length; p += 4) {
    const n = (r() - 0.5) * 16;
    d[p] += n;
    d[p + 1] += n;
    d[p + 2] += n;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function makePhoto(i, tone) {
  return makePhotoCanvas(i, tone).toDataURL('image/jpeg', 0.86);
}
