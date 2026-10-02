import "@fontsource-variable/bricolage-grotesque/wght.css";
import "@fontsource-variable/dm-sans/wght.css";
import "./styles/global.scss";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
