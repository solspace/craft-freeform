import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../../../../app';

const FieldRuleHeader = ({ rule, toggleShow, toggleMatchAll }) => (
  <div>
    <a onClick={toggleShow}>{translate(rule.show ? 'Show' : 'Hide')}</a>
    {' ' + translate('this item when') + ' '}
    <a onClick={toggleMatchAll}>{translate(rule.matchAll ? 'all' : 'any')}</a>
    {' ' + translate('of its criteria match')}
  </div>
);

FieldRuleHeader.propTypes = {
  rule: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    matchAll: PropTypes.bool.isRequired,
  }).isRequired,
  toggleShow: PropTypes.func.isRequired,
  toggleMatchAll: PropTypes.func.isRequired,
};

export default FieldRuleHeader;
