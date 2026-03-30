import type React from "react";
import { FieldLayoutWrapper } from "./field-layout.styles";
import { LoaderPage } from "./page/page.loader";
import { LoaderPageTabs } from "./page-tabs/page-tabs.loader";

export const LoaderFieldLayout: React.FC = () => {
  return (
    <FieldLayoutWrapper>
      <LoaderPageTabs />
      <LoaderPage />
    </FieldLayoutWrapper>
  );
};
