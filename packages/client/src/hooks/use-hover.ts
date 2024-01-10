import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

export function useHover<T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>
): boolean {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseEnter = (): void => setIsHovered(true);
  const handleMouseLeave = (): void => setIsHovered(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [elementRef]);

  return isHovered;
}
