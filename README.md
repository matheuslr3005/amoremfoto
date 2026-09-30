# Amor em Foto — site (proposta)

Site de fotografia newborn em **luz natural**, com história 3D guiada pelo scroll, "hora do dia" que muda a luz do site inteiro, galeria horizontal e interações no cursor.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera /dist (estático, pode ir para qualquer hospedagem)
```

Stack: Vite + Three.js (WebGL) + GSAP/ScrollTrigger + Lenis (scroll suave). Fontes self-hosted (Fraunces + Manrope) — **provisórias**, sem marca definida ainda.

## O que tem

- **História 3D em scroll** (`src/gl.js`, `src/timeline.js`): uma esfera de luz atravessa 3 cenas — rampa → pinos → espiral — e pousa num ninho. Inspirada no vídeo de referência.
- **Hora do dia** (`src/mood.js`): Manhã / Tarde / Entardecer trocam cores, direção da luz, sombras e a esfera (botões no topo + slider na seção "A luz").
- **Pinos que seguem o cursor** como girassóis e se afastam da esfera.
- **Luz de janela + poeira de luz + grão** no fundo; foco de luz seguindo o mouse.
- **Galeria horizontal** com tilt 3D, paralaxe interna e lightbox (`src/gallery.js`).
- Menu em tela cheia, botões magnéticos, responsivo (mobile), `prefers-reduced-motion`, fallback sem WebGL.

## Trocar o conteúdo

| O quê | Onde |
| --- | --- |
| Textos, links (WhatsApp, Instagram, e-mail) | `index.html` — procure `wa.me/5500000000000`, `@amoremfoto`, `contato@exemplo.com` |
| **Fotos reais** | `src/photos.js` — preencha `src: '/fotos/arquivo.jpg'` em cada item (ponha os arquivos em `public/fotos/`). Sem `src`, gera uma imagem abstrata provisória |
| Cores de cada hora do dia | `src/mood.js` |
| Duração/ordem das cenas do scroll | `SEGS` em `src/timeline.js` (e a altura em `.story` no CSS, hoje `720svh`) |
| Tipografia | `src/main.js` (imports `@fontsource…`) e `--font-display` / `--font-body` em `src/styles.css` |

## Marca
Sem logo por enquanto: `amor em foto` (topo-esquerda) é só texto provisório. Quando houver logo/tipografia da marca, trocar em `.brand` (`index.html`) e nas variáveis do `:root`.

Debug: abra a página com `?debug` para expor `window.__amor`.
