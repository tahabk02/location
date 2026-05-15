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
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-core";
            }
            if (id.includes("jspdf") || id.includes("html2canvas")) {
              return "vendor-pdf";
            }
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
