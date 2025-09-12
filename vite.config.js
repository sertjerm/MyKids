import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    proxy: {
      "/api": {
        target: "https://sertjerm.com/my-kids-api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api.php"),
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
