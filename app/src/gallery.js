import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PHOTOS, makePhoto } from './photos.js';

// Galeria horizontal: rola na horizontal enquanto a página desce (pin), com paralaxe interna e tilt 3D.
export function createGallery() {
  const section = document.querySelector('#galeria');
  const track = section.querySelector('[data-track]');
  const countEl = section.querySelector('[data-count]');
  const totalEl = section.querySelector('[data-total]');
  const pad2 = (n) => String(n).padStart(2, '0');
  totalEl.textContent = pad2(PHOTOS.length);

  const cards = PHOTOS.map((p, i) => {
    const src = p.src || makePhoto(i, p.tone);
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card__frame"><img alt="${p.title}" src="${src}" loading="lazy" draggable="false" /></div>
      <span class="card__n">${pad2(i + 1)}</span>
      <div class="card__cap"><b>${p.title}</b><span>${p.tag}</span></div>`;
    track.appendChild(card);
    card.dataset.src = src;
    card.dataset.cap = `${p.title} — ${p.tag}`;
    return card;
  });

  const imgs = cards.map((c) => c.querySelector('img'));
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);

  const parallax = () => {
    const vw = window.innerWidth;
    let nearest = 0;
    let best = Infinity;
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const off = (r.left + r.width / 2 - vw / 2) / vw;
      imgs[i].style.setProperty('--px', `${(-off * 70).toFixed(1)}px`);
      const d = Math.abs(off - 0.0);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    countEl.textContent = pad2(nearest + 1);
  };

  gsap.to(track, {
    x: () => -dist(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${dist()}`,
      pin: section.querySelector('.gallery__pin'),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: parallax,
      onRefresh: parallax,
    },
  });

  // tilt 3D ao passar o mouse
  const label = document.querySelector('.cursor-label');
  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotationY: x * 16, rotationX: -y * 16, transformPerspective: 900, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
    });
    card.addEventListener('pointerenter', () => gsap.to(label, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }));
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 1.1, ease: 'elastic.out(1,0.6)', overwrite: 'auto' });
      gsap.to(label, { scale: 0, opacity: 0, duration: 0.4, ease: 'power3.in' });
    });
  });

  // lightbox
  const lb = document.querySelector('.lightbox');
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('figcaption');
  const open = (card) => {
    lbImg.src = card.dataset.src;
    lbCap.textContent = card.dataset.cap;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    gsap.to(label, { scale: 0, opacity: 0, duration: 0.2 });
  };
  const close = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
  };
  cards.forEach((c) => c.addEventListener('click', () => open(c)));
  lb.addEventListener('click', (e) => {
    if (e.target !== lbImg) close();
  });
  window.addEventListener('keydown', (e) => e.key === 'Escape' && close());

  return { parallax, refresh: () => ScrollTrigger.refresh() };
}
