import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { OffscreenLoops } from "@sharadox/animation-web-library/offscreen-loops";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

class Timeline {}
const animation = (
  target: Element | null,
  iterations = Infinity,
  playState = "running",
  timeline: object = new Timeline(),
) => {
  const fake = {
    timeline,
    playState,
    effect: target === undefined ? null : { target, getTiming: () => ({ iterations }) },
    play: vi.fn(() => (fake.playState = "running")),
    pause: vi.fn(() => (fake.playState = "paused")),
  };
  return fake;
};

let seen: (entries: { target: Element; isIntersecting: boolean }[]) => void = () => {};
const observed: Element[] = [];
let margin = "";
const disconnect = vi.fn();
const observe = () =>
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof seen, options: { rootMargin: string }) {
        seen = callback;
        margin = options.rootMargin;
      }
      observe(target: Element) {
        observed.push(target);
      }
      disconnect = disconnect;
    },
  );

test("pauses each endless loop while what it moves is off screen, and plays on only what it paused", () => {
  vi.stubGlobal("DocumentTimeline", Timeline);
  observe();
  document.body.innerHTML = "<header id='bar'></header><main><i id='a'></i><i id='b'></i></main>";
  const [a, b, bar] = ["a", "b", "bar"].map((id) => document.getElementById(id)!);
  const loop = animation(a!);
  const secondLoop = animation(a!);
  const heldByItsStyle = animation(b!, Infinity, "paused");
  const entrance = animation(b!, 1);
  const scrolling = animation(b!, Infinity, "running", {});
  const outside = animation(bar!);
  const detached = animation(null);
  document.getAnimations = () => [loop, secondLoop, heldByItsStyle, entrance, scrolling, outside, detached] as never;
  const { unmount } = render(<OffscreenLoops />);
  expect(observed).toEqual([a, b]);
  expect(margin).toBe("200px 0px");
  seen([
    { target: a!, isIntersecting: false },
    { target: b!, isIntersecting: false },
  ]);
  expect(loop.pause).toHaveBeenCalled();
  expect(secondLoop.pause).toHaveBeenCalled();
  // Already paused by its own style: left as it is, and not played later.
  expect(heldByItsStyle.pause).not.toHaveBeenCalled();
  seen([
    { target: a!, isIntersecting: true },
    { target: b!, isIntersecting: true },
  ]);
  expect(loop.play).toHaveBeenCalledTimes(1);
  expect(heldByItsStyle.play).not.toHaveBeenCalled();
  seen([{ target: a!, isIntersecting: true }]);
  expect(loop.play).toHaveBeenCalledTimes(1);
  for (const other of [entrance, scrolling, outside]) {
    expect(other.pause).not.toHaveBeenCalled();
    expect(other.play).not.toHaveBeenCalled();
  }
  seen([{ target: document.body, isIntersecting: false }]);
  unmount();
  expect(disconnect).toHaveBeenCalled();
});

test("takes its own area and margin, and does nothing where the browser can't tell what is on screen", () => {
  vi.stubGlobal("DocumentTimeline", Timeline);
  observe();
  observed.length = 0;
  document.getAnimations = () => [animation(document.body)] as never;
  render(<OffscreenLoops within="#missing" margin="0px" />);
  expect(observed).toEqual([]);
  expect(margin).toBe("0px 0px");
  cleanup();
  vi.stubGlobal("IntersectionObserver", undefined);
  expect(() => render(<OffscreenLoops />)).not.toThrow();
});

test("rests SVG drawings animated with SMIL while off screen, resuming only those it paused", () => {
  vi.stubGlobal("DocumentTimeline", Timeline);
  observed.length = 0;
  observe();
  document.body.innerHTML =
    "<main><svg id='moving'><path><animate attributeName='d'></animate></path></svg><svg id='held'><set></set></svg><svg id='still'></svg></main>";
  document.getAnimations = () => [];
  const drawing = (id: string, initiallyPaused = false) => {
    const element = document.getElementById(id) as unknown as SVGSVGElement;
    let isPaused = initiallyPaused;
    Object.assign(element, {
      animationsPaused: () => isPaused,
      pauseAnimations: vi.fn(() => (isPaused = true)),
      unpauseAnimations: vi.fn(() => (isPaused = false)),
    });
    return element;
  };
  const moving = drawing("moving");
  const held = drawing("held", true);
  render(<OffscreenLoops />);
  expect(observed).toEqual([moving, held]);
  seen([
    { target: moving, isIntersecting: false },
    { target: held, isIntersecting: false },
  ]);
  expect(moving.pauseAnimations).toHaveBeenCalled();
  expect(held.pauseAnimations).not.toHaveBeenCalled();
  seen([
    { target: moving, isIntersecting: true },
    { target: held, isIntersecting: true },
  ]);
  expect(moving.unpauseAnimations).toHaveBeenCalledTimes(1);
  expect(held.unpauseAnimations).not.toHaveBeenCalled();
  seen([{ target: moving, isIntersecting: true }]);
  expect(moving.unpauseAnimations).toHaveBeenCalledTimes(1);
});
