import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useEffect } from 'react';

type EscapeCallback = () => void;

type ContextType = {
  stack: Array<EscapeCallback>;
  push: (callback: EscapeCallback) => void;
  pop: (callback?: EscapeCallback) => EscapeCallback | undefined;
};

const EscapeContext = createContext<ContextType>({
  stack: [],
  push: () => void {},
  pop: () => undefined,
});

export const useEscapeStack = (
  callback: EscapeCallback,
  isActive: boolean = true
): void => {
  const { push, pop } = useContext(EscapeContext);

  useEffect(() => {
    if (isActive) {
      push(callback);
    } else {
      pop(callback);
    }

    return () => {
      pop(callback);
    };
  }, [isActive]);
};

export const EscapeStackProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const stack: Array<EscapeCallback> = [];

  const push = (callback: EscapeCallback): void => {
    stack.push(callback);
  };

  const pop = (callback?: EscapeCallback): EscapeCallback | undefined => {
    if (!callback) {
      return stack.pop();
    }

    const index = stack.indexOf(callback);
    if (index !== -1) {
      return stack.splice(index, 1)[0];
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        const callback = stack.at(-1);
        if (callback) {
          callback();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <EscapeContext.Provider
      value={{
        stack,
        push,
        pop,
      }}
    >
      {children}
    </EscapeContext.Provider>
  );
};
