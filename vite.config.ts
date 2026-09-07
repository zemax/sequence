import { fileURLToPath } from "node:url";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { serwist } from "@serwist/vite";
import svg_function from "@zemax/sass-svg/svg-function.js";
import { getApp, getTheme } from "./src/data/informations";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const basePath = process.env.VITE_BASE_PATH ?? "";

// Next generated `manifest.webmanifest` from src/app/manifest.ts at build time;
// @serwist/vite has no equivalent, so we write it into public/ ourselves from the
// same source of truth (src/data/informations.ts) before Vite serves/copies public/.
function webManifest(): Plugin {
  return {
    name: "web-manifest",
    buildStart() {
      const { title } = getApp();
      const { color2 } = getTheme();

      const manifest = {
        name: title,
        short_name: title,
        start_url: `${basePath}/`,
        display: "standalone",
        orientation: "portrait",
        theme_color: color2,
        background_color: color2,
        icons: [
          { src: `${basePath}/favicons/android-chrome-192x192.png`, sizes: "192x192", type: "image/png" },
          { src: `${basePath}/favicons/android-chrome-512x512.png`, sizes: "512x512", type: "image/png" },
        ],
      };

      writeFileSync(path.resolve(__dirname, "public/manifest.webmanifest"), JSON.stringify(manifest, null, 2));
    },
  };
}

// Mirrors the <head> Next built from the `metadata`/`viewport` exports in
// src/app/layout.tsx, from the same src/data/informations.ts source of truth.
function headMetadata(): Plugin {
  return {
    name: "head-metadata",
    transformIndexHtml() {
      const { title, description } = getApp();
      const { color2 } = getTheme();

      return [
        { tag: "title", children: title, injectTo: "head" },
        { tag: "meta", attrs: { name: "description", content: description }, injectTo: "head" },
        { tag: "meta", attrs: { name: "application-name", content: title }, injectTo: "head" },
        { tag: "meta", attrs: { name: "format-detection", content: "telephone=no" }, injectTo: "head" },
        { tag: "meta", attrs: { name: "mobile-web-app-capable", content: "yes" }, injectTo: "head" },
        { tag: "meta", attrs: { name: "apple-mobile-web-app-capable", content: "yes" }, injectTo: "head" },
        { tag: "meta", attrs: { name: "apple-mobile-web-app-title", content: title }, injectTo: "head" },
        { tag: "meta", attrs: { name: "apple-mobile-web-app-status-bar-style", content: "default" }, injectTo: "head" },
        { tag: "meta", attrs: { name: "theme-color", content: color2 }, injectTo: "head" },
        { tag: "meta", attrs: { name: "msapplication-TileColor", content: color2 }, injectTo: "head" },
        { tag: "meta", attrs: { name: "msapplication-config", content: `${basePath}/favicons/browserconfig.xml` }, injectTo: "head" },
        { tag: "link", attrs: { rel: "manifest", href: `${basePath}/manifest.webmanifest` }, injectTo: "head" },
        { tag: "link", attrs: { rel: "icon", href: `${basePath}/favicons/favicon-32x32.png`, sizes: "32x32", type: "image/png" }, injectTo: "head" },
        { tag: "link", attrs: { rel: "icon", href: `${basePath}/favicons/favicon-16x16.png`, sizes: "16x16", type: "image/png" }, injectTo: "head" },
        { tag: "link", attrs: { rel: "shortcut icon", href: `${basePath}/favicons/favicon.ico` }, injectTo: "head" },
        { tag: "link", attrs: { rel: "apple-touch-icon", href: `${basePath}/favicons/apple-touch-icon.png` }, injectTo: "head" },
        { tag: "link", attrs: { rel: "mask-icon", href: `${basePath}/favicons/safari-pinned-tab.svg`, color: "#324376" }, injectTo: "head" },
      ];
    },
  };
}

export default defineConfig({
  base: basePath || "/",
  server: { port: 3000 },
  plugins: [
    react(),
    webManifest(),
    headMetadata(),
    serwist({
      swSrc: "src/sw.ts",
      swDest: "sw.js",
      globDirectory: "dist",
      rollupFormat: "iife",
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        functions: svg_function(__dirname),
      },
    },
  },
});
