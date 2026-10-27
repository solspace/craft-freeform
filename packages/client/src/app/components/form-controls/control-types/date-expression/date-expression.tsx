import { Control } from "@components/form-controls/control";
import type { ControlType } from "@components/form-controls/types";
import config from "@config/freeform/freeform.config";
import { useEventCallback } from "@ff-client/hooks/ts-hooks/use-event-callback";
import type { DateExpressionProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import { useEffect, useRef } from "react";
import { mountDateTimePicker } from "../../../../../../../frontend/core/src/datetime/picker";
import {
  CalendarButton,
  DateExpressionWrapper,
} from "./date-expression.styles";
import "../../../../../../../frontend/core/src/datetime/picker.css";

const DateExpressionControl: React.FC<ControlType<DateExpressionProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const controller = useRef<ReturnType<typeof mountDateTimePicker>>(null);
  const update = useEventCallback(updateValue);
  const includeTime = property.includeTime ?? false;
  const readOnly =
    property.flags?.includes("readonly") ||
    property.flags?.includes("as-readonly-in-instance");

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    controller.current = mountDateTimePicker(
      input,
      {
        appearance: "control-panel",
        format: includeTime ? "Y-m-d H:i:s" : "Y-m-d",
        enableTime: includeTime,
        clock24h: true,
        openOnFocus: false,
        locale: config.metadata.craft.locale,
        labels: {
          previous: translate("Previous month"),
          next: translate("Next month"),
          month: translate("Month"),
          year: translate("Year"),
          searchMonths: translate("Search months…"),
          searchYears: translate("Search years…"),
          time: translate("Time"),
          today: translate("Today"),
          clear: translate("Clear"),
          noResults: translate("No matches found."),
          chooseDate: translate("Choose date and time"),
        },
      },
      update,
    );
    return () => {
      controller.current?.destroy();
      controller.current = null;
    };
  }, [includeTime, update]);

  useEffect(() => {
    controller.current?.update(value ?? "");
  }, [value]);

  return (
    <Control property={property} errors={errors} context={context}>
      <DateExpressionWrapper>
        <input
          ref={inputRef}
          id={property.handle}
          type="text"
          className="text fullwidth"
          data-1p-ignore
          disabled={property.disabled}
          readOnly={readOnly}
          value={value ?? ""}
          placeholder={property.placeholder}
          onChange={(event) => updateValue(event.target.value)}
        />
        <CalendarButton
          type="button"
          aria-label={`${translate("Choose a date")}: ${translate(property.label || "Date")}`}
          disabled={property.disabled || readOnly}
          onClick={() => {
            controller.current?.open();
            controller.current?.focus();
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" />
          </svg>
        </CalendarButton>
      </DateExpressionWrapper>
    </Control>
  );
};

export default DateExpressionControl;
