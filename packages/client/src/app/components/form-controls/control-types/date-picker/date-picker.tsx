import config from "@config/freeform/freeform.config";
import type { DateTimeProperty } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import { loadLocale } from "@ff-client/utils/locales";
import type { Locale } from "date-fns";
import { formatISO, parseISO } from "date-fns";
import type React from "react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

import { Control } from "../../control";
import type { ControlType } from "../../types";

import { DatePickerWrapper } from "./date-picker.styles";

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
}) => {
  const { dateFormat, minDate, maxDate } = property;

  const format = dateFormat || ISO_FORMAT;
  const min: Date | undefined = minDate ? parseISO(minDate) : undefined;
  const max: Date | undefined = maxDate ? parseISO(maxDate) : undefined;

  const selectedDate = value ? parseISO(value) : undefined;

  const [locale, setLocale] = useState<Locale>(undefined);

  useEffect(() => {
    loadLocale(CraftLocale)
      .then(setLocale)
      .catch(() => setLocale(undefined));
  }, []);

  return (
    <Control property={property} errors={errors}>
      <DatePickerWrapper>
        <DatePicker
          locale={locale}
          id={property.handle}
          minDate={min}
          maxDate={max}
          selected={selectedDate}
          dateFormat={format}
          className={classes("text", "fullwidth")}
          onChange={(date?: Date) => updateValue(date ? formatISO(date) : null)}
        />
      </DatePickerWrapper>
    </Control>
  );
};

export default DatePickerControl;
