import { PreviewableComponent } from "@components/form-controls/preview/previewable-component";
import type { ControlType } from "@components/form-controls/types";
import type { AiProperty } from "@ff-client/types/properties";
import type React from "react";

import { Control } from "../../control";

import AiBoxEditor from "./ai-box.editor";
import { AiBoxPreview } from "./ai-box.preview";

const AiBox: React.FC<ControlType<AiProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  return (
    <Control property={property} errors={errors}>
      <PreviewableComponent preview={<AiBoxPreview value={value} />}>
        <AiBoxEditor
          value={value}
          property={property}
          updateValue={updateValue}
        />
      </PreviewableComponent>
    </Control>
  );
};

export default AiBox;
