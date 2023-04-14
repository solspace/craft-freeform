import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement>(
  callback: () => void,
  isEnabled: boolean,
  refObject?: MutableRefObject<T>
): MutableRefObject<T> => {
  const ref = useRef<T>();
  const usableRef = refObject || ref;

  useEffect(() => {
    const onClickHandler = (event: MouseEvent): void => {
      if (
        isEnabled &&
        usableRef.current &&
        !usableRef.current.contains(event.target as Node)
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
  }, [usableRef, isEnabled]);

  return usableRef;
};
