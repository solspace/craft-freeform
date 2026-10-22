import type Freeform from "@components/front-end/plugin/freeform";
import { createLink, createScript } from "@lib/plugin/helpers/html";
import {
  getFlatpickr,
  hasFlatpickr,
  hasFlatpickrInstance,
} from "@lib/vendors/flatpickr";
import type { FreeformHandler } from "types/form";
import { applyDatepickerTheme } from "./datepicker.theme";

class DatePicker implements FreeformHandler {
  static flatpickrLoading = false;

  static loadedLocales: Record<string, HTMLScriptElement> = {};

  freeform: Freeform;

  loadedLocales = DatePicker.loadedLocales;

  constructor(freeform: Freeform) {
    this.freeform = freeform;

    this.reload();
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

    const pickers = Array.from(
      this.freeform.form.querySelectorAll(
        "*[data-datepicker][data-datepicker-enabled]",
      ),
    ).filter((picker) => {
      const enabled = picker.getAttribute("data-datepicker-enabled");
      return enabled !== "0" && enabled !== "false";
    });
    // The form-level flag covers all pages. Load assets only when this page
    // actually has a picker, including when fields arrive after an AJAX reload.
    if (!pickers.length) return;

    createLink(
      "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css",
    );
    const flatpickr = getFlatpickr();
    if (!flatpickr) {
      if (!DatePicker.flatpickrLoading) {
        DatePicker.flatpickrLoading = true;
        createScript(
          "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js",
          {
            onLoad: () => {
              DatePicker.flatpickrLoading = false;
              this.reload();
            },
          },
        );
      }
      this.waitForFlatpickrThenReload();
      return;
    }

    pickers.forEach((picker) => {
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
      applyDatepickerTheme(picker, instance);
      // Recheck when opened so custom templates can switch themes at runtime.
      // Append to the existing hooks without replacing integrators' callbacks.
      instance.config?.onOpen?.push(() =>
        applyDatepickerTheme(picker, instance),
      );
      picker.setAttribute("autocomplete", "off");

      this.freeform._dispatchEvent("flatpickr-ready", {
        detail: instance,
        flatpickr: instance,
      });

      // English/default strings are included in Flatpickr itself.
      if (locale === "default" || locale === "en") {
        return;
      }

      if (!this.loadedLocales[locale]) {
        createScript(
          `https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/l10n/${locale}.js`,
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
