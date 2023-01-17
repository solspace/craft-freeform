import { useEffect } from 'react';
import type { GenericValue } from '@ff-client/types/properties';

type OnKeypress = (
  options: {
    callback: (event: KeyboardEvent) => void;
    meetsCondition?: boolean;
    type?: 'keyup' | 'keydown';
  },
  deps?: GenericValue[]
) => void;

export const useOnKeypress: OnKeypress = (
  { meetsCondition, callback, type = 'keyup' },
  deps = []
): void => {
  useEffect(() => {
    if (meetsCondition === undefined || meetsCondition) {
      document.addEventListener(type, callback);
    }

    if (meetsCondition === false) {
      document.removeEventListener(type, callback);
    }

    return () => {
      document.removeEventListener(type, callback);
    };
  }, [meetsCondition, ...deps]);
};
