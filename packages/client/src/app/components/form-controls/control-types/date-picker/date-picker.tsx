import React from 'react';
import DatePicker from 'react-datepicker';
import type { DateTimeProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import format from 'date-fns/format';
import parse from 'date-fns/parse';

import { Control } from '../../control';
import type { ControlType } from '../../types';

import 'react-datepicker/dist/react-datepicker.css';

const dateFormat = 'MM/dd/yyyy';

const DatePickerControl: React.FC<ControlType<DateTimeProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const date = new Date();
  const parseValue: string = value || format(date, dateFormat);
  const selected = parse(parseValue, dateFormat, date);

  return (
    <Control property={property} errors={errors}>
      <DatePicker
        id={property.handle}
        minDate={date}
        selected={selected}
        dateFormat={dateFormat}
        className={classes('text', 'fullwidth')}
        onChange={(date: Date) => updateValue(format(date, dateFormat))}
      />
    </Control>
  );
};

export default DatePickerControl;
