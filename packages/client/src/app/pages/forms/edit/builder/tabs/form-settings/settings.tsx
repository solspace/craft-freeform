import { Breadcrumb } from "@components/breadcrumbs/breadcrumbs";
import config from "@config/freeform/freeform.config";
import { useQueryFormSettings } from "@ff-client/queries/forms";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useEffect } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useResolvedPath,
} from "react-router-dom";

import { useLastTab } from "../tabs.hooks";

import { LoaderFormSettings } from "./settings.loader";
import { SettingsSidebar } from "./settings.sidebar";
import { FormSettingsWrapper } from "./settings.styles";

export const TAB_EMBED = "embed";
export const TAB_USAGE = "usage";

export const FormSettings: React.FC = () => {
  const limitations = config.limitations;
  const { sectionHandle } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const tourSearch =
    new URLSearchParams(search).get("wizardTour") === "1"
      ? "?wizardTour=1"
      : "";
  const { lastTab, setLastTab } = useLastTab("settings");
  const currentPath = useResolvedPath("");

  const { data, isFetching } = useQueryFormSettings();

  useEffect(() => {
    if (lastTab && !sectionHandle) {
      navigate(`${lastTab}${tourSearch}`, { replace: true });
    }
  }, [navigate, lastTab, sectionHandle, tourSearch]);

  useEffect(() => {
    if (!sectionHandle && !lastTab) {
      const firstSection = data?.[0]?.sections.filter((section) =>
        limitations.can(`settings.tab.${section.handle}`),
      )?.[0];

      if (firstSection) {
        setLastTab(firstSection.handle);
        navigate(`${firstSection.handle}${tourSearch}`, { replace: true });
      }
    }
  }, [data, sectionHandle, lastTab, navigate, setLastTab, tourSearch]);

  if (!data && isFetching) {
    return <LoaderFormSettings />;
  }

  return (
    <FormSettingsWrapper>
      <Breadcrumb
        id="settings"
        label={translate("Settings")}
        url={currentPath.pathname}
      />
      <SettingsSidebar />
      <Outlet />
    </FormSettingsWrapper>
  );
};
