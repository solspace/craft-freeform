import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";

let nextId = 0;
const selector = "input[data-freeform-password-toggle]";
export default class PasswordToggleHandler implements FreeformHandler {
  private buttons = new WeakMap<HTMLInputElement, HTMLButtonElement>();

  constructor(private freeform: Freeform) {
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
    }).observe(freeform.form, {
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
    this.reload();
  }

  reload = () => {
    this.freeform.form
      .querySelectorAll<HTMLInputElement>(selector)
      .forEach((input) => {
        input.type = "password";
        let button = this.buttons.get(input);
        if (!button?.isConnected) {
          button = document.createElement("button");
          button.type = "button";
          button.className = "freeform-password-toggle";
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
            toggle.textContent = this.label(input);
          });
          this.buttons.set(input, button);
        }
        button.disabled = input.disabled;
        button.textContent = this.label(input);
      });
  };

  private label(input: HTMLInputElement) {
    return input.type === "password"
      ? (input.dataset.passwordShowLabel ?? "Show password")
      : (input.dataset.passwordHideLabel ?? "Hide password");
  }
}
