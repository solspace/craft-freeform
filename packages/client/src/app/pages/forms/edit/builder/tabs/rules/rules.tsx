import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { Outlet, useResolvedPath } from "react-router-dom";
import { RulesWrapper } from "./rules.styles";
import { MiniMap } from "./sidebar/mini-map";

export const Rules: React.FC = () => {
  const currentPath = useResolvedPath("");

  return (
    <RulesWrapper>
      <Breadcrumb
        id="rules"
        label={translate("Rules")}
        url={currentPath.pathname}
      />
      <MiniMap />
      <Outlet />
    </RulesWrapper>
  );
};
