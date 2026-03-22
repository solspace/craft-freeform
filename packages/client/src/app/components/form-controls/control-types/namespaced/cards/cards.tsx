import { Control } from "@components/form-controls/control";
import { PreviewableComponent } from "@components/form-controls/preview/previewable-component";
import type { ControlType } from "@components/form-controls/types";
import type { Field } from "@editor/store/slices/layout/fields";
import type { CardsProperty } from "@ff-client/types/properties";
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
      <PreviewableComponent
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
      </PreviewableComponent>
    </Control>
  );
};

export default Cards;
