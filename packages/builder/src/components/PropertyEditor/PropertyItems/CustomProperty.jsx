import PropTypes from 'prop-types';
import React from 'react';
import BasePropertyItem from './BasePropertyItem';

export default class CustomProperty extends BasePropertyItem {
  static propTypes = {
    ...BasePropertyItem.propTypes,
    content: PropTypes.element,
  };

  renderInput() {
    return this.props.content;
  }
}
