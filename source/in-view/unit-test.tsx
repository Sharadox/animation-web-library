import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useInView } from "@sharadox/animation-web-library/in-view";

const observers: {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  disconnect: () => void;
}[] = [];
vi.stubGlobal(
  "IntersectionObserver",
  class {
    disconnect = vi.fn();
    callback: IntersectionObserverCallback;
    options?: IntersectionObserverInit;
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.options = options;
      observers.push(this);
    }
    observe() {}
  },
);
afterEach(() => (observers.length = 0));

function Probe({ threshold }: { threshold?: number }) {
  const [element, inView] = useInView<HTMLDivElement>(threshold);
  return <div ref={element}>{inView ? "seen" : "waiting"}</div>;
}
const report = (isIntersecting: boolean) =>
  act(() => observers[0]!.callback([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver));

test("turns true once the element is visible enough, and stays true", () => {
  const { unmount } = render(<Probe />);
  expect(observers[0]!.options).toEqual({ threshold: 0.35 });
  report(false);
  expect(screen.getByText("waiting")).toBeTruthy();
  report(true);
  report(false);
  expect(screen.getByText("seen")).toBeTruthy();
  unmount();
  expect(observers[0]!.disconnect).toHaveBeenCalled();
});

test("takes another threshold", () => {
  render(<Probe threshold={0.8} />);
  expect(observers[0]!.options).toEqual({ threshold: 0.8 });
});

test("observes nothing until the reference is attached", () => {
  function Detached() {
    useInView<HTMLDivElement>();
    return null;
  }
  expect(() => render(<Detached />)).not.toThrow();
});
