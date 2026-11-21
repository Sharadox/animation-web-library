"use client";
import { useEffect } from "react";
import type { OffscreenLoopsProperties } from "@sharadox/animation-web-library/offscreen-loops/type";

/** Every section of the page's main content. */
export const PAGE_SECTIONS = "main section";

/** A loop that runs on the page's own clock (not one tied to scrolling), forever. */
const isLoop = (animation: Animation) =>
  animation.timeline instanceof DocumentTimeline && animation.effect?.getTiming().iterations === Infinity;

/**
 * Lets endless CSS animations rest while their part of the page is off screen: they pause where they are and play
 * on from there a little before the part comes back, so nothing looks different but the page stops working for
 * what nobody sees (main-thread animations of shadows, backgrounds or filters cost every frame, wherever the visitor
 * is). Entrances and scroll-driven animations are left alone. Put it once in the page.
 *
 * @example
 * <OffscreenLoops />
 */
export function OffscreenLoops({ selector = PAGE_SECTIONS, margin = "200px" }: OffscreenLoopsProperties) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries)
          for (const animation of target.getAnimations({ subtree: true }).filter(isLoop))
            if (isIntersecting) animation.play();
            else animation.pause();
      },
      { rootMargin: `${margin} 0px` },
    );
    for (const part of document.querySelectorAll(selector)) observer.observe(part);
    return () => observer.disconnect();
  }, [selector, margin]);
  return null;
}
