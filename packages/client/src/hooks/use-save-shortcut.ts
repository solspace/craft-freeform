import { useCallback } from 'react';

import { useOnKeypress } from './use-on-keypress';

export const useSaveShortcut = (callback: () => void): void => {
  const saveOnCmdS = useCallback(
    (event: KeyboardEvent): boolean | void => {
      if (event.key === 's') {
        const isMac = window.navigator.platform.match(/Mac/);
        if (isMac && !event.metaKey) {
          return;
        }

        if (!isMac && !event.ctrlKey) {
          return;
        }

        event.preventDefault();

        callback();

        return false;
      }
    },
    [callback]
  );

  useOnKeypress({ callback: saveOnCmdS, type: 'keydown' }, [callback]);
};
