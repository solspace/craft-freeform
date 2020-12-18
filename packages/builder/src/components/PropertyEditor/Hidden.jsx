import PropTypes from 'prop-types';
import React from 'react';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class Hidden extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.string,
      required: PropTypes.bool,
    }).isRequired,
  };

  render() {
    const {
      properties: { value, handle },
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

        <hr />

        <TextProperty
          label="Default Value"
          instructions="If present, this will be the value pre-populated when the form is rendered."
          name="value"
          value={value}
          onChangeHandler={this.update}
        />
      </div>
    );
  }
}
