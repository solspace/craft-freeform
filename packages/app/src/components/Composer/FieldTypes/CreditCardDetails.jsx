import React from 'react';
import PropTypes from 'prop-types';
import HtmlInput from './HtmlInput';
import Label from './Components/Label';
import CreditCardDetailsEditor from '../../PropertyEditor/CreditCardDetails';
import CreditCardNumber from './CreditCardNumber';
import CreditCardExpDate from './CreditCardExpDate';
import CreditCardCvc from './CreditCardCvc';

export default class CreditCardDetails extends HtmlInput {
  static propTypes = {
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

  static layouts = {
    [CreditCardDetailsEditor.LAYOUT_2_ROWS]: [[CreditCardNumber], [CreditCardExpDate, CreditCardCvc]],
    [CreditCardDetailsEditor.LAYOUT_3_ROWS]: [[CreditCardNumber], [CreditCardExpDate], [CreditCardCvc]],
  };

  getClassName() {
    return 'Text';
  }

  getInputClassNames() {
    return ['text', 'fullwidth'];
  }

  renderRow(key, row) {
    return (
      <div key={key} className="composer-row">
        <div className="composer-column-container">
          {row.map((ChildClass, key) => this.renderColumn(key, ChildClass))}
        </div>
      </div>
    );
  }

  renderColumn(key, ChildClass) {
    const { properties } = this.props;
    const { children } = properties;

    if (!children || !children[ChildClass.getClassName()]) {
      return <div />;
    }

    return (
      <div key={key} className="composer-column">
        <ChildClass properties={{ ...properties, ...children[ChildClass.getClassName()] }} duplicateHandles={[]} />
      </div>
    );
  }

  render() {
    const self = this.constructor;
    const {
      properties: { label, layout },
    } = this.props;

    return (
      <div className={this.prepareWrapperClass()}>
        {label && <Label label={label}>{this.getBadges()}</Label>}

        {self.layouts[layout].map((row, key) => this.renderRow(key, row))}
      </div>
    );
  }
}
