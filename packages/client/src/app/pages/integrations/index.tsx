import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import { HeaderContainer } from "@components/layout/blocks/header-container";
import { useSidebarSelect } from "@ff-client/hooks/use-sidebar-select";
import translate from "@ff-client/utils/translations";
import { createElement, type FC } from "react";
import { Outlet } from "react-router-dom";
import {
  IntegrationsEditorPanel,
  IntegrationsLayout,
  IntegrationsWrapper,
} from "./index.styles";
import { Sidebar } from "./sidebar/sidebar";

export const Integrations: FC = () => {
  useSidebarSelect("integrations");

  return createElement(
    "craft-pane",
    {
      className: "freeform-settings-surface freeform-integration-surface",
      padding: "0",
    },
    <IntegrationsLayout className="freeform-integration-layout" slot="body">
      <Breadcrumb id="integrations" label="Integrations" url="integrations" />
      <HeaderContainer>{translate("Integrations")}</HeaderContainer>
      <IntegrationsWrapper>
        <Sidebar />
        <IntegrationsEditorPanel>
          <Outlet />
        </IntegrationsEditorPanel>
      </IntegrationsWrapper>
    </IntegrationsLayout>,
  );
};
