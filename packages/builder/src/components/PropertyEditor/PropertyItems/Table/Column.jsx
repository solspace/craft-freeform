import PropTypes from 'prop-types';
import React from 'react';

export const TYPE_STRING = 'string';
export const TYPE_SELECT = 'select';
export const TYPE_CHECKBOX = 'checkbox';

const columnTypes = [TYPE_STRING, TYPE_SELECT, TYPE_CHECKBOX];

const editColumn = (name, value, rowIndex, callback) => {
  callback(rowIndex, name, value);
};

const renderInput = (props) => {
  const { rowIndex, handle, value, type = TYPE_STRING, edit } = props;
  const inputChange = ({ target: { name, value } }) => editColumn(name, value, rowIndex, edit);

  switch (type) {
    case TYPE_SELECT:
      const { options = [] } = props;

      return (
        <select name={handle} value={value} onChange={inputChange}>
          {options.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      );

    case TYPE_STRING:
    default:
      return <input type="text" name={handle} value={value} onChange={inputChange} />;
  }
};

const Column = (props) => <td>{renderInput(props)}</td>;

Column.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  columnIndex: PropTypes.number.isRequired,
  handle: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(columnTypes),
  value: PropTypes.node,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  edit: PropTypes.func,
};

export default Column;
