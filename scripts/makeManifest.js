const path = require("path");
const fs = require("fs");
import { getApp, getTheme } from "../src/commons/data/informations";

const getManifest = () => {
  const { title } = getApp();
  const { color1, color2 } = getTheme();

  return {
    name: title,
    short_name: title,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: color2,
    background_color: color2,

    icons: [
      {
        src: "/favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/favicons/favicon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
};

const main = async () => {
  const filePath = path.join(__dirname, "../public/manifest.json");

  fs.writeFileSync(filePath, JSON.stringify(getManifest(), null, 2));
};

main().then(() => console.log("Done."));
