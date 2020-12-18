import React from 'react';
import HtmlInput from './HtmlInput';

export default class CreditCardNumber extends HtmlInput {
  static getClassName() {
    return 'CreditCardNumber';
  }

  getClassName() {
    return this.constructor.getClassName();
  }

  getInputClassNames() {
    return ['text', 'fullwidth'];
  }
}
