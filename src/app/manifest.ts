import type { MetadataRoute } from "next";
import { basePath } from "../data/basePath";
import { getApp, getTheme } from "../data/informations";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const { title } = getApp();
  const { color2 } = getTheme();

  return {
    name: title,
    short_name: title,
    start_url: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    theme_color: color2,
    background_color: color2,

    icons: [
      {
        src: `${basePath}/favicons/android-chrome-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${basePath}/favicons/android-chrome-512x512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
