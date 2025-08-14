import React from 'react';
import { Control } from '@components/form-controls/control';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { ControlType } from '@components/form-controls/types';
import type { CardsProperty } from '@ff-client/types/properties';

import { CardsEditor } from './editor/cards.editor';
import { CardsPreview } from './preview/cards.preview';

const Cards: React.FC<ControlType<CardsProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  return (
    <Control property={property} errors={errors}>
      <PreviewableComponent preview={<CardsPreview cards={value} />}>
        <CardsEditor value={value} updateValue={updateValue} />
      </PreviewableComponent>
    </Control>
  );
};

export default Cards;
