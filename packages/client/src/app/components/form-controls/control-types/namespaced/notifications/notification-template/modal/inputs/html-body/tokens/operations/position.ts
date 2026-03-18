import type { RefObject } from "react";

import type { TokenBackend } from "../tokens.types";

type PositionHook = (
  backend: TokenBackend,
  ref: RefObject<HTMLDivElement>,
) => {
  left: number;
  top: number;
};

export const usePosition: PositionHook = (backend, ref) => {
  const editorRect = backend.getRect();

  const { getRange } = backend;
  const range = getRange();

  let container: HTMLElement | Range;
  if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
    container = range.startContainer as HTMLElement;
  } else {
    container = range;
  }

  const rect = container.getBoundingClientRect();

  let leftOffset = window.scrollX;
  let topOffset = window.scrollY;
  if (editorRect) {
    leftOffset += editorRect.left;
    topOffset += editorRect.top;
  }

  const left = leftOffset + rect.left + 15;
  const top = topOffset + rect.top + 20;

  if (ref.current) {
    ref.current.style.left = `${left}px`;
    ref.current.style.top = `${top}px`;
  }

  return { left, top };
};
