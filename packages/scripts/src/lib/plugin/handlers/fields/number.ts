import type Freeform from "@components/front-end/plugin/freeform";
import events from "@lib/plugin/constants/event-types";
import type { FreeformHandler } from "types/form";
import { mountNumber } from "../../../../../../frontend/core/src/number/number";

export default class NumberHandler implements FreeformHandler {
  private controls = new Map<
    HTMLInputElement,
    ReturnType<typeof mountNumber>
  >();

  constructor(private freeform: Freeform) {
    // Server-rendered errors replace local feedback after an AJAX response.
    freeform.form.addEventListener(events.form.removeMessages, () =>
      this.controls.forEach((control) => {
        control.clear();
      }),
    );
    freeform.form.addEventListener(events.rules.applied, () => {
      for (const [input, control] of this.controls) {
        if (
          input.matches(":disabled") ||
          input.closest("[data-hidden], [hidden]")
        )
          control.clear();
      }
    });
    this.reload();
  }

  reload = () => {
    for (const [input, control] of this.controls) {
      if (!this.freeform.form.contains(input)) {
        control.destroy();
        this.controls.delete(input);
      }
    }
    this.freeform.form
      .querySelectorAll<HTMLInputElement>("input[data-freeform-number]")
      .forEach((input) => {
        if (!this.controls.has(input)) {
          this.controls.set(
            input,
            mountNumber(input, JSON.parse(input.dataset.freeformNumber!)),
          );
        }
      });
  };
}
