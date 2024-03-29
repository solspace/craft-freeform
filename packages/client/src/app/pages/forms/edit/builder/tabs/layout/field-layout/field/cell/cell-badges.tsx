import React from 'react';
import { useSelector } from 'react-redux';
import { Tooltip } from 'react-tippy';
import { integrationSelectors } from '@editor/store/slices/integrations/integrations.selectors';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import { fieldRuleSelectors } from '@editor/store/slices/rules/fields/field-rules.selectors';
import translate from '@ff-client/utils/translations';
import RuleIcon from '@ff-icons/fields/conditional-rules.svg';
import EmailNotificationIcon from '@ff-icons/fields/email-notifications.svg';
import IntegrationIcon from '@ff-icons/fields/integrations.svg';

import { CellBadgesWrapper } from './cell-badges.styles';

type Props = {
  uid: string;
};

export const FieldAssociationsBadges: React.FC<Props> = ({ uid }) => {
  const isRule = useSelector(fieldRuleSelectors.hasRule(uid));
  const isEmailNotification = useSelector(
    notificationSelectors.isFieldInEmailNotification(uid)
  );
  const isIntegrations = useSelector(
    integrationSelectors.isFieldInIntegrations(uid)
  );

  return (
    <CellBadgesWrapper>
      {isRule && (
        <Tooltip
          title={translate('Conditional rules are applied to this field')}
        >
          <RuleIcon />
        </Tooltip>
      )}
      {isEmailNotification && (
        <Tooltip
          title={translate('Email notifications are applied to this field')}
        >
          <EmailNotificationIcon />
        </Tooltip>
      )}
      {isIntegrations && (
        <Tooltip title={translate('Integrations are applied to this field')}>
          <IntegrationIcon />
        </Tooltip>
      )}
    </CellBadgesWrapper>
  );
};
