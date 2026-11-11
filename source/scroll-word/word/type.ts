import type { MotionValue } from "motion/react";

export interface ScrollWordProperties {
  word: string;
  /** Position of the word in the sentence. */
  index: number;
  /** Number of words in the sentence. */
  count: number;
  progress: MotionValue<number>;
  /** Opacity before and after the word lights up. */
  opacity: readonly [number, number];
  /** How many words' worth of scroll each word takes to light up. */
  span: number;
}
