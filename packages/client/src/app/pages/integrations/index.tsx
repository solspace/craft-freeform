import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderContainer } from '@components/layout/blocks/header-container';
import { IntegrationsWrapper } from '@editor/builder/tabs/integrations/integrations.styles';
import { useSidebarSelect } from '@ff-client/hooks/use-sidebar-select';
import translate from '@ff-client/utils/translations';

import { Sidebar } from './sidebar/sidebar';
import { IntegrationsEditorPanel } from './index.styles';

export const Integrations: React.FC = () => {
  //const { pathname } = useLocation();
  useSidebarSelect('integrations');

  return (
    <div>
      <HeaderContainer>{translate('Integrations')}</HeaderContainer>
      <IntegrationsWrapper>
        <Sidebar />
        <IntegrationsEditorPanel>
          <Outlet />
        </IntegrationsEditorPanel>
      </IntegrationsWrapper>
    </div>
  );
};
