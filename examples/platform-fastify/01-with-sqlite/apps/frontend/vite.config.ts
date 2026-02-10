import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8091,
    proxy: {
      "/greetings": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
