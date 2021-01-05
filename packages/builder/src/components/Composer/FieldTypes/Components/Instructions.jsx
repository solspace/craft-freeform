import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Instructions extends Component {
  static propTypes = {
    instructions: PropTypes.string,
  };

  render() {
    const { instructions } = this.props;

    if (!instructions) {
      return null;
    }

    return <div className="composer-column-instructions">{instructions}</div>;
  }
}
