import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import { connect } from 'react-redux';
import { clearPlaceholders, removeColumn, removeProperty, switchHash } from '../../actions/Actions';
import { COLUMN } from '../../constants/DraggableTypes';
import Field from './Field';

const columnSource = {
  beginDrag(props) {
    return {
      type: COLUMN,
      rowIndex: props.rowIndex,
      index: props.index,
      pageIndex: props.pageIndex,
      hash: props.hash,
      columnCountInRow: props.columnCountInRow,
      clearPlaceholders: props.clearPlaceholders,
    };
  },
  endDrag(props) {
    props.clearPlaceholders();
  },
};

@connect(
  (state) => ({
    pageIndex: state.context.page,
    currentHash: state.context.hash,
    layout: state.composer.layout,
    duplicateHandles: state.duplicateHandles,
  }),
  (dispatch) => ({
    openFieldSettings: (hash) => dispatch(switchHash(hash)),
    removeColumn: (hash, index, rowIndex, pageIndex) => {
      dispatch(removeColumn(hash, index, rowIndex, pageIndex));
      dispatch(removeProperty(hash));
    },
    openProperties: (hash) => dispatch(switchHash(hash)),
    clearPlaceholders: () => dispatch(clearPlaceholders()),
  })
)
@DragSource(COLUMN, columnSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export default class Column extends Component {
  static propTypes = {
    hash: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    rowIndex: PropTypes.number.isRequired,
    columnCountInRow: PropTypes.number.isRequired,
    addColumn: PropTypes.func.isRequired,
    moveColumn: PropTypes.func.isRequired,
    removeColumn: PropTypes.func.isRequired,
    clearPlaceholders: PropTypes.func.isRequired,
    properties: PropTypes.object.isRequired,
    pageIndex: PropTypes.number.isRequired,
    openFieldSettings: PropTypes.func.isRequired,
    openProperties: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    duplicateHandles: PropTypes.array.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.openPropertiesHandler = this.openPropertiesHandler.bind(this);
    this.removeColumnHandler = this.removeColumnHandler.bind(this);
    this.buildPreview = this.buildPreview.bind(this);
  }

  componentDidMount() {
    const { connectDragPreview } = this.props;

    connectDragPreview(this.buildPreview());
  }

  render() {
    const { hash, index, rowIndex, currentHash, duplicateHandles } = this.props;
    const { connectDragSource, properties } = this.props;

    const className = ['composer-column'];
    if (currentHash === hash) {
      className.push('composer-column-active');
    }

    return connectDragSource(
      <div className={className.join(' ')} onClick={this.openPropertiesHandler}>
        <ul className="composer-actions composer-column-actions">
          <li className="composer-action-remove" onClick={this.removeColumnHandler}></li>
        </ul>

        <Field
          type={properties.type}
          properties={properties}
          hash={hash}
          index={index}
          rowIndex={rowIndex}
          duplicateHandles={duplicateHandles}
        />
      </div>
    );
  }

  /**
   * Handles opening the properties in props editor for this column
   */
  openPropertiesHandler() {
    const { hash, openProperties } = this.props;

    openProperties(hash);
  }

  /**
   * Removes the column
   *
   * @param event
   */
  removeColumnHandler(event) {
    const { removeColumn, pageIndex, hash, index, rowIndex } = this.props;

    removeColumn(hash, index, rowIndex, pageIndex);

    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Builds the canvas of the preview, makes it into an image and returns it
   *
   * @returns {Image}
   */
  buildPreview() {
    const {
      properties: { label },
    } = this.props;
    let [width, height] = [200, 30];

    let canvas = document.createElement('canvas');

    // Failsafe
    if (!canvas.getContext) {
      return null;
    }

    const ctx = canvas.getContext('2d');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;

    const ratio = devicePixelRatio / backingStoreRatio;

    width = width * ratio;
    height = height * ratio;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const lineDashWidth = Math.ceil(4 * ratio);
    const lineDashSpacing = Math.ceil(2 * ratio);

    ctx.setLineDash([lineDashWidth, lineDashSpacing]);
    ctx.strokeStyle = '#c9c9c9';
    ctx.lineDashOffset = 0;
    ctx.strokeRect(0, 0, width, height);

    const fontSize = Math.ceil(13 * ratio);

    ctx.font = `normal ${fontSize}px HelveticaNeue, sans-serif`;
    ctx.fillStyle = '#000000';
    ctx.fillText(label, Math.ceil(10 * ratio), Math.ceil(20 * ratio));

    let img = new Image();
    img.src = canvas.toDataURL();

    return img;
  }
}
