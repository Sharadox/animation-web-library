import { expect, test } from "vitest";
import { EASE } from "@sharadox/animation-web-library/ease";

test("is one cubic Bézier curve that settles softly", () => {
  expect(EASE).toEqual([0.22, 1, 0.36, 1]);
  expect(`cubic-bezier(${EASE.join(", ")})`).toBe("cubic-bezier(0.22, 1, 0.36, 1)");
});
