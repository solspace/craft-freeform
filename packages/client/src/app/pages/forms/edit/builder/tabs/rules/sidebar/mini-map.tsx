import React from 'react';
import { useSelector } from 'react-redux';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';

import { Page } from './page/page';
import { MiniMapWrapper } from './mini-map.styles';

export const MiniMap: React.FC = () => {
  const pages = useSelector(pageSelecors.all);

  return (
    <Sidebar>
      <MiniMapWrapper>
        {pages.map((page) => (
          <Page key={page.uid} page={page} />
        ))}
      </MiniMapWrapper>
    </Sidebar>
  );
};
