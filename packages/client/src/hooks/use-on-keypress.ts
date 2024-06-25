import { useEffect } from 'react';
import type { GenericValue } from '@ff-client/types/properties';

type OnKeypress = (
  options: {
    callback: (event: KeyboardEvent) => void;
    meetsCondition?: boolean;
    type?: 'keyup' | 'keydown';
    ref?: React.RefObject<HTMLElement>;
  },
  deps?: GenericValue[]
) => void;

export const useOnKeypress: OnKeypress = (
  { meetsCondition, callback, type = 'keyup', ref },
  deps = []
): void => {
  const target = ref?.current ?? document;

  useEffect(() => {
    if (meetsCondition === undefined || meetsCondition) {
      target.addEventListener(type, callback);
    }

    if (meetsCondition === false) {
      target.removeEventListener(type, callback);
    }

    return () => {
      target.removeEventListener(type, callback);
    };
  }, [meetsCondition, ...deps]);
};
