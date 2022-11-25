import React from 'react';
import DatePicker from 'react-datepicker';
import format from 'date-fns/format';
import parse from 'date-fns/parse';

import type { ControlProps } from '../control';
import { Control } from '../control';

import 'react-datepicker/dist/react-datepicker.css';

const dateFormat = 'MM/dd/yyyy';

export const DateTime: React.FC<ControlProps<string>> = ({
  id,
  value,
  label,
  onChange: callback,
  instructions,
}) => {
  const date = new Date();

  const parseValue: string = value || format(date, dateFormat);

  const selected = parse(parseValue, dateFormat, date);

  return (
    <Control id={id} label={label} instructions={instructions}>
      <DatePicker
        id={id}
        minDate={date}
        selected={selected}
        dateFormat={dateFormat}
        className="text fullwidth"
        onChange={(date: Date) =>
          callback && callback(format(date, dateFormat))
        }
      />
    </Control>
  );
};
