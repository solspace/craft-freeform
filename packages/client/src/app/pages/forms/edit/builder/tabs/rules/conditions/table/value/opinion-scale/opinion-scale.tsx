import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import type { Field } from '@editor/store/slices/layout/fields';
import type { OptionCollection } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

type Props = {
  field: Field;
  value: string;
  onChange?: (value: string) => void;
};

export const OpinionScaleRuleValue: React.FC<Props> = ({
  field,
  value,
  onChange,
}) => {
  const scales: Array<[string, string]> = field.properties?.scales || [];
  const options: OptionCollection = scales.map(([val, label]) => ({
    label: `${label || val}`,
    value: val,
  }));

  return (
    <Dropdown
      emptyOption={translate('Select a scale value')}
      value={value}
      options={options}
      onChange={(selectedValue) => onChange && onChange(selectedValue)}
    />
  );
};
