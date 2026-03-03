import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5001,
    proxy: {
      '^/(api|greetings)': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
