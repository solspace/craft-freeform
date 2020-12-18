import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { HIDDEN } from '../../../../constants/FieldTypes';

export default class Label extends Component {
  static propTypes = {
    label: PropTypes.string,
    isRequired: PropTypes.bool,
    type: PropTypes.string,
  };

  static contextTypes = {
    renderHtml: PropTypes.bool.isRequired,
  };

  render() {
    const { label, isRequired, type } = this.props;
    const { renderHtml } = this.context;

    const labelClass = ['composer-field-label'];
    if (isRequired) {
      labelClass.push('composer-field-required');
    }

    if (!label) {
      labelClass.push('badge-only');
    }

    return (
      <label className={labelClass.join(' ')}>
        {renderHtml && <span dangerouslySetInnerHTML={{ __html: label }} />}
        {!renderHtml && <span>{label}</span>}
        {label && isRequired ? <span className="required" /> : ''}
        {this.props.children}
        {!label && isRequired ? <span className="required" /> : ''}
      </label>
    );
  }
}
