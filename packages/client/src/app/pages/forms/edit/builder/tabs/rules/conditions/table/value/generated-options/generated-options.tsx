import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { useFieldOptions } from '@components/options/use-field-options';
import type { Field } from '@editor/store/slices/layout/fields';
import type { FieldType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

type Props = {
  field: Field;
  fieldType: FieldType;
  value: string;
  onChange?: (value: string) => void;
};

export const GeneratedOptionsRuleValue: React.FC<Props> = ({
  field,
  fieldType,
  value,
  onChange,
}) => {
  const [options, loading] = useFieldOptions(field, fieldType);

  return (
    <Dropdown
      emptyOption={translate('Select an option')}
      value={value}
      options={options}
      loading={loading}
      onChange={(selectedValue) => onChange && onChange(selectedValue)}
    />
  );
};
