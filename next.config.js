const withPWA = require("next-pwa");
const svg_function = require("@zemax/sass-svg/svg-function");

module.exports = withPWA({
  sassOptions: {
    functions: Object.assign({}, svg_function(__dirname)),
  },
  rewrites() {
    return [
      {
        source: "/manifest.json",
        destination: "/api/manifest.json",
      },
    ];
  },
  pwa: {
    dest: "public",
  },
});
