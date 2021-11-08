import PropTypes from 'prop-types';
import React from 'react';
import Badge from './Components/Badge';
import HtmlInput from './HtmlInput';

export default class Save extends HtmlInput {
  static propTypes = {
    ...HtmlInput.propTypes,
    properties: PropTypes.shape({
      label: PropTypes.string.isRequired,
      position: PropTypes.string.isRequired,
      emailFieldHash: PropTypes.string,
      notificationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  };

  getClassName() {
    return 'Save';
  }

  getBadges() {
    const badges = [];
    const { emailFieldHash, notificationId } = this.props.properties;

    if (emailFieldHash && !notificationId) {
      badges.push(<Badge key={'template'} label="No Template" type={Badge.WARNING} />);
    }

    return badges;
  }

  render() {
    const {
      properties: { label, position },
    } = this.props;

    return (
      <div className={this.prepareWrapperClass()}>
        {position !== 'left' && this.getBadges()}
        <input type="submit" className="btn submit" value={label} />
        {position === 'left' && this.getBadges()}
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
