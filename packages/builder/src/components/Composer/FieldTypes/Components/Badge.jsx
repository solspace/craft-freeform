import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { translate } from '../../../../app';

export const INFO = 'info';
export const WARNING = 'warning';
export const ATTRIBUTE = 'attribute';
export const TEMPLATE = 'template';
export const VISIBILITY = 'visibility';
export const LOUDSPEAKER = 'loudspeaker';

export default class Badge extends Component {
  static INFO = INFO;
  static WARNING = WARNING;
  static ATTRIBUTE = ATTRIBUTE;
  static TEMPLATE = TEMPLATE;
  static VISIBILITY = VISIBILITY;
  static LOUDSPEAKER = LOUDSPEAKER;

  static propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf([INFO, WARNING, ATTRIBUTE, TEMPLATE, VISIBILITY, LOUDSPEAKER]),
  };

  render() {
    const { label } = this.props;
    let { type } = this.props;

    if (!type) {
      type = INFO;
    }

    const classes = ['composer-label-badge', 'composer-label-badge-' + type];

    return <div className={classes.join(' ')}>{translate(label)}</div>;
  }
}
