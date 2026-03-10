import type { SuggestionCategory } from "@ff-client/types/notifications";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import { useEffect } from "react";

import type { TokenBackend } from "../tokens.types";

type Props = {
  backend: TokenBackend;
  index: number;
  filter: string;
  setIndex: Dispatch<SetStateAction<number>>;
  setFilter: Dispatch<SetStateAction<string>>;
  itemCountRef: MutableRefObject<number>;
  suggestions: SuggestionCategory[];
  close: () => void;
};

export const useArrowNavigation = ({
  backend,
  index,
  filter,
  setIndex,
  setFilter,
  itemCountRef,
  suggestions,
  close,
}: Props): void => {
  useEffect(() => {
    const keyDown = (event: KeyboardEvent): undefined | boolean => {
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          close();

          break;

        case "ArrowRight":
        case "ArrowLeft":
          event.preventDefault();
          close();

          break;

        case "ArrowDown":
          event.preventDefault();

          setIndex((prev) => {
            if (prev >= itemCountRef.current - 1) {
              return itemCountRef.current - 1;
            }

            return prev < itemCountRef.current
              ? prev + 1
              : itemCountRef.current - 1;
          });

          break;

        case "ArrowUp":
          event.preventDefault();
          if (index > 0) {
            setIndex((prev) => {
              if (prev > itemCountRef.current - 1) {
                return itemCountRef.current - 1;
              }

              return prev > 0 ? prev - 1 : 0;
            });
          }

          break;

        case "Enter":
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          if (index > -1) {
            const item = suggestions
              .flatMap((category) => category.items)
              .find((item) => item.active);

            if (item) {
              backend.insert(item, filter);
            }
          }
          setFilter("");
          close();

          return false;

        default:
          if (event.key.length === 1) {
            setFilter((prev) => prev + event.key);
          }
          break;
      }
    };

    backend.handlers.on.down(keyDown, true);

    return () => {
      backend.handlers.off.down(keyDown);
    };
  }, [
    index,
    close,
    backend,
    suggestions,
    filter,
    setFilter,
    setIndex,
    itemCountRef,
  ]);
};
