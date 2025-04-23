import React from 'react';
import { Action } from '@editor/builder/tabs/rules/conditions/table/condition-table.styles';
import type { RecipientMapping } from '@ff-client/types/notifications';
import DeleteIcon from '@ff-icons/actions/delete.svg';

import { Recipients } from './recipients/recipients';
import { Template } from './template/template';
import { Value } from './value/value';
import { BlockWrapper } from './block.styles';

export type RecipientMappingUpdate = (value: RecipientMapping) => void;

type Props = {
  predefined?: boolean;
  mapping: RecipientMapping;
  removable?: boolean;
  onChange: RecipientMappingUpdate;
  onRemove?: () => void;
};

export const RecipientMappingBlock: React.FC<Props> = ({
  predefined,
  mapping,
  removable,
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
        spanMultiple={!removable}
        onChange={(newValue) => {
          onChange({
            ...mapping,
            recipients: newValue,
          });
        }}
      />
      {removable && (
        <Action>
          <DeleteIcon onClick={onRemove} />
        </Action>
      )}
    </BlockWrapper>
  );
};
