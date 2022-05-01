import { getApp, getTheme } from "../../data/informations";

const getManifest = () => {
  const { title } = getApp();
  const { color2 } = getTheme();

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
      },
      {
        src: "/favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
};

export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(getManifest());
}
