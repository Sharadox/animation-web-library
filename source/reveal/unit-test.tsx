import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
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
});
