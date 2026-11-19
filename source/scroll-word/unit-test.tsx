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

test("lights the last word fully by the end of the scroll", async () => {
  const { motionValue } = await import("motion/react");
  const { ScrollWord } = await import("@sharadox/animation-web-library/scroll-word/word");
  const progress = motionValue(1);
  const { container } = render(
    <p>
      <ScrollWord word="last" index={9} count={10} progress={progress} opacity={[0.12, 1]} span={1.5} />
    </p>,
  );
  expect(container.querySelector("span")!.style.opacity).toBe("1");
});
