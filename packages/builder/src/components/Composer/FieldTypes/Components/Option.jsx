import PropTypes from 'prop-types';
import React from 'react';
import HtmlInput from '../HtmlInput';

export default class Radio extends HtmlInput {
  static propTypes = {
    label: PropTypes.string.isRequired,
    properties: PropTypes.object.isRequired,
  };

  getType() {
    return 'option';
  }

  render() {
    const { label, value } = this.props;

    return <option value={value}>{label}</option>;
  }
}
