import { defineConfig } from 'vite';

// Publicação no GitHub Pages: o build sai em /docs com caminhos relativos
// (funciona em https://<usuario>.github.io/amoremfoto/ e em domínio próprio).
export default defineConfig({
  base: './',
  build: { outDir: 'docs', emptyOutDir: true, chunkSizeWarningLimit: 900 },
});
