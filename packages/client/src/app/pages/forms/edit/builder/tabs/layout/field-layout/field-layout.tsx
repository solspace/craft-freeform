import { useAppSelector } from "@editor/store";
import { contextSelectors } from "@editor/store/slices/context/context.selectors";
import { isPageForm } from "@editor/store/thunks/fields/containers";
import type React from "react";
import { useSelector } from "react-redux";
import { FieldLayoutWrapper } from "./field-layout.styles";
import { Page } from "./page/page";
import { PageTabs } from "./page-tabs/page-tabs";

export const FieldLayout: React.FC = () => {
  const page = useSelector(contextSelectors.currentPage);
  const pageForm = useAppSelector(isPageForm);

  return (
    <FieldLayoutWrapper data-wizard-tour="canvas">
      {!pageForm && <PageTabs />}
      {page && <Page page={page} />}
    </FieldLayoutWrapper>
  );
};
