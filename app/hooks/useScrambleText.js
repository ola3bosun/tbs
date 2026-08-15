import { useState, useEffect } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#_';

export function useScrambleText(text, options = {}) {
  const { duration = 1000, delay = 0, trigger = true } = options;
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!trigger || !text) {
      setDisplayText('');
      return;
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
        
        let result = '';
        for (let i = 0; i < length; i++) {
          if (i < resolveCount || text[i] === ' ') {
            result += text[i];
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        
        setDisplayText(result);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(run);
        }
      };
      
      animationFrame = requestAnimationFrame(run);
    };

    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [text, duration, delay, trigger]);

  return displayText;
}
