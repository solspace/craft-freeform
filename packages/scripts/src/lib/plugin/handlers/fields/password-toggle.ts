import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";

let nextId = 0;
const selector = "input[data-freeform-password-toggle]";
export default class PasswordToggleHandler implements FreeformHandler {
  private buttons = new WeakMap<HTMLInputElement, HTMLButtonElement>();
  private resizeObserver?: ResizeObserver;

  constructor(private freeform: Freeform) {
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.positionButtons);
    }
    window.addEventListener("resize", this.positionButtons);
    freeform.form.addEventListener("reset", (event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) this.reload();
      });
    });
    new MutationObserver((records) => {
      for (const { target } of records) {
        if (target instanceof HTMLInputElement) {
          const button = this.buttons.get(target);
          if (button) button.disabled = target.disabled;
        }
      }
      this.positionButtons();
    }).observe(freeform.form, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
    this.reload();
  }

  reload = () => {
    this.resizeObserver?.disconnect();
    this.freeform.form
      .querySelectorAll<HTMLInputElement>(selector)
      .forEach((input) => {
        input.type = "password";
        let button = this.buttons.get(input);
        if (!button?.isConnected) {
          button = document.createElement("button");
          button.type = "button";
          button.className = "freeform-password-toggle";
          // SVG is fixed markup; translated labels are assigned as attributes below.
          button.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="freeform-password-toggle-slash" d="m3 3 18 18"/></svg>`;
          const parent = input.parentElement!;
          const position = getComputedStyle(parent).position;
          if (!position || position === "static") {
            parent.classList.add("freeform-password-container");
          }
          if (!input.id) {
            do {
              input.id = `freeform-password-${++nextId}`;
            } while (
              document.getElementById(input.id) !== input &&
              document.getElementById(input.id)
            );
          }
          button.setAttribute("aria-controls", input.id);
          // Keep the input and its floating label adjacent.
          const next = input.nextElementSibling;
          const anchor =
            next instanceof HTMLLabelElement && next.htmlFor === input.id
              ? next
              : input;
          anchor.insertAdjacentElement("afterend", button);
          const toggle = button;
          button.addEventListener("click", () => {
            if (input.matches(":disabled")) return;
            input.type = input.type === "password" ? "text" : "password";
            this.updateButton(input, toggle);
          });
          this.buttons.set(input, button);
        }
        button.disabled = input.disabled;
        this.updateButton(input, button);
        this.resizeObserver?.observe(input);
        this.resizeObserver?.observe(input.parentElement!);
      });
    this.positionButtons();
  };

  private updateButton(input: HTMLInputElement, button: HTMLButtonElement) {
    const label = this.label(input);
    button.setAttribute("aria-label", label);
    button.title = label;
    button.dataset.passwordVisible = String(input.type === "text");
  }

  private positionButtons = () => {
    this.freeform.form
      .querySelectorAll<HTMLInputElement>(selector)
      .forEach((input) => {
        const button = this.buttons.get(input);
        if (!button?.isConnected) return;

        // Anchor to the input's border box, not the height of its label/help/errors.
        // Keeping the original siblings also preserves floating-label selectors.
        button.style.left = `${input.offsetLeft + input.offsetWidth - 4}px`;
        button.style.top = `${input.offsetTop + input.offsetHeight / 2}px`;
      });
  };

  private label(input: HTMLInputElement) {
    return input.type === "password"
      ? (input.dataset.passwordShowLabel ?? "Show password")
      : (input.dataset.passwordHideLabel ?? "Hide password");
  }
}
