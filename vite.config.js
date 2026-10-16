import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Código-fonte em /app · build em /docs (caminhos relativos, funciona em qualquer subpasta do GitHub Pages).
export default defineConfig({
  root: 'app',
  base: './',
  plugins: [react()],
  build: { outDir: '../docs', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
});
