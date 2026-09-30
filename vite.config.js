import { defineConfig } from 'vite';

// Código-fonte em /app · build em /docs (caminhos relativos, funciona em qualquer subpasta do GitHub Pages).
export default defineConfig({
  root: 'app',
  base: './',
  build: { outDir: '../docs', emptyOutDir: true, chunkSizeWarningLimit: 900 },
});
