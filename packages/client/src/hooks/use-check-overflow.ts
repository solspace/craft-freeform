import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

export const useCheckOverflow = <T extends HTMLElement>(): [
  RefObject<T>,
  boolean,
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

    window.addEventListener("resize", checkOverflow);
    checkOverflow();

    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return [textRef, isOverflowing];
};
