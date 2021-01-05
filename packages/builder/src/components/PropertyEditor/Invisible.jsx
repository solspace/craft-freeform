import PropTypes from 'prop-types';
import React from 'react';
import BasePropertyEditor from './BasePropertyEditor';
import { AttributeEditorProperty } from './PropertyItems';
import ExternalOptionsProperty from './PropertyItems/ExternalOptionsProperty';
import TextProperty from './PropertyItems/TextProperty';

export default class Invisible extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    properties: PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      value: PropTypes.string,
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
          label="Value"
          instructions="Enter the fixed field value."
          name="value"
          value={value}
          onChangeHandler={this.update}
        />
      </div>
    );
  }
}
