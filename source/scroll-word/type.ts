export interface ScrollWordsProperties {
  text: string;
  className?: string;
  /** When lighting starts and ends, as Motion scroll offsets. Defaults to ["start 80%", "end 40%"]. */
  offset?: readonly [string, string];
  /** Opacity before and after each word lights up. Defaults to [0.12, 1]. */
  opacity?: readonly [number, number];
  /** How many words' worth of scroll each word takes to light up. Defaults to 1.5. */
  span?: number;
}
