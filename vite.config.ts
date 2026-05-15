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
    proxy: {
      "/api": "http://localhost:4000",
      "/_/backend": {
        target: "http://localhost:4000",
        rewrite: (path) => path.replace(/^\/_\/backend/, ""),
      },
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
