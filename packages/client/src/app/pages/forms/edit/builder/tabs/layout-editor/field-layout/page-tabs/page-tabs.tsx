import React from 'react';
import { useSelector } from 'react-redux';

import { selectPages } from '@ff-client/app/pages/forms/edit/store/slices/pages';

import { PageTabsWrapper } from './page-tabs.styles';
import { Tab } from './tab/tab';

export const PageTabs: React.FC = () => {
  const pages = useSelector(selectPages);

  return (
    <PageTabsWrapper>
      {pages.map((page) => (
        <Tab key={page.uid} {...page} />
      ))}
    </PageTabsWrapper>
  );
};
