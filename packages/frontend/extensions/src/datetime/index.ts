import type {
  FieldMountContext,
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { mountDateTimePicker, parseDateTime } from "@solspace/freeform-core";
import { loadScriptOnce } from "../captchas/shared.js";
import { PACKAGE_VERSION } from "../version.js";

type DatetimeConfig = {
  picker?: "freeform" | "flatpickr" | "browser" | "none";
  minuteStep?: number;
  labels?: NonNullable<Parameters<typeof mountDateTimePicker>[1]>["labels"];
  dateTimeType?: string;
  useNativeTypes?: boolean;
  useDatepicker?: boolean;
  locale?: string | null;
  format?: string;
  datepickerFormat?: string;
  nativeInputType?: string;
  clock24h?: boolean;
  pickerMinDate?: string | null;
  pickerMaxDate?: string | null;
  minDate?: string | null;
  maxDate?: string | null;
  referenceDate?: string | null;
  referenceTimestamp?: number | null;
  minDateOffset?: number | null;
  maxDateOffset?: number | null;
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
    version: PACKAGE_VERSION,

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

      if (
        config.picker === "browser" ||
        (!config.picker && config.useNativeTypes)
      ) {
        input.type = config.nativeInputType || "datetime-local";
        if (config.minDate) {
          input.min = config.minDate;
        }
        if (config.maxDate) {
          input.max = config.maxDate;
        }
        return;
      }

      if (config.picker === "freeform") {
        const controller = mountDateTimePicker(
          input,
          {
            format: config.format,
            locale: config.locale,
            enableDate:
              config.enableDate !== false && config.dateTimeType !== "time",
            enableTime:
              config.enableTime !== false && config.dateTimeType !== "date",
            clock24h: config.clock24h,
            minDate: config.pickerMinDate ?? config.minDate,
            maxDate: config.pickerMaxDate ?? config.maxDate,
            referenceDate: config.referenceDate,
            referenceTimestamp: config.referenceTimestamp,
            minDateOffset: config.minDateOffset,
            maxDateOffset: config.maxDateOffset,
            minuteStep: config.minuteStep,
            labels: config.labels,
          },
          setValue,
        );
        return () => controller.destroy();
      }
      if (
        config.picker === "none" ||
        (!config.picker && !config.useDatepicker)
      ) {
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
        minDate: config.minDate
          ? parseDateTime(config.minDate, "Y-m-d\\TH:i:s") ||
            parseDateTime(config.minDate, "Y-m-d") ||
            config.minDate
          : undefined,
        maxDate: config.maxDate
          ? parseDateTime(config.maxDate, "Y-m-d\\TH:i:s") ||
            parseDateTime(config.maxDate, "Y-m-d") ||
            config.maxDate
          : undefined,
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
