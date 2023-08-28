import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { colors } from '@ff-client/styles/variables';
import { range } from '@ff-client/utils/arrays';
import { random } from '@ff-client/utils/math';

import { FormSettingsContainer, SectionHeader } from './settings.editor.styles';
import { SectionLink } from './settings.sidebar.styles';
import { FormSettingsWrapper } from './settings.styles';

export const LoaderFormSettings: React.FC = () => {
  return (
    <FormSettingsWrapper>
      <Sidebar>
        <SkeletonTheme
          baseColor={colors.gray200}
          highlightColor={colors.gray300}
        >
          {range(5).map((i) => (
            <SectionLink key={i}>
              <Skeleton key={i} width={200} />
            </SectionLink>
          ))}
        </SkeletonTheme>
      </Sidebar>
      <FormSettingsContainer>
        <SectionHeader>
          <Skeleton width={100} />
        </SectionHeader>

        {range(7).map((i) => (
          <div key={i} style={{ width: '100%' }}>
            <Skeleton width={random(120, 300)} />
            <Skeleton width={random(70, 90) + '%'} height={8} />
            <Skeleton height={30} />
          </div>
        ))}
      </FormSettingsContainer>
    </FormSettingsWrapper>
  );
};
