import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebarSelect } from '@ff-client/hooks/use-sidebar-select';
import styled from 'styled-components';

import { AiSidebar } from './sidebar';

const AiLayoutWrapper = styled.div`
  display: flex;
  margin-bottom: 50px;
`;

export const AiLayout: React.FC = () => {
  useSidebarSelect('freeform/ai');

  return (
    <AiLayoutWrapper id="main-content" className="has-sidebar">
      <AiSidebar />
      <div id="content-container" style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </AiLayoutWrapper>
  );
};
