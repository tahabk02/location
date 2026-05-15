import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  root: "frontend",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("framer-motion")) return "vendor-framer";
            if (id.includes("jspdf") || id.includes("html2canvas")) return "vendor-pdf";
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("leaflet")) return "vendor-map";
            return "vendor";
          }
        },
      },
    },
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
