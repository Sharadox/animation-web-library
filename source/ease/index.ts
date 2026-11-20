/**
 * The easing every Sharadox animation uses: a quick start that settles softly (cubic-bezier(0.22, 1, 0.36, 1)), for
 * Motion's `ease` or CSS (`cubic-bezier(${EASE.join(", ")})`). One curve, so every movement on a site feels alike.
 *
 * @example
 * <motion.div animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: EASE }} />
 */
export const EASE = [0.22, 1, 0.36, 1] as const;
