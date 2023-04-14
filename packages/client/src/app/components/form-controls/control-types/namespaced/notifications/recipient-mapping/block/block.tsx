import React from 'react';
import type { RecipientMapping } from '@ff-client/types/notifications';

import { Recipients } from './recipients/recipients';
import { Template } from './template/template';
import { Value } from './value/value';
import { BlockWrapper } from './block.styles';

export type RecipientMappingUpdate = (value: RecipientMapping) => void;

type Props = {
  predefined?: boolean;
  mapping: RecipientMapping;
  onChange: RecipientMappingUpdate;
  onRemove?: () => void;
};

export const RecipientMappingBlock: React.FC<Props> = ({
  predefined,
  mapping,
  onChange,
  onRemove,
}) => {
  const { value, template, recipients } = mapping;

  return (
    <BlockWrapper>
      <Value
        predefined={predefined}
        value={value}
        onChange={(newValue) =>
          onChange({
            ...mapping,
            value: newValue,
          })
        }
      />
      <Template
        id={template}
        onChange={(newValue) =>
          onChange({
            ...mapping,
            template: newValue,
          })
        }
      />
      <Recipients
        recipients={recipients}
        onChange={(newValue) => {
          onChange({
            ...mapping,
            recipients: newValue,
          });

          if (!predefined && newValue.length === 0) {
            onRemove && onRemove();
          }
        }}
      />
    </BlockWrapper>
  );
};
