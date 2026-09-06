"use client";

import { useEffect } from "react";
import { basePath } from "../data/basePath";

export default function NotFound() {
  useEffect(() => {
    const path = window.location.pathname.slice(basePath.length) + window.location.search + window.location.hash;
    sessionStorage.setItem("redirect", path);
    window.location.replace(`${basePath}/`);
  }, []);

  return null;
}
