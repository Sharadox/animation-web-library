"use client";
import { motion } from "motion/react";
import type { RevealProperties } from "@sharadox/animation-web-library/reveal/type";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades, lifts and (optionally) unblurs its children into place the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 24, blur = 6, margin = "-12% 0px", className }: RevealProperties) {
  return (
    <motion.div
      className={className}
      initial={blur ? { opacity: 0, y, filter: `blur(${blur}px)` } : { opacity: 0, y }}
      whileInView={blur ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: margin as `${number}px` }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
