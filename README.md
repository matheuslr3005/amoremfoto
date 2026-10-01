# Amor em Foto Estúdio — site (proposta)

Site do estúdio de fotografia em **luz natural** (Canoas, RS): gestantes, newborn, acompanhamento do bebê, infantil, corporativo, eventos, locação do estúdio e mentoria para fotógrafos. História 3D guiada pelo scroll, lista interativa de serviços, galeria horizontal e interações no cursor. Paleta tirada do logo: marrom-rosado, rosé claro e branco quente.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # código em /app → build em /docs (pronto para o GitHub Pages)
```

Stack: Vite + Three.js (WebGL) + GSAP/ScrollTrigger + Lenis (scroll suave). Fontes self-hosted (Fraunces + Manrope) — **provisórias**, sem marca definida ainda.

## O que tem

- **História 3D em scroll** (`app/src/gl.js`, `app/src/timeline.js`): uma **câmera de filme** atravessa 3 cenas — rebatedor de luz → fotos instantâneas que se **revelam** quando ela pousa → tira de filme em espiral — e termina num **cartão de memória**. Inspirada no vídeo de referência. Todos os objetos são feitos de primitivas e texturas geradas em `app/src/props.js` (sem arquivos de modelo).
- **A câmera do hero olha para o cursor**, e na cena "Revelar" as fotos se inclinam na direção do cursor.
- **Luz de janela + poeira de luz + grão** no fundo; foco de luz seguindo o mouse.
- **Galeria horizontal** com tilt 3D, paralaxe interna e lightbox (`app/src/gallery.js`).
- Menu em tela cheia, botões magnéticos, responsivo (mobile), `prefers-reduced-motion`, fallback sem WebGL.

## Trocar o conteúdo

**Dados do estúdio e serviços: `app/src/site.js`** — WhatsApp, Instagram, e-mail, endereço e a lista de serviços (nome, descrição, opções). Todos os links do site (inclusive as mensagens prontas de WhatsApp por serviço) são gerados a partir dali. Os valores atuais de WhatsApp, Instagram e e-mail são **provisórios**.

| O quê | Onde |
| --- | --- |
| Textos das seções | `app/index.html` (os contatos e serviços ficam em `app/src/site.js`) |
| **Fotos reais** | `app/src/photos.js` — preencha `src: '/fotos/arquivo.jpg'` em cada item (ponha os arquivos em `app/public/fotos/`). Sem `src`, gera uma imagem abstrata provisória |
| Cores do site | `:root` em `app/src/styles.css` (fundo, texto, acento); luz 3D em `THEME` no topo de `app/src/gl.js` |
| Duração/ordem das cenas do scroll | `SEGS` em `app/src/timeline.js` (e a altura em `.story` no CSS, hoje `720svh`) |
| Tipografia | `app/src/main.js` (imports `@fontsource…`) e `--font-display` / `--font-body` em `app/src/styles.css` |

## Marca
O logo está em `app/public/logo.png` (recortado de uma captura pequena, 97 px): fica nítido no topo e na tela de carregamento, mas borra se ampliado. Quando houver o arquivo original (SVG ou PNG grande), basta substituir `logo.png` e `favicon.png` na mesma pasta. Cores no `:root` de `app/src/styles.css`.

Debug: abra a página com `?debug` para expor `window.__amor`.

## Publicar (GitHub Pages)
O build fica commitado em `docs/`, e o `index.html` da raiz redireciona para ele — então funciona tanto servindo a **raiz** quanto a pasta **/docs** da branch (Settings → Pages → Deploy from a branch). URL: `https://<usuario>.github.io/amoremfoto/`. Depois de mudar o código em `app/`, rode `npm run build` e commite a pasta `docs/` de novo.
