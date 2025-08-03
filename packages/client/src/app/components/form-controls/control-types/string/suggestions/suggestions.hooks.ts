import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';

export const useFocusTracking = (
  inputRef: MutableRefObject<HTMLInputElement | null>
): boolean => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const input = inputRef?.current;
    if (!input) {
      return;
    }

    const handleFocus = (): void => setActive(true);
    const handleBlur = (): void => {
      setTimeout(() => {
        setActive(false);
      }, 200);
    };

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, []);

  return active;
};
