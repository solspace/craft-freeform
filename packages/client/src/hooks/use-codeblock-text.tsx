import type { ReactNode } from "react";
import { useMemo } from "react";

export const useCodeblockText = (text: string | null): ReactNode[] | null => {
  const compiledText = useMemo(() => {
    if (!text) {
      return null;
    }

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
