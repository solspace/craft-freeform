import type Freeform from "@components/front-end/plugin/freeform";
import { createLink, createScript } from "@lib/plugin/helpers/html";
import {
  getFlatpickr,
  hasFlatpickr,
  hasFlatpickrInstance,
} from "@lib/vendors/flatpickr";
import type { FreeformHandler } from "types/form";

class DatePicker implements FreeformHandler {
  static flatpickrLoading = false;

  static loadedLocales: Record<string, HTMLScriptElement> = {};

  freeform: Freeform;

  loadedLocales = DatePicker.loadedLocales;

  constructor(freeform: Freeform) {
    this.freeform = freeform;

    if (!this.freeform.has("data-scripts-datepicker")) {
      return;
    }

    // CSS can be added anytime
    createLink(
      "//cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css",
    );

    // If flatpickr is already on the page (after a re-render), bind now
    if (hasFlatpickr()) {
      this.reload();

      return;
    }

    // If another DatePicker instance already kicked off loading, just wait for it
    if (DatePicker.flatpickrLoading) {
      this.waitForFlatpickrThenReload();

      return;
    }

    DatePicker.flatpickrLoading = true;

    createScript(
      "//cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js",
      {
        onLoad: () => {
          DatePicker.flatpickrLoading = false;

          this.reload();
        },
      },
    );

    this.waitForFlatpickrThenReload();
  }

  waitForFlatpickrThenReload = (retries = 40, interval = 50) => {
    if (hasFlatpickr()) {
      this.reload();

      return;
    }

    if (retries <= 0) {
      return;
    }

    setTimeout(
      () => this.waitForFlatpickrThenReload(retries - 1, interval),
      interval,
    );
  };

  reload = () => {
    if (!this.freeform.has("data-scripts-datepicker")) {
      return;
    }

    const flatpickr = getFlatpickr();
    if (!flatpickr) {
      return;
    }

    const pickers = this.freeform.form.querySelectorAll(
      "*[data-datepicker][data-datepicker-enabled]",
    );
    pickers.forEach((picker) => {
      const enabledAttribute = picker.getAttribute("data-datepicker-enabled");
      if (enabledAttribute === "0" || enabledAttribute === "false") {
        return;
      }

      // Already bound (after multiple freeform-ready runs)
      if (hasFlatpickrInstance(picker)) {
        return;
      }

      const locale = picker.getAttribute("data-datepicker-locale") || "default";
      const options = {
        disableMobile: true,
        allowInput: true,
        dateFormat: picker.getAttribute("data-datepicker-format"),
        enableTime: picker.getAttribute("data-datepicker-enabletime") !== null,
        noCalendar: picker.getAttribute("data-datepicker-enabledate") === null,
        time_24hr: picker.getAttribute("data-datepicker-clock_24h") !== null,
        minDate: picker.getAttribute("data-datepicker-min-date"),
        maxDate: picker.getAttribute("data-datepicker-max-date"),
        minuteIncrement: 1,
        hourIncrement: 1,
        static: picker.getAttribute("data-datepicker-static") !== null,
      };

      const optionsEvent = this.freeform._dispatchEvent(
        "flatpickr-before-init",
        { detail: options, options },
      );
      const assembledOptions = {
        ...optionsEvent.detail,
        ...optionsEvent.options,
      };

      const instance = flatpickr(picker, assembledOptions);
      picker.setAttribute("autocomplete", "off");

      this.freeform._dispatchEvent("flatpickr-ready", {
        detail: instance,
        flatpickr: instance,
      });

      if (!this.loadedLocales[locale]) {
        createScript(
          `//cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/l10n/${locale}.js`,
          {
            onLoad: (script) => {
              instance.set("locale", locale);
              script.dataset.loaded = "true";
              this.loadedLocales[locale] = script;
            },
          },
        );
      } else {
        this.loadedLocales[locale].addEventListener("load", () => {
          instance.set("locale", locale);
          this.loadedLocales[locale].dataset.loaded = "true";
        });

        if (this.loadedLocales[locale].dataset.loaded === "true") {
          instance.set("locale", locale);
        }
      }
    });
  };
}

export default DatePicker;
