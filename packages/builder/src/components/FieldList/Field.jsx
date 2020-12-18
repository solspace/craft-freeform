import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import { connect } from 'react-redux';
import { clearPlaceholders } from '../../actions/Actions';
import { FIELD } from '../../constants/DraggableTypes';
import FieldHelper from '../../helpers/FieldHelper';
import PropertyHelper from '../../helpers/PropertyHelper';
import Badge from '../Composer/FieldTypes/Components/Badge';
import { getIcon } from './Components/icons';

const fieldSource = {
  canDrag(props) {
    return !props.isUsed;
  },
  beginDrag(props) {
    let hash = props.hash;
    let properties = PropertyHelper.getCleanProperties(props);

    if (!hash) {
      hash = FieldHelper.hashField(properties);
    }

    return {
      type: FIELD,
      hash: hash,
      properties: properties,
    };
  },
  endDrag(props) {
    props.clearPlaceholders();
  },
};

@connect(null, (dispatch) => ({
  clearPlaceholders: () => dispatch(clearPlaceholders()),
}))
@DragSource(FIELD, fieldSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
export default class Field extends Component {
  static propTypes = {
    hash: PropTypes.string,
    type: PropTypes.string.isRequired,
    isUsed: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    fieldLabel: PropTypes.string,
    badge: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    clearPlaceholders: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  };

  render() {
    const { type, isUsed, label, onClick, connectDragSource, isDragging, badge, fieldLabel } = this.props;

    if (isUsed) {
      return null;
    }

    const classList = [];
    if (isDragging) {
      classList.push('is-dragging');
    }

    const icon = getIcon(type);

    return connectDragSource(
      <li className={classList.join(' ')} disabled={isUsed} onClick={!isUsed ? onClick : null}>
        {icon}
        {fieldLabel || label}
        {badge && <Badge label={badge} />}
      </li>
    );
  }
}
