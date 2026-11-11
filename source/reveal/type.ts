import type { ReactNode } from "react";

export interface RevealProperties {
  children: ReactNode;
  /** Seconds to wait before animating in. */
  delay?: number;
  /** Starting vertical offset in pixels. Defaults to 24. */
  y?: number;
  /** Starting blur in pixels; 0 turns the blur off. Defaults to 6. */
  blur?: number;
  /** How far inside the viewport the element must be before it reveals (a CSS margin). Defaults to "-12% 0px". */
  margin?: string;
  className?: string;
}
