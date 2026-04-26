import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  server: {
    port: 5001,
    proxy: {
      '^/api': {
        target: 'http://localhost:8181',
        changeOrigin: true,
      },
    },
  },
});
