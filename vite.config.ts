import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build`         -> standard multi-file production build in dist/
// `npm run build:single`  -> one self-contained index.html in dist-single/
//                            (fonts, JS, CSS and SVG art inlined) used for the
//                            hosted Claude artifact preview.
export default defineConfig(({ mode }) => ({
  plugins: mode === "single" ? [react(), viteSingleFile()] : [react()],
  build: {
    outDir: mode === "single" ? "dist-single" : "dist",
    target: "es2020",
    sourcemap: false,
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
}));
