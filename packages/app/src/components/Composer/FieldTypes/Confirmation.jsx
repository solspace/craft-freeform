import PropTypes from 'prop-types';
import React from 'react';
import * as FieldTypes from '../../../constants/FieldTypes';
import Badge from './Components/Badge';
import Text from './Text';

export default class Confirmation extends Text {
  static propTypes = {
    ...Text.propTypes,
    targetFieldHash: PropTypes.string,
  };

  getClassName() {
    return 'Confirmation';
  }

  getType() {
    return FieldTypes.TEXT;
  }

  getBadges() {
    const badges = super.getBadges();
    const {
      properties: { targetFieldHash },
    } = this.props;

    if (!targetFieldHash) {
      badges.push(<Badge key={'target'} label="No Target Field" type={Badge.WARNING} />);
    }

    return badges;
  }
}
