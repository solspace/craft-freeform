import { EmptyBlock } from "@components/empty-block/empty-block";
import EmptyIcon from "@ff-client/app/pages/forms/edit/builder/tabs/integrations/property-editor/empty.icon.svg";
import translate from "@ff-client/utils/translations";
import type { FC } from "react";

import { EditorContainer, EditorWrapper } from "./editor.styles";

export const IntegrationsEmptyView: FC = () => {
  return (
    <EditorContainer>
      <EditorWrapper>
        <EmptyBlock
          title={translate("Please select an integration")}
          subtitle={translate(
            "To add a new integration, select its type in the sidebar.",
          )}
          icon={<EmptyIcon />}
        />
      </EditorWrapper>
    </EditorContainer>
  );
};
