import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { handleMatrixRowDrag } from '../../../../actions/DragDrop';
import { translate } from '../../../../app';
import { MATRIX_ROW } from '../../../../constants/DraggableTypes';
import Column from './Column';

const optionRowSource = {
  beginDrag: (props) => ({
    type: MATRIX_ROW,
    rowIndex: props.rowIndex,
  }),
};

const optionRowTarget = {
  hover(props, monitor, component) {
    return handleMatrixRowDrag(props, monitor, component);
  },
};

@DropTarget([MATRIX_ROW], optionRowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  dragItemType: monitor.getItemType(),
}))
@DragSource(MATRIX_ROW, optionRowSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export default class Row extends Component {
  static propTypes = {
    rowIndex: PropTypes.number.isRequired,
    columns: PropTypes.array.isRequired,
    isSortable: PropTypes.bool,
    isRemovable: PropTypes.bool,
    values: PropTypes.object,
    deleteRow: PropTypes.func,
    swapRow: PropTypes.func,
    editColumn: PropTypes.func,
    connectDropTarget: PropTypes.func,
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func,
  };

  render() {
    const {
      rowIndex,
      columns,
      isSortable = true,
      isRemovable = true,
      values,
      editColumn,
      deleteRow,
      connectDragSource,
      connectDragPreview,
      connectDropTarget,
    } = this.props;

    return connectDropTarget(
      connectDragPreview(
        <tr>
          {columns.map(({ handle, label, type, options }, i) => (
            <Column
              rowIndex={rowIndex}
              columnIndex={i}
              value={values[handle] ? values[handle] : ''}
              options={options}
              handle={handle}
              label={label}
              type={type}
              edit={editColumn}
              key={i}
            />
          ))}
          {isSortable && (
            <td className="action">{connectDragSource(<a className="move" title={translate('Reorder')} />)}</td>
          )}
          {isRemovable && (
            <td className="action">
              <a className="delete" title={translate('Remove')} onClick={() => deleteRow(rowIndex)} />
            </td>
          )}
        </tr>
      )
    );
  }
}
