import translate from '@ff-client/utils/translations';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { Wrapper } from './index.styles';

export const Tabs: React.FC = () => {
  return (
    <Wrapper style={{ position: 'relative' }}>
      <h1 style={{ width: 300, margin: 0, paddingTop: 7 }}>My form name</h1>

      <NavLink to="" end>
        {translate('Layout')}
      </NavLink>
      <NavLink to="notifications">{translate('Notifications')}</NavLink>
      <NavLink to="rules">{translate('Rules')}</NavLink>
      <NavLink to="integrations">{translate('Integrations')}</NavLink>

      <button
        className="btn submit"
        style={{
          position: 'absolute',
          right: 10,
        }}
      >
        Save
      </button>
    </Wrapper>
  );
};
