# Amor em Foto — site (proposta)

Site de fotografia newborn em **luz natural**, com história 3D guiada pelo scroll, "hora do dia" que muda a luz do site inteiro, galeria horizontal e interações no cursor.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # código em /app → build em /docs (pronto para o GitHub Pages)
```

Stack: Vite + Three.js (WebGL) + GSAP/ScrollTrigger + Lenis (scroll suave). Fontes self-hosted (Fraunces + Manrope) — **provisórias**, sem marca definida ainda.

## O que tem

- **História 3D em scroll** (`app/src/gl.js`, `app/src/timeline.js`): uma esfera de luz atravessa 3 cenas — rampa → pinos → espiral — e pousa num ninho. Inspirada no vídeo de referência.
- **Hora do dia** (`app/src/mood.js`): Manhã / Tarde / Entardecer trocam cores, direção da luz, sombras e a esfera (botões no topo + slider na seção "A luz").
- **Pinos que seguem o cursor** como girassóis e se afastam da esfera.
- **Luz de janela + poeira de luz + grão** no fundo; foco de luz seguindo o mouse.
- **Galeria horizontal** com tilt 3D, paralaxe interna e lightbox (`app/src/gallery.js`).
- Menu em tela cheia, botões magnéticos, responsivo (mobile), `prefers-reduced-motion`, fallback sem WebGL.

## Trocar o conteúdo

| O quê | Onde |
| --- | --- |
| Textos, links (WhatsApp, Instagram, e-mail) | `app/index.html` — procure `wa.me/5500000000000`, `@amoremfoto`, `contato@exemplo.com` |
| **Fotos reais** | `app/src/photos.js` — preencha `src: '/fotos/arquivo.jpg'` em cada item (ponha os arquivos em `app/public/fotos/`). Sem `src`, gera uma imagem abstrata provisória |
| Cores de cada hora do dia | `app/src/mood.js` |
| Duração/ordem das cenas do scroll | `SEGS` em `app/src/timeline.js` (e a altura em `.story` no CSS, hoje `720svh`) |
| Tipografia | `app/src/main.js` (imports `@fontsource…`) e `--font-display` / `--font-body` em `app/src/styles.css` |

## Marca
Sem logo por enquanto: `amor em foto` (topo-esquerda) é só texto provisório. Quando houver logo/tipografia da marca, trocar em `.brand` (`index.html`) e nas variáveis do `:root`.

Debug: abra a página com `?debug` para expor `window.__amor`.

## Publicar (GitHub Pages)
O build fica commitado em `docs/`, e o `index.html` da raiz redireciona para ele — então funciona tanto servindo a **raiz** quanto a pasta **/docs** da branch (Settings → Pages → Deploy from a branch). URL: `https://<usuario>.github.io/amoremfoto/`. Depois de mudar o código em `app/`, rode `npm run build` e commite a pasta `docs/` de novo.
