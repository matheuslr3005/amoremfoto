# Amor em Foto Estúdio — site v2 (3D)

Site do estúdio de fotografia em **luz natural** (Canoas, RS). Redesenho completo: uma **viagem de câmera 3D guiada pelo scroll**, com a flor-coração do logo, um túnel de fotos em arco ("janelas"), um anel giratório de serviços e a flor se abrindo de novo no contato.

Stack: **React 19 + TypeScript + Vite · React Three Fiber (three.js) + drei + postprocessing · motion (Framer Motion) · Lenis**.
Tudo o que é 3D é gerado por código (sem arquivos de modelo). Fontes self-hosted: Instrument Serif + Hanken Grotesk.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + código em /app → build em /docs (pronto para o GitHub Pages)
npm run typecheck
```

## Como funciona

O site é **um mundo 3D só**, com a câmera andando pelo caminho conforme o scroll. Cada seção do HTML é um "estágio" (`data-stage`) e ocupa um trecho do scroll.

| Estágio | O que acontece | Onde |
| --- | --- | --- |
| Hero | Flor 3D (pétalas paramétricas + coração) reage ao cursor; a câmera sobrevoa a flor | `three/Bloom.tsx`, `sections/Hero.tsx` |
| Jornada | Túnel de janelas em arco com fotos que se "revelam" ao se aproximar; mira de câmera (viewfinder) com contador | `three/Tunnel.tsx`, `sections/Journey.tsx` |
| A luz | Manifesto com palavras que acendem pelo scroll + contadores | `sections/Manifesto.tsx` |
| Serviços | A câmera entra num anel de cartões 3D que gira a cada serviço; texto, opções e CTA de WhatsApp por serviço | `three/ServiceRing.tsx`, `sections/Services.tsx` |
| Para fotógrafos | Locação e mentoria em cartões com tilt 3D + faixa de texto que acelera com o scroll | `sections/Studio.tsx` |
| Contato | A câmera chega a uma segunda flor que se abre | `sections/Contact.tsx` |

- **Caminho da câmera:** `app/src/lib/timeline.ts` (scroll → progresso de cada estágio → pose da câmera). Para mudar a ordem ou a duração, ajuste as alturas das seções em `styles.css` (`.journey`, `.services`, `.contact`) e a constante `SERVICES_VH_PER_ITEM`.
- **Câmera + cursor:** `three/Rig.tsx` (parallax do cursor, leve inclinação pela velocidade do scroll).
- **Visual 3D:** `three/Scene.tsx` (luzes, névoa, flores, pétalas caindo, feixes de luz, pós-processamento).

## Trocar o conteúdo

**Tudo em `app/src/config/site.ts`:** WhatsApp, Instagram, e-mail, endereço, serviços (nome, texto, opções, mensagem pronta de WhatsApp), capítulos da jornada, manifesto e fotos do túnel. Todos os links do site saem dali.

Os valores atuais de **WhatsApp, Instagram e e-mail são provisórios** — troque antes de publicar.

### Fotos reais
Hoje as fotos são **provisórias** (cenas pintadas por código em `lib/photos.ts`). Para usar as fotos reais:

1. Coloque os arquivos em `app/public/fotos/`.
2. Em `config/site.ts`, preencha `src: 'fotos/arquivo.jpg'` no serviço (`SERVICES`) ou na foto (`PHOTOS`).

Proporção ideal das fotos: **retrato ~3:4** (elas são recortadas em arco). Sem `src`, o site usa a foto provisória.

### Marca
`app/public/logo.png` (97 px, recortado de uma captura pequena) aparece no cabeçalho e na abertura. O selo giratório da hero e do contato é uma **recriação em vetor** do logo (`ui/Seal.tsx`), assim como a flor 3D. Com o arquivo original (SVG/PNG grande) é só trocar `logo.png` e `favicon.png` em `app/public/`.

## Desempenho e acessibilidade
- Celulares e máquinas com poucos núcleos usam o modo **lite**: menos partículas, sem pós-processamento, resolução menor.
- `prefers-reduced-motion`: sem rolagem suave, sem flutuação e sem parallax.
- Sem WebGL (ou se o 3D falhar): o site continua completo, só com HTML/CSS.
- Os serviços também ficam em lista navegável por teclado ao lado do anel 3D.
- Depuração: abra a página com `?debug` para expor `window.__amor`.

## Publicar (GitHub Pages)
O build fica commitado em `docs/`, e o `index.html` da raiz redireciona para ele — funciona servindo a **raiz** ou a pasta **/docs** da branch. Depois de mudar o código em `app/`, rode `npm run build` e commite `docs/` de novo.
