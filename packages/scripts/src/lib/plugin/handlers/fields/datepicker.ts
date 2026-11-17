import type Freeform from "@components/front-end/plugin/freeform";
import type { FreeformHandler } from "types/form";
import { mountDateTimePicker } from "../../../../../../frontend/core/src/datetime/picker";

class DatePicker implements FreeformHandler {
  constructor(public freeform: Freeform) {
    this.reload();
  }

  reload = () => {
    if (!this.freeform.has("data-scripts-datepicker")) {
      return;
    }

    this.freeform.form
      .querySelectorAll<HTMLInputElement>(
        'input[data-datepicker-kind="freeform"][data-datepicker-enabled]:not([data-datepicker-enabled="0"]):not([data-datepicker-enabled="false"])',
      )
      .forEach((input) => {
        mountDateTimePicker(input, {
          format: input.dataset.datepickerPhpFormat,
          locale: input.dataset.datepickerLanguage,
          enableDate: input.hasAttribute("data-datepicker-enabledate"),
          enableTime: input.hasAttribute("data-datepicker-enabletime"),
          clock24h: input.hasAttribute("data-datepicker-clock_24h"),
          minuteStep: Number(input.dataset.datepickerMinuteStep || 30),
          minDate: input.dataset.datepickerMinValue,
          maxDate: input.dataset.datepickerMaxValue,
          referenceDate: input.dataset.datepickerReferenceDate,
          referenceTimestamp:
            !input.dataset.datepickerReferenceTimestamp?.trim()
              ? undefined
              : Number(input.dataset.datepickerReferenceTimestamp),
          minDateOffset: !input.dataset.datepickerMinOffset?.trim()
            ? undefined
            : Number(input.dataset.datepickerMinOffset),
          maxDateOffset: !input.dataset.datepickerMaxOffset?.trim()
            ? undefined
            : Number(input.dataset.datepickerMaxOffset),
          labels: JSON.parse(input.dataset.datepickerLabels || "{}"),
        });
      });
  };
}

export default DatePicker;
