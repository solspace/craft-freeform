import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translate } from '../../../../app';
import * as SubmitPositions from '../../../../constants/SubmitPositions';
import CustomProperty from '../../PropertyItems/CustomProperty';

export default class DualPositionProperty extends Component {
  static propTypes = {
    position: PropTypes.string.isRequired,
    onChangeHandler: PropTypes.func.isRequired,
  };

  render() {
    let { position, onChangeHandler } = this.props;

    return (
      <CustomProperty label="Positioning" instructions="Choose how the previous and submit buttons should be placed.">
        <div>
          <div>
            <label>
              <input
                type="radio"
                name="position"
                value={SubmitPositions.SPREAD}
                checked={position === SubmitPositions.SPREAD}
                onChange={onChangeHandler}
              />
              {translate('Apart at Left and Right')}
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="position"
                value={SubmitPositions.LEFT}
                checked={position === SubmitPositions.LEFT}
                onChange={onChangeHandler}
              />
              {translate('Together at Left')}
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="position"
                value={SubmitPositions.CENTER}
                checked={position === SubmitPositions.CENTER}
                onChange={onChangeHandler}
              />
              {translate('Together at Center')}
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="position"
                value={SubmitPositions.RIGHT}
                checked={position === SubmitPositions.RIGHT}
                onChange={onChangeHandler}
              />
              {translate('Together at Right')}
            </label>
          </div>
        </div>
      </CustomProperty>
    );
  }
}
