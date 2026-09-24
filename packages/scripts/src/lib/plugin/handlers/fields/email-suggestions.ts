import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";
import { mountEmailSuggestions } from "../../../../../../frontend/core/src/email/suggestions";

export default class EmailSuggestionsHandler implements FreeformHandler {
  private controls = new Map<
    HTMLInputElement,
    ReturnType<typeof mountEmailSuggestions>
  >();
  constructor(private freeform: Freeform) {
    this.reload();
  }
  reload = () => {
    for (const [input, control] of this.controls) {
      if (!this.freeform.form.contains(input)) {
        control.destroy();
        this.controls.delete(input);
      } else control.clear();
    }
    this.freeform.form
      .querySelectorAll<HTMLInputElement>(
        "input[data-freeform-email-suggestions]",
      )
      .forEach((input) => {
        if (this.controls.has(input)) return;
        this.controls.set(
          input,
          mountEmailSuggestions(input, {
            message: input.dataset.emailSuggestionMessage,
            action: input.dataset.emailSuggestionAction,
          }),
        );
      });
  };
}
