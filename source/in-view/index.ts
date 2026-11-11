"use client";
import { useEffect, useRef, useState } from "react";

/**
 * True once the element has been at least `threshold` visible. Stays true.
 *
 * @example
 * const [card, seen] = useInView<HTMLDivElement>();
 * <div ref={card} className={seen ? styles.shown : undefined} />
 */
export function useInView<Target extends HTMLElement>(threshold = 0.35) {
  const element = useRef<Target>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setInView(true), { threshold });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [element, inView] as const;
}
