import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ['poke-trades.com', 'www.poke-trades.com'], // allow this domain
    port: 5173,
    proxy: {
      // Intercept any request that starts with /api
      '/api': {
        // Use the Docker service name 'backend' and the Express internal port '3457'
        target: 'http://backend:3457', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
