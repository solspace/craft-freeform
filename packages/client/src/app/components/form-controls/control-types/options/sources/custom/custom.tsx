import { Label } from "@components/form-controls/label.styles";
import { PreviewableComponent } from "@components/form-controls/preview/previewable-component";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { useState } from "react";

import type {
  ConfigurationProps,
  CustomOptionsConfiguration,
} from "../../options.types";

import { CustomEditor } from "./custom.editor";
import { cleanOptions } from "./custom.operations";
import { CustomPreview } from "./custom.preview";

const Custom: React.FC<ConfigurationProps<CustomOptionsConfiguration>> = ({
  value,
  updateValue,
  property,
  defaultValue,
  updateDefaultValue,
  isMultiple,
  autoUpdateHandle,
}) => {
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <>
      <Label>{translate("Options")}</Label>
      <PreviewableComponent
        covered={bulkOpen}
        preview={
          <CustomPreview
            value={value}
            defaultValue={defaultValue}
            isMultiple={isMultiple}
          />
        }
        excludeClassNames={[
          "bulk-editor",
          "slideout-container",
          "cp-slideout-shade",
        ]}
        onAfterEdit={() => updateValue(cleanOptions(value))}
      >
        <CustomEditor
          onBulkOpenChange={setBulkOpen}
          value={value}
          updateValue={updateValue}
          property={property}
          defaultValue={defaultValue}
          updateDefaultValue={updateDefaultValue}
          isMultiple={isMultiple}
          allowOptgroup={property.allowOptgroup}
          autoUpdateHandle={autoUpdateHandle}
        />
      </PreviewableComponent>
    </>
  );
};

export default Custom;
