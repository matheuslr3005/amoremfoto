import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES, SITE, waLink, mapsLink } from './site.js';
import { makePhoto } from './photos.js';

const pad2 = (n) => String(n).padStart(2, '0');

// Preenche links de contato e endereço a partir de site.js
export function initSite() {
  document.querySelectorAll('[data-wa]').forEach((a) => (a.href = waLink(a.dataset.wa || '')));
  document.querySelectorAll('[data-ig]').forEach((a) => (a.href = SITE.instagram));
  document.querySelectorAll('[data-ig-handle]').forEach((el) => (el.textContent = SITE.instagramHandle));
  document.querySelectorAll('[data-mail]').forEach((a) => (a.href = `mailto:${SITE.email}`));
  document.querySelectorAll('[data-mail-text]').forEach((el) => (el.textContent = SITE.email));
  document.querySelectorAll('[data-maps]').forEach((a) => (a.href = mapsLink()));
  const a = SITE.address;
  document.querySelectorAll('[data-address-street]').forEach((el) => (el.textContent = a.street));
  document.querySelectorAll('[data-address-rest]').forEach((el) => (el.textContent = `${a.hood} · ${a.city}/${a.uf}`));

  // imagens provisórias dos painéis de locação/mentoria
  document.querySelectorAll('[data-photo]').forEach((el, i) => {
    el.style.backgroundImage = `url(${makePhoto(40 + i, Number(el.dataset.photo))})`;
  });

  // tilt suave nos painéis
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, { rotationY: x * 5, rotationX: -y * 5, transformPerspective: 1200, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => gsap.to(el, { rotationY: 0, rotationX: 0, duration: 1, ease: 'elastic.out(1,0.7)', overwrite: 'auto' }));
    });
  }
}

// Lista interativa de serviços: passar o mouse troca a foto, clicar abre os detalhes
export function initServices() {
  const list = document.querySelector('[data-svc-list]');
  const preview = document.querySelector('[data-svc-preview]');
  const frame = preview.querySelector('.svc__frame');
  const capName = preview.querySelector('[data-svc-name]');
  const capGroup = preview.querySelector('[data-svc-group]');

  const items = SERVICES.map((s, i) => {
    const src = makePhoto(i * 3 + 1, s.tone);
    const img = new Image();
    img.alt = '';
    img.src = src;
    frame.appendChild(img);

    const li = document.createElement('li');
    li.className = 'svc__item';
    const opts = s.options
      ? `<div class="svc__opts" role="group" aria-label="Frequência">${s.options.map((o, k) => `<button type="button" class="svc__opt" aria-pressed="${k === 0}" data-opt="${o}">${o}</button>`).join('')}</div>`
      : '';
    li.innerHTML = `
      <button type="button" class="svc__row" aria-expanded="false" aria-controls="svc-${s.id}">
        <span class="svc__n">${pad2(i + 1)}</span>
        <span class="svc__name">${s.name}</span>
        <span class="svc__group">${s.group}</span>
        <i class="svc__arrow" aria-hidden="true">+</i>
      </button>
      <div class="svc__body" id="svc-${s.id}" inert>
        <div class="svc__inner">
          <img class="svc__thumb" alt="" src="${src}" />
          <p class="svc__text">${s.text}</p>
          ${opts}
          <a class="btn btn--ghost btn--sm" target="_blank" rel="noopener"><span>Quero saber mais</span><i>→</i></a>
        </div>
      </div>`;
    list.appendChild(li);
    const cta = li.querySelector('.btn');
    const state = { opt: s.options ? s.options[0] : '' };
    const updateLink = () => {
      const extra = state.opt ? ` (${state.opt.toLowerCase()})` : '';
      cta.href = waLink(`Olá! Vim pelo site e quero saber mais sobre ${s.name.toLowerCase()}${extra}.`);
    };
    updateLink();
    li.querySelectorAll('.svc__opt').forEach((b) =>
      b.addEventListener('click', () => {
        state.opt = b.dataset.opt;
        li.querySelectorAll('.svc__opt').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
        updateLink();
      }),
    );
    return { s, li, img, row: li.querySelector('.svc__row'), body: li.querySelector('.svc__body') };
  });

  let active = -1;
  let shown = -1;
  const showPreview = (i) => {
    if (i === shown) return;
    shown = i;
    items.forEach((it, k) => {
      it.img.classList.toggle('is-on', k === i);
      it.li.classList.toggle('is-hover', k === i && k !== active);
    });
    capName.textContent = items[i].s.name;
    capGroup.textContent = items[i].s.group;
  };

  let refreshTimer;
  const setActive = (i) => {
    const next = i === active ? -1 : i; // clicar de novo recolhe
    active = next;
    items.forEach((it, k) => {
      const on = k === next;
      it.li.classList.toggle('is-active', on);
      it.row.setAttribute('aria-expanded', String(on));
      it.body.inert = !on;
      it.row.querySelector('.svc__arrow').textContent = on ? '–' : '+';
    });
    if (next >= 0) showPreview(next);
    // a altura da página muda: recalcula os gatilhos de scroll (galeria fixada logo abaixo)
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 800);
  };

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  items.forEach((it, i) => {
    it.row.addEventListener('click', () => setActive(i));
    it.row.addEventListener('focus', () => showPreview(i));
    if (fine) it.li.addEventListener('pointerenter', () => showPreview(i));
  });
  if (fine) list.addEventListener('pointerleave', () => showPreview(active >= 0 ? active : 1));

  showPreview(1);
  setActive(1); // "Newborn" aberto ao entrar
}
