"use client";
import { useEffect, useState } from "react";

/**
 * Counts from 0 to `target` with an ease-out once `start` is true (for example from `useInView`). Jumps straight to
 * the target when the visitor prefers reduced motion.
 */
export function useCountUp(target: number, start: boolean, durationMilliseconds = 1600): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
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
