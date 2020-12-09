import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../app';
import BasePropertyEditor from './BasePropertyEditor';
import TextProperty from './PropertyItems/TextProperty';
import SelectProperty from './PropertyItems/SelectProperty';
import CreditCardNumber from './CreditCardNumber';
import CreditCardExpDate from './CreditCardExpDate';
import CreditCardCvc from './CreditCardCvc';

const LAYOUT_3_ROWS = 'three_rows';
const LAYOUT_2_ROWS = 'two_rows';

export default class CreditCardDetails extends BasePropertyEditor {
  static LAYOUT_3_ROWS = LAYOUT_3_ROWS;
  static LAYOUT_2_ROWS = LAYOUT_2_ROWS;

  static contextTypes = {
    ...BasePropertyEditor.contextTypes,
    hash: PropTypes.string.isRequired,
    properties: PropTypes.shape({
      label: PropTypes.string.isRequired,
      layout: PropTypes.string.isRequired,
      children: PropTypes.shape({
        [CreditCardNumber.getClassName()]: PropTypes.object.isRequired,
        [CreditCardExpDate.getClassName()]: PropTypes.object.isRequired,
        [CreditCardCvc.getClassName()]: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static LAYOUT_OPTIONS = [
    { value: 'Two rows', key: LAYOUT_2_ROWS },
    { value: 'Three rows', key: LAYOUT_3_ROWS },
  ];

  static CHILDREN_CLASS_MAP = {
    [CreditCardNumber.getClassName()]: CreditCardNumber,
    [CreditCardExpDate.getClassName()]: CreditCardExpDate,
    [CreditCardCvc.getClassName()]: CreditCardCvc,
  };

  renderChild(key, className) {
    const self = this.constructor;
    const FieldClass = self.CHILDREN_CLASS_MAP[className];

    return <FieldClass key={key} />;
  }

  render() {
    const self = this.constructor;
    const {
      hash,
      properties: { label, children, layout },
    } = this.context;

    return (
      <div>
        <TextProperty
          label="Hash"
          instructions="Used to access this field on the frontend."
          name="handle"
          value={hash}
          className="code"
          readOnly={true}
        />

        <TextProperty
          label="Label"
          instructions="Field label used to describe payment field."
          name="label"
          value={label}
          onChangeHandler={this.update}
        />

        <hr />

        <h4>{translate('Configuration')}</h4>

        <SelectProperty
          label="Layout"
          instructions="Field layout."
          name="layout"
          value={layout}
          options={self.LAYOUT_OPTIONS}
          onChangeHandler={this.update}
        />

        <hr />

        {Object.keys(children).map((className, index) => this.renderChild(index, className))}
      </div>
    );
  }
}
