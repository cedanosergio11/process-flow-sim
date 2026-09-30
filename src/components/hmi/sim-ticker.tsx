import { useEffect } from "react";
import { useSim } from "@/lib/sim/store";

/** UI publish rate — matches CHANGELOG 1.3.5.0 (was regressing to 30 Hz). */
const UI_HZ = 10;

export function SimTicker() {
  const tick = useSim((s) => s.tick);
  const flushUi = useSim((s) => s.flushUi);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let uiAcc = 0;
    let paused = false;

    const setPaused = (next: boolean) => {
      if (paused === next) return;
      paused = next;
      document.documentElement.classList.toggle("paused", next);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) {
        last = now;
        setPaused(true);
        return;
      }
      setPaused(false);
      const dt = (now - last) / 1000;
      last = now;
      if (dt <= 0 || dt > 0.25) return;
      tick(dt);
      uiAcc += dt;
      if (uiAcc >= 1 / UI_HZ) {
        flushUi();
        // Carry remainder so long frames don't permanently slow the UI clock.
        uiAcc %= 1 / UI_HZ;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        setPaused(true);
        last = performance.now();
      } else {
        last = performance.now();
        setPaused(false);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    if (document.hidden) setPaused(true);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      document.documentElement.classList.remove("paused");
    };
  }, [tick, flushUi]);

  return null;
}
