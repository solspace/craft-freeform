import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";
import { SearchableSelect } from "../../../../../../frontend/core/src/select/searchable-select";

export default class SearchableSelectHandler implements FreeformHandler {
  private controls = new Map<HTMLSelectElement, SearchableSelect>();
  constructor(private freeform: Freeform) {
    this.reload();
  }
  reload = () => {
    for (const [select, control] of this.controls) {
      if (!this.freeform.form.contains(select)) {
        control.destroy();
        this.controls.delete(select);
      }
    }
    this.freeform.form
      .querySelectorAll<HTMLSelectElement>("select[data-freeform-searchable]")
      .forEach((select) => {
        if (this.controls.has(select)) {
          this.controls.get(select)?.sync();
          return;
        }
        try {
          const config = JSON.parse(select.dataset.freeformSearchable || "{}");
          if (config.enabled !== false)
            this.controls.set(select, new SearchableSelect(select, config));
        } catch {
          // Invalid custom configuration leaves the native select usable.
        }
      });
  };
}
