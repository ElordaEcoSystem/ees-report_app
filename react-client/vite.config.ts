import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build:{
    outDir: "dist",
    sourcemap: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      '/uploads': {
        target: 'http://localhost:5000', // или адрес твоего backend
        changeOrigin: true
      }
    },
    
    allowedHosts: ['client', 'localhost','api'],
    host: true
  },
});
