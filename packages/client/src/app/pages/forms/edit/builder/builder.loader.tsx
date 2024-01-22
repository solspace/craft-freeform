import React from 'react';

import { LoaderFormLayout } from './tabs/layout/layout.loader';
import { Grid } from './tabs/layout/layout.styles';
import { LoaderTabs } from './tabs/tabs.loader';
import { BuilderContent, BuilderWrapper } from './builder.styles';

export const LoaderBuilder: React.FC = () => {
  return (
    <BuilderWrapper>
      <LoaderTabs />
      <BuilderContent>
        <Grid>
          <LoaderFormLayout />
        </Grid>
      </BuilderContent>
    </BuilderWrapper>
  );
};
