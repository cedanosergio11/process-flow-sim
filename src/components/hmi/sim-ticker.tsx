import { useEffect } from "react";
import { useSim } from "@/lib/sim/store";

export function SimTicker() {
  const tick = useSim((s) => s.tick);
  const flushUi = useSim((s) => s.flushUi);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let uiAcc = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        last = now;
        document.documentElement.classList.add("paused");
        return;
      }
      document.documentElement.classList.remove("paused");
      const dt = (now - last) / 1000;
      last = now;
      if (dt <= 0 || dt > 0.25) return;
      tick(dt);
      uiAcc += dt;
      if (uiAcc >= 1 / 30) {
        flushUi();
        uiAcc = 0;
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick, flushUi]);

  return null;
}
