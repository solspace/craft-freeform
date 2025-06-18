import { useEffect, useRef } from 'react';

export const useInitialValue = <T>(value: T): T => {
  const initialValue = useRef<T>();

  useEffect(() => {
    if (initialValue.current === undefined) {
      initialValue.current = value;
    }
  }, []);

  return initialValue.current as T;
};
