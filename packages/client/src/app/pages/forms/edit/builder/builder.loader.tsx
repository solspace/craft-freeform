import type React from "react";
import { BuilderContent, BuilderWrapper } from "./builder.styles";
import { LoaderFormLayout } from "./tabs/layout/layout.loader";
import { Grid } from "./tabs/layout/layout.styles";
import { LoaderTabs } from "./tabs/tabs.loader";

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
