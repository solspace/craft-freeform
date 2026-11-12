import { HeaderContainer } from "@components/layout/blocks/header-container";
import { useQueryFormsWithStats } from "@ff-client/queries/forms";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "./common/sidebar/sidebar";
import { ImportExportWrapper } from "./index.styles";

export const ImportExport: FC = () => {
  const { pathname } = useLocation();
  useQueryFormsWithStats();

  let title: string;
  switch (pathname) {
    case "/import/express-forms":
      title = "Import from Express Forms";
      break;

    case "/import/formie/v3":
      title = "Import from Formie (v3)";
      break;

    case "/import/forms":
      title = "Import Freeform Data";
      break;

    case "/export/forms":
      title = "Export Freeform Data";
      break;
  }

  return (
    <div className="freeform-secondary-layout">
      <Sidebar />
      <HeaderContainer>{translate(title)}</HeaderContainer>
      <ImportExportWrapper>
        <Outlet />
      </ImportExportWrapper>
    </div>
  );
};
