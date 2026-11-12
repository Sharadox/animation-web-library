"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { isSoftNavigation } from "@sharadox/web-library/navigation/soft-navigation";
import type { RevealProperties } from "@sharadox/animation-web-library/reveal/type";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Fades, lifts and (optionally) unblurs its children into place the first time they scroll into view. When the page
 * is rebuilt in place (a soft navigation, such as switching language), it shows its children at once.
 */
export function Reveal({ children, delay = 0, y = 24, blur = 6, margin = "-12% 0px", className }: RevealProperties) {
  const [settled] = useState(isSoftNavigation);
  return (
    <motion.div
      className={className}
      initial={settled ? false : blur ? { opacity: 0, y, filter: `blur(${blur}px)` } : { opacity: 0, y }}
      whileInView={blur ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: margin as `${number}px` }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
