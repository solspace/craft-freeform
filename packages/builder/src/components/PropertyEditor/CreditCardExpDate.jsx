import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import TextProperty from './PropertyItems/TextProperty';

export default class CreditCardExpDate extends BasePropertyEditor {
  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
    }).isRequired,
  };

  constructor(props, context) {
    super(props, context);
  }

  static getClassName() {
    return 'CreditCardExpDate';
  }

  compileProps = () => {
    const { properties: contextProps } = this.context;
    const {
      children: { [this.constructor.getClassName()]: childrenProps },
    } = contextProps;
    const thisProps = this.props;

    return {
      ...contextProps,
      ...childrenProps,
      ...thisProps,
    };
  };

  update(event) {
    const {
      properties: { children },
    } = this.context;
    const updatedChildren = children || {};

    updatedChildren[this.constructor.getClassName()][event.target.name] = event.target.value;

    const fakeEvent = {
      target: {
        type: event.target.type,
        name: 'children',
        value: updatedChildren,
        dataset: {},
      },
    };

    super.update(fakeEvent);
  }

  render() {
    const { label, placeholder } = this.compileProps();

    return (
      <div>
        <hr />
        <h4>{translate('Expiry Date')}</h4>

        <TextProperty
          label="Label"
          instructions="Field label used to describe the field."
          name="label"
          value={label}
          onChangeHandler={this.updateChildField}
        />

        <TextProperty
          label="Placeholder"
          instructions="Field placeholder."
          name="placeholder"
          value={placeholder}
          onChangeHandler={this.updateChildField}
        />
      </div>
    );
  }
}
