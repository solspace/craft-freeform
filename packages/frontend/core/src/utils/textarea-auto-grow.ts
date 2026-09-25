export type TextareaAutoGrowConfig = {
  autoGrow?: boolean;
  autoGrowMaxHeight?: number | null;
  rows?: number;
};

export type TextareaAutoGrowController = {
  /** Recalculate height after controlled value changes or visibility updates. */
  update: () => void;
  destroy: () => void;
};

type TextareaState = {
  height: string;
  width: number;
};

/**
 * Makes a textarea grow and shrink with its contents.
 * Off by default — call only when the field opts in via `frontend.config.autoGrow`.
 */
export function mountTextareaAutoGrow(
  field: HTMLTextAreaElement,
  config: TextareaAutoGrowConfig = {},
): TextareaAutoGrowController {
  const state: TextareaState = {
    height: field.style.height,
    width: field.getBoundingClientRect().width,
  };

  const maxHeight = Number(config.autoGrowMaxHeight);
  if (Number.isFinite(maxHeight) && maxHeight > 0) {
    field.style.maxHeight = `${maxHeight}px`;
  }

  const resize = (): void => {
    if (!field.isConnected || !field.getClientRects().length) {
      return;
    }

    const scrollTop = field.scrollTop;
    // Restore the initial height (or rows) so the field can shrink again.
    field.style.height = state.height;
    field.style.overflowY = "hidden";

    const style = getComputedStyle(field);
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const border =
      parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const height = Math.max(field.offsetHeight, field.scrollHeight + border);

    field.style.height = `${
      style.boxSizing === "border-box" ? height : height - padding - border
    }px`;
    // CSS max-height / min-height remain authoritative.
    field.style.overflowY =
      field.scrollHeight > field.clientHeight + 1 ? "auto" : "hidden";
    field.scrollTop = scrollTop;
  };

  const onInput = (event: Event): void => {
    if (event.target === field) {
      resize();
    }
  };

  let frame: number | undefined;
  const scheduleResize = (): void => {
    if (frame !== undefined) {
      return;
    }

    // Native reset fires before the browser restores default values.
    frame = requestAnimationFrame(() => {
      frame = undefined;
      resize();
    });
  };

  let observer: ResizeObserver | undefined;
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => {
      const width = field.getBoundingClientRect().width;
      // Height changes are ours; only width / visibility changes need a resize.
      if (state.width !== width) {
        state.width = width;
        resize();
      }
    });
    observer.observe(field);
  }

  field.addEventListener("input", onInput);
  field.addEventListener("change", onInput);
  field.form?.addEventListener("reset", scheduleResize);

  resize();

  return {
    update: scheduleResize,
    destroy: () => {
      if (frame !== undefined) {
        cancelAnimationFrame(frame);
        frame = undefined;
      }
      observer?.disconnect();
      field.removeEventListener("input", onInput);
      field.removeEventListener("change", onInput);
      field.form?.removeEventListener("reset", scheduleResize);
      field.style.height = state.height;
      field.style.overflowY = "";
      if (Number.isFinite(maxHeight) && maxHeight > 0) {
        field.style.maxHeight = "";
      }
    },
  };
}
