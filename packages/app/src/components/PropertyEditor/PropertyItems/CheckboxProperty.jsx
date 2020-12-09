import PropTypes from 'prop-types';
import React from 'react';
import { Tooltip } from 'react-tippy';
import BasePropertyItem from './BasePropertyItem';

export default class CheckboxProperty extends BasePropertyItem {
  static propTypes = {
    ...BasePropertyItem.propTypes,
    checked: PropTypes.bool,
    bold: PropTypes.bool,
  };

  render() {
    return (
      <div className="composer-property-item">
        <div className="composer-property-input">{this.renderInput()}</div>
      </div>
    );
  }

  renderInput() {
    const { label, name, readOnly, disabled, onChangeHandler, className, checked, bold, instructions } = this.props;

    const randId = Math.random().toString(36).substring(2, 9);

    let style = { fontWeight: 'normal' };

    if (!!bold) {
      style.fontWeight = 'bold';
      style.color = '#576574';
    }

    return (
      <div className="composer-property-checkbox">
        <input
          id={randId}
          type="checkbox"
          className="checkbox"
          name={name}
          readOnly={readOnly}
          disabled={disabled}
          checked={!!checked}
          onChange={onChangeHandler}
          value={true}
        />
        <label htmlFor={randId} style={style}>
          {label}
        </label>
        {instructions && (
          <Tooltip title={instructions} position="bottom-start" theme="light" className="ff-info" arrow={true} />
        )}
      </div>
    );
  }
}
