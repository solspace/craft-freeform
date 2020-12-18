import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class PlaceholderRow extends Component {
  static propTypes = {
    active: PropTypes.bool,
  };

  render() {
    const active = !!this.props.active;

    const classes = ['composer-row-placeholder'];
    if (active) {
      classes.push('active');
    }

    return (
      <div className={classes.join(' ')}>
        <div></div>
      </div>
    );
  }
}
