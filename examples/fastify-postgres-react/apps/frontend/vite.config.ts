import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5003,
    proxy: {
      '^/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
    },
  },
});
