"use client";
import { useScroll } from "motion/react";
import { useRef } from "react";
import { ScrollWord } from "@sharadox/animation-web-library/scroll-word/word";
import type { ScrollWordsProperties } from "@sharadox/animation-web-library/scroll-word/type";

/** A paragraph that lights up word by word as it scrolls through the viewport. */
export function ScrollWords({
  text,
  className,
  offset = ["start 80%", "end 40%"],
  opacity = [0.12, 1],
  span = 1.5,
}: ScrollWordsProperties) {
  const paragraph = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: paragraph,
    offset: offset as unknown as NonNullable<Parameters<typeof useScroll>[0]>["offset"],
  });
  const words = text.split(" ");
  return (
    <p ref={paragraph} className={className}>
      {words.map((word, index) => (
        <ScrollWord
          key={index}
          word={word}
          index={index}
          count={words.length}
          progress={scrollYProgress}
          opacity={opacity}
          span={span}
        />
      ))}
    </p>
  );
}
