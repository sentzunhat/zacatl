import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
    proxy: {
      "^/(api|greetings)": {
        target: "http://localhost:8181",
        changeOrigin: true,
      },
    },
  },
});
