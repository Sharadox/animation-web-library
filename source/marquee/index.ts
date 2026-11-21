"use client";
import { useEffect, useRef } from "react";
import type { MarqueeOptions } from "@sharadox/animation-web-library/marquee/type";

/** How fast a sideways scroll catches up: the share of the remaining distance covered per second. */
const GLIDE = 9;
/** Pixels in one wheel "line", for browsers that count wheel steps in lines. */
const LINE = 16;

/**
 * An endless strip that slides on its own and can be grabbed and flung by hand (mouse or touch), with inertia, or
 * scrolled sideways (a trackpad's horizontal swipe, or Shift with a mouse wheel), which glides like the page's own
 * smooth scrolling instead of jumping.
 * Attach the returned reference to the track: an element holding two identical groups side by side, so moving it by
 * one group's width (half the track) looks the same. It does not move by itself when the visitor prefers reduced
 * motion, but can still be dragged. It only works while it is on screen: off screen it rests where it was (nobody
 * sees it) and carries on from there when it comes back, and it measures the track only when its size changes,
 * never every frame, so it costs nothing while the page is read elsewhere.
 */
export function useMarquee<Track extends HTMLElement>({ speed = 40 }: MarqueeOptions = {}) {
  const reference = useRef<Track>(null);
  useEffect(() => {
    const track = reference.current;
    if (!track) return;
    const automatic = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : speed;
    let offset = 0;
    let velocity = 0;
    // Wheel distance not travelled yet: it drains a little every frame, so a sideways scroll glides.
    let pending = 0;
    let dragging = false;
    let lastX = 0;
    let lastTime = 0;
    let previous = performance.now();
    let frame = 0;
    // One group's width, measured when the track's size changes (fonts arriving, a resize), not every frame.
    let half = track.scrollWidth / 2;
    const measure = () => {
      half = track.scrollWidth / 2;
    };
    const wrap = () => {
      if (half > 0) offset = ((offset % half) - half) % half || 0;
    };
    const tick = (now: number) => {
      const seconds = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      if (!dragging) {
        // Inertia from a fling eases back into the automatic speed.
        velocity += (-automatic - velocity) * Math.min(1, seconds * 2.5);
        const glide = pending * Math.min(1, seconds * GLIDE);
        pending -= glide;
        offset += velocity * seconds + glide;
      }
      wrap();
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    // Runs only while the strip is on screen; back on screen, it starts from the moment it returns, without a jump.
    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      previous = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const visibility =
      typeof IntersectionObserver === "undefined"
        ? undefined
        : new IntersectionObserver(([entry]) => (entry!.isIntersecting ? start() : stop()));
    const size = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    const down = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      velocity = 0;
      pending = 0;
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
      // Keeps a page-wide smooth scroller (which listens higher up) from also moving the page.
      event.stopPropagation();
      pending -= delta * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? LINE : 1);
    };
    velocity = -automatic;
    track.addEventListener("pointerdown", down);
    track.addEventListener("wheel", wheel, { passive: false });
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    start();
    visibility?.observe(track);
    size?.observe(track);
    return () => {
      stop();
      visibility?.disconnect();
      size?.disconnect();
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      track.removeEventListener("wheel", wheel);
    };
  }, [speed]);
  return reference;
}
