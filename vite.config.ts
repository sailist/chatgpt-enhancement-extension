import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import makeManifest from "./utils/plugins/make-manifest";
import customDynamicImport from "./utils/plugins/custom-dynamic-import";
import addHmr from "./utils/plugins/add-hmr";
import manifest from "./manifest";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const commonDir = resolve(root, "common");
const assetsDir = resolve(root, "assets");
export const isDev = process.env.__DEV__ === "true";
const outDir = resolve(__dirname, isDev ? "out" : "dist");
const publicDir = resolve(__dirname, "public");

const isProduction = !isDev;

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = true;

export default defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
      "@common": commonDir,
    },
  },
  plugins: [
    react(),
    makeManifest(manifest, {
      isDev,
      contentScriptCssKey: "",
    }),
    customDynamicImport(),
    addHmr({ background: enableHmrInBackgroundScript, view: true }),
  ],
  publicDir,
  esbuild: {
    drop: isDev ? [] : ["console", "debugger"],
  },
  build: {
    outDir,
    emptyOutDir: false,
    /** Can slowDown build speed. */
    // sourcemap: isDev,
    minify: isProduction,
    reportCompressedSize: isProduction,
    rollupOptions: {
      input: {
        devtools: resolve(pagesDir, "devtools", "index.html"),
        panel: resolve(pagesDir, "panel", "index.html"),
        content: resolve(pagesDir, "content", "index.ts"),
        background: resolve(pagesDir, "background", "index.ts"),
        contentStyle: resolve(pagesDir, "content", "style.scss"),
        popup: resolve(pagesDir, "popup", "index.html"),
        newtab: resolve(pagesDir, "newtab", "index.html"),
        options: resolve(pagesDir, "options", "index.html"),
      },

      watch: {
        include: ["src/**", "vite.config.ts", "manifest.ts"],
        exclude: ["node_modules/**", "src/**/*.spec.ts"],
      },
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        chunkFileNames: isDev
          ? "assets/js/[name].js"
          : "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const { dir, name: _name } = path.parse(assetInfo.name);
          const assetFolder = dir.split("/").at(-1);
          const name = assetFolder + firstUpperCase(_name);
          if (name === "contentStyle") {
            return `assets/css/contentStyle.chunk.css`;
          }
          return `assets/[ext]/${name}.chunk.[ext]`;
        },
      },
    },
  },
});

function firstUpperCase(str: string) {
  const firstAlphabet = new RegExp(/( |^)[a-z]/, "g");
  return str.toLowerCase().replace(firstAlphabet, (L) => L.toUpperCase());
}

let cacheInvalidationKey: string = generateKey();
function regenerateCacheInvalidationKey() {
  cacheInvalidationKey = generateKey();
  return cacheInvalidationKey;
}

function generateKey(): string {
  return `${(Date.now() / 100).toFixed()}`;
}
