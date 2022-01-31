import React from 'react';
import BasePropertyItem from './BasePropertyItem';
import DatePicker from 'react-datepicker';
import { format, parseISO } from 'date-fns';

import 'react-datepicker/dist/react-datepicker.css';

const dateFormat = 'yyyy-MM-dd';

export default class DatePickerProperty extends BasePropertyItem {
  renderInput() {
    const { name, readOnly, disabled, onChangeHandler, value, placeholder } = this.props;

    const valueAsDate = value ? parseISO(value, dateFormat) : null;

    return (
      <DatePicker
        name={name}
        selected={valueAsDate}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(date) => onChangeHandler(name, date ? format(date, dateFormat) : null)}
        placeholder={placeholder ? this.translate(placeholder) : ''}
      />
    );
  }
}
