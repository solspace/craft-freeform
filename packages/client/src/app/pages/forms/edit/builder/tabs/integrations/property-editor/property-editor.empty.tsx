import { EmptyBlock } from "@components/empty-block/empty-block";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { Link } from "react-router-dom";

import EmptyIcon from "./empty.icon";
import { PropertyEditorWrapper } from "./property-editor.styles";

export const EmptyEditor: React.FC = () => {
  return (
    <PropertyEditorWrapper>
      <EmptyBlock
        title={translate("No integrations found")}
        subtitle={translate("To add an integration, click the button below")}
        icon={<EmptyIcon />}
      >
        <Link className={classes("btn add icon")} to="/integrations">
          {translate("Add integration")}
        </Link>
      </EmptyBlock>
    </PropertyEditorWrapper>
  );
};
