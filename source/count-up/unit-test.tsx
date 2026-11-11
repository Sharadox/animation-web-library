import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useCountUp } from "@sharadox/animation-web-library/count-up";

const prefersReducedMotion = (reduced: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reduced } as MediaQueryList);

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useCountUp", () => {
  test("waits for the start signal", () => {
    prefersReducedMotion(false);
    const { result } = renderHook(() => useCountUp(100, false));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toBe(0);
  });

  test("eases from 0 to the target over the duration", () => {
    prefersReducedMotion(false);
    const { result } = renderHook(() => useCountUp(100, true, 1000));
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBeGreaterThan(50);
    expect(result.current).toBeLessThan(100);
    act(() => vi.advanceTimersByTime(600));
    expect(result.current).toBe(100);
  });

  test("jumps straight to the target when motion is reduced", () => {
    prefersReducedMotion(true);
    const { result, unmount } = renderHook(() => useCountUp(42, true));
    act(() => vi.advanceTimersByTime(20));
    expect(result.current).toBe(42);
    unmount();
  });

  test("stops when unmounted mid-way", () => {
    prefersReducedMotion(false);
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = renderHook(() => useCountUp(100, true));
    act(() => vi.advanceTimersByTime(100));
    unmount();
    expect(cancel).toHaveBeenCalled();
  });
});
