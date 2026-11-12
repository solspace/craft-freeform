import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";
import { Outlet } from "react-router-dom";
import {
  IntegrationsEditorPanel,
  IntegrationsLayout,
  IntegrationsWrapper,
} from "./index.styles";
import { Sidebar } from "./sidebar/sidebar";

export const Integrations: FC = () => {
  return (
    <IntegrationsLayout className="freeform-integration-layout">
      <Breadcrumb id="integrations" label="Integrations" url="integrations" />
      <HeaderContainer>{translate("Integrations")}</HeaderContainer>
      <IntegrationsWrapper>
        <Sidebar />
        <IntegrationsEditorPanel>
          <Outlet />
        </IntegrationsEditorPanel>
      </IntegrationsWrapper>
    </IntegrationsLayout>
  );
};
