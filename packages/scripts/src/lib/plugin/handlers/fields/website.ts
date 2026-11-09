import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";
import { mountWebsite } from "../../../../../../frontend/core/src/website/website";

export default class WebsiteHandler implements FreeformHandler {
  private controls = new Map<
    HTMLInputElement,
    ReturnType<typeof mountWebsite>
  >();

  constructor(private freeform: Freeform) {
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
      .querySelectorAll<HTMLInputElement>("input[data-freeform-website]")
      .forEach((input) => {
        if (!this.controls.has(input)) {
          this.controls.set(input, mountWebsite(input));
        }
      });
  };
}
