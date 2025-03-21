import React from 'react';
import { PreviewableComponent } from '@components/form-controls/preview/previewable-component';
import type { WYSIWYGProperty } from '@ff-client/types/properties';

import { WysiwygEditor } from './wysiwyg.editor';
import { WysiwygPreview } from './wysiwyg.preview';

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
    <PreviewableComponent
      preview={<WysiwygPreview value={value} />}
      excludeClassNames={['tox']}
    >
      <WysiwygEditor
        menu={property.menu}
        statusbar={property.statusbar}
        toolbar={property.toolbar}
        value={value}
        updateValue={updateValue}
      />
    </PreviewableComponent>
  );
};
