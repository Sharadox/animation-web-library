"use client";
import { useEffect, useState } from "react";
import { isSoftNavigation } from "@sharadox/web-library/navigation/soft-navigation";

/**
 * Counts from 0 to `target` with an ease-out once `start` is true (for example from `useInView`). Jumps straight to
 * the target when the visitor prefers reduced motion, and starts there when the page is rebuilt in place (a soft
 * navigation, such as switching language).
 */
export function useCountUp(target: number, start: boolean, durationMilliseconds = 1600): number {
  const [settled] = useState(isSoftNavigation);
  const [value, setValue] = useState(settled ? target : 0);
  useEffect(() => {
    if (!start || settled) return;
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
  }, [target, start, durationMilliseconds, settled]);
  return value;
}
