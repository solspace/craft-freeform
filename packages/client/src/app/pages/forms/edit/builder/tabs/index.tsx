import translate from '@ff-client/utils/translations';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import {
  TabWrapper,
  TabsWrapper,
  SaveButton,
  Heading,
  SaveButtonWrapper,
} from './index.styles';

export const Tabs: React.FC = () => {
  return (
    <TabWrapper>
      <Heading>
        <Link to=".." style={{ width: 20, height: 20 }}>
          {'< '}
        </Link>
        My form name
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
        <SaveButton>Save</SaveButton>
      </SaveButtonWrapper>
    </TabWrapper>
  );
};
