import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/manrope';
import './styles.css';

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { createWorld } from './gl.js';
import { createStory } from './story.js';
import { createGallery } from './gallery.js';
import { sampleMood, MOODS } from './mood.js';
import { clamp, stageAt, SCENE_P } from './timeline.js';

gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

const storyEl = document.getElementById('story');
const sticky = storyEl.querySelector('.story__sticky');
const canvas = document.getElementById('gl');

// ───────────── WebGL ─────────────
let world = null;
try {
  world = createWorld(canvas);
} catch (err) {
  console.warn('WebGL indisponível — usando layout simples.', err);
  root.classList.add('no-gl');
}
const story = createStory(sticky);

// ───────────── scroll suave ─────────────
const lenis = reduced ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
if (lenis) lenis.on('scroll', ScrollTrigger.update);
const getScroll = () => (lenis ? lenis.scroll : window.scrollY);

// ───────────── medidas ─────────────
const M = { top: 0, h: 1, vh: 1, W: 1 };
function measure() {
  M.vh = sticky.clientHeight;
  M.W = sticky.clientWidth;
  const r = storyEl.getBoundingClientRect();
  M.top = r.top + window.scrollY;
  M.h = storyEl.offsetHeight;
  if (world) world.resize(M.W, M.vh, window.devicePixelRatio);
}
new ResizeObserver(() => {
  measure();
  ScrollTrigger.refresh();
}).observe(sticky);
measure();

// ───────────── hora do dia ─────────────
const tod = { v: 1 };
const todBtns = [...document.querySelectorAll('.tod__btn')];
const dial = document.querySelector('.dial__range');
const dialOut = document.querySelector('.dial__out');
const beams = [...document.querySelectorAll('.bg__beam')];
const moodOut = {};
let todTween = null;

function applyMood() {
  const m = sampleMood(tod.v, moodOut);
  for (const k in m.css) root.style.setProperty(k, m.css[k]);
  if (world) world.setMood(tod.v);
  const idx = Math.round(tod.v);
  todBtns.forEach((b, i) => b.classList.toggle('is-on', i === idx));
  dialOut.textContent = MOODS[idx].label;
  if (document.activeElement !== dial) dial.value = tod.v;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = m.css['--bg2'];
}
function setMood(v, animate = true) {
  todTween?.kill();
  if (!animate) {
    tod.v = v;
    applyMood();
    return;
  }
  todTween = gsap.to(tod, { v, duration: 1.5, ease: 'power3.inOut', onUpdate: applyMood });
}
todBtns.forEach((b) => b.addEventListener('click', () => setMood(Number(b.dataset.mood))));
dial.addEventListener('input', () => setMood(Number(dial.value), false));
applyMood();

// ───────────── ponteiro ─────────────
const ptr = { x: 0, y: 0 };
const spot = document.querySelector('.cursor-light');
const label = document.querySelector('.cursor-label');
if (fine) {
  const spotX = gsap.quickTo(spot, 'x', { duration: 0.9, ease: 'power3.out' });
  const spotY = gsap.quickTo(spot, 'y', { duration: 0.9, ease: 'power3.out' });
  const lblX = gsap.quickTo(label, 'x', { duration: 0.35, ease: 'power3.out' });
  const lblY = gsap.quickTo(label, 'y', { duration: 0.35, ease: 'power3.out' });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.y = -((e.clientY / window.innerHeight) * 2 - 1);
    spotX(e.clientX);
    spotY(e.clientY);
    lblX(e.clientX);
    lblY(e.clientY);
    spot.classList.add('is-on');
    world?.setPointer(ptr.x, ptr.y, true);
  });
  document.addEventListener('pointerleave', () => {
    spot.classList.remove('is-on');
    world?.setPointer(0, 0, false);
  });
}

// botões magnéticos
if (fine) {
  document.querySelectorAll('[data-magnet]').forEach((el) => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.28);
      my((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => {
      mx(0);
      my(0);
    });
  });
}

// ───────────── navegação ─────────────
const menu = document.querySelector('.menu');
const menuBtn = document.querySelector('.menu-btn');
function toggleMenu(open) {
  menu.classList.toggle('is-open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (open) lenis?.stop();
  else lenis?.start();
}
menuBtn.addEventListener('click', () => toggleMenu(!menu.classList.contains('is-open')));

function scrollToY(y) {
  if (lenis) lenis.scrollTo(y, { duration: 1.9, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}
document.querySelectorAll('[data-scroll]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const t = a.dataset.scroll;
    toggleMenu(false);
    if (t === 'top') scrollToY(0);
    else {
      const el = document.querySelector(t);
      scrollToY(el.getBoundingClientRect().top + window.scrollY);
    }
  }),
);
story.dots.forEach((d, i) =>
  d.addEventListener('click', () => scrollToY(M.top + SCENE_P[i] * (M.h - M.vh))),
);
window.addEventListener('keydown', (e) => e.key === 'Escape' && toggleMenu(false));

// ───────────── manifesto: palavras acendem com o scroll ─────────────
const mText = document.querySelector('[data-words]');
mText.setAttribute('aria-label', mText.textContent);
mText.innerHTML = mText.textContent
  .trim()
  .split(/\s+/)
  .map((w) => `<span class="w" aria-hidden="true">${w} </span>`)
  .join('');
gsap.to(mText.querySelectorAll('.w'), {
  opacity: 1,
  ease: 'none',
  stagger: 0.12,
  scrollTrigger: { trigger: mText, start: 'top 82%', end: 'bottom 48%', scrub: true },
});
gsap.from('.facts li', {
  y: 40,
  opacity: 0,
  duration: 1.2,
  stagger: 0.12,
  ease: 'power3.out',
  scrollTrigger: { trigger: '.facts', start: 'top 85%' },
});
ScrollTrigger.create({
  trigger: '.cta',
  start: 'top 70%',
  onEnter: () => document.querySelector('.cta').classList.add('is-in'),
});

// ───────────── galeria ─────────────
createGallery();

// ───────────── loop ─────────────
let pS = 0;
let started = false;
let t0 = performance.now();

gsap.ticker.lagSmoothing(0);
gsap.ticker.add((time, deltaMs) => {
  lenis?.raf(time * 1000);
  const dt = Math.min(0.05, deltaMs / 1000 || 0.016);
  const sy = getScroll();

  // progresso da história (0..1) com leve inércia
  const raw = clamp((sy - M.top) / Math.max(1, M.h - M.vh));
  pS += (raw - pS) * (1 - Math.exp(-dt * 9));
  if (Math.abs(raw - pS) < 0.00005) pS = raw;

  const inStory = sy < M.top + M.h + M.vh * 0.3;
  if (inStory) {
    const st = stageAt(pS);
    if (world) {
      story.update(st.camT, M.vh);
      world.render(pS, time);
    }
  }

  // luz de janela no fundo se desloca com scroll + cursor
  const bx = -sy * 0.035 + ptr.x * 26 + Math.sin(time * 0.1) * 36;
  beams.forEach((b) => b.style.setProperty('--bx', `${bx.toFixed(1)}px`));

  if (!started) {
    started = true;
    t0 = performance.now();
  }
});

// ───────────── entrada ─────────────
const loader = document.querySelector('.loader');
Promise.all([
  document.fonts?.ready ?? Promise.resolve(),
  new Promise((r) => setTimeout(r, reduced ? 50 : 1100)),
]).then(() => {
  measure();
  ScrollTrigger.refresh();
  const intro = { v: 0 };
  const tl = gsap.timeline();
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.inOut' })
    .add(() => root.classList.add('is-ready'), '-=0.45')
    .to(
      intro,
      {
        v: 1,
        duration: 2.2,
        ease: 'power3.out',
        onUpdate: () => world?.setIntro(intro.v),
      },
      '-=0.9',
    )
    .set(loader, { display: 'none' });
  if (!world) world?.setIntro?.(1);
});

// gancho de depuração (só em dev ou com ?debug na URL)
if (import.meta.env.DEV || location.search.includes('debug')) window.__amor = {
  world,
  lenis,
  setMood,
  M,
  // depuração: assenta a inércia imediatamente
  snap() {
    pS = clamp((getScroll() - M.top) / Math.max(1, M.h - M.vh));
  },
};
