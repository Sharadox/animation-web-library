export interface OffscreenLoopsProperties {
  /** The parts of the page whose loops rest while off screen; every section of the page's main content by default. */
  selector?: string;
  /** How far beyond the screen a part counts as near, so its loops are playing again before it shows. */
  margin?: string;
}
