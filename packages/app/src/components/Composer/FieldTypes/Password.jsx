import React from 'react';
import HtmlInput from './HtmlInput';

export default class Password extends HtmlInput {
  getClassName() {
    return 'Password';
  }

  getType() {
    return 'password';
  }

  getInputClassNames() {
    return ['text', 'fullwidth'];
  }
}
