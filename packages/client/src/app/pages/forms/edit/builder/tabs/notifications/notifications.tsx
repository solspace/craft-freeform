import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { Outlet, useResolvedPath } from "react-router-dom";
import { NotificationsWrapper } from "./notifications.styles";
import { List } from "./sidebar/list";

export const Notifications: React.FC = () => {
  const currentPath = useResolvedPath("");

  return (
    <NotificationsWrapper>
      <Breadcrumb
        id="notifications"
        label={translate("Notifications")}
        url={currentPath.pathname}
      />
      <List />
      <Outlet />
    </NotificationsWrapper>
  );
};
