import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import { connect } from 'react-redux';
import { handleColumnDrag, handleColumnDrop, handleFieldDrop } from '../../actions/DragDrop';
import { COLUMN, FIELD, ROW } from '../../constants/DraggableTypes';
import Column from './Column';
import PlaceholderColumn from './Placeholders/PlaceholderColumn';
import PlaceholderRow from './Placeholders/PlaceholderRow';

const rowRowTarget = {
  hover(props, monitor, component) {
    const item = monitor.getItem();

    switch (item.type) {
      case ROW:
        return handleRowDrag(props, monitor, component);

      case COLUMN:
      case FIELD:
        return handleColumnDrag(props, monitor, component);
    }
  },
  drop(props, monitor, component) {
    const item = monitor.getItem();

    switch (item.type) {
      case COLUMN:
        return handleColumnDrop(props, monitor, component);

      case FIELD:
        return handleFieldDrop(props, monitor, component);
    }
  },
};

@connect((state) => ({
  placeholders: state.placeholders,
}))
@DropTarget([COLUMN, FIELD, ROW], rowRowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  dragItemType: monitor.getItemType(),
}))
export default class Row extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    columns: PropTypes.array.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    moveColumn: PropTypes.func.isRequired,
    addColumn: PropTypes.func.isRequired,
    columnToNewRow: PropTypes.func.isRequired,
    dragItemType: PropTypes.string,
    properties: PropTypes.object.isRequired,
    addRowPlaceholder: PropTypes.func.isRequired,
    addColumnPlaceholder: PropTypes.func.isRequired,
    clearPlaceholders: PropTypes.func.isRequired,
    placeholders: PropTypes.object.isRequired,
  };

  render() {
    const { connectDropTarget } = this.props;

    const { columns, index } = this.props;
    const { addColumn, moveColumn, properties } = this.props;

    const { placeholders } = this.props;

    const placeholderType = placeholders.type;
    const placeholderRowIndex = placeholders.rowIndex;
    const placeholderIndex = placeholders.index;
    const draggableTargetHash = placeholders.targetHash;

    const isDraggingColumnFromThisRow = placeholderRowIndex === index;

    let columnList = [];

    const columnLength = columns.length;
    for (let i = 0; i < columnLength; i++) {
      const hash = columns[i];

      if (draggableTargetHash === hash) {
        continue;
      }

      columnList.push(
        <Column
          addColumn={addColumn}
          moveColumn={moveColumn}
          key={hash}
          rowIndex={index}
          index={i}
          columnCountInRow={columnLength}
          properties={properties[hash]}
          hash={hash}
        />
      );
    }

    if (placeholderType === COLUMN && isDraggingColumnFromThisRow) {
      columnList = [
        ...columnList.slice(0, placeholderIndex),
        <PlaceholderColumn key={`placeholder${placeholderIndex}`} />,
        ...columnList.slice(placeholderIndex),
      ];
    }

    if (!columnList) {
      return null;
    }

    const showRowPlaceholder = placeholderType === ROW && isDraggingColumnFromThisRow;

    return connectDropTarget(
      <div className="composer-row">
        <PlaceholderRow active={showRowPlaceholder} />

        <ul className="composer-column-container">{columnList}</ul>
      </div>
    );
  }
}
