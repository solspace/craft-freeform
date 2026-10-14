import { PreviewSlideout } from "@components/form-controls/preview/preview-slideout";
import { usePreviewRollback } from "@components/form-controls/preview/use-preview-rollback";
import type { WYSIWYGProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { WysiwygEditor } from "./wysiwyg.editor";
import { WysiwygPreview } from "./wysiwyg.preview";

type Props = {
  value: string;
  property: WYSIWYGProperty;
  updateValue: (value: string) => void;
  context?: unknown;
};

export const WysiwygRich: React.FC<Props> = ({
  value,
  property,
  updateValue,
  context,
}) => {
  const rollback = usePreviewRollback(
    value,
    updateValue,
    property.handle,
    context,
  );
  return (
    <PreviewSlideout
      {...rollback}
      title={translate(property.label)}
      preview={<WysiwygPreview value={value} />}
    >
      <WysiwygEditor
        fullHeight
        menu={property.menu}
        statusbar={property.statusbar}
        toolbar={property.toolbar}
        value={value}
        updateValue={updateValue}
      />
    </PreviewSlideout>
  );
};
