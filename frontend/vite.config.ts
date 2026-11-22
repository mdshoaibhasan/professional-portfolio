import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin API in development; the Django backend arrives in Milestone 5.
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
  build: {
    target: "es2022",
    sourcemap: false,
  },
});
