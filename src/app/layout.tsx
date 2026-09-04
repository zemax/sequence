import type { Metadata, Viewport } from "next";
import { PropsWithChildren } from "react";
import { getApp, getTheme } from "../data/informations";
import { Providers } from "./providers";

import "../styles/global.scss";

const { language, title, description } = getApp();
const { color2 } = getTheme();

export const metadata: Metadata = {
  title,
  description,
  applicationName: title,
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicons/favicon.ico",
    apple: "/favicons/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/favicons/safari-pinned-tab.svg", color: "#324376" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": color2,
    "msapplication-config": "/favicons/browserconfig.xml",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: color2,
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang={language}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
