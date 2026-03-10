import translate from "@ff-client/utils/translations";
import type React from "react";

import { RulesEditorWrapper } from "./field.editor.styles";

export const RulesEmpty: React.FC = () => {
  return (
    <RulesEditorWrapper>
      {translate("Please choose a field in the left panel")}
    </RulesEditorWrapper>
  );
};
