import PropTypes from 'prop-types';
import React from 'react';
import { RADIO } from '../../../../constants/FieldTypes';
import HtmlInput from '../HtmlInput';

export default class Radio extends HtmlInput {
  static propTypes = {
    label: PropTypes.string.isRequired,
    properties: PropTypes.object.isRequired,
    isChecked: PropTypes.bool.isRequired,
  };

  static contextTypes = {
    renderHtml: PropTypes.bool.isRequired,
  };

  getType() {
    return RADIO;
  }

  render() {
    const { label, isChecked, value } = this.props;
    const { renderHtml } = this.context;

    return (
      <div>
        <label>
          <input
            className="composer-ft-radio"
            type={this.getType()}
            value={value}
            readOnly={true}
            disabled={true}
            checked={isChecked}
            {...this.getCleanProperties()}
          />
          {renderHtml && <span dangerouslySetInnerHTML={{ __html: label }} />}
          {!renderHtml && <span>{label}</span>}
        </label>
      </div>
    );
  }
}
