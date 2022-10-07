import translate from '@ff-client/utils/translations';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import ChevronIcon from '@ff-client/assets/icons/chevron-left-solid.svg';

import {
  TabWrapper,
  TabsWrapper,
  SaveButton,
  Heading,
  SaveButtonWrapper,
  FormName,
} from './index.styles';

export const Tabs: React.FC = () => {
  return (
    <TabWrapper>
      <Heading>
        <Link to=".." title={translate('Back to form list')}>
          <ChevronIcon />
        </Link>
        <FormName>My form name</FormName>
      </Heading>

      <TabsWrapper>
        <NavLink to="" end>
          {translate('Layout')}
        </NavLink>
        <NavLink to="behavior">{translate('Behavior')}</NavLink>
        <NavLink to="notifications">{translate('Notifications')}</NavLink>
        <NavLink to="rules">{translate('Rules')}</NavLink>
        <NavLink to="integrations">{translate('Integrations')}</NavLink>
        <NavLink to="settings">{translate('Settings')}</NavLink>
      </TabsWrapper>

      <SaveButtonWrapper>
        <SaveButton>{translate('Save')}</SaveButton>
      </SaveButtonWrapper>
    </TabWrapper>
  );
};
