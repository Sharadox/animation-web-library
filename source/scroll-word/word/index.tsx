"use client";
import { motion, useTransform } from "motion/react";
import type { ScrollWordProperties } from "@sharadox/animation-web-library/scroll-word/word/type";

/**
 * One word that brightens when scroll progress reaches its place in the sentence. The sentence is spread over
 * `count - 1 + span` words' worth of progress, so the last word is fully lit when progress reaches 1.
 */
export function ScrollWord({ word, index, count, progress, opacity, span }: ScrollWordProperties) {
  const length = count - 1 + span;
  const value = useTransform(progress, [index / length, (index + span) / length], [...opacity]);
  return <motion.span style={{ opacity: value }}>{word} </motion.span>;
}
