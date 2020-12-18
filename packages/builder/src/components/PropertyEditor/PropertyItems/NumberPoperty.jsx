import React from 'react';
import BasePropertyItem from './BasePropertyItem';

export default class NumberProperty extends BasePropertyItem {
  renderInput() {
    const {
      name,
      readOnly,
      disabled,
      value,
      className,
      placeholder,
      isNumeric,
      nullable,
      onChangeHandler,
    } = this.props;

    const classes = [className];
    if (readOnly && disabled) {
      classes.push('code');
    }

    return (
      <input
        type="number"
        className={classes.join(' ')}
        name={name}
        placeholder={placeholder ? placeholder : ''}
        readOnly={readOnly}
        disabled={disabled}
        onChange={onChangeHandler}
        data-is-numeric={!!isNumeric}
        data-nullable={!!nullable}
        value={value}
      />
    );
  }
}
