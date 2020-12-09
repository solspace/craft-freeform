import PropTypes from 'prop-types';
import React from 'react';
import BasePropertyItem from './BasePropertyItem';
import Crypto from 'crypto';

export default class CheckboxListProperty extends BasePropertyItem {
  static propTypes = {
    ...BasePropertyItem.propTypes,
    isNumeric: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.node.isRequired,
        value: PropTypes.node.isRequired,
      })
    ),
    values: PropTypes.array,
    updateField: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.handleUpdate = this.handleUpdate.bind(this);
  }

  renderInput() {
    const { name, readOnly, disabled, values, className, isNumeric, options } = this.props;

    const classNames = ['composer-property-checkbox-list'];
    if (className) {
      classNames.push(className);
    }

    const hash = Crypto.randomBytes(20).toString('hex');

    return (
      <div className={classNames.join(' ')} ref="container">
        {options.map((item) => (
          <div key={item.key} style={{ marginBottom: 2 }}>
            <input
              id={`user-group-${item.key}-${hash}`}
              name={name}
              className="checkbox"
              type="checkbox"
              value={item.key}
              disabled={!!disabled}
              readOnly={!!readOnly}
              onChange={this.handleUpdate}
              data-is-numeric={!!isNumeric}
              checked={values && values.find((elem) => elem == item.key)}
            />
            <label htmlFor={`user-group-${item.key}-${hash}`}>{item.value}</label>
          </div>
        ))}
      </div>
    );
  }

  handleUpdate() {
    const { updateField, name } = this.props;
    const checkboxList = this.refs.container.querySelectorAll('input');

    const values = [];
    for (let i = 0; i < checkboxList.length; i++) {
      const checkbox = checkboxList[i];

      if (!checkbox.checked) {
        continue;
      }

      values.push(checkbox.value);
    }

    updateField({ [name]: values });
  }
}
