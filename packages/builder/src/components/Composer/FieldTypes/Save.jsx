import PropTypes from 'prop-types';
import React from 'react';
import HtmlInput from './HtmlInput';

export default class Save extends HtmlInput {
  static propTypes = {
    ...HtmlInput.propTypes,
    properties: PropTypes.shape({
      label: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
    }),
  };

  getClassName() {
    return 'Save';
  }

  render() {
    const {
      properties: { label },
    } = this.props;

    return (
      <div className={this.prepareWrapperClass()}>
        <input type="submit" className="btn submit" value={label} />
      </div>
    );
  }

  getWrapperClassNames() {
    const {
      properties: { position },
    } = this.props;

    return ['composer-submit-position-wrapper', 'composer-submit-position-' + position];
  }
}
