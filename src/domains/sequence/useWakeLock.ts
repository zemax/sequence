import { useEffect } from "react";

// Keeps the screen awake for as long as the calling component stays mounted (e.g. while a
// Sequence is playing). The OS releases the lock whenever the tab goes hidden, so it has to be
// re-requested on visibilitychange rather than acquired once.
export const useWakeLock = () => {
  useEffect(() => {
    if (!("wakeLock" in navigator)) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // Unavailable (unsupported context, low battery mode, etc.) — playback still works.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sentinel?.release();
    };
  }, []);
};
