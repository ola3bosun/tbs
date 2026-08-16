import { useState, useEffect, useRef, useCallback } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#_";

// Generates a fully scrambled version of a string (all chars randomised)
function fullyScramble(text) {
  return text
    .split("")
    .map((c) => (c === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
    .join("");
}

// Resolves chars left-to-right from scrambled to real text
export function useScrambleText(text, options = {}) {
  const { duration = 1000, delay = 0, trigger = true } = options;
  const [displayText, setDisplayText] = useState(() =>
    trigger && text ? text : ""
  );

  useEffect(() => {
    if (!trigger || !text) {
      const frame = requestAnimationFrame(() => setDisplayText(""));
      return () => cancelAnimationFrame(frame);
    }

    let startTime = null;
    let animationFrame = null;
    let timeoutId = null;

    const startAnimation = () => {
      const run = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const length = text.length;
        const resolveCount = Math.floor(progress * length);

        let result = "";
        for (let i = 0; i < length; i++) {
          if (i < resolveCount || text[i] === " ") {
            result += text[i];
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        setDisplayText(result);
        if (progress < 1) animationFrame = requestAnimationFrame(run);
      };
      animationFrame = requestAnimationFrame(run);
    };

    timeoutId = setTimeout(startAnimation, delay > 0 ? delay : 0);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [text, duration, delay, trigger]);

  return displayText;
}

// Imperative scramble controller: exposes scrambleOut() and scrambleIn()
// so calling code can sequence scramble-out and scramble-in manually.
export function useImperativeScramble(text, duration = 700) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);

  // Keep displayText in sync when text changes externally while not animating
  const latestTextRef = useRef(text);
  useEffect(() => {
    latestTextRef.current = text;
  }, [text]);

  const cancelAll = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  // Scramble text OUT (real → random chars), returns a Promise that resolves when done
  const scrambleOut = useCallback(
    (outDuration = 300) =>
      new Promise((resolve) => {
        cancelAll();
        const currentText = latestTextRef.current;
        let startTime = null;

        const run = (ts) => {
          if (!startTime) startTime = ts;
          const progress = Math.min((ts - startTime) / outDuration, 1);
          // Characters resolve to random as progress goes 0 → 1
          const resolvedCount = Math.floor((1 - progress) * currentText.length);
          let result = "";
          for (let i = 0; i < currentText.length; i++) {
            if (currentText[i] === " ") {
              result += " ";
            } else if (i < resolvedCount) {
              result += currentText[i];
            } else {
              result += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
          setDisplayText(result);
          if (progress < 1) {
            frameRef.current = requestAnimationFrame(run);
          } else {
            resolve();
          }
        };
        frameRef.current = requestAnimationFrame(run);
      }),
    [cancelAll]
  );

  // Scramble text IN (random chars → real), resolves when done
  const scrambleIn = useCallback(
    (newText, inDuration = duration) =>
      new Promise((resolve) => {
        cancelAll();
        latestTextRef.current = newText;
        let startTime = null;

        const run = (ts) => {
          if (!startTime) startTime = ts;
          const progress = Math.min((ts - startTime) / inDuration, 1);
          const resolveCount = Math.floor(progress * newText.length);
          let result = "";
          for (let i = 0; i < newText.length; i++) {
            if (i < resolveCount || newText[i] === " ") {
              result += newText[i];
            } else {
              result += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
          setDisplayText(result);
          if (progress < 1) {
            frameRef.current = requestAnimationFrame(run);
          } else {
            resolve();
          }
        };
        frameRef.current = requestAnimationFrame(run);
      }),
    [cancelAll, duration]
  );

  // Cleanup on unmount
  useEffect(() => () => cancelAll(), [cancelAll]);

  return { displayText, scrambleOut, scrambleIn };
}
