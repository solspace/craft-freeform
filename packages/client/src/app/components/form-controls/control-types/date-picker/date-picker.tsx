import React from 'react';
import DatePicker from 'react-datepicker';
import type { DateTimeProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import { faCalendar } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatISO, parseISO } from 'date-fns';

import { Control } from '../../control';
import type { ControlType } from '../../types';

import { DatePickerWrapper, Icon } from './date-picker.styles';

import 'react-datepicker/dist/react-datepicker.css';

const ISO_FORMAT = 'yyyy-MM-dd';

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

  return (
    <Control property={property} errors={errors}>
      <DatePickerWrapper>
        <Icon>
          <FontAwesomeIcon icon={faCalendar} />
        </Icon>
        <DatePicker
          id={property.handle}
          minDate={min}
          maxDate={max}
          selected={selectedDate}
          dateFormat={format}
          className={classes('text', 'fullwidth')}
          onChange={(date?: Date) => updateValue(date ? formatISO(date) : null)}
        />
      </DatePickerWrapper>
    </Control>
  );
};

export default DatePickerControl;
