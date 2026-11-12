"use client";
import { useEffect, useRef } from "react";
import type { MarqueeOptions } from "@sharadox/animation-web-library/marquee/type";

/**
 * An endless strip that slides on its own and can be grabbed and flung by hand (mouse or touch), with inertia, or
 * scrolled sideways (a trackpad's horizontal swipe, or Shift with a mouse wheel).
 * Attach the returned reference to the track: an element holding two identical groups side by side, so moving it by
 * one group's width (half the track) looks the same. It does not move by itself when the visitor prefers reduced
 * motion, but can still be dragged.
 */
export function useMarquee<Track extends HTMLElement>({ speed = 40 }: MarqueeOptions = {}) {
  const reference = useRef<Track>(null);
  useEffect(() => {
    const track = reference.current;
    if (!track) return;
    const automatic = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : speed;
    let offset = 0;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let lastTime = 0;
    let previous = performance.now();
    let frame = 0;
    const wrap = () => {
      const half = track.scrollWidth / 2;
      if (half > 0) offset = ((offset % half) - half) % half || 0;
    };
    const tick = (now: number) => {
      const seconds = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      if (!dragging) {
        // Inertia from a fling eases back into the automatic speed.
        velocity += (-automatic - velocity) * Math.min(1, seconds * 2.5);
        offset += velocity * seconds;
      }
      wrap();
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    const down = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      velocity = 0;
      track.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const delta = event.clientX - lastX;
      const elapsed = Math.max(1, event.timeStamp - lastTime) / 1000;
      offset += delta;
      velocity = delta / elapsed;
      lastX = event.clientX;
      lastTime = event.timeStamp;
    };
    const up = (event: PointerEvent) => {
      dragging = false;
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    };
    // Sideways scrolling moves the strip; vertical scrolling is left to the page.
    const wheel = (event: WheelEvent) => {
      const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      if (Math.abs(delta) <= Math.abs(event.shiftKey ? 0 : event.deltaY)) return;
      event.preventDefault();
      offset -= delta;
    };
    velocity = -automatic;
    track.addEventListener("pointerdown", down);
    track.addEventListener("wheel", wheel, { passive: false });
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("wheel", wheel);
    };
  }, [speed]);
  return reference;
}
