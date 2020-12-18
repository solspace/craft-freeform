import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import * as FieldTypes from '../../constants/FieldTypes';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class Datetime extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.string,
      initialValue: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      dateTimeType: PropTypes.string.isRequired,
      generatePlaceholder: PropTypes.bool.isRequired,
      dateOrder: PropTypes.string.isRequired,
      date4DigitYear: PropTypes.bool.isRequired,
      dateLeadingZero: PropTypes.bool.isRequired,
      dateSeparator: PropTypes.string.isRequired,
      clock24h: PropTypes.bool.isRequired,
      clockSeparator: PropTypes.string.isRequired,
      clockAMPMSeparate: PropTypes.bool,
      useDatepicker: PropTypes.bool,
      minDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      maxDate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
  };

  render() {
    const { properties } = this.context;

    const { label, initialValue, handle, placeholder, required, instructions } = properties;
    const { dateTimeType, generatePlaceholder, useDatepicker } = properties;
    const { dateOrder, date4DigitYear, dateLeadingZero, dateSeparator } = properties;
    const { clock24h, clockSeparator, clockAMPMSeparate } = properties;
    const { minDate, maxDate } = properties;

    const showDate = dateTimeType === FieldTypes.DATE_TIME_TYPE_BOTH || dateTimeType === FieldTypes.DATE_TIME_TYPE_DATE;
    const showTime = dateTimeType === FieldTypes.DATE_TIME_TYPE_BOTH || dateTimeType === FieldTypes.DATE_TIME_TYPE_TIME;

    return (
      <div>
        <TextProperty
          label="Handle"
          instructions="How you’ll refer to this field in the templates."
          name="handle"
          value={handle}
          onChangeHandler={this.updateHandle}
        />

        <TextProperty
          label="Label"
          instructions="Field label used to describe the field."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="This field is required?"
          name="required"
          checked={required}
          onChangeHandler={this.update}
        />

        <hr />

        <TextareaProperty
          label="Instructions"
          instructions="Field specific user instructions."
          name="instructions"
          value={instructions}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Default Value"
          instructions="You can use 'now', 'today', '5 days ago', '2017-01-01 20:00:00', etc, which will format the default value according to the chosen format."
          name="initialValue"
          value={initialValue ? initialValue : ''}
          onChangeHandler={this.update}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        <SelectProperty
          label="Type"
          instructions="Choose between using date, time or both."
          name="dateTimeType"
          value={dateTimeType}
          options={[
            { key: FieldTypes.DATE_TIME_TYPE_BOTH, value: translate('Both') },
            { key: FieldTypes.DATE_TIME_TYPE_DATE, value: translate('Date') },
            { key: FieldTypes.DATE_TIME_TYPE_TIME, value: translate('Time') },
          ]}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="Use the Freeform datepicker for this field?"
          name="useDatepicker"
          checked={useDatepicker}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="Generate placeholder from your date format settings?"
          name="generatePlaceholder"
          checked={generatePlaceholder}
          onChangeHandler={this.update}
        />

        {!generatePlaceholder && (
          <TextProperty
            label="Placeholder"
            instructions="The text that will be shown if the field doesn’t have a value."
            name="placeholder"
            value={placeholder}
            onChangeHandler={this.update}
          />
        )}

        {showDate && (
          <div>
            <SelectProperty
              label="Date Order"
              instructions="Choose the order in which to show day, month and year."
              name="dateOrder"
              value={dateOrder}
              onChangeHandler={this.update}
              options={[
                { key: 'ymd', value: translate('year month day') },
                { key: 'mdy', value: translate('month day year') },
                { key: 'dmy', value: translate('day month year') },
              ]}
            />

            <CheckboxProperty
              label="Four digit year?"
              name="date4DigitYear"
              checked={date4DigitYear}
              onChangeHandler={this.update}
            />

            <CheckboxProperty
              label="Date leading zero"
              instructions="If enabled, a leading zero will be used for days and months."
              name="dateLeadingZero"
              checked={dateLeadingZero}
              onChangeHandler={this.update}
            />

            <SelectProperty
              label="Date Separator"
              instructions="Used to separate date values."
              name="dateSeparator"
              value={dateSeparator}
              onChangeHandler={this.update}
              emptyOption="None"
              options={[
                { key: ' ', value: 'Space' },
                { key: '/', value: '/' },
                { key: '-', value: '-' },
                { key: '.', value: '.' },
              ]}
            />
            <TextProperty
              label="Min Date"
              instructions="Specify a relative textual date string or static date for the earliest date available for date picker and field validation."
              name="minDate"
              value={minDate}
              onChangeHandler={this.update}
            />

            <TextProperty
              label="Max Date"
              instructions="Specify a relative textual date string or static date for the latest date available for date picker and field validation."
              name="maxDate"
              value={maxDate}
              onChangeHandler={this.update}
            />
          </div>
        )}

        {showTime && (
          <div>
            <CheckboxProperty label="24h Clock?" name="clock24h" checked={clock24h} onChangeHandler={this.update} />

            <SelectProperty
              label="Clock Separator"
              instructions="Used to separate hours and minutes."
              name="clockSeparator"
              value={clockSeparator}
              onChangeHandler={this.update}
              emptyOption="None"
              options={[
                { key: ' ', value: 'Space' },
                { key: ':', value: ':' },
                { key: '-', value: '-' },
                { key: '.', value: '.' },
              ]}
            />

            {!clock24h && (
              <CheckboxProperty
                label="Separate AM/PM with a space?"
                name="clockAMPMSeparate"
                checked={!!clockAMPMSeparate}
                onChangeHandler={this.update}
              />
            )}
          </div>
        )}

        <AttributeEditorProperty />
      </div>
    );
  }
}
