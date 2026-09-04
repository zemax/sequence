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

export default withSerwist({
  ...(isStaticExport ? { output: "export" } : {}),
  sassOptions: {
    functions: Object.assign({}, svg_function(__dirname)),
  },
});
