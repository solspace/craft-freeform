import { RefObject, useEffect } from 'react';

type Handler = () => void;

export const useClickOutside = <T extends HTMLElement = HTMLElement>(ref: RefObject<T>, handler: Handler): void => {
  const clickHandler = (event: MouseEvent): void => {
    if (!ref.current || ref.current.contains(event.target as Node)) {
      return;
    }

    handler();
  };

  useEffect(() => {
    document.body.addEventListener('click', clickHandler);

    return (): void => document.body.removeEventListener('click', clickHandler);
  });
};
