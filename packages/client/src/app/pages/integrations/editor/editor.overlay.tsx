import { EmptyBlock } from "@components/empty-block/empty-block";
import config from "@config/freeform/freeform.config";
import EmptyIcon from "@ff-client/app/pages/forms/edit/builder/tabs/integrations/property-editor/empty.icon.svg";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";
import styled from "styled-components";

import type { Integration } from "../integration.types";

type Props = {
  integration: Integration;
};

export const VersionUpgradeOverlay: FC<Props> = ({ integration }) => {
  if (integration.supported) {
    return null;
  }

  let edition = config.editions.edition as string;
  edition = edition.charAt(0).toUpperCase() + edition.slice(1).toLowerCase();

  return (
    <VersionOverlay>
      <EmptyBlock
        title={translate("Not available for {edition} edition", { edition })}
        subtitle={translate(
          "Upgrade to Pro to get access to this integration.",
        )}
        icon={<EmptyIcon />}
      >
        <a
          href={Craft.getCpUrl("plugin-store/freeform")}
          target="_blank"
          rel="noreferrer"
        >
          {translate("Plugin Store")}
        </a>
      </EmptyBlock>
    </VersionOverlay>
  );
};

const VersionOverlay = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 10;

  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;

  background-color: rgba(255, 255, 255, 0.3);
  // blur things in the background
  backdrop-filter: blur(1px);
`;
