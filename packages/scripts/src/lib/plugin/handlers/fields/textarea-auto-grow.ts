import type Freeform from "@components/front-end/plugin/freeform";
import events from "@lib/plugin/constants/event-types";
import type { FreeformHandler } from "types/form";

const selector = "textarea[data-freeform-auto-grow]";

type TextareaState = {
  height: string;
  width: number;
};

export default class TextareaAutoGrowHandler implements FreeformHandler {
  private form: HTMLFormElement;
  private fields: HTMLTextAreaElement[] = [];
  private states = new WeakMap<HTMLTextAreaElement, TextareaState>();
  private observer?: ResizeObserver;
  private frame?: number;

  constructor(freeform: Freeform) {
    this.form = freeform.form;
    this.form.addEventListener("input", this.onInput);
    this.form.addEventListener("change", this.onInput);
    this.form.addEventListener("reset", this.scheduleResize);
    this.form.addEventListener(events.form.reset, this.scheduleResize);
    this.form.addEventListener(events.rules.applied, this.scheduleResize);
    this.reload();
  }

  reload = (): void => {
    this.observer?.disconnect();
    if (this.frame !== undefined) {
      cancelAnimationFrame(this.frame);
      this.frame = undefined;
    }

    this.fields = Array.from(
      this.form.querySelectorAll<HTMLTextAreaElement>(selector),
    );

    if (!this.fields.length) {
      return;
    }

    if (typeof ResizeObserver !== "undefined" && !this.observer) {
      this.observer = new ResizeObserver((entries) => {
        entries.forEach(({ target }) => {
          const field = target as HTMLTextAreaElement;
          const state = this.states.get(field);
          const width = field.getBoundingClientRect().width;
          // Height changes are ours; only width/visibility changes need resizing.
          if (state && state.width !== width) {
            state.width = width;
            this.resize(field);
          }
        });
      });
    }

    this.fields.forEach((field) => {
      if (!this.states.has(field)) {
        this.states.set(field, {
          height: field.style.height,
          width: field.getBoundingClientRect().width,
        });

        const maxHeight = Number(field.dataset.freeformAutoGrowMaxHeight);
        if (Number.isFinite(maxHeight) && maxHeight > 0) {
          field.style.maxHeight = `${maxHeight}px`;
        }
      }

      this.resize(field);
      this.observer?.observe(field);
    });
  };

  private onInput = (event: Event): void => {
    if (event.target instanceof HTMLTextAreaElement) {
      this.resize(event.target);
    }
  };

  private scheduleResize = (): void => {
    if (!this.fields.length || this.frame !== undefined) {
      return;
    }

    // Native reset events fire before the browser restores default values.
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      this.fields.forEach((field) => {
        this.resize(field);
      });
    });
  };

  private resize = (field: HTMLTextAreaElement): void => {
    const state = this.states.get(field);
    if (!state || !field.isConnected || !field.getClientRects().length) {
      return;
    }

    const scrollTop = field.scrollTop;
    // Restore the template's height (or rows) to allow shrinking back to it.
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
    // CSS max-height/min-height remain authoritative, including template styles.
    field.style.overflowY =
      field.scrollHeight > field.clientHeight + 1 ? "auto" : "hidden";
    field.scrollTop = scrollTop;
  };
}
