import PropTypes from 'prop-types';
import React from 'react';
import { translate } from '../../../../../app';
import { GOTO } from '../../../../../constants/RuleTypes';

const GotoRuleHeader = ({ rule, pageLabel, toggleMatchAll }) => (
  <div>
    {translate('Go to {page} when', { page: pageLabel }) + ' '}
    <a onClick={toggleMatchAll}>{translate(rule.matchAll ? 'all' : 'any')}</a>
    {' ' + translate('of its criteria match')}
  </div>
);

GotoRuleHeader.propTypes = {
  pageLabel: PropTypes.string,
  rule: PropTypes.shape({
    matchAll: PropTypes.bool.isRequired,
  }).isRequired,
  toggleMatchAll: PropTypes.func.isRequired,
};

export default GotoRuleHeader;
