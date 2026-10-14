import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";

import { NoContent, PreviewWrapper } from "../table/table.preview.styles";

import { PreviewContainer } from "./wysiwyg.preview.styles";

type Props = {
  value: string;
};

export const WysiwygPreview: React.FC<Props> = ({ value }) => {
  const html = DOMPurify.sanitize(value || "");
  const body = new DOMParser().parseFromString(html, "text/html").body;
  const hasContent =
    !!body.textContent?.trim() ||
    !!body.querySelector("img, video, audio, hr, table");
  return (
    <PreviewWrapper data-edit={translate("Click to edit data")}>
      <PreviewContainer>
        {hasContent ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <NoContent>{translate("Not configured yet")}</NoContent>
        )}
      </PreviewContainer>
    </PreviewWrapper>
  );
};
