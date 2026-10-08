import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";

type TextControl = HTMLInputElement | HTMLTextAreaElement;
const selector =
  "input[data-freeform-character-count], textarea[data-freeform-character-count]";
let nextId = 0;

export default class CharacterCountHandler implements FreeformHandler {
  private counters = new WeakMap<TextControl, HTMLElement>();

  constructor(private freeform: Freeform) {
    const update = (event: Event) => {
      const input = event.target;
      if (
        (input instanceof HTMLInputElement ||
          input instanceof HTMLTextAreaElement) &&
        input.matches(selector)
      ) {
        this.update(input);
      }
    };
    freeform.form.addEventListener("input", update);
    freeform.form.addEventListener("change", update);
    freeform.form.addEventListener("reset", (event) => {
      setTimeout(() => {
        if (!event.defaultPrevented) this.reload();
      }, 0);
    });
    this.reload();
  }

  private update(input: TextControl) {
    let counter = this.counters.get(input);
    if (!counter?.isConnected) {
      counter = document.createElement("div");
      do {
        counter.id = `freeform-character-count-${++nextId}`;
      } while (document.getElementById(counter.id));
      counter.className = "freeform-character-count";
      counter.setAttribute("aria-live", "off");
      // Floating labels must remain adjacent to their input.
      const next = input.nextElementSibling;
      const anchor =
        next instanceof HTMLLabelElement && next.htmlFor === input.id
          ? next
          : input;
      anchor.insertAdjacentElement("afterend", counter);
      const descriptions = new Set(
        (input.getAttribute("aria-describedby") ?? "")
          .split(/\s+/)
          .filter(Boolean),
      );
      const oldCounter = this.counters.get(input);
      if (oldCounter) descriptions.delete(oldCounter.id);
      descriptions.add(counter.id);
      input.setAttribute("aria-describedby", [...descriptions].join(" "));
      this.counters.set(input, counter);
    }
    const count = input.value.length;
    const limit = input.maxLength;
    const message =
      limit >= 0
        ? (input.dataset.characterCountLimitMessage ??
          "{count} / {limit} characters")
        : (input.dataset.characterCountMessage ?? "{count} characters");
    counter.textContent = message.replace(/\{count\}|\{limit\}/g, (token) =>
      String(token === "{count}" ? count : limit),
    );
    counter.dataset.overLimit = String(limit >= 0 && count > limit);
  }

  reload = () => {
    this.freeform.form
      .querySelectorAll<TextControl>(selector)
      .forEach((input) => {
        this.update(input);
      });
  };
}
