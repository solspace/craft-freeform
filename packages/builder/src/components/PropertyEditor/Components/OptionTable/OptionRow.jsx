import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import ReactDOM from 'react-dom';
import { handleOptionRowDrag } from '../../../../actions/DragDrop';
import { translate } from '../../../../app';
import { OPTION_ROW } from '../../../../constants/DraggableTypes';

const optionRowSource = {
  beginDrag: (props) => ({
    type: OPTION_ROW,
    index: props.index,
    hash: props.hash,
  }),
};

const optionRowTarget = {
  hover(props, monitor, component) {
    return handleOptionRowDrag(props, monitor, component);
  },
};

@DropTarget([OPTION_ROW], optionRowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  dragItemType: monitor.getItemType(),
}))
@DragSource(OPTION_ROW, optionRowSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview(),
  isDragging: monitor.isDragging(),
}))
export default class OptionRow extends Component {
  static propTypes = {
    hash: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    index: PropTypes.number.isRequired,
    isChecked: PropTypes.bool,
    showCustomValues: PropTypes.bool,
    updateValueSet: PropTypes.func.isRequired,
    updateIsChecked: PropTypes.func.isRequired,
    addNewValueSet: PropTypes.func.isRequired,
    cleanUp: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    reorderValueSet: PropTypes.func.isRequired,
    removeValueSet: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.updateValues = this.updateValues.bind(this);
    this.updateIsChecked = this.updateIsChecked.bind(this);
    this.cleanUpNodes = this.cleanUpNodes.bind(this);
    this.removeValueSetHandler = this.removeValueSetHandler.bind(this);
  }

  render() {
    const { connectDropTarget, connectDragSource, connectDragPreview } = this.props;
    const { label, value, isChecked, showCustomValues, isDragging } = this.props;

    return connectDropTarget(
      connectDragPreview(
        <tr>
          <td>
            <input
              type="text"
              value={label}
              ref="label"
              data-type="label"
              onBlur={this.cleanUpNodes}
              onChange={this.updateValues}
            />
          </td>
          {showCustomValues && (
            <td>
              <input
                type="text"
                value={value}
                data-type="value"
                ref="value"
                className="code"
                onBlur={this.cleanUpNodes}
                onChange={this.updateValues}
              />
            </td>
          )}
          <td className="composer-option-row-checkbox">
            <input type="checkbox" checked={isChecked} onChange={this.updateIsChecked} />
          </td>
          <td className="action">{connectDragSource(<a className="move" title={translate('Reorder')} />)}</td>
          <td className="action">
            <a className="delete" title={translate('Remove')} onClick={this.removeValueSetHandler} />
          </td>
        </tr>
      )
    );
  }

  updateValues(event) {
    const { hash, index } = this.props;

    const label = ReactDOM.findDOMNode(this.refs.label).value;
    let value = label;

    const valueInput = ReactDOM.findDOMNode(this.refs.value);
    if (valueInput && event.target.dataset.type === 'value') {
      value = valueInput.value;
    }

    this.props.updateValueSet(hash, index, value, label);
  }

  updateIsChecked(event) {
    const { hash, index } = this.props;
    const {
      target: { checked },
    } = event;

    this.props.updateIsChecked(hash, index, checked);
  }

  cleanUpNodes() {
    const { hash } = this.props;
    this.props.cleanUp(hash);
  }

  removeValueSetHandler() {
    const { hash, index, removeValueSet } = this.props;

    removeValueSet(hash, index);
  }
}
