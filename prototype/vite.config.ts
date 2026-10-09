import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { fileURLToPath, URL } from "node:url";

// `npm run build` -> regular static build (deployable anywhere, hash routing).
// `npm run build:single` -> one self-contained HTML file for sharing as a single page.
export default defineConfig(({ mode }) => ({
  base: "./",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [react(), ...(mode === "single" ? [viteSingleFile()] : [])],
  define: {
    __SINGLE_FILE__: JSON.stringify(mode === "single"),
  },
  build: {
    outDir: mode === "single" ? "dist-single" : "dist",
    chunkSizeWarningLimit: 1500,
  },
}));
