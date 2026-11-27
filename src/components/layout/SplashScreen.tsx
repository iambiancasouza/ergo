"use client";

import { useEffect, useState } from "react";

import { splashSeenKey } from "@/lib/splash";

// Precisa bater com o globals.css: 2 ciclos de 1,8 s + 0,4 s de saída.
const splashDurationMs = 4000;

export function SplashScreen() {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Já vista: o CSS mantém escondida, não há o que animar.
    if (document.documentElement.dataset.splashSeen) return;

    try {
      sessionStorage.setItem(splashSeenKey, "1");
    } catch {}

    const timeout = setTimeout(() => setIsDone(true), splashDurationMs);
    return () => clearTimeout(timeout);
  }, []);

  if (isDone) return null;

  return (
    <div aria-hidden="true" className="splash-screen">
      <div className="splash-logo">
        <svg width="96" height="96" viewBox="0 0 64 64" fill="#B8A6F0">
          <circle className="splash-dot" cx="32" cy="16" r="8" />
          <circle className="splash-dot" cx="14" cy="46" r="8" />
          <circle className="splash-dot" cx="50" cy="46" r="8" />
        </svg>
      </div>
    </div>
  );
}
