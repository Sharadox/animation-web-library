export interface OffscreenLoopsProperties {
  /** Where to look for endless animations: the page's main content by default. */
  within?: string;
  /** How far beyond the screen an element counts as near, so its loops are playing again before it shows. */
  margin?: string;
}
