import { elementTreeHasClass } from "@ff-client/utils/classes";
import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";

type ClickOutsideOptions<T extends HTMLElement> = {
  callback: () => void;
  isEnabled: boolean;
  refObject?: MutableRefObject<T>;
  excludeClassNames?: string[];
};

export const useClickOutside = <T extends HTMLElement>({
  callback,
  isEnabled,
  refObject,
  excludeClassNames,
}: ClickOutsideOptions<T>): MutableRefObject<T> => {
  const ref = useRef<T>();
  const usableRef = refObject || ref;

  // biome-ignore lint/correctness/useExhaustiveDependencies: Works as expected
  useEffect(() => {
    const onClickHandler = (event: MouseEvent): void => {
      if (!isEnabled) {
        return;
      }

      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (
        isEnabled &&
        usableRef.current &&
        !usableRef.current.contains(event.target as Node) &&
        !elementTreeHasClass(event.target as Element, excludeClassNames)
      ) {
        if (typeof callback === "function") {
          callback();
        }
      }
    };

    document.addEventListener("click", onClickHandler, true);

    return (): void => {
      document.removeEventListener("click", onClickHandler, true);
    };
  }, [usableRef, isEnabled, excludeClassNames]);

  return usableRef;
};
