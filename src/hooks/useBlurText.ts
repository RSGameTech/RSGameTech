import { useEffect, useRef, useState, useCallback } from "react";
import { animate, createTimeline } from "animejs";

interface BlurTextState {
  currentWord: string;
  previousWord: string;
}

export function useBlurText(words: string[]) {
  const [state, setState] = useState<BlurTextState>({
    currentWord: words[0] ?? "",
    previousWord: "",
  });
  const indexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const timelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);
  const incomingRef = useRef<HTMLSpanElement>(null);
  const outgoingRef = useRef<HTMLSpanElement>(null);
  const wordsKey = words.join(",");

  const cycle = useCallback(() => {
    if (!words.length || !incomingRef.current || !outgoingRef.current) return;

    const nextIndex = (indexRef.current + 1) % words.length;
    const prevWord = words[indexRef.current];
    const nextWord = words[nextIndex];
    indexRef.current = nextIndex;

    if (timelineRef.current) {
      timelineRef.current.cancel();
    }

    const incoming = incomingRef.current;
    const outgoing = outgoingRef.current;

    // Sync text before animation
    outgoing.textContent = prevWord;
    incoming.textContent = nextWord;

    setState({ currentWord: nextWord, previousWord: prevWord });

    // Use JS objects so Anime.js can interpolate numeric values,
    // then apply filter/opacity manually via onUpdate.
    const outProps = { blur: 0, opacity: 1 };
    const inProps = { blur: 8, opacity: 0 };

    // Ensure starting values are correct before first frame
    outgoing.style.filter = "blur(0px)";
    outgoing.style.opacity = "1";
    incoming.style.filter = "blur(8px)";
    incoming.style.opacity = "0";

    const tl = createTimeline({
      defaults: { duration: 400, ease: "inOutQuad" },
    });

    tl.add(outProps, {
      blur: 8,
      opacity: 0,
      onUpdate: () => {
        outgoing.style.filter = `blur(${outProps.blur}px)`;
        outgoing.style.opacity = String(outProps.opacity);
      },
    }).add(
      inProps,
      {
        blur: 0,
        opacity: 1,
        onUpdate: () => {
          incoming.style.filter = `blur(${inProps.blur}px)`;
          incoming.style.opacity = String(inProps.opacity);
        },
      },
      "<"
    );

    timelineRef.current = tl;

    timeoutRef.current = setTimeout(() => {
      outgoing.style.opacity = "0";
      timeoutRef.current = setTimeout(cycle, 2100);
    }, 450);
  }, [words]);

  useEffect(() => {
    if (!words.length) return;

    // Set initial states imperatively so there's no flash
    if (incomingRef.current) {
      incomingRef.current.style.filter = "blur(0px)";
      incomingRef.current.style.opacity = "1";
    }
    if (outgoingRef.current) {
      outgoingRef.current.style.filter = "blur(0px)";
      outgoingRef.current.style.opacity = "0";
    }

    timeoutRef.current = setTimeout(cycle, 1800);
    return () => {
      clearTimeout(timeoutRef.current);
      timelineRef.current?.cancel();
    };
  }, [cycle, words.length, wordsKey]);

  return { ...state, incomingRef, outgoingRef };
}
