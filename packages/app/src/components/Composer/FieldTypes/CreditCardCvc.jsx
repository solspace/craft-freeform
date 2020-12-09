import React from 'react';
import HtmlInput from './HtmlInput';

export default class CreditCardCvc extends HtmlInput {
  static getClassName() {
    return 'CreditCardCvc';
  }

  getClassName() {
    return this.constructor.getClassName();
  }

  getInputClassNames() {
    return ['text', 'fullwidth'];
  }
}
