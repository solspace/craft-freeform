import { EmptyBlock } from "@components/empty-block/empty-block";
import translate from "@ff-client/utils/translations";
import type React from "react";

import EmptyIcon from "./empty.icon";
import { PropertyEditorWrapper } from "./property-editor.styles";

export const EmptyEditor: React.FC = () => {
  return (
    <PropertyEditorWrapper>
      <EmptyBlock
        title={translate("No notifications found")}
        subtitle={translate(
          "To add a notification, use the sidebar on the left",
        )}
        icon={<EmptyIcon />}
      />
    </PropertyEditorWrapper>
  );
};
