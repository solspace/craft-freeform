import { Control } from "@components/form-controls/control";
import { PreviewSlideout } from "@components/form-controls/preview/preview-slideout";
import { usePreviewRollback } from "@components/form-controls/preview/use-preview-rollback";
import type { ControlType } from "@components/form-controls/types";
import type { CodeEditorProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { CodeEditor } from "./code.editor";
import { CodePreview } from "./code.preview";

const Code: React.FC<ControlType<CodeEditorProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  const { language } = property;
  const rollback = usePreviewRollback(
    value,
    updateValue,
    property.handle,
    context,
  );

  return (
    <Control property={property} errors={errors}>
      <PreviewSlideout
        {...rollback}
        title={translate(property.label)}
        preview={<CodePreview value={value} />}
      >
        <CodeEditor
          fullHeight
          value={value}
          language={language}
          updateValue={updateValue}
        />
      </PreviewSlideout>
    </Control>
  );
};

export default Code;
