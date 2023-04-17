import React from 'react';
import type { Option } from '@components/form-controls/control-types/options/options.types';
import type { RecipientMapping } from '@ff-client/types/notifications';

import { RecipientMappingBlock } from './block/block';

type Props = {
  option: Option;
  mapping?: RecipientMapping;
  allMappings: RecipientMapping[];
  updateValue: (value: RecipientMapping[]) => void;
};

export const MappingOption: React.FC<Props> = ({
  option,
  mapping,
  allMappings,
  updateValue,
}) => {
  const isMapped = !!mapping;
  const currentMapping = mapping || {
    value: option.value,
    recipients: [],
    template: '',
  };

  const onChange = (newValue: RecipientMapping): void => {
    let index: number;
    if (isMapped) {
      index = allMappings.findIndex(
        (mapping) => mapping.value === newValue.value
      );
    }

    if (index !== undefined) {
      updateValue([
        ...allMappings.slice(0, index),
        newValue,
        ...allMappings.slice(index + 1),
      ]);
    } else {
      updateValue([...(allMappings || []), newValue]);
    }
  };

  return (
    <RecipientMappingBlock
      predefined
      mapping={currentMapping}
      onChange={onChange}
    />
  );
};
