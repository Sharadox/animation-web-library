"use client";
import { motion, useTransform } from "motion/react";
import type { ScrollWordProperties } from "@sharadox/animation-web-library/scroll-word/word/type";

/** One word that brightens when scroll progress reaches its place in the sentence. */
export function ScrollWord({ word, index, count, progress, opacity, span }: ScrollWordProperties) {
  const start = index / count;
  const value = useTransform(progress, [start, start + span / count], [...opacity]);
  return <motion.span style={{ opacity: value }}>{word} </motion.span>;
}
