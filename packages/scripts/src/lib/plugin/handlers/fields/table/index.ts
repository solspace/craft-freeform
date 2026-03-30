import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";

import { registerAddButton } from "./button.add";
import { registerRemoveButtons } from "./button.remove";
import { attachValidatorRequired } from "./validate.required";

class Table implements FreeformHandler {
  freeform: Freeform;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    this.reload();
  }

  reload = () => {
    registerAddButton(this.freeform);
    registerRemoveButtons(this.freeform);
    attachValidatorRequired(this.freeform);
  };
}

export default Table;
