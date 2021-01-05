import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class MappingRow extends Component {
  static propTypes = {
    handle: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool.isRequired,
    formFields: PropTypes.arrayOf(
      PropTypes.shape({
        handle: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    mappedFormField: PropTypes.string,
    onChangeHandler: PropTypes.func.isRequired,
  };

  render() {
    const { handle, label, required, formFields, mappedFormField, onChangeHandler } = this.props;

    return (
      <tr>
        <td className="read-only code">
          <label className={required ? 'required' : ''}>{label}</label>
        </td>
        <td>
          <div className="select">
            <select name={handle} value={mappedFormField} onChange={onChangeHandler}>
              <option key="--" value="">
                --
              </option>
              {formFields.map((item, i) => (
                <option key={item.handle} value={item.handle}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </td>
      </tr>
    );
  }
}
