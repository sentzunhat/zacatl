import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'public',
  plugins: [tailwindcss(), react()],
  server: {
    port: 5001,
    fs: {
      allow: ['..'],
    },
    proxy: {
      '^/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
