// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import tailwindcss from "@tailwindcss/vite";
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   base: "/",
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import tailwindcss from "@tailwindcss/vite";
// import path from "path";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   base: "/",
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   build: {
//     // إجبار المتصفحات على قراءة الملفات الجديدة فوراً عبر تغيير الأسماء مع كل Build
//     rollupOptions: {
//       output: {
//         entryFileNames: `assets/[name]-[hash].js`,
//         chunkFileNames: `assets/[name]-[hash].js`,
//         assetFileNames: `assets/[name]-[hash].[ext]`,
//       },
//     },
//   },
// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // اضفنا خيار السيرفر والبروكسي هنا لتفادي مشكلة الـ CORS
  server: {
    proxy: {
      "/api-football": {
        target: "https://api.football-data.org/v4",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-football/, ""),
      },
    },
  },
  build: {
    // إجبار المتصفحات على قراءة الملفات الجديدة فوراً عبر تغيير الأسماء مع كل Build
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
});