import React from 'react';
import { Tooltip } from 'react-tippy';
import translate from '@ff-client/utils/translations';
import RuleIcon from '@ff-icons/fields/conditional-rules.svg';
import EmailNotificationIcon from '@ff-icons/fields/email-notifications.svg';
import IntegrationIcon from '@ff-icons/fields/integrations.svg';

import { CellBadgesWrapper } from './cell-badges.styles';

type FieldAssociationsBadgesProps = {
  isRule: boolean;
  isEmailNotification: boolean;
  isIntegrations: boolean;
};

export const FieldAssociationsBadges: React.FC<
  FieldAssociationsBadgesProps
> = ({ isRule, isEmailNotification, isIntegrations }) => (
  <CellBadgesWrapper>
    {isRule && (
      <Tooltip title={translate('This field have conditional rules!')}>
        <RuleIcon />
      </Tooltip>
    )}
    {isEmailNotification && (
      <Tooltip title={translate('This field have email notification on!')}>
        <EmailNotificationIcon />
      </Tooltip>
    )}
    {isIntegrations && (
      <Tooltip title={translate('This field have integrations!')}>
        <IntegrationIcon />
      </Tooltip>
    )}
  </CellBadgesWrapper>
);
