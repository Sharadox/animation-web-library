# Changelog

What changed in each version of `@sharadox/animation-web-library`, newest first.

## 0.4.1

Uses motion 14 (no change to the animations).

## 0.4.0

- `offscreen-loops`: `OffscreenLoops`, which lets a page's endless CSS animations rest while what they move is off screen (each element on its own, SVG drawings animated with SMIL included; it only resumes what it paused itself) (on sharadox.com, the main thread went from about 95% busy to under 40% while reading the lower sections). Entrances and scroll-driven animations are left alone; nothing looks different.
- The marquee only works while it is on screen (it rests off screen and carries on from where it was), and measures its track when its size changes instead of every frame.
