import { useEventCallback } from "@ff-client/hooks/ts-hooks/use-event-callback";
import type React from "react";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

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
  isActive: boolean = true,
): void => {
  const { push, pop } = useContext(EscapeContext);
  const handler = useEventCallback(callback);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    push(handler);

    return () => {
      pop(handler);
    };
  }, [handler, isActive, pop, push]);
};

export const EscapeStackProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const stackRef = useRef<Array<EscapeCallback>>([]);

  const push = useCallback((callback: EscapeCallback): void => {
    const stack = stackRef.current;

    if (stack.at(-1) !== callback) {
      stack.push(callback);
    }
  }, []);

  const pop = useCallback(
    (callback?: EscapeCallback): EscapeCallback | undefined => {
      const stack = stackRef.current;

      if (!callback) {
        return stack.pop();
      }

      const index = stack.indexOf(callback);
      if (index !== -1) {
        return stack.splice(index, 1)[0];
      }
    },
    [],
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        const callback = stackRef.current.at(-1);
        if (callback) {
          callback();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const value = useMemo(
    () => ({
      stack: stackRef.current,
      push,
      pop,
    }),
    [pop, push],
  );

  return (
    <EscapeContext.Provider value={value}>{children}</EscapeContext.Provider>
  );
};
