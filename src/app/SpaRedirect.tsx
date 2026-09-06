"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const SpaRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const redirect = sessionStorage.getItem("redirect");
    if (redirect) {
      sessionStorage.removeItem("redirect");
      router.replace(redirect);
    }
  }, [router]);

  return null;
};
