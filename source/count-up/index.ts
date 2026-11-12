"use client";
import { useEffect, useState } from "react";
import { isSoftNavigation } from "@sharadox/web-library/navigation/soft-navigation";

/**
 * Counts from 0 to `target` with an ease-out once `start` is true (for example from `useInView`). Jumps straight to
 * the target when the visitor prefers reduced motion, or when it starts during a soft navigation (the page rebuilt in
 * place, such as switching language), so a number already on screen doesn't count again.
 */
export function useCountUp(target: number, start: boolean, durationMilliseconds = 1600): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (isSoftNavigation()) {
      // A microtask, not an animation frame: frames are paused while a view transition waits for the new page.
      let live = true;
      queueMicrotask(() => live && setValue(target));
      return () => {
        live = false;
      };
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    const begin = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - begin) / durationMilliseconds);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, start, durationMilliseconds]);
  return value;
}
