import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import type { Field } from '@editor/store/slices/layout/fields';
import type { OptionCollection } from '@ff-client/types/properties';
import { range } from '@ff-client/utils/arrays';
import translate from '@ff-client/utils/translations';

type Props = {
  field: Field;
  value: string;
  onChange?: (value: string) => void;
};

export const RatingRuleValue: React.FC<Props> = ({
  field,
  value,
  onChange,
}) => {
  const maxValue = field.properties?.maxValue || 1;
  const options: OptionCollection = range(1, maxValue).map((i) => ({
    label: `${i}`,
    value: `${i}`,
  }));

  return (
    <Dropdown
      emptyOption={translate('Select a rating')}
      value={value}
      options={options}
      onChange={(selectedValue) => onChange && onChange(selectedValue)}
    />
  );
};
