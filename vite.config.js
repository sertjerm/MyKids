// vite.config.js
// แก้ไข - ลบ proxy configuration เพราะใช้การเชื่อมต่อโดยตรงแล้ว

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
    cors: true, // เปิด CORS สำหรับ development
    // ลบ proxy configuration เพราะใช้การเชื่อมต่อโดยตรง
  },

  // สำหรับ development
  define: {
    __DEV__: process.env.NODE_ENV === "development",
    __PROD__: process.env.NODE_ENV === "production",
  },

  // เพิ่ม optimizeDeps เพื่อ pre-bundle dependencies ที่จำเป็น
  optimizeDeps: {
    include: ["axios", "react", "react-dom", "react-router-dom", "lucide-react"],
  },
});