import PropTypes from 'prop-types';
import React from 'react';
import BasePropertyItem from './BasePropertyItem';
import CustomProperty from './CustomProperty';

export default class RadioProperty extends BasePropertyItem {
  static propTypes = {
    ...BasePropertyItem.propTypes,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired,
      })
    ).isRequired,
  };

  render() {
    const { label, instructions, name, value, options, onChangeHandler } = this.props;

    return (
      <CustomProperty label={label} instructions={instructions} wrapperClassName="composer-submit-positioning">
        <div>
          {options.map((option, i) => (
            <div key={i}>
              <label>
                <input
                  type="radio"
                  name={name}
                  value={option.key}
                  checked={value === option.key}
                  onChange={onChangeHandler}
                />
                {option.value}
              </label>
            </div>
          ))}
        </div>
      </CustomProperty>
    );
  }
}
