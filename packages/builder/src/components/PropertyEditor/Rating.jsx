import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import ColorProperty from './PropertyItems/ColorProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class Rating extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.number,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      maxValue: PropTypes.number,
      colorIdle: PropTypes.string,
      colorHover: PropTypes.string,
      colorSelected: PropTypes.string,
    }).isRequired,
  };

  render() {
    const {
      properties: { label, value, handle, required, instructions, maxValue },
    } = this.context;
    const {
      properties: { colorIdle, colorHover, colorSelected },
    } = this.context;

    let starOptions = [];
    for (let i = 3; i <= 10; i++) {
      starOptions.push({
        key: i,
        value: i,
      });
    }

    let defaultValueOptions = [];
    for (let i = 1; i <= maxValue; i++) {
      defaultValueOptions.push({
        key: i,
        value: i,
      });
    }

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

        <SelectProperty
          label="Default Value"
          instructions="If present, this will be the value pre-populated when the form is rendered."
          name="value"
          value={value ? value : 0}
          onChangeHandler={this.update}
          options={defaultValueOptions}
          emptyOption="None"
          isNumeric={true}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        <SelectProperty
          label="Maximum Number of Stars"
          instructions="Set how many stars there should be for this rating."
          name="maxValue"
          value={maxValue ? maxValue : 5}
          onChangeHandler={this.update}
          options={starOptions}
          isNumeric={true}
        />

        <ColorProperty
          label="Unselected Color"
          name="colorIdle"
          value={colorIdle}
          onChangeHandler={this.updateKeyValue}
        />

        <ColorProperty label="Hover Color" name="colorHover" value={colorHover} onChangeHandler={this.updateKeyValue} />

        <ColorProperty
          label="Selected Color"
          name="colorSelected"
          value={colorSelected}
          onChangeHandler={this.updateKeyValue}
        />

        <AttributeEditorProperty />
      </div>
    );
  }
}
