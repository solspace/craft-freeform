import config from "@config/freeform/freeform.config";
import type { DateTimeProperty } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import { loadLocale } from "@ff-client/utils/locales";
import translate from "@ff-client/utils/translations";
import type { Locale } from "date-fns";
import { format as formatDate, formatISO, isValid, parseISO } from "date-fns";
import type React from "react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { Control } from "../../control";
import type { ControlType } from "../../types";
import {
  DatePickerWrapper,
  DateTimeRow,
  TimeInput,
  TimezoneNote,
} from "./date-picker.styles";

import "react-datepicker/dist/react-datepicker.css";

const ISO_FORMAT = "yyyy-MM-dd";

const {
  metadata: {
    craft: { locale: CraftLocale },
  },
} = config;

const DatePickerControl: React.FC<ControlType<DateTimeProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  const {
    dateFormat,
    minDate,
    maxDate,
    includeTime,
    defaultTime = "00:00",
  } = property;

  const format = dateFormat || (includeTime ? "P" : ISO_FORMAT);
  const min: Date | undefined = minDate ? parseISO(minDate) : undefined;
  const max: Date | undefined = maxDate ? parseISO(maxDate) : undefined;

  const parsedDate = value ? parseISO(value) : undefined;
  const selectedDate =
    parsedDate && isValid(parsedDate) ? parsedDate : undefined;

  const [locale, setLocale] = useState<Locale>(undefined);

  useEffect(() => {
    loadLocale(CraftLocale)
      .then(setLocale)
      .catch(() => setLocale(undefined));
  }, []);

  return (
    <Control property={property} errors={errors} context={context}>
      <DatePickerWrapper>
        <DateTimeRow $includeTime={includeTime}>
          <DatePicker
            locale={locale}
            id={property.handle}
            minDate={min}
            maxDate={max}
            disabled={property.disabled}
            selected={selectedDate}
            dateFormat={format}
            showIcon={includeTime}
            toggleCalendarOnIconClick={includeTime}
            placeholderText={
              includeTime ? translate("Choose a date") : undefined
            }
            isClearable={includeTime && Boolean(selectedDate)}
            className={classes("text", "fullwidth")}
            onChange={(date: Date | null) => {
              if (date && includeTime) {
                const [hours, minutes] = defaultTime.split(":").map(Number);
                date.setHours(
                  selectedDate?.getHours() ?? hours,
                  selectedDate?.getMinutes() ?? minutes,
                  selectedDate?.getSeconds() ?? 0,
                  0,
                );
              }
              updateValue(date ? formatISO(date) : null);
            }}
          />
          {includeTime && (
            <TimeInput>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 7v5l3 2" />
              </svg>
              <input
                type="time"
                className="text"
                aria-label={`${translate(property.label || "Date")} — ${translate("Time")}`}
                disabled={!selectedDate || property.disabled}
                value={selectedDate ? formatDate(selectedDate, "HH:mm") : ""}
                onChange={(event) => {
                  if (!selectedDate || !event.target.value) return;
                  const [hours, minutes] = event.target.value
                    .split(":")
                    .map(Number);
                  const date = new Date(selectedDate);
                  date.setHours(hours, minutes, 0, 0);
                  updateValue(formatISO(date));
                }}
              />
            </TimeInput>
          )}
        </DateTimeRow>
        {includeTime && (
          <TimezoneNote>
            {translate("Timezone")}:{" "}
            {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </TimezoneNote>
        )}
      </DatePickerWrapper>
    </Control>
  );
};

export default DatePickerControl;
