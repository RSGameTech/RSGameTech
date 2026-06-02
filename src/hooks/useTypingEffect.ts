import { useEffect, useRef, useState } from "react";

export function useTypingEffect(words: string[]) {
  const [displayed, setDisplayed] = useState(words[0] ?? "");
  const state = useRef({ wordIdx: 0, charIdx: words[0]?.length ?? 0, isDeleting: false });

  useEffect(() => {
    if (!words.length) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const step = () => {
      const { wordIdx, charIdx, isDeleting } = state.current;
      const word = words[wordIdx];

      if (!isDeleting) {
        const next = charIdx + 1;
        state.current.charIdx = next;
        setDisplayed(word.substring(0, next));
        if (next >= word.length) {
          // Pause at full word before deleting
          timeoutId = setTimeout(() => {
            state.current.isDeleting = true;
            step();
          }, 1800);
          return;
        }
      } else {
        const next = charIdx - 1;
        state.current.charIdx = next;
        setDisplayed(word.substring(0, next));
        if (next <= 0) {
          state.current.wordIdx = (wordIdx + 1) % words.length;
          state.current.isDeleting = false;
          // Pause before typing next word
          timeoutId = setTimeout(step, 400);
          return;
        }
      }

      timeoutId = setTimeout(step, isDeleting ? 50 : 100);
    };

    // Initial delay before first type
    timeoutId = setTimeout(step, 1200);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words.join(",")]);

  return displayed;
}
