import { useEffect } from 'react';

type OnKeypress = (options: {
  callback: (event: KeyboardEvent) => void;
  meetsCondition?: boolean;
  type: 'keyup' | 'keydown';
}) => void;

export const useOnKeypress: OnKeypress = ({
  meetsCondition,
  callback,
  type = 'keyup',
}): void => {
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
  }, [meetsCondition]);
};
