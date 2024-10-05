import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '@config/freeform/freeform.config';
import { useLastTab } from '@editor/builder/tabs/tabs.hooks';
import { submitFormRuleSelectors } from '@editor/store/slices/rules/submit-form/submit-form.selectors';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import SubmitIcon from './submit.icon.svg';
import { Label, SubmitFormWrapper } from './submit.styles';

export const SubmitForm: React.FC = () => {
  const canEdit = config.limitations.can('rules.tab.submit');
  const navigate = useNavigate();
  const location = useLocation();
  const { setLastTab } = useLastTab('rules');

  const hasRule = useSelector(submitFormRuleSelectors.hasRule);
  const currentPage = location.pathname.endsWith('/rules/submit');

  if (!canEdit) {
    return null;
  }

  return (
    <SubmitFormWrapper
      onClick={() => {
        setLastTab('submit');
        navigate(`submit`);
      }}
      className={classes(currentPage && 'active', hasRule && 'has-rule')}
    >
      <div>
        <SubmitIcon />
      </div>
      <Label>{translate('Submit Form')}</Label>
    </SubmitFormWrapper>
  );
};
