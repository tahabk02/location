import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  root: "frontend",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      overlay: false,
    },
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
