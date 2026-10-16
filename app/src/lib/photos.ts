import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace, Texture, TextureLoader } from 'three';
import type { PhotoKind } from '../config/site';
import { seeded } from './math';

/**
 * Fotos provisórias: cenas pintadas em baixa resolução e ampliadas (efeito "fora de foco"),
 * com bokeh de janela e grão. Servem de reserva até as fotos reais entrarem (campo `src`).
 */

type Palette = readonly [string, string, string, string]; // luz, meio, sombra, sujeito

const PALETTES: Record<PhotoKind, Palette> = {
  belly: ['#f9e7dc', '#e8bfae', '#a8665a', '#f3d3c4'],
  newborn: ['#f7ece4', '#e6cdbf', '#b08a78', '#f2dccd'],
  growth: ['#faeede', '#efcfa6', '#c48e63', '#f5dcc0'],
  kid: ['#fbecd8', '#f0c9a0', '#c98f6b', '#f4d6bd'],
  portrait: ['#efe3dd', '#cdb6ac', '#6c5148', '#2f2a31'],
  event: ['#f6dfd5', '#d99f90', '#7b4a47', '#f2c7b8'],
  studio: ['#fbf1e8', '#ecd2c1', '#b98d7c', '#fff7ee'],
  mentor: ['#f2e4da', '#dcb8a4', '#8b5a4d', '#2f2a31'],
};

const W = 640;
const H = 860;
const LOW = 4; // a cena é pintada em 1/4 da resolução e ampliada em etapas (sem blocos)

type Ctx = CanvasRenderingContext2D;

const blob = (g: Ctx, x: number, y: number, rx: number, ry: number, rot: number, c0: string, c1: string) => {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale(rx, ry);
  const r = g.createRadialGradient(-0.3, -0.35, 0.05, 0, 0, 1);
  r.addColorStop(0, c0);
  r.addColorStop(1, c1);
  g.fillStyle = r;
  g.beginPath();
  g.arc(0, 0, 1, 0, Math.PI * 2);
  g.fill();
  g.restore();
};

const paintScene = (g: Ctx, kind: PhotoKind, rnd: () => number, w: number, h: number) => {
  const [light, mid, shade, subject] = PALETTES[kind];

  const bg = g.createLinearGradient(0, 0, w * 0.9, h);
  bg.addColorStop(0, light);
  bg.addColorStop(0.55, mid);
  bg.addColorStop(1, shade);
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  // luz da janela entrando na diagonal
  const beam = g.createLinearGradient(w * 0.1, 0, w * 0.9, h * 0.7);
  beam.addColorStop(0, 'rgba(255,248,238,0.75)');
  beam.addColorStop(0.5, 'rgba(255,240,226,0.22)');
  beam.addColorStop(1, 'rgba(255,240,226,0)');
  g.fillStyle = beam;
  g.beginPath();
  g.moveTo(w * 0.05, 0);
  g.lineTo(w * 0.75, 0);
  g.lineTo(w * 1.1, h * 0.95);
  g.lineTo(w * 0.25, h * 0.95);
  g.fill();

  // bokeh
  for (let i = 0; i < 9; i++) {
    blob(g, rnd() * w, rnd() * h * 0.7, w * (0.04 + rnd() * 0.07), w * (0.04 + rnd() * 0.07), 0, 'rgba(255,244,230,0.5)', 'rgba(255,244,230,0)');
  }

  const cx = w * (0.42 + rnd() * 0.16);
  switch (kind) {
    case 'belly': {
      blob(g, cx, h * 0.62, w * 0.34, h * 0.3, -0.15, subject, shade);
      blob(g, cx + w * 0.02, h * 0.55, w * 0.26, w * 0.26, 0, 'rgba(255,230,214,0.9)', 'rgba(255,230,214,0)');
      blob(g, cx - w * 0.22, h * 0.88, w * 0.5, h * 0.2, 0.2, light, shade);
      break;
    }
    case 'newborn': {
      blob(g, cx, h * 0.72, w * 0.55, h * 0.2, 0.05, light, mid); // manta
      blob(g, cx, h * 0.66, w * 0.3, h * 0.12, -0.08, subject, shade); // corpo
      blob(g, cx - w * 0.2, h * 0.62, w * 0.11, w * 0.11, 0, '#f7dccb', '#d4a690'); // cabeça
      break;
    }
    case 'growth': {
      blob(g, cx, h * 0.7, w * 0.5, h * 0.24, 0, light, mid);
      blob(g, cx, h * 0.6, w * 0.2, h * 0.14, 0, subject, shade);
      blob(g, cx, h * 0.45, w * 0.12, w * 0.12, 0, '#f7dccb', '#cf9c84');
      blob(g, w * 0.82, h * 0.24, w * 0.09, w * 0.09, 0, '#fff4e4', 'rgba(255,244,228,0)');
      break;
    }
    case 'kid': {
      blob(g, cx, h * 0.72, w * 0.26, h * 0.22, 0.05, subject, shade);
      blob(g, cx, h * 0.46, w * 0.13, w * 0.13, 0, '#f7dccb', '#cf9c84');
      blob(g, w * 0.76, h * 0.3, w * 0.13, w * 0.13, 0, '#ffb9a4', '#d3705f'); // balão
      blob(g, w * 0.2, h * 0.38, w * 0.09, w * 0.09, 0, '#ffe3a8', '#e0a85a');
      break;
    }
    case 'portrait':
    case 'mentor': {
      blob(g, cx, h * 0.96, w * 0.52, h * 0.34, 0, subject, '#1b171d'); // ombros
      blob(g, cx, h * 0.4, w * 0.15, w * 0.19, 0, '#f1d3c2', '#bd8c78'); // rosto
      blob(g, cx, h * 0.32, w * 0.17, w * 0.14, 0, '#4a3730', '#2a1f1c'); // cabelo
      break;
    }
    case 'event': {
      for (let i = 0; i < 14; i++) {
        blob(g, rnd() * w, h * (0.1 + rnd() * 0.45), w * (0.03 + rnd() * 0.06), w * (0.03 + rnd() * 0.06), 0, 'rgba(255,214,170,0.9)', 'rgba(255,214,170,0)');
      }
      blob(g, w * 0.36, h * 0.78, w * 0.2, h * 0.26, 0, subject, shade);
      blob(g, w * 0.64, h * 0.8, w * 0.2, h * 0.26, 0, '#e9b3a4', shade);
      blob(g, w * 0.36, h * 0.5, w * 0.08, w * 0.08, 0, '#f7dccb', '#cf9c84');
      blob(g, w * 0.64, h * 0.52, w * 0.08, w * 0.08, 0, '#f7dccb', '#cf9c84');
      break;
    }
    case 'studio': {
      // janela com divisórias e feixe de luz no chão
      g.fillStyle = 'rgba(255,250,242,0.95)';
      g.fillRect(w * 0.2, h * 0.1, w * 0.6, h * 0.5);
      g.fillStyle = mid;
      g.fillRect(w * 0.49, h * 0.1, w * 0.02, h * 0.5);
      g.fillRect(w * 0.2, h * 0.34, w * 0.6, h * 0.02);
      blob(g, cx, h * 0.86, w * 0.5, h * 0.12, 0.1, 'rgba(255,244,230,0.9)', 'rgba(255,244,230,0)');
      break;
    }
  }

  // vinheta quente
  const v = g.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, h * 0.75);
  v.addColorStop(0, 'rgba(60,30,25,0)');
  v.addColorStop(1, 'rgba(60,30,25,0.35)');
  g.fillStyle = v;
  g.fillRect(0, 0, w, h);
};

const canvasOf = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

/** Amplia em etapas de 2x com suavização: evita o serrilhado/blocos de uma ampliação única. */
const upscale = (src: HTMLCanvasElement, w: number, h: number) => {
  let cur = src;
  while (cur.width * 2 < w) {
    const next = canvasOf(cur.width * 2, cur.height * 2);
    const g = next.getContext('2d');
    if (!g) break;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(cur, 0, 0, next.width, next.height);
    cur = next;
  }
  const out = canvasOf(w, h);
  const g = out.getContext('2d');
  if (g) {
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(cur, 0, 0, w, h);
  }
  return out;
};

export const makePhotoCanvas = (kind: PhotoKind, seed: number): HTMLCanvasElement => {
  const rnd = seeded(seed + 7);
  const low = canvasOf(Math.round(W / LOW), Math.round(H / LOW));
  const lg = low.getContext('2d');
  if (!lg) return low;
  paintScene(lg, kind, rnd, low.width, low.height);

  const out = upscale(low, W, H);
  const g = out.getContext('2d');
  if (!g) return out;

  // só um dither bem fraco: quebra as faixas dos degradês sem virar "estática"
  const px = g.getImageData(0, 0, W, H);
  const d = px.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 3;
    d[i] = (d[i] ?? 0) + n;
    d[i + 1] = (d[i + 1] ?? 0) + n;
    d[i + 2] = (d[i + 2] ?? 0) + n;
  }
  g.putImageData(px, 0, 0);
  return out;
};

const urlCache = new Map<string, string>();
/** URL (data:) da foto provisória, para usar em CSS/`<img>`. */
export const photoUrl = (kind: PhotoKind, seed: number, src?: string) => {
  if (src) return src;
  const key = `${kind}:${seed}`;
  const hit = urlCache.get(key);
  if (hit) return hit;
  const url = makePhotoCanvas(kind, seed).toDataURL('image/jpeg', 0.86);
  urlCache.set(key, url);
  return url;
};

const textureCache = new Map<string, Texture>();
const loader = new TextureLoader();

/** Textura para o WebGL: carrega a foto real se houver `src`, senão usa a provisória. */
export const photoTexture = (kind: PhotoKind, seed: number, src?: string): Texture => {
  const key = src ?? `${kind}:${seed}`;
  const hit = textureCache.get(key);
  if (hit) return hit;

  const tex = src ? loader.load(src) : new CanvasTexture(makePhotoCanvas(kind, seed));
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 16;
  tex.minFilter = LinearMipmapLinearFilter;
  textureCache.set(key, tex);
  return tex;
};
