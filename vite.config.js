import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// vite.config.js - แก้ไขตรงนี้
export default defineConfig({
  plugins: [react()],

  // ใช้ /mykids/ ทั้ง dev และ prod
  base: "/mykids/",

  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          icons: ["lucide-react"],
        },
      },
    },
  },

  server: {
    port: 5173,
    host: true,
    open: "/mykids/", // เปิด browser ที่ path ที่ถูกต้อง
    proxy: {
      "/api": {
        target: "https://sertjerm.com/my-kids-api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api.php"),
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            console.log("🔥 Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log("📤 Sending Request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log("📥 Received Response:", proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },

  // สำหรับ development
  define: {
    __DEV__: process.env.NODE_ENV === "development",
    __PROD__: process.env.NODE_ENV === "production",
  },
});
