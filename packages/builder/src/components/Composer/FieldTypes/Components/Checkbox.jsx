import PropTypes from 'prop-types';
import React from 'react';
import { CHECKBOX } from '../../../../constants/FieldTypes';
import HtmlInput from '../HtmlInput';

export default class Checkbox extends HtmlInput {
  static propTypes = {
    label: PropTypes.node.isRequired,
    properties: PropTypes.object.isRequired,
    isChecked: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool,
  };

  static contextTypes = {
    renderHtml: PropTypes.bool.isRequired,
  };

  getType() {
    return CHECKBOX;
  }

  render() {
    const { label, isChecked, value, isRequired } = this.props;
    const { renderHtml } = this.context;

    const labelClass = ['composer-field-checkbox-single'];
    if (isRequired) {
      labelClass.push('composer-field-required');
    }

    if (isChecked) {
      labelClass.push('checked');
    }

    return (
      <div>
        <label className={labelClass.join(' ')}>
          <input
            className="composer-ft-checkbox"
            type={this.getType()}
            value={value}
            readOnly={true}
            disabled={true}
            checked={isChecked}
            {...this.getCleanProperties()}
          />
          {renderHtml && <span dangerouslySetInnerHTML={{ __html: label }} />}
          {!renderHtml && <span>{label}</span>}
          {isRequired ? <span className="required" /> : ''}
          {this.props.children}
        </label>
      </div>
    );
  }
}
