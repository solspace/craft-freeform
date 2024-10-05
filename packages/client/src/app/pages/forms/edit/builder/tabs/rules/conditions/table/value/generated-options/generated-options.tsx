import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { TokenInput } from '@components/elements/token-input/token-input';
import { useFieldOptions } from '@components/options/use-field-options';
import type { Field } from '@editor/store/slices/layout/fields';
import type { FieldType } from '@ff-client/types/fields';
import translate from '@ff-client/utils/translations';

type Props = {
  field: Field;
  fieldType: FieldType;
  value: string;
  multiple?: boolean;
  onChange?: (value: string) => void;
};

export const GeneratedOptionsRuleValue: React.FC<Props> = ({
  field,
  fieldType,
  value,
  multiple,
  onChange,
}) => {
  const [options, loading] = useFieldOptions(field, fieldType);

  if (multiple) {
    return (
      <>
        {!loading && (
          <TokenInput
            value={value && JSON.parse(value)}
            options={options
              .map((option) => {
                if ('value' in option) {
                  return {
                    value: option.value,
                    name: option.label,
                    editable: false,
                  };
                }
              })
              .filter(Boolean)}
            allowCustom={false}
            onChange={(value) => onChange(JSON.stringify(value))}
          />
        )}
      </>
    );
  }

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
