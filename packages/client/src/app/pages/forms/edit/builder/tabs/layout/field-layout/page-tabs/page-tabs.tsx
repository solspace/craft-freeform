import React from 'react';
import { useSelector } from 'react-redux';
import config, { Edition } from '@config/freeform/freeform.config';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';

import { NewTab } from './tab/new-tab';
import { Tab } from './tab/tab';
import { PageTabsContainer, PageTabsWrapper } from './page-tabs.styles';

export const PageTabs: React.FC = () => {
  const pages = useSelector(pageSelecors.all);

  return (
    <PageTabsWrapper>
      <PageTabsContainer>
        {pages.map((page, index) => (
          <Tab key={page.uid} index={index} page={page} />
        ))}

        {config.editions.isAtLeast(Edition.Lite) && <NewTab />}
      </PageTabsContainer>
    </PageTabsWrapper>
  );
};
