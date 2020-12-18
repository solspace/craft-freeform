import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import {
  AttributeEditorProperty,
  CheckboxProperty,
  ColorProperty,
  TextareaProperty,
  TextProperty,
} from './PropertyItems';

export default class Signature extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      required: PropTypes.bool,
      showClearButton: PropTypes.bool,
      width: PropTypes.number,
      height: PropTypes.number,
      borderColor: PropTypes.string,
      backgroundColor: PropTypes.string,
      penColor: PropTypes.string,
      penDotSize: PropTypes.number,
    }).isRequired,
  };

  render() {
    const {
      properties: {
        label,
        handle,
        required,
        instructions,
        showClearButton = false,
        width = 400,
        height = 100,
        borderColor = '#999999',
        backgroundColor = 'rgba(0,0,0,0)',
        penColor = '#000000',
        penDotSize = 2.5,
      },
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

        <hr />

        <h4>{translate('Configuration')}</h4>

        <CheckboxProperty
          label="Show 'Clear' button?"
          name="showClearButton"
          checked={showClearButton}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Width"
          instructions="Canvas width in pixels."
          name="width"
          value={width}
          isNumeric={true}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Height"
          instructions="Canvas height in pixels."
          name="height"
          value={height}
          isNumeric={true}
          onChangeHandler={this.update}
        />

        <ColorProperty
          label="Border Color"
          name="borderColor"
          value={borderColor}
          onChangeHandler={this.updateKeyValue}
        />

        <ColorProperty
          label="Background Color"
          name="backgroundColor"
          value={backgroundColor}
          onChangeHandler={this.updateKeyValue}
        />

        <TextProperty
          label="Pen Dot Size"
          name="penDotSize"
          value={penDotSize}
          isNumeric={true}
          isFloat={true}
          onChangeHandler={this.update}
        />

        <ColorProperty label="Pen Color" name="penColor" value={penColor} onChangeHandler={this.updateKeyValue} />

        <AttributeEditorProperty />
      </div>
    );
  }
}
