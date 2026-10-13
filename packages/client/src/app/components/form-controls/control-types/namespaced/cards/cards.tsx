import { Control } from "@components/form-controls/control";
import { PreviewSlideout } from "@components/form-controls/preview/preview-slideout";
import type { ControlType } from "@components/form-controls/types";
import type { Field } from "@editor/store/slices/layout/fields";
import type { CardsProperty } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import type React from "react";

import { CardsEditor } from "./editor/cards.editor";
import { CardsPreview } from "./preview/cards.preview";

const Cards: React.FC<ControlType<CardsProperty, Field>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  return (
    <Control property={property} errors={errors} context={context}>
      <PreviewSlideout
        title={translate(property.label)}
        fillEditor={false}
        preview={
          <CardsPreview
            cards={value}
            transform={context?.properties?.transform}
          />
        }
      >
        <CardsEditor
          value={value}
          updateValue={updateValue}
          property={property}
          context={context}
        />
      </PreviewSlideout>
    </Control>
  );
};

export default Cards;
