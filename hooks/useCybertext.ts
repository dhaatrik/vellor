import { useState, useEffect, useRef } from 'react';

const TOKENS = '!@#$%01XF';

export const useCybertext = (text: string): string => {
  const [displayText, setDisplayText] = useState(text);
  const iterationRef = useRef<number>(0);

  useEffect(() => {
    if (!text) return;

    let animationFrameId: number;
    iterationRef.current = 0;

    const animate = () => {
      const iteration = iterationRef.current;
      const length = text.length;

      // Speed of resolution: 1 character per 2 frames
      const resolvedCount = Math.floor(iteration / 2);

      if (resolvedCount >= length) {
        setDisplayText(text);
        return;
      }

      let newText = '';
      for (let i = 0; i < length; i++) {
        if (i < resolvedCount) {
          newText += text[i];
        } else if (text[i] === ' ') {
          newText += ' ';
        } else {
          newText += TOKENS[Math.floor(Math.random() * TOKENS.length)];
        }
      }

      setDisplayText(newText);
      iterationRef.current += 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [text]);

  return displayText;
};
