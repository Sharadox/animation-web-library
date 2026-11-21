import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { OffscreenLoops } from "@sharadox/animation-web-library/offscreen-loops";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

class Timeline {}
const animation = (iterations: number, timeline: object = new Timeline()) => ({
  timeline,
  effect: { getTiming: () => ({ iterations }) },
  play: vi.fn(),
  pause: vi.fn(),
});

test("pauses a section's endless loops while it is off screen and plays them on when it comes near", () => {
  vi.stubGlobal("DocumentTimeline", Timeline);
  let seen: (entries: { target: Element; isIntersecting: boolean }[]) => void = () => {};
  const observe = vi.fn();
  const disconnect = vi.fn();
  let margin = "";
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof seen, options: { rootMargin: string }) {
        seen = callback;
        margin = options.rootMargin;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  document.body.innerHTML = "<main><section id='a'></section><section id='b'></section></main>";
  const section = document.getElementById("a")!;
  const loop = animation(Infinity);
  const entrance = animation(1);
  const scrolling = animation(Infinity, {});
  section.getAnimations = () => [loop, entrance, scrolling] as never;
  const { unmount } = render(<OffscreenLoops />);
  expect(observe).toHaveBeenCalledTimes(2);
  expect(margin).toBe("200px 0px");
  seen([{ target: section, isIntersecting: false }]);
  expect(loop.pause).toHaveBeenCalled();
  seen([{ target: section, isIntersecting: true }]);
  expect(loop.play).toHaveBeenCalled();
  // Entrances and scroll-driven animations are left alone.
  for (const other of [entrance, scrolling]) {
    expect(other.pause).not.toHaveBeenCalled();
    expect(other.play).not.toHaveBeenCalled();
  }
  unmount();
  expect(disconnect).toHaveBeenCalled();
});

test("takes its own parts and margin, and does nothing where the browser can't tell what is on screen", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  expect(() => render(<OffscreenLoops selector=".loop" margin="0px" />)).not.toThrow();
});
