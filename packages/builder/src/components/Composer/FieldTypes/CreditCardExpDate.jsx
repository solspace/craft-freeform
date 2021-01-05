import HtmlInput from './HtmlInput';

export default class CreditCardExpDate extends HtmlInput {
  static getClassName() {
    return 'CreditCardExpDate';
  }

  getClassName() {
    return this.constructor.getClassName();
  }

  getInputClassNames() {
    return ['text', 'fullwidth'];
  }
}
