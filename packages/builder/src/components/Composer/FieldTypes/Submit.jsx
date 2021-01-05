import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import * as SubmitPositions from '../../../constants/SubmitPositions';
import FieldHelper from '../../../helpers/FieldHelper';
import HtmlInput from './HtmlInput';

@connect((state) => ({
  layout: state.composer.layout,
}))
export default class Submit extends HtmlInput {
  static propTypes = {
    ...HtmlInput.propTypes,
    properties: PropTypes.shape({
      labelNext: PropTypes.string.isRequired,
      labelPrev: PropTypes.string.isRequired,
      disablePrev: PropTypes.bool.isRequired,
      position: PropTypes.string.isRequired,
    }),
    layout: PropTypes.array.isRequired,
  };

  static contextTypes = {
    hash: PropTypes.string.isRequired,
  };

  getClassName() {
    return 'Submit';
  }

  render() {
    const {
      layout,
      properties: { labelNext, labelPrev, disablePrev },
    } = this.props;

    const { hash } = this.context;

    const isFirstPage = FieldHelper.isFieldOnFirstPage(hash, layout);
    const showPrev = !disablePrev && !isFirstPage;

    return (
      <div className={this.prepareWrapperClass()}>
        {showPrev && <input type="button" className="btn submit" value={labelPrev} />}

        <input type="submit" className="btn submit" value={labelNext} />
      </div>
    );
  }

  getWrapperClassNames() {
    let {
      properties: { position, disablePrev },
    } = this.props;

    if (disablePrev) {
      const allowedPositions = [SubmitPositions.LEFT, SubmitPositions.RIGHT, SubmitPositions.CENTER];

      if (!allowedPositions.find((x) => x === position)) {
        position = SubmitPositions.LEFT;
      }
    }

    return ['composer-submit-position-wrapper', 'composer-submit-position-' + position];
  }
}
