import React from 'react';
import BasePropertyItem from './BasePropertyItem';

export default class TextProperty extends BasePropertyItem {
  renderInput() {
    const {
      name,
      readOnly,
      disabled,
      onChangeHandler,
      value,
      className,
      placeholder,
      isNumeric,
      isFloat,
      nullable,
    } = this.props;

    const classes = [className];
    if (readOnly && disabled) {
      classes.push('code');
    }

    return (
      <input
        type="text"
        className={classes.join(' ')}
        name={name}
        placeholder={placeholder ? this.translate(placeholder) : ''}
        readOnly={readOnly}
        disabled={disabled}
        onChange={onChangeHandler}
        data-is-numeric={!!isNumeric}
        data-is-float={!!isFloat}
        data-nullable={!!nullable}
        value={value}
      />
    );
  }
}
