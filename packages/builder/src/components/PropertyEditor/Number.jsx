import { translate } from '@ff/builder/app';
import PropTypes from 'prop-types';
import React from 'react';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import CustomProperty from './PropertyItems/CustomProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class Number extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.string,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      minLength: PropTypes.number,
      maxLength: PropTypes.number,
      minValue: PropTypes.number,
      maxValue: PropTypes.number,
      decimalCount: PropTypes.number,
      allowNegative: PropTypes.bool.isRequired,
      step: PropTypes.number,
    }).isRequired,
  };

  render() {
    const {
      properties: { label, value, handle, placeholder, required, instructions },
    } = this.context;
    const {
      properties: { minLength, maxLength, minValue, maxValue, step },
    } = this.context;
    const {
      properties: { decimalCount, allowNegative },
    } = this.context;

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
          instructions="If present, this will be the value pre-populated when the form is rendered."
          name="value"
          value={value}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Placeholder"
          instructions="The text that will be shown if the field doesn’t have a value."
          name="placeholder"
          value={placeholder}
          onChangeHandler={this.update}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        <CheckboxProperty
          label="Allow negative numbers?"
          name="allowNegative"
          checked={allowNegative}
          onChangeHandler={this.update}
        />

        <CustomProperty
          label="Min/Max Values"
          instructions="The minimum and/or maximum numeric value this field is allowed to have (optional)."
        >
          <div className="composer-property-input composer-property-flex">
            <input
              name="minValue"
              value={minValue ? minValue : ''}
              placeholder="Min"
              className=""
              onChange={this.update}
              data-is-numeric={true}
            />
            <input
              name="maxValue"
              value={maxValue ? maxValue : ''}
              placeholder="Max"
              onChange={this.update}
              data-is-numeric={true}
            />
          </div>
        </CustomProperty>

        <CustomProperty
          label="Min/Max Length"
          instructions="The minimum and/or maximum character length this field is allowed to have (optional)."
        >
          <div className="composer-property-input composer-property-flex">
            <input
              name="minLength"
              value={minLength ? minLength : ''}
              placeholder="Min"
              className=""
              onChange={this.update}
              data-is-numeric={true}
            />
            <input
              name="maxLength"
              value={maxLength ? maxLength : ''}
              placeholder="Max"
              onChange={this.update}
              data-is-numeric={true}
            />
          </div>
        </CustomProperty>

        <TextProperty
          label="Decimal Count"
          instructions="The number of decimal places allowed."
          name="decimalCount"
          placeholder="Leave blank for no decimals."
          value={decimalCount ? decimalCount : ''}
          isNumeric={true}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Step"
          instructions="The step"
          name="step"
          placeholder="1"
          value={step ? step : ''}
          onChangeHandler={this.update}
        />

        <AttributeEditorProperty />
      </div>
    );
  }
}
