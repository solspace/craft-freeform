import { PreviewSlideout } from "@components/form-controls/preview/preview-slideout";
import type { WYSIWYGProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { WysiwygEditor } from "./wysiwyg.editor";
import { WysiwygPreview } from "./wysiwyg.preview";

type Props = {
  value: string;
  property: WYSIWYGProperty;
  updateValue: (value: string) => void;
};

export const WysiwygRich: React.FC<Props> = ({
  value,
  property,
  updateValue,
}) => {
  return (
    <PreviewSlideout
      title={translate(property.label)}
      preview={<WysiwygPreview value={value} />}
    >
      <WysiwygEditor
        menu={property.menu}
        statusbar={property.statusbar}
        toolbar={property.toolbar}
        value={value}
        updateValue={updateValue}
      />
    </PreviewSlideout>
  );
};
