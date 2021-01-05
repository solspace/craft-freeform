import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import TextProperty from './PropertyItems/TextProperty';

export default class CreditCardNumber extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    //TODO: this does not reflect actual data we get, we care about properties[children][CreditCardNumber] shape
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
    }).isRequired,
  };

  static getClassName() {
    return 'CreditCardNumber';
  }

  render() {
    const { label, placeholder } = this.compileProps();

    return (
      <div>
        <h4>{translate('Credit Card Number')}</h4>

        <TextProperty
          label="Label"
          instructions="Field label used to describe credit card number field."
          name="label"
          value={label}
          onChangeHandler={this.updateChildField}
        />

        <TextProperty
          label="Placeholder"
          instructions="Field placeholder"
          name="placeholder"
          value={placeholder}
          onChangeHandler={this.updateChildField}
        />
      </div>
    );
  }
}
