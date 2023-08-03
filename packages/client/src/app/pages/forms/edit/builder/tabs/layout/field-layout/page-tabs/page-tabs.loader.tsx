import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { PageTab, TabWrapper } from './tab/tab.styles';
import { PageTabsContainer, PageTabsWrapper } from './page-tabs.styles';

export const LoaderPageTabs: React.FC = () => {
  return (
    <SkeletonTheme>
      <PageTabsWrapper>
        <PageTabsContainer>
          <TabWrapper>
            <PageTab className="active">
              <span>
                <Skeleton width={42} />
              </span>
            </PageTab>
          </TabWrapper>
          <TabWrapper>
            <PageTab>
              <span>
                <Skeleton width={42} />
              </span>
            </PageTab>
          </TabWrapper>
        </PageTabsContainer>
      </PageTabsWrapper>
    </SkeletonTheme>
  );
};
