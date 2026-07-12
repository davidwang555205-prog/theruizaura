import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("/src/modules/product/")) return "product-modules";
          if (id.includes("/src/data/")) return "prompt-data";
          return undefined;
        }
      }
    }
  }
});
