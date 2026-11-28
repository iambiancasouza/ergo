import { useCallback, useEffect, useRef, useState } from "react";

const tickMs = 250;

// Começa a contar quando o componente aparece; para no stop(), que devolve o tempo exato.
export function useTimer() {
  const startedAt = useRef<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    startedAt.current ??= performance.now();
    const id = setInterval(() => setElapsedMs(performance.now() - (startedAt.current ?? 0)), tickMs);
    return () => clearInterval(id);
  }, [running]);

  const stop = useCallback(() => {
    const total = startedAt.current === null ? 0 : performance.now() - startedAt.current;
    setElapsedMs(total);
    setRunning(false);
    return Math.round(total);
  }, []);

  return { elapsedMs, stop };
}
