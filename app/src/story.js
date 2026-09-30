import { smooth } from './timeline.js';

// Controla o texto das cenas: cada cena desliza junto com a câmera 3D.
export function createStory(root) {
  const scenes = [...root.querySelectorAll('[data-scene]')].map((el) => ({
    el,
    k: Number(el.dataset.scene),
    kids: [...el.children].map((c) => ({ el: c, d: Number(c.dataset.depth || 1) })),
    on: null,
  }));
  const dots = [...root.querySelectorAll('.dots button')];

  // título → letras individuais (revelação escalonada)
  root.querySelectorAll('[data-split]').forEach((t) => {
    const txt = t.textContent;
    t.setAttribute('aria-label', txt);
    t.innerHTML = [...txt].map((ch, i) => `<span class="ch" style="--i:${i}" aria-hidden="true">${ch}</span>`).join('');
  });

  let activeDot = -1;

  function update(camT, H) {
    for (const s of scenes) {
      const off = s.k - camT;
      const a = Math.abs(off);
      s.el.style.transform = `translate3d(0, ${(off * H).toFixed(2)}px, 0)`;
      s.el.style.opacity = (1 - smooth(0.3, 0.75, a)).toFixed(3);
      s.el.style.visibility = a > 1.05 ? 'hidden' : 'visible';
      // paralaxe: elementos com data-depth > 1 andam um pouco mais rápido
      for (const kid of s.kids) {
        if (kid.d !== 1) kid.el.style.transform = `translate3d(0, ${(off * H * (kid.d - 1)).toFixed(2)}px, 0)`;
      }
      const on = a < 0.32;
      if (on !== s.on) {
        s.on = on;
        s.el.classList.toggle('is-in', on);
      }
    }
    const idx = Math.round(camT);
    if (idx !== activeDot) {
      activeDot = idx;
      dots.forEach((d, i) => d.classList.toggle('is-on', i === idx));
    }
  }

  return { update, dots };
}
