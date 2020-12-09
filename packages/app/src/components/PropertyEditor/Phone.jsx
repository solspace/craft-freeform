import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class Phone extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.node,
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      pattern: PropTypes.string,
      useJsMask: PropTypes.bool,
    }).isRequired,
  };

  render() {
    const {
      properties: { label, value, handle, placeholder, required, instructions, pattern, useJsMask },
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

        <TextProperty
          label="Pattern"
          instructions="Custom phone pattern (e.g. '(000) 000-0000' or '+0 0000 000000'), where '0' stands for a digit between 0-9. If left blank, any number and dash, dot, space, parentheses and optional + at the beginning will be validated."
          name="pattern"
          placeholder="Optional"
          value={pattern}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="Use JS validation"
          instructions="Enable this to force JS to validate the input on this field based on the pattern."
          name="useJsMask"
          checked={useJsMask}
          onChangeHandler={this.update}
        />

        <AttributeEditorProperty />
      </div>
    );
  }
}
