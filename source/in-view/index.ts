"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { isOnScreen } from "@sharadox/web-library/layout/on-screen";
import { isSoftNavigation } from "@sharadox/web-library/navigation/soft-navigation";

/**
 * True once the element has been at least `threshold` visible. Stays true. When the page is rebuilt in place (a soft
 * navigation, such as switching language), an element already on screen counts as seen before the page is painted.
 *
 * @example
 * const [card, seen] = useInView<HTMLDivElement>();
 * <div ref={card} className={seen ? styles.shown : undefined} />
 */
export function useInView<Target extends HTMLElement>(threshold = 0.35) {
  const element = useRef<Target>(null);
  const [inView, setInView] = useState(false);
  useLayoutEffect(() => {
    // Measuring needs the element; settling before paint keeps a rebuilt page looking as it was.
    if (isSoftNavigation() && element.current && isOnScreen(element.current)) setInView(true);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setInView(true), { threshold });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [element, inView] as const;
}
