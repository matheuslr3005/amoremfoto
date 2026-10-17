import { Vector3 } from 'three';
import { clamp, easeInOut, invLerp, smoothstep } from './math';

/**
 * O site é UMA viagem de câmera por um mundo 3D. Cada seção da página ("estágio") ocupa um trecho
 * do scroll; aqui está a conversão scroll → progresso do estágio → pose da câmera.
 * As seções se marcam no HTML com `data-stage="..."`.
 */
export type StageId = 'hero' | 'journey' | 'manifesto' | 'services' | 'studio' | 'contact';
export type Progress = Record<StageId, number>;

type Range = readonly [number, number];

const ranges: Partial<Record<StageId, Range>> = {};
let ready = false;

export const measureStages = () => {
  const vh = window.innerHeight;
  const rect = (id: string) => {
    const el = document.querySelector<HTMLElement>(`[data-stage="${id}"]`);
    if (!el) return null;
    const box = el.getBoundingClientRect();
    return { top: box.top + window.scrollY, height: box.height };
  };
  const journey = rect('journey');
  const services = rect('services');
  const contact = rect('contact');
  if (!journey || !services || !contact) return;

  const docEnd = Math.max(document.documentElement.scrollHeight - vh, contact.top + 1);
  const journeyEnd = journey.top + journey.height - vh;
  const servicesEnd = services.top + services.height - vh;

  ranges.hero = [0, journey.top];
  ranges.journey = [journey.top, journeyEnd];
  ranges.manifesto = [journeyEnd, services.top];
  ranges.services = [services.top, servicesEnd];
  ranges.studio = [servicesEnd, contact.top];
  ranges.contact = [contact.top, docEnd];
  ready = true;
};

/** Trecho de scroll (em px) de um estágio, já medido. Evita ler o layout a cada evento de scroll. */
export const stageSpan = (id: StageId): Range | undefined => (ready ? ranges[id] : undefined);

export const getProgress = (y: number, out: Progress): Progress => {
  (Object.keys(out) as StageId[]).forEach((id) => {
    const r = ranges[id];
    out[id] = r && ready ? invLerp(r[0], r[1], y) : 0;
  });
  return out;
};

export const makeProgress = (): Progress => ({
  hero: 0,
  journey: 0,
  manifesto: 0,
  services: 0,
  studio: 0,
  contact: 0,
});

// ── mundo ─────────────────────────────────────────────────────

/** Eixo central do túnel de fotos: serpenteia suavemente para os lados. */
export const tunnelCenter = (z: number, out = new Vector3()) =>
  out.set(3.2 * Math.sin(z * 0.06), 0.4 * Math.sin(z * 0.09), z);

export const TUNNEL = { start: -10, end: -82, photos: 28 } as const;

export const RING = {
  center: new Vector3(0, 0, -106),
  radius: 7,
  count: 6,
} as const;

const RING_STEP = (Math.PI * 2) / RING.count;

/** Quanto o cartão ativo fica deslocado para a direita (abre espaço para o texto à esquerda). */
export const ringYaw = (aspect: number) => (aspect < 0.9 ? 0 : Math.min(0.22, Math.max(0.1, 0.1 + (aspect - 1.2) * 0.14)));

export const CONTACT_BLOOM = new Vector3(0, -0.5, -146);

/** Posição fracionária do cartão ativo: segura cada cartão por um trecho do scroll. */
export const serviceFloat = (p: number, count: number) => {
  const x = clamp(p) * (count - 1);
  const i = Math.floor(x);
  if (i >= count - 1) return count - 1;
  return i + smoothstep(0.34, 0.66, x - i);
};

// ── câmera ────────────────────────────────────────────────────

/** Ponto na fresta entre dois cartões (ângulo medido a partir da frente do anel). */
const gapPoint = (angle: number, extra: number, out: Vector3) =>
  out.set(
    RING.center.x + (RING.radius + extra) * Math.sin(angle),
    0,
    RING.center.z - (RING.radius + extra) * Math.cos(angle),
  );

const OUT_POINT = new Vector3(0, 0.3, RING.center.z - 20);

const tmpA = new Vector3();
const tmpB = new Vector3();

export type Pose = { position: Vector3; target: Vector3 };

export const makePose = (): Pose => ({ position: new Vector3(), target: new Vector3() });

export const cameraPose = (tl: Progress, portrait: boolean, yaw: number, out: Pose): Pose => {
  const { position: pos, target } = out;

  if (tl.hero < 1) {
    // 1 · sobrevoo da flor: de frente → por cima → entrada do túnel
    const t = easeInOut(tl.hero);
    const start = tmpA.set(0, portrait ? 0.4 : 0.9, portrait ? 10.5 : 8);
    const end = tunnelCenter(TUNNEL.start, tmpB);
    pos.lerpVectors(start, end, t);
    pos.y += 2.6 * Math.sin(Math.PI * t);
    const ahead = tunnelCenter(TUNNEL.start - 10, tmpB);
    target.set(t * ahead.x, (1 - t) * (portrait ? -0.6 : 0.5) + t * ahead.y, t * ahead.z);
    return out;
  }

  if (tl.journey < 1) {
    // 2 · túnel de fotos
    const z = TUNNEL.start + (TUNNEL.end - TUNNEL.start) * tl.journey;
    tunnelCenter(z, pos);
    tunnelCenter(z - 10, target);
    return out;
  }

  if (tl.manifesto < 1) {
    // 3 · do fim do túnel, pela fresta do anel, até o centro dele
    const t = easeInOut(tl.manifesto);
    tunnelCenter(TUNNEL.end, tmpA);
    const gate = gapPoint(yaw + RING_STEP * 2.5, 1.2, tmpB);
    if (t < 0.72) pos.lerpVectors(tmpA, gate, t / 0.72);
    else pos.lerpVectors(gate, RING.center, (t - 0.72) / 0.28);
    target.copy(pos).add(tmpB.set(0, 0, -10));
    return out;
  }

  if (tl.services < 1) {
    // 4 · dentro do anel: a câmera fica parada, o anel gira
    pos.copy(RING.center);
    target.copy(pos).add(tmpB.set(0, portrait ? -1.6 : 0, -10));
    return out;
  }

  if (tl.studio < 1) {
    // 5 · sai do anel pela fresta da frente e segue para o estúdio
    const t = easeInOut(tl.studio);
    const gate = gapPoint(yaw - RING_STEP * 0.5, 1.2, tmpA);
    if (t < 0.3) pos.lerpVectors(RING.center, gate, t / 0.3);
    else pos.lerpVectors(gate, OUT_POINT, (t - 0.3) / 0.7);
    target.copy(pos).add(tmpB.set(0, 0, -10));
    return out;
  }

  // 6 · chegada à flor do contato
  const t = easeInOut(tl.contact);
  const to = tmpB.set(0, 0.7, CONTACT_BLOOM.z + 11);
  pos.lerpVectors(OUT_POINT, to, t);
  target.set(portrait ? 0 : CONTACT_BLOOM.x * 0.2, portrait ? -0.2 : 0.4, CONTACT_BLOOM.z);
  return out;
};
