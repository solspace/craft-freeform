import React from 'react';
import HtmlInput from './HtmlInput';

export default class Text extends HtmlInput {
  getClassName() {
    return 'Text';
  }

  getInputClassNames() {
    return ['text', 'fullwidth'];
  }
}
