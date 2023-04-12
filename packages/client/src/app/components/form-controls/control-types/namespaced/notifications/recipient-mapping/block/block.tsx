import React from 'react';
import type { RecipientMapping } from '@ff-client/types/notifications';

import { Recipients } from './recipients/recipients';
import { Template } from './template/template';
import { Value } from './value/value';
import { BlockWrapper } from './block.styles';

export type RecipientMappingUpdate = (value: RecipientMapping) => void;

type Props = {
  mapping: RecipientMapping;
  onChange: RecipientMappingUpdate;
};

export const RecipientMappingBlock: React.FC<Props> = ({
  mapping,
  onChange,
}) => {
  const { value, template, recipients } = mapping;

  return (
    <BlockWrapper>
      <Value
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
        onChange={(newValue) =>
          onChange({
            ...mapping,
            recipients: newValue,
          })
        }
      />
    </BlockWrapper>
  );
};
