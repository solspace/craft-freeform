import config, { Edition } from "@config/freeform/freeform.config";
import { colors } from "@ff-client/styles/variables";
import type React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

import {
  BuilderTabsWrapper,
  FormName,
  Heading,
  SaveButtonWrapper,
  TabWrapper,
} from "./tabs.styles";

export const LoaderTabs: React.FC = () => {
  return (
    <SkeletonTheme
      baseColor={colors.gray300}
      highlightColor={colors.gray200}
      height={10}
    >
      <TabWrapper>
        <Heading>
          <FormName>
            <Skeleton width="50%" height={20} />
          </FormName>
        </Heading>

        <BuilderTabsWrapper>
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
        </BuilderTabsWrapper>

        <SaveButtonWrapper>
          <Skeleton />
        </SaveButtonWrapper>
      </TabWrapper>
    </SkeletonTheme>
  );
};
