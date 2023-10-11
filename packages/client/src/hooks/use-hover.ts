import type { RefObject } from 'react';
import { useState } from 'react';

export function useHover<T extends HTMLElement = HTMLElement>(
  elementRef: RefObject<T>
): boolean {
  const [hovering, setHovering] = useState<boolean>(false);

  const handleMouseEnter = (): void => setHovering(true);
  const handleMouseLeave = (): void => setHovering(false);

  elementRef.current?.addEventListener('mouseenter', handleMouseEnter);
  elementRef.current?.addEventListener('mouseleave', handleMouseLeave);

  return hovering;
}
