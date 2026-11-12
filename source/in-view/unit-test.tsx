import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useInView } from "@sharadox/animation-web-library/in-view";
import { beginSoftNavigation } from "@sharadox/web-library/navigation/soft-navigation";

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

test("when the page is rebuilt in place, an element already on screen counts as seen at once", () => {
  vi.stubGlobal("innerWidth", 1000);
  vi.stubGlobal("innerHeight", 800);
  const spy = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockReturnValue({ top: 10, left: 0, width: 100, height: 50, bottom: 60, right: 100 } as DOMRect);
  beginSoftNavigation();
  render(<Probe />);
  expect(screen.getByText("seen")).toBeTruthy();
  spy.mockReturnValue({ top: 3000, left: 0, width: 100, height: 50, bottom: 3050, right: 100 } as DOMRect);
  render(<Probe />);
  expect(screen.getAllByText("waiting")).toHaveLength(1);
  beginSoftNavigation(0);
  spy.mockRestore();
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
