// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// 用 async config 以便在 plugins 裡使用 await import(...)
export default defineConfig(async () => ({
  // ★ 網址上的實際子路徑（非常重要）
  base: "https://jinsoichiro-cs50.github.io/project8/tools/birthday/",

  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [(await import("@replit/vite-plugin-cartographer")).cartographer()]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // 仍以 client 當開發根目錄
  root: path.resolve(import.meta.dirname, "client"),

  // ★ 直接把產物輸出到 docs/tools/birthday（GitHub Pages 會讀 /docs）
  build: {
    outDir: path.resolve(import.meta.dirname, "docs/tools/birthday"),
    emptyOutDir: true, // 每次重建清空該資料夾
  },

  server: {
    fs: { strict: true, deny: ["**/.*"] },
  },
}));
