import React from 'react';
import DatePicker from 'react-datepicker';
import { modifySettings } from '@editor/store/slices/form';
import type { DateTimeProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import format from 'date-fns/format';
import parse from 'date-fns/parse';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

import 'react-datepicker/dist/react-datepicker.css';

const dateFormat = 'MM/dd/yyyy';

const DatePickerControl: React.FC<
  FormControlType<string, DateTimeProperty>
> = ({ value, property, namespace, dispatch }) => {
  const date = new Date();
  const parseValue: string = value || format(date, dateFormat);
  const selected = parse(parseValue, dateFormat, date);

  return (
    <BaseControl property={property}>
      <DatePicker
        id={property.handle}
        minDate={date}
        selected={selected}
        dateFormat={dateFormat}
        className={classes('text', 'fullwidth')}
        onChange={(date: Date) =>
          dispatch(
            modifySettings({
              key: property.handle,
              namespace,
              value: format(date, dateFormat),
            })
          )
        }
      />
    </BaseControl>
  );
};

export default DatePickerControl;
