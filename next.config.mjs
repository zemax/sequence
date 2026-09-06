import { fileURLToPath } from "node:url";
import path from "node:path";
import withSerwistInit from "@serwist/next";
import svg_function from "@zemax/sass-svg/svg-function.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const isStaticExport = process.env.NEXT_OUTPUT_MODE === "export";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default withSerwist({
  ...(isStaticExport ? { output: "export" } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  sassOptions: {
    functions: Object.assign({}, svg_function(__dirname)),
  },
});
