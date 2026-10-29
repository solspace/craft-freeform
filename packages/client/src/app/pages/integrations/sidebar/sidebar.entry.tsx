import config from "@config/freeform/freeform.config";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";
import type { FC } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { integrationSidebarLabel } from "../integration-label";

import type { Entry } from "./sidebar.queries";
import {
  Icon,
  Integration,
  IntegrationTitle,
  StatusIndicator,
  Version,
} from "./sidebar.styles";

type Props = {
  entry: Entry;
};

export const EntryComponent: FC<Props> = ({ entry }): React.JSX.Element => {
  const edition = config.editions.edition;
  const { pathname: currentUrl } = useLocation();

  const type = entry.type;
  const title = entry.type.name;
  const sidebarTitle = translate(
    integrationSidebarLabel(title, type.shortName),
  );

  const isStatusActive = entry.instances.length > 0;
  const isUnsupportedEdition =
    entry.type.editions.length > 0 && !entry.type.editions.includes(edition);

  const instances = entry.instances.length;
  const indicatorText = instances > 1 ? instances : "";

  let url = `${type.type}/${type.shortName}`;
  const isActive = currentUrl.includes(url);
  if (instances > 0) {
    url += `/${entry.instances[0].id}`;
  }

  return (
    <Integration>
      <NavLink
        to={url}
        title={sidebarTitle !== title ? title : undefined}
        className={classes(
          isActive && "active",
          isUnsupportedEdition && "unsupported",
        )}
      >
        <StatusIndicator
          className={classes(
            isStatusActive && !isUnsupportedEdition && "active",
            isUnsupportedEdition && "unsupported",
          )}
        >
          {indicatorText}
        </StatusIndicator>

        {entry.type.iconSvg && (
          <Icon
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(entry.type.iconSvg),
            }}
          />
        )}
        {!entry.type.iconSvg && (
          <Icon>
            <i className="fa-solid fa-cog" />
          </Icon>
        )}

        <IntegrationTitle>{sidebarTitle}</IntegrationTitle>
        {type.version && <Version>{type.version}</Version>}
      </NavLink>
    </Integration>
  );
};
