import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { insertValue, removeValue } from '../../../../actions/Actions';

@connect(null, (dispatch) => ({
  insertValue: (hash, value) => dispatch(insertValue(hash, value)),
  removeValue: (hash, value) => dispatch(removeValue(hash, value)),
}))
export default class PredefinedOptionRow extends Component {
  static propTypes = {
    hash: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    value: PropTypes.node.isRequired,
    index: PropTypes.number.isRequired,
    isChecked: PropTypes.bool,
    insertValue: PropTypes.func.isRequired,
    removeValue: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.updateIsChecked = this.updateIsChecked.bind(this);
  }

  render() {
    const { label, value, isChecked } = this.props;

    return (
      <tr>
        <td>
          <input type="text" value={label} ref="label" data-type="label" readOnly={true} />
        </td>
        <td>
          <input type="text" value={value} data-type="value" ref="value" className="code" readOnly={true} />
        </td>
        <td className="composer-option-row-checkbox">
          <input type="checkbox" checked={isChecked} onChange={this.updateIsChecked} />
        </td>
      </tr>
    );
  }

  updateIsChecked(event) {
    const { hash, value, insertValue, removeValue } = this.props;
    const {
      target: { checked },
    } = event;

    if (checked) {
      insertValue(hash, value);
    } else {
      removeValue(hash, value);
    }
  }
}
