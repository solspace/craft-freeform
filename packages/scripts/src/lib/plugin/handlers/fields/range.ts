import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";

export default class RangeHandler implements FreeformHandler {
  constructor(private freeform: Freeform) {
    const form = freeform.form;
    const update = (event: Event) => {
      if (
        event.target instanceof HTMLInputElement &&
        event.target.matches("input[data-freeform-range]")
      )
        this.update(event.target);
    };
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    form.addEventListener("reset", (event) => {
      setTimeout(() => {
        if (!event.defaultPrevented) this.reload();
      }, 0);
    });
    this.reload();
  }

  private update(input: HTMLInputElement) {
    const min = input.min === "" ? 0 : Number(input.min);
    const max = input.max === "" ? 100 : Number(input.max);
    const progress =
      max > min ? ((input.valueAsNumber - min) / (max - min)) * 100 : 0;
    input.style.setProperty(
      "--ff-range-progress",
      `${Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0}%`,
    );
    const output = input.closest(".ff-range")?.querySelector("output");
    if (output) {
      output.textContent = input.value;
      output.hidden = false;
    }
  }

  reload = () => {
    this.freeform.form
      .querySelectorAll<HTMLInputElement>("input[data-freeform-range]")
      .forEach((input) => {
        this.update(input);
      });
  };
}
