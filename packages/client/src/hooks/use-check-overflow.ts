import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

export const useCheckOverflow = <T extends HTMLElement>(): [
  MutableRefObject<T>,
  boolean
] => {
  const textRef = useRef<T>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = (): void => {
      const element = textRef.current;
      if (element) {
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      }
    };

    window.addEventListener('resize', checkOverflow);
    checkOverflow();

    return () => window.removeEventListener('resize', checkOverflow);
  }, [textRef]);

  return [textRef, isOverflowing];
};
