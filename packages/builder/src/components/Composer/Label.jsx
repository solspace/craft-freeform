import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Label extends Component {
  static propTypes = {
    fieldId: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
  };

  render() {
    const { fieldId, label } = this.props;

    return <label for={'composer-input-' + fieldId}>{label}</label>;
  }
}
