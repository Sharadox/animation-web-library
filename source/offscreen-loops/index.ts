"use client";
import { useEffect } from "react";
import type { OffscreenLoopsProperties } from "@sharadox/animation-web-library/offscreen-loops/type";

/** A loop that runs on the page's own clock (not one tied to scrolling), forever. */
const isLoop = (animation: Animation) =>
  animation.timeline instanceof DocumentTimeline && animation.effect?.getTiming().iterations === Infinity;

/** The element an animation moves (the element itself for its ::before and ::after). */
const targetOf = (animation: Animation) => (animation.effect as KeyframeEffect | null)?.target ?? null;

/**
 * Lets endless CSS animations rest while what they move is off screen: each pauses where it is and plays on from
 * there a little before it comes back, so nothing looks different but the page stops working for what nobody sees
 * (main-thread animations of shadows, backgrounds or filters cost every frame, wherever the visitor is). SVG drawings
 * animated with SMIL (`<animate>`, which re-lay the page out every frame) rest the same way. It only resumes what
 * it paused itself, and leaves entrances and scroll-driven animations alone. Put it once in the page.
 *
 * @example
 * <OffscreenLoops />
 */
export function OffscreenLoops({ within = "main", margin = "200px" }: OffscreenLoopsProperties) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const loops = new Map<Element, Animation[]>();
    const paused = new WeakSet<Animation>();
    const drawings = new Set<SVGSVGElement>();
    const pausedDrawings = new WeakSet<SVGSVGElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (drawings.has(target as SVGSVGElement)) {
            const drawing = target as SVGSVGElement;
            if (!isIntersecting && !drawing.animationsPaused()) {
              drawing.pauseAnimations();
              pausedDrawings.add(drawing);
            } else if (isIntersecting && pausedDrawings.has(drawing)) {
              pausedDrawings.delete(drawing);
              drawing.unpauseAnimations();
            }
          }
          for (const animation of loops.get(target) ?? [])
            if (!isIntersecting && animation.playState === "running") {
              animation.pause();
              paused.add(animation);
            } else if (isIntersecting && paused.has(animation)) {
              paused.delete(animation);
              animation.play();
            }
        }
      },
      { rootMargin: `${margin} 0px` },
    );
    const area = document.querySelector(within);
    // Browsers (and test environments) without the Web Animations API leave CSS loops alone.
    const running = typeof document.getAnimations === "function" ? document.getAnimations() : [];
    for (const animation of running.filter(isLoop)) {
      const target = targetOf(animation);
      if (!target || !area?.contains(target)) continue;
      loops.set(target, [...(loops.get(target) ?? []), animation]);
    }
    for (const target of loops.keys()) observer.observe(target);
    for (const drawing of area?.querySelectorAll("svg") ?? [])
      if (drawing.querySelector("animate, animateTransform, animateMotion, set")) {
        drawings.add(drawing);
        observer.observe(drawing);
      }
    return () => observer.disconnect();
  }, [within, margin]);
  return null;
}
