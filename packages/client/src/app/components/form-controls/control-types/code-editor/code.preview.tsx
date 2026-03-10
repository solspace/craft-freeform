import translate from "@ff-client/utils/translations";
import type React from "react";

import { NoContent, PreviewWrapper } from "../table/table.preview.styles";

import { Pre, PreviewContainer } from "./code.preview.styles";

type Props = {
  value: string;
};

export const CodePreview: React.FC<Props> = ({ value }) => {
  return (
    <PreviewWrapper data-edit={translate("Click to edit data")}>
      <PreviewContainer>
        {!value && <NoContent>{translate("Not configured yet")}</NoContent>}
        <Pre>{value}</Pre>
      </PreviewContainer>
    </PreviewWrapper>
  );
};
