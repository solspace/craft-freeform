import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { submitFormRuleSelectors } from '@editor/store/slices/rules/submit-form/submit-form.selectors';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import SubmitIcon from './submit.icon.svg';
import { Label, SubmitFormWrapper } from './submit.styles';

export const SubmitForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hasRule = useSelector(submitFormRuleSelectors.hasRule);
  const currentPage = location.pathname.endsWith('/rules/submit');

  return (
    <SubmitFormWrapper
      onClick={() => navigate(`submit`)}
      className={classes(currentPage && 'active', hasRule && 'has-rule')}
    >
      <div>
        <SubmitIcon />
      </div>
      <Label>{translate('Submit Form')}</Label>
    </SubmitFormWrapper>
  );
};
