import { useEffect, useRef } from 'react';

const root = document.body;

export const usePortal = (): HTMLDivElement => {
  const container = useRef<HTMLDivElement>(document.createElement('div'));

  useEffect(() => {
    root.appendChild(container.current);

    return (): void => {
      root.removeChild(container.current);
    };
  }, []);

  return container.current;
};
