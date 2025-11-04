import type { ReactNode } from 'react';
import React, { useMemo } from 'react';

export const useCodeblockText = (text: string): ReactNode[] => {
  const compiledText = useMemo(() => {
    const parts = text.split(/`([^`]+)`/g);

    return parts.map((part, index) => {
      // Odd indices contain the text inside backticks
      if (index % 2 !== 0) {
        return <code key={index}>{part}</code>;
      }
      return part;
    });
  }, [text]);

  return compiledText;
};
