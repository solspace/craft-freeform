import PropTypes from 'prop-types';
import React from 'react';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import CheckboxProperty from './PropertyItems/CheckboxProperty';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import TextareaProperty from './PropertyItems/TextareaProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class CheckboxGroup extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      required: PropTypes.bool.isRequired,
      showCustomValues: PropTypes.bool.isRequired,
      oneLine: PropTypes.bool,
      values: PropTypes.array,
      options: PropTypes.array.isRequired,
      source: PropTypes.string,
      target: PropTypes.node,
      configuration: PropTypes.object,
    }).isRequired,
  };

  render() {
    const { properties } = this.context;
    const { label, handle, values, options } = properties;
    const { required, showCustomValues, instructions, oneLine } = properties;
    const { source, target, configuration } = properties;

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

        <ExternalOptionsProperty
          values={values}
          customOptions={options}
          showCustomValues={showCustomValues}
          source={source}
          target={target}
          configuration={configuration}
          onChangeHandler={this.update}
        />

        <CheckboxProperty
          label="Show all options in a single line?"
          name="oneLine"
          checked={oneLine}
          onChangeHandler={this.update}
        />

        <AttributeEditorProperty />
      </div>
    );
  }
}
