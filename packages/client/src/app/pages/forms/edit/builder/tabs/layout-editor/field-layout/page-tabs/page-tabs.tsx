import React from 'react';
import { useSelector } from 'react-redux';
import { selectPages } from '@ff-client/app/pages/forms/edit/store/slices/pages';

import { NewTab } from './tab/new-tab';
import { Tab } from './tab/tab';
import { PageTabsContainer, PageTabsWrapper } from './page-tabs.styles';

export const PageTabs: React.FC = () => {
  const pages = useSelector(selectPages);

  return (
    <PageTabsWrapper>
      <PageTabsContainer>
        {pages.map((page, index) => (
          <Tab key={page.uid} index={index} page={page} />
        ))}
      </PageTabsContainer>

      <NewTab />
    </PageTabsWrapper>
  );
};
