import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { addColumnToNewRow, clearPlaceholders, removePage, switchHash, switchPage } from '../../actions/Actions';
import { placeholderPage, swapPage } from '../../actions/PageDragDrop';
import { COLUMN, PAGE } from '../../constants/DraggableTypes';

const passablePageDragOffset = 15;

const pageSource = {
  beginDrag(props) {
    return {
      type: PAGE,
      index: props.index,
    };
  },
  endDrag(props) {
    props.clearPlaceholders();
  },
};

const pageTarget = {
  hover(props, monitor, component) {
    const item = monitor.getItem();

    switch (item.type) {
      case PAGE:
        if (item.index === props.index) {
          return false;
        }

        const box = findDOMNode(component).getBoundingClientRect();
        const mouse = monitor.getClientOffset();

        if (item.index < props.index && mouse.x - passablePageDragOffset < box.x) {
          return false;
        }

        if (item.index > props.index && box.x + box.width < mouse.x + passablePageDragOffset) {
          return false;
        }

        const newIndex = item.index;
        const oldIndex = props.index;

        item.index = props.index;
        props.swapPage(newIndex, oldIndex);

        return;

      case COLUMN:
        const { index } = props;

        if (index === props.placeholderPageIndex) {
          return false;
        }

        props.placeholderPage(index);

        return;
    }
  },
  drop(props, monitor) {
    const item = monitor.getItem();

    switch (item.type) {
      case COLUMN:
        return props.columnToNewRow(0, item.hash, null, props.index, item.pageIndex);
    }
  },
};

@connect(
  (state) => ({
    layout: state.composer.layout,
    placeholderPageIndex: state.placeholders.pageIndex,
  }),
  (dispatch) => ({
    removePage: (pageIndex) => {
      dispatch(removePage(pageIndex));
      dispatch(switchHash('form'));
      dispatch(switchPage(0));
    },
    clearPlaceholders: () => dispatch(clearPlaceholders()),
    swapPage: (newIndex, oldIndex) => dispatch(swapPage(newIndex, oldIndex)),
    placeholderPage: (pageIndex) => dispatch(placeholderPage(pageIndex)),
    columnToNewRow: (rowIndex, hash, properties, pageIndex, prevPageIndex) =>
      dispatch(addColumnToNewRow(rowIndex, hash, properties, pageIndex, prevPageIndex)),
  })
)
@DropTarget([PAGE, COLUMN], pageTarget, (connect) => ({ connectDropTarget: connect.dropTarget() }))
@DragSource(PAGE, pageSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export default class Tab extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    isSelected: PropTypes.bool.isRequired,
    placeholderPageIndex: PropTypes.number,
    label: PropTypes.string,
    onClick: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.tabClickHandler = this.tabClickHandler.bind(this);
    this.removePageHandler = this.removePageHandler.bind(this);
  }

  render() {
    const { index, isSelected, placeholderPageIndex, label, layout } = this.props;
    const { connectDragSource, connectDropTarget } = this.props;
    const pageCount = layout.length;

    const classNames = [];
    if (isSelected) {
      classNames.push('active');
    }

    if (index === placeholderPageIndex) {
      classNames.push('has-hover');
    }

    return connectDropTarget(
      connectDragSource(
        <li className={classNames.join(' ')} onClick={this.tabClickHandler}>
          <span>{label ? label : `Page ${index + 1}`}</span>

          {isSelected && pageCount > 1 ? (
            <ul className="composer-actions composer-page-actions">
              <li className="composer-action-remove" onClick={this.removePageHandler}></li>
            </ul>
          ) : (
            ''
          )}
        </li>
      )
    );
  }

  tabClickHandler(event) {
    if (!event.target.className.match(/composer-action-remove/)) {
      this.props.onClick();
    }
  }

  removePageHandler(event) {
    const { index, removePage } = this.props;

    if (confirm('Are you sure you want to remove this page and all fields on it?')) {
      removePage(index);
    }

    event.preventDefault();
    return false;
  }
}
