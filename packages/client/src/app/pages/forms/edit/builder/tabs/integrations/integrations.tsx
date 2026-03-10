import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { Outlet, useResolvedPath } from "react-router-dom";
import { IntegrationsWrapper } from "./integrations.styles";
import { List } from "./sidebar/list";

export const Integrations: React.FC = () => {
  const currentPath = useResolvedPath("");

  return (
    <IntegrationsWrapper>
      <Breadcrumb
        id="integrations"
        label={translate("Integrations")}
        url={currentPath.pathname}
      />
      <List />
      <Outlet />
    </IntegrationsWrapper>
  );
};
