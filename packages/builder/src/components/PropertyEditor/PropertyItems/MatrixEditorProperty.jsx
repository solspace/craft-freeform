import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addRow, removeRow, swapRow, updateColumn } from '../../../actions/MatrixEditor';
import { translate } from '../../../app';
import Row from './Table/Row';

@connect(null, (dispatch) => ({
  addRow: (hash, attribute) => dispatch(addRow(hash, attribute)),
  removeRow: (hash, attribute, rowIndex) => dispatch(removeRow(hash, attribute, rowIndex)),
  swapRow: (hash, attribute, oldRowIndex, newRowIndex) => dispatch(swapRow(hash, attribute, oldRowIndex, newRowIndex)),
  updateColumn: (hash, attribute, rowIndex, name, value) =>
    dispatch(updateColumn(hash, attribute, rowIndex, name, value)),
}))
export default class MatrixEditorProperty extends Component {
  static propTypes = {
    hash: PropTypes.string.isRequired,
    attribute: PropTypes.string.isRequired,
    isSortable: PropTypes.bool,
    isRemovable: PropTypes.bool,
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        handle: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }).isRequired
    ).isRequired,
    values: PropTypes.arrayOf(PropTypes.object.isRequired),
    buttonLabel: PropTypes.string,
    addRow: PropTypes.func,
    removeRow: PropTypes.func,
    swapRow: PropTypes.func,
    updateColumn: PropTypes.func,
  };

  /**
   * Generates a list of each row, its columns and inputs
   *
   * @param items
   * @returns {Array}
   */
  getRows = (items) => {
    const { columns } = this.props;
    const elements = [];

    for (const [i, item] of items.entries()) {
      elements.push(
        <Row
          rowIndex={i}
          columns={columns}
          values={item}
          key={i}
          editColumn={this.updateColumn}
          deleteRow={this.deleteMatrixRow}
          swapRow={this.swapMatrixRows}
        />
      );
    }

    return elements;
  };

  addRow = () => {
    const { hash, attribute } = this.props;
    this.props.addRow(hash, attribute);
  };

  updateColumn = (rowIndex, handle, value) => {
    const { hash, attribute, updateColumn } = this.props;
    updateColumn(hash, attribute, rowIndex, handle, value);
  };

  deleteMatrixRow = (rowIndex) => {
    const { hash, attribute, removeRow } = this.props;
    removeRow(hash, attribute, rowIndex);
  };

  swapMatrixRows = (oldIndex, newIndex) => {
    const { hash, attribute, swapRow } = this.props;
    swapRow(hash, attribute, oldIndex, newIndex);
  };

  render() {
    const { columns, values = [] } = this.props;
    const { isSortable = true, isRemovable = true } = this.props;
    const { buttonLabel } = this.props;

    return (
      <div className="composer-option-table">
        {!!values.length && (
          <table>
            <thead>
              <tr>
                {columns.map((item) => (
                  <th key={item.handle}>{item.label}</th>
                ))}
                {isSortable && <th />}
                {isRemovable && <th />}
              </tr>
            </thead>
            <tbody>{this.getRows(values)}</tbody>
          </table>
        )}

        <button className={'btn add icon' + (!values.length ? ' small' : '')} onClick={this.addRow}>
          {translate(buttonLabel || 'Add...')}
        </button>
      </div>
    );
  }
}
