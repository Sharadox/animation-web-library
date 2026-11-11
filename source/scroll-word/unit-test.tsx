import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { ScrollWords } from "@sharadox/animation-web-library/scroll-word";

test("renders one dim span per word inside the paragraph", () => {
  const { container } = render(<ScrollWords text="Simple, on purpose." className="statement" />);
  expect(container.querySelector("p")?.className).toBe("statement");
  const words = container.querySelectorAll<HTMLSpanElement>("p > span");
  expect(words).toHaveLength(3);
  expect(words[0]!.style.opacity).toBe("0.12");
  expect(container.textContent).toBe("Simple, on purpose. ");
});

test("takes its own opacity range, offsets and pace", () => {
  const { container } = render(
    <ScrollWords text="One two" opacity={[0.3, 1]} offset={["start end", "end start"]} span={2} />,
  );
  expect(container.querySelector<HTMLSpanElement>("p > span")!.style.opacity).toBe("0.3");
});
