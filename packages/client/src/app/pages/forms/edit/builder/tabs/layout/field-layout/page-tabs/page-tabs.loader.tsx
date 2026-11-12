import { ThemedSkeleton as SkeletonTheme } from "@components/loaders/skeletons/themed-skeleton";
import type React from "react";
import Skeleton from "react-loading-skeleton";
import { PageTabsContainer, PageTabsWrapper } from "./page-tabs.styles";
import { PageTab, TabWrapper } from "./tab/tab.styles";

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
