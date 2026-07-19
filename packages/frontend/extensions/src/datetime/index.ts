import type {
  FieldMountContext,
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { loadScriptOnce } from "../captchas/shared.js";

type DatetimeConfig = {
  dateTimeType?: string;
  useNativeTypes?: boolean;
  useDatepicker?: boolean;
  locale?: string | null;
  format?: string;
  datepickerFormat?: string;
  nativeInputType?: string;
  clock24h?: boolean;
  minDate?: string | null;
  maxDate?: string | null;
  enableTime?: boolean;
  enableDate?: boolean;
};

type FlatpickrInstance = {
  destroy: () => void;
  setDate: (date: string | Date, triggerChange?: boolean) => void;
};

type FlatpickrFn = (
  element: HTMLElement,
  options: Record<string, unknown>,
) => FlatpickrInstance;

declare global {
  interface Window {
    flatpickr?: FlatpickrFn;
  }
}

function getConfig(field: ManifestFieldDefinition): DatetimeConfig {
  return (field.frontend?.config ?? {}) as DatetimeConfig;
}

function supportsDatetime(field: ManifestFieldDefinition): boolean {
  return (
    field.type === "datetime" ||
    field.frontend?.extension === "datetime" ||
    field.frontend?.renderer === "datetime"
  );
}

async function ensureFlatpickr(locale?: string | null): Promise<FlatpickrFn> {
  if (!document.getElementById("ff-flatpickr-css")) {
    const link = document.createElement("link");
    link.id = "ff-flatpickr-css";
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css";
    document.head.appendChild(link);
  }

  await loadScriptOnce(
    "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js",
    "ff-flatpickr-script",
  );

  if (locale && locale !== "default" && locale !== "en") {
    await loadScriptOnce(
      `https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/l10n/${locale}.js`,
      `ff-flatpickr-locale-${locale}`,
    ).catch(() => undefined);
  }

  if (!window.flatpickr) {
    throw new Error("Flatpickr failed to initialize.");
  }

  return window.flatpickr;
}

export function createDatetimeExtension(): FreeformExtension {
  return {
    name: "datetime",
    version: "0.1.0-beta.1",

    supports: supportsDatetime,

    async mount(context: FieldMountContext) {
      const { field, element, setValue, value } = context;
      if (!supportsDatetime(field)) {
        return;
      }

      const config = getConfig(field);
      const input = element.querySelector("input");
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      if (config.useNativeTypes) {
        input.type = config.nativeInputType || "datetime-local";
        if (config.minDate) {
          input.min = config.minDate;
        }
        if (config.maxDate) {
          input.max = config.maxDate;
        }
        return;
      }

      if (!config.useDatepicker) {
        return;
      }

      const flatpickr = await ensureFlatpickr(config.locale);
      const locale =
        config.locale && config.locale !== "default" && config.locale !== "en"
          ? config.locale
          : undefined;
      const instance = flatpickr(input, {
        allowInput: true,
        disableMobile: true,
        dateFormat: config.datepickerFormat || config.format || "Y-m-d H:i",
        enableTime:
          config.enableTime !== false && config.dateTimeType !== "date",
        noCalendar:
          config.enableDate === false || config.dateTimeType === "time",
        time_24hr: Boolean(config.clock24h),
        minDate: config.minDate || undefined,
        maxDate: config.maxDate || undefined,
        ...(locale ? { locale } : {}),
        defaultDate: typeof value === "string" && value ? value : undefined,
        onChange: (_selected: Date[], dateStr: string) => {
          setValue(dateStr);
        },
      });

      return () => {
        instance.destroy();
      };
    },
  };
}

export const datetimeExtension = createDatetimeExtension();
