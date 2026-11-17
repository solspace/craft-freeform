import type {
  FieldMountContext,
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { mountDateTimePicker } from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../version.js";

type DatetimeConfig = {
  picker?: "freeform" | "browser" | "none";
  minuteStep?: number;
  labels?: NonNullable<Parameters<typeof mountDateTimePicker>[1]>["labels"];
  dateTimeType?: string;
  useNativeTypes?: boolean;
  useDatepicker?: boolean;
  locale?: string | null;
  format?: string;
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

export function createDatetimeExtension(): FreeformExtension {
  return {
    name: "datetime",
    version: PACKAGE_VERSION,

    supports: supportsDatetime,

    async mount(context: FieldMountContext) {
      const { field, element, setValue } = context;
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

      if (
        config.picker === "none" ||
        (!config.picker && config.useDatepicker === false)
      ) {
        return;
      }

      {
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
    },
  };
}

export const datetimeExtension = createDatetimeExtension();
