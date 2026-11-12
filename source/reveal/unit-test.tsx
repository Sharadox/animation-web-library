import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { beginSoftNavigation } from "@sharadox/web-library/navigation/soft-navigation";

afterEach(cleanup);
import { Reveal } from "@sharadox/animation-web-library/reveal";

describe("Reveal", () => {
  test("renders its children with the given class, hidden until it scrolls into view", () => {
    render(<Reveal className="custom">Inside</Reveal>);
    const element = screen.getByText("Inside");
    expect(element.className).toBe("custom");
    expect(element.style.opacity).toBe("0");
    expect(element.style.filter).toBe("blur(6px)");
  });

  test("can start without blur and from another offset", () => {
    render(
      <Reveal blur={0} y={8} delay={0.2} margin="-5% 0px">
        Plain
      </Reveal>,
    );
    const element = screen.getByText("Plain");
    expect(element.style.filter).toBe("");
    expect(element.style.transform).toContain("translateY(8px)");
  });

  test("when the page is rebuilt in place, shows the ones on screen at once and keeps the rest for later", () => {
    vi.stubGlobal("innerWidth", 1000);
    vi.stubGlobal("innerHeight", 800);
    const below = { top: 2000, left: 0, width: 100, height: 50, bottom: 2050, right: 100 } as DOMRect;
    const visible = { top: 10, left: 0, width: 100, height: 50, bottom: 60, right: 100 } as DOMRect;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return this.textContent === "Later" ? below : visible;
    });
    beginSoftNavigation();
    render(
      <>
        <Reveal>Settled</Reveal>
        <Reveal>Later</Reveal>
      </>,
    );
    expect(screen.getByText("Settled").style.opacity).toBe("");
    expect(screen.getByText("Later").style.opacity).toBe("0");
    beginSoftNavigation(0);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});
