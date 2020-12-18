import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  addValueSet,
  cleanUpValues,
  removeValueSet,
  reorderValueSet,
  toggleCustomValues,
  updateIsChecked,
  updateValueSet,
} from '../../../../actions/Actions';
import { translate } from '../../../../app';
import OptionRow from './OptionRow';

@connect(
  (state) => ({
    properties: state.composer.properties,
  }),
  (dispatch) => ({
    updateValueSet: (hash, index, key, value) => dispatch(updateValueSet(hash, index, key, value)),
    updateIsChecked: (hash, index, isChecked) => dispatch(updateIsChecked(hash, index, isChecked)),
    addNewValueSet: (hash) => dispatch(addValueSet(hash)),
    cleanUp: (hash) => dispatch(cleanUpValues(hash)),
    customValuesHandler: (hash, isChecked) => dispatch(toggleCustomValues(hash, isChecked)),
    reorderValueSet: (hash, index, newIndex) => dispatch(reorderValueSet(hash, index, newIndex)),
    removeValueSet: (hash, index) => dispatch(removeValueSet(hash, index)),
  })
)
export default class OptionTable extends Component {
  static propTypes = {
    options: PropTypes.array,
    values: PropTypes.array,
    value: PropTypes.node,
    showCustomValues: PropTypes.bool,
    updateValueSet: PropTypes.func.isRequired,
    updateIsChecked: PropTypes.func.isRequired,
    addNewValueSet: PropTypes.func.isRequired,
    reorderValueSet: PropTypes.func.isRequired,
    removeValueSet: PropTypes.func.isRequired,
    cleanUp: PropTypes.func.isRequired,
    customValuesHandler: PropTypes.func.isRequired,
    labelTitle: PropTypes.string,
    valueTitle: PropTypes.string,
  };

  static contextTypes = {
    hash: PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.addNewValues = this.addNewValues.bind(this);
    this.toggleCustomValues = this.toggleCustomValues.bind(this);
    this.renderRows = this.renderRows.bind(this);
  }

  render() {
    const { labelTitle, valueTitle } = this.props;
    let { showCustomValues } = this.props;

    let showCustomValueToggler = true;
    if (showCustomValues === undefined) {
      showCustomValues = true;
      showCustomValueToggler = false;
    }

    return (
      <div className="composer-option-table">
        {showCustomValueToggler && (
          <label className="composer-options-show-custom-values">
            <input
              type="checkbox"
              checked={showCustomValues}
              name="showCustomValues"
              onChange={this.toggleCustomValues}
            />
            {translate('Use custom values')}
          </label>
        )}

        <table>
          <thead>
            <tr>
              <th>{translate(labelTitle ? labelTitle : 'Label')}</th>
              {showCustomValues && <th>{translate(valueTitle ? valueTitle : 'Value')}</th>}
              <th colSpan={3}></th>
            </tr>
          </thead>

          <tbody ref="items">{this.renderRows()}</tbody>
        </table>
        <button className="btn add icon" onClick={this.addNewValues}>
          {translate('Add an option')}
        </button>
      </div>
    );
  }

  /**
   * Adds a new value set and focuses the newest element input
   */
  addNewValues() {
    const { hash } = this.context;
    const { addNewValueSet } = this.props;

    addNewValueSet(hash);

    setTimeout(() => {
      this.refs.items.querySelector('tr:last-child td:first-child > input').focus();
    }, 1);
  }

  /**
   * Toggles the custom values ON/OFF switch
   *
   * @param event
   */
  toggleCustomValues(event) {
    const { customValuesHandler } = this.props;
    const { hash } = this.context;

    customValuesHandler(hash, event.target.checked);
  }

  /**
   * Render each ROW element
   *
   * @returns {Array}
   */
  renderRows() {
    const { options, values } = this.props;
    let { showCustomValues } = this.props;

    if (showCustomValues === undefined) {
      showCustomValues = true;
    }

    const { hash } = this.context;
    const children = [];

    if (!options) {
      return children;
    }

    for (let i = 0; i < options.length; i++) {
      const { label, value } = options[i];

      let isChecked = false;
      if (values) {
        isChecked = values.indexOf(value) !== -1;
      } else {
        isChecked = value + '' === this.props.value + '';
      }

      children.push(
        <OptionRow
          key={i}
          hash={hash}
          label={label + ''}
          value={value + ''}
          index={i}
          isChecked={isChecked}
          showCustomValues={showCustomValues}
          updateValueSet={this.props.updateValueSet}
          updateIsChecked={this.props.updateIsChecked}
          addNewValueSet={this.props.addNewValueSet}
          reorderValueSet={this.props.reorderValueSet}
          removeValueSet={this.props.removeValueSet}
          cleanUp={this.props.cleanUp}
        />
      );
    }

    return children;
  }
}
