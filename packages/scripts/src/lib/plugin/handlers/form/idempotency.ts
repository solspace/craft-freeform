import type Freeform from "@components/front-end/plugin/freeform";
import { generateRandomString } from "@lib/plugin/helpers/security";
import type { FreeformHandler } from "types/form";

class IdempotencyHandler implements FreeformHandler {
  freeform;
  form;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    this.reload();
  }

  reload = () => {
    if (!this.form.hasAttribute("data-idempotency")) {
      return;
    }

    const idempotencyInput = document.createElement("input");
    idempotencyInput.type = "hidden";
    idempotencyInput.name = "idempotencyKey";
    idempotencyInput.value = generateRandomString([6, 20, 20]);

    this.form.appendChild(idempotencyInput);
  };
}

export default IdempotencyHandler;
