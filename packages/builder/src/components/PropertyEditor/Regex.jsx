import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class Regex extends BasePropertyEditor {
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
      pattern: PropTypes.string,
      message: PropTypes.string,
    }).isRequired,
  };

  render() {
    const {
      properties: { label, value, handle, placeholder, required, instructions, pattern, message },
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
          instructions="Enter any regex pattern here."
          name="pattern"
          placeholder="e.g. /^[a-zA-Z0-9]*$/"
          value={pattern ? pattern : ''}
          onChangeHandler={this.update}
        />

        <TextProperty
          label="Error Message"
          instructions="The message a user should receive if an incorrect value is given. It will replace any occurrences of '{{pattern}}' with the supplied regex pattern inside the message if any are found."
          name="message"
          placeholder="Value is not valid"
          value={message ? message : ''}
          onChangeHandler={this.update}
        />

        <AttributeEditorProperty />
      </div>
    );
  }
}
