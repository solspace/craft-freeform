import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement>(
  callback: () => void,
  isEnabled: boolean
): MutableRefObject<T> => {
  const ref = useRef<T>();

  useEffect(() => {
    const onClickHandler = (event: MouseEvent): void => {
      if (
        isEnabled &&
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        if (typeof callback === 'function') {
          callback();
        }
      }
    };

    document.addEventListener('click', onClickHandler, true);

    return (): void => {
      document.removeEventListener('click', onClickHandler, true);
    };
  }, [ref, isEnabled]);

  return ref;
};
