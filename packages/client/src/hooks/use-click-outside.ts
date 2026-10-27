import { elementTreeHasClass } from "@ff-client/utils/classes";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

type ClickOutsideOptions<T extends HTMLElement> = {
  callback: () => void;
  isEnabled: boolean;
  refObject?: RefObject<T | null>;
  excludeClassNames?: string[];
};

export const useClickOutside = <T extends HTMLElement>({
  callback,
  isEnabled,
  refObject,
  excludeClassNames,
}: ClickOutsideOptions<T>): RefObject<T | null> => {
  const ref = useRef<T | null>(null);
  const usableRef = refObject || ref;
  const interactionInside = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Works as expected
  useEffect(() => {
    const isInside = (target: EventTarget | null): boolean =>
      !!usableRef.current?.contains(target as Node) ||
      elementTreeHasClass(target as Element, excludeClassNames);

    const onPointerDown = (event: PointerEvent): void => {
      interactionInside.current = isInside(event.target);
    };
    const onPointerUp = (event: PointerEvent): void => {
      interactionInside.current ||= isInside(event.target);
    };
    const resetInteraction = (): void => {
      interactionInside.current = false;
    };

    const onClickHandler = (event: MouseEvent): void => {
      // A drag can dispatch its click on an ancestor outside the editor, even
      // when text selection started inside it (including contenteditable fields).
      const startedOrEndedInside = interactionInside.current;
      resetInteraction();
      if (!isEnabled || startedOrEndedInside) {
        return;
      }

      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (isEnabled && usableRef.current && !isInside(event.target)) {
        if (typeof callback === "function") {
          callback();
        }
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", resetInteraction, true);
    window.addEventListener("blur", resetInteraction);
    document.addEventListener("click", onClickHandler, true);

    return (): void => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", resetInteraction, true);
      window.removeEventListener("blur", resetInteraction);
      document.removeEventListener("click", onClickHandler, true);
    };
  }, [usableRef, isEnabled, excludeClassNames]);

  return usableRef;
};
