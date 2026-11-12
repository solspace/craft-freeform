import { ThemedSkeleton as SkeletonTheme } from "@components/loaders/skeletons/themed-skeleton";
import config, { Edition } from "@config/freeform/freeform.config";
import type React from "react";
import Skeleton from "react-loading-skeleton";

import {
  FormName,
  HeaderRow,
  Heading,
  SaveButtonWrapper,
  TabsRegion,
  TabsWrapper,
  TabWrapper,
} from "./tabs.styles";

export const LoaderTabs: React.FC = () => {
  return (
    <SkeletonTheme height={10}>
      <TabWrapper>
        <HeaderRow>
          <Heading>
            <FormName>
              <Skeleton width="50%" height={20} />
            </FormName>
          </Heading>

          <TabsRegion style={{ overflow: "hidden" }}>
            <TabsWrapper>
              <a className="active">
                <span>
                  <Skeleton width={43} />
                </span>
              </a>
              <a>
                <span>
                  <Skeleton width={82} />
                </span>
              </a>

              {config.editions.is(Edition.Pro) && (
                <a>
                  <span>
                    <Skeleton width={36} />
                  </span>
                </a>
              )}

              <a>
                <span>
                  <Skeleton width={77} />
                </span>
              </a>
              <a>
                <span>
                  <Skeleton width={54} />
                </span>
              </a>
            </TabsWrapper>
          </TabsRegion>

          <SaveButtonWrapper>
            <Skeleton width={90} />
          </SaveButtonWrapper>
        </HeaderRow>
      </TabWrapper>
    </SkeletonTheme>
  );
};
