import React from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { HeaderContainer } from '@components/layout/blocks/header-container';
import { useSidebarSelect } from '@ff-client/hooks/use-sidebar-select';
import translate from '@ff-client/utils/translations';

import { Sidebar } from './sidebar/sidebar';
import { ABEditorPanel, ABWrapper } from './index.styles';

export const AbTests: React.FC = () => {
  useSidebarSelect('ab-tests');

  return (
    <>
      <Breadcrumb id="ab-tests-list" label="A/B Tests" url="/ab-tests" />
      <HeaderContainer>{translate('A/B Tests')}</HeaderContainer>
      <ABWrapper>
        <Sidebar />
        <ABEditorPanel>
          <Outlet />
        </ABEditorPanel>
      </ABWrapper>
    </>
  );
};
