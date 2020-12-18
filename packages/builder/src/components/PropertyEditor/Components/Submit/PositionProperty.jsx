import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as SubmitPositions from '../../../../constants/SubmitPositions';
import CustomProperty from '../../PropertyItems/CustomProperty';

export default class PositionProperty extends Component {
  static propTypes = {
    position: PropTypes.string.isRequired,
    onChangeHandler: PropTypes.func.isRequired,
  };

  render() {
    let { position, onChangeHandler } = this.props;

    const allowedPositions = [SubmitPositions.LEFT, SubmitPositions.RIGHT, SubmitPositions.CENTER];

    if (!allowedPositions.find((x) => x == position)) {
      position = SubmitPositions.LEFT;
    }

    return (
      <CustomProperty
        label="Positioning"
        instructions="Choose whether the submit button is positioned on the left, center or right side."
        wrapperClassName="composer-submit-positioning"
      >
        <div>
          <div>
            <label>
              <input
                type="radio"
                name="position"
                value={SubmitPositions.LEFT}
                checked={position === SubmitPositions.LEFT}
                onChange={onChangeHandler}
              />
              Left
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
              Center
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
              Right
            </label>
          </div>
        </div>
      </CustomProperty>
    );
  }
}
