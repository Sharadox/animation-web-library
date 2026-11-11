import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useMarquee } from "@sharadox/animation-web-library/marquee";

const prefersReducedMotion = (reduced: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reduced } as MediaQueryList);

function Strip({ speed }: { speed?: number }) {
  const track = useMarquee<HTMLDivElement>(speed === undefined ? undefined : { speed });
  return <div ref={track} data-testid="track" />;
}
const offset = (track: HTMLElement) => Number(/translate3d\((-?[\d.]+)px/.exec(track.style.transform)?.[1] ?? 0);
const pointer = (track: HTMLElement, type: string, clientX: number, timeStamp: number) => {
  const event = new Event(type) as PointerEvent;
  Object.defineProperties(event, {
    clientX: { value: clientX },
    timeStamp: { value: timeStamp },
    pointerId: { value: 1 },
  });
  track.dispatchEvent(event);
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 1000 });
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useMarquee", () => {
  test("slides left on its own and wraps within one group", () => {
    prefersReducedMotion(false);
    const { getByTestId } = render(<Strip speed={100} />);
    const track = getByTestId("track");
    act(() => vi.advanceTimersByTime(1000));
    expect(offset(track)).toBeLessThan(0);
    expect(offset(track)).toBeGreaterThan(-500);
    act(() => vi.advanceTimersByTime(10_000));
    expect(offset(track)).toBeGreaterThan(-500);
  });

  test("follows a drag, then carries on with the fling's momentum", () => {
    prefersReducedMotion(true);
    const { getByTestId } = render(<Strip />);
    const track = getByTestId("track");
    act(() => vi.advanceTimersByTime(100));
    expect(offset(track)).toBe(0);
    pointer(track, "pointerdown", 300, 0);
    pointer(track, "pointermove", 250, 10);
    pointer(track, "pointermove", 200, 20);
    act(() => vi.advanceTimersByTime(50));
    expect(offset(track)).toBe(-100);
    pointer(track, "pointerup", 200, 30);
    act(() => vi.advanceTimersByTime(50));
    expect(offset(track)).toBeLessThan(-100);
  });

  test("ignores moves without a press, cancels drags and stops on unmount", () => {
    prefersReducedMotion(true);
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    const { getByTestId, unmount } = render(<Strip />);
    const track = getByTestId("track");
    pointer(track, "pointermove", 100, 0);
    act(() => vi.advanceTimersByTime(50));
    expect(offset(track)).toBe(0);
    pointer(track, "pointerdown", 100, 0);
    pointer(track, "pointercancel", 100, 1);
    unmount();
  });

  test("doesn't wrap before the track has a width", () => {
    prefersReducedMotion(false);
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => 0 });
    const { getByTestId } = render(<Strip speed={100} />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(offset(getByTestId("track"))).toBeLessThan(-500);
  });
});

test("does nothing until the reference is attached", () => {
  function Detached() {
    useMarquee<HTMLDivElement>();
    return null;
  }
  expect(() => render(<Detached />)).not.toThrow();
});
